const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }));
}
document.getElementById("year").textContent = new Date().getFullYear();
// English / Sinhala language switch
const langButtons = document.querySelectorAll(".lang-btn");
function setLanguage(language) {
  document.documentElement.lang = language;
  document.querySelectorAll("[data-en][data-si]").forEach(element => {
    element.innerHTML = element.dataset[language];
  });
  langButtons.forEach(button => {
    const selected = button.dataset.lang === language;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}
langButtons.forEach(button => button.addEventListener("click", () => setLanguage(button.dataset.lang)));
const currentLanguage = window.location.pathname.includes("/si/")
  ? "si"
  : "en";

setLanguage(currentLanguage);
