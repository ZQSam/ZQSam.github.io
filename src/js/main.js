const root = document.documentElement;
const themeButton = document.querySelector(".theme-toggle");

function setTheme(theme) {
  root.dataset.theme = theme;
  const label = `Switch to ${theme === "dark" ? "light" : "dark"} theme`;
  themeButton?.setAttribute("aria-label", label);
  themeButton?.setAttribute("title", label);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#101413" : "#f5f6f1");
}
// Restricted browser contexts may not allow local storage.
try {
  const savedTheme = localStorage.getItem("zq-theme");
  if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
} catch (_) {
  /* Keep the default theme. */
}
themeButton?.addEventListener("click", () => {
  const theme = root.dataset.theme === "dark" ? "light" : "dark";
  setTheme(theme);
  try {
    localStorage.setItem("zq-theme", theme);
  } catch (_) {
    /* Applies for this visit. */
  }
});

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".navbar");
function closeMenu(returnFocus = false) {
  nav?.classList.remove("is-open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Open navigation");
  if (returnFocus) menuButton?.focus();
}
menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  nav?.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation"
  );
});
nav
  ?.querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", () => closeMenu()));
document.addEventListener("click", (event) => {
  if (!event.target.closest(".header")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav?.classList.contains("is-open"))
    closeMenu(true);
});
window.matchMedia("(min-width: 801px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

const sectionLinks = [...document.querySelectorAll('.navbar a[href^="#"]')];
const sections = sectionLinks
  .map((link) => document.getElementById(link.hash.slice(1)))
  .filter(Boolean);
let scrollPending = false;
function updateActiveSection() {
  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  root.style.setProperty(
    "--scroll-progress",
    Math.max(0, Math.min(1, progress))
  );
  const threshold = window.scrollY + 150;
  let currentId = "";
  sections.forEach((section) => {
    if (section.offsetTop <= threshold) currentId = section.id;
  });
  sectionLinks.forEach((link) => {
    const active = link.hash === `#${currentId}`;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  scrollPending = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(updateActiveSection);
    }
  },
  { passive: true }
);
window.addEventListener("load", updateActiveSection);
window.addEventListener("resize", updateActiveSection);
updateActiveSection();
document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const gallery = document.getElementById("photo-gallery");
const slides = [...document.querySelectorAll("[data-slide]")];
const galleryStatus = document.querySelector("[data-gallery-status]");
let slideIndex = 0;
function showSlide(index) {
  if (!slides.length) return;
  slideIndex = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    slide.hidden = i !== slideIndex;
  });
  if (galleryStatus)
    galleryStatus.textContent = `${String(slideIndex + 1).padStart(
      2,
      "0"
    )} / ${String(slides.length).padStart(2, "0")}`;
}
document.querySelectorAll("[data-open-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = document.getElementById(button.dataset.openDialog);
    if (!dialog) return;
    if (dialog === gallery) showSlide(0);
    dialog.showModal();
    document.body.classList.add("dialog-open");
  });
});
document.querySelectorAll("dialog").forEach((dialog) => {
  // Keep Tab navigation inside the dialog, including at either end of its controls.
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const controls = [
      ...dialog.querySelectorAll(
        "button:not([disabled]), a[href], input:not([disabled]), [tabindex='0']"
      ),
    ].filter((element) => element.getClientRects().length);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
  dialog
    .querySelector("[data-close-dialog]")
    ?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom)
    )
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.toggle(
      "dialog-open",
      Boolean(document.querySelector("dialog[open]"))
    );
  });
});
document
  .querySelector("[data-gallery-prev]")
  ?.addEventListener("click", () => showSlide(slideIndex - 1));
document
  .querySelector("[data-gallery-next]")
  ?.addEventListener("click", () => showSlide(slideIndex + 1));
gallery?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    showSlide(slideIndex + (event.key === "ArrowRight" ? 1 : -1));
  }
});
