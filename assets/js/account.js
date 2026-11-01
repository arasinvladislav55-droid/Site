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
    planBadge: $("#planBadge"),
    planUntil: $("#planUntil"),
    logout: $("#logoutBtn"),
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
    els.authCard.hidden = false;
    els.nickname.focus({ preventScroll: true });
  }

  function showProfile(user) {
    state.user = user;
    els.authCard.hidden = true;
    els.profileCard.hidden = false;
    renderProfile();
  }

  function renderProfile() {
    const user = state.user;
    if (!user) return;

    const planKey = user.plan && I18N[lang]["acc.plan." + user.plan] ? user.plan : "free";

    els.profileNick.textContent = user.nickname;
    els.planBadge.textContent = t("acc.plan." + planKey);
    els.planBadge.classList.toggle("is-free", planKey === "free");

    if (planKey === "free") {
      els.planUntil.textContent = t("acc.forever");
    } else if (user.planUntil) {
      const date = new Date(user.planUntil);
      const formatted = new Intl.DateTimeFormat(lang === "ru" ? "ru-RU" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
      els.planUntil.textContent = t("acc.until", { date: formatted });
    } else {
      els.planUntil.textContent = "";
    }
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
