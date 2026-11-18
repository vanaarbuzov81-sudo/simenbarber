/* =========================================================
   SIMEN SSSS — script.js
   Окна открываются через CSS (:target) по адресу #id.
   Скрипт добавляет: бургер, Esc / клик по фону, tilt,
   появление hero, форму записи.
   ========================================================= */
(function () {
  "use strict";

  const TG_URL = "https://t.me/simen_Ssss";

  /* ---------- 1. БУРГЕР-МЕНЮ (мобильное) ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    burger.classList.toggle("is-active", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    document.body.classList.toggle("menu-open", open);
  }

  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));

  // Клик по пункту меню закрывает мобильное меню (окно откроется само по #якорю)
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });

  // Расширили окно до десктопа — сбрасываем состояние меню
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) setMenu(false);
  });

  /* ---------- 2. МОДАЛЬНЫЕ ОКНА ---------- */
  // Какое окно открыто сейчас — определяем по адресу (#about, #services ...)
  const modals = Array.from(document.querySelectorAll(".modal"));

  function currentModal() {
    const id = location.hash.slice(1);
    return modals.find((m) => m.id === id) || null;
  }

  // Закрыть окно = вернуться на #hero
  function closeModal() {
    if (currentModal()) location.hash = "#hero";
  }

  // При открытии: прокрутка окна наверх и фокус на крестик (для клавиатуры)
  function onModalOpen() {
    const m = currentModal();
    if (!m) return;
    m.scrollTop = 0;
    const close = m.querySelector(".modal__close");
    if (close) close.focus({ preventScroll: true });
  }

  window.addEventListener("hashchange", () => {
    setMenu(false);
    onModalOpen();
  });
  onModalOpen(); // если страницу открыли сразу с #services

  // Esc закрывает меню и окно
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setMenu(false);
      closeModal();
    }
  });

  // Клик по тёмному фону вокруг содержимого закрывает окно
  modals.forEach((m) => {
    m.addEventListener("click", (e) => {
      if (e.target === m || e.target.classList.contains("container")) closeModal();
    });
  });

  /* ---------- 3. ХЕДЕР: фон при скролле ---------- */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 4. TILT-ЭФФЕКТ КАРТОЧЕК ---------- */
  // Только для устройств с мышью
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (canHover) {
    const MAX_TILT = 12; // максимальный угол наклона, градусы

    document.querySelectorAll("[data-tilt]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;  // -0.5 … 0.5
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = "border-color .3s, box-shadow .3s"; // transform без задержки
        el.style.transform =
          `perspective(900px) rotateX(${-y * MAX_TILT * 2}deg) rotateY(${x * MAX_TILT * 2}deg) translateZ(10px)`;
      });

      el.addEventListener("mouseleave", () => {
        // Плавный возврат в исходное положение
        el.style.transition = "transform .5s ease, border-color .3s, box-shadow .3s";
        el.style.transform = "";
      });
    });
  }

  /* ---------- 5. ПОЯВЛЕНИЕ HERO (Intersection Observer) ---------- */
  const heroReveal = document.querySelectorAll(".hero .reveal");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    heroReveal.forEach((el, i) => {
      el.style.transitionDelay = `${i * 120}ms`;
      io.observe(el);
    });
  } else {
    heroReveal.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- 6. ФОРМА ЗАПИСИ ---------- */
  const form = document.getElementById("bookingForm");
  const errorBox = document.getElementById("formError");
  const dateInput = document.getElementById("date");

  // Нельзя выбрать прошедшую дату
  const now = new Date();
  dateInput.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll("input[required], select[required]").forEach((f) => {
      const empty = !f.value.trim();
      f.classList.toggle("is-invalid", empty);
      if (empty) valid = false;
    });

    // Телефон: минимум 10 цифр
    const phone = form.elements["phone"];
    if (phone.value.replace(/\D/g, "").length < 10) {
      phone.classList.add("is-invalid");
      valid = false;
    }

    if (!valid) {
      errorBox.textContent = "Пожалуйста, заполни все поля корректно.";
      errorBox.hidden = false;
      return;
    }
    errorBox.hidden = true;

    // Успех: alert + переход в Telegram в новой вкладке
    alert("Заявка отправлена! Сейчас перенаправим в Telegram");
    window.open(TG_URL, "_blank", "noopener,noreferrer");
    form.reset();
    closeModal();
  });

  // Снимаем подсветку ошибки при вводе
  form.addEventListener("input", (e) => e.target.classList.remove("is-invalid"));

  /* ---------- 7. ГОД В ФУТЕРЕ ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
