// PHEC site interactions — vanilla JS, no dependencies.

// sticky header
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
onScroll();
addEventListener("scroll", onScroll, { passive: true });

// mobile nav
const burger = document.querySelector(".burger");
const nav = document.querySelector(".nav");
if (burger) {
  burger.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open")));
}

// scroll reveal
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }),
  { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// count-up stats
const cio = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target;
    const target = parseInt(el.dataset.count, 10);
    const dur = 1100;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}, { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));

// tabs (programs page)
function activateTab(tabId) {
  const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  const panel = document.getElementById(tabId);
  if (!btn || !panel) return;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
  btn.classList.add("active");
  panel.classList.add("active");
}
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => activateTab(btn.dataset.tab));
});
// deep-link support: /programs/#panel-hha opens straight to that tab,
// so a persona card on the homepage can land a visitor on the exact program
if (location.hash) {
  const id = location.hash.slice(1);
  if (document.getElementById(id) && document.querySelector(`.tab-btn[data-tab="${id}"]`)) {
    activateTab(id);
  }
}

// ---- schedule rendering (programs page) ----
function fmt(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US",
    { month: "long", day: "numeric", year: "numeric" });
}

function cohortStatus(start, end) {
  const now = new Date();
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T23:59:59");
  if (now > e) return ["Completed", "badge-done", true];
  if (now >= s) return ["In session", "badge-now", false];
  const days = (s - now) / 86400000;
  if (days <= 45) return ["Enrolling now", "badge-open", false];
  return ["Upcoming", "badge-soon", false];
}

function renderCohorts(mountId, cohorts) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  const sorted = [...cohorts].sort((a, b) => a.start.localeCompare(b.start));
  mount.innerHTML = sorted.map((c) => {
    const [label, cls, past] = cohortStatus(c.start, c.end);
    return `<div class="cohort${past ? " past" : ""}">
      <span class="badge ${cls}">${label}</span>
      <b>${fmt(c.start)}</b>
      <div class="len">through ${fmt(c.end)}</div>
    </div>`;
  }).join("");
}

function renderCeu(mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  mount.innerHTML = PHEC_SCHEDULE.ceu.map((c) => {
    const past = new Date(c.date + "T23:59:59") < new Date();
    const badge = past ? ["Completed", "badge-done"] : ["Open", "badge-open"];
    return `<div class="cohort${past ? " past" : ""}">
      <span class="badge ${badge[1]}">${badge[0]}</span>
      <b>${fmt(c.date)}${c.extra ? " " + c.extra : ""}</b>
      <div class="len">${c.topics}</div>
    </div>`;
  }).join("");
}

// ---- photo carousel (homepage) ----
const carousel = document.getElementById("photo-carousel");
if (carousel) {
  const slides = [...carousel.querySelectorAll(".slide")];
  const dotsWrap = carousel.querySelector(".dots");
  let current = 0;
  let timer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.setAttribute("aria-label", `Photo ${i + 1}`);
    dot.addEventListener("click", () => { show(i); restart(); });
    dotsWrap.appendChild(dot);
  });
  const dots = [...dotsWrap.children];

  function show(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, j) => s.classList.toggle("active", j === current));
    dots.forEach((d, j) => d.classList.toggle("on", j === current));
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => show(current + 1), 2000);
  }

  const mkArrow = (cls, glyph, delta, label) => {
    const btn = document.createElement("button");
    btn.className = `arrow ${cls}`;
    btn.textContent = glyph;
    btn.setAttribute("aria-label", label);
    btn.addEventListener("click", () => { show(current + delta); restart(); });
    carousel.appendChild(btn);
  };
  mkArrow("arrow-prev", "‹", -1, "Previous photo");
  mkArrow("arrow-next", "›", 1, "Next photo");

  carousel.addEventListener("mouseenter", () => clearInterval(timer));
  carousel.addEventListener("mouseleave", restart);
  show(0);
  restart();
}

if (typeof PHEC_SCHEDULE !== "undefined") {
  renderCohorts("cna-weekday-list", PHEC_SCHEDULE.cnaWeekday);
  renderCohorts("cna-weekend-list", PHEC_SCHEDULE.cnaWeekend);
  renderCohorts("rna-list", PHEC_SCHEDULE.rna);
  renderCeu("ceu-list");
}

// ---- next-cohort pill (homepage hero) ----
const nextCohortEl = document.getElementById("hero-next-cohort");
if (nextCohortEl && typeof PHEC_SCHEDULE !== "undefined") {
  const all = [
    ...PHEC_SCHEDULE.cnaWeekday.map((c) => ({ ...c, label: "weekday" })),
    ...PHEC_SCHEDULE.cnaWeekend.map((c) => ({ ...c, label: "weekend" })),
  ];
  const now = new Date();
  const upcoming = all
    .filter((c) => new Date(c.end + "T23:59:59") >= now)
    .sort((a, b) => a.start.localeCompare(b.start));
  if (upcoming.length) {
    const next = upcoming[0];
    const inSession = new Date(next.start + "T00:00:00") <= now;
    nextCohortEl.innerHTML = inSession
      ? `<span class="dot"></span>Our next ${next.label} CNA cohort is <b>in session now</b>. The following one starts soon`
      : `<span class="dot"></span>Next ${next.label} CNA class starts <b>${fmt(next.start)}</b>`;
  } else {
    nextCohortEl.style.display = "none";
  }
}

// ---- request-info form (homepage) ----
// STILL DEFERRED per owner (2026-08-01): no live form delivery until they
// green-light implementation. The CONFIRMED inbox for when that happens is
// pacifichealth.cna@gmail.com — restore the endpoint:
// "https://formsubmit.co/ajax/pacifichealth.cna@gmail.com"
// One-time setup at that point: the FIRST submission triggers an activation
// email to that inbox; someone must click the link in it once, or deliveries
// stay paused. After activation, FormSubmit issues a random alias endpoint —
// swap it in to keep the address out of the page source. A Contact-page
// inquiry form is also approved for that same pass (see site/contact/ and
// docs/TODO.md). While null, the form routes visitors to the phone instead.
const FORM_ENDPOINT = null;
const convertForm = document.getElementById("convert-form");
if (convertForm) {
  convertForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = convertForm.querySelector("#f-name").value.trim();
    const phone = convertForm.querySelector("#f-phone").value.trim();
    const program = convertForm.querySelector("#f-program").value;
    const session = convertForm.querySelector("#f-session").value;
    const btn = convertForm.querySelector(".submit-btn");
    const panel = convertForm.querySelector(".result-panel");
    const greeting = panel.querySelector(".greeting");

    btn.disabled = true;
    btn.textContent = "Sending…";
    let delivered = false;
    if (!FORM_ENDPOINT) {
      // endpoint deferred: fall through to the call-first panel below
    } else try {
      const resp = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: "New program inquiry from pacifichealthedu.com",
          _template: "table",
          _captcha: "false",
          name: name,
          phone: phone,
          program: program,
          preferred_session: session,
        }),
      });
      delivered = resp.ok;
    } catch {
      delivered = false;
    }

    if (!FORM_ENDPOINT) {
      greeting.textContent = name
        ? `Thanks, ${name}! To finish reserving your seat, call us now. We'll have your info ready to go.`
        : "Thanks! To finish reserving your seat, call us now. We'll have your info ready to go.";
    } else {
      greeting.textContent = delivered
        ? (name
          ? `Thanks, ${name}! We got your request and we'll reach out soon. Want a seat even faster? Call us now.`
          : "Thanks! We got your request and we'll reach out soon. Want a seat even faster? Call us now.")
        : (name
          ? `Thanks, ${name}! We couldn't send that just now, but one quick call reserves your seat. We'll take your info right over the phone.`
          : "Thanks! We couldn't send that just now, but one quick call reserves your seat. We'll take your info right over the phone.");
    }
    convertForm.querySelector(".form-fields").style.display = "none";
    panel.classList.add("show");
  });
}
