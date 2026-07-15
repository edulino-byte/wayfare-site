/* =============================================================================
   MOCK DATA LAYER
   -----------------------------------------------------------------------------
   This is the ONLY file that should change when real visa data arrives.
   Everything is plain data — no UI, no logic. Keyed by ISO-A2 codes so it can
   be joined against the globe's GeoJSON. Copy strings are i18n keys, not text.

   To replace with real data later:
     - swap VISA_TYPES requirement defaults for real per-country rules
     - expand COUNTRIES with verified visa programs + thresholds
     - update PASSPORTS tiers from a real passport-power index
   ========================================================================== */

window.VISA_DATA = (function () {
  /* ---- ordered enums (used by logic for >= comparisons) ------------------ */
  const EDUCATION = ["primary", "secondary", "baccalaureate", "university_plus"];
  /* v1.13.0 — niveles CEFR/MCER para la UI; el motor los normaliza a su escala
     interna (a1/a2->basic, b1->intermediate, b2/c1->advanced, c2->native). */
  const ENGLISH = ["a1", "a2", "b1", "b2", "c1", "c2"];

  /* ---- visa types: id + default requirement template -------------------- */
  /* Requirements use the enums above. A country can override any field.      */
  const VISA_TYPES = {
    student: {
      icon: "ST",
      defaults: { minAge: 17, maxAge: 60, minSavings: 8000, minEdu: "secondary", minExp: 0, minEnglish: "intermediate" },
    },
    work_and_holiday: {
      icon: "WH",
      defaults: { minAge: 18, maxAge: 35, minSavings: 2500, minEdu: "secondary", minExp: 0, minEnglish: "basic" },
    },
    work: {
      icon: "WK",
      defaults: { minAge: 21, maxAge: 58, minSavings: 3000, minEdu: "university_plus", minExp: 2, minEnglish: "intermediate" },
    },
    tourist: {
      icon: "TR",
      defaults: { minAge: 18, maxAge: 70, minSavings: 2000, minEdu: "primary", minExp: 0, minEnglish: "basic" },
    },
    digital_nomad: {
      icon: "DN",
      defaults: { minAge: 18, maxAge: 65, minSavings: 12000, minEdu: "secondary", minExp: 1, minEnglish: "intermediate" },
    },
  };

  /* ---- SUPPORTED_PROFILE_COUNTRY_CODES --------------------------------
     The curated list of countries selectable as passport/nationality or
     current residence in the Wayfare profile. This does NOT modify official
     visa eligibility rules — eligibility.js has its own passport lists.   */
  const SUPPORTED_PROFILE_COUNTRY_CODES = [
    /* Spanish-speaking */
    "AR", "BO", "CL", "CO", "CR", "CU", "EC", "SV", "GT", "HN",
    "MX", "NI", "PA", "PY", "PE", "DO", "UY", "VE", "GQ",
    /* Europe */
    "DE", "AT", "BE", "BG", "CY", "HR", "DK", "ES", "EE", "FI",
    "FR", "GE", "GR", "HU", "IE", "IS", "IT", "LV", "LT", "LU",
    "NO", "NL", "PL", "PT", "GB", "CZ", "RU", "RS", "SE", "CH",
    "TR", "UA",
    /* Others */
    "US", "CA", "JP", "CN", "BR",
    /* v1.23.0 — pasaportes que el motor ya modelaba pero el selector omitía */
    "AU", "NZ", "KR", "TW", "HK", "IL", "RO", "SK", "SI", "MT", "AD", "LI",
  ];

  /* Passport tiers used by eligibility.js scoring (not official visa rules) */
  const PASSPORT_TIERS = {
    US:1, GB:1, DE:1, FR:1, JP:1, CA:1, ES:1, IT:1, NL:1,
    PT:1, SE:1, NO:1, DK:1, FI:1, IE:1, AT:1, BE:1, CH:1,
    LU:1, IS:1, CZ:1, PL:1, HU:1, GR:1, HR:1, LT:1, LV:1,
    EE:1, BG:1, CY:1,
    AR:2, CL:2, MX:2, UY:2, CR:2, PA:2, DO:2,
    BR:2, /* Brazil not in profile list but kept for elig compat */
    CO:3, PE:3, EC:3, BO:3, GT:3, HN:3, SV:3, NI:3, PY:3,
    VE:3, CU:3, GQ:3,
    GE:3, RS:3, UA:3, RU:3,
    TR:3, CN:4,
    /* v1.23.0 — coherentes con PASSPORT.tier1/2 del motor (pendiente auditoría de tiers) */
    AU:1, NZ:1, KR:1, RO:1, SK:1, SI:1, MT:1, LI:1,
    TW:2, HK:2, IL:2, AD:2,
  };

  /* PASSPORTS — used by Questionnaire.jsx for the nationality selector
     and by eligibility.js passportTier() lookup.                         */
  const PASSPORTS = SUPPORTED_PROFILE_COUNTRY_CODES.map(function(code) {
    return { code: code, tier: PASSPORT_TIERS[code] || 3 };
  });

  /* RESIDENCES — same curated list, used by the currentResidence selector */
  const RESIDENCES = SUPPORTED_PROFILE_COUNTRY_CODES.map(function(code) {
    return { code: code };
  });

  /* ---- helper to build a visa offering with optional overrides ---------- */
  const v = (type, allowedTiers, overrides) => ({
    type,
    passportTiers: allowedTiers,
    req: Object.assign({}, VISA_TYPES[type].defaults, overrides || {}),
  });

  /* ---- curated destination countries -----------------------------------
     Keyed by ISO-A2. `region` groups for the recommendations panel.
     `visas` = programs this country offers + which passport tiers qualify.   */
  const COUNTRIES = [
    { iso: "AU", name: "Australia", region: "oceania", visas: [
      v("work_and_holiday", [1, 2], { maxAge: 35, minSavings: 3500 }),
      v("work", [1, 2, 3], { minExp: 3, minEnglish: "advanced" }),
      v("student", [1, 2, 3, 4], { minSavings: 14000 }),
    ]},
    { iso: "NZ", name: "New Zealand", region: "oceania", visas: [
      v("work_and_holiday", [1, 2], { maxAge: 30 }),
      v("work", [1, 2, 3], { minExp: 3 }),
      v("digital_nomad", [1, 2, 3], { minSavings: 10000 }),
    ]},
    { iso: "CA", name: "Canada", region: "north_america", visas: [
      v("work_and_holiday", [1, 2], { maxAge: 35 }),
      v("work", [1, 2, 3], { minExp: 3, minEnglish: "advanced" }),
      v("student", [1, 2, 3, 4], { minSavings: 13000 }),
    ]},
    { iso: "US", name: "United States", region: "north_america", visas: [
      v("work", [1, 2], { minExp: 3, minEnglish: "advanced" }),
      v("student", [1, 2, 3], { minSavings: 18000 }),
      v("work", [1, 2], { minSavings: 50000 }),
    ]},
    { iso: "GB", name: "United Kingdom", region: "europe", visas: [
      v("work_and_holiday", [1, 2], { maxAge: 30 }),
      v("work", [1, 2, 3], { minExp: 3, minEnglish: "advanced" }),
      v("student", [1, 2, 3, 4], { minSavings: 15000 }),
    ]},
    { iso: "DE", name: "Germany", region: "europe", visas: [
      v("work", [1, 2, 3], { minEdu: "university_plus", minExp: 2 }),
      v("digital_nomad", [1, 2, 3], { minSavings: 11000 }),
      v("student", [1, 2, 3, 4], { minSavings: 12000 }),
    ]},
    { iso: "ES", name: "Spain", region: "europe", visas: [
      v("digital_nomad", [1, 2, 3], { minSavings: 9000 }),
      v("student", [1, 2, 3, 4], { minSavings: 9000 }),
      v("tourist", [1, 2], { minSavings: 28000 }),
    ]},
    { iso: "PT", name: "Portugal", region: "europe", visas: [
      v("digital_nomad", [1, 2, 3], { minSavings: 9500 }),
      v("tourist", [1, 2, 3], { minSavings: 22000 }),
      v("student", [1, 2, 3, 4], { minSavings: 9000 }),
    ]},
    { iso: "NL", name: "Netherlands", region: "europe", visas: [
      v("work", [1, 2], { minExp: 3, minEnglish: "advanced" }),
      v("work", [1, 2], { minSavings: 35000 }),
      v("student", [1, 2, 3, 4], { minSavings: 13000 }),
    ]},
    { iso: "FR", name: "France", region: "europe", visas: [
      v("work", [1, 2, 3], { minExp: 2 }),
      v("student", [1, 2, 3, 4], { minSavings: 11000 }),
      v("work", [1, 2], { minSavings: 30000 }),
    ]},
    { iso: "IT", name: "Italy", region: "europe", visas: [
      v("digital_nomad", [1, 2, 3], { minSavings: 10000 }),
      v("student", [1, 2, 3, 4], { minSavings: 9000 }),
      v("work", [1, 2, 3], { minExp: 2 }),
    ]},
    { iso: "IE", name: "Ireland", region: "europe", visas: [
      v("work_and_holiday", [1, 2], { maxAge: 35 }),
      v("work", [1, 2], { minExp: 3, minEnglish: "advanced" }),
    ]},
    { iso: "SE", name: "Sweden", region: "europe", visas: [
      v("work", [1, 2, 3], { minExp: 2 }),
      v("student", [1, 2, 3, 4], { minSavings: 11000 }),
    ]},
    { iso: "EE", name: "Estonia", region: "europe", visas: [
      v("digital_nomad", [1, 2, 3, 4], { minSavings: 8000 }),
      v("work", [1, 2, 3], { minSavings: 16000 }),
    ]},
    { iso: "JP", name: "Japan", region: "asia", visas: [
      v("work_and_holiday", [1, 2], { maxAge: 30 }),
      v("work", [1, 2, 3], { minExp: 2, minEnglish: "intermediate" }),
      v("student", [1, 2, 3, 4], { minSavings: 12000 }),
    ]},
    { iso: "KR", name: "South Korea", region: "asia", visas: [
      v("work_and_holiday", [1, 2], { maxAge: 30 }),
      v("digital_nomad", [1, 2, 3], { minSavings: 13000 }),
    ]},
    { iso: "SG", name: "Singapore", region: "asia", visas: [
      v("work", [1, 2], { minExp: 4, minEnglish: "advanced", minSavings: 9000 }),
      v("work", [1, 2], { minSavings: 40000 }),
    ]},
    { iso: "AE", name: "United Arab Emirates", region: "asia", visas: [
      v("digital_nomad", [1, 2, 3, 4], { minSavings: 12000 }),
      v("tourist", [1, 2, 3], { minSavings: 20000 }),
    ]},
    { iso: "TH", name: "Thailand", region: "asia", visas: [
      v("digital_nomad", [1, 2, 3, 4], { minSavings: 9000 }),
      v("student", [1, 2, 3, 4], { minSavings: 6000 }),
    ]},
    { iso: "MX", name: "Mexico", region: "north_america", visas: [
      v("digital_nomad", [1, 2, 3, 4], { minSavings: 7000 }),
      v("tourist", [1, 2, 3], { minSavings: 18000 }),
    ]},
    { iso: "BR", name: "Brazil", region: "south_america", visas: [
      v("digital_nomad", [1, 2, 3, 4], { minSavings: 7000 }),
      v("student", [1, 2, 3, 4], { minSavings: 5000 }),
    ]},
    { iso: "AR", name: "Argentina", region: "south_america", visas: [
      v("digital_nomad", [1, 2, 3, 4], { minSavings: 5000 }),
      v("student", [1, 2, 3, 4], { minSavings: 4000 }),
      v("work", [1, 2, 3], { minExp: 1 }),
    ]},
    { iso: "CL", name: "Chile", region: "south_america", visas: [
      v("work", [1, 2, 3], { minExp: 1 }),
      v("digital_nomad", [1, 2, 3, 4], { minSavings: 6000 }),
    ]},
    { iso: "CR", name: "Costa Rica", region: "north_america", visas: [
      v("digital_nomad", [1, 2, 3, 4], { minSavings: 8000 }),
      v("tourist", [1, 2, 3], { minSavings: 15000 }),
    ]},
    { iso: "ZA", name: "South Africa", region: "africa", visas: [
      v("work", [1, 2, 3], { minExp: 3 }),
      v("student", [1, 2, 3, 4], { minSavings: 6000 }),
    ]},
    { iso: "GE", name: "Georgia", region: "asia", visas: [
      v("digital_nomad", [1, 2, 3, 4], { minSavings: 4000 }),
      v("tourist", [1, 2, 3, 4], { minSavings: 12000 }),
    ]},
  ];

  return { EDUCATION, ENGLISH, VISA_TYPES, PASSPORTS, RESIDENCES, COUNTRIES,
           VISA_TYPE_IDS: ["work_and_holiday", "student", "tourist", "digital_nomad"] };
})();