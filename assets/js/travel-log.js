(() => {
  const root = document.querySelector("[data-travel-log]");
  if (!root) return;

  const gate = document.getElementById("travel-gate");
  const journal = document.getElementById("travel-journal");
  const form = document.getElementById("travel-unlock-form");
  const passwordInput = document.getElementById("travel-password");
  const passwordToggle = document.getElementById("travel-password-toggle");
  const unlockButton = document.getElementById("travel-unlock-button");
  const lockButton = document.getElementById("travel-lock-button");
  const status = document.getElementById("travel-gate-status");
  const entryGrid = document.getElementById("travel-entry-grid");
  const emptyState = document.getElementById("travel-journal-empty");
  const dataNode = document.getElementById("travel-log-data");
  const lightbox = document.getElementById("travel-lightbox");
  const lightboxImage = document.getElementById("travel-lightbox-image");
  const lightboxCaption = document.getElementById("travel-lightbox-caption");
  const lightboxClose = document.getElementById("travel-lightbox-close");
  const expectedPassword = root.dataset.password || "";
  const baseUrl = (root.dataset.baseurl || "").replace(/\/$/, "");
  let entries = [];
  let lightboxTrigger = null;

  try {
    entries = JSON.parse(dataNode?.textContent || "[]");
    if (!Array.isArray(entries)) entries = [];
  } catch (error) {
    console.error("Travel journal data is not valid JSON", error);
    entries = [];
  }

  const makeElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = text;
    return element;
  };

  const localized = (value) => {
    if (value === undefined || value === null) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (typeof value === "object") {
      return String(value.zh ?? Object.values(value).find((item) => typeof item === "string") ?? "");
    }
    return "";
  };

  const formatDate = (value) => {
    if (!value) return "";
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
    if (!match) return String(value);
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const resolvePhotoPath = (path) => {
    try {
      const value = String(path);
      if (value.startsWith("/assets/")) return new URL(`${baseUrl}${value}`, window.location.origin).href;
      return new URL(value, document.baseURI).href;
    } catch (error) {
      return "";
    }
  };

  const openLightbox = (source, alt, caption, trigger) => {
    if (!source) return;
    lightboxTrigger = trigger;
    lightboxImage.src = source;
    lightboxImage.alt = alt;
    lightboxCaption.textContent = caption;
    lightboxCaption.hidden = !caption;
    lightbox.hidden = false;
    document.body.classList.add("travel-lightbox-open");
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    lightboxImage.removeAttribute("src");
    lightboxCaption.textContent = "";
    document.body.classList.remove("travel-lightbox-open");
    lightboxTrigger?.focus();
    lightboxTrigger = null;
  };

  const renderPhoto = (photo, photoIndex) => {
    const button = makeElement("button", "travel-photo");
    button.type = "button";
    button.setAttribute("aria-label", `${root.dataset.photoLabel} ${photoIndex + 1}`);
    const source = resolvePhotoPath(photo?.file || photo?.src || photo);
    const alt = localized(photo?.alt) || root.dataset.photoLabel;
    const caption = localized(photo?.caption);
    const image = makeElement("img", "travel-photo__image");
    image.src = source;
    image.alt = alt;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      button.disabled = true;
      button.classList.add("travel-photo--error");
      button.replaceChildren(makeElement("span", "", root.dataset.photoError));
    });
    button.append(image);
    button.addEventListener("click", () => openLightbox(source, alt, caption, button));
    return button;
  };

  const renderEntry = (entry) => {
    const card = makeElement("article", "travel-entry");
    const header = makeElement("header", "travel-entry__header");
    const dateLine = makeElement("div", "travel-entry__date");
    const dateText = formatDate(entry.date);
    if (dateText) dateLine.append(makeElement("span", "", dateText));
    if (entry.time) dateLine.append(makeElement("span", "travel-entry__time", String(entry.time)));
    if (dateLine.childElementCount) header.append(dateLine);

    const location = localized(entry.location);
    if (location) {
      const locationLine = makeElement("p", "travel-entry__location");
      const icon = makeElement("i", "fa-solid fa-location-dot");
      icon.setAttribute("aria-hidden", "true");
      locationLine.append(icon, document.createTextNode(` ${location}`));
      header.append(locationLine);
    }
    if (header.childElementCount) card.append(header);

    const title = localized(entry.title);
    if (title) card.append(makeElement("h2", "travel-entry__title", title));
    const text = localized(entry.text);
    if (text) card.append(makeElement("p", "travel-entry__text", text));

    const photos = Array.isArray(entry.photos) ? entry.photos : [];
    if (photos.length) {
      const photoGrid = makeElement("div", "travel-photo-grid");
      photoGrid.dataset.count = String(Math.min(photos.length, 4));
      photoGrid.append(...photos.map((photo, index) => renderPhoto(photo, index)));
      card.append(photoGrid);
    }

    return card;
  };

  const releaseDecryptedContent = () => {
    closeLightbox();
    entryGrid.replaceChildren();
  };

  const showJournal = () => {
    const sortedEntries = [...entries].sort((left, right) => String(right.date || "").localeCompare(String(left.date || "")));
    entryGrid.replaceChildren(...sortedEntries.map((entry) => renderEntry(entry)));
    emptyState.hidden = sortedEntries.length > 0;
    gate.hidden = true;
    journal.hidden = false;
    lockButton.focus();
  };

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const password = passwordInput.value;
    if (!password) {
      setStatus(root.dataset.passwordRequired, true);
      passwordInput.focus();
      return;
    }
    if (!expectedPassword) {
      setStatus(root.dataset.configMissing, true);
      return;
    }

    unlockButton.disabled = true;
    root.classList.add("is-unlocking");
    setStatus(root.dataset.unlocking);
    window.setTimeout(() => {
      if (password === expectedPassword) {
        passwordInput.value = "";
        setStatus("");
        showJournal();
      } else {
        passwordInput.value = "";
        setStatus(root.dataset.wrongPassword, true);
        passwordInput.focus();
      }
      unlockButton.disabled = false;
      root.classList.remove("is-unlocking");
    }, 80);
  });

  passwordToggle.addEventListener("click", () => {
    const shouldShow = passwordInput.type === "password";
    passwordInput.type = shouldShow ? "text" : "password";
    passwordToggle.setAttribute("aria-pressed", String(shouldShow));
    passwordToggle.setAttribute("aria-label", shouldShow ? root.dataset.hidePassword : root.dataset.showPassword);
    const icon = passwordToggle.querySelector("i");
    icon.className = shouldShow ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
    passwordInput.focus();
  });

  lockButton.addEventListener("click", () => {
    releaseDecryptedContent();
    journal.hidden = true;
    gate.hidden = false;
    setStatus("");
    passwordInput.type = "password";
    passwordToggle.setAttribute("aria-pressed", "false");
    passwordToggle.setAttribute("aria-label", root.dataset.showPassword);
    passwordToggle.querySelector("i").className = "fa-solid fa-eye";
    passwordInput.focus();
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
  });
  window.addEventListener("beforeunload", releaseDecryptedContent);
})();
