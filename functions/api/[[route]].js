/**
 * API аккаунтов Universal Client для Cloudflare Pages Functions + D1.
 * Работает по тому же адресу, что и сайт: /api/...
 *
 * Привязки и переменные (Pages → Settings → Bindings / Variables):
 *   DB               привязка D1 (обязательно)
 *   PAYMENT_SECRET   секрет вебхука платёжки (необязательно)
 *   ADMIN_SECRET     мастер-ключ админ-панели (необязательно, порт /admin.html).
 *                    Пока ранг admin ещё никому не выдан, админ-панель входить
 *                    по этому ключу. Потом можно работать под аккаунтом админа.
 *   DEV              "1" включает /api/dev/plan (только для тестов!)
 *   ALLOWED_ORIGINS  домены через запятую для CORS (пусто — разрешено всем)
 *
 * Разовая миграция D1 (консоль Cloudflare → D1 → консоль БД, выполнить один раз):
 *   ALTER TABLE users ADD COLUMN rank TEXT NOT NULL DEFAULT 'player';
 *   Значения ранга (чем выше уровень — тем важнее):
 *     owner 7 / developer 6 / manager 5 / deputy_manager 4 /
 *     admin 3 / junior_admin 2 / player 0
 *   PBKDF2_ITER      сложность хеша пароля (по умолчанию 30000, максимум 100000).
 *                    На бесплатном плане лимит 10 мс CPU на запрос; на платном
 *                    плане можно ставить 100000. Старые хеши обновятся при входе.
 */

const NICK_RE = /^[A-Za-z0-9_]{3,16}$/;
const PLAN_DAYS = { "1m": 30, "6m": 182, "12m": 365 };
const RANKS = ["player", "junior_admin", "admin", "deputy_manager", "manager", "developer", "owner"];
/* Уровень ранга: 0 — игрок, 7 — владелец. admin(3) и выше — доступ к админ-панели. */
const RANK_LEVEL = {
  player: 0,
  junior_admin: 2,
  admin: 3,
  deputy_manager: 4,
  manager: 5,
  developer: 6,
  owner: 7,
};
const rankLevel = (r) => RANK_LEVEL[r] || 0;
const rankOf = (u) => (u && RANKS.includes(u.rank) ? u.rank : "player");
const FREE_FEATURES = ["versions", "servers", "profile", "one-theme"];
const PAID_FEATURES = ["themes", "rounded-ui", "rpc"];
const SESSION_DAYS = 30;
const DEFAULT_ITER = 30000;
const MAX_ITER = 100000;
const WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT = 12;

/* ───────────── форум: теги и статусы ───────────── */

const FORUM_TAGS = ["tech", "server", "idea", "chat"];
const FORUM_STATUSES = ["pending", "approved", "rejected"];
const FORUM_TAG_LABELS = {
  ru: {
    tech: "Техническая часть",
    server: "Вопрос по серверу",
    idea: "Идея / Баг",
    chat: "Чат с высшим руководством",
  },
  en: {
    tech: "Technical",
    server: "Server",
    idea: "Idea / Bug",
    chat: "Management",
  },
};
const FORUM_STATUS_LABELS = {
  ru: { pending: "На рассмотрении", approved: "Одобрено", rejected: "Отклонено" },
  en: { pending: "Pending", approved: "Approved", rejected: "Rejected" },
};
const FORUM_TITLE_MIN = 4;
const FORUM_TITLE_MAX = 140;
const FORUM_BODY_MIN = 10;
const FORUM_BODY_MAX = 4000;

/* ───────────── утилиты ───────────── */

const enc = new TextEncoder();
const now = () => new Date().toISOString();

const toHex = (buf) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function sha256(s) {
  return toHex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}

async function pbkdf2(password, salt, iterations) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  return new Uint8Array(
    await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256)
  );
}

function iterOf(env) {
  const n = Number(env.PBKDF2_ITER);
  return Number.isInteger(n) && n >= 1000 ? Math.min(n, MAX_ITER) : DEFAULT_ITER;
}

async function hashPassword(password, iterations) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, iterations);
  return `pbkdf2-sha256$${iterations}$${b64(salt)}$${b64(hash)}`;
}

async function verifyPassword(password, stored) {
  try {
    const [alg, iter, saltB64, hashB64] = String(stored).split("$");
    if (alg !== "pbkdf2-sha256") return false;
    const expected = unb64(hashB64);
    const actual = await pbkdf2(password, unb64(saltB64), Math.min(Number(iter), MAX_ITER));
    return safeEqual(actual, expected);
  } catch {
    return false;
  }
}

function planOf(row) {
  if (!row.plan || row.plan === "free" || !row.plan_until) return "free";
  return new Date(row.plan_until).getTime() > Date.now() ? row.plan : "free";
}

function userJson(row) {
  const plan = planOf(row);
  return {
    id: row.id,
    nickname: row.nickname,
    rank: RANKS.includes(row.rank) ? row.rank : "player",
    plan,
    planUntil: plan === "free" ? null : row.plan_until,
    features: plan === "free" ? FREE_FEATURES : [...FREE_FEATURES, ...PAID_FEATURES],
    createdAt: row.created_at,
    lastLogin: row.last_login || null,
    deviceLinked: Boolean(row.device_id),
  };
}

async function createSession(db, userId) {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = toHex(bytes);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_DAYS * 864e5);
  await db
    .prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?,?,?,?)")
    .bind(await sha256(token), userId, createdAt.toISOString(), expiresAt.toISOString())
    .run();
  return { token, expiresAt: expiresAt.toISOString() };
}

function bearer(request) {
  const m = String(request.headers.get("authorization") || "").match(/^Bearer\s+([a-f0-9]{64})$/i);
  return m ? m[1] : "";
}

async function currentUser(db, request) {
  const token = bearer(request);
  if (!token) return null;
  return await db
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ? AND s.expires_at > ?`
    )
    .bind(await sha256(token), now())
    .first();
}

async function extendPlan(db, nickname, plan) {
  const days = PLAN_DAYS[plan];
  if (!days) return null;
  const row = await db.prepare("SELECT * FROM users WHERE nickname = ?").bind(nickname).first();
  if (!row) return null;
  const base = Math.max(Date.now(), row.plan_until ? new Date(row.plan_until).getTime() : 0);
  const until = new Date(base + days * 864e5).toISOString();
  await db.prepare("UPDATE users SET plan = ?, plan_until = ? WHERE id = ?").bind(plan, until, row.id).run();
  return userJson(await db.prepare("SELECT * FROM users WHERE id = ?").bind(row.id).first());
}

/* ───────────── админка: доступ по рангу или мастер-ключу ───────────── */

function hasAdminSecret(request, env) {
  const secret = env.ADMIN_SECRET || "";
  if (!secret) return false;
  const given = request.headers.get("x-admin-secret") || "";
  return given.length > 0 && safeEqual(enc.encode(given), enc.encode(secret));
}

// Возвращает аккаунт админа или null. Сначала пробуем мастер-ключ,
// затем ранг admin и выше у пользователя из сессии.
async function requireAdmin(db, request, env) {
  if (hasAdminSecret(request, env)) return true;
  const user = await currentUser(db, request);
  return user && rankLevel(user.rank) >= RANK_LEVEL.admin ? user : null;
}

/* ───────────── обработчики админ-панели ───────────── */

async function adminSession({ request, env, r }) {
  let mode = null;
  if (hasAdminSecret(request, env)) {
    mode = "secret";
  } else {
    const user = await currentUser(env.DB, request);
    if (user && rankLevel(user.rank) >= RANK_LEVEL.admin) mode = "session";
  }
  if (!mode) return r.fail(403, "forbidden", "Доступ только для администраторов.");
  return r.json(200, { ok: true, mode });
}

async function adminSearch({ request, env, r }) {
  if (!(await requireAdmin(env.DB, request, env)))
    return r.fail(403, "forbidden", "Доступ только для администраторов.");

  const q = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 40);
  const stmt = q
    ? env.DB
        .prepare("SELECT * FROM users WHERE nickname LIKE ? ORDER BY id DESC LIMIT 25")
        .bind("%" + q + "%")
    : env.DB.prepare("SELECT * FROM users ORDER BY id DESC LIMIT 25");
  const { results } = await stmt.all();
  return r.json(200, {
    users: (results || []).map((row) => ({
      id: row.id,
      nickname: row.nickname,
      rank: RANKS.includes(row.rank) ? row.rank : "player",
      plan: planOf(row),
      planUntil: row.plan_until,
    })),
  });
}

async function adminSetRank({ request, env, r }) {
  const db = env.DB;
  if (!(await requireAdmin(db, request, env)))
    return r.fail(403, "forbidden", "Доступ только для администраторов.");

  const body = await readBody(request);
  const nickname = String(body.nickname || "").trim();
  const rank = String(body.rank || "").trim();
  if (!RANKS.includes(rank))
    return r.fail(
      400,
      "bad_rank",
      "Неверный ранг. Допустимо: " + RANKS.join(", ") + "."
    );
  if (!NICK_RE.test(nickname)) return r.fail(400, "bad_nickname", "Некорректный ник.");

  const row = await db.prepare("SELECT * FROM users WHERE nickname = ?").bind(nickname).first();
  if (!row) return r.fail(404, "not_found", "Пользователь не найден.");

  // Ранг можно менять у любого пользователя без ограничений:
  // даже если это был единственный администратор.
  await db.prepare("UPDATE users SET rank = ? WHERE id = ?").bind(rank, row.id).run();
  return r.json(200, { user: userJson(await db.prepare("SELECT * FROM users WHERE id = ?").bind(row.id).first()) });
}

async function adminSetPlan({ request, env, r }) {
  const db = env.DB;
  if (!(await requireAdmin(db, request, env)))
    return r.fail(403, "forbidden", "Доступ только для администраторов.");

  const body = await readBody(request);
  const nickname = String(body.nickname || "").trim();
  const plan = String(body.plan || "").trim();

  if (plan === "revoke") {
    const row = await db.prepare("SELECT * FROM users WHERE nickname = ?").bind(nickname).first();
    if (!row) return r.fail(404, "not_found", "Пользователь не найден.");
    await db.prepare("UPDATE users SET plan = 'free', plan_until = NULL WHERE id = ?").bind(row.id).run();
    return r.json(200, { user: userJson(await db.prepare("SELECT * FROM users WHERE id = ?").bind(row.id).first()) });
  }

  const user = await extendPlan(db, nickname, plan);
  if (!user)
    return r.fail(400, "bad_request", "Нужны nickname и plan (1m/6m/12m или revoke). Пользователь не найден.");
  return r.json(200, { user });
}

async function adminSetPassword({ request, env, r }) {
  const db = env.DB;
  if (!(await requireAdmin(db, request, env)))
    return r.fail(403, "forbidden", "Доступ только для администраторов.");

  const body = await readBody(request);
  const nickname = String(body.nickname || "").trim();
  const password = String(body.password || "");

  if (!NICK_RE.test(nickname)) return r.fail(400, "bad_nickname", "Некорректный ник.");
  if (password.length < 6 || password.length > 128)
    return r.fail(400, "bad_password", "Пароль: от 6 до 128 символов.");

  const row = await db.prepare("SELECT id FROM users WHERE nickname = ?").bind(nickname).first();
  if (!row) return r.fail(404, "not_found", "Пользователь не найден.");

  await db
    .prepare("UPDATE users SET pass_hash = ? WHERE id = ?")
    .bind(await hashPassword(password, iterOf(env)), row.id)
    .run();
  // Все сессии игрока сбрасываются: на устройствах придётся войти заново.
  await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(row.id).run();
  return r.json(200, { ok: true });
}

/* ───────────── защита от перебора (в D1, общая для всех копий воркера) ───────────── */

async function tooMany(db, ip) {
  const t = Date.now();
  const rec = await db.prepare("SELECT n, reset_at FROM rate WHERE ip = ?").bind(ip).first();
  if (!rec || t > rec.reset_at) {
    await db.prepare("DELETE FROM rate WHERE reset_at < ?").bind(t).run();
    await db
      .prepare("INSERT OR REPLACE INTO rate (ip, n, reset_at) VALUES (?,?,?)")
      .bind(ip, 1, t + WINDOW_MS)
      .run();
    return false;
  }
  await db.prepare("UPDATE rate SET n = n + 1 WHERE ip = ?").bind(ip).run();
  return rec.n + 1 > RATE_LIMIT;
}

const resetAttempts = (db, ip) => db.prepare("DELETE FROM rate WHERE ip = ?").bind(ip).run();

/* ───────────── HTTP ───────────── */

function corsHeaders(request, env) {
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const origin = request.headers.get("origin");
  const h = {
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Webhook-Secret, X-Admin-Secret",
    "Access-Control-Max-Age": "86400",
  };
  if (allowed.length === 0) h["Access-Control-Allow-Origin"] = origin || "*";
  else if (origin && allowed.includes(origin)) h["Access-Control-Allow-Origin"] = origin;
  return h;
}

function makeReply(request, env) {
  const cors = corsHeaders(request, env);
  const json = (code, body) =>
    new Response(JSON.stringify(body), {
      status: code,
      headers: { ...cors, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  return { cors, json, fail: (code, error, message) => json(code, { error, message }) };
}

async function readBody(request) {
  const raw = await request.text();
  if (raw.length > 16 * 1024) throw new Error("too_large");
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    throw new Error("bad_json");
  }
}

/* ───────────── обработчики ───────────── */

async function register({ request, env, ip, r }) {
  const db = env.DB;
  if (await tooMany(db, ip)) return r.fail(429, "rate_limited", "Слишком много попыток. Подождите пару минут.");

  const body = await readBody(request);
  const nickname = String(body.nickname || "").trim();
  const password = String(body.password || "");
  const deviceId = String(body.deviceId || "").trim().slice(0, 64);

  if (!NICK_RE.test(nickname))
    return r.fail(400, "bad_nickname", "Ник: 3–16 символов, латиница, цифры и «_».");
  if (password.length < 6 || password.length > 128)
    return r.fail(400, "bad_password", "Пароль: от 6 до 128 символов.");

  const exists = await db.prepare("SELECT id FROM users WHERE nickname = ?").bind(nickname).first();
  if (exists) return r.fail(409, "nickname_taken", "Этот ник уже занят.");

  let id;
  try {
    const res = await db
      .prepare("INSERT INTO users (nickname, pass_hash, plan, device_id, created_at, last_login) VALUES (?,?,?,?,?,?)")
      .bind(nickname, await hashPassword(password, iterOf(env)), "free", deviceId || null, now(), now())
      .run();
    id = res.meta.last_row_id;
  } catch (e) {
    if (String(e).includes("UNIQUE")) return r.fail(409, "nickname_taken", "Этот ник уже занят.");
    throw e;
  }

  const row = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
  const session = await createSession(db, row.id);
  await resetAttempts(db, ip);
  return r.json(201, { ...session, user: userJson(row) });
}

async function login({ request, env, ip, r }) {
  const db = env.DB;
  if (await tooMany(db, ip)) return r.fail(429, "rate_limited", "Слишком много попыток. Подождите пару минут.");

  const body = await readBody(request);
  const nickname = String(body.nickname || "").trim();
  const password = String(body.password || "");
  const deviceId = String(body.deviceId || "").trim().slice(0, 64);

  const row = await db.prepare("SELECT * FROM users WHERE nickname = ?").bind(nickname).first();
  if (!row || !(await verifyPassword(password, row.pass_hash)))
    return r.fail(401, "invalid_credentials", "Неверный ник или пароль.");

  if (row.device_id && deviceId && row.device_id !== deviceId)
    return r.fail(
      409,
      "device_mismatch",
      "Аккаунт привязан к другому компьютеру. Напишите в поддержку, чтобы перенести."
    );

  if (!row.device_id && deviceId)
    await db.prepare("UPDATE users SET device_id = ? WHERE id = ?").bind(deviceId, row.id).run();

  // Если сложность хеша повысили, обновляем его при успешном входе.
  if (Number(String(row.pass_hash).split("$")[1]) < iterOf(env))
    await db
      .prepare("UPDATE users SET pass_hash = ? WHERE id = ?")
      .bind(await hashPassword(password, iterOf(env)), row.id)
      .run();

  await db.prepare("UPDATE users SET last_login = ? WHERE id = ?").bind(now(), row.id).run();
  if (Math.random() < 0.05)
    await db.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(now()).run();

  const session = await createSession(db, row.id);
  await resetAttempts(db, ip);
  return r.json(200, { ...session, user: userJson(row) });
}

async function me({ request, env, r }) {
  const row = await currentUser(env.DB, request);
  if (!row) return r.fail(401, "unauthorized", "Сессия истекла, войдите снова.");
  return r.json(200, { user: userJson(row) });
}

async function logout({ request, env, r }) {
  const token = bearer(request);
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
  return r.json(200, { ok: true });
}

async function changePassword({ request, env, ip, r }) {
  const db = env.DB;
  const user = await currentUser(db, request);
  if (!user) return r.fail(401, "unauthorized", "Сессия истекла, войдите снова.");
  if (await tooMany(db, ip)) return r.fail(429, "rate_limited", "Слишком много попыток. Подождите пару минут.");

  const body = await readBody(request);
  const current = String(body.current || "");
  const next = String(body.next || "");

  if (next.length < 6 || next.length > 128)
    return r.fail(400, "bad_password", "Пароль: от 6 до 128 символов.");
  if (!(await verifyPassword(current, user.pass_hash)))
    return r.fail(403, "wrong_password", "Текущий пароль неверный.");

  await db
    .prepare("UPDATE users SET pass_hash = ? WHERE id = ?")
    .bind(await hashPassword(next, iterOf(env)), user.id)
    .run();
  // Остальные устройства и сессии выходят, текущая остаётся.
  await db
    .prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?")
    .bind(user.id, await sha256(bearer(request)))
    .run();
  await resetAttempts(db, ip);
  return r.json(200, { ok: true });
}

async function logoutAll({ request, env, r }) {
  const user = await currentUser(env.DB, request);
  if (!user) return r.fail(401, "unauthorized", "Сессия истекла, войдите снова.");
  await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user.id).run();
  return r.json(200, { ok: true });
}

async function devPlan({ request, env, r }) {
  if (env.DEV !== "1") return r.fail(404, "not_found", "Нет такого метода.");
  const body = await readBody(request);
  const user = await extendPlan(env.DB, String(body.nickname || ""), String(body.plan || ""));
  if (!user) return r.fail(400, "bad_request", "Нужны nickname и plan (1m/6m/12m).");
  return r.json(200, { user });
}

async function webhook({ request, env, r }) {
  const secret = env.PAYMENT_SECRET || "";
  if (!secret) return r.fail(503, "disabled", "Вебхук не настроен.");
  const given = request.headers.get("x-webhook-secret") || "";
  if (!safeEqual(enc.encode(given), enc.encode(secret))) return r.fail(403, "forbidden", "Неверный секрет.");

  const body = await readBody(request);
  const user = await extendPlan(env.DB, String(body.nickname || ""), String(body.plan || ""));
  if (!user) return r.fail(400, "bad_request", "Нужны nickname и plan (1m/6m/12m).");
  return r.json(200, { ok: true, user });
}

/* ───────────── форум: просмотр темы со сообщениями ───────────── */

function forumTopicView(row) {
  if (!row) return null;
  return {
    id: row.id,
    authorId: row.author_id ?? null,
    authorNick: row.author_nick,
    authorRank: row.author_rank || "player",
    title: row.title,
    tag: row.tag,
    body: row.body,
    status: row.status,
    reason: row.reason || null,
    views: row.views ?? 0,
    replies: row.replies ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function forumMessageView(row) {
  if (!row) return null;
  return {
    id: row.id,
    topicId: row.topic_id,
    authorId: row.author_id ?? null,
    authorNick: row.author_nick,
    authorRank: row.author_rank || "player",
    body: row.body,
    createdAt: row.created_at,
  };
}

async function forumTopic({ request, env, r }, id) {
  const db = env.DB;
  const row = await db.prepare("SELECT * FROM forum_topics WHERE id = ?").bind(id).first();
  if (!row) return r.fail(404, "not_found", "Тема не найдена.");
  await db.prepare("UPDATE forum_topics SET views = views + 1 WHERE id = ?").bind(id).run();
  const { results } = await db
    .prepare("SELECT * FROM forum_messages WHERE topic_id = ? ORDER BY id ASC LIMIT 200")
    .bind(id)
    .all();
  return r.json(200, { topic: forumTopicView(row), messages: (results || []).map(forumMessageView) });
}

async function forumReply({ request, env, ip, r }, id) {
  const db = env.DB;
  if (await tooMany(db, ip)) return r.fail(429, "rate_limited", "Слишком много попыток. Подождите пару минут.");

  const user = await currentUser(db, request);
  if (!user) return r.fail(401, "unauthorized", "Требуется вход.");

  const topic = await db.prepare("SELECT * FROM forum_topics WHERE id = ?").bind(id).first();
  if (!topic) return r.fail(404, "not_found", "Тема не найдена.");

  if (topic.status === "rejected")
    return r.fail(400, "topic_rejected", "Тема отклонена. Вернуться к вопросу можно после новой темы или повторного рассмотрения.");

  const body = await readBody(request);
  const text = String(body.body || "").trim();
  if (text.length < 2 || text.length > FORUM_BODY_MAX)
    return r.fail(400, "bad_body", "Ответ: от 2 до 4000 символов.");

  const nowIso = now();
  await db
    .prepare("INSERT INTO forum_messages (topic_id, author_id, author_nick, author_rank, body, created_at) VALUES (?,?,?,?,?,?)")
    .bind(id, user.id, user.nickname, rankOf(user), text, nowIso)
    .run();

  const replies = (topic.replies || 0) + 1;
  await db.prepare("UPDATE forum_topics SET replies = ?, updated_at = ? WHERE id = ?").bind(replies, nowIso, id).run();

  const fresh = await db.prepare("SELECT * FROM forum_topics WHERE id = ?").bind(id).first();
  const { results } = await db
    .prepare("SELECT * FROM forum_messages WHERE topic_id = ? ORDER BY id ASC LIMIT 200")
    .bind(id)
    .all();
  return r.json(200, { topic: forumTopicView(fresh), messages: (results || []).map(forumMessageView) });
}

async function forumStatus({ request, env, r }, id) {
  const db = env.DB;
  if (!(await requireAdmin(db, request, env)))
    return r.fail(403, "forbidden", "Доступ только для администраторов.");

  const body = await readBody(request);
  const status = String(body.status || "").trim();
  if (!FORUM_STATUSES.includes(status)) return r.fail(400, "bad_status", "Неверный статус: " + FORUM_STATUSES.join(", ") + ".");

  const reason = status === "rejected" ? String(body.reason || "").trim().slice(0, 500) : null;
  if (status === "rejected" && reason.length < 3)
    return r.fail(400, "bad_reason", "При отклонении нужно указать причину.");

  const nowIso = now();
  await db
    .prepare("UPDATE forum_topics SET status = ?, reason = ?, updated_at = ? WHERE id = ?")
    .bind(status, status === "rejected" ? reason : null, nowIso, id)
    .run();
  const topic = await db.prepare("SELECT * FROM forum_topics WHERE id = ?").bind(id).first();
  return r.json(200, { topic: forumTopicView(topic) });
}

async function forumTag({ request, env, r }, id) {
  const db = env.DB;
  if (!(await requireAdmin(db, request, env)))
    return r.fail(403, "forbidden", "Доступ только для администраторов.");

  const body = await readBody(request);
  const tag = String(body.tag || "").trim();
  if (!FORUM_TAGS.includes(tag)) return r.fail(400, "bad_tag", "Неверный тег.");

  const nowIso = now();
  await db.prepare("UPDATE forum_topics SET tag = ?, updated_at = ? WHERE id = ?").bind(tag, nowIso, id).run();
  const topic = await db.prepare("SELECT * FROM forum_topics WHERE id = ?").bind(id).first();
  return r.json(200, { topic: forumTopicView(topic) });
}

/* ───────────── форум: список тем ───────────── */

async function forumTopics({ request, env, r }) {
  const { searchParams } = new URL(request.url);
  const tag = String(searchParams.get("tag") || "").trim();
  const status = String(searchParams.get("status") || "approved").trim();
  const q = String(searchParams.get("q") || "").trim().slice(0, 80);

  if (!FORUM_STATUSES.includes(status)) return r.fail(400, "bad_status", "Неверный статус.");
  if (tag && !FORUM_TAGS.includes(tag)) return r.fail(400, "bad_tag", "Неверный тег.");
  if (status !== "approved" && !(await requireAdmin(env.DB, request, env)))
    return r.fail(403, "forbidden", "Доступ только для администраторов.");

  const where = ["status = ?"];
  const params = [status];
  if (tag) {
    where.push("tag = ?");
    params.push(tag);
  }
  if (q) {
    where.push("(title LIKE ? OR body LIKE ?)");
    params.push("%" + q + "%", "%" + q + "%");
  }

  const { results } = await env.DB
    .prepare("SELECT * FROM forum_topics WHERE " + where.join(" AND ") + " ORDER BY updated_at DESC LIMIT 50")
    .bind(...params)
    .all();

  const topics = (results || []).map(forumTopicView);
  return r.json(200, { topics });
}

/* ───────────── форум: создание темы ───────────── */

async function forumCreate({ request, env, ip, r }) {
  const db = env.DB;
  if (await tooMany(db, ip)) return r.fail(429, "rate_limited", "Слишком много попыток. Подождите пару минут.");

  const user = await currentUser(db, request);
  if (!user) return r.fail(401, "unauthorized", "Требуется вход.");

  const body = await readBody(request);
  const title = String(body.title || "").trim().slice(0, FORUM_TITLE_MAX);
  const tag = String(body.tag || "").trim();
  const text = String(body.body || "").trim();

  if (title.length < FORUM_TITLE_MIN) return r.fail(400, "bad_title", "Заголовок: минимум " + FORUM_TITLE_MIN + " символа.");
  if (!FORUM_TAGS.includes(tag)) return r.fail(400, "bad_tag", "Выбери тег: " + FORUM_TAGS.join(", ") + ".");
  if (text.length < FORUM_BODY_MIN || text.length > FORUM_BODY_MAX)
    return r.fail(400, "bad_body", "Вопрос: от " + FORUM_BODY_MIN + " до " + FORUM_BODY_MAX + " символов.");

  const nowIso = now();
  const res = await db
    .prepare(
      "INSERT INTO forum_topics (author_id, author_nick, author_rank, title, tag, body, status, views, replies, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
    )
    .bind(user.id, user.nickname, rankOf(user), title, tag, text, "pending", 0, 0, nowIso, nowIso)
    .run();
  const topic = await db.prepare("SELECT * FROM forum_topics WHERE id = ?").bind(res.meta.last_row_id).first();
  return r.json(201, { topic: forumTopicView(topic) });
}

/* ───────────── автосоздание таблиц форума и колонки rank ───────────── */

let schemaReady = false;
async function ensureSchema(db) {
  if (schemaReady) return;
  const { results } = await db.prepare("PRAGMA table_info(users)").all();
  if (!(results || []).some((c) => c.name === "rank"))
    await db.prepare("ALTER TABLE users ADD COLUMN rank TEXT NOT NULL DEFAULT 'player'").run();
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS forum_topics (id INTEGER PRIMARY KEY AUTOINCREMENT, author_id INTEGER REFERENCES users(id) ON DELETE SET NULL, author_nick TEXT NOT NULL, author_rank TEXT NOT NULL DEFAULT 'player', title TEXT NOT NULL, tag TEXT NOT NULL, body TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', reason TEXT, views INTEGER NOT NULL DEFAULT 0, replies INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS forum_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, topic_id INTEGER NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE, author_id INTEGER, author_nick TEXT NOT NULL, author_rank TEXT NOT NULL DEFAULT 'player', body TEXT NOT NULL, created_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS forum_topics_tag_status ON forum_topics(tag, status)"),
    db.prepare("CREATE INDEX IF NOT EXISTS forum_topics_updated ON forum_topics(updated_at DESC)"),
    db.prepare("CREATE INDEX IF NOT EXISTS forum_messages_topic ON forum_messages(topic_id, id)"),
  ]);
  schemaReady = true;
}

/* ───────────── роутер ───────────── */

export async function onRequest({ request, env }) {
  const r = makeReply(request, env);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: r.cors });

  if (!env.DB)
    return r.fail(500, "no_database", "База данных D1 не подключена (привязка DB).");

  const { pathname } = new URL(request.url);
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const ctx = { request, env, ip, r };
  const m = request.method;
  const parts = pathname.split("/").filter(Boolean); // ["api","forum","topics","3","status"]

  try {
    if (parts[1] === "forum" || parts[1] === "auth" || parts[1] === "me" || parts[1] === "admin") await ensureSchema(env.DB);
    if (pathname === "/api/health") return r.json(200, { ok: true, time: now() });
    if (pathname === "/api/auth/register" && m === "POST") return await register(ctx);
    if (pathname === "/api/auth/login" && m === "POST") return await login(ctx);
    if (pathname === "/api/auth/logout" && m === "POST") return await logout(ctx);
    if (pathname === "/api/auth/logout-all" && m === "POST") return await logoutAll(ctx);
    if (pathname === "/api/me" && m === "GET") return await me(ctx);
    if (pathname === "/api/me/password" && m === "POST") return await changePassword(ctx);
    if (pathname === "/api/dev/plan" && m === "POST") return await devPlan(ctx);
    if (pathname === "/api/payments/webhook" && m === "POST") return await webhook(ctx);
    if (pathname === "/api/admin/session" && m === "GET") return await adminSession(ctx);
    if (pathname === "/api/admin/users" && m === "GET") return await adminSearch(ctx);
    if (pathname === "/api/admin/rank" && m === "POST") return await adminSetRank(ctx);
    if (pathname === "/api/admin/plan" && m === "POST") return await adminSetPlan(ctx);
    if (pathname === "/api/admin/password" && m === "POST") return await adminSetPassword(ctx);

    /* ── форум ── */
    if (parts[0] === "api" && parts[1] === "forum" && parts[2] === "topics") {
      const forumIdOk = parts.length >= 4 && Number.isInteger(Number(parts[3]));
      if (m === "GET" && parts.length === 3) return await forumTopics(ctx);
      if (m === "POST" && parts.length === 3) return await forumCreate(ctx);
      if (m === "GET" && parts.length === 4 && forumIdOk) return await forumTopic(ctx, Number(parts[3]));
      if (m === "POST" && parts.length === 4 && forumIdOk) return await forumReply(ctx, Number(parts[3]));
      if (m === "POST" && parts.length === 5 && parts[4] === "reply" && forumIdOk) return await forumReply(ctx, Number(parts[3]));
      if (m === "POST" && parts.length === 5 && parts[4] === "status" && forumIdOk) return await forumStatus(ctx, Number(parts[3]));
      if (m === "POST" && parts.length === 5 && parts[4] === "tag" && forumIdOk) return await forumTag(ctx, Number(parts[3]));
    }

    return r.fail(404, "not_found", "Нет такого метода.");
  } catch (e) {
    if (e.message === "bad_json") return r.fail(400, "bad_json", "Некорректный JSON.");
    if (e.message === "too_large") return r.fail(413, "too_large", "Слишком большой запрос.");
    console.error("[api]", e);
    return r.fail(500, "server_error", "Внутренняя ошибка сервера.");
  }
}
