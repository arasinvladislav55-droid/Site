/* Universal Client — форум: темы и чат-вопросы */
(() => {
  "use strict";

  /* =========================================================
     Адрес API (как в app.js / account.js).
     ========================================================= */
  const API_BASE =
    window.UC_API ??
    (location.protocol === "file:" || location.hostname === "127.0.0.1" || location.hostname === "localhost"
      ? "http://127.0.0.1:8787"
      : "");

  /* =========================================================
     i18n
     ========================================================= */
  const I18N = {
    ru: {
      "forum.eyebrow": "Форум",
      "forum.title": "Вопросы игроков",
      "forum.lead": "Задай вопрос игрокам и команде разработки. Тема создаётся автоматически со статусом «На рассмотрении» — после одобрения она открывается для ответов.",
      "forum.new": "Создать тему",
      "forum.newTitle": "Новая тема",
      "forum.f.title": "Заголовок",
      "forum.f.tag": "Тег",
      "forum.f.body": "Ваш вопрос",
      "forum.f.reply": "Ваш ответ",
      "forum.send": "Отправить",
      "forum.confirm": "Подтвердить",
      "forum.cancel": "Отмена",
      "forum.back": "К списку",
      "forum.hint": "Новые темы сначала уходят на рассмотрение модератора — после одобрения они появляются в общем списке и открываются для ответов.",
      "forum.empty": "Тем пока нет. Будь первым, кто задал вопрос!",
      "forum.pendingTitle": "Ожидают рассмотрения",
      "forum.tag.all": "Все теги",
      "forum.tag.tech": "Техническая часть",
      "forum.tag.server": "Вопрос по серверу",
      "forum.tag.idea": "Идея / Баг",
      "forum.tag.chat": "Чат с высшим руководством",
      "forum.status.pending": "На рассмотрении",
      "forum.status.approved": "Одобрено",
      "forum.status.rejected": "Отклонено",
      "forum.pendingNote": "Ожидается проверка командой разработки.",
      "forum.approvedNote": "Тема одобрена — можешь отвечать.",
      "forum.reasonPrefix": "Причина: ",
      "forum.replies": "ответов",
      "forum.views": "просмотров",
      "forum.approve": "Одобрить",
      "forum.reject": "Отклонить",
      "forum.rejectReason": "Причина отклонения…",
      "forum.tagApply": "Применить",
      "forum.err.auth": "Нужен аккаунт, чтобы задать вопрос. Войдите или зарегистрируйтесь.",
      "forum.err.title": "Заголовок: от 4 до 140 символов.",
      "forum.err.tag": "Выбери тег.",
      "forum.err.body": "Вопрос: от 10 до 4000 символов.",
      "forum.err.bad_body": "Ответ: от 2 до 4000 символов.",
      "forum.err.bad_status": "Неверный статус.",
      "forum.err.bad_tag": "Неверный тег.",
      "forum.err.bad_title": "Заголовок: от 4 до 140 символов.",
      "forum.err.forbidden": "Доступ только для администраторов.",
      "forum.err.not_found": "Тема не найдена.",
      "forum.err.rate_limited": "Слишком много попыток. Подождите пару минут.",
      "forum.err.unauthorized": "Требуется вход.",
      "forum.err.topic_pending": "Тема на рассмотрении. Ответы принимаются после одобрения.",
      "forum.err.topic_rejected": "Тема отклонена. После новой темы или повторного рассмотрения.",
      "forum.err.network": "Нет связи с сервером. Попробуйте ещё раз.",
      "forum.err.unknown": "Что-то пошло не так. Попробуйте ещё раз.",
      "forum.status.ok": "Тема одобрена.",
      "forum.status.reject.ok": "Тема отклонена.",
      "forum.status.err": "Не удалось обновить статус.",
      "forum.created.ok": "Тема отправлена на рассмотрение.",
      "btn.account": "Войти",
      "btn.profile": "Профиль",
      "rank.owner": "Владелец",
      "rank.developer": "Разработчик",
      "rank.manager": "Менеджер",
      "rank.deputy_manager": "Зам. Менеджера",
      "rank.admin": "Администратор",
      "rank.junior_admin": "Мл. Администратор",
      "rank.player": "Игрок",
    },
    en: {
      "forum.eyebrow": "Forum",
      "forum.title": "Player questions",
      "forum.lead": "Ask players and the dev team a question. A topic is created automatically as Pending — then it opens for answers after approval.",
      "forum.new": "New topic",
      "forum.newTitle": "New topic",
      "forum.f.title": "Title",
      "forum.f.tag": "Tag",
      "forum.f.body": "Your question",
      "forum.f.reply": "Your reply",
      "forum.send": "Send",
      "forum.confirm": "Confirm",
      "forum.cancel": "Cancel",
      "forum.back": "Back to list",
      "forum.hint": "New topics go to moderation first — then they appear in the list and open for replies.",
      "forum.empty": "No topics yet. Be the first to ask!",
      "forum.pendingTitle": "Pending review",
      "forum.tag.all": "All tags",
      "forum.tag.tech": "Technical",
      "forum.tag.server": "Server",
      "forum.tag.idea": "Idea / Bug",
      "forum.tag.chat": "Management",
      "forum.status.pending": "Pending",
      "forum.status.approved": "Approved",
      "forum.status.rejected": "Rejected",
      "forum.pendingNote": "Waiting for the dev team review.",
      "forum.approvedNote": "Topic approved — you can reply.",
      "forum.reasonPrefix": "Reason: ",
      "forum.replies": "replies",
      "forum.views": "views",
      "forum.approve": "Approve",
      "forum.reject": "Reject",
      "forum.rejectReason": "Rejection reason…",
      "forum.tagApply": "Apply",
      "forum.err.auth": "An account is required to ask. Sign in or sign up.",
      "forum.err.title": "Title: 4–140 characters.",
      "forum.err.tag": "Pick a tag.",
      "forum.err.body": "Question: 10–4000 characters.",
      "forum.err.bad_body": "Reply: 2–4000 characters.",
      "forum.err.bad_status": "Invalid status.",
      "forum.err.bad_tag": "Invalid tag.",
      "forum.err.bad_title": "Title: 4–140 characters.",
      "forum.err.forbidden": "Administrators only.",
      "forum.err.not_found": "Topic not found.",
      "forum.err.rate_limited": "Too many attempts. Wait a couple of minutes.",
      "forum.err.unauthorized": "Sign in required.",
      "forum.err.topic_pending": "Topic is pending. Replies open after approval.",
      "forum.err.topic_rejected": "Topic rejected. Start a new topic or resubmit.",
      "forum.err.network": "No connection to the server. Try again.",
      "forum.err.unknown": "Something went wrong. Please try again.",
      "forum.status.ok": "Topic approved.",
      "forum.status.reject.ok": "Topic rejected.",
      "forum.status.err": "Failed to update status.",
      "forum.created.ok": "Topic created — pending review.",
      "btn.account": "Sign in",
      "btn.profile": "Profile",
      "rank.owner": "Owner",
      "rank.developer": "Developer",
      "rank.manager": "Manager",
      "rank.deputy_manager": "Deputy Manager",
      "rank.admin": "Administrator",
      "rank.junior_admin": "Junior Administrator",
      "rank.player": "Player",
    },
  };

  const TAGS = [
    { id: "tech", color: "#38bdf8" },
    { id: "server", color: "#a3e635" },
    { id: "idea", color: "#fb7185" },
    { id: "chat", color: "#c4b5fd" },
  ];

  const STATUSES = ["pending", "approved", "rejected"];
  const RANKS = ["owner", "developer", "manager", "deputy_manager", "admin", "junior_admin", "player"];
  const RANK_LEVEL = { player: 0, junior_admin: 2, admin: 3, deputy_manager: 4, manager: 5, developer: 6, owner: 7 };
  const RANK_CLASS = {
    owner: "forum__rank--owner",
    developer: "forum__rank--developer",
    manager: "forum__rank--manager",
    deputy_manager: "forum__rank--deputy_manager",
    admin: "forum__rank--admin",
    junior_admin: "forum__rank--junior_admin",
    player: "forum__rank--player",
  };
  const rankLevel = (r) => RANK_LEVEL[r] || 0;

  /* =========================================================
     store / dom helpers
     ========================================================= */
  const store = {
    get(k, fallback) { try { return localStorage.getItem(k) || fallback; } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
    remove(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const els = {
    tagChips: $("#tagChips"),
    topicList: $("#topicList"),
    pendingBox: $("#pendingBox"),
    pendingList: $("#pendingList"),
    newTopicBtn: $("#newTopicBtn"),
    topicForm: $("#topicForm"),
    topicFormEl: $("#topicFormEl"),
    fTitle: $("#fTitle"),
    fTagPicker: $("#fTagPicker"),
    fBody: $("#fBody"),
    fMsg: $("#fMsg"),
    fSubmit: $("#fSubmit"),
    fCancel: $("#fCancel"),
    threadView: $("#threadView"),
    threadBack: $("#threadBack"),
    threadTag: $("#threadTag"),
    threadStatus: $("#threadStatus"),
    threadTitle: $("#threadTitle"),
    threadMeta: $("#threadMeta"),
    threadActions: $("#threadActions"),
    threadTagCtl: $("#threadTagCtl"),
    threadTagSel: $("#threadTagSel"),
    threadTagApply: $("#threadTagApply"),
    threadBanner: $("#threadBanner"),
    threadMessages: $("#threadMessages"),
    replyForm: $("#replyForm"),
    replyBody: $("#replyBody"),
    replySubmit: $("#replySubmit"),
    replyCancel: $("#replyCancel"),
    threadNote: $("#threadNote"),
    accLink: document.querySelector("[data-account]"),
    accLabel: document.querySelector("[data-account-label]"),
    accAvatar: document.querySelector("[data-account-avatar]"),
  };

  const NICK_RE = /^[A-Za-z0-9_]{3,16}$/;

  const state = {
    lang: "ru",
    tag: "all",
    fTag: "tech",
    topics: [],
    pending: [],
    user: null,
    canModerate: false,
    signedIn: false,
    activeTopicId: null,
    thread: null,
    messages: [],
    rejectingFor: null,
    busy: false,
  };

  let toastTimer = null;

  /* =========================================================
     i18n helpers
     ========================================================= */
  function t(key, vars) {
    let value = I18N[state.lang][key];
    if (value == null) value = key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) value = value.replace("{" + k + "}", v);
    }
    return value;
  }

  function applyLang() {
    const dict = I18N[state.lang];
    $$("[data-i18n]", document).forEach((el) => {
      const value = dict[el.dataset.i18n];
      if (value != null) el.textContent = value;
    });

    if (els.tagChips) {
      $$(".forum__chip", els.tagChips).forEach((chip) => {
        const active = chip.dataset.tag === state.tag;
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", String(active));
      });
    }

    if (els.fTagPicker) {
      $$(".forum__tagpicker__opt", els.fTagPicker).forEach((opt) => {
        const active = opt.dataset.tag === state.fTag;
        opt.classList.toggle("is-active", active);
        opt.setAttribute("aria-checked", String(active));
      });
    }

    const langBtn = $("#langBtn");
    if (langBtn) {
      langBtn.textContent = state.lang === "ru" ? "EN" : "RU";
      langBtn.setAttribute("aria-label", state.lang === "ru" ? "Switch to English" : "Переключить на русский");
    }

    document.title = (state.lang === "ru" ? "Форум" : "Forum") + " — Universal Client";
  }

  /* =========================================================
     сеть
     ========================================================= */
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

  function toast(text) {
    let el = $("#ucToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "ucToast";
      el.style.cssText = [
        "position:fixed", "left:50%", "bottom:28px", "transform:translate(-50%,16px)",
        "z-index:120", "padding:12px 20px", "border-radius:999px",
        "background:rgba(10,14,24,.95)", "border:1px solid rgba(255,255,255,.16)",
        "color:#eaf0ff", "font:700 14px/1.4 Manrope,system-ui,sans-serif",
        "box-shadow:0 20px 50px -20px #000", "opacity:0",
        "transition:opacity .25s ease,transform .25s ease", "pointer-events:none",
      ].join(";");
      document.body.appendChild(el);
    }
    el.textContent = text;
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translate(-50%,0)";
    });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translate(-50%,16px)";
    }, 2600);
  }

  /* =========================================================
     аккаунт-элементы шапки
     ========================================================= */
  function renderForumAccount() {
    const token = store.get("uc-token", "");
    const nick = store.get("uc-nick", "");
    const signed = Boolean(token && NICK_RE.test(nick));

    $$("[data-account]", document).forEach((link) => {
      link.classList.toggle("is-user", signed);
      const label = link.querySelector("[data-account-label]");
      const avatar = link.querySelector("[data-account-avatar]");
      if (signed) {
        if (label) label.textContent = nick;
        if (avatar) avatar.textContent = nick.charAt(0);
        link.title = t("btn.profile") + ": " + nick;
        link.setAttribute("aria-label", t("btn.profile") + ": " + nick);
      } else {
        if (label) label.textContent = t("btn.account");
        link.removeAttribute("title");
        link.removeAttribute("aria-label");
      }
    });
  }

  /* =========================================================
     загрузка пользователя и проверка модераторства
     ========================================================= */
  async function loadUser() {
    const token = store.get("uc-token", "");
    if (!token) {
      state.user = null;
      state.signedIn = false;
      state.canModerate = false;
      renderForumAccount();
      return;
    }
    try {
      const data = await api("/api/me", { token });
      state.user = data.user;
      state.signedIn = true;
      state.canModerate = rankLevel(state.user.rank) >= rankLevel("admin") || Boolean(sessionStorage.getItem("uc-admin-secret"));
      store.set("uc-nick", state.user.nickname);
      renderForumAccount();
    } catch (err) {
      state.user = null;
      state.signedIn = false;
      state.canModerate = false;
      renderForumAccount();
    }
  }

  /* =========================================================
     список тем
     ========================================================= */
  async function loadTopics() {
    const qs = "?status=approved" + (state.tag && state.tag !== "all" ? "&tag=" + encodeURIComponent(state.tag) : "");
    try {
      const data = await api("/api/forum/topics" + qs);
      state.topics = data.topics || [];
    } catch (err) {
      state.topics = [];
    }

    state.pending = [];
    if (state.canModerate) {
      const qsPending = "?status=pending" + (state.tag && state.tag !== "all" ? "&tag=" + encodeURIComponent(state.tag) : "");
      try {
        const data = await api("/api/forum/topics" + qsPending);
        state.pending = data.topics || [];
      } catch (err) {
        state.pending = [];
      }
    }
    renderForum();
  }

  function authorLine(topic) {
    const nick = topic.authorNick || "?";
    const rankKey = RANKS.includes(topic.authorRank) ? topic.authorRank : "player";
    const wrap = document.createElement("span");
    wrap.className = "forum-topic__author-info";
    const nickEl = document.createElement("span");
    nickEl.className = "forum-topic__author-nick";
    nickEl.textContent = nick;
    const rankEl = document.createElement("span");
    rankEl.className = "forum__rank " + RANK_CLASS[rankKey];
    rankEl.textContent = t("rank." + rankKey);
    wrap.append(nickEl, rankEl);
    return wrap;
  }

  function topicCard(topic) {
    const card = document.createElement("article");
    card.className = "forum-topic";
    if (topic.status === "pending") card.classList.add("forum-topic--pending");

    const badges = document.createElement("div");
    badges.className = "forum-topic__badges";

    const tagEl = document.createElement("span");
    tagEl.className = "forum__badge forum__badge--tag forum__tag--" + topic.tag;
    tagEl.textContent = t("forum.tag." + topic.tag);

    const statusEl = document.createElement("span");
    statusEl.className = "forum__badge forum__badge--" + topic.status;
    statusEl.textContent = t("forum.status." + topic.status);

    badges.append(tagEl, statusEl);

    const titleEl = document.createElement("h3");
    titleEl.className = "forum-topic__title";
    const titleBtn = document.createElement("button");
    titleBtn.type = "button";
    titleBtn.className = "forum-topic__link";
    titleBtn.textContent = topic.title;
    titleBtn.addEventListener("click", () => openThread(topic.id));
    titleEl.append(titleBtn);

    const bodyEl = document.createElement("p");
    bodyEl.className = "forum-topic__body";
    bodyEl.textContent = topic.body;

    const footer = document.createElement("div");
    footer.className = "forum-topic__footer";

    const author = document.createElement("div");
    author.className = "forum-topic__author";
    const av = document.createElement("span");
    av.className = "forum__avatar";
    av.textContent = String(topic.authorNick || "?").charAt(0).toUpperCase();
    author.append(av, authorLine(topic));

    const stats = document.createElement("div");
    stats.className = "forum-topic__stats";
    const repliesStat = document.createElement("span");
    const repliesLabel = document.createElement("span");
    repliesLabel.textContent = t("forum.replies") + ": ";
    const repliesVal = document.createElement("b");
    repliesVal.textContent = String(topic.replies ?? 0);
    repliesStat.append(repliesLabel, repliesVal);

    const viewsStat = document.createElement("span");
    const viewsLabel = document.createElement("span");
    viewsLabel.textContent = t("forum.views") + ": ";
    const viewsVal = document.createElement("b");
    viewsVal.textContent = String(topic.views ?? 0);
    viewsStat.append(viewsLabel, viewsVal);

    stats.append(repliesStat, viewsStat);
    footer.append(author, stats);

    card.append(badges, titleEl, bodyEl, footer);

    const actions = document.createElement("div");
    actions.className = "forum-topic__actions";
    card.append(actions);
    addModeration(topic, actions);

    return card;
  }

  function renderForum() {
    const list = els.topicList;
    if (list) list.innerHTML = "";
    if (!state.topics.length) {
      const empty = document.createElement("div");
      empty.className = "forum__empty";
      empty.textContent = t("forum.empty");
      if (list) list.append(empty);
    } else {
      state.topics.forEach((topic) => list.append(topicCard(topic)));
    }

    const pendingBox = els.pendingBox;
    const pendingList = els.pendingList;
    if (pendingBox && pendingList) {
      if (state.canModerate && state.pending.length) {
        pendingBox.hidden = false;
        pendingList.innerHTML = "";
        state.pending.forEach((topic) => pendingList.append(topicCard(topic)));
      } else {
        pendingBox.hidden = true;
      }
    }
  }

  /* =========================================================
     модерация: одобрить / отклонить
     ========================================================= */
  function addModeration(topic, parent) {
    if (!parent) return;
    parent.innerHTML = "";
    if (!state.canModerate || topic.status !== "pending") return;

    const row = document.createElement("div");
    row.className = "forum__mod";

    const approve = document.createElement("button");
    approve.type = "button";
    approve.className = "btn btn--primary btn--sm";
    approve.textContent = t("forum.approve");
    approve.addEventListener("click", () => {
      state.rejectingFor = null;
      setStatus(topic.id, "approved");
    });

    const reject = document.createElement("button");
    reject.type = "button";
    reject.className = "btn btn--ghost btn--sm";
    reject.textContent = t("forum.reject");
    reject.addEventListener("click", () => {
      state.rejectingFor = topic.id;
      addModeration(topic, parent);
    });

    row.append(approve, reject);

    if (state.rejectingFor === topic.id) {
      const reason = document.createElement("input");
      reason.type = "text";
      reason.className = "forum__mod__reason";
      reason.placeholder = t("forum.rejectReason");

      const confirm = document.createElement("button");
      confirm.type = "button";
      confirm.className = "btn btn--primary btn--sm";
      confirm.textContent = t("forum.confirm");
      confirm.addEventListener("click", () => {
        const val = (reason.value || "").trim();
        state.rejectingFor = null;
        setStatus(topic.id, "rejected", val);
      });

      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "btn btn--ghost btn--sm";
      cancel.textContent = t("forum.cancel");
      cancel.addEventListener("click", () => {
        state.rejectingFor = null;
        addModeration(topic, parent);
      });

      row.append(reason, confirm, cancel);
    }

    parent.append(row);
  }

  async function setStatus(id, status, reason) {
    const body = { status };
    if (status === "rejected") body.reason = reason || "";
    try {
      const data = await api("/api/forum/topics/" + id + "/status", {
        method: "POST",
        token: store.get("uc-token", ""),
        body,
      });
      if (state.activeTopicId === id) {
        const fresh = await api("/api/forum/topics/" + id);
        state.thread = fresh.topic;
        state.messages = fresh.messages || [];
        renderThread(state.thread, state.messages);
      }
      await loadTopics();
      toast(status === "approved" ? t("forum.status.ok") : t("forum.status.reject.ok"));
    } catch (err) {
      toast(err instanceof TypeError ? t("forum.err.network") : t("forum.err.unknown"));
    }
  }

  /* =========================================================
     поток: тема + сообщения
     ========================================================= */
  async function openThread(id) {
    state.activeTopicId = id;
    if (els.threadView) els.threadView.hidden = false;
    if (els.topicList) els.topicList.hidden = true;

    try {
      const data = await api("/api/forum/topics/" + id);
      state.thread = data.topic;
      state.messages = data.messages || [];
      renderThread(data.topic, data.messages);
    } catch (err) {
      if (els.threadView) els.threadView.hidden = true;
      if (els.topicList) els.topicList.hidden = false;
      toast(err instanceof TypeError ? t("forum.err.network") : t("forum.err.unknown"));
    }
  }

  function messageNode(msg, isQuestion) {
    const row = document.createElement("div");
    row.className = "forum-msg" + (isQuestion ? " forum-msg--question" : "");

    const av = document.createElement("span");
    av.className = "forum__avatar";
    av.textContent = String(msg.authorNick || "?").charAt(0).toUpperCase();

    const content = document.createElement("div");
    content.className = "forum-msg__content";

    const head = document.createElement("div");
    head.className = "forum-msg__head";
    const nick = document.createElement("span");
    nick.className = "forum-msg__nick";
    nick.textContent = msg.authorNick || "?";
    const rankKey = RANKS.includes(msg.authorRank) ? msg.authorRank : "player";
    const rank = document.createElement("span");
    rank.className = "forum__rank " + RANK_CLASS[rankKey];
    rank.textContent = t("rank." + rankKey);
    const time = document.createElement("time");
    time.className = "forum-msg__time";
    time.textContent = new Date(msg.createdAt).toLocaleString(state.lang === "ru" ? "ru-RU" : "en-GB", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
    head.append(nick, rank, time);

    const body = document.createElement("p");
    body.className = "forum-msg__body";
    body.textContent = msg.body;

    content.append(head, body);
    row.append(av, content);
    return row;
  }

  function renderThread(topic, messages) {
    if (els.threadTitle) els.threadTitle.textContent = topic.title;

    if (els.threadTag) {
      els.threadTag.className = "forum__tag forum__tag--" + topic.tag;
      els.threadTag.textContent = t("forum.tag." + topic.tag);
    }

    if (els.threadStatus) {
      els.threadStatus.className = "forum__status forum__status--" + topic.status;
      els.threadStatus.textContent = t("forum.status." + topic.status);
    }

    const metaText = [
      topic.authorNick || "?",
      t("rank." + (RANKS.includes(topic.authorRank) ? topic.authorRank : "player")),
      new Date(topic.createdAt).toLocaleDateString(state.lang === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "long", year: "numeric" }),
      String(topic.views ?? 0) + " " + t("forum.views"),
    ].join(" · ");
    if (els.threadMeta) els.threadMeta.textContent = metaText;

    if (els.threadBanner) {
      els.threadBanner.className = "forum__status-banner forum__status-banner--" + topic.status;
      els.threadBanner.innerHTML = "";
      const bTitle = document.createElement("span");
      bTitle.className = "forum__status-banner-title";
      bTitle.textContent = t("forum.status." + topic.status);
      const bText = document.createElement("p");
      let textValue = t("forum.status." + topic.status);
      if (topic.status === "pending") textValue += " — " + t("forum.pendingNote");
      if (topic.status === "rejected" && topic.reason) textValue += t("forum.reasonPrefix") + topic.reason;
      if (topic.status === "approved") textValue += " — " + t("forum.approvedNote");
      bText.textContent = textValue;
      els.threadBanner.append(bTitle, bText);
    }

    if (els.threadMessages) {
      els.threadMessages.innerHTML = "";
      (messages || []).forEach((msg, i) => {
        els.threadMessages.append(messageNode(msg, i === 0));
      });
    }

    if (els.threadActions) addModeration(topic, els.threadActions);

    if (els.threadTagCtl) {
      const sel = els.threadTagSel;
      if (sel) {
        sel.innerHTML = "";
        TAGS.forEach((tg) => {
          const opt = document.createElement("option");
          opt.value = tg.id;
          opt.textContent = t("forum.tag." + tg.id);
          sel.append(opt);
        });
        sel.value = topic.tag;
      }
    }

    if (els.replyForm) {
      const approved = topic.status === "approved" && state.signedIn;
      els.replyForm.hidden = !approved;
    }

    let note = "";
    if (topic.status === "pending") {
      const isAuthor = state.signedIn && state.user && topic.authorId && topic.authorId === state.user.id;
      note = isAuthor ? t("forum.pendingNote") : t("forum.status.pending") + " — " + t("forum.pendingNote");
    }
    if (topic.status === "rejected") {
      note = (topic.reason ? t("forum.reasonPrefix") + topic.reason : "") + t("forum.status.rejected");
    }
    if (topic.status === "approved") {
      const isAuthor = state.signedIn && state.user && topic.authorId && topic.authorId === state.user.id;
      note = isAuthor ? t("forum.approvedNote") : t("forum.status.approved");
    }
    if (els.threadNote) els.threadNote.textContent = note;
  }

  async function refreshThread() {
    if (!state.activeTopicId) return;
    try {
      const data = await api("/api/forum/topics/" + state.activeTopicId);
      state.thread = data.topic;
      state.messages = data.messages || [];
      renderThread(state.thread, state.messages);
    } catch (err) {
      /* тихо */
    }
  }

  /* =========================================================
     создание темы
     ========================================================= */
  function setMsg(el, text, kind) {
    if (!el) return;
    el.textContent = text || "";
    el.classList.toggle("is-error", kind === "error");
    el.classList.toggle("is-ok", kind === "ok");
  }

  async function createTopic(e) {
    e.preventDefault();
    if (state.busy) return;
    const title = (els.fTitle.value || "").trim();
    const text = (els.fBody.value || "").trim();
    const msg = els.fMsg;

    setMsg(msg, "", null);
    if (title.length < 4 || title.length > 140) return setMsg(msg, t("forum.err.bad_title"), "error");
    if (!state.fTag) return setMsg(msg, t("forum.err.tag"), "error");
    if (text.length < 10 || text.length > 4000) return setMsg(msg, t("forum.err.body"), "error");

    state.busy = true;
    try {
      const data = await api("/api/forum/topics", {
        method: "POST",
        token: store.get("uc-token", ""),
        body: { title, tag: state.fTag, body: text },
      });
      closeTopicForm();
      await openThread(data.topic.id);
      toast(t("forum.created.ok"));
    } catch (err) {
      setMsg(
        msg,
        err instanceof TypeError
          ? t("forum.err.network")
          : I18N[state.lang]["forum.err." + (err && err.code)]
            ? t("forum.err." + err.code)
            : t("forum.err.unknown"),
        "error"
      );
    } finally {
      state.busy = false;
    }
  }

  function closeTopicForm() {
    if (els.topicForm) els.topicForm.hidden = true;
    if (els.fTitle) els.fTitle.value = "";
    if (els.fBody) els.fBody.value = "";
    if (els.fMsg) setMsg(els.fMsg, "", null);
  }

  /* =========================================================
     ответ
     ========================================================= */
  async function sendReply(e) {
    e.preventDefault();
    if (state.busy || !state.thread) return;
    const text = (els.replyBody.value || "").trim();
    if (text.length < 2) {
      if (els.threadNote) {
        els.threadNote.textContent = t("forum.err.bad_body");
        els.threadNote.classList.add("is-error");
      }
      return;
    }
    state.busy = true;
    try {
      const data = await api("/api/forum/topics/" + state.thread.id + "/reply", {
        method: "POST",
        token: store.get("uc-token", ""),
        body: { body: text },
      });
      state.thread = data.topic;
      state.messages = data.messages || [];
      if (els.replyBody) els.replyBody.value = "";
      await refreshThread();
      toast(t("forum.status.ok"));
    } catch (err) {
      if (els.threadNote) {
        let text = t("forum.err.network");
        if (err && err.code === "topic_pending") text = t("forum.err.topic_pending");
        if (err && err.code === "topic_rejected") text = t("forum.err.topic_rejected");
        if (err && err.code === "bad_body") text = t("forum.err.bad_body");
        els.threadNote.textContent = text;
        els.threadNote.classList.add("is-error");
      }
    } finally {
      state.busy = false;
    }
  }

  /* =========================================================
     события
     ========================================================= */
  function bindEvents() {
    if (els.tagChips) {
      els.tagChips.addEventListener("click", (e) => {
        const chip = e.target instanceof Element ? e.target.closest(".forum__chip") : null;
        if (!chip) return;
        state.tag = chip.dataset.tag || "all";
        loadTopics();
      });
    }

    if (els.newTopicBtn) {
      els.newTopicBtn.addEventListener("click", () => {
        if (!state.signedIn) {
          toast(t("forum.err.auth"));
          return;
        }
        if (els.topicForm) els.topicForm.hidden = false;
      });
    }

    if (els.fCancel) {
      els.fCancel.addEventListener("click", () => closeTopicForm());
    }

    if (els.topicFormEl) {
      els.topicFormEl.addEventListener("submit", createTopic);
    }

    if (els.replyCancel) {
      els.replyCancel.addEventListener("click", () => {
        if (els.replyForm) els.replyForm.hidden = true;
        if (els.replyBody) els.replyBody.value = "";
      });
    }

    if (els.replyForm) {
      els.replyForm.addEventListener("submit", sendReply);
    }

    if (els.threadBack) {
      els.threadBack.addEventListener("click", () => {
        state.activeTopicId = null;
        state.thread = null;
        state.messages = [];
        if (els.threadView) els.threadView.hidden = true;
        if (els.topicList) els.topicList.hidden = false;
        loadTopics();
      });
    }

    if (els.threadTagApply) {
      els.threadTagApply.addEventListener("click", async () => {
        const sel = els.threadTagSel;
        if (!sel || !state.thread) return;
        const tag = sel.value;
        if (!TAGS.some((t2) => t2.id === tag)) return;
        try {
          const data = await api("/api/forum/topics/" + state.thread.id + "/tag", {
            method: "POST",
            token: store.get("uc-token", ""),
            body: { tag },
          });
          state.thread = data.topic;
          const fresh = await api("/api/forum/topics/" + state.thread.id);
          state.thread = fresh.topic;
          state.messages = fresh.messages || [];
          renderThread(state.thread, state.messages);
          await loadTopics();
          toast(t("forum.status.ok"));
        } catch (err) {
          toast(err instanceof TypeError ? t("forum.err.network") : t("forum.err.unknown"));
        }
      });
    }

    if (els.fTagPicker) {
      els.fTagPicker.addEventListener("click", (e) => {
        const opt = e.target instanceof Element ? e.target.closest(".forum__tagpicker__opt") : null;
        if (!opt) return;
        state.fTag = opt.dataset.tag || "tech";
        $$(".forum__tagpicker__opt", els.fTagPicker).forEach((o) => {
          const active = o.dataset.tag === state.fTag;
          o.classList.toggle("is-active", active);
          o.setAttribute("aria-checked", String(active));
        });
      });
    }
  }

  /* =========================================================
     boot
     ========================================================= */
  async function boot() {
    applyLang();
    await loadUser();
    bindEvents();
    await loadTopics();
  }

  boot();
})();
