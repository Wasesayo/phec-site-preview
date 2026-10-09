// ===========================================================================
// PHEC CLASS SCHEDULES — this is the ONLY file to edit when dates change.
// Dates are YYYY-MM-DD. Add new cohorts anywhere in the list — the site sorts
// and labels them (Enrolling / In session / Completed) automatically based on
// today's date.
// ===========================================================================

const PHEC_SCHEDULE = {
  cnaWeekday: [
    { start: "2026-06-08", end: "2026-07-11" },
    { start: "2026-07-13", end: "2026-08-15" },
    { start: "2026-08-17", end: "2026-09-19" },
    { start: "2026-09-14", end: "2026-10-17" },
    { start: "2026-10-19", end: "2026-11-20" },
    { start: "2026-11-16", end: "2026-12-18" },
  ],
  cnaWeekend: [
    { start: "2026-05-09", end: "2026-07-26" },
    { start: "2026-07-11", end: "2026-09-27" },
    { start: "2026-09-12", end: "2026-11-29" },
  ],
  hha: { note: "Weekend classes (Sat–Sun), 5 class days, 8:00 am – 4:30 pm. Schedule to be confirmed. Call for the next session." },
  ceu: [
    { date: "2026-07-18", topics: "Infection Control & Nosocomial Infection" },
    { date: "2026-08-22", topics: "Vital Signs & Long-term care Residents" },
    { date: "2026-09-19", topics: "Hypertension & Understanding Pain" },
    { date: "2026-10-17", topics: "Diabetes & Nutrition for Elderly" },
    { date: "2026-11-21", topics: "Hospice Care & Death/Dying" },
    { date: "2026-12-12", topics: "Elder Abuse & Resident's Rights", extra: "and Dec 19" },
  ],
  rna: [
    { start: "2026-08-01", end: "2026-08-02", label: "August 1 & 2, 2026" },
  ],
};
