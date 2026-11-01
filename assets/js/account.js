/* Universal Client — страница аккаунта (регистрация и вход) */
(() => {
  "use strict";

  /* =========================================================
     Адрес API.
     Локально: http://127.0.0.1:8787
     В продакшене: "https://api.вашдомен.ru" или "/api",
     если сервер стоит за тем же доменом через reverse proxy.
     ========================================================= */
  const API_BASE =
    window.UC_API ??
    (location.protocol === "file:" || location.hostname === "127.0.0.1" || location.hostname === "localhost"
      ? "http://127.0.0.1:8787"
      : "");

  const I18N = {
    ru: {
      "acc.back": "На главную",
      "acc.eyebrow": "Аккаунт",
      "acc.title": "Один аккаунт для сайта и лаунчера",
      "acc.lead": "Зарегистрируйтесь здесь — и входите этим ником и паролем в лаунчере. Тариф и срок подписки подтянутся сами.",
      "acc.tabLogin": "Вход",
      "acc.tabRegister": "Регистрация",
      "acc.nickname": "Ник в Minecraft",
      "acc.password": "Пароль",
      "acc.repeat": "Повторите пароль",
      "acc.signIn": "Войти",
      "acc.create": "Создать аккаунт",
      "acc.note": "Ник изменить нельзя: от него зависит UUID игрока, сохранённые миры и доступ на серверах.",
      "acc.profileEyebrow": "Профиль",
      "acc.profileLead": "Теперь откройте лаунчер и войдите этим ником и паролем — доступ и тариф подтянутся автоматически.",
      "acc.choosePlan": "Выбрать тариф",
      "acc.logout": "Выйти",
      "acc.step1t": "Регистрация на сайте",
      "acc.step1": "Придумайте ник и пароль — аккаунт создаётся сразу.",
      "acc.step2t": "Вход в лаунчере",
      "acc.step2": "Тот же ник и пароль на экране входа в клиенте.",
      "acc.step3t": "Игра и подписка",
      "acc.step3": "Тариф, срок и функции подтягиваются с сервера.",
      "acc.forever": "бесплатно навсегда",
      "acc.until": "до {date}",
      "prof.subTitle": "Подписка",
      "prof.ctaFree": "Открыть Premium",
      "prof.ctaPaid": "Продлить подписку",
      "prof.hintFree": "Premium открывает все темы, оформление Rounded UI и Discord RPC.",
      "prof.hintWarn": "Подписка скоро закончится — продлите, чтобы не потерять функции.",
      "prof.activeUntil": "Активна до {date}",
      "prof.left": "Осталось {n}",
      "prof.day.one": "день",
      "prof.day.few": "дня",
      "prof.day.many": "дней",
      "prof.featTitle": "Возможности",
      "prof.premium": "Premium",
      "feat.versions": "Версии 1.19 — 1.21.11",
      "feat.servers": "Серверы",
      "feat.profile": "Профиль игрока",
      "feat.one-theme": "Одна тема на выбор",
      "feat.themes": "Все шесть тем и свой цвет",
      "feat.rounded-ui": "Оформление Minecraft (Rounded UI)",
      "feat.rpc": "Discord RPC",
      "prof.infoTitle": "Данные аккаунта",
      "prof.id": "ID",
      "prof.created": "Создан",
      "prof.lastLogin": "Последний вход",
      "prof.device": "Компьютер",
      "prof.deviceYes": "Привязан",
      "prof.deviceNo": "Пока не привязан",
      "prof.secTitle": "Безопасность",
      "prof.pwCurrent": "Текущий пароль",
      "prof.pwNew": "Новый пароль",
      "prof.pwSave": "Сменить пароль",
      "prof.pwDone": "Пароль изменён. На других устройствах нужно будет войти заново.",
      "prof.logoutAll": "Выйти на всех устройствах",
      "prof.logoutAllConfirm": "Выйти на всех устройствах, включая лаунчер? Потребуется войти заново.",
      "prof.startTitle": "Как начать играть",
      "prof.todo1": "Аккаунт создан",
      "prof.todo1t": "Ник {nick} закреплён за вами.",
      "prof.todo2": "Установите лаунчер",
      "prof.todo2t": "Скачайте установщик и запустите его.",
      "prof.todo2l": "Как установить",
      "prof.todo3": "Войдите в лаунчере",
      "prof.todo3t": "Тот же ник и пароль. Тариф подтянется сам.",
      "prof.todo3done": "Вы уже входили в лаунчере — всё готово.",
      "err.wrong_password": "Текущий пароль неверный.",
      "err.bad_password": "Пароль должен быть от 6 до 128 символов.",
      "acc.since": "Аккаунт создан {date}",
      "acc.plan.free": "Free",
      "acc.plan.1m": "1 месяц",
      "acc.plan.6m": "6 месяцев",
      "acc.plan.12m": "12 месяцев",
      "acc.hello": "Вы вошли как {nick}",
      "err.nickname": "Ник: 3–16 символов, латиница, цифры и «_».",
      "err.password": "Пароль должен быть от 6 до 128 символов.",
      "err.repeat": "Пароли не совпадают.",
      "err.network": "Нет связи с сервером. Попробуйте ещё раз через минуту.",
      "err.unknown": "Что-то пошло не так. Попробуйте ещё раз.",
      "err.invalid_credentials": "Неверный ник или пароль.",
      "err.nickname_taken": "Этот ник уже занят.",
      "err.device_mismatch": "Аккаунт привязан к другому компьютеру. Напишите в поддержку.",
      "err.rate_limited": "Слишком много попыток. Подождите пару минут.",
      "err.unauthorized": "Сессия истекла, войдите снова.",
      "footer.tagline": "Лаунчер Minecraft с характером",
      "footer.legal": "Не связан с Mojang Studios и Microsoft. Minecraft — торговая марка Mojang Studios.",
      "nav.pricing": "Тарифы",
      "nav.install": "Установка",
      "nav.faq": "FAQ"
    },
    en: {
      "acc.back": "Back to site",
      "acc.eyebrow": "Account",
      "acc.title": "One account for the site and the launcher",
      "acc.lead": "Sign up here and use the same nickname and password in the launcher. Your plan and term come along automatically.",
      "acc.tabLogin": "Sign in",
      "acc.tabRegister": "Sign up",
      "acc.nickname": "Minecraft nickname",
      "acc.password": "Password",
      "acc.repeat": "Repeat password",
      "acc.signIn": "Sign in",
      "acc.create": "Create account",
      "acc.note": "The nickname can't be changed: your UUID, saved worlds and server access depend on it.",
      "acc.profileEyebrow": "Profile",
      "acc.profileLead": "Now open the launcher and sign in with this nickname and password — access and plan load automatically.",
      "acc.choosePlan": "Choose a plan",
      "acc.logout": "Sign out",
      "acc.step1t": "Sign up on the site",
      "acc.step1": "Pick a nickname and password — the account is created instantly.",
      "acc.step2t": "Sign in to the launcher",
      "acc.step2": "The same nickname and password on the client login screen.",
      "acc.step3t": "Play and subscribe",
      "acc.step3": "Plan, term and features are pulled from the server.",
      "acc.forever": "free forever",
      "acc.until": "until {date}",
      "prof.subTitle": "Subscription",
      "prof.ctaFree": "Get Premium",
      "prof.ctaPaid": "Renew subscription",
      "prof.hintFree": "Premium unlocks all themes, Rounded UI styling and Discord RPC.",
      "prof.hintWarn": "Your subscription ends soon — renew to keep your features.",
      "prof.activeUntil": "Active until {date}",
      "prof.left": "{n} left",
      "prof.day.one": "day",
      "prof.day.few": "days",
      "prof.day.many": "days",
      "prof.featTitle": "Features",
      "prof.premium": "Premium",
      "feat.versions": "Versions 1.19 — 1.21.11",
      "feat.servers": "Servers",
      "feat.profile": "Player profile",
      "feat.one-theme": "One theme of your choice",
      "feat.themes": "All six themes and a custom color",
      "feat.rounded-ui": "Minecraft styling (Rounded UI)",
      "feat.rpc": "Discord RPC",
      "prof.infoTitle": "Account details",
      "prof.id": "ID",
      "prof.created": "Created",
      "prof.lastLogin": "Last sign-in",
      "prof.device": "Computer",
      "prof.deviceYes": "Linked",
      "prof.deviceNo": "Not linked yet",
      "prof.secTitle": "Security",
      "prof.pwCurrent": "Current password",
      "prof.pwNew": "New password",
      "prof.pwSave": "Change password",
      "prof.pwDone": "Password changed. Other devices will need to sign in again.",
      "prof.logoutAll": "Sign out everywhere",
      "prof.logoutAllConfirm": "Sign out on all devices, including the launcher? You will need to sign in again.",
      "prof.startTitle": "Getting started",
      "prof.todo1": "Account created",
      "prof.todo1t": "The nickname {nick} is yours.",
      "prof.todo2": "Install the launcher",
      "prof.todo2t": "Download the installer and run it.",
      "prof.todo2l": "How to install",
      "prof.todo3": "Sign in to the launcher",
      "prof.todo3t": "Same nickname and password. Your plan comes along automatically.",
      "prof.todo3done": "You have already signed in to the launcher — all set.",
      "err.wrong_password": "The current password is wrong.",
      "err.bad_password": "The password must be 6 to 128 characters.",
      "acc.since": "Account created {date}",
      "acc.plan.free": "Free",
      "acc.plan.1m": "1 month",
      "acc.plan.6m": "6 months",
      "acc.plan.12m": "12 months",
      "acc.hello": "Signed in as {nick}",
      "err.nickname": "Nickname: 3–16 characters, letters, digits and «_».",
      "err.password": "Password must be 6–128 characters long.",
      "err.repeat": "Passwords don't match.",
      "err.network": "No connection to the server. Try again in a minute.",
      "err.unknown": "Something went wrong. Please try again.",
      "err.invalid_credentials": "Wrong nickname or password.",
      "err.nickname_taken": "This nickname is already taken.",
      "err.device_mismatch": "The account is bound to another computer. Contact support.",
      "err.rate_limited": "Too many attempts. Wait a couple of minutes.",
      "err.unauthorized": "Session expired, sign in again.",
      "footer.tagline": "A Minecraft launcher with character",
      "footer.legal": "Not affiliated with Mojang Studios or Microsoft. Minecraft is a trademark of Mojang Studios.",
      "nav.pricing": "Pricing",
      "nav.install": "Install",
      "nav.faq": "FAQ"
    }
  };

  const store = {
    get(k, fallback) {
      try { return localStorage.getItem(k) || fallback; } catch { return fallback; }
    },
    set(k, v) {
      try { localStorage.setItem(k, v); } catch { /* ignore */ }
    },
    remove(k) {
      try { localStorage.removeItem(k); } catch { /* ignore */ }
    }
  };

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  let lang = store.get("uc-lang", "ru");
  if (!I18N[lang]) lang = "ru";

  const theme = store.get("uc-theme", "emerald");
  document.documentElement.dataset.theme = theme;

  const NICK_RE = /^[A-Za-z0-9_]{3,16}$/;
  const state = { mode: "login", user: null, busy: false };

  const els = {
    langBtn: $("#accLang"),
    authCard: $("#authCard"),
    profileCard: $("#profileCard"),
    tabs: $$(".acc__tab"),
    form: $("#authForm"),
    nickname: $("#nickname"),
    password: $("#password"),
    repeat: $("#repeat"),
    repeatRow: $("#repeatRow"),
    msg: $("#msg"),
    submit: $("#submit"),
    submitText: $("#submitText"),
    profileNick: $("#profileNick"),
    profileAvatar: $("#profileAvatar"),
    profileSince: $("#profileSince"),
    planBadge: $("#planBadge"),
    logout: $("#logoutBtn"),
    regSteps: $("#regSteps"),
    subPlan: $("#subPlan"),
    subUntil: $("#subUntil"),
    subMeter: $("#subMeter"),
    subFill: $("#subFill"),
    subHint: $("#subHint"),
    subCta: $("#subCta"),
    featList: $("#featList"),
    infoList: $("#infoList"),
    todoList: $("#todoList"),
    pwForm: $("#pwForm"),
    pwCurrent: $("#pwCurrent"),
    pwNew: $("#pwNew"),
    pwRepeat: $("#pwRepeat"),
    pwMsg: $("#pwMsg"),
    pwSubmit: $("#pwSubmit"),
    logoutAll: $("#logoutAllBtn"),
  };

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
    document.documentElement.lang = next;
    store.set("uc-lang", next);

    $$("[data-i18n]").forEach((el) => {
      const value = I18N[lang][el.dataset.i18n];
      if (value != null) el.textContent = value;
    });

    if (els.langBtn) {
      els.langBtn.textContent = next === "ru" ? "EN" : "RU";
      els.langBtn.setAttribute("aria-label", next === "ru" ? "Switch to English" : "Переключить на русский");
    }

    els.submitText.dataset.i18n = state.mode === "login" ? "acc.signIn" : "acc.create";
    els.submitText.textContent = t(state.mode === "login" ? "acc.signIn" : "acc.create");
    document.title = (next === "ru" ? "Аккаунт" : "Account") + " — Universal Client";

    if (state.user) renderProfile();
  }

  /* ---------- сеть ---------- */

  async function api(path, options = {}) {
    const res = await fetch(API_BASE + path, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: "Bearer " + options.token } : {}),
      },
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
    els.msg.textContent = text || "";
    els.msg.classList.toggle("is-error", kind === "error");
    els.msg.classList.toggle("is-ok", kind === "ok");
  }

  function clearFieldErrors() {
    [els.nickname, els.password, els.repeat].forEach((el) => el.classList.remove("is-error"));
  }

  function setBusy(busy) {
    state.busy = busy;
    els.submit.disabled = busy;
    els.nickname.disabled = busy;
    els.password.disabled = busy;
    els.repeat.disabled = busy;
    els.submit.style.opacity = busy ? "0.7" : "";
  }

  /* ---------- режимы ---------- */

  function setMode(mode) {
    state.mode = mode;
    const isLogin = mode === "login";

    els.tabs.forEach((tab) => {
      const active = tab.dataset.tab === mode;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    els.repeatRow.hidden = isLogin;
    els.repeat.required = !isLogin;
    els.password.autocomplete = isLogin ? "current-password" : "new-password";

    els.submitText.dataset.i18n = isLogin ? "acc.signIn" : "acc.create";
    els.submitText.textContent = t(isLogin ? "acc.signIn" : "acc.create");

    clearFieldErrors();
    message("");
  }

  function showAuth() {
    state.user = null;
    els.profileCard.hidden = true;
    els.regSteps.hidden = false;
    els.authCard.hidden = false;
    els.nickname.focus({ preventScroll: true });
  }

  function showProfile(user) {
    state.user = user;
    els.authCard.hidden = true;
    els.regSteps.hidden = true;
    els.profileCard.hidden = false;
    renderProfile();
  }

  const PLAN_DAYS = { "1m": 30, "6m": 182, "12m": 365 };
  const FEATURES = ["versions", "servers", "profile", "one-theme", "themes", "rounded-ui", "rpc"];
  const PAID_ONLY = new Set(["themes", "rounded-ui", "rpc"]);

  const SVG_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const SVG_LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 017 0v3"/></svg>';

  const locale = () => (lang === "ru" ? "ru-RU" : "en-GB");
  const fmtDate = (iso) =>
    new Intl.DateTimeFormat(locale(), { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
  const fmtDateTime = (iso) =>
    new Intl.DateTimeFormat(locale(), {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));

  function plural(n) {
    if (lang !== "ru") return n === 1 ? t("prof.day.one") : t("prof.day.few");
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return t("prof.day.one");
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return t("prof.day.few");
    return t("prof.day.many");
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function renderSubscription(user, planKey) {
    const paid = planKey !== "free";
    els.subPlan.textContent = t("acc.plan." + planKey);
    els.subCta.dataset.i18n = paid ? "prof.ctaPaid" : "prof.ctaFree";
    els.subCta.textContent = t(paid ? "prof.ctaPaid" : "prof.ctaFree");

    if (!paid || !user.planUntil) {
      els.subUntil.textContent = t("acc.forever");
      els.subMeter.hidden = true;
      els.subHint.textContent = t("prof.hintFree");
      els.subHint.classList.remove("is-warn");
      return;
    }

    const until = new Date(user.planUntil).getTime();
    const left = Math.max(0, Math.ceil((until - Date.now()) / 864e5));
    const total = PLAN_DAYS[planKey] || 30;
    const pct = Math.min(100, Math.max(4, Math.round((left / total) * 100)));
    const warn = left <= 7;

    els.subUntil.textContent = t("prof.activeUntil", { date: fmtDate(user.planUntil) });
    els.subMeter.hidden = false;
    els.subFill.style.width = pct + "%";
    els.subFill.classList.toggle("is-warn", warn);
    els.subHint.textContent = warn
      ? t("prof.hintWarn")
      : t("prof.left", { n: left + " " + plural(left) });
    els.subHint.classList.toggle("is-warn", warn);
  }

  function renderFeatures(user) {
    const have = new Set(user.features || []);
    els.featList.replaceChildren();

    FEATURES.forEach((key) => {
      // «Одна тема» не показываем тем, у кого открыты все темы.
      if (key === "one-theme" && have.has("themes")) return;

      const on = have.has(key);
      const li = el("li", on ? "is-on" : "is-off");
      const mark = el("span", "ico-state");
      mark.innerHTML = on ? SVG_CHECK : SVG_LOCK;
      li.append(mark, el("span", "", t("feat." + key)));
      if (!on && PAID_ONLY.has(key)) li.append(el("span", "feat__tag", t("prof.premium")));
      els.featList.append(li);
    });
  }

  function renderInfo(user) {
    const rows = [
      [t("acc.nickname"), user.nickname],
      [t("prof.id"), "#" + user.id],
      [t("prof.created"), user.createdAt ? fmtDate(user.createdAt) : "—"],
      [t("prof.lastLogin"), user.lastLogin ? fmtDateTime(user.lastLogin) : "—"],
      [t("prof.device"), user.deviceLinked ? t("prof.deviceYes") : t("prof.deviceNo")],
    ];
    els.infoList.replaceChildren();
    rows.forEach(([label, value]) => {
      const row = el("div");
      row.append(el("dt", "", label), el("dd", "", value));
      els.infoList.append(row);
    });
  }

  function renderTodo(user) {
    const linked = Boolean(user.deviceLinked);
    const items = [
      { done: true, title: t("prof.todo1"), text: t("prof.todo1t", { nick: user.nickname }) },
      { done: linked, title: t("prof.todo2"), text: t("prof.todo2t"), link: ["index.html#install", t("prof.todo2l")] },
      { done: linked, title: t("prof.todo3"), text: linked ? t("prof.todo3done") : t("prof.todo3t") },
    ];
    els.todoList.replaceChildren();
    items.forEach((item, i) => {
      const li = el("li", item.done ? "is-done" : "");
      const top = el("div", "todo__top");
      const mark = el("span", "todo__mark");
      if (item.done) mark.innerHTML = SVG_CHECK;
      else mark.textContent = String(i + 1);
      top.append(mark, el("span", "", item.title));
      li.append(top, el("p", "", item.text));
      if (item.link && !item.done) {
        const a = el("a", "", item.link[1] + " →");
        a.href = item.link[0];
        li.append(a);
      }
      els.todoList.append(li);
    });
  }

  function renderProfile() {
    const user = state.user;
    if (!user) return;

    const planKey = user.plan && I18N[lang]["acc.plan." + user.plan] ? user.plan : "free";

    els.profileNick.textContent = user.nickname;
    els.profileAvatar.textContent = user.nickname.charAt(0);
    els.planBadge.textContent = t("acc.plan." + planKey);
    els.planBadge.classList.toggle("is-free", planKey === "free");
    els.profileSince.textContent = user.createdAt ? t("acc.since", { date: fmtDate(user.createdAt) }) : "";

    renderSubscription(user, planKey);
    renderFeatures(user);
    renderInfo(user);
    renderTodo(user);
  }

  /* ---------- действия ---------- */

  async function submit(event) {
    event.preventDefault();
    if (state.busy) return;

    const nickname = els.nickname.value.trim();
    const password = els.password.value;
    const isLogin = state.mode === "login";

    clearFieldErrors();
    message("");

    if (!NICK_RE.test(nickname)) {
      els.nickname.classList.add("is-error");
      els.nickname.focus();
      return message(t("err.nickname"), "error");
    }
    if (password.length < 6 || password.length > 128) {
      els.password.classList.add("is-error");
      els.password.focus();
      return message(t("err.password"), "error");
    }
    if (!isLogin && els.repeat.value !== password) {
      els.repeat.classList.add("is-error");
      els.repeat.focus();
      return message(t("err.repeat"), "error");
    }

    setBusy(true);
    try {
      const data = await api(isLogin ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        body: { nickname, password },
      });

      store.set("uc-token", data.token);
      store.set("uc-nick", data.user.nickname);

      els.form.reset();
      showProfile(data.user);
    } catch (err) {
      if (err.code === "network" || err instanceof TypeError) {
        message(t("err.network"), "error");
      } else {
        const key = "err." + err.code;
        message(I18N[lang][key] ? t(key) : t("err.unknown"), "error");
        if (err.code === "invalid_credentials") {
          els.password.classList.add("is-error");
          els.password.focus();
          els.password.select();
        }
      }
    } finally {
      setBusy(false);
    }
  }

  function pwMessage(text, kind) {
    els.pwMsg.textContent = text || "";
    els.pwMsg.classList.toggle("is-error", kind === "error");
    els.pwMsg.classList.toggle("is-ok", kind === "ok");
  }

  function dropSession() {
    store.remove("uc-token");
    store.remove("uc-nick");
    setMode("login");
    showAuth();
  }

  async function changePassword(event) {
    event.preventDefault();
    if (state.busy) return;

    const current = els.pwCurrent.value;
    const next = els.pwNew.value;
    [els.pwCurrent, els.pwNew, els.pwRepeat].forEach((x) => x.classList.remove("is-error"));
    pwMessage("");

    if (current.length < 1) {
      els.pwCurrent.classList.add("is-error");
      els.pwCurrent.focus();
      return pwMessage(t("err.wrong_password"), "error");
    }
    if (next.length < 6 || next.length > 128) {
      els.pwNew.classList.add("is-error");
      els.pwNew.focus();
      return pwMessage(t("err.password"), "error");
    }
    if (els.pwRepeat.value !== next) {
      els.pwRepeat.classList.add("is-error");
      els.pwRepeat.focus();
      return pwMessage(t("err.repeat"), "error");
    }

    state.busy = true;
    els.pwSubmit.disabled = true;
    try {
      await api("/api/me/password", {
        method: "POST",
        token: store.get("uc-token", ""),
        body: { current, next },
      });
      els.pwForm.reset();
      pwMessage(t("prof.pwDone"), "ok");
    } catch (err) {
      if (err.status === 401) return dropSession();
      if (err.code === "wrong_password") {
        els.pwCurrent.classList.add("is-error");
        els.pwCurrent.focus();
      }
      const key = "err." + err.code;
      pwMessage(
        err.code === "network" || err instanceof TypeError ? t("err.network")
          : I18N[lang][key] ? t(key) : t("err.unknown"),
        "error"
      );
    } finally {
      state.busy = false;
      els.pwSubmit.disabled = false;
    }
  }

  async function logoutEverywhere() {
    if (!window.confirm(t("prof.logoutAllConfirm"))) return;
    try {
      await api("/api/auth/logout-all", { method: "POST", token: store.get("uc-token", "") });
    } catch (err) {
      if (err.status !== 401) {
        return pwMessage(err instanceof TypeError ? t("err.network") : t("err.unknown"), "error");
      }
    }
    dropSession();
  }

  async function logout() {
    const token = store.get("uc-token", "");
    store.remove("uc-token");
    store.remove("uc-nick");
    if (token) {
      api("/api/auth/logout", { method: "POST", token }).catch(() => {});
    }
    setMode("login");
    showAuth();
  }

  /* ---------- запуск ---------- */

  els.tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.tab)));
  els.form.addEventListener("submit", submit);
  els.logout.addEventListener("click", logout);
  els.pwForm.addEventListener("submit", changePassword);
  els.logoutAll.addEventListener("click", logoutEverywhere);
  els.langBtn.addEventListener("click", () => applyLang(lang === "ru" ? "en" : "ru"));

  [els.nickname, els.password, els.repeat].forEach((el) => {
    el.addEventListener("input", () => {
      el.classList.remove("is-error");
      if (els.msg.classList.contains("is-error")) message("");
    });
  });

  const params = new URLSearchParams(location.search);
  if (params.get("tab") === "register" || location.hash === "#register") {
    setMode("register");
  }

  applyLang(lang);

  const token = store.get("uc-token", "");
  if (!token) {
    showAuth();
    return;
  }

  api("/api/me", { token })
    .then((data) => showProfile(data.user))
    .catch((err) => {
      if (err.status === 401) {
        store.remove("uc-token");
        store.remove("uc-nick");
      }
      showAuth();
      if (err.status !== 401) message(t("err.network"), "error");
    });
})();
