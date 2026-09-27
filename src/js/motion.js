// Native motion: no animation library, and content stays visible without JavaScript.
const root = document.documentElement;
const motionButton = document.querySelector(".motion-toggle");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const artwork = document.querySelector(".system-art");
const entrances = new Map();
let paused = false;
let pointerFrame = 0;

try {
  paused = localStorage.getItem("zq-motion") === "paused";
} catch (_) {
  /* Motion controls still work for this visit. */
}

const motionEnabled = () => !paused && !reducedMotion.matches;

function resetArtwork() {
  cancelAnimationFrame(pointerFrame);
  pointerFrame = 0;
  if (!artwork) return;
  ["--pointer-x", "--pointer-y", "--pointer-rx", "--pointer-ry"].forEach(
    (property) => artwork.style.removeProperty(property)
  );
}

function updateMotion() {
  root.dataset.motion = reducedMotion.matches
    ? "reduced"
    : paused
    ? "paused"
    : "running";
  if (motionButton) {
    motionButton.hidden = false;
    motionButton.disabled = reducedMotion.matches;
    const label = reducedMotion.matches
      ? "Animations disabled by system preference"
      : paused
      ? "Resume animations"
      : "Pause animations";
    motionButton.setAttribute("aria-label", label);
    motionButton.title = label;
  }
  if (!motionEnabled()) {
    entrances.forEach((animation) => animation.cancel());
    entrances.clear();
    resetArtwork();
  }
}

motionButton?.addEventListener("click", () => {
  paused = !paused;
  try {
    localStorage.setItem("zq-motion", paused ? "paused" : "running");
  } catch (_) {
    /* Optional persistence. */
  }
  updateMotion();
});
reducedMotion.addEventListener("change", updateMotion);
finePointer.addEventListener("change", resetArtwork);
updateMotion();

// One-time entrances use the Web Animations API. Nothing is hidden while waiting
// for the observer, and cancelling an animation returns to the visible base style.
if (
  "IntersectionObserver" in window &&
  typeof Element.prototype.animate === "function"
) {
  const revealGroups = [
    ".hero-copy > *",
    ".system-art",
    ".section-heading",
    ".featured-project",
    ".project-grid > *",
    ".about-grid > *",
    ".expertise-grid > *",
    ".beyond-section > *",
    ".contact-grid > *",
    ".case-hero > *",
    ".case-workflow h2",
    ".workflow-grid > *",
    ".case-content > *",
    ".case-end > *",
  ];
  const delays = new Map();
  const reveals = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        reveals.unobserve(element);
        if (!motionEnabled() || element.contains(document.activeElement))
          return;
        const animation = element.animate(
          [
            { opacity: 0, translate: "0 22px" },
            { opacity: 1, translate: "0 0" },
          ],
          {
            duration: 650,
            delay: delays.get(element) || 0,
            easing: "cubic-bezier(.22, 1, .36, 1)",
            fill: "backwards",
          }
        );
        entrances.set(element, animation);
        const forget = () => entrances.delete(element);
        animation.finished.then(forget, forget);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
  );
  revealGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      delays.set(element, Math.min(index % 6, 3) * 75);
      reveals.observe(element);
    });
  });
  document.addEventListener("focusin", (event) => {
    entrances.forEach((animation, element) => {
      if (element.contains(event.target)) animation.cancel();
    });
  });

  // Ambient loops run only on visible surfaces, including when returning to them.
  const surfaces = new IntersectionObserver((entries) => {
    entries.forEach((entry) =>
      entry.target.classList.toggle("motion-visible", entry.isIntersecting)
    );
  });
  document
    .querySelectorAll(".system-art, .agent-preview")
    .forEach((element) => surfaces.observe(element));
}

function updateVisibility() {
  root.toggleAttribute("data-page-hidden", document.hidden);
}
document.addEventListener("visibilitychange", updateVisibility);
updateVisibility();

// Pointer depth is confined to the illustration, never the text or touch screens.
artwork?.addEventListener("pointermove", (event) => {
  if (!motionEnabled() || !finePointer.matches || event.pointerType !== "mouse")
    return;
  cancelAnimationFrame(pointerFrame);
  pointerFrame = requestAnimationFrame(() => {
    const bounds = artwork.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    artwork.style.setProperty("--pointer-x", `${x * 12}px`);
    artwork.style.setProperty("--pointer-y", `${y * 10}px`);
    artwork.style.setProperty("--pointer-rx", `${-y * 7}deg`);
    artwork.style.setProperty("--pointer-ry", `${x * 7}deg`);
    pointerFrame = 0;
  });
});
artwork?.addEventListener("pointerleave", resetArtwork);
window.addEventListener("blur", resetArtwork);
