(() => {
  const modals = Array.from(document.querySelectorAll(".contact-qr-modal"));
  let activeModal = null;
  let lastTrigger = null;

  const closeModal = (modal = activeModal) => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("contact-qr-modal-open");
    activeModal = null;
    if (lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null;
    }
  };

  const openModal = (modal, trigger) => {
    if (!modal) return;
    if (activeModal && activeModal !== modal) closeModal(activeModal);
    activeModal = modal;
    lastTrigger = trigger;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("contact-qr-modal-open");
    const closeButton = modal.querySelector(".contact-qr-modal__close");
    (closeButton || modal).focus();
  };

  document.querySelectorAll('a[href^="#contact-"]').forEach((trigger) => {
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.addEventListener("click", (event) => {
      const targetId = trigger.getAttribute("href").slice(1);
      const modal = document.getElementById(targetId);
      if (!modal) return;
      event.preventDefault();
      openModal(modal, trigger);
    });
  });

  modals.forEach((modal) => {
    modal.querySelector(".contact-qr-modal__close")?.addEventListener("click", () => closeModal(modal));
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeModal) closeModal(activeModal);
    if (event.key === "Tab" && activeModal) {
      const closeButton = activeModal.querySelector(".contact-qr-modal__close");
      if (closeButton && document.activeElement !== closeButton) {
        event.preventDefault();
        closeButton.focus();
      }
    }
  });
})();
