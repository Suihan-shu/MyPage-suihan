/* Reading position indicator, adapted from Pankaj Parashar's
 * https://css-tricks.com/reading-position-indicator/ (May 7, 2014).
 * Batch scroll updates and remeasure when content changes size.
 */
(() => {
  const progressBar = document.getElementById("progress");
  if (!progressBar) return;
  const navbar = document.getElementById("navbar");
  const supportsProgress = "max" in document.createElement("progress");
  let framePending = false;
  let layoutDirty = true;
  let distance = 0;

  function setStyle(element, property, value) {
    if (element && element.style[property] !== value) element.style[property] = value;
  }

  function update() {
    framePending = false;
    if (layoutDirty) {
      layoutDirty = false;
      if (navbar) {
        const style = getComputedStyle(navbar);
        const height = navbar.getBoundingClientRect().height +
          (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
        const offset = style.position === "fixed" ? height + "px" : "0px";
        setStyle(document.body, "paddingTop", offset);
        setStyle(progressBar, "top", offset);
      }
      distance = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (supportsProgress) progressBar.max = Math.max(1, distance);
    }
    const position = Math.min(distance, Math.max(0, window.scrollY || 0));
    if (supportsProgress) {
      if (progressBar.value !== position) progressBar.value = position;
    } else {
      setStyle(progressBar, "width", (distance ? position / distance * 100 : 0) + "%");
    }
  }

  function scheduleUpdate() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(update);
  }

  function invalidateLayout() {
    layoutDirty = true;
    scheduleUpdate();
  }

  document.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", invalidateLayout, { passive: true });
  window.addEventListener("load", invalidateLayout);
  document.addEventListener("load", invalidateLayout, true);
  document.addEventListener("toggle", invalidateLayout, true);
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(invalidateLayout);
    observer.observe(document.body);
    if (navbar) observer.observe(navbar);
  }
  invalidateLayout();
})();
