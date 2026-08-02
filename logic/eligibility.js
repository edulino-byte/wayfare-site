/* =============================================================================
   ELIGIBILITY LOGIC LAYER v2.2  --  money-agnostic scoring
   =============================================================================
   CHANGE FROM v2.1:
   profile.savings and profile.monthlyIncome no longer affect visa scores.
   Currency conversion is not supported, so financial comparisons would be
   misleading. Financial requirements appear as informational warnings only.
   remoteWork (boolean) still gates digital nomad scoring.

   SCORE MODEL  >=70 eligible, 40-69 partial, <40 ineligible
   ========================================================================== */

window.Eligibility = (function () {
  "use strict";

  var D   = window.VISA_DATA;
  var EDU = D.EDUCATION;
  /* v1.13.0 — escala INTERNA de inglés (estable: los umbrales del scoring se
     expresan con estos nombres). La UI usa niveles CEFR (a1..c2) y aquí se
     normalizan de forma conservadora; los valores antiguos siguen aceptándose. */
  var ENG = ["basic", "intermediate", "advanced", "native"];
  var ENG_CEFR = { a1: "basic", a2: "basic", b1: "intermediate", b2: "advanced", c1: "advanced", c2: "native" };

  function eduRank(e) { return Math.max(0, EDU.indexOf(e)); }
  function engRank(e) { return Math.max(0, ENG.indexOf(ENG_CEFR[e] || e)); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function inList(arr, code) { return arr.indexOf(code) !== -1; }
  function scoreToStatus(s) { return s >= 70 ? "eligible" : s >= 40 ? "partial" : "ineligible"; }

  /* Seeded RNG */
  function hashStr(s) {
    var h = 1779033703 ^ (s ? s.length : 0), i;
    s = s || "";
    for (i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ── Passport reference data (simulated) ──────────────────────────────── */
  var PASSPORT = {
    tier1: ["US","GB","DE","FR","JP","CA","AU","ES","IT","KR","NL","PT","SE","NO","DK","FI","IE","AT","BE","CH","NZ","SG"],
    tier2: ["AR","BR","CL","MX","AE","MY","HK","TW","PL","CZ","HU","RO"],
    tier3: ["ZA","TR","CO","PH","IN","PE","UA","RS","GE","TH"],
    tier4: ["NG","PK","EG","BD","ET","DZ"],
    whNewZealand: ["GB","IE","CA","FR","DE","IT","JP","KR","SE","DK","NO","FI","HK","TW","BE","NL","ES","PT","AR","CL","BR","MX","CZ","PL","HU"],
    whCanada:     ["AU","FR","JP","IE","NZ","GB","DE","KR","MX","NL","IT","ES","PT","HK","TW","BE","AR","CL","CZ","PL","SK"],
    auEvisitor: ["GB","FR","DE","IT","ES","NL","PT","BE","SE","DK","NO","FI","IE","AT","CH","LU","GR","CY","MT","EE","LV","LT","SK","SI","CZ","PL","HU","RO","BG","HR"],
    auEta:      ["US","CA","JP","KR","SG","MY","HK","TW","BN"],
    schengenFree: ["US","GB","CA","AU","JP","KR","NZ","SG","AE","BR","AR","CL","MX","MY","HK","TW","IL","GT","HN","PA","CR","UY"],
    euEea: ["DE","FR","IT","ES","NL","BE","PT","AT","SE","DK","FI","IE","GR","PL","CZ","HU","RO","BG","HR","SK","SI","EE","LT","LV","LU","MT","CY","NO","IS","LI"],
    cplp: ["BR","AO","MZ","CV","GW","ST","TL"],
  };

  function passportTier(code) {
    if (inList(PASSPORT.tier1, code)) return 1;
    if (inList(PASSPORT.tier2, code)) return 2;
    if (inList(PASSPORT.tier3, code)) return 3;
    return 4;
  }

  /* ── Scoring helpers (education, english, age only — no money) ─────────── */
  function scoreEdu(profile, minEdu, weight) {
    return eduRank(profile.education) >= eduRank(minEdu) ? weight : 0;
  }
  function scoreEng(profile, minEng, weight) {
    return engRank(profile.english) >= engRank(minEng) ? weight : 0;
  }
  function scoreAge(age, minAge, maxAge, weight) {
    if (age >= minAge && age <= maxAge) return weight;
    if (age >= minAge - 2 && age <= maxAge + 2) return Math.round(weight * 0.45);
    return 0;
  }

  /* Financial info — adds a warning, never touches score */
  function finReq(text, warnings) { warnings.push(text); }

  /* ── Result builder ────────────────────────────────────────────────────── */
  function visaResult(type, score, matched, warnings, missing) {
    return {
      type:     type,
      score:    clamp(score, 0, 100),
      status:   scoreToStatus(clamp(score, 0, 100)),
      matched:  matched  || [],
      warnings: warnings || [],
      missing:  missing  || [],
    };
  }

  /* =========================================================================
     COUNTRY RULES
  ========================================================================= */
  var COUNTRY_RULES = {};

  /* ── AUSTRALIA ─────────────────────────────────────────────────────────── */

  /* Listas oficiales de entrada turística (idea #20, v1.25.0). Capturadas de
     immi.homeaffairs.gov.au vía navegador del usuario 15-jul-2026 (evidencia:
     checkpoints/tier-audit/pages/au-651-eligible.txt / au-601-eligible.txt).
     eVisitor (subclass 651): gratuita, solo pasaportes europeos.
     ETA (subclass 601): añade CA/US/JP/KR/SG/MY/BN/HK/TW.                    */
  var AU_EVISITOR = ["AD","AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU",
    "IS","IE","IT","LV","LI","LT","LU","MT","MC","NL","NO","PL","PT","RO","SM","SK","SI",
    "ES","SE","CH","GB","VA"];
  var AU_ETA = ["AD","AT","BE","BN","CA","DK","FI","FR","DE","GR","HK","IS","IE","IT","JP",
    "LI","LU","MY","MT","MC","NO","PT","SM","SG","KR","ES","SE","CH","TW","NL","GB","US","VA"];

  COUNTRY_RULES.AU = {

    tourist: function (p) {
      /* ── Australia tourist entry — three official paths (lists captured
         15-jul-2026 via user browser; immi blocks automated fetch):
           eVisitor (subclass 651): free, European passports only
           ETA (subclass 601): adds CA/US/JP/KR/SG/MY/BN/HK/TW
           Visitor visa (subclass 600): everyone else (no closed list)
         New Zealanders: Trans-Tasman Arrangement (no capturable source —
         hedged wording, REVIEW).
         Core requirements (funds, genuine visitor intent, health/character,
         debt status, actual location at application) cannot be assessed from
         the current questionnaire. Score is capped at partial (<70).
      ─────────────────────────────────────────────────────────────────── */
      var S600 = {
        subclass:     "600",
        route:        "au_visitor_entry",
        officialName: "eVisitor (651) / ETA (601) / Visitor visa (600)",
        notEvaluated: [
          "You must intend to visit Australia only, such as tourism, a cruise, or visiting family or friends.",
          "This tourist stream is not for business or medical treatment purposes.",
          "You must not work in Australia.",
          "You must be outside Australia when you apply and when the visa is decided.",
          "You must meet health and character requirements.",
          "You must have paid back, or arranged to repay, any debts to the Australian Government.",
          "You must be a genuine visitor and obey any visa conditions and stay period.",
          "Requirements are based on simulated guidance and must be checked against official Australian immigration sources.",
        ],
      };

      function s600Result(score, matched, warnings, missing) {
        var r = visaResult("tourist", score, matched, warnings, missing);
        r.subclass     = S600.subclass;
        r.route        = S600.route;
        r.officialName = S600.officialName;
        return r;
      }

      /* v1.82.0 — FASE 3: los caminos oficiales como TARJETAS SEPARADAS.
         La tarjeta principal según tu pasaporte (444 / 651 / 601) + la
         Visitor 600 (disponible para cualquier nacionalidad) siempre como
         opción. Rutas auditadas partidas en 4 (sources.json); cada tarjeta
         casa por su route. Mismas frases traducidas/ancladas de siempre. */
      var nat = p.nationality;
      var cards = [];
      function card(subclass, route, nombre, score, m, w, x) {
        var r = visaResult("tourist", Math.min(score, 68), m, w, x);
        r.subclass = subclass; r.route = route; r.officialName = nombre;
        return r;
      }
      function extrasComunes(m, w) {
        if (p.age < 18) w.push("For applicants under 18, the visa may not be granted if it is not in the best interests of the child.");
        if (p.remoteWork) w.push("This visa does not allow work in Australia. If you plan to work remotely while in Australia, you should check official conditions carefully.");
        w.push("You must be a genuine visitor and only intend to stay temporarily in Australia.");
      }

      /* — tarjeta principal según el pasaporte — */
      if (nat === "NZ") {
        var m444 = [], w444 = [];
        m444.push("New Zealand citizens can usually enter Australia under the Trans-Tasman Travel Arrangement (Special Category visa granted on arrival).");
        w444.push("As a New Zealand citizen you are usually granted the Special Category visa (subclass 444) on arrival under the Trans-Tasman arrangement - it is free and lets you visit, study and work in Australia.");
        extrasComunes(m444, w444);
        cards.push(card("444", "au_tourist_444", "Special Category visa (subclass 444) — Trans-Tasman", 62, m444, w444, []));
      } else if (inList(AU_EVISITOR, nat)) {
        var m651 = [], w651 = [];
        m651.push("Your passport nationality appears to be on the eVisitor (subclass 651) eligible list: apply online for free and stay up to 3 months at a time.");
        w651.push("The eVisitor lets you visit as often as you wish in a 12-month period, staying up to 3 months each time you enter Australia.");
        extrasComunes(m651, w651);
        cards.push(card("651", "au_tourist_651", "eVisitor (subclass 651)", 58, m651, w651, []));
      } else if (inList(AU_ETA, nat)) {
        var m601 = [], w601 = [];
        m601.push("Your passport nationality appears to be on the Electronic Travel Authority (subclass 601) eligible list: stays of up to 3 months at a time.");
        w601.push("You must apply for the ETA before travelling, normally through the Australian ETA app.");
        extrasComunes(m601, w601);
        cards.push(card("601", "au_tourist_601", "Electronic Travel Authority (subclass 601)", 56, m601, w601, []));
      }

      /* — Visitor 600: para cualquier nacionalidad; principal si no hay lista — */
      var m600 = [], w600 = [], score600;
      if (cards.length) {
        score600 = 44;
        m600.push("The full Visitor visa (subclass 600) is available to any nationality.");
      } else {
        score600 = 48;
        w600.push("Your passport nationality does not appear on the eVisitor or ETA eligible lists, so a full Visitor visa (subclass 600) application is likely required.");
      }
      if (p.currentResidence === "AU") {
        score600 -= 8;
        w600.push("This tourist stream requires you to be outside Australia when you apply and when the visa is decided.");
      } else {
        m600.push("Your current residence appears consistent with an outside-Australia tourist stream, but your actual location at application time must be checked.");
      }
      extrasComunes(m600, w600);
      finReq("You must have, or have access to, enough money to support yourself while in Australia. Wayfare does not currently assess financial evidence.", w600);
      S600.notEvaluated.forEach(function(req) { w600.push(req); });
      cards.push(card("600", "au_tourist_600", "Visitor visa (subclass 600)", score600, m600, w600, []));

      return cards;
    },

    work_and_holiday: function (p) {
      /* ── Australia Working Holiday routes ──────────────────────────────
         Two official routes, evaluated by passport nationality:
           subclass 417 — Working Holiday visa          (implemented)
           subclass 462 — Work and Holiday visa         (implemented)
         Data sourced from immi.homeaffairs.gov.au (simulated representation).
      ─────────────────────────────────────────────────────────────────── */

      /* ── Subclass 417 data ─────────────────────────────────────────── */
      var S417 = {
        subclass:      "417",
        route:         "subclass_417",
        officialName:  "Working Holiday visa (subclass 417)",
        stayMonths:    12,
        costAUD:       840,   /* First WHM desde 1-jul-2026 (antes 670) */
        minSavingsAUD: 5000,
        /* Per-passport maximum age; minimum is 18 for all */
        eligiblePassports: {
          BE: 30, CA: 35, CY: 30, DK: 35, EE: 30,
          FI: 30, FR: 35, DE: 30, HK: 30, IE: 35,
          IT: 35, JP: 30, KR: 30, MT: 30, NL: 30,
          NO: 30, SE: 30, TW: 30, GB: 35,
        },
        notEvaluated: [
          "You must apply online from outside Australia.",
          "You must apply on your own and cannot include family members in the application.",
          "You must not be accompanied by dependent children.",
          "You must not have previously entered Australia on a subclass 417 or 462 visa.",
          "You must meet health and character requirements.",
          "You must have paid back, or arranged to repay, any debts to the Australian Government.",
          "Your immigration history, including cancelled visas or refused applications, may be considered.",
          "You must acknowledge the Australian Values Statement.",
        ],
      };

      /* ── Subclass 462 data ─────────────────────────────────────────── */
      var S462 = {
        subclass:      "462",
        route:         "subclass_462",
        officialName:  "Work and Holiday visa (subclass 462)",
        stayMonths:    12,
        costAUD:       840,   /* First desde 1-jul-2026 (antes 670) */
        minSavingsAUD: 5000,
        maxAge:        30,   /* all 462 passports: 18–30 inclusive */

        /* All eligible passport codes */
        eligiblePassports: [
          "AR","AT","BR","CL","CN","CZ","EC","GR","HU","IN","ID","IL",
          "LU","MY","MN","PG","PE","PL","PT","SM","SG","SK","SI","ES",
          "CH","TH","TR","UY","US","VN"
        ],

        /* Passports requiring ballot/pre-application selection */
        ballotPassports: ["CN","IN","VN"],

        /* Passports requiring government letter of support */
        letterOfSupportPassports: ["EC","GR","ID","MY","MN","PE","PL","SM","SI","TH","TR"],

        /* Education groups by passport */
        eduGroups: {
          /* Group A: tertiary OR 2 years undergraduate */
          A: ["AR","AT","CN","CZ","EC","GR","HU","ID","LU","MN","PG","PE","PL","PT","SM","SG","SK","SI","ES","TR","UY","VN"],
          /* Group B: 2 years post-secondary */
          B: ["BR","IN"],
          /* Group C: Chile — tertiary or 3rd year undergraduate */
          C: ["CL"],
          /* Group D: Israel — Senior Secondary + military */
          D: ["IL"],
          /* Group E: Malaysia — tertiary qualification */
          E: ["MY"],
          /* Group F: Thailand — tertiary from university/college */
          F: ["TH"],
          /* Group G: Switzerland — 2 years post-compulsory */
          G: ["CH"],
          /* Group H: United States — Senior Secondary or equivalent */
          H: ["US"],
        },

        notEvaluated: [
          "You must apply online from outside Australia.",
          "You must apply on your own and cannot include family members in the application.",
          "You must not be accompanied by dependent children.",
          "You must not have previously entered Australia on a subclass 462 or 417 visa.",
          "You must meet health and character requirements.",
          "You must have paid back, or arranged to repay, any debts to the Australian Government.",
          "Your immigration history, including cancelled visas or refused applications, may be considered.",
          "You must acknowledge the Australian Values Statement.",
          "Requirements are based on simulated guidance and must be checked against official Australian immigration sources.",
        ],
      };

      /* ── Result helpers ────────────────────────────────────────────── */
      function makeResult(data, score, matched, warnings, missing) {
        var r = visaResult("work_and_holiday", score, matched, warnings, missing);
        r.subclass     = data.subclass;
        r.route        = data.route;
        r.officialName = data.officialName;
        return r;
      }

      var nat = p.nationality;

      /* ── Route selection: 417 first, then 462, then neither ─────────── */

      /* ════════ SUBCLASS 417 ════════════════════════════════════════════ */
      var maxAge417 = S417.eligiblePassports[nat];
      if (maxAge417 !== undefined) {
        var m = [], w = [], x = [], score = 0;
        score += 42;
        m.push("Your passport appears to match the subclass 417 eligible passport list.");

        if (p.age < 18 || p.age > maxAge417) {
          x.push("maxAge");
          w.push(maxAge417 === 35
            ? "Your age appears to be outside the allowed range for subclass 417. The allowed range for your passport is 18 to 35."
            : "Your age appears to be outside the allowed range for subclass 417. The allowed range for your passport is 18 to 30."
          );
          w.push("Requirements are based on simulated guidance and must be checked against official Australian immigration sources.");
          return makeResult(S417, clamp(score - 30, 0, 35), m, w, x);
        }
        score += 40;
        m.push(maxAge417 === 35
          ? "Your age appears to be within the allowed range for your passport under subclass 417 (18 to 35)."
          : "Your age appears to be within the allowed range for your passport under subclass 417 (18 to 30)."
        );
        finReq("You may need around AUD 5,000 for your initial stay, plus enough to cover onward travel after leaving Australia.", w);
        S417.notEvaluated.forEach(function(req) { w.push(req); });
        w.push("Requirements are based on simulated guidance and must be checked against official Australian immigration sources.");
        return makeResult(S417, score, m, w, x);
      }

      /* ════════ SUBCLASS 462 ════════════════════════════════════════════ */
      if (inList(S462.eligiblePassports, nat)) {
        var m = [], w = [], x = [], score = 0;
        var edu = p.education;

        /* 1. Passport confirmed */
        score += 34;
        m.push("Your passport appears to match the subclass 462 eligible passport list.");

        /* 2. Age — all 462 passports: 18–30 inclusive */
        if (p.age < 18 || p.age > S462.maxAge) {
          x.push("maxAge");
          w.push("Your age appears to be outside the 18 to 30 range for subclass 462.");
          w.push("Requirements are based on simulated guidance and must be checked against official Australian immigration sources.");
          return makeResult(S462, clamp(score + 5, 0, 38), m, w, x);
        }
        score += 24;
        m.push("Your age appears to be within the 18 to 30 range.");

        /* 3. Education — varies by passport group */
        var eduGroup = null;
        var grps = S462.eduGroups;
        if (inList(grps.A, nat)) eduGroup = "A";
        else if (inList(grps.B, nat)) eduGroup = "B";
        else if (inList(grps.C, nat)) eduGroup = "C";
        else if (inList(grps.D, nat)) eduGroup = "D";
        else if (inList(grps.E, nat)) eduGroup = "E";
        else if (inList(grps.F, nat)) eduGroup = "F";
        else if (inList(grps.G, nat)) eduGroup = "G";
        else if (inList(grps.H, nat)) eduGroup = "H";

        var eduOk = false;
        if (eduGroup === "A") {
          eduOk = (edu === "university_plus");
          if (eduOk) { score += 16; m.push("Your education appears to align with the subclass 462 education requirement for your passport."); }
          else { x.push("minEdu"); w.push("This passport route may require a tertiary qualification or completion of at least 2 years of undergraduate university study."); }
        } else if (eduGroup === "B") {
          eduOk = (edu === "university_plus");
          if (eduOk) { score += 16; m.push("Your education appears to align with the subclass 462 education requirement for your passport."); }
          else { x.push("minEdu"); w.push("This passport route may require at least 2 years of post-secondary study."); }
        } else if (eduGroup === "C") {
          eduOk = (edu === "university_plus");
          if (eduOk) { score += 16; m.push("Your education appears to align with the subclass 462 education requirement for your passport."); }
          else { x.push("minEdu"); w.push("Chile passport holders may need tertiary qualifications or completion/approval for third-year undergraduate study."); }
        } else if (eduGroup === "D") {
          eduOk = (edu === "secondary" || edu === "baccalaureate" || edu === "university_plus");
          if (eduOk) { score += 14; m.push("Your education appears to meet the Senior Secondary requirement for this passport route."); }
          else { x.push("minEdu"); w.push("Israel passport holders may need a Senior Secondary Certificate of Education or equivalent."); }
          w.push("Israel passport holders may also need to show completed military service or legal exemption from military service.");
        } else if (eduGroup === "E") {
          eduOk = (edu === "university_plus");
          if (eduOk) { score += 14; m.push("Your education appears to align with the subclass 462 education requirement for your passport."); w.push("Malaysia passport holders should verify their qualification type meets the accepted list (degrees, graduate diplomas, graduate certificates)."); }
          else { x.push("minEdu"); w.push("Malaysia passport holders may need an accepted tertiary qualification or completion of 2 years of undergraduate university study."); }
        } else if (eduGroup === "F") {
          eduOk = (edu === "university_plus");
          if (eduOk) { score += 14; m.push("Your education appears to align with the subclass 462 education requirement for your passport."); }
          else { x.push("minEdu"); w.push("Thailand passport holders may need a tertiary qualification from a university, college or training centre."); }
        } else if (eduGroup === "G") {
          eduOk = (edu === "baccalaureate" || edu === "university_plus");
          if (eduOk) { score += 14; m.push("Your education appears to align with the subclass 462 education requirement for your passport."); }
          else { x.push("minEdu"); w.push("Switzerland passport holders may need to show 2 years of study following compulsory schooling."); }
        } else if (eduGroup === "H") {
          eduOk = (edu === "secondary" || edu === "baccalaureate" || edu === "university_plus");
          if (eduOk) { score += 14; m.push("Your education appears to align with the subclass 462 education requirement for your passport."); }
          else { x.push("minEdu"); w.push("United States passport holders may need a Senior Secondary Certificate of Education or equivalent."); }
        }

        /* 4. English — Functional English check */
        /* US passport is listed as Functional English evidence */
        var engOk = false;
        if (nat === "US") {
          engOk = true;
          score += 8;
          m.push("Your English level appears to align with the Functional English requirement.");
        } else if (engRank(p.english) >= engRank("intermediate")) {
          engOk = true;
          score += 8;
          m.push("Your English level appears to align with the Functional English requirement.");
        } else {
          x.push("minEnglish");
          w.push("You may need to show Functional English through an approved passport, study history, or English test/assessment.");
          if (nat === "IL") w.push("Israel passport holders may need to show Functional English through the English Bagrut route or another approved method.");
        }

        /* 5. Letter of support — informational for relevant passports */
        if (inList(S462.letterOfSupportPassports, nat)) {
          if (nat === "MY") {
            w.push("Malaysia passport holders may need a Good Conduct Certificate or accepted support document.");
          } else {
            w.push("This passport route may require a government letter of support or an accepted alternative.");
          }
        }

        /* 6. Financial — informational only */
        finReq("You may need around AUD 5,000 for your initial stay, plus enough to cover onward travel after leaving Australia.", w);

        /* 7. Not-evaluated official requirements */
        S462.notEvaluated.forEach(function(req) { w.push(req); });

        /* 8. Ballot cap for CN, IN, VN */
        if (inList(S462.ballotPassports, nat)) {
          w.push("Passport holders from China, India and Vietnam must participate in a visa pre-application process/ballot and be randomly selected before they can apply. Wayfare cannot determine whether you have been selected.");
          w.push("You may need to be selected through the subclass 462 pre-application ballot before you can apply.");
          /* Cap at partial regardless of other factors */
          score = clamp(score, 0, 65);
          return makeResult(S462, score, m, w, x);
        }

        /* Cap at partial if education or English does not appear to match */
        if (x.indexOf("minEdu") !== -1 || x.indexOf("minEnglish") !== -1) {
          score = Math.min(score, 65);
        }

        return makeResult(S462, clamp(score, 0, 100), m, w, x);
      }

      /* ════════ NEITHER ROUTE MATCHES ═══════════════════════════════════ */
      var m = [], w = [], x = [];
      x.push("passport");
      w.push("Your passport does not appear to be listed for Australia's Working Holiday visa subclass 417 or Work and Holiday visa subclass 462.");
      w.push("Check the Australian Department of Home Affairs website for the full current eligibility lists.");
      return visaResult("work_and_holiday", 20, m, w, x);
    },


    student: function (p) {
      /* ── Student visa subclass 500 ──────────────────────────────────────
         Data sourced from immi.homeaffairs.gov.au (simulated representation).
         Many core requirements (CoE, OSHC, Genuine Student, financial
         evidence, health/character) cannot be assessed from the current
         questionnaire. Score is capped at partial (<70) as a result.
      ─────────────────────────────────────────────────────────────────── */
      var S500 = {
        subclass:     "500",
        route:        "subclass_500",
        officialName: "Student visa (subclass 500)",
        /* Non-evaluable requirements — always shown as warnings */
        notEvaluated: [
          "You must be enrolled in an eligible course of study in Australia.",
          "You must provide a valid Confirmation of Enrolment (CoE), unless another accepted evidence pathway applies.",
          "You must hold Overseas Student Health Cover (OSHC), unless an exemption applies.",
          "You may need to show evidence of English language skills, unless exempt.",
          "You must show that you are a genuine student and that studying in Australia is the primary reason for the visa.",
          "You must have enough money for your stay. Wayfare does not currently assess financial evidence.",
          "You must meet health and character requirements.",
          "If you are 18 or older, you must acknowledge the Australian Values Statement.",
          "You must have paid back, or arranged to repay, any debts to the Australian Government.",
          "Your immigration history, including cancelled visas or refused applications, may be considered.",
          "If applying while in Australia, you may need to hold an eligible substantive visa.",
          "Requirements are based on simulated guidance and must be checked against official Australian immigration sources.",
        ],
      };

      function s500Result(score, matched, warnings, missing) {
        var r = visaResult("student", score, matched, warnings, missing);
        r.subclass     = S500.subclass;
        r.route        = S500.route;
        r.officialName = S500.officialName;
        return r;
      }

      var m = [], w = [], x = [], score = 0;

      /* 1. Age — minimum is 6 */
      if (p.age < 6) {
        x.push("minAge");
        w.push("Student visa subclass 500 generally requires applicants to be at least 6 years old.");
        w.push("Requirements are based on simulated guidance and must be checked against official Australian immigration sources.");
        return s500Result(25, m, w, x);
      }
      score += 30;
      m.push("Your age appears to meet the minimum age requirement for subclass 500.");

      if (p.age < 18) {
        w.push("Applicants under 18 may need to prove adequate welfare arrangements while in Australia.");
        w.push("For applicants under 18, the visa may not be granted if it is not in the best interests of the child.");
      }

      /* 2. English — soft check, exemptions can apply */
      if (engRank(p.english) >= engRank("intermediate")) {
        score += 20;
        m.push("Your English level appears to align with the possible English evidence requirement, although official evidence may still be required.");
      } else {
        x.push("minEnglish");
        w.push("You may need to provide evidence of English language skills or fall into an exemption category.");
      }

      /* 3. Education — soft context only, not a hard gate */
      var edu = p.education;
      if (edu === "secondary" || edu === "baccalaureate" || edu === "university_plus") {
        score += 10;
        m.push("Your education background may support a student visa pathway, depending on your intended course.");
      } else {
        w.push("Your intended course and enrolment evidence will be more important than prior education level.");
      }

      /* 4. Non-evaluable requirements — always shown */
      S500.notEvaluated.forEach(function(req) { w.push(req); });

      /* Cap at partial: core requirements (CoE, OSHC, Genuine Student,
         finances, health/character) cannot be assessed by Wayfare */
      score = Math.min(score, 68);

      return s500Result(score, m, w, x);
    },


    work: function (p) {
      var m = [], w = [], x = [], score = 0;
      var pt = passportTier(p.nationality);
      if (pt <= 2) { score += 16; m.push("Your passport nationality is generally accepted for Australian skilled work visa pathways."); }
      else         { score += 6;  w.push("Sponsorship and visa assessment may be more complex for your passport nationality."); }
      score += scoreEdu(p, "university_plus", 32);
      if (eduRank(p.education) < eduRank("university_plus")) { x.push("minEdu"); }
      else { m.push("Your education level appears to meet typical skilled worker requirements."); }
      score += scoreEng(p, "advanced", 28);
      if (engRank(p.english) < engRank("advanced")) { x.push("minEnglish"); }
      else { m.push("Your English level appears to meet the advanced threshold."); }
      finReq("You may need to show sufficient funds for relocation. Check official Australian skilled visa requirements.", w);
      w.push("Most Australian work visas require a job offer or employer sponsorship. This is simulated guidance only.");
      return visaResult("work", score, m, w, x);
    },

    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 0;
      w.push("Australia does not currently offer a dedicated Digital Nomad visa. Remote work on a visitor visa is a legally uncertain arrangement.");
      if (!p.remoteWork) {
        w.push("Remote work status is the primary factor for digital nomad-style stays.");
        finReq("You may need to show sufficient funds for your stay. Check official visitor visa requirements.", w);
        return visaResult("digital_nomad", 10, m, w, x);
      }
      score += 28;
      m.push("Your profile indicates remote work, which is the main factor for this route.");
      if (p.monthlyIncome) w.push("Income requirements for extended stays should be verified against official visitor visa guidance.");
      finReq("You may need to show sufficient funds for your planned stay. Check official visitor visa requirements.", w);
      return visaResult("digital_nomad", clamp(score, 0, 40), m, w, x);
    },
  };

  /* ── NEW ZEALAND — Working Holiday, country-by-country ───────────────────
     Immigration New Zealand sets country-specific Working Holiday conditions,
     so each eligible nationality has its own config. Shared logic lives in
     nzWorkingHoliday(); per-country differences (age cap, funds, quota,
     employer limits, China-specific rules) come from the NZ_WHV table.
     Money is never scored — funds appear as informational warnings only.
     Passport and age can affect score/status; conditions the questionnaire
     cannot verify appear as warnings, not hard failures.
  ─────────────────────────────────────────────────────────────────────── */
  var NZ_WHV = {
    AR: { name: "Argentina Working Holiday Visa", maxAge: 35, quota: 1000, funds: 4200 },
    AT: { name: "Austria Working Holiday Visa",   maxAge: 30, quota: 100,  funds: 2250 },
    BE: { name: "Belgium Working Holiday Visa",   maxAge: 30, quota: null, funds: 4200, beValidity: true },
    BR: { name: "Brazil Working Holiday Visa",    maxAge: 30, quota: 300,  funds: 4200, employerMonths: 3 },
    CA: { name: "Canada Working Holiday Visa",    maxAge: 35, quota: null, funds: 4200, longStayMedical: true, caDuration: true },
    CL: { name: "Chile Working Holiday Visa",     maxAge: 35, quota: 940,  funds: 4200, employerMonths: 6 },
    CN: { name: "China Working Holiday Visa",     maxAge: 30, quota: 1000, funds: 4200, employerMonths: 6, china: true },
    CZ: { name: "Czech Working Holiday Visa",     maxAge: 35, quota: 1200, funds: 4200, czExtension: true },
    DE: { name: "Germany Working Holiday Visa",   maxAge: 30, quota: null, funds: 4200, czExtension: true, frPhysicalPassport: true },
    DK: { name: "Denmark Working Holiday Visa",   maxAge: 30, quota: null, funds: 4200, employerMonths: 3, beValidity: true },
    EE: { name: "Estonia Working Holiday Visa",   maxAge: 30, quota: 100,  funds: 4200, employerMonths: 3, czExtension: true },
    ES: { name: "Spain Working Holiday Visa",     maxAge: 30, quota: 2000, funds: 4200, czExtension: true },
    FI: { name: "Finland Working Holiday Visa",   maxAge: 35, quota: null, funds: 4200, beValidity: true },
    FR: { name: "France Working Holiday Visa",    maxAge: 30, quota: null, funds: 4200, czExtension: true, frPhysicalPassport: true },
    GB: { name: "United Kingdom Working Holiday Visa", maxAge: 35, quota: 15000, funds: null, czExtension: true, uk: true },
    HR: { name: "Croatia Working Holiday Visa",   maxAge: 30, quota: 100,  funds: 4200, employerMonths: 3 },
    HU: { name: "Hungary Working Holiday Visa",   maxAge: 35, quota: 100,  funds: 4200, employerMonths: 3, czExtension: true },
    IE: { name: "Ireland Working Holiday Visa",   maxAge: 30, quota: null, funds: 4200, czExtension: true },
    IT: { name: "Italy Working Holiday Visa",     maxAge: 30, quota: null, funds: 4200, employerMonths: 3, czExtension: true },
    JP: { name: "Japan Working Holiday Visa",     maxAge: 30, quota: null, funds: 4200, czExtension: true },
    LT: { name: "Lithuania Working Holiday Visa", maxAge: 30, quota: 100,  funds: 4200, employerMonths: 6, czExtension: true },
    LU: { name: "Luxembourg Working Holiday Visa",maxAge: 30, quota: 50,   funds: 4200, employerMonths: 3, czExtension: true },
    LV: { name: "Latvia Working Holiday Visa",    maxAge: 30, quota: 100,  funds: 4200, employerMonths: 3 },
    MX: { name: "Mexico Working Holiday Visa",    maxAge: 30, quota: 200,  funds: 4200, employerMonths: 3, czExtension: true },
    NL: { name: "Netherlands Working Holiday Visa",maxAge: 30, quota: null, funds: 4200, czExtension: true },
    NO: { name: "Norway Working Holiday Visa",    maxAge: 30, quota: null, funds: 4200, beValidity: true },
    PE: { name: "Peru Working Holiday Visa",      maxAge: 30, quota: 100,  funds: 4200, employerMonths: 3, czExtension: true, peru: true },
    PL: { name: "Poland Working Holiday Visa",    maxAge: 30, quota: 100,  funds: 4200, employerMonths: 3, czExtension: true },
    PT: { name: "Portugal Working Holiday Visa",  maxAge: 30, quota: 50,   funds: 4200, employerMonths: 3, czExtension: true },
    SE: { name: "Sweden Working Holiday Visa",    maxAge: 30, quota: null, funds: 4200, beValidity: true },
    TR: { name: "Turkey Working Holiday Visa",    maxAge: 30, quota: 100,  funds: 7000, employerMonths: 3, czExtension: true, turkey: true },
    US: { name: "USA Working Holiday Visa",       maxAge: 30, quota: null, funds: 4200, czExtension: true, residenceNote: true },
    UY: { name: "Uruguay Working Holiday Visa",   maxAge: 35, quota: 200,  funds: 4200, czExtension: true },
  };

  function nzWhResult(cfg, score, m, w, x) {
    var r = visaResult("work_and_holiday", score, m, w, x);
    if (cfg) {
      r.officialName = cfg.name;
      r.route        = "nz_working_holiday";
    }
    return r;
  }

  /* Shared Working Holiday conditions — all informational (money not scored) */
  function nzSharedWarnings(p, cfg, w) {
    /* Citizenship + passport validity */
    w.push("You must be a citizen of the country offering this Working Holiday arrangement and hold a valid passport.");
    if (cfg.beValidity) {
      /* Belgium has a different passport-validity rule by where you apply */
      w.push("If you apply from outside New Zealand, your passport may need to be valid for at least 15 months after you arrive.");
      w.push("If you apply from inside New Zealand, your passport may need to be valid for at least 3 months after the visa expires.");
    } else {
      w.push("Your passport should be valid for at least 3 months after the visa expires.");
    }
    if (cfg.frPhysicalPassport) {
      w.push("You must hold a valid physical passport when you apply; without one your application may be declined.");
    }
    if (cfg.residenceNote) {
      w.push("You must normally live in the USA.");
    }
    /* Funds — informational only (PE, TR and GB show their own funds warning instead) */
    if (!cfg.peru && !cfg.turkey && !cfg.uk) {
      finReq(cfg.funds === 2250
        ? "You may need to show around NZD 2,250 in living expenses, plus enough funds for onward travel."
        : "You may need to show around NZD 4,200 in living expenses, plus enough funds for onward travel.", w);
    }
    /* Onward travel funds or ticket */
    w.push("You must have funds for onward travel, or a ticket to leave New Zealand.");
    /* Application cost */
    w.push("The application fee starts from NZD 770.");
    /* Quota — informational metadata */
    if      (cfg.quota === 15000) w.push("This visa has a limited annual quota of about 15,000 places, which can run out.");
    else if (cfg.quota === 2000) w.push("This visa has a limited annual quota of about 2,000 places, which can run out.");
    else if (cfg.quota === 1200) w.push("This visa has a limited annual quota of about 1,200 places, which can run out.");
    else if (cfg.quota === 1000) w.push("This visa has a limited annual quota of about 1,000 places, which can run out.");
    else if (cfg.quota === 940)  w.push("This visa has a limited annual quota of about 940 places, which can run out.");
    else if (cfg.quota === 300)  w.push("This visa has a limited annual quota of about 300 places, which can run out.");
    else if (cfg.quota === 200)  w.push("This visa has a limited annual quota of about 200 places, which can run out.");
    else if (cfg.quota === 100)  w.push("This visa has a limited annual quota of about 100 places, which can run out.");
    else if (cfg.quota === 50)   w.push("This visa has a limited annual quota of about 50 places, which can run out.");
    /* Insurance — required for all WHV schemes EXCEPT the United Kingdom (cfg.uk).
       Official INZ exemption also covers Ireland/Japan/Malaysia, deferred until their
       own evidence capture (Phase 7E/7F). */
    if (!cfg.uk) {
      w.push("You must hold full medical and hospital insurance for your entire stay in New Zealand.");
    }
    /* Health and character (shared phrasing with Australia) */
    w.push("You must meet health and character requirements.");
    /* Immigration NZ may request extra evidence */
    w.push("Immigration New Zealand may ask for medical examinations, chest X-rays or police certificates.");
    /* Genuine intention */
    w.push("You must have a genuine intention to holiday in New Zealand, with any work being secondary.");
    /* Plan to leave */
    w.push("You must plan to leave New Zealand at the end of your stay.");
    /* No previous WHV */
    w.push("You must not have held a New Zealand Working Holiday visa before, unless a country-specific subsequent or extension rule applies.");
    /* No permanent job / no job offer needed */
    w.push("You cannot take permanent employment, and no job offer is required before you apply.");
    /* Partner / child */
    w.push("Any partner or child travelling with you must apply for their own visa.");
    /* Work allowance */
    w.push("You can work in temporary jobs during your stay.");
    /* Employer limit */
    if      (cfg.employerMonths === 3) w.push("You can work for any one employer for up to 3 months.");
    else if (cfg.employerMonths === 6) w.push("You can work for any one employer for up to 6 months.");
    /* Study allowance */
    w.push("You can study or train for up to 6 months during your stay.");
    /* Canada duration + subsequent route */
    if (cfg.caDuration) {
      w.push("You can apply for a 12-month or a 23-month visa.");
      w.push("With a 12-month visa, you may later apply for a subsequent work visa to extend your stay up to 23 months if you meet extra criteria.");
    }
    /* Canada long-stay medical */
    if (cfg.longStayMedical) w.push("If you stay longer than 12 months, you may need a chest X-ray and medical examination.");
    /* Czech seasonal extension */
    if (cfg.czExtension) w.push("You may be able to stay longer by applying for a Working Holiday Extension Work Visa if you do seasonal work in the viticulture or horticulture industries.");
    /* Travel in and out */
    w.push("You can travel in and out of New Zealand while your visa is valid.");
    /* Simulated guidance note */
    w.push("This is simulated guidance only. Always verify with Immigration New Zealand.");
  }

  function nzWorkingHoliday(p) {
    var nat = p.nationality;
    var cfg = NZ_WHV[nat];

    /* Passport not on the curated NZ Working Holiday country list */
    if (!cfg) {
      var mn = [], wn = [], xn = [];
      xn.push("passport");
      wn.push("Your passport does not appear to be on the New Zealand Working Holiday visa country list that Wayfare currently covers.");
      wn.push("Check Immigration New Zealand for the full list of eligible countries and conditions.");
      return nzWhResult(null, 18, mn, wn, xn);
    }

    var m = [], w = [], x = [], score = 0, cap = 100;

    /* 1. Passport / country scheme */
    score += 42;
    m.push("Your passport appears to be eligible for a New Zealand Working Holiday visa.");

    /* 2. Age — minimum 18, maximum is country-specific */
    if (p.age < 18 || p.age > cfg.maxAge) {
      x.push("maxAge");
      w.push(cfg.maxAge === 35
        ? "Your age appears to be outside the eligible range for this visa. The range is 18 to 35."
        : "Your age appears to be outside the eligible range for this visa. The range is 18 to 30.");
      nzSharedWarnings(p, cfg, w);
      /* Passport matches but age is out of range — ineligible */
      return nzWhResult(cfg, 32, m, w, x);
    }
    score += 38;
    m.push(cfg.maxAge === 35
      ? "Your age appears to be within the eligible range for this visa (18 to 35)."
      : "Your age appears to be within the eligible range for this visa (18 to 30).");

    /* 3. China-specific verifiable conditions (residence, education, English).
       Caps reflect that residence, official English tests and CSSD/qualification
       verification cannot be confirmed by Wayfare. */
    if (cfg.china) {
      /* Residence — must normally live in China and be in China when applying */
      if (p.currentResidence === "CN") {
        m.push("You appear to be living in China, which this visa requires.");
      } else {
        w.push("This visa requires you to normally live in China and to be in China when you apply. Your current residence does not appear to be China.");
        cap = Math.min(cap, 58);
      }
      w.push("You must not have been outside China for more than 2 years immediately before you apply.");
      /* Education — senior high school, at least 3 years full-time study */
      if (eduRank(p.education) >= eduRank("secondary")) {
        m.push("Your education appears to meet the senior high school requirement for this visa.");
      } else {
        x.push("minEdu");
        w.push("This visa requires a senior high school qualification involving at least 3 years of full-time study.");
        cap = Math.min(cap, 62);
      }
      w.push("Your senior high school qualification may need to be verified by CSSD, Ministry of Education, PRC.");
      /* English — must speak and understand English */
      if (engRank(p.english) >= engRank("intermediate")) {
        m.push("Your English level appears to meet the requirement to speak and understand English.");
      } else {
        x.push("minEnglish");
        w.push("You must be able to speak and understand English, and may need an English test result that is no more than 2 years old.");
        cap = Math.min(cap, 62);
      }
      /* Extra documents */
      w.push("You must complete the Supplementary Form for Chinese citizens, and your Hukou household registration book may be used as additional identity evidence.");
      w.push("If you are coming to New Zealand for more than 6 months, applicants from China, Hong Kong or Macao may need a recent chest X-ray.");
    }

    /* 3b. Peru-specific verifiable condition (education). English/funds are
       informational only — English here only changes the funds amount. */
    if (cfg.peru) {
      if (eduRank(p.education) >= eduRank("university_plus")) {
        m.push("Your education appears to meet the requirement of at least 3 years of full-time study towards a tertiary qualification.");
      } else {
        x.push("minEdu");
        w.push("This visa requires you to have completed at least 3 years of full-time study towards a tertiary qualification.");
        cap = Math.min(cap, 62);
      }
      w.push("Your qualifications or course transcript must be verified by the Peru Ministry of Foreign Affairs.");
      w.push("If you have an acceptable English language test result that is no more than 2 years old, you need at least NZD 4,200; otherwise you need at least NZD 7,000.");
    }

    /* 3c. Turkey-specific verifiable conditions (education + English). Funds
       (NZD 7,000) and quota remain informational only. */
    if (cfg.turkey) {
      if (eduRank(p.education) >= eduRank("university_plus")) {
        m.push("Your education appears to meet the requirement of a tertiary qualification involving at least 4 years of full-time study.");
      } else {
        x.push("minEdu");
        w.push("This visa requires a tertiary qualification involving at least 4 years of full-time study.");
        cap = Math.min(cap, 62);
      }
      if (engRank(p.english) >= engRank("intermediate")) {
        m.push("Your English level appears to meet the requirement to speak and understand English.");
      } else {
        x.push("minEnglish");
        w.push("You must be able to speak and understand English, and provide an acceptable English test result or a tertiary qualification taught entirely in English.");
        cap = Math.min(cap, 62);
      }
      w.push("You must have at least NZD 7,000 to cover your living expenses.");
    }

    /* 3d. United Kingdom-specific conditions — warning-only (no scoring cap,
       no missing items). Stay length, monthly funds and residence are not
       evaluable from the questionnaire, so they appear as warnings. */
    if (cfg.uk) {
      w.push("You can apply for a 12-month, 23-month or 36-month visa.");
      w.push("You must have at least NZD 350 a month to cover your living expenses, and the money for your onward ticket must be in addition to this.");
      w.push("You must normally live in the United Kingdom or the Crown Dependencies of Jersey, Guernsey or the Isle of Man.");
      w.push("To meet the residence requirement, you must not have been outside the United Kingdom or Crown Dependencies for more than 2 years immediately before applying.");
    }

    /* 4. Shared Working Holiday conditions — informational warnings only */
    nzSharedWarnings(p, cfg, w);

    /* Cap to partial when a verifiable China condition does not appear to match */
    score = Math.min(score, cap);

    return nzWhResult(cfg, clamp(score, 0, 100), m, w, x);
  }

  /* ── NEW ZEALAND ───────────────────────────────────────────────────────── */

  /* v1.24.0 — LISTAS OFICIALES de exención turística (idea #20; sustituyen
     al tier del prototipo en NZ/GB/CA). Capturadas 15-jul-2026:
     - NZ_VISA_WAIVER: immigration.govt.nz visa-waiver-countries-and-territories
     - GB_VISA_NATIONALS: gov.uk Immigration Rules Appendix Visitor: Visa national list
       (los listados NECESITAN visa de visitante)
     - CA_ETA_EXEMPT / CA_ETA_CONDITIONAL: canada.ca entry-requirements-country
       (condicionados: eTA en vez de visa solo por aire y con visa CA previa
       en 10 años o visa US vigente). Cobertura: los 68 pasaportes del selector. */
  var NZ_VISA_WAIVER = ["AD","AR","AT","BE","BG","BR","CA","CH","CL","CY","CZ","DE","DK","EE","ES","FI","FR","GB","GR","HR","HU","IE","IL","IS","IT","JP","KR","LI","LT","LU","LV","MT","MX","NL","NO","PL","PT","RO","SE","SI","SK","TW","US","UY"];
  var GB_VISA_NATIONALS = ["BO","CN","CO","CU","DO","EC","GE","GQ","HN","NI","RS","RU","SV","TR","UA","VE","IN","PH","NG","PK","EG","TH","ZA"];  /* + códigos heredados no seleccionables, también en la lista oficial */
  var CA_ETA_EXEMPT = ["AD","AT","AU","BE","BG","CH","CL","CY","CZ","DE","DK","EE","ES","FI","FR","GB","GR","HR","HU","IE","IL","IS","IT","JP","KR","LI","LT","LU","LV","MT","NL","NO","NZ","PL","PT","RO","SE","SI","SK","TW"];
  var CA_ETA_CONDITIONAL = ["AR","BR","CR","MX","PA","UY"];

  COUNTRY_RULES.NZ = {

    tourist: function (p) {
      /* ── Visitor Visa ────────────────────────────────────────────────────
         Data sourced from immigration.govt.nz (simulated representation).
         Core requirements (genuine visitor intent, funds, onward travel,
         health, character, passport validity, and whether a visa or an NZeTA
         is required) cannot be assessed from the current questionnaire, so the
         result is always partial — never fully eligible and never ineligible
         on passport alone. No passport-tier gate, no money scoring, no
         work-right scoring. NZeTA is informational only (not its own route).
      ─────────────────────────────────────────────────────────────────── */
      /* v1.83.0 — FASE 3: NZeTA y Visitor Visa como TARJETAS separadas.
         Exentos (lista oficial): tarjeta NZeTA + Visitor universal; AU:
         entrada sin visa ni NZeTA (tarjeta visitor con su línea especial);
         no exentos: solo Visitor. Rutas partidas en sources.json; mismas
         frases traducidas/ancladas. */
      var cards = [];
      var esWaiver = p.nationality !== "AU" && inList(NZ_VISA_WAIVER, p.nationality);

      if (esWaiver) {
        var mE = [], wE = [];
        mE.push("Your passport nationality is on New Zealand's visa waiver list: you do not need a visitor visa, but you must request an NZeTA (Electronic Travel Authority) before travelling.");
        wE.push("This is simulated guidance only. Always verify with Immigration New Zealand.");
        var rE = visaResult("tourist", 55, mE, wE, []);
        rE.officialName = "NZeTA (Electronic Travel Authority)";
        rE.route = "nz_tourist_nzeta";
        cards.push(rE);
      }

      var m = [], w = [], x = [], score;
      if (p.nationality === "AU") {
        score = 60;
        m.push("Australian citizens do not need a visa or NZeTA to visit New Zealand.");
      } else if (esWaiver) {
        score = 46;
        m.push("New Zealand's full Visitor Visa is available to any nationality.");
      } else {
        score = 42;
        w.push("Your passport nationality is not on New Zealand's visa waiver list: you need a visitor visa before travelling.");
      }
      if (p.remoteWork) {
        m.push("Your profile indicates remote work. Check the work conditions below for New Zealand Visitor Visa limits.");
      }
      w.push("A Visitor Visa is usually granted for up to either 6 months or 9 months (a single-entry visa can allow up to 9 months in an 18-month period).");
      w.push("You cannot work for a New Zealand employer or provide services in the New Zealand labour market on this visa. Remote work for an overseas employer, business, or client may be possible.");
      w.push("You can study for up to 3 months on a visitor visa.");
      w.push("You must be a genuine visitor who intends to leave New Zealand at the end of your visit.");
      finReq("You must have enough money for your stay — generally at least NZD 1,000 a month, or NZD 400 a month if your accommodation is already paid for. Wayfare does not assess financial evidence.", w);
      w.push("You must have a ticket for travel out of New Zealand, or enough money to buy one, in addition to your living costs.");
      w.push("You must be in good health. A chest X-ray may be required for stays over 6 months from higher-tuberculosis-risk countries.");
      w.push("You must be of good character, and may need to provide police certificates.");
      w.push("Your passport must be valid for at least 3 months after the date you plan to leave New Zealand.");
      w.push("You can include your partner and any dependent children aged 19 or younger in your application, or they can apply for their own visas.");
      w.push("This is simulated guidance only. Always verify with Immigration New Zealand.");
      score = clamp(score, 40, 68);
      var r = visaResult("tourist", score, m, w, x);
      r.officialName = "Visitor Visa";
      r.route        = "visitor_visa";
      cards.push(r);

      return cards;
    },

    /* Country-by-country Working Holiday — see nzWorkingHoliday() above */
    work_and_holiday: function (p) {
      return nzWorkingHoliday(p);
    },

    student: function (p) {
      /* ── Fee Paying Student Visa ─────────────────────────────────────────
         Data sourced from immigration.govt.nz (simulated representation).
         Core requirements (offer of place, tuition payment, funds, health,
         character, genuine intent, insurance) cannot be assessed from the
         current questionnaire, so the result is capped at partial and never
         fully eligible. No passport-tier gate, no money scoring, no work-right
         scoring. English/education provide only small soft positive signals.
      ─────────────────────────────────────────────────────────────────── */
      var m = [], w = [], x = [], score = 50;

      /* Soft positive signals only (never gate to ineligible) */
      if (engRank(p.english) >= engRank("intermediate")) {
        score += 8;
        m.push("English is not a fixed visa requirement, but your English level and any test results can help show your genuine intention to study.");
      } else {
        w.push("Your course may require evidence of English language ability. Requirements vary by provider and course.");
      }
      if (eduRank(p.education) >= eduRank("secondary")) {
        score += 6;
        m.push("Your education background may support entry to a range of courses, depending on your chosen provider.");
      }

      /* Under-10 guardian note (only when relevant; not a scoring gate) */
      if (p.age < 10) {
        w.push("Students under 10 years old generally need a parent or legal guardian living with them in New Zealand, unless you are living in an NZQA-approved hostel.");
      }

      /* Core requirements — informational warnings (not assessable here) */
      w.push("You must have an offer of place in an approved course of study from an approved education provider.");
      w.push("You must have enough money to pay your tuition fees or hold a scholarship, and show you have paid the tuition fees for 1 course or 1 year of study, whichever is shorter.");
      finReq("Tertiary, English-language or other non-compulsory study of 1 year or more generally requires about NZD 20,000 per year for living costs (or about NZD 1,667 per month if your study is shorter than 1 year). Wayfare does not assess financial evidence.", w);
      finReq("School students in years 1–13 generally need about NZD 17,000 per year for living costs (or about NZD 1,417 per month if the study is shorter than 1 year).", w);
      finReq("You may need to show bank statements covering the last 3 months. Large deposits may need a source explanation.", w);
      w.push("You must have a paid onward travel ticket, or enough money to buy one, in addition to your living costs.");
      w.push("You must be in good health. A chest X-ray or medical exam may be required depending on your stay length and tuberculosis-risk country rules.");
      w.push("You must be of good character. Police certificates may be required if you are 17 or older and your total time in New Zealand will be 24 months or longer.");
      w.push("You must genuinely intend to study, and be a bona fide applicant who intends to leave New Zealand at the end of your visa.");
      w.push("You must have travel and health insurance acceptable to your education provider, from the start of your course until your visa expires.");
      w.push("A Fee Paying Student Visa can be granted for up to 4 years, depending on your course.");
      w.push("Work rights are informational only: you may be able to work part-time up to 25 hours per week during your studies, and full-time during scheduled holidays, if your visa conditions allow.");
      w.push("This is simulated guidance only. Always verify with Immigration New Zealand.");

      /* Cap at partial (40–68): core requirements cannot be verified by Wayfare */
      score = clamp(score, 40, 68);

      var r = visaResult("student", score, m, w, x);
      r.officialName = "Fee Paying Student Visa";
      r.route        = "fee_paying_student";
      return r;
    },

    work: function (p) {
      var m = [], w = [], x = [], score = 0;
      var pt = passportTier(p.nationality);
      if (pt <= 2) { score += 16; m.push("Your passport nationality appears generally accepted for New Zealand work pathways."); }
      else         { score += 6;  w.push("Employer sponsorship requirements may be more complex for your passport nationality."); }
      score += scoreEdu(p, "university_plus", 32);
      if (eduRank(p.education) < eduRank("university_plus")) { x.push("minEdu"); }
      else { m.push("Your education level appears to meet skilled worker requirements."); }
      score += scoreEng(p, "advanced", 28);
      if (engRank(p.english) < engRank("advanced")) { x.push("minEnglish"); }
      else { m.push("Your English level appears to meet the threshold."); }
      finReq("You may need to show sufficient funds for relocation. Check Immigration New Zealand for current requirements.", w);
      w.push("An Accredited Employer Work Visa typically requires a job offer from a NZ employer. Simulated guidance only.");
      return visaResult("work", score, m, w, x);
    },

    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 0;
      w.push("New Zealand does not currently offer a dedicated Digital Nomad visa.");
      if (!p.remoteWork) {
        finReq("You may need to show sufficient funds for your stay. Check official visitor visa requirements.", w);
        return visaResult("digital_nomad", 8, m, w, x);
      }
      score += 28; m.push("Your profile indicates remote work, which is the main factor for nomad-style stays.");
      if (p.monthlyIncome) w.push("Income requirements for extended stays should be verified against official visitor visa guidance.");
      finReq("You may need to show sufficient funds for your stay. Check official visitor visa requirements.", w);
      return visaResult("digital_nomad", clamp(score, 0, 40), m, w, x);
    },
  };

  /* ── CANADA ────────────────────────────────────────────────────────────── */
  COUNTRY_RULES.CA = {

    tourist: function (p) {
      /* v1.84.0 — FASE 3: eTA de Canadá y visitor visa (TRV) separadas.
         Exentos: tarjeta eTA + TRV universal; US: sin visa ni eTA (línea en
         la TRV); condicionales y resto: solo TRV. */
      var cards = [];
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      if (nat !== "US" && inList(CA_ETA_EXEMPT, nat)) {
        var mE = [], wE = [];
        mE.push("Your passport nationality is visa-exempt for Canada: you need an eTA (Electronic Travel Authorization) to fly, not a visitor visa.");
        wE.push("This is simulated guidance only. Verify with IRCC (Immigration, Refugees and Citizenship Canada).");
        var rE = visaResult("tourist", 55, mE, wE, []);
        rE.officialName = "Canada eTA (Electronic Travel Authorization)";
        rE.route = "ca_tourist_eta";
        cards.push(rE);
      }
      /* v1.24.0 — listas OFICIALES de canada.ca (antes tier del prototipo) */
      if (nat === "US") {
        score += 60;
        m.push("US citizens do not need a visa or an eTA to visit Canada.");
      } else if (inList(CA_ETA_EXEMPT, nat)) {
        score += 46;
        m.push("Canada's full visitor visa (TRV) is available to any nationality.");
      } else if (inList(CA_ETA_CONDITIONAL, nat)) {
        score += 42;   /* vía real (eTA condicionada) => banda parcial, no "poco probable" */
        w.push("Canada requires a visitor visa for your nationality, but you may be eligible for an eTA instead if you travel by air and have held a Canadian visa in the last 10 years or hold a valid US visa.");
        x.push("passport");
      } else {
        score += 8;
        w.push("A visitor visa is likely required. Approval rates and documentation requirements vary by nationality.");
        x.push("passport");
      }
      if (p.remoteWork) m.push("Proof of regular remote income may support the visa application.");
      /* Phase 10M tune-up — conservative checklist warnings (10K-verified figures; time-sensitive) */
      w.push("You must be a genuine visitor who will leave Canada at the end of your stay.");
      finReq("You must be able to support yourself and any family members during your stay.", w);
      w.push("As a visitor you cannot work for a Canadian employer; short courses of study may be possible - check IRCC conditions.");
      w.push("A visitor visa (TRV) costs CAN$100 per person and an eTA costs CAN$7. Fees can change - check IRCC.");
      w.push("You may need to give biometrics: CAN$85 per person or CAN$170 per family. Fees can change - check IRCC.");
      finReq("You may need to show sufficient funds for your stay. Check IRCC for current financial requirements.", w);
      w.push("This is simulated guidance only. Verify with IRCC (Immigration, Refugees and Citizenship Canada).");
      var r = visaResult("tourist", score, m, w, x);
      r.officialName = "Canada Visitor visa (TRV)";
      r.route        = "ca_visitor";
      cards.push(r);
      return cards;
    },

    work_and_holiday: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      function iecResult(sc) {
        var r = visaResult("work_and_holiday", sc, m, w, x);
        r.officialName = "IEC Working Holiday";
        r.route        = "ca_iec_working_holiday";
        return r;
      }
      if (!inList(PASSPORT.whCanada, nat)) {
        w.push("Your passport nationality does not appear in the simulated International Experience Canada (IEC) eligible list.");
        w.push("Check IRCC for the current list of IEC partner countries.");
        x.push("passport");
        return iecResult(10);
      }
      score += 42; m.push("Your passport nationality appears listed under International Experience Canada (IEC) Working Holiday.");
      score += scoreAge(p.age, 18, 35, 38);
      if (p.age < 18 || p.age > 35) { x.push("maxAge"); }
      else { m.push("Your age appears to fall within the typical eligible range."); }
      /* Phase 10M tune-up — IEC program vocabulary + fees (10K-verified; time-sensitive) */
      m.push("The IEC Working Holiday category gives an open work permit - you do not need a job offer and you can work for most employers in Canada.");
      w.push("Category availability and the upper age limit (30 or 35) depend on your country of citizenship - check the IEC country list.");
      finReq("You may need to show around CAD 2,500 for your initial stay. Check IRCC for current financial requirements.", w);
      w.push("You must have health insurance for the length of your stay; you may need to show proof at the border.");
      w.push("You may need a police certificate and/or a medical exam.");
      w.push("IEC fees: CAN$184.75 participation fee, plus the CAN$100 open work permit holder fee for Working Holiday, plus CAN$85 biometrics if required. Fees can change - check IRCC.");
      w.push("IEC places are allocated through random invitation draws (pools). Receiving an invitation is not guaranteed. Simulated guidance only.");
      w.push("Rounds of invitations and available spots change during the season.");
      return iecResult(score);
    },

    student: function (p) {
      var m = [], w = [], x = [], score = 0;
      var pt = passportTier(p.nationality);
      if (pt <= 2) { score += 18; m.push("Your passport nationality is generally accepted for Canadian study permit applications."); }
      else         { score += 7;  w.push("Additional financial and country-of-origin documentation may be required."); }
      score += scoreEng(p, "intermediate", 28);
      if (engRank(p.english) < engRank("intermediate")) { x.push("minEnglish"); }
      else { m.push("Your English level appears to meet general requirements."); }
      score += scoreEdu(p, "secondary", 18);
      if (eduRank(p.education) < eduRank("secondary")) x.push("minEdu");
      score += scoreAge(p.age, 17, 60, 10);
      finReq("You may need to show sufficient funds for tuition and living costs. Check IRCC for current requirements.", w);
      w.push("A letter of acceptance from a Designated Learning Institution (DLI) is required. Simulated guidance only.");
      /* Phase 10M tune-up — checklist warnings (10K-verified figures; time-sensitive) */
      w.push("Most applicants must include a provincial or territorial attestation letter (PAL/TAL) with the application.");
      finReq("For applications on or after September 1, 2025 (outside Quebec) you must show CAN$22,895 per year for a single applicant, excluding tuition and transportation; amounts scale with family size and can change.", w);
      w.push("The study permit fee is CAN$150. Fees can change - check IRCC.");
      w.push("You may need to give biometrics: CAN$85 per person.");
      w.push("You may need a medical exam and/or a police certificate.");
      w.push("You may be able to work while studying - conditions and hour limits apply; check IRCC.");
      w.push("You must show that your main purpose in Canada is to study.");
      /* Phase 10M: LOA/PAL/funds cannot be verified from the questionnaire —
         cap to partial so a strong profile never reads as approval (AU/NZ/GB pattern). */
      var r = visaResult("student", Math.min(score, 68), m, w, x);
      r.officialName = "Study permit";
      r.route        = "ca_study_permit";
      return r;
    },

    work: function (p) {
      var m = [], w = [], x = [], score = 0;
      var pt = passportTier(p.nationality);
      if (pt <= 2) { score += 16; m.push("Your passport nationality appears generally accepted for Canadian work permit pathways."); }
      else         { score += 6;  w.push("LMIA sponsorship and assessment may be more complex for your passport nationality."); }
      score += scoreEdu(p, "university_plus", 32);
      if (eduRank(p.education) < eduRank("university_plus")) { x.push("minEdu"); }
      else { m.push("Your education level appears to meet Express Entry / skilled worker requirements."); }
      score += scoreEng(p, "advanced", 28);
      if (engRank(p.english) < engRank("advanced")) { x.push("minEnglish"); }
      else { m.push("Your English level appears to meet the threshold."); }
      finReq("You may need to show sufficient funds for relocation. Check IRCC for current requirements.", w);
      w.push("Most Canadian work permits require a job offer or an Express Entry invitation. Simulated guidance only.");
      return visaResult("work", score, m, w, x);
    },

    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 0;
      w.push("Canada does not currently offer a dedicated Digital Nomad visa. Remote work on a visitor permit is legally uncertain.");
      if (!p.remoteWork) {
        finReq("You may need to show sufficient funds for your stay. Check official visitor visa requirements.", w);
        return visaResult("digital_nomad", 8, m, w, x);
      }
      score += 28; m.push("Your profile indicates remote work, which is the primary factor for this route.");
      if (p.monthlyIncome) w.push("Income requirements for extended stays should be verified against official visitor visa guidance.");
      finReq("You may need to show sufficient funds for your stay. Check official visitor visa requirements.", w);
      return visaResult("digital_nomad", clamp(score, 0, 40), m, w, x);
    },
  };

  /* ── SPAIN ─────────────────────────────────────────────────────────────── */
  COUNTRY_RULES.ES = {

    tourist: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      if (inList(PASSPORT.euEea, nat) || inList(PASSPORT.schengenFree, nat) || passportTier(nat) === 1) {
        score += 58;
        m.push("Your passport appears to allow visa-free access to the Schengen Area for short stays (up to 90 days in any 180-day period).");
      } else if (passportTier(nat) === 2) {
        score += 32;
        w.push("A Schengen visa application may be required for your passport nationality.");
        x.push("passport");
      } else {
        score += 8;
        w.push("A Schengen visa is likely required. Processing times and approval rates vary by nationality.");
        x.push("passport");
      }
      if (p.remoteWork) m.push("Proof of regular remote income may strengthen a Schengen visa application.");
      finReq("You may need to show sufficient funds for your stay. Check official Schengen visa requirements.", w);
      w.push("The 90/180-day Schengen rule applies. This is simulated guidance only.");
      var r = visaResult("tourist", score, m, w, x);
      r.officialName = "Schengen short stay (90/180)"; r.route = "es_schengen_visit";
      return r;
    },

    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      if (inList(PASSPORT.euEea, nat)) {
        m.push("As an EU/EEA citizen, you may live and work in Spain under freedom of movement without a Digital Nomad Visa.");
        w.push("EU freedom of movement rules apply. No Digital Nomad Visa is required.");
        var rEu = visaResult("digital_nomad", 82, m, w, x);
        rEu.officialName = "Spain Digital Nomad Visa (international teleworker)"; rEu.route = "es_dnv";
        return rEu;
      }
      if (!p.remoteWork) {
        w.push("The Spain Digital Nomad Visa (Ley de Startups) requires active remote employment or freelancing for a non-Spanish entity.");
        finReq("You may need to show sufficient financial means. Check official Spanish immigration sources for current requirements.", w);
        var rNo = visaResult("digital_nomad", 6, m, w, x);
        rNo.officialName = "Spain Digital Nomad Visa (international teleworker)"; rNo.route = "es_dnv";
        return rNo;
      }
      score += 48; m.push("Your profile indicates remote work, which appears to satisfy the primary condition.");
      if (passportTier(nat) <= 2) { score += 12; m.push("Your passport nationality is generally accepted for this visa route."); }
      else { w.push("Additional scrutiny may apply for your passport nationality."); }
      /* Income threshold is informational only — UGE oficial (capturado 14-jul-2026):
         "200% del salario mínimo interprofesional (SMI) vigente"; SMI 2026 = 1.221 €/mes (BOE RD 126/2026) */
      w.push("The Spain Digital Nomad Visa requires income of 200% of the Spanish minimum wage (about EUR 2,450/month with the 2026 SMI of EUR 1,221). Check the official threshold before applying.");
      w.push("You must show a working relationship of at least 3 months with your foreign employer or clients, and a degree or 3 years of professional experience.");
      finReq("You may need to show sufficient financial means. Check official Spanish immigration sources for current requirements.", w);
      w.push("Proof of remote work contract or freelance client invoices is required. This is simulated guidance based on approximate thresholds.");
      var r = visaResult("digital_nomad", score, m, w, x);
      r.officialName = "Spain Digital Nomad Visa (international teleworker)"; r.route = "es_dnv";
      return r;
    },

    student: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      if (inList(PASSPORT.euEea, nat)) { score += 22; m.push("EU/EEA citizens face minimal visa barriers for studying in Spain."); }
      else if (passportTier(nat) <= 2) { score += 16; m.push("Your passport nationality is generally accepted for Spanish student visa applications."); }
      else                              { score += 8;  w.push("Additional documentation requirements may apply for your passport nationality."); }
      score += scoreEng(p, "basic", 14);
      score += scoreEdu(p, "secondary", 24);
      if (eduRank(p.education) < eduRank("secondary")) x.push("minEdu");
      else m.push("Your education level appears to meet general requirements.");
      score += scoreAge(p.age, 17, 65, 10);
      finReq("You may need to show sufficient funds for tuition and living costs. Check official Spanish student visa requirements.", w);
      w.push("Enrollment acceptance from an accredited Spanish institution is required. Simulated guidance only.");
      m.push("This authorisation covers studies of more than 180 days.");
      var r = visaResult("student", score, m, w, x);
      r.officialName = "Spain long-term study stay"; r.route = "es_study";

      /* v1.86.0 — FASE 3: tarjeta hermana de CORTA duración (91–180 días),
         nivel modelado (línea preliminar) hasta capturar su fuente. */
      var mC = [], wC = [];
      mC.push("Spain's short-term study visa covers courses of 91 to 180 days.");
      wC.push("Enrollment acceptance from an accredited Spanish institution is required. Simulated guidance only.");
      finReq("You may need to show sufficient funds for tuition and living costs. Check official Spanish student visa requirements.", wC);
      wC.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var rC = visaResult("student", clamp(score - 4, 0, 64), mC, wC, []);
      rC.officialName = "Spain short-term study visa (91–180 days)";
      rC.route = "es_study_corta";
      return [r, rC];
    },

    work: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      if (inList(PASSPORT.euEea, nat)) {
        score += 50; m.push("EU/EEA citizens may work freely in Spain under freedom of movement — no work permit required.");
      } else if (passportTier(nat) <= 2) {
        score += 16; w.push("A work permit with employer sponsorship (cuenta ajena) is typically required for non-EU nationals.");
      } else {
        score += 6; w.push("A work permit is required. Approval depends heavily on employer sponsorship and labour market conditions."); x.push("passport");
      }
      score += scoreEdu(p, "university_plus", 28);
      if (eduRank(p.education) < eduRank("university_plus")) { x.push("minEdu"); }
      else { m.push("Your education level appears to meet typical requirements."); }
      score += scoreEng(p, "intermediate", 16);
      finReq("You may need to show sufficient funds. Check official Spanish work visa requirements.", w);
      w.push("Non-EU work permits in Spain typically require employer sponsorship. Simulated guidance only.");
      var r = visaResult("work", score, m, w, x);
      r.officialName = "Work and residence permit (cuenta ajena)"; r.route = "es_cuenta_ajena";
      return r;
    },

    work_and_holiday: function (p) {
      /* v1.57.0 — lista oficial COMPLETA (Ministerio de Inclusión, «Convenios
         de movilidad de jóvenes», capturada 26-jul-2026 con navegador): 6
         acuerdos con referencia BOE — JP (11-may-2017), AU (19-sep-2014),
         CA (2-feb-2010), NZ (4-may-2010), KR (8-nov-2018), AR (26-ene-2023).
         Las condiciones por país no están modeladas => tope partial y
         verificación con consulado. */
      var ES_YM = ["JP", "AU", "CA", "NZ", "KR", "AR"];
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      function esYmResult(sc) {
        var r = visaResult("work_and_holiday", sc, m, w, x);
        r.officialName = "Spain Working Holiday (bilateral agreements)";
        r.route = "es_youth_mobility";
        return r;
      }
      if (!inList(ES_YM, nat)) {
        w.push("Spain's working holiday agreements cover Japan, Australia, Canada, New Zealand, South Korea and Argentina (official list of the Ministry of Inclusion, with BOE references). Verify current conditions with the Spanish consulate in your country.");
        x.push("passport");
        return esYmResult(10);
      }
      score += 42; m.push("Your passport nationality appears to have a working holiday agreement with Spain.");
      score += scoreAge(p.age, 18, 30, 38);
      if (p.age < 18 || p.age > 30) { x.push("maxAge"); }
      else { m.push("Your age appears to be within the eligible range for this visa (18 to 30)."); }
      finReq("You must have sufficient funds for your maintenance during the stay.", w);
      w.push("The main purpose of the stay must be holiday; work is complementary. Stays are limited to 12 months.");
      w.push("Programme details are country-specific and the agreement list can change - verify current conditions with the Spanish consulate in your country.");
      /* Fuente fechada (2017) => nunca banda eligible: tope partial */
      return esYmResult(Math.min(score, 68));
    },
  };

  /* ── PORTUGAL ──────────────────────────────────────────────────────────── */
  COUNTRY_RULES.PT = {

    tourist: function (p) {
      /* Schengen member — same access structure as Spain */
      var r = COUNTRY_RULES.ES.tourist(p);
      r.type = "tourist";
      r.officialName = "Schengen short stay (90/180)"; r.route = "pt_schengen_visit";
      return r;
    },

    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      if (inList(PASSPORT.euEea, nat)) {
        m.push("EU/EEA citizens may live and work in Portugal under freedom of movement. The D8 visa is not required.");
        w.push("EU freedom of movement applies. No Digital Nomad Visa needed for EU/EEA citizens.");
        var rEu = visaResult("digital_nomad", 82, m, w, x);
        rEu.officialName = "D8 Remote Work / Digital Nomad Visa"; rEu.route = "pt_d8";
        return rEu;
      }
      if (!p.remoteWork) {
        w.push("The Portugal D8 Digital Nomad Visa requires active remote work or freelancing.");
        finReq("You may need to show sufficient financial means. Check official Portuguese immigration sources for current requirements.", w);
        var rNo = visaResult("digital_nomad", 6, m, w, x);
        rNo.officialName = "D8 Remote Work / Digital Nomad Visa"; rNo.route = "pt_d8";
        return rNo;
      }
      score += 48; m.push("Your profile indicates remote work, which appears to satisfy the primary D8 condition.");
      if (passportTier(nat) <= 2) { score += 12; m.push("Your passport nationality is generally accepted for this route."); }
      else { w.push("Additional scrutiny may apply for your passport nationality."); }
      /* Income threshold informational only */
      w.push("The Portugal D8 visa typically requires proof of income of approximately 4× the Portuguese minimum wage (about EUR 3,680/month with the 2026 minimum wage of EUR 920). Check the official threshold before applying.");
      finReq("You may need to show sufficient financial means. Check official Portuguese immigration sources for current requirements.", w);
      w.push("Proof of remote employment or freelance clients is required. This is simulated guidance based on approximate thresholds.");
      var r = visaResult("digital_nomad", score, m, w, x);
      r.officialName = "D8 Remote Work / Digital Nomad Visa"; r.route = "pt_d8";
      return r;
    },

    student: function (p) {
      /* v1.14.0 — función propia, ESPEJO EXACTO de ES.student (misma
         puntuación) con redacción portuguesa. Antes delegaba en ES.student y
         emitía textos de España — bug del prototipo corregido. */
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      if (inList(PASSPORT.euEea, nat)) { score += 22; m.push("EU/EEA citizens face minimal visa barriers for studying in Portugal."); }
      else if (passportTier(nat) <= 2) { score += 16; m.push("Your passport nationality is generally accepted for Portuguese student visa applications."); }
      else                              { score += 8;  w.push("Additional documentation requirements may apply for your passport nationality."); }
      score += scoreEng(p, "basic", 14);
      score += scoreEdu(p, "secondary", 24);
      if (eduRank(p.education) < eduRank("secondary")) x.push("minEdu");
      else m.push("Your education level appears to meet general requirements.");
      score += scoreAge(p.age, 17, 65, 10);
      finReq("You may need to show sufficient funds for tuition and living costs. Check official Portuguese student visa requirements.", w);
      w.push("Enrollment acceptance from an accredited Portuguese institution is required. Simulated guidance only.");
      m.push("For programmes of a year or longer you apply for the D4 study visa leading to a residence permit.");
      var r = visaResult("student", score, m, w, x);
      r.officialName = "Portugal Study Visa (D4)"; r.route = "pt_study";

      /* v1.86.0 — FASE 3: tarjeta de estada temporária (cursos hasta 1 año),
         nivel modelado (línea preliminar) hasta capturar su fuente. */
      var mT = [], wT = [];
      mT.push("Portugal's temporary stay visa covers study programmes of up to one year.");
      wT.push("Enrollment acceptance from an accredited Portuguese institution is required. Simulated guidance only.");
      finReq("You may need to show sufficient funds for tuition and living costs. Check official Portuguese student visa requirements.", wT);
      wT.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var rT = visaResult("student", clamp(score - 4, 0, 64), mT, wT, []);
      rT.officialName = "Portugal temporary stay visa for studies (up to 1 year)";
      rT.route = "pt_study_temporaria";
      return [r, rT];
    },

    work: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      if (inList(PASSPORT.euEea, nat)) {
        score += 50; m.push("EU/EEA citizens may work freely in Portugal under freedom of movement.");
      } else if (inList(PASSPORT.cplp, nat)) {
        score += 26;
        m.push("CPLP nationals (Portuguese-speaking community) may benefit from simplified work access to Portugal.");
        w.push("Specific conditions apply. Verify with AIMA (Portuguese immigration authority).");
      } else if (passportTier(nat) <= 2) {
        score += 14; w.push("A work visa with employer sponsorship is required for non-EU nationals."); x.push("passport");
      } else {
        score += 6; w.push("A work visa is required. Conditions vary significantly by nationality."); x.push("passport");
      }
      score += scoreEdu(p, "university_plus", 28);
      if (eduRank(p.education) < eduRank("university_plus")) { x.push("minEdu"); }
      else { m.push("Your education level appears to meet typical requirements."); }
      score += scoreEng(p, "intermediate", 16);
      finReq("You may need to show sufficient funds. Check official Portuguese work visa requirements.", w);
      w.push("Non-EU work permits typically require employer sponsorship. Simulated guidance only.");
      var r = visaResult("work", score, m, w, x);
      r.officialName = "Subordinate Work Residency Visa"; r.route = "pt_subordinate_work";
      return r;
    },

    work_and_holiday: function (p) {
      /* v1.14.0 — corrección mayor: la lista del prototipo (AU CA NZ AR BR UY
         CO EC BO PY) era una suposición y estaba mal. Tabla OFICIAL de los 9
         memorandos de youth mobility vigentes (vistos.mne.gov.pt, capturado
         14-jul-2026), con edad y cupo por país. */
      var PT_YM = {
        AR: { min: 18, max: 30, quota: 100 },
        AU: { min: 18, max: 31, quota: 500 },
        CA: { min: 18, max: 35, quota: 600 },
        CL: { min: 18, max: 30, quota: null },
        JP: { min: 18, max: 30, quota: null },
        NZ: { min: 18, max: 30, quota: 50 },
        PE: { min: 18, max: 31, quota: 400, degree: true },
        KR: { min: 18, max: 34, quota: 200 },
        US: { min: null, max: null, quota: 400, pilot: true },
      };
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      var cfg = PT_YM[nat];
      if (!cfg) {
        w.push("Portugal's youth mobility programme is limited to: Argentina, Australia, Canada, Chile, Japan, New Zealand, Peru, South Korea and the USA.");
        x.push("passport");
        var r0 = visaResult("work_and_holiday", 10, m, w, x);
        r0.officialName = "Youth Mobility Portugal"; r0.route = "pt_youth_mobility";
        return r0;
      }
      score += 42; m.push("Your passport nationality has a youth mobility memorandum with Portugal.");
      if (cfg.pilot) {
        /* EE.UU.: piloto de 12 meses sin rango de edad publicado — no se
           puntúa edad; condiciones específicas => tope partial. */
        score += 26;
        w.push("The USA arrangement is a 12-month pilot programme focused on training at innovative organizations; specific conditions apply.");
      } else {
        score += scoreAge(p.age, cfg.min, cfg.max, 38);
        if (p.age < cfg.min || p.age > cfg.max) { x.push("maxAge"); }
        else { m.push("Your age appears to be within the eligible range for this visa (" + cfg.min + " to " + cfg.max + ")."); }
      }
      if (cfg.quota) {
        w.push("This visa has a limited annual quota of about " + cfg.quota + " places, which can run out.");
      }
      if (cfg.degree) {
        w.push("Peru's memorandum requires a university degree or at least 2 completed years of university studies.");
      }
      w.push("Stays are limited to 12 months, with no possibility of extension.");
      w.push("Work or study must remain secondary to the holiday purpose of the stay.");
      finReq("You may need to show sufficient funds for your stay. Check with the Portuguese consulate for current financial requirements.", w);
      w.push("Verify current conditions with the Portuguese consulate in your country. Simulated guidance only.");
      var r = visaResult("work_and_holiday", score, m, w, x);
      r.officialName = "Youth Mobility Portugal"; r.route = "pt_youth_mobility";
      return r;
    },
  };

  /* =========================================================================
     JAPAN — Wave 2 (v1.16.0). Evidencia oficial capturada 14-jul-2026:
     - MOFA working holiday (snapshot archive.org 06-jul-2026): 32 socios a
       1-abr-2026, cupos por país, 18-30 inclusive, residencia en el país de
       nacionalidad, sin dependientes, nunca WHV japonesa previa.
     - MOFA exención de visado (snapshot 30-jun-2026): 74 países/regiones,
       90 días estándar; Brasil/Perú/Paraguay/Panamá/Serbia solo ePassport.
     - Nómada digital (ISA): fuente directa bloqueada y sin snapshot =>
       redacción con cobertura y sin cifras (REVIEW).
  ========================================================================= */
  var JP_WHV = {  /* cupo null = "no limit" oficial */
    AU: { quota: null },  NZ: { quota: null },  CA: { quota: 6283 }, KR: { quota: 10000 },
    FR: { quota: 1800 },  DE: { quota: null },  GB: { quota: 6000 }, IE: { quota: 800 },
    DK: { quota: null },  NO: { quota: null },  PT: { quota: null }, PL: { quota: 500 },
    SK: { quota: 400 },   AT: { quota: 200 },   HU: { quota: 200 },  ES: { quota: 700 },
    AR: { quota: 400 },   CL: { quota: 200 },   IS: { quota: 30 },   CZ: { quota: 400 },
    LT: { quota: 100 },   SE: { quota: null },  EE: { quota: 100 },  NL: { quota: 200 },
    UY: { quota: 100 },   FI: { quota: 200 },   LV: { quota: 100 },  LU: { quota: 100 },
    MT: { quota: 100 },   IT: { quota: 500 },
  };
  /* Exentos de visado (90 días) presentes en el selector; eP = solo ePassport */
  var JP_EXEMPT = ["AR","AT","BE","BG","CH","CL","CR","CY","CZ","DE","DK","DO","EE","ES","FI","FR",
    "GB","GR","GT","HN","HR","HU","IE","IS","IT","LT","LU","LV","MX","NL","NO","PA","PE","PL","PT",
    "PY","RS","SE","SV","TR","US","UY","CA","AU","NZ","JP","KR","BR"];
  var JP_EXEMPT_EPASSPORT = ["BR","PE","PY","PA","RS"];

  /* =========================================================================
     USA — Wave 2 (v1.17.0). Evidencia oficial capturada 14-jul-2026
     (travel.state.gov responde 200 a herramienta simple):
     - VWP: 41+ países, ESTA, estancias de 90 días o menos sin visado.
     - B1/B2 para el resto (entrevista consular).
     - F-1: Form I-20 de escuela aprobada por SEVP.
     Sin working holiday (la alternativa es el J-1 Exchange Visitor) y sin
     visa de nómada digital.
  ========================================================================= */
  var US_VWP = ["AD","AU","AT","BE","BN","CL","HR","CZ","DK","EE","FI","FR","DE","GR","HU","IS","IE",
    "IL","IT","JP","LV","LI","LT","LU","MT","MC","NL","NZ","NO","PL","PT","QA","SM","SG","SK","SI",
    "KR","ES","SE","CH","TW","GB"];

  COUNTRY_RULES.US = {

    tourist: function (p) {
      /* v1.85.0 — FASE 3: ESTA (VWP) y B-1/B-2 como tarjetas separadas.
         Miembros del VWP: tarjeta ESTA + B-1/B-2 universal; resto: solo B. */
      var cards = [], nat = p.nationality;
      var esVwp = inList(US_VWP, nat);
      if (esVwp) {
        var mE = [], wE = [];
        mE.push("Your passport nationality appears to be in the Visa Waiver Program: stays of 90 days or less without a visa.");
        wE.push("You must obtain an approved ESTA (Electronic System for Travel Authorization) before travelling.");
        wE.push("You cannot work during a visitor stay; paid activities are not allowed.");
        wE.push("This is simulated guidance only. Always verify with travel.state.gov.");
        var rE = visaResult("tourist", 55, mE, wE, []);
        rE.officialName = "Visa Waiver Program (ESTA)";
        rE.route = "us_tourist_esta";
        cards.push(rE);
      }
      var m = [], w = [], x = [], score;
      if (esVwp) {
        score = 46;
        m.push("The full B-1/B-2 visitor visa is available to any nationality.");
      } else {
        score = 10;
        w.push("A B-1/B-2 visitor visa is likely required, including a consular interview. Approval rates vary by nationality and profile.");
        x.push("passport");
      }
      w.push("You cannot work during a visitor stay; paid activities are not allowed.");
      finReq("You may need to show sufficient funds and strong ties to your home country.", w);
      w.push("This is simulated guidance only. Always verify with travel.state.gov.");
      var r = visaResult("tourist", clamp(score, 0, 68), m, w, x);
      r.officialName = "B-1/B-2 Visitor Visa";
      r.route = "us_tourist_b1b2";
      cards.push(r);
      return cards;
    },

    work_and_holiday: function (p) {
      var m = [], w = [], x = [], score = 5;
      w.push("The USA does not operate a working holiday programme. The closest alternative is the J-1 Exchange Visitor Program (e.g., Summer Work Travel for university students), which requires a designated sponsor.");
      x.push("passport");
      var r = visaResult("work_and_holiday", score, m, w, x);
      r.officialName = "No working holiday (see J-1 alternatives)"; r.route = "us_no_whv";
      return r;
    },

    student: function (p) {
      var m = [], w = [], x = [], score = 0;
      var pt = passportTier(p.nationality);
      if (pt <= 2) { score += 14; m.push("Your passport nationality is generally accepted for US student visa applications."); }
      else         { score += 6;  w.push("Additional scrutiny may apply for your passport nationality."); }
      score += scoreEng(p, "intermediate", 26);
      if (engRank(p.english) < engRank("intermediate")) { x.push("minEnglish"); }
      else { m.push("Your English level appears to meet general requirements."); }
      score += scoreEdu(p, "secondary", 20);
      if (eduRank(p.education) < eduRank("secondary")) x.push("minEdu");
      w.push("You need a Form I-20 issued by a SEVP-approved school, the SEVIS fee, and a consular interview. Simulated guidance only.");
      finReq("You may need to show sufficient funds for tuition and living costs. Check official US student visa requirements.", w);
      var r = visaResult("student", Math.min(score, 68), m, w, x);
      r.officialName = "F-1 Student Visa"; r.route = "us_f1";
      return r;
    },

    work: function (p) {
      var m = [], w = [], x = [], score = 0;
      if (passportTier(p.nationality) <= 2) { score += 10; }
      else { score += 4; w.push("Work visa processes may be more complex for your passport nationality."); }
      score += scoreEdu(p, "university_plus", 28);
      if (eduRank(p.education) < eduRank("university_plus")) { x.push("minEdu"); }
      else { m.push("Your education level appears to meet typical requirements."); }
      score += scoreEng(p, "intermediate", 16);
      w.push("Most US work visas (e.g., H-1B) require employer sponsorship and are subject to caps or lotteries. Simulated guidance only.");
      finReq("You may need to show sufficient funds. Check official US work visa requirements.", w);
      var r = visaResult("work", Math.min(score, 60), m, w, x);
      r.officialName = "Employment visas (sponsorship)"; r.route = "us_work";
      return r;
    },

    digital_nomad: function (p) {
      var m = [], w = [], x = [];
      w.push("The USA does not offer a digital nomad visa; working remotely while on a visitor status is restricted.");
      var r = visaResult("digital_nomad", 8, m, w, x);
      r.officialName = "No digital nomad visa"; r.route = "us_no_dnv";
      return r;
    },
  };

  COUNTRY_RULES.JP = {

    tourist: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      function jpTourist(sc) {
        var r = visaResult("tourist", sc, m, w, x);
        r.officialName = "Japan short-term stay (visa exemption)"; r.route = "jp_visa_exemption";
        return r;
      }
      if (inList(JP_EXEMPT, nat)) {
        score += 55;
        m.push("Your passport nationality appears to be visa-exempt for short-term stays in Japan (up to 90 days).");
        if (inList(JP_EXEMPT_EPASSPORT, nat)) {
          w.push("The visa exemption applies only to holders of an ICAO-compliant ePassport; without one you must obtain a visa in advance.");
        }
      } else {
        score += 10;
        w.push("A short-term visa is likely required for your nationality. Check the Japanese embassy or consulate in your country.");
        x.push("passport");
      }
      w.push("You cannot work during a short-term stay; paid activities are not allowed.");
      finReq("You may need to show sufficient funds for your stay and onward travel.", w);
      w.push("This is simulated guidance only. Always verify with the Ministry of Foreign Affairs of Japan.");
      return jpTourist(clamp(score, 0, 68));
    },

    work_and_holiday: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      var cfg = JP_WHV[nat];
      function jpYm(sc) {
        var r = visaResult("work_and_holiday", sc, m, w, x);
        r.officialName = "Japan Working Holiday"; r.route = "jp_working_holiday";
        return r;
      }
      if (!cfg) {
        w.push("Japan's working holiday programmes cover 32 partner countries/regions; your nationality does not appear to be among them.");
        x.push("passport");
        return jpYm(10);
      }
      score += 42; m.push("Your passport nationality has a working holiday programme with Japan.");
      score += scoreAge(p.age, 18, 30, 38);
      if (p.age < 18 || p.age > 30) { x.push("maxAge"); }
      else { m.push("Your age appears to be within the eligible range for this visa (18 to 30)."); }
      if (cfg.quota) {
        w.push("This visa has a limited annual quota of about " + cfg.quota.toLocaleString("en-US") + " places, which can run out.");
      }
      w.push("You must be residing in your country of nationality when you apply.");
      w.push("You must intend primarily to spend a holiday in Japan; work must be incidental.");
      w.push("You cannot be accompanied by dependents or children.");
      finReq("You must have a return ticket (or funds to buy one) and reasonable funds for your initial stay.", w);
      w.push("You must never have held a Japanese working holiday visa before.");
      w.push("Verify current conditions with the Japanese embassy or consulate in your country. Simulated guidance only.");
      return jpYm(score);
    },

    student: function (p) {
      var m = [], w = [], x = [], score = 0;
      var pt = passportTier(p.nationality);
      if (pt <= 2) { score += 16; m.push("Your passport nationality is generally accepted for Japanese student visa applications."); }
      else         { score += 8;  w.push("Additional documentation requirements may apply for your passport nationality."); }
      score += scoreEdu(p, "secondary", 24);
      if (eduRank(p.education) < eduRank("secondary")) x.push("minEdu");
      else m.push("Your education level appears to meet general requirements.");
      score += scoreAge(p.age, 17, 65, 10);
      finReq("You may need to show sufficient funds for tuition and living costs. Check official Japanese student visa requirements.", w);
      w.push("A Certificate of Eligibility (COE) sponsored by the receiving institution is required before the visa. Simulated guidance only.");
      var r = visaResult("student", Math.min(score, 68), m, w, x);
      r.officialName = "Japan Student Visa (COE)"; r.route = "jp_student";
      return r;
    },

    work: function (p) {
      var m = [], w = [], x = [], score = 0;
      if (passportTier(p.nationality) <= 2) { score += 12; }
      else { score += 5; w.push("Work visa processes may be more complex for your passport nationality."); }
      score += scoreEdu(p, "university_plus", 30);
      if (eduRank(p.education) < eduRank("university_plus")) { x.push("minEdu"); }
      else { m.push("Your education level appears to meet typical requirements."); }
      score += scoreEng(p, "intermediate", 14);
      w.push("Japanese work visas require employer sponsorship and a Certificate of Eligibility (COE). Simulated guidance only.");
      finReq("You may need to show sufficient funds. Check official Japanese work visa requirements.", w);
      var r = visaResult("work", score, m, w, x);
      r.officialName = "Japan Work Visa (COE)"; r.route = "jp_work";
      return r;
    },

    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 0;
      function jpDnv(sc) {
        var r = visaResult("digital_nomad", sc, m, w, x);
        r.officialName = "Japan Digital Nomad (designated activities)"; r.route = "jp_digital_nomad";
        return r;
      }
      if (!p.remoteWork) {
        w.push("Japan's digital nomad status requires active remote work for a foreign employer or clients.");
        return jpDnv(6);
      }
      score += 30; m.push("Your profile indicates remote work, which is the primary condition for this route.");
      w.push("Japan introduced a digital nomad status (designated activities) with strict conditions, a short stay (about 6 months) and a high income threshold - check the Immigration Services Agency of Japan for current requirements.");
      w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      return jpDnv(clamp(score, 0, 45));
    },
  };

  /* =========================================================================
     COREA DEL SUR — Wave 3 (v1.29.0). Evidencia oficial capturada 15-jul-2026
     vía renderFetch/Playwright (los portales .go.kr sirven 200 pero pintan por
     JavaScript; no hay muro anti-robots — política del proyecto respetada):
     - K-ETA: 116 países/regiones elegibles con estancia permitida (k-eta.go.kr).
     - Working holiday H-1: tabla oficial de 30 socios con edad y cupo 2025/26
       (whic.mofa.go.kr, Overseas Koreans Agency).
     - Estudiante D-2/D-4: studyinkorea.go.kr (fetch directo).
     - Nómada digital (workation): sin fuente capturada aún => hedged + REVIEW.
  ========================================================================= */
  /* Elegibles K-ETA con estancia de 90 días / 3 meses (del selector) */
  var KR_KETA_90 = ["AR","AT","AU","BE","BG","BR","CH","CL","CO","CR","CZ","DE","DK","DO","EC",
    "EE","ES","FI","FR","GB","GR","GT","HK","HR","HU","IE","IL","IS","IT","JP","LI","LT","LU",
    "LV","MT","MX","NI","NL","NO","NZ","PA","PE","PL","PT","RO","RS","SE","SI","SK","SV","TR",
    "TW","US","UY","VE"];
  /* Elegibles K-ETA con estancias más cortas */
  var KR_KETA_SHORT = { AD: "30 days", CY: "30 days", HN: "30 days", PY: "30 days", RU: "60 days" };
  /* Socios working holiday (H-1) presentes en el selector — edad y cupo anual */
  var KR_WHV = {
    AD: { min: 18, max: 30, quota: 50 },    AR: { min: 18, max: 34, quota: 200 },
    AU: { min: 18, max: 30, quota: null },  AT: { min: 18, max: 30, quota: 300 },
    BR: { min: 18, max: 34, quota: 300 },   BE: { min: 18, max: 30, quota: 200 },
    CA: { min: 18, max: 35, quota: 12000 }, CL: { min: 18, max: 34, quota: 100 },
    CZ: { min: 18, max: 30, quota: 300 },   DK: { min: 18, max: 34, quota: null },
    FI: { min: 18, max: 35, quota: null },  FR: { min: 18, max: 30, quota: 2000 },
    DE: { min: 18, max: 34, quota: null },  HK: { min: 18, max: 30, quota: 1000 },
    HU: { min: 18, max: 30, quota: 100 },   IE: { min: 18, max: 34, quota: 800 },
    IL: { min: 18, max: 30, quota: 200 },   IT: { min: 18, max: 30, quota: 500 },
    JP: { min: 18, max: 25, quota: 10000 }, LV: { min: 18, max: 34, quota: 100 },
    LU: { min: 18, max: 35, quota: 100 },   NL: { min: 18, max: 30, quota: 200 },
    NZ: { min: 18, max: 30, quota: 3000 },  PL: { min: 18, max: 30, quota: 200 },
    PT: { min: 18, max: 34, quota: 200 },   ES: { min: 18, max: 30, quota: 1000 },
    SE: { min: 18, max: 30, quota: null },  TW: { min: 18, max: 34, quota: 800 },
    GB: { min: 18, max: 35, quota: 5000 },  US: { min: 18, max: 30, quota: 2000 },
  };

  COUNTRY_RULES.KR = {

    tourist: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      function krTourist(sc) {
        var r = visaResult("tourist", sc, m, w, x);
        r.officialName = "K-ETA / short-term visa-free entry"; r.route = "kr_keta";
        return r;
      }
      if (nat === "CA") {
        score += 55;
        m.push("Canadian citizens appear to be eligible for K-ETA, with visa-free stays of up to 6 months.");
        w.push("You must obtain K-ETA approval before boarding the flight or ship to Korea.");
      } else if (inList(KR_KETA_90, nat)) {
        score += 55;
        m.push("Your passport nationality appears to be eligible for K-ETA: visa-free short stays of up to 90 days (3 months for some countries).");
        w.push("You must obtain K-ETA approval before boarding the flight or ship to Korea.");
      } else if (KR_KETA_SHORT[nat]) {
        score += 52;
        m.push("Your passport nationality appears to be eligible for K-ETA, with visa-free stays of up to " + KR_KETA_SHORT[nat] + ".");
        w.push("You must obtain K-ETA approval before boarding the flight or ship to Korea.");
      } else {
        score += 10;
        w.push("A short-term visa is likely required for your nationality. Check the Korean embassy or consulate in your country.");
        x.push("passport");
      }
      w.push("You cannot work during a short-term stay; paid activities are not allowed.");
      finReq("You may need to show sufficient funds for your stay and onward travel.", w);
      w.push("This is simulated guidance only. Always verify with the official K-ETA portal (k-eta.go.kr).");
      return krTourist(clamp(score, 0, 68));
    },

    work_and_holiday: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      var cfg = KR_WHV[nat];
      function krYm(sc) {
        var r = visaResult("work_and_holiday", sc, m, w, x);
        r.officialName = "Korea Working Holiday (H-1)"; r.route = "kr_working_holiday";
        return r;
      }
      if (!cfg) {
        w.push("Korea has bilateral working holiday agreements with thirty countries/regions; your nationality does not appear to be among them.");
        x.push("passport");
        return krYm(10);
      }
      score += 42; m.push("Your passport nationality has a bilateral working holiday agreement with Korea (H-1 visa).");
      score += scoreAge(p.age, cfg.min, cfg.max, 38);
      if (p.age < cfg.min || p.age > cfg.max) { x.push("maxAge"); }
      else { m.push("Your age appears to be within the eligible range for this visa (" + cfg.min + " to " + cfg.max + ")."); }
      if (cfg.quota) {
        w.push("This visa has a limited annual quota of about " + cfg.quota.toLocaleString("en-US") + " places, which can run out.");
      }
      w.push("The working holiday visa allows a one-year extended holiday in Korea, with short-term employment as a secondary part of your stay.");
      w.push("You may generally work up to 25 hours per week with this visa.");
      w.push("This is a one-time only visa; extensions or a second participation exist only in specific bilateral cases (e.g. Canada, Japan, the US and the UK).");
      if (nat === "US") {
        w.push("US participants must be bona fide post-secondary students or recent graduates (within 1 year after graduation).");
      }
      if (nat === "CA") {
        w.push("Canadian participants may stay up to 24 months, participate twice, and are exempt from the 25-hour weekly limit.");
      }
      w.push("Language courses at private institutions are allowed; regular university degree courses require a study visa instead.");
      finReq("You may need to show a return ticket (or funds to buy one) and reasonable funds for your initial stay.", w);
      w.push("Verify current conditions with the Korean embassy or consulate in your country. Simulated guidance only.");
      return krYm(score);
    },

    student: function (p) {
      var m = [], w = [], x = [], score = 0;
      var pt = passportTier(p.nationality);
      if (pt <= 2) { score += 16; m.push("Your passport nationality is generally accepted for Korean student visa applications."); }
      else         { score += 8;  w.push("Additional documentation requirements may apply for your passport nationality."); }
      score += scoreEdu(p, "secondary", 24);
      if (eduRank(p.education) < eduRank("secondary")) x.push("minEdu");
      else m.push("Your education level appears to meet general requirements.");
      score += scoreAge(p.age, 17, 65, 10);
      w.push("For degree programmes at institutions offering associate degrees or higher, a D-2 visa is required; non-degree training uses the D-4 visa.");
      finReq("You may need to show sufficient funds for tuition and living costs. Check official Korean student visa requirements.", w);
      w.push("Admission to a Korean educational institution is required before the visa. Simulated guidance only.");
      var r = visaResult("student", Math.min(score, 68), m, w, x);
      r.officialName = "Korea Student Visa (D-2)"; r.route = "kr_student";
      return r;
    },

    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 0;
      function krDnv(sc) {
        var r = visaResult("digital_nomad", sc, m, w, x);
        r.officialName = "Korea Digital Nomad (workation)"; r.route = "kr_digital_nomad";
        return r;
      }
      if (!p.remoteWork) {
        w.push("Korea's digital nomad (workation) visa requires active remote work for a foreign employer or clients.");
        return krDnv(6);
      }
      score += 30; m.push("Your profile indicates remote work, which is the primary condition for this route.");
      w.push("Korea introduced a digital nomad (workation) visa with income and insurance requirements - check the Korea Immigration Service or a Korean embassy for current requirements.");
      w.push("The F-1-D workation visa was officially launched on 30 June 2026: income thresholds range from about 1 to 2 times Korea's GNI per capita depending on age and region, and private health insurance is required.");
      return krDnv(clamp(score, 0, 45));
    },
  };

  /* =========================================================================
     ARGENTINA — Wave 3 tanda LatAm (v1.30.0). Evidencia capturada 15-jul-2026
     (todas por fetch directo; fuentes server-rendered):
     - Régimen de visas: matriz oficial por país (migraciones.gob.ar).
     - Turista: hasta 3 meses prorrogables (argentina.gob.ar/migraciones/turistas).
     - Nómades digitales: Disposición 758/2022, para nacionales sin visa de
       turista, 180 días (eirla.cancilleria.gob.ar).
     - Vacaciones y Trabajo: 19 socios con cupos (cancilleria.gob.ar) — edades
       varían por acuerdo (no capturadas por país => redacción con cobertura).
  ========================================================================= */
  /* Sin visa de turista (matriz oficial; columna Pasaporte Ordinario) */
  var AR_NOVISA = ["AD","AT","AU","BE","BG","BO","BR","CA","CH","CL","CO","CR","CY","CZ","DE",
    "DK","EC","EE","ES","FI","FR","GB","GE","GR","GT","HK","HN","HR","HU","IE","IL","IS","IT",
    "JP","KR","LI","LT","LU","LV","MT","MX","NI","NL","NO","NZ","PA","PE","PL","PT","PY","RO",
    "RS","RU","SE","SI","SK","SV","TR","UA","US","UY","VE"];
  /* Vacaciones y Trabajo: 19 socios oficiales (cupo null = ilimitado / no publicado) */
  var AR_WHV = {
    DE: { quota: null },  AU: { quota: 3400 }, AT: { quota: 200 },  KR: { quota: 200 },
    SK: { quota: 100 },   SI: { quota: 900 },  DK: { quota: 150 },  ES: { quota: 500 },
    FR: { quota: 1200 },  HU: { quota: 200 },  IE: { quota: 200 },  JP: { quota: 200 },
    NO: { quota: 300 },   NZ: { quota: null }, NL: { quota: 100 },  PL: { quota: 400 },
    PT: { quota: 100 },   SE: { quota: null },
  };

  COUNTRY_RULES.AR = {

    /* ⚠ v1.104.0 — FALLO CORREGIDO: Argentina declaraba `work` en mock.js pero
       esta regla no lo definía, y como la lista de tipos de COUNTRY_RULES MANDA
       sobre mock.js, la tarjeta de trabajo DESAPARECÍA en silencio. Efecto real:
       un chileno veía que podía trabajar en los otros 7 países del Mercosur y en
       Argentina no, que es falso — y es el destino más buscado del grupo.
       Se restituye con la misma vía que sus vecinos: el Acuerdo de Residencia
       (nivel modelado y así etiquetado; las rutas AUDITADAS de AR no se tocan). */
    work: function (p) { return mercosurWork("AR", p); },

    tourist: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      function arTourist(sc) {
        var r = visaResult("tourist", sc, m, w, x);
        r.officialName = "Argentina tourist entry (visa-free / visa)"; r.route = "ar_tourist";
        return r;
      }
      if (inList(AR_NOVISA, nat)) {
        score += 55;
        m.push("Your passport nationality appears on Argentina's visa-free list for tourism (ordinary passport).");
        w.push("Tourist stays are authorised for up to 3 months, extendable once for a similar period.");
      } else {
        score += 10;
        w.push("A tourist visa is likely required for your nationality. Check the Argentine consulate in your country.");
        x.push("passport");
      }
      w.push("You cannot work during a tourist stay; paid activities are not allowed.");
      finReq("You may need to show sufficient funds for your stay and onward travel.", w);
      w.push("This is simulated guidance only. Always verify with the Dirección Nacional de Migraciones (migraciones.gob.ar).");
      return arTourist(clamp(score, 0, 68));
    },

    work_and_holiday: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      var cfg = AR_WHV[nat];
      function arYm(sc) {
        var r = visaResult("work_and_holiday", sc, m, w, x);
        r.officialName = "Argentina Working Holiday (Vacaciones y Trabajo)"; r.route = "ar_working_holiday";
        return r;
      }
      if (!cfg) {
        w.push("Argentina has working holiday agreements with nineteen countries; your nationality does not appear to be among them.");
        x.push("passport");
        return arYm(10);
      }
      score += 42; m.push("Your passport nationality has a working holiday agreement with Argentina (Vacaciones y Trabajo).");
      score += scoreAge(p.age, 18, 30, 38);
      if (p.age < 18 || p.age > 30) { x.push("maxAge"); }
      else { m.push("Your age appears to be within the typical range for this visa (18 to 30 - some agreements vary)."); }
      if (cfg.quota) {
        w.push("This visa has a limited annual quota of about " + cfg.quota.toLocaleString("en-US") + " places, which can run out.");
      }
      w.push("Stays are for up to 12 months, non-renewable; work must be incidental to the holiday purpose.");
      w.push("Requirements vary by bilateral agreement - check the procedure for your nationality on cancilleria.gob.ar.");
      finReq("You may need a return ticket (or funds to buy one), medical insurance covering the stay, and funds for your initial expenses.", w);
      w.push("Meeting the requirements does not guarantee the visa; approval is a prerogative of the Argentine State. Simulated guidance only.");
      return arYm(score);
    },

    student: function (p) {
      var m = [], w = [], x = [], score = 0;
      var pt = passportTier(p.nationality);
      if (pt <= 2) { score += 16; m.push("Your passport nationality is generally accepted for Argentine student residence applications."); }
      else         { score += 8;  w.push("Additional documentation requirements may apply for your passport nationality."); }
      score += scoreEdu(p, "secondary", 24);
      if (eduRank(p.education) < eduRank("secondary")) x.push("minEdu");
      else m.push("Your education level appears to meet general requirements.");
      score += scoreAge(p.age, 16, 65, 10);
      w.push("Studying in Argentina requires admission to a recognised institution and a student residence (residencia transitoria o temporaria como estudiante).");
      finReq("You may need to show sufficient funds for tuition and living costs. Check official Argentine migration requirements.", w);
      w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var r = visaResult("student", Math.min(score, 60), m, w, x);
      r.officialName = "Argentina Student Residence"; r.route = "ar_student";
      return r;
    },

    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      function arDnv(sc) {
        var r = visaResult("digital_nomad", sc, m, w, x);
        r.officialName = "Argentina Digital Nomad (residencia transitoria, Disp. 758/2022)"; r.route = "ar_digital_nomad";
        return r;
      }
      if (!p.remoteWork) {
        w.push("Argentina's digital nomad residence requires providing remote services for persons or companies domiciled abroad.");
        return arDnv(6);
      }
      if (!inList(AR_NOVISA, nat)) {
        w.push("Argentina's digital nomad residence is aimed at nationals of countries that do not require a tourist visa; your nationality appears to need one.");
        x.push("passport");
        return arDnv(15);
      }
      score += 55;
      m.push("Your profile indicates remote work, which is the primary condition for this route.");
      m.push("Your passport nationality appears eligible: the digital nomad residence is aimed at nationals of countries that do not require a tourist visa for Argentina.");
      w.push("The transitory residence for digital nomads (Disposición 758/2022) is granted for up to 180 days, extendable once.");
      w.push("You will need a request note, a brief CV, a valid passport and documentation proving your remote work relationship.");
      w.push("Verify current conditions with the Dirección Nacional de Migraciones. Simulated guidance only.");
      return arDnv(clamp(score, 0, 65));
    },
  };

  /* =========================================================================
     MÉXICO — Wave 3 tanda LatAm (v1.30.0). Evidencia capturada 15-jul-2026:
     - Lista oficial «no requieren visa» (PDF oficial gob.mx/INM, texto por OCR
       Vision de macOS, cotejado a mano).
     - Requisitos y alternativas (inm.gob.mx, fetch directo): 180 días máx.;
       visa/residencia válida de EEUU, Canadá, Japón, Reino Unido o Schengen
       (y residencia Alianza del Pacífico) sustituye a la visa mexicana.
     Sin programa working holiday. Sin visa de nómada digital dedicada.
  ========================================================================= */
  var MX_NOVISA = ["AD","AR","AT","AU","BE","BG","BO","CA","CH","CL","CO","CR","CY","CZ","DE",
    "DK","EE","ES","FI","FR","GB","GR","HK","HR","HU","IE","IL","IS","IT","JP","KR","LI","LT",
    "LU","LV","MT","NL","NO","NZ","PA","PL","PT","PY","RO","SE","SI","SK","US","UY"];

  COUNTRY_RULES.MX = {

    /* v1.89.0 — Fase 3: turismo en DOS tarjetas, misma cirugía que Tailandia.
       La ENTRADA SIN VISA conserva la ruta auditada (officialName combinado
       corregido, ruta renombrada a mx_tourist_novisa en app y sources a la vez)
       y se queda con los 3 hechos oficiales: la lista sin visa, el tope de 180
       días y los documentos alternativos (visa/residencia de EE.UU., Canadá,
       Japón, Reino Unido o Schengen) — por eso sigue siendo universal, igual
       que las sondas AR/CO/PE del auditor. La visa consular es app-side. */
    tourist: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality, cards = [];
      var novisa = inList(MX_NOVISA, nat);

      if (novisa) {
        score += 55;
        m.push("Your passport nationality appears on Mexico's official list of countries that do not require a visa (visitor without paid activities).");
      } else {
        score += 40;
        w.push("Your passport nationality is not on Mexico's no-visa list, but a valid visa or permanent residence of the US, Canada, Japan, the UK or a Schengen country also lets you enter as a visitor without a Mexican visa.");
      }
      w.push("Visitor stays cannot exceed 180 days.");
      w.push("The days you are given are decided at the border and recorded in your entry record, and they can be fewer than the maximum.");
      w.push("You cannot work during a visitor stay; paid activities are not allowed.");
      finReq("The migration authority may ask for hotel bookings, return tickets and proof of your travel purpose.", w);
      w.push("This is simulated guidance only. Always verify with the Instituto Nacional de Migración (inm.gob.mx).");
      var entry = visaResult("tourist", clamp(score, 0, 68), m, w, x);
      entry.officialName = "Mexico visitor entry without a visa — up to 180 days";
      entry.route = "mx_tourist_novisa";
      cards.push(entry);

      /* ── Visa de visitante consular: solo para quien la necesita ─────── */
      if (!novisa) {
        var vm = [], vw = [];
        vm.push("Mexico's visitor visa without permission to carry out paid activities is the consular route when you are not on the no-visa list.");
        vw.push("It is applied for in person at a Mexican consulate, with an appointment, and the consulate decides after an interview.");
        vw.push("Consulates usually ask for proof of economic solvency, employment or studies, and ties to your country of residence.");
        vw.push("Once granted, it is normally a multiple-entry visa, and each visitor stay still cannot exceed 180 days.");
        vw.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
        var consular = visaResult("tourist", 52, vm, vw, []);
        consular.officialName = "Mexico Visitor Visa (visa de visitante sin permiso para realizar actividades remuneradas)";
        consular.route = "mx_tourist_visa";
        cards.push(consular);
      }

      return cards;
    },

    work_and_holiday: function (p) {
      var m = [], w = [], x = [], score = 5;
      w.push("Mexico does not operate a working holiday programme.");
      x.push("passport");
      var r = visaResult("work_and_holiday", score, m, w, x);
      r.officialName = "No working holiday programme"; r.route = "mx_no_whv";
      return r;
    },

    student: function (p) {
      var m = [], w = [], x = [], score = 0;
      var pt = passportTier(p.nationality);
      if (pt <= 2) { score += 16; m.push("Your passport nationality is generally accepted for Mexican student residence applications."); }
      else         { score += 8;  w.push("Additional documentation requirements may apply for your passport nationality."); }
      score += scoreEdu(p, "secondary", 24);
      if (eduRank(p.education) < eduRank("secondary")) x.push("minEdu");
      else m.push("Your education level appears to meet general requirements.");
      score += scoreAge(p.age, 16, 65, 10);
      w.push("Studies over 180 days require the residente temporal estudiante condition, with an acceptance letter from a Mexican institution.");
      finReq("You may need to show sufficient funds for tuition and living costs. Check official Mexican requirements.", w);
      w.push("Courses of up to 180 days can be done as a visitor with an acceptance letter. Simulated guidance only.");
      var r = visaResult("student", Math.min(score, 62), m, w, x);
      r.officialName = "Mexico Student Residence (residente temporal estudiante)"; r.route = "mx_student";
      return r;
    },

    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      function mxDnv(sc) {
        var r = visaResult("digital_nomad", sc, m, w, x);
        r.officialName = "Mexico: no dedicated digital nomad visa"; r.route = "mx_digital_nomad";
        return r;
      }
      if (!p.remoteWork) {
        w.push("Working remotely from Mexico requires an active remote work relationship with an employer or clients abroad.");
        return mxDnv(6);
      }
      score += 25;
      m.push("Your profile indicates remote work, which is the primary condition for this route.");
      if (inList(MX_NOVISA, nat)) {
        score += 15;
        m.push("For stays of up to 180 days, your nationality can enter as a visitor without a Mexican visa.");
      }
      w.push("Mexico has no dedicated digital nomad visa; remote workers commonly use the visitor condition (up to 180 days) or the temporary resident route (economic solvency requirements).");
      w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      return mxDnv(clamp(score, 0, 45));
    },
  };

  /* =========================================================================
     TAILANDIA — Wave 3 sudeste asiático (v1.31.0). Evidencia 15-jul-2026:
     - Exención de visado 60 días: PDF oficial MFA (93 países, rev. 16-jul-2024;
       texto por OCR Vision, cotejado). AR y CL van por acuerdos bilaterales.
     - EN TRANSICIÓN: el Gabinete tailandés aprobó (19-may-2026) recortar el
       esquema a 30 días; pendiente de publicación en la Royal Gazette a fecha
       de captura => aviso de transición en la app + REVIEW + vigilancia.
     - DTV (nómada digital): sin fuente capturada aún => hedged + REVIEW.
  ========================================================================= */
  var TH_EXEMPT = ["AD","AU","AT","BE","BR","BG","CA","CN","CO","HR","CU","CY","CZ","DK","DO",
    "EC","EE","FI","FR","GE","DE","GR","GT","HK","HU","IS","IL","IT","JP","KR","LI","LT","LU",
    "MT","MX","NL","NZ","NO","PA","PE","PL","PT","RO","RU","SI","SK","ES","SE","CH","TW","TR",
    "UA","GB","US","UY"];
  var TH_BILATERAL = ["AR","CL"];

  COUNTRY_RULES.TH = {

    /* v1.88.0 — Fase 3: turismo en DOS tarjetas. La exención (AUDITADA, PDF del
       MFA) conserva sus hechos y su ruta — solo se le corrige el officialName
       combinado (lección v1.84) y se le renombra la ruta a th_tourist_exemption
       en la app y en sources.json a la vez. La Tourist Visa (TR) es una tarjeta
       app-side (patrón us_tourist_b1b2): sin hechos capturados aún → línea
       preliminar. La ruta auditada tiene sourcesComplete=false, así que no hay
       riesgo de EXTRA_IN_APP al repartir frases. */
    tourist: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      var exempt = inList(TH_EXEMPT, nat), bilateral = inList(TH_BILATERAL, nat);

      /* ── Exención de visado (ruta auditada) ──────────────────────────── */
      if (exempt) {
        score += 55;
        m.push("Your passport nationality appears on Thailand's visa exemption list: stays of up to 60 days for tourism, extendable once by up to 30 days.");
      } else if (bilateral) {
        score += 55;
        m.push("Your passport nationality has a bilateral visa exemption agreement with Thailand; the period of stay is based on the respective agreement.");
      } else {
        score += 10;
        w.push("Your passport nationality does not appear on Thailand's visa exemption list, so you would need a visa before travelling.");
        x.push("passport");
      }
      w.push("Thailand approved changes to its visa exemption scheme in May 2026 (reducing stays for many nationalities); the change was pending official publication at capture time - verify before travelling.");
      w.push("You cannot work during a visa-exempt stay; paid activities are not allowed.");
      finReq("You may need to show sufficient funds for your stay and onward travel.", w);
      w.push("This is simulated guidance only. Always verify with the Ministry of Foreign Affairs of Thailand (mfa.go.th).");
      var exemption = visaResult("tourist", clamp(score, 0, 68), m, w, x);
      exemption.officialName = "Thailand visa exemption — 60 days";
      exemption.route = "th_tourist_exemption";

      /* ── Tourist Visa (TR): universal, app-side, nivel modelado ──────── */
      var tm = [], tw = [];
      tm.push("Thailand's Tourist Visa (TR) is applied for before you travel and allows a 60-day stay, which an immigration office can extend once by 30 days.");
      tw.push("There is a single-entry version and a multiple-entry version valid for 6 months, with each stay of up to 60 days.");
      tw.push("It is applied for through Thailand's official e-Visa portal or a Royal Thai embassy or consulate, and the multiple-entry version asks for higher proof of funds.");
      tw.push("You cannot work in Thailand on a tourist visa; paid activities are not allowed.");
      tw.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var tr = visaResult("tourist", exempt || bilateral ? 52 : 58, tm, tw, []);
      tr.officialName = "Thailand Tourist Visa (TR) — 60 days";
      tr.route = "th_tourist_tr";

      return [exemption, tr];
    },

    work_and_holiday: function (p) {
      var m = [], w = [], x = [], score = 5;
      w.push("Thailand does not operate a working holiday programme.");
      x.push("passport");
      var r = visaResult("work_and_holiday", score, m, w, x);
      r.officialName = "No working holiday programme"; r.route = "th_no_whv";
      return r;
    },

    student: function (p) {
      var m = [], w = [], x = [], score = 0;
      var pt = passportTier(p.nationality);
      if (pt <= 2) { score += 14; m.push("Your passport nationality is generally accepted for Thai education visa applications."); }
      else         { score += 8;  w.push("Additional documentation requirements may apply for your passport nationality."); }
      score += scoreEdu(p, "secondary", 24);
      if (eduRank(p.education) < eduRank("secondary")) x.push("minEdu");
      else m.push("Your education level appears to meet general requirements.");
      score += scoreAge(p.age, 16, 65, 10);
      w.push("Studying in Thailand requires admission to a recognised institution and a Non-Immigrant ED visa.");
      finReq("You may need to show sufficient funds for tuition and living costs. Check official Thai requirements.", w);
      w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var r = visaResult("student", Math.min(score, 58), m, w, x);
      r.officialName = "Thailand Education Visa (Non-Immigrant ED)"; r.route = "th_student";
      return r;
    },

    digital_nomad: function (p) {
      /* v1.77.0 — DTV AUDITADA: checklist oficial del MFA (Checklist_DTV.pdf,
         image.mfa.go.th) capturado 29-jul-2026 con UA de navegador. Snapshot:
         tools/visa-intelligence/snapshots/ae-th-upgrade-2026-07/. */
      var m = [], w = [], x = [], score = 0;
      function thDnv(sc) {
        var r = visaResult("digital_nomad", sc, m, w, x);
        r.officialName = "Destination Thailand Visa (DTV — Workcation)"; r.route = "th_dtv";
        return r;
      }
      if (!p.remoteWork) {
        w.push("Thailand's DTV (Workcation) covers digital nomads, remote workers, foreign talent and freelancers.");
        w.push("A DTV track also exists for Thai soft power activities such as Muaythai, Thai culinary training and medical treatment.");
        return thDnv(8);
      }
      m.push("Thailand's DTV (Workcation) covers digital nomads, remote workers, foreign talent and freelancers.");
      m.push("A DTV track also exists for Thai soft power activities such as Muaythai, Thai culinary training and medical treatment.");
      score = 40;
      if (p.savings >= 15000) { score += 22; m.push("You appear to meet the funds requirement: a bank statement for the last 3 months with an ending balance of no less than 500,000 THB."); }
      else { w.push("You need a bank statement for the last 3 months with an ending balance of no less than 500,000 THB."); }
      if (p.savings >= 30000) score += 12;
      w.push("You must show proof of salary or monthly income for the last 6 months, plus an employment contract or certificate authenticated by an embassy.");
      w.push("Proof of prolonged residence in Thailand for at least 6 months (such as a rental agreement) is required.");
      w.push("Your passport must be valid within 6 months from the travel date.");
      w.push("Approval is always a prerogative of the Thai authorities. Simulated guidance only.");
      return thDnv(score);
    },
  };

  /* =========================================================================
     EMIRATOS ÁRABES UNIDOS — Virtual Work Visa al nivel AUDITADO (v1.77.0)
     Fuente capturada 29-jul-2026: u.ae (portal oficial del Gobierno de EAU),
     "Residence visa for working outside the UAE" (curl-friendly). Snapshot:
     tools/visa-intelligence/snapshots/ae-th-upgrade-2026-07/.
  ========================================================================= */
  COUNTRY_RULES.AE = {
    digital_nomad: function (p) {
      var m = [], w = [], x = [];
      function aeDn(sc) {
        var r = visaResult("digital_nomad", sc, m, w, x);
        r.officialName = "UAE Virtual Work Residence Visa";
        r.route = "ae_digital_nomad";
        return r;
      }
      if (!p.remoteWork) {
        w.push("The UAE virtual work visa lets you live in the UAE while working for a company outside the UAE.");
        return aeDn(8);
      }
      m.push("The UAE virtual work visa lets you live in the UAE while working for a company outside the UAE.");
      m.push("It is a one-year visa under self-sponsorship.");
      var score = 38;
      if (p.savings >= 10000) { score += 16; }
      if (p.savings >= 42000) { score += 18; }
      w.push("You need a salary certificate of a minimum of 3,500 US dollars per month (or equivalent).");
      w.push("You must provide a copy of health insurance and a medical fitness test result.");
      w.push("Applications go to the federal ICP or to GDRFA Dubai.");
      w.push("Approval is always a prerogative of the UAE authorities. Simulated guidance only.");
      return aeDn(score);
    },
    tourist: function (p) { return genericDe("AE", "tourist", p); },
  };

  /* =========================================================================
     SINGAPUR — Wave 3 sudeste asiático (v1.31.0). Evidencia 15-jul-2026:
     - Visados (ICA, fetch directo): lista de países que SÍ requieren visa;
       el resto entra sin visa con e-Pass a discreción del puesto fronterizo.
     - Work Holiday Programme (MOM, fetch directo): 18-25, universitarios o
       graduados de 10 países/regiones, hasta 6 meses, cupo 2.000.
  ========================================================================= */
  var SG_VISA_REQUIRED = ["GE","RU","UA"];
  var SG_WHP = ["AU","FR","DE","HK","JP","NL","NZ","CH","GB","US"];

  COUNTRY_RULES.SG = {

    tourist: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      function sgTourist(sc) {
        var r = visaResult("tourist", sc, m, w, x);
        r.officialName = "Singapore visitor entry (visa-free / visa)"; r.route = "sg_tourist";
        return r;
      }
      if (inList(SG_VISA_REQUIRED, nat)) {
        score += 15;
        w.push("Your travel document appears on Singapore's list of countries that require a valid entry visa before travelling.");
        x.push("passport");
      } else {
        score += 55;
        m.push("Your passport nationality does not appear on Singapore's visa-required lists: most visitors enter visa-free.");
      }
      w.push("The period of stay is determined by the Visit Pass (e-Pass) granted electronically at the checkpoint, not by the visa.");
      w.push("You must submit the SG Arrival Card before entry; it is not a visa.");
      w.push("You cannot work during a visitor stay; paid activities are not allowed.");
      finReq("You may need to show sufficient funds for your stay and onward travel.", w);
      w.push("This is simulated guidance only. Always verify with the Immigration & Checkpoints Authority (ica.gov.sg).");
      return sgTourist(clamp(score, 0, 68));
    },

    work_and_holiday: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      function sgWhp(sc) {
        var r = visaResult("work_and_holiday", sc, m, w, x);
        r.officialName = "Singapore Work Holiday Pass (Work Holiday Programme)"; r.route = "sg_whp";
        return r;
      }
      if (!inList(SG_WHP, nat)) {
        w.push("Singapore's Work Holiday Programme covers university students and graduates from ten countries or regions; your nationality does not appear to be among them.");
        x.push("passport");
        return sgWhp(10);
      }
      score += 40; m.push("Your passport nationality is among the ten countries or regions covered by Singapore's Work Holiday Programme.");
      score += scoreAge(p.age, 18, 25, 30);
      if (p.age < 18 || p.age > 25) { x.push("maxAge"); }
      else { m.push("Your age appears to be within the eligible range for this pass (18 to 25 at the time of application)."); }
      w.push("You must be an undergraduate or graduate of a university in one of the ten eligible countries or regions, recognised by its government.");
      w.push("The pass allows work and holiday in Singapore for up to 6 months.");
      w.push("The Work Holiday Programme has a capacity of 2,000 pass holders at any one time.");
      finReq("You may need to show proof of university enrolment or graduation and residence requirements.", w);
      w.push("Verify current conditions with the Ministry of Manpower (mom.gov.sg). Simulated guidance only.");
      return sgWhp(score);
    },

    student: function (p) {
      var m = [], w = [], x = [], score = 0;
      var pt = passportTier(p.nationality);
      if (pt <= 2) { score += 14; m.push("Your passport nationality is generally accepted for Singapore student pass applications."); }
      else         { score += 8;  w.push("Additional documentation requirements may apply for your passport nationality."); }
      score += scoreEdu(p, "secondary", 24);
      if (eduRank(p.education) < eduRank("secondary")) x.push("minEdu");
      else m.push("Your education level appears to meet general requirements.");
      score += scoreAge(p.age, 16, 65, 10);
      w.push("Studying in Singapore requires admission to a registered institution and a Student's Pass (ICA).");
      finReq("You may need to show sufficient funds for tuition and living costs. Check official Singapore requirements.", w);
      w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var r = visaResult("student", Math.min(score, 58), m, w, x);
      r.officialName = "Singapore Student's Pass"; r.route = "sg_student";
      return r;
    },

    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 0;
      function sgDnv(sc) {
        var r = visaResult("digital_nomad", sc, m, w, x);
        r.officialName = "Singapore: no dedicated digital nomad visa"; r.route = "sg_digital_nomad";
        return r;
      }
      if (!p.remoteWork) {
        w.push("Working remotely from Singapore requires an active remote work relationship with an employer or clients abroad.");
        return sgDnv(6);
      }
      score += 20;
      m.push("Your profile indicates remote work, which is the primary condition for this route.");
      w.push("Singapore has no dedicated digital nomad visa; short remote-work stays happen under visitor rules and longer stays require a work pass.");
      w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      return sgDnv(clamp(score, 0, 40));
    },
  };

  /* =========================================================================
     EUROPA SCHENGEN — Wave 2 ampliada (v1.19.0). Fábrica de reglas compartida
     para los 26 miembros Schengen sin modelo propio (ES/PT tienen el suyo;
     Irlanda NO es Schengen y queda para su propia fase).
     - tourist: reutiliza el modelo Schengen auditado de ES (regla 90/180,
       fuente Comisión Europea) — mismas cadenas, mismos appMatch.
     - work: libre circulación UE/EEE; no comunitarios -> patrocinio (genérico
       conservador). Suiza no está en euEea -> tratamiento genérico prudente.
     - student/digital_nomad/work_and_holiday: genéricos conservadores con
       redacción prudente por verificar (sin negativas absolutas — lección PT).
  ========================================================================= */
  var EU_SCHENGEN_SHARED = ["AT","BE","BG","CH","CZ","DE","DK","EE","FI","FR","GR","HR","HU",
    "IS","IT","LI","LT","LU","LV","MT","NL","NO","PL","RO","SE","SI","SK"];

  function makeSchengenRules(iso) {
    var slug = iso.toLowerCase();
    return {
      tourist: function (p) {
        var r = COUNTRY_RULES.ES.tourist(p);   /* regla Schengen auditada compartida */
        r.type = "tourist";
        r.officialName = "Schengen short stay (90/180)";
        r.route = slug + "_schengen_visit";
        return r;
      },
      work: function (p) {
        var m = [], w = [], x = [], score = 0, nat = p.nationality;
        if (inList(PASSPORT.euEea, nat)) {
          score += 50; m.push("EU/EEA citizens can work in this destination under freedom of movement.");
        } else if (passportTier(nat) <= 2) {
          score += 14; w.push("A work visa with employer sponsorship is required for non-EU nationals."); x.push("passport");
        } else {
          score += 6; w.push("A work visa is required. Conditions vary significantly by nationality."); x.push("passport");
        }
        score += scoreEdu(p, "university_plus", 28);
        if (eduRank(p.education) < eduRank("university_plus")) { x.push("minEdu"); }
        else { m.push("Your education level appears to meet typical requirements."); }
        score += scoreEng(p, "intermediate", 16);
        finReq("You may need to show sufficient funds. Check official work visa requirements for this destination.", w);
        w.push("Non-EU work permits typically require employer sponsorship. Simulated guidance only.");
        var r = visaResult("work", score, m, w, x);
        r.officialName = "National work permit"; r.route = slug + "_work";
        return r;
      },
      student: function (p) {
        var m = [], w = [], x = [], score = 0, nat = p.nationality;
        if (inList(PASSPORT.euEea, nat)) { score += 22; m.push("EU/EEA citizens face minimal visa barriers for studying in this destination."); }
        else if (passportTier(nat) <= 2) { score += 16; m.push("Your passport nationality is generally accepted for student visa applications in this destination."); }
        else                              { score += 8;  w.push("Additional documentation requirements may apply for your passport nationality."); }
        score += scoreEng(p, "basic", 14);
        score += scoreEdu(p, "secondary", 24);
        if (eduRank(p.education) < eduRank("secondary")) x.push("minEdu");
        else m.push("Your education level appears to meet general requirements.");
        score += scoreAge(p.age, 17, 65, 10);
        finReq("You may need to show sufficient funds for tuition and living costs. Check official student visa requirements for this destination.", w);
        w.push("Enrollment acceptance from a recognised institution is required. National requirements have not been verified by Wayfare yet - simulated guidance only.");
        var r = visaResult("student", Math.min(score, 68), m, w, x);
        r.officialName = "National student visa"; r.route = slug + "_study";
        return r;
      },
      work_and_holiday: function (p) {
        var m = [], w = [], x = [], score = 12;
        w.push("Working holiday availability for this destination depends on bilateral agreements and has not been verified by Wayfare yet. Check the official sources of this country.");
        x.push("passport");
        var r = visaResult("work_and_holiday", score, m, w, x);
        r.officialName = "Working holiday (unverified)"; r.route = slug + "_youth_mobility";
        return r;
      },
      digital_nomad: function (p) {
        var m = [], w = [], x = [], score = 0, nat = p.nationality;
        function dnv(sc) {
          var r = visaResult("digital_nomad", sc, m, w, x);
          r.officialName = "National remote-work provisions (unverified)"; r.route = slug + "_dnv";
          return r;
        }
        if (inList(PASSPORT.euEea, nat)) {
          m.push("As an EU/EEA citizen, you can live and work in this destination under freedom of movement.");
          w.push("EU freedom of movement rules apply. No Digital Nomad Visa is required.");
          return dnv(82);
        }
        if (!p.remoteWork) {
          w.push("Digital nomad or remote-work permits require active remote work for a foreign employer or clients.");
          return dnv(6);
        }
        score += 30; m.push("Your profile indicates remote work, which is the primary factor for this route.");
        w.push("Several European countries offer national digital nomad or remote-work permits; provisions vary by country and have not been verified for this destination yet. Check official national sources.");
        return dnv(clamp(score, 0, 40));
      },
    };
  }
  EU_SCHENGEN_SHARED.forEach(function (iso) { COUNTRY_RULES[iso] = makeSchengenRules(iso); });

  /* ── Tanda 2 (v1.20.0): WHV reales de DE y FR (sobrescriben la fábrica) ── */
  /* Alemania — FAQ oficial del Auswärtiges Amt (capturado 15-jul-2026):
     AR AU BR CL HK IL JP KR NZ TW UY · 18-30 (KR hasta 34) · hasta 12 meses. */
  var DE_YM = { AR:1, AU:1, BR:1, CL:1, HK:1, IL:1, JP:1, KR:1, NZ:1, TW:1, UY:1 };
  COUNTRY_RULES.DE.work_and_holiday = function (p) {
    var m = [], w = [], x = [], score = 0, nat = p.nationality;
    function deYm(sc) {
      var r = visaResult("work_and_holiday", sc, m, w, x);
      r.officialName = "Germany Working Holiday"; r.route = "de_working_holiday";
      return r;
    }
    if (!DE_YM[nat]) {
      w.push("Germany's working holiday programmes appear limited to: Argentina, Australia, Brazil, Chile, Hong Kong, Israel, Japan, South Korea, New Zealand, Taiwan and Uruguay.");
      x.push("passport");
      return deYm(10);
    }
    score += 42; m.push("Your passport nationality has a working holiday programme with Germany.");
    var maxAge = (nat === "KR") ? 34 : 30;
    score += scoreAge(p.age, 18, maxAge, 38);
    if (p.age < 18 || p.age > maxAge) { x.push("maxAge"); }
    else { m.push("Your age appears to be within the eligible range for this visa (18 to " + maxAge + ")."); }
    w.push("The programme allows stays of up to 12 months; holiday jobs may be accepted to help finance the stay.");
    finReq("You may need to show sufficient funds for your stay. Check with the German mission in your country.", w);
    w.push("Work allowances vary by nationality (e.g., limits on months worked or per employer). Verify current conditions with the German mission. Simulated guidance only.");
    return deYm(score);
  };

  /* Francia — france-visas.gouv.fr (snapshot archive.org 18-oct-2025):
     16 socios · 18-30 (AR/AU/CA hasta 35) · motivo principal turístico-cultural. */
  var FR_YM = { AU:35, AR:35, BR:30, CA:35, CL:30, CO:30, KR:30, EC:30, JP:30, NZ:30, HK:30, MX:30, PE:30, RU:30, TW:30, UY:30 };
  COUNTRY_RULES.FR.work_and_holiday = function (p) {
    var m = [], w = [], x = [], score = 0, nat = p.nationality;
    function frYm(sc) {
      var r = visaResult("work_and_holiday", sc, m, w, x);
      r.officialName = "France Working Holiday (vacances-travail)"; r.route = "fr_working_holiday";
      return r;
    }
    var maxAge = FR_YM[nat];
    if (!maxAge) {
      w.push("France's working holiday agreements appear limited to 16 countries/territories, including Argentina, Brazil, Chile, Colombia, Ecuador, Mexico, Peru and Uruguay.");
      x.push("passport");
      return frYm(10);
    }
    score += 42; m.push("Your passport nationality has a working holiday agreement with France.");
    score += scoreAge(p.age, 18, maxAge, 38);
    if (p.age < 18 || p.age > maxAge) { x.push("maxAge"); }
    else { m.push("Your age appears to be within the eligible range for this visa (18 to " + maxAge + ")."); }
    w.push("The main purpose of the stay must be tourist and cultural discovery of France; work is complementary.");
    finReq("You must meet the funds level set by your country's agreement. Check france-visas.gouv.fr.", w);
    w.push("Apply at the competent visa centre in your country of nationality. Simulated guidance only.");
    return frYm(score);
  };

  /* Irlanda — NO Schengen; ISD oficial (capturado 15-jul-2026):
     WHA con AD AR AU CA CL HK JP NZ KR US TW · plazas limitadas · vía DFA ·
     edades/cupos varían por país (no capturados) => sin puntuar edad, tope partial. */
  var IE_YM = { AD:1, AR:1, AU:1, CA:1, CL:1, HK:1, JP:1, NZ:1, KR:1, US:1, TW:1 };
  COUNTRY_RULES.IE = {
    tourist: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      if (passportTier(nat) === 1) { score += 50; m.push("Your passport appears to provide strong global visa access."); }
      else if (passportTier(nat) === 2) { score += 28; w.push("A visa may be required depending on bilateral agreements."); x.push("passport"); }
      else { score += 10; w.push("A visa will likely be required for this destination."); x.push("passport"); }
      w.push("Ireland is not part of the Schengen area and applies its own entry rules. Check official Irish sources for your nationality.");
      finReq("You may need to show sufficient funds for your stay. Check the official visa requirements for this destination.", w);
      var r = visaResult("tourist", clamp(score, 0, 68), m, w, x);
      r.officialName = "Ireland short stay (own regime)"; r.route = "ie_short_stay";
      return r;
    },
    work_and_holiday: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      function ieYm(sc) {
        var r = visaResult("work_and_holiday", sc, m, w, x);
        r.officialName = "Ireland Working Holiday Authorisation"; r.route = "ie_wha";
        return r;
      }
      if (!IE_YM[nat]) {
        w.push("Ireland's Working Holiday Authorisation appears limited to: Andorra, Argentina, Australia, Canada, Chile, Hong Kong, Japan, New Zealand, South Korea, Taiwan and the USA.");
        x.push("passport");
        return ieYm(10);
      }
      score += 42; m.push("Your passport nationality has a Working Holiday Authorisation agreement with Ireland.");
      score += 26;  /* edades/cupos por país no capturados: sin puntuar edad; tope partial */
      w.push("Age limits and annual quotas vary by country (e.g., 18-30 or 18-35) - check the Department of Foreign Affairs before applying.");
      w.push("Places are limited and you cannot apply if you are already in Ireland.");
      w.push("Applications are made through the Department of Foreign Affairs. Simulated guidance only.");
      finReq("You may need to show sufficient funds for your stay.", w);
      return ieYm(Math.min(score, 68));
    },
    student: makeSchengenRules("IE").student,
    work: makeSchengenRules("IE").work,
    digital_nomad: makeSchengenRules("IE").digital_nomad,
  };

  /* =========================================================================
     GENERIC FALLBACK  (mock.js countries without COUNTRY_RULES)
  ========================================================================= */
  function genericVisa(visaType, p, hints) {
    hints = hints || {};
    var m = [], w = [], x = [], score = 0;
    var nat = p.nationality;
    var pt  = passportTier(nat);

    switch (visaType) {

      case "tourist":
        if (pt === 1)      { score += 52; m.push("Your passport appears to provide strong global visa access."); }
        else if (pt === 2) { score += 30; w.push("A visa may be required depending on bilateral agreements."); x.push("passport"); }
        else               { score += 10; w.push("A visa will likely be required for this destination."); x.push("passport"); }
        if (p.remoteWork) m.push("Proof of regular income may support a visitor application.");
        finReq("You may need to show sufficient funds for your stay. Check the official visa requirements for this destination.", w);
        break;

      case "work_and_holiday":
        if (pt <= 2) { score += 30; w.push("Working Holiday eligibility depends on specific bilateral agreements with this destination."); }
        else         { score += 5;  w.push("Working Holiday visas typically require bilateral agreements. Your passport may not be eligible."); x.push("passport"); }
        score += scoreAge(p.age, 18, 30, 32);
        if (p.age < 18 || p.age > 35) x.push("maxAge");
        finReq("You may need to show sufficient funds for your stay. Check official working holiday requirements for this destination.", w);
        break;

      case "student":
        if (pt <= 2) { score += 16; } else { score += 7; w.push("Additional documentation may be required for your passport nationality."); }
        score += scoreEng(p, hints.minEnglish || "intermediate", 26);
        if (engRank(p.english) < engRank(hints.minEnglish || "intermediate")) x.push("minEnglish");
        score += scoreEdu(p, hints.minEdu || "secondary", 22);
        if (eduRank(p.education) < eduRank(hints.minEdu || "secondary")) x.push("minEdu");
        finReq("You may need to show sufficient funds for tuition and living costs. Check official student visa requirements for this destination.", w);
        break;

      case "work":
        if (pt <= 2) { score += 14; } else { score += 5; w.push("Work permit processes may be more complex for your passport nationality."); }
        score += scoreEdu(p, hints.minEdu || "university_plus", 32);
        if (eduRank(p.education) < eduRank(hints.minEdu || "university_plus")) x.push("minEdu");
        score += scoreEng(p, hints.minEnglish || "intermediate", 26);
        if (engRank(p.english) < engRank(hints.minEnglish || "intermediate")) x.push("minEnglish");
        finReq("You may need to show sufficient funds. Check official work visa requirements for this destination.", w);
        break;

      case "digital_nomad":
        if (!p.remoteWork) {
          w.push("Remote work is the primary eligibility factor for Digital Nomad visas.");
          finReq("You may need to show sufficient funds and income. Check official digital nomad visa requirements for this destination.", w);
          score = 5;
        } else {
          score += 34; m.push("Your profile indicates remote work, which is the main qualifying factor.");
          if (p.monthlyIncome) w.push("Income requirements should be verified against official digital nomad visa requirements for this destination.");
          finReq("You may need to show sufficient funds and income. Check official digital nomad visa requirements for this destination.", w);
        }
        break;

      default:
        score = 18;
    }

    w.push("Simulated guidance only. Always verify with official immigration sources.");
    return visaResult(visaType, score, m, w, x);
  }

  /* ── UNITED KINGDOM — GB destination rules (Phase 10F) ───────────────────
     Data sourced from GOV.UK (simulated representation; Phase 10C/10D
     evidence). Youth Mobility uses a per-nationality config (GB_YMS), the
     NZ_WHV pattern. Money, fees and time-sensitive values are warnings only —
     never scored. Standard Visitor and Student are always partial: core
     requirements (genuine visitor, CAS, financial evidence) cannot be
     assessed from the questionnaire. Skilled Worker is intentionally NOT
     modeled (deferred). Replaces the old genericVisa() fallback for GB.
  ─────────────────────────────────────────────────────────────────────── */
  var GB_YMS = {
    AU: { maxAge: 35, extension1yr: true },
    CA: { maxAge: 35, extension1yr: true },
    NZ: { maxAge: 35, extension1yr: true },
    KR: { maxAge: 35 },
    AD: { maxAge: 30 },
    IS: { maxAge: 30, criminalCert: true },
    JP: { maxAge: 30 },
    MC: { maxAge: 30 },
    SM: { maxAge: 30 },
    UY: { maxAge: 30 },
    HK: { maxAge: 30, ballot: true },   /* SAR passport */
    TW: { maxAge: 30, ballot: true },
    /* IN intentionally absent — separate India Young Professionals Scheme */
  };

  /* Shared Youth Mobility conditions — all informational (money not scored) */
  function gbYmsSharedWarnings(cfg, w) {
    w.push("You may be given a visa to live and work in the UK for up to 24 months.");
    if (cfg.extension1yr) w.push("If you are from Australia, Canada or New Zealand, you may be able to extend your visa by one year after the 2-year period ends.");
    finReq("You must have at least £2,530 in savings, held for at least 28 days in a row; day 28 must be within 31 days of applying.", w);
    w.push("The application fee is £340, and you usually pay the healthcare surcharge of £776 per year. Fees can change.");
    w.push("The earliest you can apply is 6 months before you travel.");
    w.push("You can work in most jobs. Self-employment is only allowed if your premises are rented, your equipment is worth no more than £5,000 and you have no employees.");
    w.push("You cannot work as a professional sportsperson, and you cannot get public funds.");
    w.push("You can study, but some courses need an Academic Technology Approval Scheme certificate.");
    w.push("You cannot bring family members on this visa, and you cannot apply if you have children under 18 who live with you or who you are financially responsible for.");
    w.push("You cannot apply if you have already been in the UK under the Youth Mobility Scheme.");
    if (cfg.criminalCert) w.push("Icelandic citizens must provide a criminal certificate.");
    w.push("You may need to provide tuberculosis (TB) test results depending on where you live.");
    w.push("This is simulated guidance only. Always verify with GOV.UK.");
  }

  COUNTRY_RULES.GB = {

    /* ── Youth Mobility Scheme ─────────────────────────────────────────── */
    work_and_holiday: function (p) {
      var m = [], w = [], x = [], score = 0, cap = 100;
      var cfg = GB_YMS[p.nationality];

      function gbYmsResult(score, m, w, x) {
        var r = visaResult("work_and_holiday", clamp(score, 0, 100), m, w, x);
        r.officialName = "Youth Mobility Scheme visa";
        r.route = "gb_youth_mobility";
        return r;
      }

      /* India — separate scheme, never standard YMS */
      if (p.nationality === "IN") {
        x.push("passport");
        w.push("Indian citizens use the separate India Young Professionals Scheme, which has its own ballot and requirements. This is not the standard Youth Mobility Scheme.");
        w.push("Check GOV.UK for the full list of eligible countries and conditions.");
        w.push("This is simulated guidance only. Always verify with GOV.UK.");
        return gbYmsResult(18, m, w, x);
      }

      /* Passport not on the YMS list */
      if (!cfg) {
        x.push("passport");
        w.push("Your passport does not appear to be on the UK Youth Mobility Scheme country list that Wayfare currently covers.");
        w.push("Check GOV.UK for the full list of eligible countries and conditions.");
        w.push("This is simulated guidance only. Always verify with GOV.UK.");
        return gbYmsResult(18, m, w, x);
      }

      /* 1. Passport / country scheme */
      score += 42;
      m.push("Your passport appears to be eligible for the UK Youth Mobility Scheme.");

      /* 2. Age — the band applies at the time you apply (GOV.UK wording) */
      if (p.age < 18 || p.age > cfg.maxAge) {
        x.push("maxAge");
        w.push(cfg.maxAge === 35
          ? "Your age appears to be outside the eligible range for this visa. The range is 18 to 35 at the time you apply."
          : "Your age appears to be outside the eligible range for this visa. The range is 18 to 30 at the time you apply.");
        gbYmsSharedWarnings(cfg, w);
        return gbYmsResult(32, m, w, x);
      }
      score += 38;
      m.push(cfg.maxAge === 35
        ? "Your age appears to be within the eligible range for this visa (18 to 35 at application)."
        : "Your age appears to be within the eligible range for this visa (18 to 30 at application).");

      /* 3. Ballot (HK SAR / Taiwan) — outcome unverifiable, cap to partial */
      if (cfg.ballot) {
        w.push("You must be selected in the Youth Mobility Scheme ballot before you can apply. Ballot places and windows are limited and change over time.");
        cap = Math.min(cap, 62);
      }

      gbYmsSharedWarnings(cfg, w);
      score = Math.min(score, cap);
      return gbYmsResult(score, m, w, x);
    },

    /* ── Standard Visitor ──────────────────────────────────────────────── */
    tourist: function (p) {
      /* v1.84.0 — FASE 3: ETA del Reino Unido y Standard Visitor separadas.
         No «visa nationals»: tarjeta ETA + Standard Visitor universal;
         «visa nationals»: solo Standard Visitor. */
      var cards = [];
      var esVisaNational = inList(GB_VISA_NATIONALS, p.nationality);
      if (!esVisaNational) {
        var mE = [], wE = [];
        mE.push("Your nationality is not on the UK visa national list: you can usually visit for up to 6 months without a visitor visa, but you may need an Electronic Travel Authorisation (ETA).");
        wE.push("This is simulated guidance only. Always verify with GOV.UK.");
        var rE = visaResult("tourist", 55, mE, wE, []);
        rE.officialName = "UK Electronic Travel Authorisation (ETA)";
        rE.route = "gb_tourist_eta";
        cards.push(rE);
      }

      var m = [], w = [], x = [], score;
      if (esVisaNational) {
        score = 42;
        w.push("Your nationality is on the UK visa national list: you must obtain a Standard Visitor visa before you travel.");
      } else {
        score = 46;
        m.push("The full Standard Visitor visa is available to any nationality.");
      }

      w.push("You can usually stay in the UK for up to 6 months as a Standard Visitor.");
      w.push("You must be a genuine visitor who will leave the UK at the end of your visit.");
      finReq("You must be able to support yourself and any dependants during your trip, or have funding from someone else to support you.", w);
      w.push("You cannot do paid or unpaid work for a UK company or as a self-employed person, unless you are doing a permitted paid engagement or event.");
      w.push("You cannot live in the UK for long periods of time through frequent or successive visits.");
      w.push("You cannot marry or register a civil partnership, or give notice of marriage or civil partnership, on this visa.");
      w.push("You can study for up to 6 months on a Standard Visitor visa.");
      w.push("A Standard Visitor visa costs £135 for up to 6 months. Long-term visas cost £506 (2 years), £903 (5 years) or £1,128 (10 years), each allowing stays of up to 6 months per visit. Fees can change.");
      w.push("Visitor visas for medical reasons (up to 11 months, £234) and for academics (up to 12 months, £234) have different fees and lengths.");
      w.push("The earliest you can apply is 3 months before you travel.");
      w.push("This is simulated guidance only. Always verify with GOV.UK.");

      /* Always partial: core requirements cannot be verified by Wayfare */
      score = clamp(score, 40, 68);
      var r = visaResult("tourist", score, m, w, x);
      r.officialName = "Standard Visitor visa";
      r.route = "gb_standard_visitor";
      cards.push(r);
      return cards;
    },

    /* ── Nómada digital: ruta HONESTA (v1.92.0, agujero R5) ────────────────
       El Reino Unido no enseñaba NADA a quien elegía «Remoto» siendo uno de los
       destinos más consultados. Mismo estilo que US/AU/CA/NZ: la tarjeta existe
       para explicar la realidad, no para aparentar un programa que no hay. */
    digital_nomad: function (p) {
      var m = [], w = [];
      if (p.remoteWork) m.push("Your profile indicates remote work, which is the main factor for nomad-style stays.");
      w.push("The UK does not offer a digital nomad visa.");
      w.push("Since 2024 the visitor rules do allow you to work remotely for your employer abroad while you are in the UK, as long as remote working is not the main reason for your visit.");
      w.push("A Standard Visitor stay is up to 6 months, and you cannot take a job with a UK employer or live in the UK through repeated visits.");
      w.push("This is simulated guidance only. Always verify with GOV.UK.");
      var r = visaResult("digital_nomad", p.remoteWork ? 34 : 14, m, w, []);
      r.officialName = "United Kingdom: no digital nomad visa";
      r.route = "gb_digital_nomad";
      return r;
    },

    /* ── Student visa ──────────────────────────────────────────────────── */
    student: function (p) {
      var m = [], w = [], x = [], score = 50;

      /* Soft positive signals only (never gate to eligible) */
      if (eduRank(p.education) >= eduRank("secondary")) {
        score += 4;
        m.push("Your education background is a positive signal for a UK Student visa application.");
      }
      if (engRank(p.english) >= engRank("intermediate")) {
        score += 6;
        m.push("Your English level is a positive signal for the Student visa English requirement.");
      }

      w.push("You must be 16 or over to apply for a Student visa.");
      w.push("You need an unconditional offer and a Confirmation of Acceptance for Studies (CAS) from a licensed student sponsor.");
      finReq("You must have enough money to support yourself: £1,529 a month for courses in London or £1,171 a month elsewhere, for up to 9 months, held for at least 28 days in a row. Amounts can change.", w);
      w.push("You must prove knowledge of English: CEFR level B2 for degree level or above, or B1 below degree level.");
      w.push("The application fee is £558, and you usually pay the healthcare surcharge as part of your application. Fees can change.");
      w.push("You may be able to work, but how much depends on your course level and term time; you cannot claim public funds.");
      w.push("Your partner and children can only join you in limited cases, such as some postgraduate research courses. These rules changed in 2024.");
      w.push("Some courses need an Academic Technology Approval Scheme (ATAS) certificate, and you may need tuberculosis (TB) test results.");
      w.push("The earliest you can apply is 6 months before your course starts (from outside the UK).");
      w.push("You can usually get a decision within 3 weeks when applying from outside the UK.");
      w.push("This is simulated guidance only. Always verify with GOV.UK.");

      /* Always partial: CAS/sponsor/funds evidence cannot be verified */
      score = clamp(score, 40, 66);
      var r = visaResult("student", score, m, w, x);
      r.officialName = "Student visa";
      r.route = "gb_student";
      return r;
    },
  };

  /* =========================================================================
     MERCOSUR — Acuerdo de Residencia (v1.68.0 · nivel modelado, SIN auditar)
     Miembros y asociados adheridos al acuerdo de residencia: AR BR PY UY +
     BO CL PE CO EC. (Venezuela está suspendida del bloque.)
     ⚠ AR queda FUERA de esta regla a propósito: sus rutas están AUDITADAS y
     no se tocan sin pasar por el pipeline de evidencia (relevo 28-jul-2026).
     Cuando un país tiene COUNTRY_RULES, esa lista de tipos MANDA sobre
     mock.js — por eso cada miembro define aquí TODOS sus tipos, con
     genericDe() como fallback a la configuración de mock.js.
  ========================================================================= */
  var MERCOSUR = { AR:1, BR:1, PY:1, UY:1, BO:1, CL:1, PE:1, CO:1, EC:1 };

  function genericDe(iso, vType, p) {
    var c  = (D.COUNTRIES || []).find(function(x) { return x.iso === iso; });
    var mv = c && c.visas && c.visas.find(function(v) { return v.type === vType; });
    return genericVisa(vType, p, mv ? mv.req : {});
  }

  function mercosurWork(iso, p) {
    if (MERCOSUR[p.nationality] && p.nationality !== iso) {
      return visaResult("work", 88,
        ["Mercosur Residence Agreement: citizens of member and associated countries can apply for temporary residence with the right to work, without needing a job offer.",
         "After two years of temporary residence you can usually apply for permanent residence."],
        ["You will need a valid passport or ID and a clean criminal record certificate.",
         "Modelled from the regional agreement; each country applies its own procedure and fees. Not yet audited against this destination's official sources."],
        []);
    }
    return genericDe(iso, "work", p);
  }

  var mercosurRules = function (iso, tipos) {
    var r = { work: function (p) { return mercosurWork(iso, p); } };
    tipos.forEach(function (t) {
      if (t !== "work") r[t] = function (p) { return genericDe(iso, t, p); };
    });
    return r;
  };
  COUNTRY_RULES.BR = mercosurRules("BR", ["digital_nomad", "student"]);
  COUNTRY_RULES.CL = mercosurRules("CL", []);

  /* =========================================================================
     v1.92.0 — AGUJEROS DE COBERTURA TAPADOS (riesgo R5 de la auditoría 31-jul).
     Brasil, Chile y Sudáfrica no enseñaban NADA a quien elegía «Turismo»: tres
     destinos grandes en blanco. Nivel MODELADO (línea preliminar en todas),
     con el patrón de siempre: la tarjeta condicionada primero, la universal
     después. Las listas son de nacionalidades DE NUESTRO SELECTOR, no la lista
     oficial entera — por eso cada tarjeta remite a la lista oficial.
  ========================================================================= */
  var BR_VISA_FREE = ["AD", "AR", "AT", "BE", "BG", "BO", "CH", "CL", "CO", "CR", "CU", "CY", "CZ",
    "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HR", "HU", "IE",
    "IL", "IS", "IT", "JP", "KR", "LI", "LT", "LU", "LV", "MT", "MX", "NI", "NL", "NO", "NZ", "PA",
    "PE", "PL", "PT", "PY", "RO", "RS", "RU", "SE", "SI", "SK", "SV", "TR", "UA", "UY", "VE"];
  var BR_EVISA = ["US", "CA", "AU"];      // reciprocidad restablecida el 10-abr-2025

  /* =========================================================================
     BRASIL — estudios y trabajo AUDITADOS (v1.108.0, R5).
     ⚠ HALLAZGO: gov.br/mre (Exteriores) está tras un escudo antibot F5 y
     devuelve 311 caracteres en TODAS sus rutas, también con UA de navegador.
     Pero gov.br/mj (Justicia) sirve el contenido sin problema: es la vía.
     Fuente: autorización de residencia del Ministerio de Justicia y Seguridad
     Pública. Snapshot: ge-br-sv-pa-upgrade-2026-08/.
  ========================================================================= */
  COUNTRY_RULES.BR.student = function (p) {
    var b = estudioBase(p, 58), m = b.m, w = b.w;
    m.push("Brazil grants a residence authorisation for study to immigrants who intend to follow a regular course, an internship or a study or research exchange.");
    w.push("You must show documentation proving enrolment on the course you intend to take.");
    w.push("The application is filed with the Federal Police, together with the request for the National Migration Registry Card.");
    finReq("The fees are R$168.13 for the residence authorisation and R$204.77 for issuing the registry card.", w);
    w.push("You need criminal record certificates from every country where you have lived in the last five years.");
    w.push("This is simulated guidance only. Always verify with Brazil's Ministry of Justice.");
    var r = visaResult("student", Math.min(b.score, b.tope), m, w,
      eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
    r.officialName = "Brazil residence authorisation for study";
    r.route = "br_student";
    return r;
  };

  COUNTRY_RULES.BR.work = function (p) {
    var cards = [];
    if (MERCOSUR[p.nationality] && p.nationality !== "BR") cards.push(mercosurWork("BR", p));
    var b = trabajoBase(p, 56), m = b.m, w = b.w;
    m.push("Brazil grants a residence authorisation for work to immigrants carrying out a job in the country, with or without an employment relationship.");
    w.push("Work-based applications are filed directly with the Ministry of Justice through the MigranteWeb system.");
    w.push("There is also a working-holiday residence authorisation for people over 16 from countries that grant the same benefit to Brazilians.");
    finReq("The fees are R$168.13 for the residence authorisation and R$204.77 for issuing the registry card.", w);
    w.push("You need criminal record certificates from every country where you have lived in the last five years.");
    w.push("This is simulated guidance only. Always verify with Brazil's Ministry of Justice.");
    var r = visaResult("work", Math.min(b.score, b.tope), m, w, []);
    r.officialName = "Brazil residence authorisation for work";
    r.route = "br_work";
    cards.push(r);
    return cards;
  };

  COUNTRY_RULES.BR.tourist = function (p) {
    var cards = [], nat = p.nationality, libre = inList(BR_VISA_FREE, nat), evisa = inList(BR_EVISA, nat);

    if (evisa) {
      var em = [], ew = [];
      em.push("Brazil requires an e-visa from US, Canadian and Australian citizens: the visa exemption ended on 10 April 2025 when Brazil restored reciprocity.");
      ew.push("It is applied for online before travelling, and the visa is valid for multiple entries over several years.");
      ew.push("Each stay cannot exceed 90 days, with a limit of 180 days in any 12-month period.");
      finReq("You may be asked for proof of funds, accommodation and onward travel.", ew);
      ew.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var ev = visaResult("tourist", 58, em, ew, []);
      ev.officialName = "Brazil e-Visa (tourism) — 90 days per stay";
      ev.route = "br_tourist_evisa";
      cards.push(ev);
    } else {
      var fm = [], fw = [];
      if (libre) fm.push("Your passport nationality can enter Brazil for tourism without a visa.");
      else       fw.push("Your passport nationality does not appear on the visa-exemption list we model for Brazil — check the official list before booking.");
      fw.push("Visa-free stays are up to 90 days, extendable at the Federal Police up to a total of 180 days in any 12-month period.");
      fw.push("You cannot take paid work in Brazil as a tourist.");
      finReq("You may be asked for proof of funds, accommodation and onward travel.", fw);
      fw.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var fr = visaResult("tourist", libre ? 76 : 30, fm, fw, libre ? [] : ["passport"]);
      fr.officialName = "Brazil visa-free entry (tourism) — up to 90 days";
      fr.route = "br_tourist_visa_free";
      cards.push(fr);
    }
    return cards;
  };

  /* v1.93.0 — ESTUDIOS en blanco (R5, 2ª parte). Cuatro destinos no enseñaban
     nada a quien elegía «Estudiar»: EAU, Chile, Costa Rica y Georgia. Nivel
     modelado con línea preliminar. Venezuela se queda fuera A PROPÓSITO
     (recorte deliberado del usuario: solo turismo). */
  /* v1.95.0 — base común de las tarjetas de TRABAJO modeladas (R5, 4ª parte).
     Money-agnostic como manda la cabecera del archivo: los importes salen como
     advertencia informativa, NUNCA puntúan (no convertimos divisas). */
  function trabajoBase(p, tope) {
    var m = [], w = [], score = 0;
    if (passportTier(p.nationality) <= 2) { score += 16; m.push("Your passport nationality is generally accepted for work applications in this destination."); }
    else                                   { score += 8;  w.push("Additional documentation requirements may apply for your passport nationality."); }
    score += scoreEdu(p, "secondary", 24);
    if (eduRank(p.education) >= eduRank("secondary")) m.push("Your education level is a positive signal for a skilled work application.");
    score += scoreAge(p.age, 18, 60, 10);
    return { m: m, w: w, score: score, tope: tope };
  }

  function estudioBase(p, tope) {
    var m = [], w = [], score = 0;
    if (passportTier(p.nationality) <= 2) { score += 14; m.push("Your passport nationality is generally accepted for student applications in this destination."); }
    else                                   { score += 8;  w.push("Additional documentation requirements may apply for your passport nationality."); }
    score += scoreEdu(p, "secondary", 24);
    if (eduRank(p.education) >= eduRank("secondary")) m.push("Your education level appears to meet general requirements.");
    score += scoreAge(p.age, 16, 65, 10);
    return { m: m, w: w, score: score, tope: tope };
  }

  /* v1.97.0 — ASCENDIDA A NIVEL AUDITADO (R5). Fuente capturada el 1-ago-2026:
     serviciomigraciones.cl (SERMIG) responde a una descarga normal, así que es
     vigilable sin trato especial. Snapshot: snapshots/cl-upgrade-2026-08/.
     Se cae la línea de «orientación preliminar» y entran tres datos oficiales
     que antes no teníamos: pasaporte con un año de vigencia, antecedentes de
     menos de 60 días y —el más útil— que con esta residencia SÍ se puede
     trabajar hasta 30 horas semanales sin permiso adicional. */
  COUNTRY_RULES.CL.student = function (p) {
    var b = estudioBase(p, 60), m = b.m, w = b.w;
    m.push("Chile's temporary residence permit for students covers studies at state-recognised institutions.");
    w.push("It must be applied for from OUTSIDE Chile, through the online portal of the Servicio Nacional de Migraciones — Chilean consulates do not process it.");
    w.push("You need proof of admission or enrolment at the institution: a certificate of regular student status or of enrolment.");
    finReq("You must show you can support yourself during your studies, with bank deposits, regular transfers, a notarised affidavit from whoever supports you, or a scholarship certificate.", w);
    m.push("With this residence you can work up to 30 hours a week without needing any extra authorisation, either at your own institution or for any other employer.");
    w.push("Your passport must be valid for at least one year from the date you apply.");
    w.push("The criminal record certificate from your country must be no more than 60 days old, and documents issued abroad need an apostille and, if not in Spanish or English, an official translation.");
    w.push("Once you hold it you can change category, for example to work, without leaving Chile.");
    var r = visaResult("student", Math.min(b.score, b.tope), m, w, eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
    r.officialName = "Chile student temporary residence (residencia temporal, estudiantes)";
    r.route = "cl_student";
    return r;
  };

  /* (el de Georgia va MÁS ABAJO, tras definirse COUNTRY_RULES.GE — si se pone
     aquí, o revienta la app o lo pisa el objeto literal de GE) */

  /* v1.95.0 — R5 (4ª parte): EAU en dos tarjetas. La clásica va atada a la
     empresa que te contrata; la Green Visa es de auto-patrocinio (5 años) y no
     se pierde al cambiar de trabajo — es la diferencia que importa contar.
     Los importes (15.000 AED/mes, 360.000 AED/año) van como AVISO, no puntúan:
     el motor es money-agnostic a propósito. */
  COUNTRY_RULES.AE.work = function (p) {
    var cards = [];

    var b = trabajoBase(p, 60), m = b.m, w = b.w;
    m.push("The standard UAE work route is sponsored by the company that hires you: the employer applies for the work permit and the residence visa.");
    w.push("It is normally issued for two to three years and is tied to that employer; if you leave the job, the residence has to be transferred or cancelled.");
    w.push("You will need a medical fitness test, an Emirates ID and health insurance, and your qualifications may have to be attested.");
    w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
    var std = visaResult("work", Math.min(b.score, b.tope), m, w, []);
    std.officialName = "UAE work permit and residence visa (employer-sponsored)";
    std.route = "ae_work_sponsored";
    cards.push(std);

    var g = trabajoBase(p, 58), gm = g.m, gw = g.w;
    gm.push("The UAE Green Visa is a five-year residence you sponsor yourself: no company holds it, and you keep it if you change jobs.");
    gw.push("The skilled-employee route asks for a university degree, a job classified in the top MoHRE skill levels and a monthly salary of at least AED 15,000.");
    gw.push("Freelancers go through a freelance permit and are asked for around AED 360,000 of income over the two previous years.");
    gw.push("It also lets you sponsor your family, which the standard employment visa restricts more.");
    gw.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
    if (eduRank(p.education) >= eduRank("university")) gm.push("Your university education is a positive signal for the skilled-employee route.");
    var green = visaResult("work", Math.min(g.score, g.tope), gm, gw, []);
    green.officialName = "UAE Green Visa (5-year self-sponsored residence)";
    green.route = "ae_work_green";
    cards.push(green);

    return cards;
  };

  COUNTRY_RULES.AE.student = function (p) {
    var b = estudioBase(p, 60), m = b.m, w = b.w;
    m.push("A UAE student residence visa is sponsored by the university or higher-education institution that admits you.");
    w.push("It is normally issued for one year and renewed while you stay enrolled.");
    w.push("You need an acceptance letter, a medical fitness test, health insurance and an Emirates ID.");
    finReq("You may need to show funds for tuition and living costs.", w);
    w.push("Outstanding students can qualify for a long-term residence under the UAE's talent schemes.");
    w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
    var r = visaResult("student", Math.min(b.score, b.tope), m, w, eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
    r.officialName = "UAE student residence visa";
    r.route = "ae_student";
    return r;
  };

  /* ⚠ Costa Rica no tenía reglas propias: al crearlas hay que declarar TODOS sus
     tipos (misma trampa que Sudáfrica) — turismo y nómada siguen delegando en
     la configuración de mock.js. */
  COUNTRY_RULES.CR = {
    tourist:       function (p) { return genericDe("CR", "tourist", p); },

    /* v1.109.0 — NÓMADA DIGITAL AUDITADO. Fuente capturada el 1-ago-2026 con el
       navegador real del usuario: migracion.go.cr está tras un WAF que devuelve
       403 a cualquier descarga automática, pero el sitio está vivo y publica la
       subcategoría completa. Snapshot: cr-chrome-2026-08/. */
    digital_nomad: function (p) {
      var m = [], w = [], score = 0;
      if (p.remoteWork) { score += 40; m.push("Your profile indicates remote work, which is the main condition for this route."); }
      else w.push("This route is for people who provide paid services remotely to a person or company located abroad.");
      m.push("Costa Rica calls this the Stay for Remote Workers and Service Providers (Estancia para Trabajador y Prestador Remoto de Servicios).");
      w.push("Your pay must come from abroad and be at least USD 3,000 a month.");
      w.push("If you also apply for your dependants, the minimum rises to USD 4,000 a month.");
      w.push("The amounts are converted at the official selling rate set by the Central Bank of Costa Rica.");
      w.push("Once approved you are issued a DIMEX migration ID card, and you must hold a medical services policy.");
      w.push("This is simulated guidance only. Always verify with the Dirección General de Migración y Extranjería.");
      var r = visaResult("digital_nomad", clamp(score + 12, 0, 62), m, w, []);
      r.officialName = "Costa Rica stay for remote workers (Estancia para Trabajador y Prestador Remoto de Servicios)";
      r.route = "cr_digital_nomad";
      return r;
    },

    /* v1.95.0 — R5 (4ª parte). El dato que más despista de Costa Rica: NO existe
       una «visa de trabajo» suelta — el permiso vive dentro de una residencia
       temporal. Por eso la tarjeta lo dice en la primera línea. */
    work: function (p) {
      var b = trabajoBase(p, 56), m = b.m, w = b.w;
      m.push("Costa Rica does not issue a separate work visa: the right to work comes inside a temporary residence, usually the special category for employed workers.");
      w.push("A Costa Rican employer has to sponsor you and show that no Costa Rican or permanent resident can fill the post.");
      w.push("The employer must be registered with the labour ministry and enrol you in the social security fund (CCSS).");
      w.push("The permit is tied to that single employer and the process commonly takes between three and eight months.");
      w.push("Your documents from abroad normally need an apostille and an official Spanish translation.");
      w.push("If you work remotely for a company abroad, the digital nomad route fits better than this one.");
      w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var r = visaResult("work", Math.min(b.score, b.tope), m, w, []);
      r.officialName = "Costa Rica temporary residence with work permission (categoría especial)";
      r.route = "cr_work";
      return r;
    },
    student: function (p) {
      var b = estudioBase(p, 58), m = b.m, w = b.w;
      m.push("Costa Rica grants a special student category to people admitted to an accredited institution.");
      w.push("You need an acceptance letter from the institution and to register with the migration authority once there.");
      w.push("Documents issued abroad usually need an apostille and an official Spanish translation.");
      finReq("You may need to show funds for tuition and living costs.", w);
      w.push("It is normally granted for one year and renewed while you remain enrolled.");
      w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var r = visaResult("student", Math.min(b.score, b.tope), m, w, eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
      r.officialName = "Costa Rica student category (categoría especial de estudiante)";
      r.route = "cr_student";
      return r;
    },
  };

  var CL_VISA_FREE = ["AD", "AR", "AT", "AU", "BE", "BG", "BO", "BR", "CA", "CH", "CO", "CR", "CY",
    "CZ", "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "HK", "HR", "HU", "IE", "IL",
    "IS", "IT", "JP", "KR", "LI", "LT", "LU", "LV", "MT", "MX", "NL", "NO", "NZ", "PA", "PE", "PL",
    "PT", "PY", "RO", "RS", "SE", "SI", "SK", "SV", "TR", "US", "UY"];

  COUNTRY_RULES.CL.tourist = function (p) {
    var m = [], w = [], x = [], libre = inList(CL_VISA_FREE, p.nationality);
    if (libre) m.push("Your passport nationality can enter Chile as a tourist without a visa.");
    else       w.push("Your passport nationality does not appear on the visa-exemption list we model for Chile: you would need a consular tourist visa.");
    w.push("Tourist stays are granted for up to 90 days, recorded in the Tarjeta Única Migratoria you receive on entry.");
    w.push("You cannot take paid work in Chile as a tourist; the stay can be extended once at the immigration service.");
    finReq("You may be asked for proof of funds, accommodation and onward travel.", w);
    w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
    var r = visaResult("tourist", libre ? 76 : 30, m, w, libre ? [] : ["passport"]);
    r.officialName = "Chile tourist entry — up to 90 days";
    r.route = "cl_tourist";
    return r;
  };

  var ZA_VISA_FREE = ["AD", "AR", "AT", "AU", "BE", "BR", "CA", "CH", "CL", "CY", "CZ", "DE", "DK",
    "EC", "ES", "FI", "FR", "GB", "GR", "HK", "HU", "IE", "IL", "IS", "IT", "JP", "LI", "LU", "MT",
    "NL", "NO", "NZ", "PA", "PL", "PT", "PY", "SE", "SI", "SG", "US", "UY", "VE"];

  /* ⚠ ZA no tenía reglas propias (era solo mock.js). Al crearlas hay que declarar
     TODOS sus tipos: cuando un país tiene COUNTRY_RULES, esa lista MANDA sobre
     mock.js — si solo pusiéramos «tourist», Sudáfrica perdería trabajo, estudios
     y nómada. Los tres siguen delegando en la configuración de mock.js. */
  /* v1.102.0 — SUDÁFRICA: trabajo y estudios ASCENDIDOS a nivel auditado (R5).
     Fuente capturada el 1-ago-2026: dha.gov.za (Department of Home Affairs)
     publica TODAS sus categorías en una sola página de 54.000 caracteres, con
     descarga normal. Snapshot: za-upgrade-2026-08/.
     El nómada sigue delegando en mock.js: Sudáfrica anunció un régimen para
     trabajadores remotos pero la página del DHA aún no lo detalla. */
  COUNTRY_RULES.ZA = {
    digital_nomad: function (p) { return genericDe("ZA", "digital_nomad", p); },

    work: function (p) {
      var b = trabajoBase(p, 58), m = b.m, w = b.w;
      m.push("South Africa's general work visa is valid for the duration of the employment contract, up to a maximum of five years.");
      w.push("You need a police clearance certificate from every country where you lived for longer than 12 months in the last five years, and it cannot be older than six months when you submit it.");
      w.push("You also need a medical report signed by a medical practitioner, no older than six months at submission.");
      w.push("This is simulated guidance only. Always verify with the Department of Home Affairs.");
      var r = visaResult("work", Math.min(b.score, b.tope), m, w, []);
      r.officialName = "South Africa General Work Visa";
      r.route = "za_work";
      return r;
    },

    student: function (p) {
      var b = estudioBase(p, 58), m = b.m, w = b.w;
      m.push("South Africa issues a study visa for the course you are accepted onto.");
      w.push("You need an official letter confirming provisional acceptance or acceptance at the learning institution and the duration of the course.");
      w.push("You need a police clearance certificate from every country where you lived for longer than 12 months in the last five years, and it cannot be older than six months when you submit it.");
      w.push("Proof of medical cover is required, and a cash deposit equivalent to a return or onward ticket may be asked for.");
      w.push("This is simulated guidance only. Always verify with the Department of Home Affairs.");
      var r = visaResult("student", Math.min(b.score, b.tope), m, w,
        eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
      r.officialName = "South Africa Study Visa";
      r.route = "za_student";
      return r;
    },
  };
  COUNTRY_RULES.ZA.tourist = function (p) {
    var m = [], w = [], x = [], libre = inList(ZA_VISA_FREE, p.nationality);
    if (libre) m.push("Your passport nationality can visit South Africa without a visa for up to 90 days.");
    else       w.push("Your passport nationality does not appear on the visa-exemption list we model for South Africa: you would need a visitor's visa from a South African mission.");
    w.push("Exempt nationalities are given between 30 and 90 days depending on the passport — check which applies to yours.");
    w.push("South Africa is rolling out an Electronic Travel Authorisation; exempt travellers are not obliged to use it yet, but it may speed up the border.");
    /* v1.102.0 — tres hechos oficiales del DHA capturados (la ruta deja de ser
       modelada). El tercero salva viajes perdidos: sin visa no te dejan embarcar. */
    w.push("Visitors' visas are for stays of 90 days or less, for tourism or business.");
    w.push("Your passport must be valid for no less than 30 days after your intended visit ends.");
    w.push("Visas are not issued at South African ports of entry: airline staff are obliged to insist on the visa before letting you board.");
    w.push("You cannot take paid work in South Africa as a visitor.");
    finReq("You may be asked for proof of funds, accommodation and a return ticket.", w);
    w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
    var r = visaResult("tourist", libre ? 74 : 30, m, w, libre ? [] : ["passport"]);
    r.officialName = "South Africa visitor entry — up to 90 days";
    r.route = "za_tourist";
    return r;
  };
  /* v1.71.0 — Chile NO tiene visa de nómada dedicada: ruta «honesta» al estilo
     AU/CA/NZ (existe para explicar la realidad, no para aparentar programa). */
  COUNTRY_RULES.CL.digital_nomad = function (p) {
    return visaResult("digital_nomad", p.remoteWork ? 30 : 12,
      p.remoteWork ? ["Your profile indicates remote work, which is the main factor for nomad-style stays."] : [],
      ["Chile does not currently offer a dedicated Digital Nomad visa.",
       "Remote workers commonly stay under the visitor permit (up to 90 days); longer stays require a residence visa.",
       "Simulated guidance only. Always verify with official immigration sources."],
      []);
  };
  /* v1.71.0 — Georgia: el programa «Remotely from Georgia» fue pandémico y
     cerró; lo real es el año sin visado para muchas nacionalidades.
     v1.87.0 — listas del turismo: GE_VISA_FREE = nacionalidades de nuestro
     selector con el AÑO completo sin visado; GE_VISA_FREE_SHORT = sin visado
     pero por menos tiempo. El resto va por e-Visa. */
  var GE_VISA_FREE = ["AD", "AR", "AT", "AU", "BE", "BG", "BR", "CA", "CH", "CL", "CO", "CR", "CY",
    "CZ", "DE", "DK", "DO", "EC", "EE", "ES", "FI", "FR", "GB", "GR", "HN", "HR", "HU", "IE", "IL",
    "IS", "IT", "JP", "KR", "LI", "LT", "LU", "LV", "MT", "MX", "NL", "NO", "NZ", "PA", "PE", "PL",
    "PT", "RO", "RS", "RU", "SE", "SI", "SK", "SV", "TR", "UA", "US", "UY"];
  var GE_VISA_FREE_SHORT = ["PY", "CN", "HK"];

  COUNTRY_RULES.GE = {
    digital_nomad: function (p) {
      return visaResult("digital_nomad", p.remoteWork ? 34 : 14,
        p.remoteWork ? ["Your profile indicates remote work, which is the main factor for nomad-style stays."] : [],
        ["Georgia does not currently offer a dedicated Digital Nomad visa.",
         "Citizens of many countries can stay in Georgia visa-free for a full year, which remote workers commonly use.",
         /* v1.95.0 — CAMBIO REAL de 2026: hasta ahora la idea popular era que en
            Georgia se podía trabajar sin permiso. Desde el 1-mar-2026 hay
            régimen de permiso de trabajo y NO está aclarado si alcanza a quien
            trabaja en remoto para una empresa de fuera. Decirlo es lo honesto. */
         "Careful: since 1 March 2026 Georgia requires a work permit for paid activity carried out in the country, and the rules do not yet make clear whether remote work for an employer abroad falls under it.",
         "Simulated guidance only. Always verify with official immigration sources."],
        []);
    },

    /* v1.108.0 — AUDITADA (R5). Fuentes capturadas el 1-ago-2026: la página de
       información de visados de una embajada georgiana (*.mfa.gov.ge) y los PDF
       oficiales D3 (estudios) y D1 (trabajo) del Ministerio de Exteriores.
       ⚠ geoconsul.gov.ge es cáscara JS en todas sus rutas; los documentos
       exigidos varían algo según la misión donde solicites.
       Snapshot: ge-br-sv-pa-upgrade-2026-08/. */
    work: function (p) {
      var b = trabajoBase(p, 58), m = b.m, w = b.w;
      m.push("Since 1 March 2026 Georgia has a work permit system: you need the right to labour activity plus a D1 visa or a work residence permit.");
      w.push("Your employer applies for you, and must first advertise the job on the government portal for 10 working days.");
      w.push("It covers employees, self-employed people and entrepreneurs earning from activity in Georgia; processing takes up to 30 days.");
      w.push("Holders of permanent residence are exempt, and people already working there before March 2026 have until 1 January 2027 to get the permit.");
      w.push("Working without the permit is now fined, for both the worker and the company.");
      w.push("For the D1 labour visa you need the work agreement and an invitation registered by the inviting company with the Georgian authorities.");
      w.push("You also need travel insurance covering accidents above 30,000 GEL for the whole visit, and the visa fee is around USD 20.");
      w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var r = visaResult("work", Math.min(b.score, b.tope), m, w, []);
      r.officialName = "Georgia work permit (right to labour activity) + D1 visa";
      r.route = "ge_work";
      return r;
    },
    /* v1.87.0 — Fase 3: turismo por visa concreta (nivel MODELADO). La entrada
       sin visado de hasta 1 año (Ordenanza 255/2015) es la vía real para casi
       todo nuestro selector; la e-Visa solo se enseña a quien NO tiene el año
       (patrón GB: tarjeta condicionada, no ruido para quien no la necesita). */
    tourist: function (p) {
      var cards = [], nat = p.nationality;
      var full  = inList(GE_VISA_FREE, nat);
      var short = inList(GE_VISA_FREE_SHORT, nat);

      var fm = [], fw = [];
      if (full) {
        fm.push("Your passport nationality appears on Georgia's visa-free list: you can enter and stay for up to 1 year without a visa.");
      } else if (short) {
        fw.push("Your passport nationality can enter Georgia without a visa, but for a shorter period than the full year — check the official list.");
      } else {
        fw.push("Your passport nationality does not appear on Georgia's visa-free list; the e-Visa is the usual route.");
        fw.push("Holding a valid visa or residence permit from certain countries can also open visa-free entry — check the official conditions.");
      }
      fw.push("The visa-free stay covers visiting; if you want to settle you must apply for a residence permit before it runs out.");
      fw.push("If you do need a visa, the C1 category is the tourist one and a Georgian visa lasts 90 days.");
      fw.push("Applicants must hold travel or health insurance covering accidents above 30,000 GEL for the period of the visit.");
      fw.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var visaFree = visaResult("tourist", full ? 80 : short ? 62 : 22, fm, fw, full || short ? [] : ["passport"]);
      visaFree.officialName = "Georgia visa-free entry — up to 1 year";
      visaFree.route = "ge_tourist_visa_free";
      cards.push(visaFree);

      if (!full) {
        var em = [], ew = [];
        em.push("Georgia's e-Visa is applied for online and covers short visits for nationalities that are not exempt for a full year.");
        ew.push("Depending on your nationality, the e-Visa allows 30 days within a 120-day period or 90 days within a 180-day period.");
        ew.push("It is an ordinary (category C) short-stay visa: you cannot use it to work for a Georgian employer.");
        finReq("You may need to show sufficient funds for your stay and onward travel.", ew);
        ew.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
        var evisa = visaResult("tourist", short ? 58 : 64, em, ew, []);
        evisa.officialName = "Georgia e-Visa (ordinary short-stay visa, category C)";
        evisa.route = "ge_tourist_evisa";
        cards.push(evisa);
      }

      return cards;
    },
  };

  /* v1.93.0 — estudios de Georgia (R5): va AQUÍ, después del objeto literal de
     COUNTRY_RULES.GE, porque asignarlo antes lo borraría al crearse el objeto. */
  COUNTRY_RULES.GE.student = function (p) {
    var b = estudioBase(p, 58), m = b.m, w = b.w;
    m.push("Georgia issues a study visa (D3) and, for longer courses, a temporary residence permit for study.");
    w.push("You must be admitted to an institution authorised to run higher-education programmes in Georgia.");
    w.push("Nationals who can enter Georgia visa-free often enrol first and apply for the study residence permit from inside the country.");
    /* v1.108.0 — hechos oficiales del PDF D3 del Ministerio de Exteriores. */
    w.push("You need an admission letter from the Georgian university and the order of the Minister of Education and Science accepting you.");
    finReq("You must show proof of financial support or a bank statement for the past 3 months.", w);
    w.push("Travel insurance covering accidents above 30,000 GEL for the whole visit is required.");
    var r = visaResult("student", Math.min(b.score, b.tope), m, w, eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
    r.officialName = "Georgia study visa (D3) / study residence permit";
    r.route = "ge_student";
    return r;
  };

  /* =========================================================================
     COLOMBIA — piloto del nivel AUDITADO (v1.73.0)
     Fuentes capturadas 29-jul-2026 (navegador real; ambos dominios en
     MANUAL_DOMAINS del vigilante):
     - cancilleria.gov.co /tipos-de-visa (Nómada Digital · Migrante Mercosur)
     - mercosur.int /estatuto-de-la-ciudadania/circulacion-de-personas
     Evidencia: tools/visa-intelligence/snapshots/co-upgrade-2026-07/
  ========================================================================= */
  COUNTRY_RULES.CO = {
    work: function (p) {
      if (MERCOSUR[p.nationality] && p.nationality !== "CO") {
        var r = visaResult("work", 88,
          ["Colombia's Migrante (M) Mercosur visa applies the regional Residence Agreement and is equivalent to the temporary resident visa under that instrument.",
           "Under the agreement you get temporary residence without needing to prove the activity you will carry out, with the right to work and carry out any lawful activity.",
           "Time as a Migrante (M) holder counts towards Colombia's Resident (R) visa after a minimum stay of 2 years."],
          ["You will need a request letter explaining your activity in Colombia and your means of subsistence, a passport valid for at least six (6) months, and a criminal record certificate covering the last three (3) years.",
           "Approval is always a prerogative of the Colombian State. Simulated guidance only."],
          []);
        r.officialName = "Colombia Migrante (M) — Acuerdo de Residencia Mercosur";
        r.route = "co_work_mercosur";
        return r;
      }
      return genericDe("CO", "work", p);
    },
    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 0;
      function coDn(sc) {
        var r = visaResult("digital_nomad", sc, m, w, x);
        r.officialName = "Colombia Digital Nomad Visa (V — Nómada Digital)";
        r.route = "co_digital_nomad";
        return r;
      }
      if (!p.remoteWork) {
        w.push("Colombia's Digital Nomad (V) visa is for remote work or teleworking from Colombia over digital media, exclusively for foreign companies, or for starting a digital-content or IT venture.");
        return coDn(8);
      }
      m.push("Colombia's Digital Nomad (V) visa is for remote work or teleworking from Colombia over digital media, exclusively for foreign companies, or for starting a digital-content or IT venture.");
      score += 34;
      if (passportTier(p.nationality) <= 2) {
        score += 30;
        m.push("Your passport nationality appears to be on Colombia's short-stay visa exemption list, a requirement for this visa.");
      } else {
        w.push("This visa requires a passport from a country exempt from Colombia's short-stay visa (per the current Resolución); your nationality appears to need one — check the official list.");
        score = 20;
      }
      m.push("Stays are allowed for up to two (2) years.");
      if (p.savings >= 5000) { score += 12; }
      w.push("Bank statements must show minimum income equivalent to three (3) Colombian legal monthly minimum wages (SMLMV) over the last 3 months.");
      w.push("You need a health policy with full coverage in Colombia for the whole planned stay.");
      w.push("You will need a letter from the foreign company (or a contract, or proof of company partnership); entrepreneurs present a motivation letter for their venture.");
      w.push("Approval is always a prerogative of the Colombian State. Simulated guidance only.");
      return coDn(score);
    },
    student: function (p) { return genericDe("CO", "student", p); },
    tourist: function (p) { return genericDe("CO", "tourist", p); },
  };
  COUNTRY_RULES.PE = mercosurRules("PE", ["student", "tourist", "digital_nomad"]); /* v1.71.0: Perú SÍ tiene visa de nómada (D.L. fin 2023, operativa 2024) */

  /* =========================================================================
     PERÚ — turismo, estudios y trabajo AL NIVEL AUDITADO (v1.99.0, R5).
     ⚠ DESBLOQUEO: gob.pe llevaba desde el 29-jul sin responder desde esta red
     (tarea #13, «PE/EC bloqueados»). El 1-ago-2026 responde con normalidad y se
     capturaron las tres fichas de trámite. Snapshot: snapshots/pe-upgrade-2026-08/.
     Las tres son vigilables con descarga normal.
     El trabajo devuelve DOS tarjetas: la del acuerdo Mercosur (mejor vía para
     quien puede usarla) y la de trabajador residente, que es la general.
  ========================================================================= */
  COUNTRY_RULES.PE.tourist = function (p) {
    var m = [], w = [], x = [], score = 0, pt = passportTier(p.nationality);
    if (pt <= 2) { score += 18; m.push("Many Latin American and European nationalities do not need this visa at all — check whether yours is one of them."); }
    else         { score += 10; w.push("Additional documentation requirements may apply for your passport nationality."); }
    m.push("If you do need it, the tourist visa is applied for at a Peruvian consular office in the country where you are.");
    w.push("You must start the procedure 15 calendar days before you travel.");
    w.push("The maximum stay on this visa is up to 183 calendar days with no extension, whether in one visit or several consecutive visits within 12 months.");
    w.push("Submitting the application and the documents does not guarantee the visa: each request is assessed individually by the consul.");
    finReq("The consulate may ask for additional requirements during the process.", w);
    var r = visaResult("tourist", clamp(score + 30, 0, 62), m, w, x);
    r.officialName = "Peru tourist visa (visa de turismo)";
    r.route = "pe_tourist";
    return r;
  };

  COUNTRY_RULES.PE.student = function (p) {
    var b = estudioBase(p, 60), m = b.m, w = b.w;
    m.push("Peru's student migratory status (formación) covers studies at institutions recognised by the Peruvian State.");
    w.push("You need an enrolment certificate from the institution showing that the studies last one year or more.");
    w.push("You must prove you have no judicial, criminal or police record in your country or in any country where you lived over the previous five years.");
    w.push("You need a sworn declaration of financial means covering the whole length of the stay; for minors it is signed by a parent or guardian.");
    w.push("Documents issued abroad must be legalised by the Peruvian consulate or carry an apostille, and be translated into Spanish by a registered translator.");
    w.push("The application fee is S/ 58.80, paid through Pagalo.pe or at a Banco de la Nación branch.");
    var r = visaResult("student", Math.min(b.score, b.tope), m, w,
      eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
    r.officialName = "Peru student migratory status (calidad migratoria de formación, residente)";
    r.route = "pe_student";
    return r;
  };

  COUNTRY_RULES.PE.work = function (p) {
    var cards = [];
    /* La tarjeta Mercosur SOLO para quien de verdad puede usar el acuerdo: filtrar
       por puntuación colaba la tarjeta genérica de trabajo (72) a los europeos. */
    if (MERCOSUR[p.nationality] && p.nationality !== "PE") cards.push(mercosurWork("PE", p));

    var b = trabajoBase(p, 58), m = b.m, w = b.w;
    m.push("Peru's resident worker status is the general route: it needs a job contract already approved by the labour authority.");
    w.push("The contract must be no more than 30 calendar days old when you apply and must run for one year or more.");
    w.push("The hiring company must appear as active and traceable with the tax authority (Sunat), and its legal representative signs a sworn declaration for you.");
    w.push("You must prove you have no judicial, criminal or police record in your country or in any country where you lived over the previous five years.");
    w.push("You will get an answer within a maximum of 30 calendar days.");
    var r = visaResult("work", Math.min(b.score, b.tope), m, w, []);
    r.officialName = "Peru resident worker status (calidad migratoria de trabajador residente)";
    r.route = "pe_work";
    cards.push(r);
    return cards;
  };
  COUNTRY_RULES.EC = mercosurRules("EC", ["digital_nomad", "student", "tourist"]);

  /* =========================================================================
     ECUADOR — turismo y trabajo AUDITADOS (v1.106.0, R5).
     ⚠ gob.ec sigue SIN RESPONDER desde esta red (comprobado el 1-ago-2026,
     código 000, igual que el 29-jul). La vía viable es cancilleria.gob.ec, que
     sí responde: los requisitos OBLIGATORIOS nacionales están publicados en las
     subrutas consulares. Se capturó la de Caracas.
     Snapshot: ec-py-ve-upgrade-2026-08/.
  ========================================================================= */
  COUNTRY_RULES.EC.tourist = function (p) {
    var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
    if (pt <= 2) { score += 20; m.push("Your passport nationality is generally accepted for visits to this destination."); }
    else         { score += 10; w.push("Additional documentation requirements may apply for your passport nationality."); }
    m.push("Ecuador's tourist visa is authorised for 90 days.");
    w.push("Your passport must be valid for at least six months.");
    w.push("You need a certificate of no criminal record from your country and from any country where you lived in the last five years; it is valid for 180 days and must be apostilled or legalised.");
    finReq("You must show a bank balance of at least USD 1,380 — one Ecuadorian basic salary for each month of the 90-day stay — even if you plan to stay less.", w);
    w.push("This is simulated guidance only. Always verify with the Ecuadorian Ministry of Foreign Affairs.");
    var r = visaResult("tourist", clamp(score + 30, 0, 62), m, w, x);
    r.officialName = "Ecuador tourist visa";
    r.route = "ec_tourist";
    return r;
  };

  COUNTRY_RULES.EC.work = function (p) {
    var cards = [];
    if (MERCOSUR[p.nationality] && p.nationality !== "EC") cards.push(mercosurWork("EC", p));
    var b = trabajoBase(p, 56), m = b.m, w = b.w;
    m.push("Ecuador's temporary resident visa for work is the general route for taking a job there.");
    w.push("Your passport must be valid for at least six months.");
    w.push("You need a certificate of no criminal record from your country and from any country where you lived in the last five years, apostilled or legalised, and translated by an authorised professional if it is not in Spanish.");
    finReq("You must prove lawful means of living that allow you to support your stay.", w);
    w.push("This is simulated guidance only. Always verify with the Ecuadorian Ministry of Foreign Affairs.");
    var r = visaResult("work", Math.min(b.score, b.tope), m, w, []);
    r.officialName = "Ecuador temporary resident visa for work";
    r.route = "ec_work";
    cards.push(r);
    return cards;
  };
  /* =========================================================================
     URUGUAY — nivel AUDITADO (v1.74.0)
     Fuente capturada 29-jul-2026: gub.uy/tramites/residencia-legal-permanente-
     mercosur (Ministerio del Interior · DNM; responde a curl con UA por
     defecto — el vigilante puede leerla sin trato especial). Snapshot:
     tools/visa-intelligence/snapshots/uy-pe-ec-upgrade-2026-07/.
     DOS datos diferenciales del texto oficial: la residencia Mercosur de
     Uruguay es PERMANENTE DIRECTA, y su lista oficial INCLUYE a Venezuela
     (y Surinam y Guyana). PE/EC: fuentes nacionales inaccesibles desde esta
     red (gob.pe y gob.ec sin respuesta por 3 vías) — ascenso pospuesto.
  ========================================================================= */
  var UY_MERCOSUR = { AR:1, BR:1, CL:1, BO:1, PY:1, PE:1, EC:1, CO:1, VE:1 };
  COUNTRY_RULES.UY = {
    work: function (p) {
      if (UY_MERCOSUR[p.nationality] && p.nationality !== "UY") {
        var r = visaResult("work", 90,
          ["Uruguay's Permanente Mercosur grants DIRECT permanent legal residence to nationals of Mercosur member and associated states.",
           "Uruguay's official list covers Argentina, Brazil, Chile, Bolivia, Paraguay, Peru, Ecuador, Colombia and Venezuela (plus Suriname and Guyana).",
           "With the residence you can work and carry out any lawful activity.",
           "A Temporaria Mercosur also exists for stays of up to 2 years, extendable for the same period."],
          ["You will need an ID document, a criminal record certificate from the country where you lived the last 5 years, and a vaccination certificate meeting Uruguay's official schedule.",
           "Approval is always a prerogative of the Uruguayan State. Simulated guidance only."],
          []);
        r.officialName = "Uruguay Residencia Legal — Permanente Mercosur";
        r.route = "uy_work_mercosur";
        return r;
      }
      return genericDe("UY", "work", p);
    },
    digital_nomad: function (p) { return genericDe("UY", "digital_nomad", p); },
    student: function (p) { return genericDe("UY", "student", p); },
    tourist: function (p) { return genericDe("UY", "tourist", p); },
  };
  COUNTRY_RULES.PY = mercosurRules("PY", ["student", "tourist"]);
  COUNTRY_RULES.BO = mercosurRules("BO", ["student", "tourist"]);

  /* v1.94.0 — tanda «Remoto» (R5): estos dos van AQUÍ, después de sus reglas
     Mercosur, no arriba con los demás (los métodos sueltos siempre después del
     objeto que los recibe). Comprobado: ninguno de los dos tiene visa de nómada
     — las listas que dicen lo contrario confunden Paraguay con otros programas. */
  /* =========================================================================
     PARAGUAY — turismo AUDITADO (v1.106.0, R5). Fuente: mre.gov.py (Cancillería).
     ⚠ Estudios y trabajo NO se pueden auditar: dependen de migraciones.gov.py,
     cuya delegación DNS está ROTA A NIVEL MUNDIAL (comprobado con DNS público:
     «No Reachable Authority at delegation»). No es cosa de nuestra red.
     Reintentar en semanas. Snapshot: ec-py-ve-upgrade-2026-08/.
  ========================================================================= */
  COUNTRY_RULES.PY.tourist = function (p) {
    var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
    if (pt <= 2) { score += 20; m.push("Your passport nationality is generally accepted for visits to this destination."); }
    else         { score += 10; w.push("Additional documentation requirements may apply for your passport nationality."); }
    m.push("Paraguay's tourist visa is applied for online through its foreign ministry.");
    w.push("It is advisable to apply at least 30 days before your planned travel date.");
    w.push("You need an invitation letter from a person or company based in Paraguay, a hotel or accommodation booking and a possible flight or land itinerary.");
    w.push("You need a criminal record certificate from your country of residence, duly legalised or apostilled.");
    w.push("Under-18s cannot apply for the visa on their own.");
    finReq("You must prove economic solvency with an employment certificate, a bank certificate or another suitable means.", w);
    w.push("This is simulated guidance only. Always verify with the Paraguayan Ministry of Foreign Affairs.");
    var r = visaResult("tourist", clamp(score + 30, 0, 62), m, w, x);
    r.officialName = "Paraguay tourist visa";
    r.route = "py_tourist";
    return r;
  };

  COUNTRY_RULES.PY.digital_nomad = honestDN([
    "Paraguay does not offer a dedicated Digital Nomad visa.",
    "What remote workers actually use is its residence route: the 2022 migration law grants a two-year temporary residence that allows living and working there."],
    { nombre: "Paraguay", iso: "PY" });

  /* =========================================================================
     BOLIVIA — turismo, estudios y trabajo AL NIVEL AUDITADO (v1.100.0, R5).
     Fuente capturada el 1-ago-2026: la red consular de la Cancillería publica
     las tres en UNA sola página, con texto limpio y descarga normal.
     Snapshot: snapshots/bo-upgrade-2026-08/.
     El trabajo va por la «Visa de Objeto Determinado», que no es solo laboral:
     cubre trabajo, voluntariado, intercambio académico, salud y familia.
  ========================================================================= */
  COUNTRY_RULES.BO.tourist = function (p) {
    var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
    if (pt <= 2) { score += 20; m.push("Bolivia sorts nationalities into three groups: Group I does not need a tourist visa at all, Group II does, and Group III needs one with prior clearance from the migration authority."); }
    else         { score += 10; w.push("Bolivia sorts nationalities into three groups: Group I does not need a tourist visa at all, Group II does, and Group III needs one with prior clearance from the migration authority."); }
    w.push("Your passport must be valid for at least six months.");
    w.push("You need a travel itinerary or return ticket, and either a hosting reservation or an invitation letter from someone living in Bolivia registered with the migration authority.");
    w.push("A yellow fever vaccination certificate is required if you will visit high-risk endemic areas.");
    finReq("You must show economic solvency for your stay.", w);
    w.push("This is simulated guidance only. Always verify with the Bolivian consular network.");
    var r = visaResult("tourist", clamp(score + 30, 0, 62), m, w, x);
    r.officialName = "Bolivia tourist visa (visa de ingreso por turismo)";
    r.route = "bo_tourist";
    return r;
  };

  COUNTRY_RULES.BO.student = function (p) {
    var b = estudioBase(p, 58), m = b.m, w = b.w;
    m.push("Bolivia's student visa covers primary and secondary schooling as well as higher and professional education.");
    w.push("The visa itself lasts up to 60 days: with it you then apply to the migration authority for a one-year temporary stay, renewable until you finish your studies.");
    w.push("You must produce study documents — certificate, degree or academic record — legalised beforehand by the Bolivian consular office.");
    w.push("A police, criminal or judicial record certificate from your country or country of residence is required from age 16.");
    finReq("You must show economic solvency through bank statements or a credit card.", w);
    var r = visaResult("student", Math.min(b.score, b.tope), m, w,
      eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
    r.officialName = "Bolivia student visa (visa de estudiante)";
    r.route = "bo_student";
    return r;
  };

  COUNTRY_RULES.BO.work = function (p) {
    var cards = [];
    if (MERCOSUR[p.nationality] && p.nationality !== "BO") cards.push(mercosurWork("BO", p));
    var b = trabajoBase(p, 56), m = b.m, w = b.w;
    m.push("Bolivia's specific-purpose visa (Objeto Determinado) is the entry permit for work, temporary work, volunteering, academic exchange, health or family reasons — anything other than tourism.");
    w.push("You need an invitation letter from the company or organisation, with supporting documents, except for temporary work, health and family cases.");
    w.push("A police, criminal or judicial record certificate from your country or country of residence is required from age 16.");
    finReq("You must show economic solvency through bank statements or a credit card.", w);
    var r = visaResult("work", Math.min(b.score, b.tope), m, w, []);
    r.officialName = "Bolivia specific-purpose visa (visa de objeto determinado)";
    r.route = "bo_work";
    cards.push(r);
    return cards;
  };

  COUNTRY_RULES.BO.digital_nomad = honestDN([
    "Bolivia does not offer a dedicated Digital Nomad visa.",
    "Remote workers commonly use the tourist entry, limited to 90 days per year; longer stays need a specific-purpose visa."],
    { nombre: "Bolivia", iso: "BO" });

  /* v1.72.0 — Vietnam y Sri Lanka: destinos nómada MUY populares pero SIN visa
     dedicada → ruta honesta (estilo AU/CA/NZ/CL/GE); el resto de sus tipos,
     genérico desde mock.js (recordar: COUNTRY_RULES manda sobre esa lista). */
  function honestDN(frases, pais) {
    return function (p) {
      var r = visaResult("digital_nomad", p.remoteWork ? 32 : 12,
        p.remoteWork ? ["Your profile indicates remote work, which is the main factor for nomad-style stays."] : [],
        frases.concat(["Simulated guidance only. Always verify with official immigration sources."]),
        []);
      if (pais) {                       // v1.94.0: nombre y ruta propios
        r.officialName = pais.nombre + ": no digital nomad visa";
        r.route = pais.iso.toLowerCase() + "_digital_nomad";
      }
      return r;
    };
  }

  /* =========================================================================
     v1.94.0 — TANDA «REMOTO» (R5, 3ª parte). Trece destinos no enseñaban NADA a
     quien elegía «Trabajo remoto». ANTES de escribir «aquí no existe» se
     comprobó país por país — y menos mal: El Salvador y Belice SÍ tienen
     programa real, así que llevan tarjeta de verdad, no la honesta. Paraguay y
     República Dominicana NO tienen (las listas de internet los confunden con
     *Dominica*, que es otro país).
     Venezuela, Nicaragua y Cuba se quedan fuera A PROPÓSITO: son recortes
     deliberados del usuario y no se «arreglan» sin preguntar.

     reglasModeladas() encapsula la trampa que ya nos mordió con Sudáfrica y
     Costa Rica: cuando un país estrena COUNTRY_RULES, esa lista MANDA sobre
     mock.js — si no se declaran todos sus tipos, desaparecen en silencio.
  ========================================================================= */
  function reglasModeladas(iso, extra) {
    var c = (D.COUNTRIES || []).find(function (x) { return x.iso === iso; });
    var reglas = {};
    ((c && c.visas) || []).forEach(function (v) {
      if (!reglas[v.type]) {
        reglas[v.type] = (function (t) {
          return function (p) { return genericDe(iso, t, p); };
        })(v.type);
      }
    });
    Object.keys(extra || {}).forEach(function (k) { reglas[k] = extra[k]; });
    return reglas;
  }

  /* =========================================================================
     VENEZUELA — turismo AUDITADO (v1.106.0, R5). Fuente: mppre.gob.ve, el
     catálogo de visados del Ministerio del Poder Popular para Relaciones
     Exteriores. Snapshot: ec-py-ve-upgrade-2026-08/.
     ⚠ VE sigue SOLO CON TURISMO: es un recorte deliberado del usuario y no se
     amplía sin preguntar, aunque la fuente también publique estudios y trabajo.
  ========================================================================= */
  COUNTRY_RULES.VE = reglasModeladas("VE", {
    tourist: function (p) {
      var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
      if (pt <= 2) { score += 20; m.push("Your passport nationality is generally accepted for visits to this destination."); }
      else         { score += 10; w.push("Additional documentation requirements may apply for your passport nationality."); }
      m.push("Venezuela's tourist visa is granted to foreigners entering for leisure, health or activities that do not involve pay or profit.");
      w.push("You need the original passport and a copy, valid for at least six months.");
      finReq("You must provide a bank letter stating when the account was opened, its number and its balance.", w);
      w.push("This is simulated guidance only. Always verify with the Venezuelan Ministry of Foreign Affairs.");
      var r = visaResult("tourist", clamp(score + 30, 0, 62), m, w, x);
      r.officialName = "Venezuela tourist visa (visado de turista)";
      r.route = "ve_tourist";
      return r;
    },
  });

  /* --- Sin programa: tarjeta honesta (explica la realidad, no la disfraza) -- */
  /* =========================================================================
     PANAMÁ — turismo ASCENDIDO A NIVEL AUDITADO (v1.98.0, R5).
     Fuente capturada el 1-ago-2026: migracion.gob.pa/turistas/ cita LITERALMENTE
     el artículo 43 de la ley migratoria con los requisitos de entrada, y
     responde a una descarga normal (vigilable sin trato especial).
     Snapshot: snapshots/pa-upgrade-2026-08/.
     ⚠ PA no tenía reglas propias: se declaran TODOS sus tipos (trampa conocida).
     Los requisitos de estudios y trabajo viven en PDFs enlazados desde
     /permisos-migratorios/ — candidatos a una tanda posterior.
  ========================================================================= */
  COUNTRY_RULES.PA = reglasModeladas("PA", {
    /* v1.108.0 — estudios y trabajador remoto AUDITADOS con los PDF oficiales
       enlazados desde /permisos-migratorios/. Snapshot: ge-br-sv-pa-…-2026-08/. */
    student: function (p) {
      var b = estudioBase(p, 58), m = b.m, w = b.w;
      m.push("Panama's temporary permit for education covers full-time regular studies at public or private centres recognised by the Ministry of Education.");
      w.push("You must enrol in all the subjects of the study plan for the term, in daytime hours, unless the plan itself requires evening classes.");
      w.push("This permit is exclusively for studying: while it is valid you are banned from working, except for the placements and internships your centre requires.");
      finReq("A certified cheque for B/.250.00 payable to the National Treasury is required.", w);
      w.push("This is simulated guidance only. Always verify with the Servicio Nacional de Migración.");
      var r = visaResult("student", Math.min(b.score, b.tope), m, w,
        eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
      r.officialName = "Panama temporary permit for education";
      r.route = "pa_student";
      return r;
    },
    digital_nomad: function (p) {
      var m = [], w = [], score = 0;
      if (p.remoteWork) { score += 40; m.push("Your profile indicates remote work, which is the main condition for this route."); }
      else w.push("This route is for people employed by a transnational company abroad or self-employed, working in teleworking mode.");
      m.push("Panama has a short-stay visa for remote workers: your work must produce its effects outside Panama.");
      w.push("You must receive income from a foreign source of at least B/.36,000 a year, or the equivalent in another currency.");
      w.push("The visa lasts nine months, renewable once for the same period, and the card costs B/.50.");
      m.push("Once granted, it lets you work remotely from Panama with no extra permit from any other state body.");
      w.push("This is simulated guidance only. Always verify with the Servicio Nacional de Migración.");
      var r = visaResult("digital_nomad", clamp(score + 12, 0, 62), m, w, []);
      r.officialName = "Panama short-stay visa for remote workers";
      r.route = "pa_digital_nomad";
      return r;
    },
    tourist: function (p) {
      var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
      if (pt <= 2) { score += 20; m.push("Your passport nationality is generally accepted for visits to this destination."); }
      else         { score += 10; w.push("Additional documentation requirements may apply for your passport nationality."); }
      m.push("Panama's migration law sets the entry requirements: you must enter through an officially enabled land, air or sea migration post.");
      w.push("You must show your valid passport or travel document and, where required, a valid entry visa.");
      w.push("You must agree to be interviewed by the authorities, to have your biometric data validated on the spot and your luggage and personal documents inspected.");
      w.push("You must hand in the entry and exit card (Tarjeta de Ingreso y Egreso) that the international carrier gives you, filled in.");
      w.push("You must comply with the health rules set by the Ministry of Health.");
      finReq("Border officers can ask for proof of funds and onward travel.", w);
      w.push("This is simulated guidance only. Always verify with the Servicio Nacional de Migración.");
      var r = visaResult("tourist", clamp(score + 32, 0, 64), m, w, x);
      r.officialName = "Panama visitor entry (Ley de Migración, artículo 43)";
      r.route = "pa_tourist";
      return r;
    },
  });

  /* =========================================================================
     REPÚBLICA DOMINICANA — turismo, estudios y trabajo AUDITADOS (v1.101.0).
     Fuente capturada el 1-ago-2026: el portal de servicios consulares del
     Ministerio de Relaciones Exteriores (MIREX) publica los requisitos de las
     13 visas en una sola página. Snapshot: do-upgrade-2026-08/.
     ⚠ La Dirección General de Migración (migracion.gob.do) devuelve 403 con
     cualquier agente: MIREX es la vía capturable.
     El trabajo va por la visa de negocios con fines laborales (NM1), que es la
     que la propia fuente describe para permanecer un año trabajando.
  ========================================================================= */
  var DO_AUDITADO = {
    tourist: function (p) {
      var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
      if (pt <= 2) { score += 20; m.push("Your passport nationality is generally accepted for visits to this destination."); }
      else         { score += 10; w.push("Additional documentation requirements may apply for your passport nationality."); }
      m.push("The Dominican tourist visa comes in a simple version (60 days, one entry) and a multiple version (60 days, two entries).");
      w.push("Your original passport must be valid for at least six months.");
      finReq("You must show economic solvency: an employment certificate and a bank certification with the last three months of movements.", w);
      w.push("This is simulated guidance only. Always verify with the Dominican Ministry of Foreign Affairs.");
      var r = visaResult("tourist", clamp(score + 30, 0, 62), m, w, x);
      r.officialName = "Dominican Republic tourist visa (TS / TM)";
      r.route = "do_tourist";
      return r;
    },
    student: function (p) {
      var b = estudioBase(p, 58), m = b.m, w = b.w;
      m.push("The Dominican student visa is issued for one year with several entries.");
      w.push("You need an acceptance certificate from the university or institution in the Dominican Republic.");
      w.push("You must show who will pay for your studies.");
      w.push("This is simulated guidance only. Always verify with the Dominican Ministry of Foreign Affairs.");
      var r = visaResult("student", Math.min(b.score, b.tope), m, w,
        eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
      r.officialName = "Dominican Republic student visa (E)";
      r.route = "do_student";
      return r;
    },
    work: function (p) {
      var b = trabajoBase(p, 56), m = b.m, w = b.w;
      m.push("The Dominican route for working is the business visa for employment purposes: it is granted to people who, because of their occupation, stay a year in the country without having to leave.");
      w.push("It is issued for one year with several entries.");
      w.push("You need a criminal record certificate issued by a federal authority of every country where you lived in the last 5 years, legalised or apostilled.");
      w.push("This is simulated guidance only. Always verify with the Dominican Ministry of Foreign Affairs.");
      var r = visaResult("work", Math.min(b.score, b.tope), m, w, []);
      r.officialName = "Dominican Republic business visa for employment (NM1)";
      r.route = "do_work";
      return r;
    },
  };

  COUNTRY_RULES.DO = reglasModeladas("DO", {
    tourist: DO_AUDITADO.tourist, student: DO_AUDITADO.student, work: DO_AUDITADO.work,
    digital_nomad: honestDN([
    "The Dominican Republic does not offer a dedicated Digital Nomad visa.",
    "Remote workers commonly use the tourist entry, which does not allow taking a job in the country.",
    "Careful with the lists that say otherwise: the country with a nomad visa is Dominica, a different Caribbean state."],
    { nombre: "The Dominican Republic", iso: "DO" }) });

  /* =========================================================================
     NICARAGUA y CUBA — turismo AUDITADO (v1.109.0). Fuentes capturadas el
     1-ago-2026 con el navegador real del usuario: migob.gob.ni está tras un WAF
     con reto JavaScript y el portal eVisa cubano es una aplicación JS; ninguna
     respondía a una descarga simple. Snapshots: gt-ni-chrome-2026-08/ y
     cu-chrome-2026-08/.
     ⚠ Ambos países siguen SIN trabajo por recorte deliberado del usuario.
     ⚠ De Cuba se confirmó algo útil: su portal eVisa existe y funciona, pero
     solo tiene el formulario y un manual de uso — los requisitos están en el
     Ministerio de Relaciones Exteriores.
  ========================================================================= */
  COUNTRY_RULES.NI = reglasModeladas("NI", {
    tourist: function (p) {
      var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
      if (pt <= 2) { score += 20; m.push("Nicaragua sorts nationalities into two categories: category A needs no entry visa with any kind of passport; category C needs a consulted visa."); }
      else         { score += 10; w.push("Nicaragua sorts nationalities into two categories: category A needs no entry visa with any kind of passport; category C needs a consulted visa."); }
      w.push("The consulted visa is requested through a Nicaraguan diplomatic or consular mission abroad.");
      w.push("You need a passport valid for at least 6 months, a letter of application, a criminal or police record certificate from your country of origin or residence, and a notarised maintenance commitment.");
      w.push("You must show a return ticket to your country of origin or departure.");
      w.push("Once the visa is notified to the consulate you have 6 months to use it, or it lapses.");
      w.push("This is simulated guidance only. Always verify with Nicaragua's Dirección General de Migración y Extranjería.");
      var r = visaResult("tourist", clamp(score + 30, 0, 62), m, w, x);
      r.officialName = "Nicaragua entry visa (categoría A / visa consultada C)";
      r.route = "ni_tourist";
      return r;
    },
  });

  COUNTRY_RULES.CU = reglasModeladas("CU", {
    tourist: function (p) {
      var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
      if (pt <= 2) { score += 20; m.push("Your passport nationality is generally accepted for visits to this destination."); }
      else         { score += 10; w.push("Additional documentation requirements may apply for your passport nationality."); }
      m.push("Cuba issues tourist visas or tourist cards only to foreigners travelling for pleasure, tourism or recreation, by air or sea.");
      w.push("The card is valid for a single entry and a 90-day stay, extendable once for the same period.");
      w.push("To extend it you ask at your hotel desk or directly at the immigration authorities.");
      w.push("Foreign minors need their own individual tourist card, even if they appear in their parents' passports.");
      w.push("Cuba runs an official e-visa portal, but it only holds the application form: the requirements are published by the foreign ministry.");
      w.push("This is simulated guidance only. Always verify with Cuba's Ministry of Foreign Affairs.");
      var r = visaResult("tourist", clamp(score + 30, 0, 62), m, w, x);
      r.officialName = "Cuba tourist card (tarjeta turística)";
      r.route = "cu_tourist";
      return r;
    },
  });

  /* v1.109.0 — GUATEMALA: turismo AUDITADO. Fuente capturada el 1-ago-2026 con
     el navegador real del usuario: todo .gob.gt devuelve 403 a curl (también con
     UA de navegador) pero el sitio está vivo. Snapshot: gt-ni-chrome-2026-08/. */
  COUNTRY_RULES.GT = reglasModeladas("GT", {
    tourist: function (p) {
      var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
      if (pt <= 2) { score += 20; m.push("Guatemala exempts the nationalities in its category A from needing a visa to enter."); }
      else         { score += 10; w.push("Guatemala exempts the nationalities in its category A from needing a visa to enter."); }
      w.push("Your passport must be valid and in good condition; the officer checks that it is authentic and current.");
      w.push("You must go through an interview and answer truthfully about the purpose of your trip.");
      finReq("You must show economic solvency with cards or cash covering your stay, and it has to match what you declare.", w);
      w.push("You need a hotel booking or proof of where you will stay, and a return ticket or other transport that guarantees you leave.");
      w.push("Granting a visa does not mean unconditional admission: the border officer decides.");
      w.push("This is simulated guidance only. Always verify with the Instituto Guatemalteco de Migración.");
      var r = visaResult("tourist", clamp(score + 30, 0, 62), m, w, x);
      r.officialName = "Guatemala visitor entry (Acuerdo 08-2023)";
      r.route = "gt_tourist";
      return r;
    },
    digital_nomad: honestDN([
    "Guatemala does not offer a dedicated Digital Nomad visa.",
    "Remote workers commonly use the tourist entry, which covers up to 90 days shared across the CA-4 countries (Guatemala, El Salvador, Honduras and Nicaragua)."],
    { nombre: "Guatemala", iso: "GT" }) });

  COUNTRY_RULES.HN = reglasModeladas("HN", { digital_nomad: honestDN([
    "Honduras does not offer a dedicated Digital Nomad visa.",
    "Remote workers commonly use the tourist entry, which covers up to 90 days shared across the CA-4 countries; longer stays need a residence permit."],
    { nombre: "Honduras", iso: "HN" }) });

  /* =========================================================================
     INDIA y CATAR — AUDITADOS (v1.107.0, R5).
     India: portal oficial de e-visa (indianvisaonline.gov.in) para turismo y el
     PDF vigente del Ministerio del Interior (AnnexIII) para estudios y trabajo.
     ⚠ Ese PDF lleva fecha 01/02/2018: es el que el MHA publica como vigente,
     pero la antigüedad queda anotada en la evidencia.
     Catar: portal del Ministerio del Interior. Solo turismo — sus páginas de
     estudios y trabajo están bloqueadas (403 y cáscara JS) y sin fuente no hay
     ascenso. Snapshot: in-qa-upgrade-2026-08/.
  ========================================================================= */
  var IN_AUDITADO = {
    tourist: function (p) {
      var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
      if (pt <= 2) { score += 20; m.push("Your passport nationality is generally accepted for visits to this destination."); }
      else         { score += 10; w.push("Additional documentation requirements may apply for your passport nationality."); }
      m.push("India's e-Tourist Visa comes in three lengths: 30 days, one year and five years, all with multiple entries.");
      w.push("The 30-day version is non-extendable and non-convertible.");
      w.push("On the one-year and five-year visas your total stay in India during one calendar year cannot exceed 180 days.");
      w.push("Beware of scams: the Government of India charges no emergency or express fee for any e-visa.");
      w.push("This is simulated guidance only. Always verify with the Indian Bureau of Immigration.");
      var r = visaResult("tourist", clamp(score + 30, 0, 62), m, w, x);
      r.officialName = "India e-Tourist Visa";
      r.route = "in_tourist";
      return r;
    },
    student: function (p) {
      var b = estudioBase(p, 58), m = b.m, w = b.w;
      m.push("India's student visa is for people whose sole objective is to follow on-campus, full-time structured courses at recognised institutions.");
      w.push("For a medical or para-medical course you must produce a letter of approval or No Objection Certificate from the Ministry of Health.");
      w.push("You must show evidence of transferring enough funds for at least four months of sustenance in India, or travellers cheques for a similar amount.");
      w.push("This is simulated guidance only. Always verify with the Indian Bureau of Immigration.");
      var r = visaResult("student", Math.min(b.score, b.tope), m, w,
        eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
      r.officialName = "India Student Visa";
      r.route = "in_student";
      return r;
    },
    work: function (p) {
      var b = trabajoBase(p, 56), m = b.m, w = b.w;
      m.push("India's employment visa is granted to highly skilled or qualified professionals.");
      w.push("It is not granted for jobs where qualified Indians are available, nor for routine, ordinary or clerical work.");
      w.push("The person being sponsored must draw a gross salary above Rs. 16.25 lakhs per year, with some listed exceptions.");
      w.push("This is simulated guidance only. Always verify with the Indian Bureau of Immigration.");
      var r = visaResult("work", Math.min(b.score, b.tope), m, w, []);
      r.officialName = "India Employment Visa";
      r.route = "in_work";
      return r;
    },
  };

  var QA_AUDITADO_TURISMO = function (p) {
    var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
    if (pt <= 2) { score += 20; m.push("Your passport nationality is generally accepted for visits to this destination."); }
    else         { score += 10; w.push("Additional documentation requirements may apply for your passport nationality."); }
    m.push("Citizens of more than 95 countries can enter Qatar with a visa on arrival at its entry points, for varying lengths of stay.");
    w.push("You need a passport valid for at least three months and a confirmed onward or return ticket.");
    w.push("Health insurance is compulsory: the policy must come from an insurer registered with Qatar's Ministry of Public Health.");
    w.push("This is simulated guidance only. Always verify with the Qatari Ministry of Interior.");
    var r = visaResult("tourist", clamp(score + 32, 0, 64), m, w, x);
    r.officialName = "Qatar visa on arrival";
    r.route = "qa_tourist";
    return r;
  };

  COUNTRY_RULES.QA = reglasModeladas("QA", { tourist: QA_AUDITADO_TURISMO, digital_nomad: honestDN([
    "Qatar does not offer a dedicated Digital Nomad visa.",
    "Residence in Qatar is normally tied to a local employer who sponsors you."],
    { nombre: "Qatar", iso: "QA" }) });

  COUNTRY_RULES.IN = reglasModeladas("IN", {
    tourist: IN_AUDITADO.tourist, student: IN_AUDITADO.student, work: IN_AUDITADO.work,
    digital_nomad: honestDN([
    "India does not offer a dedicated Digital Nomad visa.",
    "Remote workers commonly use the e-tourist visa, which does not allow working for an Indian company."],
    { nombre: "India", iso: "IN" }) });

  /* =========================================================================
     FIYI — turismo, estudios y trabajo AUDITADOS (v1.103.0, R5).
     Fuente capturada el 1-ago-2026: immigration.gov.fj, una página por trámite.
     Snapshot: lk-fj-upgrade-2026-08/.
     ⚠ Al verificar salió un dato FALSO que traía la investigación previa (un
     supuesto aval por estudios de más de 12 meses): no existe en la fuente y se
     descartó. Cada extracto de aquí está comprobado literal contra la captura.
  ========================================================================= */
  var FJ_AUDITADO = {
    tourist: function (p) {
      var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
      if (pt <= 2) { score += 20; m.push("Your passport nationality is generally accepted for visits to this destination."); }
      else         { score += 10; w.push("Additional documentation requirements may apply for your passport nationality."); }
      m.push("Fiji's single-journey visa is valid for 3 months and can only be used for one trip.");
      w.push("There is also a multiple-entry visa valid for 12 months from issue, with each stay limited to 4 months.");
      w.push("Processing takes 14 working days from the day the visa officer receives your application.");
      finReq("Fees depend on the type: single entry costs $93 and multiple entry $185.", w);
      w.push("This is simulated guidance only. Always verify with the Fiji Immigration Department.");
      var r = visaResult("tourist", clamp(score + 30, 0, 62), m, w, x);
      r.officialName = "Fiji visitor visa";
      r.route = "fj_tourist";
      return r;
    },
    student: function (p) {
      var b = estudioBase(p, 58), m = b.m, w = b.w;
      m.push("Fiji issues a student permit for the current academic year.");
      w.push("You need an acceptance letter from the school or institution for the current academic year.");
      w.push("A local police report is required for people over 18 who have already studied 12 months or more in Fiji.");
      w.push("The student permit application costs $321 and takes about 21 working days.");
      w.push("This is simulated guidance only. Always verify with the Fiji Immigration Department.");
      var r = visaResult("student", Math.min(b.score, b.tope), m, w,
        eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
      r.officialName = "Fiji student permit";
      r.route = "fj_student";
      return r;
    },
    work: function (p) {
      var b = trabajoBase(p, 56), m = b.m, w = b.w;
      m.push("Fiji issues long-term work permits of three years, and short-term permits of one year or less for temporary engagements.");
      w.push("You cannot switch from a visitor permit: no work permit application is accepted from visitor permit holders inside the country.");
      w.push("This is simulated guidance only. Always verify with the Fiji Immigration Department.");
      var r = visaResult("work", Math.min(b.score, b.tope), m, w, []);
      r.officialName = "Fiji work permit";
      r.route = "fj_work";
      return r;
    },
  };

  COUNTRY_RULES.FJ = reglasModeladas("FJ", {
    tourist: FJ_AUDITADO.tourist, student: FJ_AUDITADO.student, work: FJ_AUDITADO.work,
    digital_nomad: honestDN([
    "Fiji does not offer a dedicated Digital Nomad visa.",
    "Remote workers commonly use the visitor permit, which can usually be extended up to six months in total."],
    { nombre: "Fiji", iso: "FJ" }) });

  /* --- CON programa real: tarjeta de verdad ------------------------------- */
  /* v1.108.0 — EL SALVADOR: turismo AUDITADO con el formulario oficial de visa
     consultada (PDF de migracion.gob.sv). Su residencia de estudios y trabajo
     vive en PDFs alojados en Google Drive, fuera de dominio gubernamental: no
     se auditan por eso. Snapshot: ge-br-sv-pa-upgrade-2026-08/. */
  COUNTRY_RULES.SV = reglasModeladas("SV", {
    tourist: function (p) {
      var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
      if (pt <= 2) { score += 20; m.push("Your passport nationality is generally accepted for visits to this destination."); }
      else         { score += 10; w.push("Additional documentation requirements may apply for your passport nationality."); }
      m.push("El Salvador's consulted visa is filed at the Salvadoran consular office of your choice.");
      w.push("The application must be submitted four weeks before you enter Salvadoran territory.");
      w.push("If you hold a US, Canadian or Schengen visa valid for at least six months before your planned entry, you must contact the visa officer of the foreign ministry.");
      w.push("You need a photocopy of the ticket quote or travel itinerary showing the airline, flight number and the dates you enter and leave the country.");
      w.push("Accepting your documents does not mean the visa is granted, and the fee is not refundable.");
      w.push("This is simulated guidance only. Always verify with the Salvadoran migration authority.");
      var r = visaResult("tourist", clamp(score + 30, 0, 62), m, w, x);
      r.officialName = "El Salvador consulted visa (visa consultada)";
      r.route = "sv_tourist";
      return r;
    },
    digital_nomad: function (p) {
      var m = [], w = [], score = 0;
      if (p.remoteWork) { score += 40; m.push("Your profile indicates remote work, which is the main condition for this route."); }
      else w.push("This route is for people who work remotely for employers or clients outside El Salvador.");
      m.push("El Salvador has a digital nomad residence for remote workers, created in 2023.");
      w.push("It is granted for one year and can be renewed, up to a total of four years.");
      w.push("You must show that your income comes from outside El Salvador, plus a clean criminal record and health insurance.");
      finReq("You will be asked to prove regular income from abroad.", w);
      if (p.savings >= 6000) { score += 12; m.push("Your savings are a positive signal for the income and solvency checks."); }
      w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var r = visaResult("digital_nomad", clamp(score + 10, 0, 62), m, w, []);
      r.officialName = "El Salvador digital nomad residence";
      r.route = "sv_digital_nomad";
      return r;
    },
  });

  /* =========================================================================
     BELICE — turismo, estudios y trabajo AL NIVEL AUDITADO (v1.101.0, R5).
     Fuente capturada el 1-ago-2026: immigration.gov.bz publica cada trámite en
     su propia página, en inglés y con tasas. Snapshot: bz-upgrade-2026-08/.
     Su visa de nómada (Work Where You Vacation) ya estaba en v1.94.0 y se
     mantiene como estaba: esa aún NO tiene captura propia.
  ========================================================================= */
  var BZ_AUDITADO = {
    tourist: function (p) {
      var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
      if (pt <= 2) { score += 20; m.push("Your passport nationality is generally accepted for visits to this destination."); }
      else         { score += 10; w.push("Additional documentation requirements may apply for your passport nationality."); }
      m.push("A Belize visa lets you enter and stay legally for a maximum of 30 days from the date of entry.");
      w.push("Your passport must be valid for more than 6 months.");
      w.push("Your flight itinerary must show the expected arrival in Belize and the return date to your country of origin.");
      finReq("You and your sponsor must provide banking financials showing the last six months of transactions.", w);
      w.push("This is simulated guidance only. Always verify with the Belize Immigration Department.");
      var r = visaResult("tourist", clamp(score + 30, 0, 62), m, w, x);
      r.officialName = "Belize visitor visa";
      r.route = "bz_tourist";
      return r;
    },
    student: function (p) {
      var b = estudioBase(p, 58), m = b.m, w = b.w;
      m.push("Belize issues a student permit; at tertiary level it is issued for one semester.");
      w.push("You need a letter from the institution stating the duration of study, the programme and the institution's details.");
      w.push("The permit costs BZ$200 per school year or semester for most nationalities, and more for some.");
      w.push("This is simulated guidance only. Always verify with the Belize Immigration Department.");
      var r = visaResult("student", Math.min(b.score, b.tope), m, w,
        eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
      r.officialName = "Belize student permit";
      r.route = "bz_student";
      return r;
    },
    work: function (p) {
      var b = trabajoBase(p, 56), m = b.m, w = b.w;
      m.push("Belize's route is the Temporary Employment Permit, applied for at the Labour Department.");
      w.push("To apply you must already hold a valid passport and a valid Belize visa.");
      w.push("Within 30 days you will receive a call from the Labour Department about your application.");
      w.push("Permits run for one week, one crop season or one year; for professional workers with a university degree the one-year fee is $3000.");
      w.push("This is simulated guidance only. Always verify with the Belize Immigration Department.");
      var r = visaResult("work", Math.min(b.score, b.tope), m, w, []);
      r.officialName = "Belize Temporary Employment Permit";
      r.route = "bz_work";
      return r;
    },
  };

  COUNTRY_RULES.BZ = reglasModeladas("BZ", {
    tourist: BZ_AUDITADO.tourist, student: BZ_AUDITADO.student, work: BZ_AUDITADO.work,
    digital_nomad: function (p) {
      var m = [], w = [], score = 0;
      if (p.remoteWork) { score += 40; m.push("Your profile indicates remote work, which is the main condition for this route."); }
      else w.push("This route is for people employed or self-employed outside Belize.");
      m.push("Belize runs the Work Where You Vacation programme for remote workers.");
      w.push("It allows a stay of up to 180 days, working for your employer or clients abroad.");
      w.push("You must show annual earnings of at least US$75,000 (less for a couple applying together) and health insurance covering at least US$50,000.");
      if (p.savings >= 12000) { score += 12; m.push("Your savings are a positive signal for the income and solvency checks."); }
      else w.push("The income threshold is high: check it carefully before applying.");
      w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var r = visaResult("digital_nomad", clamp(score + 10, 0, 62), m, w, []);
      r.officialName = "Belize Work Where You Vacation (remote workers)";
      r.route = "bz_digital_nomad";
      return r;
    },
  });
  /* =========================================================================
     VIETNAM — Fase 3 (v1.87.0): el turismo, por visa concreta. Nivel MODELADO
     (sin fuente capturada aún → línea preliminar en las dos tarjetas):
     - Exención unilateral de 45 días para 13 nacionalidades (vigente desde
       15-ago-2023) + exenciones bilaterales (Chile, Panamá y la ASEAN).
     - E-visa de 90 días y entradas múltiples, abierta a TODAS las
       nacionalidades desde 2023 → tarjeta universal (patrón GB/CA/US: la
       tarjeta condicionada primero, la universal siempre).
     La ruta nómada «honesta» ya apuntaba a esta e-visa: sigue coherente.
  ========================================================================= */
  var VN_EXEMPT_45  = ["DE", "FR", "IT", "ES", "GB", "RU", "JP", "KR", "DK", "SE", "NO", "FI"];
  var VN_EXEMPT_BIL = ["CL", "PA"];

  COUNTRY_RULES.VN = {
    digital_nomad: honestDN([
      "Vietnam does not currently offer a dedicated Digital Nomad visa.",
      "Remote workers commonly use the 90-day tourist e-visa; longer stays require another visa type."]),

    tourist: function (p) {
      var cards = [], nat = p.nationality, pt = passportTier(nat);

      /* ── Exención de visado: solo para quien está en las listas ───────── */
      if (inList(VN_EXEMPT_45, nat) || inList(VN_EXEMPT_BIL, nat)) {
        var em = [], ew = [];
        if (inList(VN_EXEMPT_45, nat)) {
          em.push("Your passport nationality appears on Vietnam's unilateral visa exemption list: tourist stays of up to 45 days without a visa.");
        } else {
          em.push("Your passport nationality has a bilateral visa exemption agreement with Vietnam; the length of stay follows that agreement.");
        }
        ew.push("The exemption covers tourism only: you cannot take paid work during a visa-free stay.");
        ew.push("Vietnam has been extending visa exemption to further nationalities on a temporary basis — check the current official list before booking.");
        ew.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
        var exemption = visaResult("tourist", inList(VN_EXEMPT_45, nat) ? 78 : 72, em, ew, []);
        exemption.officialName = "Vietnam visa exemption — up to 45 days";
        exemption.route = "vn_tourist_exemption";
        cards.push(exemption);
      }

      /* ── E-visa: universal, siempre visible ───────────────────────────── */
      var vm = [], vw = [];
      /* v1.109.0 — AUDITADA con el portal oficial e-visa del Ministerio de
         Seguridad Pública, capturado con el navegador real del usuario (con
         curl devolvía 47 caracteres). Snapshot: vn-chrome-2026-08/. */
      vm.push("Vietnam's e-visa is valid for a maximum of 90 days, for single or multiple entries.");
      vw.push("The fee is 25 USD for a single-entry visa and 50 USD for a multiple-entry one, and it is not refunded if the visa is refused.");
      vw.push("You must be outside Vietnam when you apply, with a passport or valid international travel document.");
      vw.push("You can only enter and leave through the international border gates designated by the Government.");
      vw.push("You cannot take paid work in Vietnam on a tourist e-visa.");
      vw.push("The Immigration Department recommends filling in the pre-arrival form before you travel, to speed up entry.");
      var evisa = visaResult("tourist", pt <= 2 ? 68 : pt === 3 ? 62 : 56, vm, vw, []);
      evisa.officialName = "Vietnam E-visa — 90 days, multiple entry";
      evisa.route = "vn_tourist_evisa";
      cards.push(evisa);

      return cards;
    },

    student: function (p) { return genericDe("VN", "student", p); },
    work: function (p) { return genericDe("VN", "work", p); },
  };
  COUNTRY_RULES.LK = {
    digital_nomad: honestDN([
      "Sri Lanka does not currently offer a dedicated Digital Nomad visa.",
      "Remote workers commonly use the extendable tourist visa (ETA)."]),
    /* v1.103.0 — LAS TRES AUDITADAS (R5). Fuente capturada el 1-ago-2026:
       immigration.gov.lk (Department of Immigration and Emigration).
       Snapshot: lk-fj-upgrade-2026-08/. La ruta nómada sigue honesta: Sri Lanka
       no tiene programa dedicado y la fuente no lo menciona. */
    tourist: function (p) {
      var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
      if (pt <= 2) { score += 20; m.push("Your passport nationality is generally accepted for visits to this destination."); }
      else         { score += 10; w.push("Additional documentation requirements may apply for your passport nationality."); }
      m.push("Sri Lanka grants a 30-day free tourist visa to seven nationalities on a payment basis: China, India, Russia, Japan, Thailand, Malaysia and Indonesia.");
      w.push("Your intended stay must end at least two months before your travel document expires.");
      w.push("Children under 12 must extend their tourist visa, paying the extension fee, if they stay longer than thirty days from arrival.");
      finReq("You may be asked for proof of funds and onward travel.", w);
      w.push("This is simulated guidance only. Always verify with the Sri Lanka Department of Immigration and Emigration.");
      var r = visaResult("tourist", clamp(score + 30, 0, 62), m, w, x);
      r.officialName = "Sri Lanka tourist visa (ETA)";
      r.route = "lk_tourist";
      return r;
    },
    student: function (p) {
      var b = estudioBase(p, 58), m = b.m, w = b.w;
      m.push("Studying in Sri Lanka goes through a residence visa in the educational category.");
      w.push("University students need a recommendation from the Ministry of Higher Education.");
      w.push("You must show bank encashment receipts to the value of US$1500 for a year per person.");
      w.push("The residence visa is valid for one year, or the period recommended by the ministry or the academic institution, and can be renewed.");
      w.push("This is simulated guidance only. Always verify with the Sri Lanka Department of Immigration and Emigration.");
      var r = visaResult("student", Math.min(b.score, b.tope), m, w,
        eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
      r.officialName = "Sri Lanka residence visa — educational category";
      r.route = "lk_student";
      return r;
    },
    work: function (p) {
      var b = trabajoBase(p, 56), m = b.m, w = b.w;
      m.push("A Sri Lankan residence visa is a permit for a non-Sri Lankan to obtain residence facilities for special purposes, and employment is one of those categories.");
      w.push("You need a request letter from the company or institute, its registration certificate and the details of its board of directors.");
      w.push("The residence visa is valid for one year, or the period the relevant authority recommends, and is renewed annually.");
      w.push("This is simulated guidance only. Always verify with the Sri Lanka Department of Immigration and Emigration.");
      var r = visaResult("work", Math.min(b.score, b.tope), m, w, []);
      r.officialName = "Sri Lanka residence visa — employment category";
      r.route = "lk_work";
      return r;
    },
  };

  /* =========================================================================
     INDONESIA — E33G Remote Worker al nivel AUDITADO (v1.75.0)
     Fuente capturada 29-jul-2026: imigrasi.go.id/wna/daftar-visa-indonesia/E33G
     (responde a curl — vigilable sin trato especial). Snapshot:
     tools/visa-intelligence/snapshots/id-upgrade-2026-07/.
     Sin puerta por nacionalidad (la fuente no la impone); el verde exige
     fondos altos (proxy de los US$60.000/año de ingresos exigidos).
  ========================================================================= */
  COUNTRY_RULES.ID = {
    digital_nomad: function (p) {
      var m = [], w = [], x = [];
      function idDn(sc) {
        var r = visaResult("digital_nomad", sc, m, w, x);
        r.officialName = "Indonesia E33G Remote Worker Visa (Visa Rumah Kedua Pekerja Jarak Jauh)";
        r.route = "id_digital_nomad";
        return r;
      }
      if (!p.remoteWork) {
        w.push("Indonesia's E33G Remote Worker visa lets you live in Indonesia while working for a company established outside Indonesia.");
        return idDn(8);
      }
      m.push("Indonesia's E33G Remote Worker visa lets you live in Indonesia while working for a company established outside Indonesia.");
      m.push("Stays of 1 year; the stay permit can be extended online, and no Indonesian sponsor is required.");
      var score = 38;
      if (p.savings >= 2000) { score += 14; m.push("You appear to meet the living-funds requirement: a bank statement for the last 3 months with at least USD $2,000."); }
      else { w.push("You must show living funds: a bank statement for the last 3 months with at least USD $2,000."); }
      if (p.savings >= 60000) { score += 20; }
      w.push("Bank records must show salary or income of at least US$60,000 per year, plus an employment agreement with the foreign company.");
      w.push("The visa fee (PNBP) is Rp 7,000,000 for the 1-year stay, plus other components.");
      w.push("Your passport must be valid for at least 6 months.");
      w.push("Approval is always a prerogative of the Indonesian State. Simulated guidance only.");
      return idDn(score);
    },
    /* v1.81.0 — Fase 2 estrenada aquí: DOS visas de turismo concretas (array),
       nivel modelado (sin fuente capturada aún → línea de orientación
       preliminar en ambas). El ejemplo exacto que pidió el usuario. */
    tourist: function (p) {
      var pt = passportTier(p.nationality);
      var voaM = [], voaW = [], visitM = [], visitW = [];
      voaM.push("Indonesia's Visa on Arrival allows a 30-day tourist stay and can be extended once for another 30 days.");
      voaW.push("Available to nationals of the countries on Indonesia's VOA list — check the official list; it can also be applied for online as an e-VOA before travel.");
      voaW.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var voa = visaResult("tourist", pt <= 2 ? 74 : pt === 3 ? 62 : 28, voaM, voaW, []);
      voa.officialName = "Indonesia Visa on Arrival (VOA / e-VOA) — 30 days";
      voa.route = "id_tourist_voa";
      visitM.push("Indonesia's tourist visit visa allows stays of up to 60 days, with possible extensions in-country.");
      visitW.push("Applied for online via Indonesia's official e-visa portal before travel, with proof of funds and onward travel.");
      visitW.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var visit = visaResult("tourist", pt <= 3 ? 58 : 44, visitM, visitW, []);
      visit.officialName = "Indonesia Tourist Visit Visa — up to 60 days";
      visit.route = "id_tourist_visit";
      return [voa, visit];
    },
    student: function (p) { return genericDe("ID", "student", p); },
    work: function (p) { return genericDe("ID", "work", p); },
  };

  /* =========================================================================
     EVALUATE ONE COUNTRY
  ========================================================================= */
  function evaluateCountry(country, profile) {
    var iso   = country.iso;
    var rules = COUNTRY_RULES[iso];

    var selected = (profile.visaTypes && profile.visaTypes.length) ? profile.visaTypes : null;

    var available;
    if (rules) {
      available = Object.keys(rules);
    } else if (country.visas && country.visas.length) {
      var seen = {};
      available = country.visas
        .map(function(v) { return v.type; })
        .filter(function(t) { return seen[t] ? false : (seen[t] = true); });
    } else {
      available = D.VISA_TYPE_IDS;
    }

    var types = selected
      ? available.filter(function(t) { return selected.indexOf(t) !== -1; })
      : available;

    if (selected && !types.length) {
      return { iso: iso, name: country.name, region: country.region || "other",
               synthetic: !!country.synthetic, status: "ineligible", score: 0, visas: [] };
    }

    /* v1.81.0 — Fase 2: una regla puede devolver VARIAS visas concretas del
       mismo tipo (array) — p. ej. los dos turismos de Indonesia. Se normaliza
       a lista plana; cada tarjeta lleva su propio status. */
    var visaResults = [];
    types.forEach(function(vType) {
      var r;
      if (rules && typeof rules[vType] === "function") {
        r = rules[vType](profile);
      } else {
        var mockVisa = country.visas && country.visas.find(function(v) { return v.type === vType; });
        r = genericVisa(vType, profile, mockVisa ? mockVisa.req : {});
      }
      (Array.isArray(r) ? r : [r]).forEach(function(one) {
        one.status = scoreToStatus(one.score);
        visaResults.push(one);
      });
    });

    var countryStatus = "ineligible";
    if (visaResults.some(function(r) { return r.status === "eligible"; }))  countryStatus = "eligible";
    else if (visaResults.some(function(r) { return r.status === "partial"; })) countryStatus = "partial";

    var interest = new Set(profile.visaTypes || []);
    var topScore = 0;
    visaResults.forEach(function(r) {
      var s = r.score * (interest.has(r.type) ? 1.35 : 1.0);
      /* remoteWork (boolean) still boosts digital_nomad ranking — income does not */
      if (r.type === "digital_nomad" && profile.remoteWork) s *= 1.25;
      if (s > topScore) topScore = s;
    });

    return {
      iso: iso, name: country.name, region: country.region || "other",
      synthetic: !!country.synthetic, status: countryStatus,
      score: clamp(Math.round(topScore), 0, 100),
      visas: visaResults.sort(function(a, b) { return b.score - a.score; }),
    };
  }

  /* =========================================================================
     SYNTHETIC FALLBACK
  ========================================================================= */
  function syntheticCountry(iso, name, profile) {
    var rng   = mulberry32(hashStr(iso || name || "xx"));
    var all   = D.VISA_TYPE_IDS;
    var sel   = (profile.visaTypes && profile.visaTypes.length) ? profile.visaTypes : null;
    var types = sel ? all.filter(function(t) { return sel.indexOf(t) !== -1; }) : all;
    if (!types.length) types = all;

    var used = new Set(), n = 1 + Math.floor(rng() * 2), visas = [], i, vType, baseScore, pt;
    for (i = 0; i < types.length && visas.length < n; i++) {
      vType = types[Math.floor(rng() * types.length)];
      if (used.has(vType)) { rng(); continue; }
      used.add(vType);
      baseScore = Math.floor(rng() * 76) + 12;
      pt = passportTier(profile.nationality);
      if (pt === 1)      baseScore = clamp(baseScore + 10, 0, 100);
      else if (pt === 3) baseScore = clamp(baseScore - 12, 0, 100);
      else if (pt === 4) baseScore = clamp(baseScore - 28, 0, 100);
      visas.push(visaResult(vType, baseScore, [],
        ["Data for this country is simulated. Results are for illustration only."],
        baseScore < 40 ? ["passport"] : []));
    }
    if (!visas.length) {
      vType = types[0] || all[0];
      visas.push(visaResult(vType, 20, [], ["Simulated data only."], ["passport"]));
    }

    var countryStatus = "ineligible";
    if (visas.some(function(v) { return v.status === "eligible"; }))  countryStatus = "eligible";
    else if (visas.some(function(v) { return v.status === "partial"; })) countryStatus = "partial";
    var topSc = 0;
    visas.forEach(function(v) { if (v.score > topSc) topSc = v.score; });

    return { iso: iso, name: name, region: "other", synthetic: true,
             status: countryStatus, score: topSc,
             visas: visas.sort(function(a, b) { return b.score - a.score; }) };
  }

  /* =========================================================================
     PUBLIC API
  ========================================================================= */
  var _byIso = {}, _byName = {};
  D.COUNTRIES.forEach(function(c) { _byIso[c.iso] = c; _byName[c.name.toLowerCase()] = c; });

  function resolveCountry(iso, name) {
    return (iso && _byIso[iso]) || (name && _byName[(name || "").toLowerCase()]) || null;
  }

  function evaluateAll(geoList, profile) {
    if (!geoList || !profile) return {};
    var out = {};
    geoList.forEach(function(g) {
      try {
        var curated = resolveCountry(g.iso, g.name);
        if (curated) {
          var c = Object.assign({}, curated, { iso: g.iso || curated.iso, name: g.name || curated.name });
          out[g.id] = evaluateCountry(c, profile);
        } else if (g.iso && COUNTRY_RULES[g.iso]) {
          /* v1.19.0 — países con reglas reales pero fuera de la lista curada del
             prototipo (p.ej. los 26 Schengen de la fábrica): usar sus reglas. */
          out[g.id] = evaluateCountry({ iso: g.iso, name: g.name, region: "europe", visas: [] }, profile);
        } else {
          out[g.id] = syntheticCountry(g.iso, g.name, profile);
        }
      } catch (e) {
        console.warn("[Eligibility] Error evaluating country", g.iso || g.name, e);
        out[g.id] = { iso: g.iso, name: g.name, region: "other", synthetic: true,
                      status: "ineligible", score: 0, visas: [] };
      }
    });
    return out;
  }

  function topRecommendations(resultsMap, limit) {
    return Object.values(resultsMap)
      .filter(function(r) { return r.status === "eligible"; })
      .sort(function(a, b) { return a.synthetic !== b.synthetic ? (a.synthetic ? 1 : -1) : b.score - a.score; })
      .slice(0, limit || 6);
  }

  function tally(resultsMap) {
    var t = { eligible: 0, partial: 0, ineligible: 0 };
    Object.values(resultsMap).forEach(function(r) { t[r.status]++; });
    return t;
  }

  /* v1.11.0 — helper de solo lectura para la UI: ¿tiene este destino reglas
     reales modeladas (COUNTRY_RULES)? Los demás usan reglas sintéticas. */
  function hasRealRules(iso) { return !!COUNTRY_RULES[iso]; }

  /* v1.22.0 — convenios de acceso especial entre nacionalidad y destino.
     Solo lectura para la UI (banner en el panel de país). Evidencia:
     - eu_freedom: libre circulación UE/EEE (marco legal general, ya usado en el scoring).
     - trans_tasman: INZ "Australian Resident Visa" (capturado 15-jul-2026):
       "If you are an Australian citizen or permanent resident you can visit,
       work and live in New Zealand". Recíproco (SCV 444) con redacción prudente.
     - cta: Common Travel Area GB-IE (gov.uk, capturado 15-jul-2026). */
  function specialAccess(nat, iso) {
    if (!nat || !iso || nat === iso) return null;
    if (inList(PASSPORT.euEea, nat) && inList(PASSPORT.euEea, iso)) return "eu_freedom";
    if ((nat === "AU" && iso === "NZ") || (nat === "NZ" && iso === "AU")) return "trans_tasman";
    if ((nat === "GB" && iso === "IE") || (nat === "IE" && iso === "GB")) return "cta";
    return null;
  }

  return {
    passportTier: passportTier, evaluateCountry: evaluateCountry,
    evaluateAll: evaluateAll, resolveCountry: resolveCountry,
    topRecommendations: topRecommendations, tally: tally,
    hasRealRules: hasRealRules, specialAccess: specialAccess,
  };

})();