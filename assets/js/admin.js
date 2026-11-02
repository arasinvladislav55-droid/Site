/* Universal Client — админ-панель (ранги и подписки) */
(() => {
  "use strict";

  const API_BASE =
    window.UC_API ??
    (location.protocol === "file:" || location.hostname === "127.0.0.1" || location.hostname === "localhost"
      ? "http://127.0.0.1:8787"
      : "");

  const RANKS = ["player", "developer", "admin"];
  const PLANS = ["1m", "6m", "12m", "revoke"];

  const I18N = {
    ru: {
      "adm.profile": "Кабинет",
      "adm.eyebrow": "Админ-панель",
      "adm.gateTitle": "Доступ только для администраторов",
      "adm.gateLead": "Войдите в кабинет под аккаунтом с рангом «Администратор» — или введите мастер-ключ (переменная ADMIN_SECRET на сервере), чтобы выдать ранг самому себе в первый раз.",
      "adm.gateNote": "Ключ хранится только в этой вкладке (sessionStorage) и больше никуда не отправляется.",
      "adm.secret": "Мастер-ключ (необязательно)",
      "adm.enter": "Открыть панель",
      "adm.title": "Ранги и подписки",
      "adm.exit": "Выйти",
      "adm.usersTitle": "Пользователи",
      "adm.search": "Найти",
      "adm.searchPh": "Поиск по нику…",
      "adm.modeSecret": "Вход по мастер-ключу.",
      "adm.modeSession": "Вход по аккаунту администратора.",
      "adm.empty": "Ничего не найдено.",
      "adm.rankApply": "Применить",
      "adm.passwordPh": "Новый пароль (мин. 6)",
      "adm.pwApply": "Сменить пароль",
      "adm.planGrant": "Выдать",
      "adm.planRevoke": "Отозвать",
      "adm.planUntil": "до {date}",
      "adm.forever": "Free",
      "rank.admin": "Администратор",
      "rank.developer": "Разработчик",
      "rank.player": "Игрок",
      "acc.plan.1m": "1 месяц",
      "acc.plan.6m": "6 месяцев",
      "acc.plan.12m": "12 месяцев",
      "acc.plan.revoke": "Отозвать подписку",
      "ok.rank": "Ранг обновлён.",
      "ok.grant": "Подписка выдана.",
      "ok.revoke": "Подписка отозвана.",
      "ok.password": "Пароль изменён. Сессии игрока сброшены.",
      "ok.passwordSelf": "Пароль изменён. Ваша сессия тоже сброшена — войдите заново.",
      "err.network": "Нет связи с сервером. Попробуйте ещё раз.",
      "err.unknown": "Что-то пошло не так.",
      "err.forbidden": "Доступ только для администраторов.",
      "err.not_found": "Пользователь не найден.",
      "err.last_admin": "Нельзя снять ранг с последнего администратора.",
      "err.bad_rank": "Неверный ранг.",
      "err.bad_nickname": "Некорректный ник.",
      "err.bad_request": "Неверный запрос.",
      "err.bad_password": "Пароль: от 6 до 128 символов.",
      "err.unauthorized": "Сессия истекла, обновите страницу.",
      "err.too_large": "Слишком большой запрос.",
      "err.bad_json": "Некорректный JSON.",
      "err.server_error": "Ошибка сервера. Попробуйте ещё раз."
    },
    en: {
      "adm.profile": "Account",
      "adm.eyebrow": "Admin panel",
      "adm.gateTitle": "Administrators only",
      "adm.gateLead": "Sign in to your account with the Administrator rank — or enter the master key (ADMIN_SECRET on the server) to grant yourself the rank for the first time.",
      "adm.gateNote": "The key is kept in this tab only (sessionStorage) and is never sent anywhere else.",
      "adm.secret": "Master key (optional)",
      "adm.enter": "Open the panel",
      "adm.title": "Ranks and subscriptions",
      "adm.exit": "Exit",
      "adm.usersTitle": "Users",
      "adm.search": "Search",
      "adm.searchPh": "Search by nickname…",
      "adm.modeSecret": "Signed in with the master key.",
      "adm.modeSession": "Signed in with an administrator account.",
      "adm.empty": "Nothing found.",
      "adm.rankApply": "Apply",
      "adm.passwordPh": "New password (min. 6)",
      "adm.pwApply": "Set password",
      "adm.planGrant": "Grant",
      "adm.planRevoke": "Revoke",
      "adm.planUntil": "until {date}",
      "adm.forever": "Free",
      "rank.admin": "Administrator",
      "rank.developer": "Developer",
      "rank.player": "Player",
      "acc.plan.1m": "1 month",
      "acc.plan.6m": "6 months",
      "acc.plan.12m": "12 months",
      "acc.plan.revoke": "Revoke subscription",
      "ok.rank": "Rank updated.",
      "ok.grant": "Subscription granted.",
      "ok.revoke": "Subscription revoked.",
      "ok.password": "Password updated. Player sessions were reset.",
      "ok.passwordSelf": "Password updated. Your session was reset too — sign in again.",
      "err.network": "No connection to the server. Try again.",
      "err.unknown": "Something went wrong.",
      "err.forbidden": "Administrators only.",
      "err.not_found": "User not found.",
      "err.last_admin": "You can't demote the last administrator.",
      "err.bad_rank": "Invalid rank.",
      "err.bad_nickname": "Invalid nickname.",
      "err.bad_request": "Bad request.",
      "err.bad_password": "Password: 6 to 128 characters.",
      "err.unauthorized": "Session expired, refresh the page.",
      "err.too_large": "Request too large.",
      "err.bad_json": "Malformed JSON.",
      "err.server_error": "Server error. Try again."
    }
  };

  /* ---------- хранилище ---------- */

  const session = {
    get(k, fallback) {
      try { return sessionStorage.getItem(k) || fallback; } catch { return fallback; }
    },
    set(k, v) {
      try { sessionStorage.setItem(k, v); } catch { /* ignore */ }
    },
    remove(k) {
      try { sessionStorage.removeItem(k); } catch { /* ignore */ }
    }
  };

  const store = {
    get(k, fallback) {
      try { return localStorage.getItem(k) || fallback; } catch { return fallback; }
    }
  };

  let lang;
  try {
    lang = localStorage.getItem("uc-lang");
  } catch { lang = null; }
  if (!I18N[lang]) lang = "ru";

  document.documentElement.dataset.theme = "emerald";
  document.documentElement.lang = lang;

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  const els = {
    langBtn: $("#admLang"),
    gateCard: $("#gateCard"),
    gateForm: $("#gateForm"),
    secret: $("#secret"),
    gateMsg: $("#gateMsg"),
    gateSubmit: $("#gateSubmit"),
    panelCard: $("#panelCard"),
    admMode: $("#admMode"),
    exitBtn: $("#exitBtn"),
    searchForm: $("#searchForm"),
    search: $("#search"),
    searchBtn: $("#searchBtn"),
    userList: $("#userList"),
    admMsg: $("#admMsg"),
  };

  let query = "";
  let busy = false;

  /* ---------- i18n ---------- */

  function t(key, vars) {
    let value = I18N[lang][key];
    if (value == null) value = key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) value = value.replace("{" + k + "}", v);
    }
    return value;
  }

  function applyLang(next) {
    lang = next;
    document.documentElement.lang = lang;
    try { localStorage.setItem("uc-lang", lang); } catch { /* ignore */ }

    $$("[data-i18n]").forEach((el) => {
      const value = I18N[lang][el.dataset.i18n];
      if (value != null) el.textContent = value;
    });
    $$("[data-i18n-ph]").forEach((el) => {
      const value = I18N[lang][el.dataset.i18nPh];
      if (value != null) el.placeholder = value;
    });

    els.langBtn.textContent = lang === "ru" ? "EN" : "RU";
    els.langBtn.setAttribute("aria-label", lang === "ru" ? "Switch to English" : "Переключить на русский");
    document.title = (lang === "ru" ? "Админ-панель" : "Admin panel") + " — Universal Client";
  }

  /* ---------- сеть ---------- */

  function headers() {
    const h = { "Content-Type": "application/json" };
    const token = store.get("uc-token", "");
    const secret = session.get("uc-admin-secret", "");
    if (token) h.Authorization = "Bearer " + token;
    if (secret) h["X-Admin-Secret"] = secret;
    return h;
  }

  async function api(path, options = {}) {
    const res = await fetch(API_BASE + path, {
      method: options.method || "GET",
      headers: headers(),
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    let data = {};
    try { data = await res.json(); } catch { /* ignore */ }

    if (!res.ok) {
      const err = new Error(data.message || "HTTP " + res.status);
      err.code = data.error || "unknown";
      err.status = res.status;
      throw err;
    }
    return data;
  }

  function message(text, kind) {
    els.admMsg.textContent = text || "";
    els.admMsg.classList.toggle("is-error", kind === "error");
    els.admMsg.classList.toggle("is-ok", kind === "ok");
  }

  // Сначала свой перевод по коду, затем настоящий текст ошибки сервера.
  function errText(err) {
    if (err instanceof TypeError) return t("err.network");
    const key = "err." + (err && err.code);
    if (I18N[lang][key]) return t(key);
    if (err && err.message && !/^HTTP/.test(err.message)) return err.message;
    return t("err.unknown");
  }

  /* ---------- вид ---------- */

  function showGate(text, kind) {
    els.panelCard.hidden = true;
    els.gateCard.hidden = false;
    if (text) {
      els.gateMsg.textContent = text;
      els.gateMsg.classList.toggle("is-error", kind === "error");
      els.gateMsg.classList.toggle("is-ok", kind === "ok");
    }
  }

  function showPanel(mode) {
    els.gateCard.hidden = true;
    els.gateForm.reset();
    els.panelCard.hidden = false;
    els.admMode.textContent = mode === "secret" ? t("adm.modeSecret") : t("adm.modeSession");
    load("");
  }

  const fmtDate = (iso) =>
    new Intl.DateTimeFormat(lang === "ru" ? "ru-RU" : "en-GB", {
      day: "numeric", month: "short", year: "numeric",
    }).format(new Date(iso));

  function planLabel(user) {
    if (user.plan === "free" || !user.planUntil) return t("adm.forever");
    return t("acc.plan." + user.plan) + " · " + t("adm.planUntil", { date: fmtDate(user.planUntil) });
  }

  function userNode(user, onAction) {
    const card = document.createElement("div");
    card.className = "adm-user";
    card.dataset.id = user.id;

    const id = document.createElement("div");
    id.className = "adm-user__id";
    const nick = document.createElement("div");
    nick.className = "adm-user__nick";
    nick.textContent = user.nickname;
    const meta = document.createElement("div");
    meta.className = "adm-user__meta";

    const planBadge = document.createElement("span");
    planBadge.className = "acc__badge" + (user.plan === "free" ? " is-free" : "");
    planBadge.textContent = planLabel(user);

    const rankBadge = document.createElement("span");
    rankBadge.className = "rank rank--" + (RANKS.includes(user.rank) ? user.rank : "player");
    rankBadge.textContent = t("rank." + (RANKS.includes(user.rank) ? user.rank : "player"));

    const idTxt = document.createElement("span");
    idTxt.textContent = "#" + user.id;

    meta.append(planBadge, rankBadge, idTxt);
    id.append(nick, meta);

    const actions = document.createElement("div");
    actions.className = "adm-user__actions";

    const rankSel = document.createElement("select");
    RANKS.forEach((rk) => {
      const opt = document.createElement("option");
      opt.value = rk;
      opt.textContent = t("rank." + rk);
      rankSel.append(opt);
    });
    rankSel.value = user.rank;

    const rankBtn = document.createElement("button");
    rankBtn.className = "btn btn--ghost";
    rankBtn.type = "button";
    rankBtn.textContent = t("adm.rankApply");
    rankBtn.addEventListener("click", async () => {
      if (busy) return;
      busy = true;
      try {
        await api("/api/admin/rank", {
          method: "POST",
          body: { nickname: user.nickname, rank: rankSel.value },
        });
        message(t("ok.rank"), "ok");
        onAction();
      } catch (err) {
        message(errText(err), "error");
        busy = false;
      }
    });

    const planSel = document.createElement("select");
    PLANS.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p;
      opt.textContent = t("acc.plan." + p);
      planSel.append(opt);
    });
    planSel.value = "1m";

    const grantBtn = document.createElement("button");
    grantBtn.className = "btn btn--primary";
    grantBtn.type = "button";
    grantBtn.textContent = t("adm.planGrant");
    grantBtn.addEventListener("click", async () => {
      if (busy) return;
      busy = true;
      try {
        await api("/api/admin/plan", {
          method: "POST",
          body: { nickname: user.nickname, plan: planSel.value },
        });
        message(t("ok.grant"), "ok");
        onAction();
      } catch (err) {
        message(errText(err), "error");
        busy = false;
      }
    });

    const revokeBtn = document.createElement("button");
    revokeBtn.className = "btn btn--ghost";
    revokeBtn.type = "button";
    revokeBtn.textContent = t("adm.planRevoke");
    revokeBtn.addEventListener("click", async () => {
      if (busy) return;
      busy = true;
      try {
        await api("/api/admin/plan", {
          method: "POST",
          body: { nickname: user.nickname, plan: "revoke" },
        });
        message(t("ok.revoke"), "ok");
        onAction();
      } catch (err) {
        message(errText(err), "error");
        busy = false;
      }
    });

    // Сброс пароля: админ задаёт новый, сессии игрока сбрасываются.
    const pwInput = document.createElement("input");
    pwInput.type = "password";
    pwInput.maxLength = 128;
    pwInput.autocomplete = "new-password";
    pwInput.placeholder = t("adm.passwordPh");
    const pwBtn = document.createElement("button");
    pwBtn.className = "btn btn--ghost";
    pwBtn.type = "button";
    pwBtn.textContent = t("adm.pwApply");
    pwBtn.addEventListener("click", async () => {
      if (busy) return;
      const pw = pwInput.value;
      if (pw.length < 6 || pw.length > 128) {
        pwInput.focus();
        return message(t("err.bad_password"), "error");
      }
      busy = true;
      try {
        await api("/api/admin/password", {
          method: "POST",
          body: { nickname: user.nickname, password: pw },
        });
        pwInput.value = "";
        // Если админ сменил пароль себе — его сессия тоже сброшена.
        message(user.nickname === store.get("uc-nick", "") ? t("ok.passwordSelf") : t("ok.password"), "ok");
        busy = false;
      } catch (err) {
        message(errText(err), "error");
        busy = false;
      }
    });

    actions.append(rankSel, rankBtn, planSel, grantBtn, revokeBtn, pwInput, pwBtn);
    card.append(id, actions);
    return card;
  }

  async function load(q, keepMsg = false) {
    if (q != null) query = q;
    if (!keepMsg) message("");
    try {
      const data = await api("/api/admin/users" + (query ? "?q=" + encodeURIComponent(query) : ""));
      els.userList.replaceChildren();
      if (!data.users || data.users.length === 0) {
        els.userList.append(Object.assign(document.createElement("p"), { className: "adm-empty", textContent: t("adm.empty") }));
        return;
      }
      data.users.forEach((u) => els.userList.append(userNode(u, () => load())));
      busy = false;
    } catch (err) {
      if (err.status === 403) return showGate(t("err.forbidden"), "error");
      message(errText(err), "error");
      busy = false;
    }
  }

  /* ---------- вход ---------- */

  async function gate(event) {
    event.preventDefault();
    const secret = els.secret.value.trim();
    if (secret) session.set("uc-admin-secret", secret);

    els.gateSubmit.disabled = true;
    try {
      const data = await api("/api/admin/session");
      // Ключ верный или в localStorage есть аккаунт админа.
      showPanel(data.mode);
    } catch (err) {
      if (err.status === 403) {
        session.remove("uc-admin-secret");
        showGate(t("err.forbidden"), "error");
      } else {
        showGate(err instanceof TypeError ? t("err.network") : t("err.unknown"), "error");
      }
    } finally {
      els.gateSubmit.disabled = false;
    }
  }

  function exit() {
    session.remove("uc-admin-secret");
    showGate("", "ok");
    els.gateMsg.textContent = "";
  }

  /* ---------- события ---------- */

  els.gateForm.addEventListener("submit", gate);
  els.searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    load(els.search.value.trim());
  });
  els.search.addEventListener("input", () => {
    els.search.classList.remove("is-error");
  });
  els.exitBtn.addEventListener("click", exit);
  els.langBtn.addEventListener("click", () => {
    applyLang(lang === "ru" ? "en" : "ru");
    if (!els.panelCard.hidden) load(query, true);
    else showGate("", "ok");
  });

  applyLang(lang);

  // Автовход: аккаунт админа в localStorage или ключ в sessionStorage.
  els.gateSubmit.disabled = true;
  api("/api/admin/session")
    .then((data) => showPanel(data.mode))
    .catch(() => {
      showGate("", "ok");
      els.gateMsg.textContent = "";
    })
    .finally(() => {
      els.gateSubmit.disabled = false;
    });
})();
