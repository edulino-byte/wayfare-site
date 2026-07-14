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
  COUNTRY_RULES.AU = {

    tourist: function (p) {
      /* ── Visitor visa subclass 600 — Tourist stream, apply outside Australia
         Data sourced from immi.homeaffairs.gov.au (simulated representation).
         No closed passport eligibility list for this stream per official page.
         Core requirements (funds, genuine visitor intent, health/character,
         debt status, actual location at application) cannot be assessed from
         the current questionnaire. Score is capped at partial (<70).
      ─────────────────────────────────────────────────────────────────── */
      var S600 = {
        subclass:     "600",
        route:        "subclass_600_tourist_outside",
        officialName: "Visitor visa (subclass 600) — Tourist stream",
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

      var m = [], w = [], x = [], score = 0;

      /* 1. Passport — no closed list for subclass 600 per official page */
      m.push("This route does not appear to require a specific eligible passport list based on the captured official page.");

      /* 2. Residence / application location */
      if (p.currentResidence === "AU") {
        score += 55;
        w.push("This tourist stream requires you to be outside Australia when you apply and when the visa is decided.");
      } else {
        score += 65;
        m.push("Your current residence appears consistent with an outside-Australia tourist stream, but your actual location at application time must be checked.");
      }

      /* 3. Age — no adult-only requirement; under-18 warning only */
      if (p.age < 18) {
        w.push("For applicants under 18, the visa may not be granted if it is not in the best interests of the child.");
      }

      /* 4. Remote work — not a blocker but requires a clear warning */
      if (p.remoteWork) {
        w.push("This visa does not allow work in Australia. If you plan to work remotely while in Australia, you should check official conditions carefully.");
      }

      /* 5. Genuine visitor — always informational */
      w.push("You must be a genuine visitor and only intend to stay temporarily in Australia.");

      /* 6. Financial — informational only */
      finReq("You must have, or have access to, enough money to support yourself while in Australia. Wayfare does not currently assess financial evidence.", w);

      /* 7. Non-evaluable official requirements */
      S600.notEvaluated.forEach(function(req) { w.push(req); });

      /* Cap at partial: genuine visitor intent, funds, health/character,
         actual application location cannot be assessed by Wayfare */
      score = Math.min(score, 68);

      return s600Result(score, m, w, x);
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
      var m = [], w = [], x = [], score = 50;

      /* NZeTA vs visitor visa — informational only */
      m.push("Some travellers can come to New Zealand on an NZeTA (Electronic Travel Authority) instead of a visitor visa; which one you need depends on your passport.");

      /* Remote-work nuance (preserve digital-nomad fairness) */
      if (p.remoteWork) {
        m.push("Your profile indicates remote work. Check the work conditions below for New Zealand Visitor Visa limits.");
      }

      /* Official requirements — informational warnings (not assessable here) */
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

      /* Always partial: core requirements cannot be verified by Wayfare */
      score = clamp(score, 40, 68);

      var r = visaResult("tourist", score, m, w, x);
      r.officialName = "Visitor Visa";
      r.route        = "visitor_visa";
      return r;
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
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      var pt = passportTier(nat);
      if (pt === 1) {
        score += 55;
        m.push("Your passport nationality may be eligible for visa-free entry or an eTA (Electronic Travel Authorization) for Canada.");
        w.push("An eTA may be required before travelling by air. Check the IRCC website to confirm.");
      } else if (pt === 2) {
        score += 30;
        w.push("A Temporary Resident Visa (TRV) application may be required for your passport nationality.");
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
      r.officialName = "Visitor visa / eTA";
      r.route        = "ca_visitor";
      return r;
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
      var r = visaResult("student", score, m, w, x);
      r.officialName = "Spain long-term study stay"; r.route = "es_study";
      return r;
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
      /* v1.15.0 — corrección: España SÍ tiene acuerdos de working holiday como
         destino. Evidencia oficial (Embajada de España en Tokio, capturada
         14-jul-2026): programa con Japón en vigor desde 1-jul-2017 (18-30 años)
         y "otros Acuerdos... con Australia, Canadá y Nueva Zelanda". La fuente
         es un artículo de 2017 => tope partial y verificación con consulado.
         Acuerdos posteriores (p.ej. Corea, Argentina) sin fuente oficial
         capturada: no se listan todavía. */
      var ES_YM = ["JP", "AU", "CA", "NZ"];
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      function esYmResult(sc) {
        var r = visaResult("work_and_holiday", sc, m, w, x);
        r.officialName = "Spain Working Holiday (bilateral agreements)";
        r.route = "es_youth_mobility";
        return r;
      }
      if (!inList(ES_YM, nat)) {
        w.push("Spain's working holiday agreements appear limited to certain countries (Japan, Australia, Canada and New Zealand per the latest captured official source). Verify with the Spanish consulate in your country.");
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
      var r = visaResult("student", score, m, w, x);
      r.officialName = "Portugal Study Visa"; r.route = "pt_study";
      return r;
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
      var m = [], w = [], x = [], score = 50;

      /* Visa vs ETA is nationality-dependent — informational only */
      m.push("Depending on your passport, you either need a Standard Visitor visa before you travel or an Electronic Travel Authorisation (ETA); check GOV.UK to see which applies to you.");

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

    var visaResults = types.map(function(vType) {
      var r;
      if (rules && typeof rules[vType] === "function") {
        r = rules[vType](profile);
      } else {
        var mockVisa = country.visas && country.visas.find(function(v) { return v.type === vType; });
        r = genericVisa(vType, profile, mockVisa ? mockVisa.req : {});
      }
      r.status = scoreToStatus(r.score);
      return r;
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

  return {
    passportTier: passportTier, evaluateCountry: evaluateCountry,
    evaluateAll: evaluateAll, resolveCountry: resolveCountry,
    topRecommendations: topRecommendations, tally: tally,
    hasRealRules: hasRealRules,
  };

})();