/* Universal Client — site behaviour */
(() => {
  "use strict";

  /* ============ i18n ============ */

  const I18N = {
    ru: {
      "nav.features": "Возможности",
      "nav.gallery": "Скриншоты",
      "nav.themes": "Темы",
      "nav.pricing": "Тарифы",
      "nav.install": "Установка",
      "nav.faq": "FAQ",

      "btn.downloadClient": "Скачать лаунчер",
      "btn.downloadExe": "Скачать UniversalClient-7.0.0.exe",
      "btn.buy": "Купить",
      "btn.choosePlan": "Выбрать тариф",
      "btn.free": "Скачать бесплатно",
      "btn.comparePlans": "Сравнить тарифы",

      "hero.pill": "v7.0.0 · Windows 10 / 11",
      "hero.title": "Minecraft,<br>который выглядит<br><span class=\"grad\">как твой</span>",
      "hero.lead": "Шесть цветовых тем, фирменное оформление самой игры и серверы в один клик. Скачал, активировал, играешь.",
      "hero.meta1": "Windows 10 / 11",
      "hero.meta2": "≈ 70 МБ",
      "hero.meta3": "Java внутри",
      "hero.meta4": "есть Free-тариф",
      "hero.caption": "Тема меняется вместе с сайтом — попробуй переключатель вверху.",

      "feat.eyebrow": "Возможности",
      "feat.title": "Всё, что нужно, — в одном окне",
      "feat.lead": "Лаунчер, оформление и запуск игры собраны в один аккуратный клиент. Без модов, без бубна.",

      "f1.title": "Шесть тем и свой цвет",
      "f1.text": "Янтарь, фиолетовый, океан, роза, изумруд, закат — или любой свой акцент. Применяется мгновенно и запоминается.",
      "f2.title": "Оформление для самой игры",
      "f2.text": "Фирменный ресурспак Rounded UI перекрашивает меню, кнопки, хотбар и панораму Minecraft под выбранную тему.",
      "f3.title": "Версии 1.19 — 1.21.11",
      "f3.text": "Выбери версию — файлы скачаются сами при первом запуске. Никаких ручных установок и библиотек.",
      "f4.title": "Серверы в один клик",
      "f4.text": "Избранные серверы с онлайном, пингом и MOTD. Кнопка «Играть» запускает игру и сразу заходит на сервер.",
      "f5.title": "Discord Rich Presence",
      "f5.text": "Друзья видят версию, ник и время в игре. Ничего настраивать не нужно — достаточно запущенного Discord.",
      "f6.title": "Профиль и статистика",
      "f6.text": "Запуски, время в игре, UUID, несколько профилей и галерея скриншотов — всё на своём месте.",

      "gallery.eyebrow": "Интерфейс",
      "gallery.title": "Каждый экран продуман",
      "gallery.lead": "Никаких стандартных окон JavaFX: своя типографика, стеклянные панели и живой фон.",
      "gallery.cap1": "Версии",
      "gallery.cap2": "Серверы",
      "gallery.cap3": "Оформление",
      "gallery.cap4": "Профиль",
      "gallery.cap5": "Настройки",
      "gallery.cap6": "Скриншоты",
      "gallery.cap7": "О программе",
      "gallery.note": "Скриншоты меняются сами — или листай стрелками. На снимках тема «Роза».",

      "themes.eyebrow": "Темы",
      "themes.title": "Одна установка — шесть настроений",
      "themes.lead": "Тема меняет акценты лаунчера и оформление Minecraft. Выбери цвет — сайт перекрасится вместе с клиентом.",
      "themes.note": "Плюс «Свой цвет»: любой оттенок в HEX — лаунчер подберёт к нему градиенты сам.",

      "t.amber": "Янтарь",
      "t.purple": "Фиолетовый",
      "t.ocean": "Океан",
      "t.rose": "Роза",
      "t.emerald": "Изумруд",
      "t.sunset": "Закат",

      "price.eyebrow": "Тарифы",
      "price.title": "Free и три срока подписки",
      "price.lead": "Free — чтобы попробовать. Платные тарифы добавляют оформление Minecraft, все темы и Discord RPC.",
      "price.note": "Оплата картой РФ или через СБП. Ключ активируется в лаунчере сразу после оплаты.",

      "plan.term0": "Бесплатно",
      "plan.term1": "1 месяц",
      "plan.term2": "6 месяцев",
      "plan.term3": "12 месяцев",
      "plan.per0": "Навсегда",
      "plan.per1": "Попробовать без обязательств",
      "plan.per2": "198 ₽ в месяц",
      "plan.per3": "166 ₽ в месяц",
      "plan.save2": "−20%",
      "plan.save3": "−33%",
      "plan.badge": "Выгоднее всего",
      "plan.f1": "Все шесть тем и свой цвет",
      "plan.f2": "Оформление Minecraft (Rounded UI)",
      "plan.f3": "Версии 1.19 — 1.21.11",
      "plan.f4": "Серверы, Discord RPC, профиль",
      "plan.f5": "Обновления в течение срока",
      "plan.free2": "Серверы и профиль",
      "plan.free3": "Одна тема на выбор",
      "plan.free5": "Discord RPC",

      "install.eyebrow": "Установка",
      "install.title": "Три шага до игры",
      "install.lead": "От скачивания до первого блока — меньше минуты. Java ставить не нужно.",
      "s1.title": "Скачай установщик",
      "s1.text": "Около 70 МБ, никаких архивов и распаковок. Установщик лежит на нашем сервере.",
      "s2.title": "Выбери тариф и оплати",
      "s2.text": "Картой или через СБП. Ключ доступа придёт сразу после оплаты — его нужно ввести в лаунчере.",
      "s3.title": "Войди и играй",
      "s3.text": "Введи ник или выбери профиль, укажи версию — клиент сам скачает файлы и поставит оформление.",

      "faq.eyebrow": "FAQ",
      "faq.title": "Частые вопросы",
      "q1": "Как проходит оплата?",
      "a1": "Картой РФ или через СБП. После оплаты вы получаете ключ доступа и вводите его в лаунчере — доступ открывается сразу.",
      "q2": "Чем Free отличается от платных тарифов?",
      "a2": "Free — базовый доступ: все версии, серверы, профиль и одна тема. Платные тарифы добавляют оформление Minecraft, все шесть тем, свой цвет и Discord RPC, а между собой отличаются только сроком.",
      "q3": "На скольких компьютерах можно играть?",
      "a3": "Ключ рассчитан на один компьютер. Если меняешь ПК — напиши в поддержку, ключ перенесут.",
      "q4": "Нужен ли аккаунт Minecraft?",
      "a4": "Для одиночной игры и серверов без проверки — нет, достаточно ника. Для серверов с лицензионной проверкой понадобится официальный аккаунт Microsoft.",
      "q5": "Антивирус ругается. Это нормально?",
      "a5": "Установщик не подписан платным сертификатом, поэтому SmartScreen может показать «Неизвестный издатель». Это обычная ситуация для небольших проектов. Клиент не трогает файлы вне своей папки и не содержит майнеров.",
      "q6": "Можно ли вернуть деньги?",
      "a6": "Да, в течение 24 часов после оплаты, если клиент ещё не запускался. Напиши в поддержку — вернём без вопросов.",

      "cta.title": "Готов зайти по-своему?",
      "cta.text": "Скачай лаунчер, выбери срок и активируй ключ. Настройка занимает пару минут.",
      "cta.p1": "Ключ сразу после оплаты",
      "cta.p2": "Карта РФ и СБП",
      "cta.p3": "Обновления включены",

      "footer.tagline": "Лаунчер Minecraft с характером",
      "footer.legal": "Не связан с Mojang Studios и Microsoft. Minecraft — торговая марка Mojang Studios.",

      "buy.toast": "Ссылка на оплату скоро появится",
      "download.toast": "Ссылка на скачивание скоро появится",
      "alt.hero": "Главный экран Universal Client"
    },

    en: {
      "nav.features": "Features",
      "nav.gallery": "Screenshots",
      "nav.themes": "Themes",
      "nav.pricing": "Pricing",
      "nav.install": "Install",
      "nav.faq": "FAQ",

      "btn.downloadClient": "Download launcher",
      "btn.downloadExe": "Download UniversalClient-7.0.0.exe",
      "btn.buy": "Buy",
      "btn.choosePlan": "Choose a plan",
      "btn.free": "Download free",
      "btn.comparePlans": "Compare plans",

      "hero.pill": "v7.0.0 · Windows 10 / 11",
      "hero.title": "Minecraft,<br>that looks<br><span class=\"grad\">like yours</span>",
      "hero.lead": "Six color themes, a matching skin for the game itself and one-click servers. Download, activate, play.",
      "hero.meta1": "Windows 10 / 11",
      "hero.meta2": "~70 MB",
      "hero.meta3": "Java bundled",
      "hero.meta4": "free plan included",
      "hero.caption": "The theme follows the site — try the switcher up top.",

      "feat.eyebrow": "Features",
      "feat.title": "Everything you need in one window",
      "feat.lead": "Launcher, styling and game launch in one tidy client. No mods, no fiddling.",

      "f1.title": "Six themes and a custom color",
      "f1.text": "Amber, purple, ocean, rose, emerald, sunset — or any accent of your own. Applied instantly and remembered.",
      "f2.title": "A skin for the game itself",
      "f2.text": "The Rounded UI resource pack repaints Minecraft's menus, buttons, hotbar and panorama to match your theme.",
      "f3.title": "Versions 1.19 — 1.21.11",
      "f3.text": "Pick a version and the files download themselves on first launch. No manual setup, no libraries.",
      "f4.title": "Servers in one click",
      "f4.text": "Saved servers with live player count, ping and MOTD. \u201cPlay\u201d starts the game and joins the server right away.",
      "f5.title": "Discord Rich Presence",
      "f5.text": "Friends see your version, nickname and play time. Nothing to configure — just keep Discord running.",
      "f6.title": "Profile and stats",
      "f6.text": "Launches, play time, UUID, multiple profiles and a screenshot gallery — all where you expect them.",

      "gallery.eyebrow": "Interface",
      "gallery.title": "Every screen is thought through",
      "gallery.lead": "No stock JavaFX windows: custom typography, glass panels and a living background.",
      "gallery.cap1": "Versions",
      "gallery.cap2": "Servers",
      "gallery.cap3": "Appearance",
      "gallery.cap4": "Profile",
      "gallery.cap5": "Settings",
      "gallery.cap6": "Screenshots",
      "gallery.cap7": "About",
      "gallery.note": "Screenshots rotate by themselves — or use the arrows. Shown in the \u201cRose\u201d theme.",

      "themes.eyebrow": "Themes",
      "themes.title": "One install, six moods",
      "themes.lead": "A theme changes the launcher accents and the in-game styling. Pick a color — the site repaints along with the client.",
      "themes.note": "Plus \u201cCustom color\u201d: any HEX shade, and the launcher derives the gradients itself.",

      "t.amber": "Amber",
      "t.purple": "Purple",
      "t.ocean": "Ocean",
      "t.rose": "Rose",
      "t.emerald": "Emerald",
      "t.sunset": "Sunset",

      "price.eyebrow": "Pricing",
      "price.title": "Free plus three subscription terms",
      "price.lead": "Free is there to try it out. Paid plans add Minecraft styling, all six themes and Discord RPC.",
      "price.note": "Pay by Russian card or SBP. The key activates in the launcher right after payment.",

      "plan.term0": "Free",
      "plan.term1": "1 month",
      "plan.term2": "6 months",
      "plan.term3": "12 months",
      "plan.per0": "Forever",
      "plan.per1": "Try it with no strings attached",
      "plan.per2": "198 ₽ per month",
      "plan.per3": "166 ₽ per month",
      "plan.save2": "20% off",
      "plan.save3": "33% off",
      "plan.badge": "Best value",
      "plan.f1": "All six themes and a custom color",
      "plan.f2": "Minecraft styling (Rounded UI)",
      "plan.f3": "Versions 1.19 — 1.21.11",
      "plan.f4": "Servers, Discord RPC, profile",
      "plan.f5": "Updates for the whole term",
      "plan.free2": "Servers and profile",
      "plan.free3": "One theme of your choice",
      "plan.free5": "Discord RPC",

      "install.eyebrow": "Install",
      "install.title": "Three steps to play",
      "install.lead": "From download to your first block in under a minute. No Java required.",
      "s1.title": "Download the installer",
      "s1.text": "About 70 MB, no archives to unpack. The installer is hosted on our own server.",
      "s2.title": "Pick a plan and pay",
      "s2.text": "By card or SBP. Your access key arrives right after payment — enter it in the launcher.",
      "s3.title": "Sign in and play",
      "s3.text": "Type a nickname or pick a profile, choose a version — the client downloads everything and applies the styling.",

      "faq.eyebrow": "FAQ",
      "faq.title": "Common questions",
      "q1": "How does payment work?",
      "a1": "By Russian card or SBP. After payment you get an access key and enter it in the launcher — access opens immediately.",
      "q2": "How is Free different from the paid plans?",
      "a2": "Free is the basic tier: all versions, servers, your profile and one theme. Paid plans add Minecraft styling, all six themes, a custom color and Discord RPC, and differ from each other only by term.",
      "q3": "How many computers can I use?",
      "a3": "A key covers one computer. If you change PCs, contact support and the key will be moved.",
      "q4": "Do I need a Minecraft account?",
      "a4": "For single player and servers without auth — no, a nickname is enough. Servers with license checks require an official Microsoft account.",
      "q5": "My antivirus complains. Is that normal?",
      "a5": "The installer isn't signed with a paid certificate, so SmartScreen may warn about an \u201cUnknown publisher\u201d. That's normal for small projects. The client doesn't touch files outside its own folder and contains no miners.",
      "q6": "Can I get a refund?",
      "a6": "Yes, within 24 hours of payment if the client hasn't been launched yet. Contact support and we'll refund it, no questions asked.",

      "cta.title": "Ready to play it your way?",
      "cta.text": "Download the launcher, pick a term and activate your key. Setup takes a couple of minutes.",
      "cta.p1": "Key right after payment",
      "cta.p2": "Card and SBP",
      "cta.p3": "Updates included",

      "footer.tagline": "A Minecraft launcher with character",
      "footer.legal": "Not affiliated with Mojang Studios or Microsoft. Minecraft is a trademark of Mojang Studios.",

      "buy.toast": "The payment link is coming soon",
      "download.toast": "The download link is coming soon",
      "alt.hero": "Universal Client home screen"
    }
  };

  const THEMES = ["amber", "purple", "ocean", "rose", "emerald", "sunset"];

  const store = {
    get(key, fallback) {
      try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }
  };

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ============ theme ============ */

  const heroImg = $("#heroShot");
  let currentTheme = store.get("uc-theme", "emerald");
  if (!THEMES.includes(currentTheme)) currentTheme = "emerald";

  function heroSrc(theme) {
    return "assets/img/home-" + theme + ".png";
  }

  function applyTheme(theme, animate) {
    currentTheme = theme;
    root.dataset.theme = theme;
    store.set("uc-theme", theme);

    $$("[data-set-theme]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.setTheme === theme);
      btn.setAttribute("aria-pressed", String(btn.dataset.setTheme === theme));
    });

    if (heroImg) {
      const next = heroSrc(theme);
      if (!heroImg.getAttribute("src").endsWith(next)) {
        if (animate === false) {
          heroImg.src = next;
        } else {
          heroImg.classList.add("is-swapping");
          const img = new Image();
          img.onload = () => {
            heroImg.src = next;
            requestAnimationFrame(() => heroImg.classList.remove("is-swapping"));
          };
          img.onerror = () => heroImg.classList.remove("is-swapping");
          img.src = next;
        }
      }
    }

    const label = $(".hero__caption .kbd");
    if (label) label.textContent = I18N[lang]["t." + theme];
  }

  $$("[data-set-theme]").forEach((btn) => {
    btn.addEventListener("click", () => applyTheme(btn.dataset.setTheme));
  });

  /* ============ language ============ */

  let lang = store.get("uc-lang", "ru");
  if (!I18N[lang]) lang = "ru";

  function applyLang(next) {
    lang = next;
    root.lang = next;
    store.set("uc-lang", next);

    const dict = I18N[next];

    $$("[data-i18n]").forEach((el) => {
      const value = dict[el.dataset.i18n];
      if (value != null) el.textContent = value;
    });

    $$("[data-i18n-html]").forEach((el) => {
      const value = dict[el.dataset.i18nHtml];
      if (value != null) el.innerHTML = value;
    });

    $$("[data-i18n-alt]").forEach((el) => {
      const value = dict[el.dataset.i18nAlt];
      if (value != null) el.alt = value;
    });

    $$(".swatch").forEach((btn) => {
      const name = dict["t." + btn.dataset.setTheme];
      if (name) {
        btn.title = name;
        btn.setAttribute("aria-label", name);
      }
    });

    const langBtn = $("#langBtn");
    if (langBtn) {
      langBtn.textContent = next === "ru" ? "EN" : "RU";
      langBtn.setAttribute("aria-label", next === "ru" ? "Switch to English" : "Переключить на русский");
    }

    const label = $(".hero__caption .kbd");
    if (label) label.textContent = dict["t." + currentTheme];

    if (typeof syncSliderLabels === "function") syncSliderLabels();
  }

  const langBtn = $("#langBtn");
  if (langBtn) {
    langBtn.addEventListener("click", () => applyLang(lang === "ru" ? "en" : "ru"));
  }

  /* ============ header ============ */

  const header = $("#header");
  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const nav = $("#nav");
  const burger = $("#burger");

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.classList.remove("is-open");
  }

  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      burger.classList.toggle("is-open", open);
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", closeNav));
  }

  /* ============ reveal ============ */

  const revealEls = $$(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    $$(".cards, .themes, .steps, .plans").forEach((group) => {
      $$(".reveal", group).forEach((el, i) => {
        el.style.transitionDelay = Math.min(i, 6) * 55 + "ms";
      });
    });

    revealEls.forEach((el) => io.observe(el));
  }

  /* ============ lightbox ============ */

  const lightbox = $("#lightbox");
  const lbImg = $("#lightboxImg");
  const lbCap = $("#lightboxCap");
  const items = $$(".slide");
  let lbIndex = 0;

  function openLightbox(index) {
    if (!lightbox || !items.length) return;
    lbIndex = (index + items.length) % items.length;
    const item = items[lbIndex];
    lbImg.src = item.dataset.full;
    lbImg.alt = item.querySelector("img").alt;
    const key = item.dataset.cap;
    lbCap.textContent = I18N[lang][key] || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    $("#lightboxClose").focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (items[lbIndex]) items[lbIndex].focus();
  }

  items.forEach((item, i) => item.addEventListener("click", () => openLightbox(i)));

  if (lightbox) {
    $("#lightboxClose").addEventListener("click", closeLightbox);
    $("#lightboxPrev").addEventListener("click", () => openLightbox(lbIndex - 1));
    $("#lightboxNext").addEventListener("click", () => openLightbox(lbIndex + 1));
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") openLightbox(lbIndex - 1);
      if (e.key === "ArrowRight") openLightbox(lbIndex + 1);
    });
  }

  /* ============ gallery slider ============ */

  const slider = $("#slider");
  const track = $("#sliderTrack");
  const dotsBox = $("#sliderDots");
  const AUTO_MS = 4800;
  let slideIndex = 0;
  let autoTimer = null;
  let hovered = false;

  function dots() {
    return dotsBox ? $$(".slider__dot", dotsBox) : [];
  }

  function syncDots() {
    dots().forEach((dot, i) => {
      dot.classList.toggle("is-active", i === slideIndex);
      dot.setAttribute("aria-current", i === slideIndex ? "true" : "false");
    });
  }

  function goTo(index) {
    if (!track || !items.length) return;
    slideIndex = (index + items.length) % items.length;
    track.style.transform = "translateX(-" + slideIndex * 100 + "%)";

    items.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === slideIndex);
      slide.setAttribute("aria-hidden", i === slideIndex ? "false" : "true");
      slide.tabIndex = i === slideIndex ? 0 : -1;
    });

    syncDots();
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function startAuto() {
    stopAuto();
    if (reduceMotion) return;
    autoTimer = setInterval(() => {
      if (hovered) return;
      if (lightbox && !lightbox.hidden) return;
      if (document.hidden) return;
      goTo(slideIndex + 1);
    }, AUTO_MS);
  }

  function buildDots() {
    if (!dotsBox) return;
    dotsBox.innerHTML = "";
    items.forEach((slide, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider__dot";
      dot.setAttribute("aria-label", i + 1 + " / " + items.length);
      dot.addEventListener("click", () => {
        goTo(i);
        startAuto();
      });
      dotsBox.appendChild(dot);
    });
    syncDots();
  }

  function syncSliderLabels() {
    const dict = I18N[lang];
    const prev = $("#sliderPrev");
    const next = $("#sliderNext");
    if (prev) prev.setAttribute("aria-label", lang === "ru" ? "Предыдущий скриншот" : "Previous screenshot");
    if (next) next.setAttribute("aria-label", lang === "ru" ? "Следующий скриншот" : "Next screenshot");
    if (slider) slider.setAttribute("aria-label", dict["gallery.title"]);
  }

  if (slider && track && items.length) {
    buildDots();
    goTo(0);

    const prev = $("#sliderPrev");
    const next = $("#sliderNext");
    if (prev) prev.addEventListener("click", () => { goTo(slideIndex - 1); startAuto(); });
    if (next) next.addEventListener("click", () => { goTo(slideIndex + 1); startAuto(); });

    slider.addEventListener("mouseenter", () => { hovered = true; });
    slider.addEventListener("mouseleave", () => { hovered = false; });
    slider.addEventListener("focusin", () => { hovered = true; });
    slider.addEventListener("focusout", () => { hovered = false; });
    document.addEventListener("visibilitychange", () => { hovered = document.hidden; });

    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { goTo(slideIndex - 1); e.preventDefault(); }
      if (e.key === "ArrowRight") { goTo(slideIndex + 1); e.preventDefault(); }
    });

    let touchX = null;
    slider.addEventListener("touchstart", (e) => {
      touchX = e.touches[0].clientX;
    }, { passive: true });
    slider.addEventListener("touchend", (e) => {
      if (touchX == null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 45) goTo(slideIndex + (dx < 0 ? 1 : -1));
      touchX = null;
    });

    startAuto();
  }

  /* ============ toast ============ */

  let toastTimer = null;

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
        "transition:opacity .25s ease,transform .25s ease", "pointer-events:none"
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

  /* ============ buy / download buttons ============ */

  function placeholderLink(link, key) {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") {
        e.preventDefault();
        toast(I18N[lang][key]);
      }
    });
  }

  $$("[data-buy]").forEach((link) => placeholderLink(link, "buy.toast"));
  $$("[data-download]").forEach((link) => placeholderLink(link, "download.toast"));

  /* ============ boot ============ */

  applyLang(lang);
  applyTheme(currentTheme, false);

  window.addEventListener("load", () => {
    THEMES.forEach((theme) => {
      if (theme === currentTheme) return;
      const img = new Image();
      img.src = heroSrc(theme);
    });
  });
})();
