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
  /* v1.155.0 — sin puntuación NO hay veredicto. Antes esto recibía null (una
     tarjeta sin fuente capturada), fallaba las dos comparaciones y devolvía
     «ineligible»: la app le decía a alguien «poco probable» justo donde lo
     honesto es reconocer que no lo sabe. Hay cuatro sitios que recalculan el
     estado desde la puntuación; con esta guarda, los cuatro respetan el nulo. */
  function scoreToStatus(s) {
    if (s === null || s === undefined) return "nodata";
    return s >= 70 ? "eligible" : s >= 40 ? "partial" : "ineligible";
  }

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
          "Always verify with the Australian Department of Home Affairs (immi.homeaffairs.gov.au).",
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
        /* v1.110.0 — la 444 NO recibe extrasComunes: no es una visa de
           turista. Un neozelandés puede visitar, estudiar Y TRABAJAR, así
           que las frases de "visitante genuino", "no puedes trabajar" y
           "interés superior del menor" eran falsas aquí. Sus dos únicos
           requisitos oficiales son los de la página del subclass 444. */
        var m444 = [], w444 = [];
        m444.push("New Zealand citizens can usually enter Australia under the Trans-Tasman Travel Arrangement (Special Category visa granted on arrival).");
        w444.push("As a New Zealand citizen you are usually granted the Special Category visa (subclass 444) on arrival under the Trans-Tasman arrangement - it is free and lets you visit, study and work in Australia.");
        w444.push("You must remain a New Zealand citizen and continue to meet the character requirements.");
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
        /* v1.115.0 — antes esta base era 44 y la de abajo 48. Con el descuento
           de -8 por estar ya en Australia, un alemán (que además tiene eVisitor)
           caía a 36 «poco probable» mientras un colombiano se quedaba en 40
           «parcial»: el pasaporte mejor daba la banda peor en la misma tarjeta.
           La 600 está igual de disponible para ambos, así que misma base. */
        score600 = 48;
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
        /* Per-passport maximum age; minimum is 18 for all.
           Verificado contra immi.homeaffairs.gov.au el 2-ago-2026 (navegador real).
           Ese día subieron a 35 Chipre, Finlandia, Alemania y Corea del Sur. */
        eligiblePassports: {
          BE: 30, CA: 35, CY: 35, DK: 35, EE: 30,
          FI: 35, FR: 35, DE: 35, HK: 30, IE: 35,
          IT: 35, JP: 30, KR: 35, MT: 30, NL: 30,
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
          "Always verify with the Australian Department of Home Affairs (immi.homeaffairs.gov.au).",
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
          w.push("Always verify with the Australian Department of Home Affairs (immi.homeaffairs.gov.au).");
          return makeResult(S417, clamp(score - 30, 0, 35), m, w, x);
        }
        score += 40;
        m.push(maxAge417 === 35
          ? "Your age appears to be within the allowed range for your passport under subclass 417 (18 to 35)."
          : "Your age appears to be within the allowed range for your passport under subclass 417 (18 to 30)."
        );
        finReq("You may need around AUD 5,000 for your initial stay, plus enough to cover onward travel after leaving Australia.", w);
        S417.notEvaluated.forEach(function(req) { w.push(req); });
        w.push("Always verify with the Australian Department of Home Affairs (immi.homeaffairs.gov.au).");
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
          w.push("Always verify with the Australian Department of Home Affairs (immi.homeaffairs.gov.au).");
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
      /* v1.159.0 — se citan las DOS listas oficiales que hacen cierta la
         negativa, para que la tarjeta deje de ser una afirmación desnuda. */
      w.push("Australia's Working Holiday visa requires a passport from a country or jurisdiction on its eligible list.");
      w.push("and the Work and Holiday visa requires a passport from its own, separate eligible list.");
      w.push("Your passport does not appear to be listed for Australia's Working Holiday visa subclass 417 or Work and Holiday visa subclass 462.");
      w.push("Check the Australian Department of Home Affairs website for the full current eligibility lists.");
      /* v1.155.0 — esta rama salía sin nombre y sin ruta. Australia es el país
         más auditado de la app y aun así su respuesta a «tu pasaporte no está en
         ninguna de las dos listas» era una tarjeta sin título e invisible para el
         auditor. Un «no» también es una respuesta y lleva identidad. */
      var rSin = visaResult("work_and_holiday", 20, m, w, x);
      rSin.officialName = "Australia Working Holiday: your passport is not on either list";
      rSin.route = "au_working_holiday_fuera_de_lista";
      return rSin;
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
          "Always verify with the Australian Department of Home Affairs (immi.homeaffairs.gov.au).",
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
        w.push("Always verify with the Australian Department of Home Affairs (immi.homeaffairs.gov.au).");
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
      /* v1.110.0 — Los neozelandeses no necesitan patrocinio: la Special
         Category visa (subclass 444) que reciben al llegar ya les permite
         trabajar. Decirles "necesitas oferta de empleo" era engañoso.
         Fuente: página oficial del subclass 444, verificada el 2-ago-2026. */
      if (p.nationality === "NZ") {
        m.push("As a New Zealand citizen, the Special Category visa (subclass 444) granted on arrival already lets you visit, study and work in Australia without employer sponsorship.");
        w.push("You must remain a New Zealand citizen and continue to meet the character requirements.");
        return visaResult("work", 88, m, w, x);
      }
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
      w.push("Most Australian work visas require a job offer or employer sponsorship.");
      /* v1.130.0 — AUDITADO. Fuente: Department of Home Affairs
         (immi.homeaffairs.gov.au), ficha del subclass 482 «Skills in Demand» y
         lista completa de visados. Capturado con navegador real el 3-ago-2026
         (el sitio devuelve 403 al robot).
         Snapshot: snapshots/us-au-verificacion-2026-08/ */
      m.push("The main employer-sponsored route is the Skills in Demand visa (subclass 482), for a skilled position an employer cannot fill with an Australian worker.");
      w.push("You must be nominated for a skilled position by an approved sponsor, have the right skills for the job and meet the English language requirements.");
      w.push("Your occupation must appear on the Core Skills Occupation List.");
      w.push("The subclass 482 lets you stay up to 4 years, or up to 5 for Hong Kong passport holders, and costs from AUD 4,015.");
      w.push("Skilled visa income thresholds are indexed each year to Average Weekly Ordinary Time Earnings.");
      w.push("Always verify with the Department of Home Affairs (immi.homeaffairs.gov.au).");
      var rAw = visaResult("work", score, m, w, x);
      rAw.officialName = "Australia Skills in Demand visa (subclass 482)";
      rAw.route = "au_skills_in_demand";
      return rAw;
    },

    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 0;
      w.push("Australia does not currently offer a dedicated Digital Nomad visa. Remote work on a visitor visa is a legally uncertain arrangement.");
      w.push("The Department of Home Affairs publishes 118 visa subclasses and none of them is a digital nomad visa.");
      w.push("Always verify with the Department of Home Affairs (immi.homeaffairs.gov.au).");
      if (!p.remoteWork) {
        w.push("Remote work status is the primary factor for digital nomad-style stays.");
        finReq("You may need to show sufficient funds for your stay. Check official visitor visa requirements.", w);
          var rA0 = visaResult("digital_nomad", 10, m, w, x);
        rA0.officialName = "Australia: no digital nomad visa"; rA0.route = "au_no_dnv";
        return rA0;
      }
      score += 28;
      m.push("Your profile indicates remote work, which is the main factor for this route.");
      /* v1.115.0 — antes dependía de p.monthlyIncome, que la interfaz fijaba
         SIEMPRE en 0: el aviso no se mostraba nunca. Ahora se muestra a quien
         declara trabajo remoto, que es a quien le concierne. */
      if (p.remoteWork) w.push("Income requirements for extended stays should be verified against official visitor visa guidance.");
      finReq("You may need to show sufficient funds for your planned stay. Check official visitor visa requirements.", w);
      var rAd = visaResult("digital_nomad", clamp(score, 0, 40), m, w, x);
      rAd.officialName = "Australia: no digital nomad visa"; rAd.route = "au_no_dnv";
      return rAd;
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
    IE: { name: "Ireland Working Holiday Visa",   maxAge: 30, quota: null, funds: 4200, czExtension: true, sinSeguro: true },
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

  /* =========================================================================
     v1.168.0 — «APTO» NO ES LO MISMO QUE «PUEDES SOLICITAR HOY».
     Lo señaló el usuario y tenía toda la razón: la app le decía a un argentino
     «Argentina Working Holiday Visa · nota 80 · Podrías calificar», en verde, sin
     mencionar en ninguna parte que esa vía está CERRADA y no abre hasta el 24 de
     septiembre. Cumplir los requisitos y poder solicitar son dos cosas distintas,
     y confundirlas manda a alguien a una puerta que está cerrada.

     De las 33 vías de working holiday de Nueva Zelanda, OCHO están cerradas hoy
     — y de esas, China y México ni siquiera publican cuándo abren.

     El estado va SIEMPRE el primero de la tarjeta, con su fecha de comprobación:
     un «cerrada» caducado engaña igual que un «abierta» caducado.
     Fuente y estado: data/aperturas.js · snapshots/nz-aperturas-2026-08/
  ========================================================================= */
  function estadoAperturaNZ(nat, m, w) {
    var API = (typeof window !== "undefined" && window.APERTURAS) || null;
    if (!API || !API.estadoDe) return;
    var e = API.estadoDe(nat);
    if (!e) return;

    /* v1.168.0 — LAS FRASES FIJAS Y LOS DATOS, SEPARADOS. La primera versión
       metía la fecha dentro del párrafo, y salían seis frases casi idénticas que
       habría que retraducir enteras cada vez que un gobierno mueva un día. Aquí
       la explicación es fija —se traduce una vez— y la fecha va en su propia
       línea corta. Cambiar una fecha ya solo toca una línea. */
    if (e.estado === "abierta") {
      m.unshift("Applications for your nationality were open when Wayfare last checked with Immigration New Zealand.");
      return;
    }
    if (e.instanteUTC) {
      /* la línea variable va PRIMERO, que es el dato que la persona busca */
      if (e.husoDiscrepa) {
        w.unshift("Careful with the hour: their page says " + e.husoDeclarado +
                  " on a date when New Zealand is on " + e.husoReal +
                  ", so treat the earlier of the two as the real one.");
      }
      w.unshift("It opens on " + e.fecha + " at " + e.hora + ", New Zealand time.");
      w.unshift("Applications for your nationality were CLOSED when Wayfare last checked, and the places run out: set yourself a reminder before it opens.");
    } else {
      w.unshift("Applications for your nationality were CLOSED when Wayfare last checked, and Immigration New Zealand does not publish when they reopen. There is no date to set a reminder for.");
    }
    w.push("Wayfare checked this with the official source on " + e.comprobado + "; an opening or closing can change at any time.");
  }

  function nzWhResult(cfg, score, m, w, x, nat) {
    if (cfg && nat) estadoAperturaNZ(nat, m, w);
    var r = visaResult("work_and_holiday", score, m, w, x);
    if (cfg) {
      r.officialName = cfg.name;
      /* v1.169.0 — EL ESTADO NO SE PEGA AL NOMBRE. En v1.168.0 lo metí dentro
         de officialName («… — closed, opens 2026-09-24») y eso tenía dos fallos:
         el nombre oficial de la visa dejaba de ser el nombre oficial, y esa
         coletilla salía EN INGLÉS en la interfaz española, porque officialName se
         traduce buscando la cadena entera en el diccionario y esa cadena ya no
         existía en él.

         Ahora viaja en su propio campo y la interfaz lo pinta como sello
         traducible al lado del nombre. Lo que la persona necesita entender de un
         vistazo es exactamente esto: «cumplo los requisitos, PERO ahora está
         cerrada, y abre tal día». Dos hechos distintos, dos sitios distintos. */
      var API = (typeof window !== "undefined" && window.APERTURAS) || null;
      var est = (API && API.estadoDe && nat) ? API.estadoDe(nat) : null;
      if (est) {
        r.apertura = { estado: est.estado, fecha: est.fecha || null,
                       hora: est.hora || null, comprobado: est.comprobado || null };
      }
      r.route        = "nz_working_holiday";
    } else {
      /* v1.155.0 — la rama «tu pasaporte no está en la lista» salía SIN NOMBRE
         y SIN RUTA: en pantalla, una tarjeta sin título; para el auditor,
         invisible. Decir que no reúnes las condiciones es una respuesta tan
         legítima como decir que sí, y merece identidad propia. */
      r.officialName = "New Zealand Working Holiday: your nationality is not on the list we cover";
      r.route        = "nz_working_holiday_fuera_de_lista";
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
    /* Seguro — lo exigen 31 de los 33 acuerdos. Quedan fuera Reino Unido
       (cfg.uk) e IRLANDA (v1.120.0): su página de Immigration New Zealand NO
       menciona el seguro en ningún punto —comprobado sobre el texto completo
       de la página, 11.432 caracteres, el 2-ago-2026— mientras que las de los
       otros 31 sí lo listan. Hasta ahora la app se lo exigía a los irlandeses
       sin que su acuerdo lo pida. */
    if (!cfg.uk && !cfg.sinSeguro) {
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
    w.push("Always verify with Immigration New Zealand.");
  }

  function nzWorkingHoliday(p) {
    var nat = p.nationality;
    var cfg = NZ_WHV[nat];

    /* Passport not on the curated NZ Working Holiday country list */
    if (!cfg) {
      var mn = [], wn = [], xn = [];
      xn.push("passport");
      wn.push("New Zealand runs its Working Holiday visa as a separate arrangement with each country, each with its own conditions.");
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
      return nzWhResult(cfg, 32, m, w, x, nat);
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

    return nzWhResult(cfg, clamp(score, 0, 100), m, w, x, nat);
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
        wE.push("Always verify with Immigration New Zealand.");
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
      w.push("Always verify with Immigration New Zealand.");
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
      w.push("Always verify with Immigration New Zealand.");

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
      /* v1.148.0 — AUDITADA. Fuente: Immigration New Zealand, ficha del
         Accredited Employer Work Visa, capturada con navegador real el
         3-ago-2026. Snapshot: snapshots/nz-mx-2026-08/
         Lo decisivo: no puedes empezar tú. El empleador acreditado tiene que
         enviarte el enlace único para poder siquiera solicitarla. */
      m.push("The Accredited Employer Work Visa lets you work for an accredited employer who offers you at least 30 hours a week, and stay up to 5 years depending on the job.");
      m.push("It can lead to a resident visa, and you may be able to support a visitor or work visa for your partner and visas for your dependent children.");
      m.push("You can also study for up to 3 months in any 12-month period, or do any study your job requires.");
      w.push("You cannot start the application yourself: the accredited employer must send you the unique link or job token.");
      w.push("You must show you can speak and understand English if your job is at skill level 3 to 5.");
      w.push("The visa ties you to that employer: changing employer, job or location means varying your conditions, applying for a Job Change, or applying for a new visa.");
      w.push("If you have already had one and stayed the maximum time, you must spend the required time outside New Zealand before applying again.");
      w.push("It costs from 1,540 New Zealand dollars, and 80% of applications are decided within 7.5 weeks.");
      w.push("Always verify with Immigration New Zealand (immigration.govt.nz).");
      var rNZ = visaResult("work", score, m, w, x);
      rNZ.officialName = "New Zealand Accredited Employer Work Visa (AEWV)";
      rNZ.route = "nz_work_aewv";
      return rNZ;
    },

    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 0;
      /* v1.159.0 — la negativa se apoya ahora en lo que INZ sí publica sobre
         trabajar allí, en vez de ser una afirmación desnuda. */
      w.push("New Zealand does not currently offer a dedicated Digital Nomad visa.");
      w.push("The work visa New Zealand does publish is tied to an accredited employer who has offered you at least 30 hours of work a week, which is the opposite of working remotely for someone abroad.");
      if (!p.remoteWork) {
        finReq("You may need to show sufficient funds for your stay. Check official visitor visa requirements.", w);
        var r0 = visaResult("digital_nomad", 8, m, w, x);
        r0.officialName = "New Zealand: no digital nomad visa";
        r0.route = "nz_digital_nomad";   /* v1.155.0 — le faltaba la ruta */
        return r0;
      }
      score += 28; m.push("Your profile indicates remote work, which is the main factor for nomad-style stays.");
      /* v1.115.0 — antes dependía de p.monthlyIncome, que la interfaz fijaba
         SIEMPRE en 0: el aviso no se mostraba nunca. Ahora se muestra a quien
         declara trabajo remoto, que es a quien le concierne. */
      if (p.remoteWork) w.push("Income requirements for extended stays should be verified against official visitor visa guidance.");
      finReq("You may need to show sufficient funds for your stay. Check official visitor visa requirements.", w);
      var rd = visaResult("digital_nomad", clamp(score, 0, 40), m, w, x);
      rd.officialName = "New Zealand: no digital nomad visa";
      rd.route = "nz_digital_nomad";   /* v1.155.0 — le faltaba la ruta */
      return rd;
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
        wE.push("Verify with IRCC (Immigration, Refugees and Citizenship Canada).");
        var rE = visaResult("tourist", 55, mE, wE, []);
        rE.officialName = "Canada eTA (Electronic Travel Authorization)";
        rE.route = "ca_tourist_eta";
        cards.push(rE);
      }
      /* v1.24.0 — listas OFICIALES de canada.ca (antes tier del prototipo) */
      if (nat === "US") {
        score += 60;
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
      w.push("Verify with IRCC (Immigration, Refugees and Citizenship Canada).");
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
      w.push("IEC places are allocated through random invitation draws (pools). Receiving an invitation is not guaranteed.");
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
      w.push("A letter of acceptance from a Designated Learning Institution (DLI) is required.");
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
      /* v1.129.0 — AUDITADO. Fuente: canada.ca (IRCC), «Work permit: Apply from
         outside Canada – Eligibility and requirements», capturado con navegador
         real el 3-ago-2026 (canada.ca devuelve 403 al robot).
         Snapshot: snapshots/ca-jp-verificacion-2026-08/
         Lo que la app callaba y sí importa: el tipo de permiso NO lo eliges tú. */
      m.push("Canada has two kinds of work permit: employer-specific (closed), which is the most common and needs a job offer, and open, only for people who qualify for it.");
      w.push("You cannot choose which type of work permit you need: it depends on your situation.");
      w.push("You must show you have enough money to support yourself and your family during your stay and to return home.");
      w.push("You must show that you will leave Canada before your work permit expires.");
      w.push("You must include every required document and give any other document the officer asks for.");
      finReq("You may need to show sufficient funds for relocation. Check IRCC for current requirements.", w);
      w.push("Always verify with Immigration, Refugees and Citizenship Canada (canada.ca).");
      var rw = visaResult("work", score, m, w, x);
      rw.officialName = "Canada work permit (employer-specific or open)";
      rw.route = "ca_work_permit";
      return rw;
    },

    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 0;
      w.push("Canada does not currently offer a dedicated Digital Nomad visa. Remote work on a visitor permit is legally uncertain.");
      w.push("The only work permits Canada publishes are the employer-specific one, which needs a job offer, and the open one, which is only for people who qualify for it.");
      w.push("Always verify with Immigration, Refugees and Citizenship Canada (canada.ca).");
      if (!p.remoteWork) {
        finReq("You may need to show sufficient funds for your stay. Check official visitor visa requirements.", w);
        var r0 = visaResult("digital_nomad", 8, m, w, x);
        r0.officialName = "Canada: no digital nomad visa";
        r0.route = "ca_digital_nomad";
        return r0;
      }
      score += 28; m.push("Your profile indicates remote work, which is the primary factor for this route.");
      /* v1.115.0 — antes dependía de p.monthlyIncome, que la interfaz fijaba
         SIEMPRE en 0: el aviso no se mostraba nunca. Ahora se muestra a quien
         declara trabajo remoto, que es a quien le concierne. */
      if (p.remoteWork) w.push("Income requirements for extended stays should be verified against official visitor visa guidance.");
      finReq("You may need to show sufficient funds for your stay. Check official visitor visa requirements.", w);
      var rd = visaResult("digital_nomad", clamp(score, 0, 40), m, w, x);
      rd.officialName = "Canada: no digital nomad visa";
      rd.route = "ca_digital_nomad";
      return rd;
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
      w.push("The 90/180-day Schengen rule applies.");
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
      w.push("Proof of remote work contract or freelance client invoices is required.");
      var r = visaResult("digital_nomad", score, m, w, x);
      r.officialName = "Spain Digital Nomad Visa (international teleworker)"; r.route = "es_dnv";
      return r;
    },

    student: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      if (inList(PASSPORT.euEea, nat)) { score += 22; m.push("EU/EEA citizens face minimal visa barriers for studying in Spain."); }
      else if (passportTier(nat) <= 2) { score += 16; m.push("Your passport nationality is generally accepted for Spanish student visa applications."); }
      else                              { score += 8;  w.push("Additional documentation requirements may apply for your passport nationality."); }
      /* v1.115.0 — antes: scoreEng(p, "basic", 14). En la escala interna
         "basic" es el nivel MÍNIMO (índice 0), así que la comprobación siempre
         pasaba y los 14 puntos se concedían igual. Se deja explícito: en estos
         destinos el inglés no diferencia (los cursos pueden impartirse en el
         idioma local). Si algún día se quiere puntuar, hay que elegir un umbral
         real, no "basic". */
      score += 14;   /* no depende del inglés: ver nota */
      score += scoreEdu(p, "secondary", 24);
      if (eduRank(p.education) < eduRank("secondary")) x.push("minEdu");
      else m.push("Your education level appears to meet general requirements.");
      score += scoreAge(p.age, 17, 65, 10);
      finReq("You may need to show sufficient funds for tuition and living costs. Check official Spanish student visa requirements.", w);
      w.push("Enrollment acceptance from an accredited Spanish institution is required.");
      m.push("This authorisation covers stays of more than 90 days for higher or post-compulsory secondary studies.");
      var r = visaResult("student", score, m, w, x);
      r.officialName = "Spain long-term study stay"; r.route = "es_study";

      /* v1.86.0 — FASE 3: tarjeta hermana de CORTA duración (91–180 días),
         nivel modelado (línea preliminar) hasta capturar su fuente. */
      /* v1.130.0 — AUDITADA. Fuente: exteriores.gob.es, ficha «Visados
         Nacionales - Visado de estudios» (capturado con navegador real el
         3-ago-2026). Snapshot: snapshots/es-pt-estudios-2026-08/
         Lo que de verdad separa esta tarjeta de la larga: por debajo de 180
         días NO se pide certificado de antecedentes penales. */
      var mC = [], wC = [];
      mC.push("Spain's short-term study visa covers courses of 91 to 180 days.");
      mC.push("A study stay of up to 90 days needs no study visa at all: depending on your nationality you may need a Schengen short-stay visa instead.");
      mC.push("Below 180 days you are not asked for the criminal record certificate that longer stays require.");
      wC.push("Enrollment acceptance from an accredited Spanish institution is required.");
      wC.push("University studies may be on-site or hybrid; other higher studies must be at least 50% on-site.");
      wC.push("You need health insurance taken out with an insurer authorised to operate in Spain, with cover similar to the Spanish national health service.");
      finReq("The minimum financial means required is 100% of the IPREM index, plus an extra amount for each accompanying family member.", wC);
      wC.push("Always verify with Spain's Ministry of Foreign Affairs (exteriores.gob.es).");
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
      /* v1.115.0 — antes: scoreEng(p, "basic", 14). En la escala interna
         "basic" es el nivel MÍNIMO (índice 0), así que la comprobación siempre
         pasaba y los 14 puntos se concedían igual. Se deja explícito: en estos
         destinos el inglés no diferencia (los cursos pueden impartirse en el
         idioma local). Si algún día se quiere puntuar, hay que elegir un umbral
         real, no "basic". */
      score += 14;   /* no depende del inglés: ver nota */
      score += scoreEdu(p, "secondary", 24);
      if (eduRank(p.education) < eduRank("secondary")) x.push("minEdu");
      else m.push("Your education level appears to meet general requirements.");
      score += scoreAge(p.age, 17, 65, 10);
      finReq("You may need to show sufficient funds for tuition and living costs. Check official Portuguese student visa requirements.", w);
      var r = visaResult("student", score, m, w, x);
      r.officialName = "Portugal Study Visa (D4)"; r.route = "pt_study";

      /* v1.86.0 — FASE 3: tarjeta de estada temporária (cursos hasta 1 año),
         nivel modelado (línea preliminar) hasta capturar su fuente. */
      /* v1.130.0 — AUDITADA. Fuente: vistos.mne.gov.pt, portal oficial de
         visados del Ministerio de Asuntos Exteriores portugués (capturado con
         navegador real el 3-ago-2026).
         Snapshot: snapshots/es-pt-estudios-2026-08/ */
      var mT = [], wT = [];
      mT.push("Portugal's temporary stay visa covers study programmes of up to one year.");
      mT.push("The temporary stay visa covers periods of over 3 months for study programmes in a certified institution, student exchange, unpaid internships or volunteer work.");
      wT.push("Enrollment acceptance from an accredited Portuguese institution is required.");
      wT.push("Your passport must be valid for 3 months beyond the estimated date of return, and you must show a copy of your return transport title.");
      wT.push("You need travel insurance covering medical expenses, urgent assistance and possible repatriation.");
      wT.push("You must present a criminal record certificate from your country of nationality or from any country where you have lived for over a year, apostilled or legalised, unless you are under sixteen.");
      finReq("You must show proof of financial resources as defined by government decree.", wT);
      wT.push("Always verify with Portugal's official visa portal (vistos.mne.gov.pt).");
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
      w.push("Verify current conditions with the Portuguese consulate in your country.");
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
  /* Exentos de visado (90 días) presentes en el selector; eP = solo ePassport.
     v1.111.0 — verificado contra mofa.go.jp (74 países, página de 1-sep-2025,
     leída con navegador real el 2-ago-2026). Faltaban NUEVE nacionalidades que
     el selector ofrece y que SÍ están exentas: a esas personas la app les decía
     que necesitaban visado. Añadidas AD, HK, IL, LI, MT, RO, SI, SK y TW. */
  var JP_EXEMPT = ["AD","AR","AT","BE","BG","CH","CL","CR","CY","CZ","DE","DK","DO","EE","ES","FI","FR",
    "GB","GR","GT","HK","HN","HR","HU","IE","IL","IS","IT","LI","LT","LU","LV","MT","MX","NL","NO","PA",
    "PE","PL","PT","PY","RO","RS","SE","SI","SK","SV","TR","TW","US","UY","CA","AU","NZ","JP","KR","BR"];
  var JP_EXEMPT_EPASSPORT = ["BR","PE","PY","PA","RS"];
  /* Nota 8 del MOFA: acuerdos bilaterales de hasta 6 meses (más de 90 días
     exige pedir prórroga al Ministerio de Justicia antes de que expire). */
  var JP_EXEMPT_6M = ["AT","DE","IE","LI","MX","CH","GB"];
  /* Notas 4 y 5: la exención depende del tipo de pasaporte. */
  var JP_EXEMPT_PASAPORTE_ESPECIAL = {
    HK: "For Hong Kong, the exemption covers holders of a Hong Kong SAR passport, or a British National (Overseas) passport with right of residence in Hong Kong.",
    TW: "For Taiwan, the visa exemption is limited to passport holders with a personal ID number.",
    UY: "Uruguayan ordinary passports issued after 16 April 2025 without 'place of birth' on the data page are not recognised by Japan: the exemption applies only to the older version of the passport."
  };

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
        wE.push("Always verify with travel.state.gov.");
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
      /* v1.130.0 — AUDITADO. Fuente: travel.state.gov, Departamento de Estado
         (capturado con navegador real el 3-ago-2026: el sitio está tras
         Cloudflare). Snapshot: snapshots/us-au-verificacion-2026-08/ */
      m.push("The visitor visa covers business (B-1), tourism (B-2) or both (B-1/B-2).");
      w.push("Your passport must be valid for at least six months beyond your period of stay, unless a country-specific agreement exempts you.");
      w.push("An interview is generally required, and a consular officer may require one of any applicant.");
      w.push("Travelling for the primary purpose of giving birth in the United States is not permissible on a visitor visa.");
      finReq("The visa application fee shown by the State Department is 185 dollars, and you may also need to show sufficient funds and strong ties to your home country.", w);
      w.push("Always verify with travel.state.gov.");
      var r = visaResult("tourist", clamp(score, 0, 68), m, w, x);
      r.officialName = "B-1/B-2 Visitor Visa";
      r.route = "us_tourist_b1b2";
      cards.push(r);
      return cards;
    },

    work_and_holiday: function (p) {
      var m = [], w = [], x = [], score = 5;
      w.push("The USA does not operate a working holiday programme. The closest alternative is the J-1 Exchange Visitor Program (e.g., Summer Work Travel for university students), which requires a designated sponsor.");
      w.push("The State Department's directory of nonimmigrant visa categories has no working holiday category: the exchange visitor route is category J.");
      w.push("Always verify with travel.state.gov.");
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
      w.push("You need a Form I-20 issued by a SEVP-approved school, the SEVIS fee, and a consular interview.");
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
      w.push("Most US work visas (e.g., H-1B) require employer sponsorship and are subject to caps or lotteries.");
      finReq("You may need to show sufficient funds. Check official US work visa requirements.", w);
      var r = visaResult("work", Math.min(score, 60), m, w, x);
      r.officialName = "Employment visas (sponsorship)"; r.route = "us_work";
      return r;
    },

    digital_nomad: function (p) {
      var m = [], w = [], x = [];
      w.push("The USA does not offer a digital nomad visa; working remotely while on a visitor status is restricted.");
      w.push("The State Department's directory of nonimmigrant visa categories does not list any digital nomad category.");
      /* La propia fuente avisa de que su tabla no es exhaustiva, así que la app
         dice «el directorio no la recoge», no «no existe en ninguna norma». */
      w.push("That directory itself notes it lists almost all categories, so check travel.state.gov for your exact situation.");
      var r = visaResult("digital_nomad", 8, m, w, x);
      r.officialName = "No digital nomad visa"; r.route = "us_no_dnv";
      return r;
    },
  };

  /* Lista CERRADA de nacionalidades admitidas al estatus de nómada digital de
     Japón. Fuente literal: PDF de la Agencia de Servicios de Inmigración
     (moj.go.jp/isa/content/001416932.pdf), columna «Designated Activities
     (for Digital Nomad)». La segunda columna del PDF, más larga, es la de
     cónyuges e hijos y NO se usa aquí. Capturado el 3-ago-2026. */
  var JP_NOMADA = {};
  ("AU AT BE BR BN BG CA CL HR CZ DK EE FI FR DE GR HK HU IS ID IE IL IT LV LT LU MY MX NL NZ " +
   "NO PE PL PT QA KR RO RS SG SK SI ES SE CH TW TH TR AE GB US UY")
    .split(" ").forEach(function (i) { JP_NOMADA[i] = 1; });

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
        if (JP_EXEMPT_PASAPORTE_ESPECIAL[nat]) { w.push(JP_EXEMPT_PASAPORTE_ESPECIAL[nat]); }
        if (inList(JP_EXEMPT_6M, nat)) {
          m.push("Your nationality has a bilateral arrangement allowing stays of up to 6 months; to stay beyond 90 days you must request an extension from the Ministry of Justice before your permitted stay expires.");
        }
      } else {
        score += 10;
        w.push("A short-term visa is likely required for your nationality. Check the Japanese embassy or consulate in your country.");
        x.push("passport");
      }
      w.push("You cannot work during a short-term stay; paid activities are not allowed.");
      finReq("You may need to show sufficient funds for your stay and onward travel.", w);
      w.push("Always verify with the Ministry of Foreign Affairs of Japan.");
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
      w.push("Verify current conditions with the Japanese embassy or consulate in your country.");
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
      w.push("A Certificate of Eligibility (COE) sponsored by the receiving institution is required before the visa.");
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
      /* v1.149.0 — AUDITADA. Fuente: Ministerio de Asuntos Exteriores de Japón
         (mofa.go.jp/j_info/visit/visa/long/visa1.html), capturada con navegador
         real el 3-ago-2026. Snapshot: snapshots/jp-trabajo-2026-08/
         Matiz que la app no daba: SE PUEDE solicitar sin COE, pero entonces hay
         que aportar muchísima documentación y tarda meses. */
      m.push("Japan's working visa covers eleven categories, from professor, researcher and instructor to business manager, medical and legal services, journalist, artist and nursing care.");
      m.push("The period of stay is 5 years, 3 years, 1 year or 3 months, and for business manager there is also a 4-month option.");
      w.push("Japanese work visas require employer sponsorship and a Certificate of Eligibility (COE), issued by a regional immigration bureau before the visa application.");
      w.push("A Certificate of Eligibility does not guarantee that the visa will be issued.");
      w.push("You can apply without a Certificate of Eligibility, but then you must submit a large amount of verification documents and it can take several months.");
      w.push("A proxy in Japan can apply for the Certificate of Eligibility on your behalf.");
      if (p.nationality === "RU" || p.nationality === "GE") {
        w.push("Nationals of Russia, CIS countries and Georgia must submit two application forms and two photographs instead of one.");
      }
      w.push("Always verify with Japan's Ministry of Foreign Affairs (mofa.go.jp) and the Immigration Services Agency.");
      finReq("You may need to show sufficient funds. Check official Japanese work visa requirements.", w);
      var r = visaResult("work", score, m, w, x);
      r.officialName = "Japan Work Visa (COE)"; r.route = "jp_work";
      return r;
    },

    /* ── Nómada digital japonés: AUDITADO (v1.129.0) ───────────────────────
       Fuentes: mofa.go.jp (Asuntos Exteriores, página de 31-mar-2024) y el PDF
       de la Agencia de Servicios de Inmigración con la lista de nacionalidades.
       Capturado el 3-ago-2026 (mofa.go.jp devuelve 403 al robot).
       Snapshot: snapshots/ca-jp-verificacion-2026-08/
       Lo decisivo: la lista es CERRADA. Fuera de ella no hay ruta, y antes la
       app no lo decía. */
    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 0;
      function jpDnv(sc) {
        var r = visaResult("digital_nomad", sc, m, w, x);
        r.officialName = "Japan Digital Nomad (designated activities)"; r.route = "jp_digital_nomad";
        return r;
      }
      if (!JP_NOMADA[p.nationality]) {
        w.push("Japan's digital nomad status is limited to a closed list of countries and regions, and your nationality is not on it.");
        w.push("Always verify with Japan's Ministry of Foreign Affairs (mofa.go.jp) and the Immigration Services Agency.");
        x.push("passport");
        return jpDnv(8);
      }
      m.push("Your nationality is on Japan's closed list of countries and regions eligible for the digital nomad status.");
      score += 26;
      if (!p.remoteWork) {
        w.push("Japan's digital nomad status is for individuals wishing to work remotely in Japan, and your profile does not indicate remote work.");
        x.push("remote");
      } else {
        score += 24; m.push("Your profile indicates remote work, which is the primary condition for this route.");
      }
      w.push("The period of stay is 6 months and no extension will be granted.");
      w.push("You must prove an annual income of 10 million yen or more.");
      w.push("You must hold insurance covering death, injury or illness in Japan, with medical cover of 10 million yen or more.");
      m.push("A spouse or child may accompany you for the same period, under their own designated activities status.");
      w.push("Always verify with Japan's Ministry of Foreign Affairs (mofa.go.jp) and the Immigration Services Agency.");
      return jpDnv(clamp(score, 0, 62));
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
      w.push("Always verify with the official K-ETA portal (k-eta.go.kr).");
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
      finReq("You may need to show a return ticket (or funds to buy one) and reasonable funds for your initial stay.", w);
      w.push("Verify current conditions with the Korean embassy or consulate in your country.");
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
      w.push("Admission to a Korean educational institution is required before the visa.");
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
    work: function (p) {
      var r = mercosurWork("AR", p);
      /* v1.136.0 — AUDITADO. Misma fuente. La vía general (no Mercosur) exige
         un PRE-CONTRATO con firmas certificadas: es lo que más sorprende. */
      var uno = Array.isArray(r) ? r[0] : r;
      uno.matched = (uno.matched || []).concat([
        "Argentina's migrant worker temporary residence is for people hired for a lawful, paid activity under an employment relationship."]);
      uno.warnings = (uno.warnings || []).concat([
        "You need a pre-contract signed by both parties stating the tasks, working hours, duration of the employment relationship, workplace address and pay, which must match the collective agreement for the activity.",
        "The signatures must be certified by a notary or before an officer of the Dirección Nacional de Migraciones when you file.",
        "The employer's CUIT tax number must appear in the pre-contract.",
        "You need a valid passport, proof of address and a regular entry into the country.",
        "The Argentine criminal record certificate is pulled automatically through the Radex system: you do not have to obtain it separately.",
        "You also need a criminal record certificate from every country where you lived more than one year during the last three years, if you are over 16.",
        "Always verify with Argentina's Dirección Nacional de Migraciones (argentina.gob.ar)."]);
      uno.officialName = "Argentina residencia temporaria como trabajador migrante (Ley 25.871, art. 23.a)";
      uno.route = "ar_work_temporaria";
      return r;
    },

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
      w.push("Always verify with the Dirección Nacional de Migraciones (migraciones.gob.ar).");
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
      w.push("Requirements vary by bilateral agreement - check the procedure for your nationality on cancilleria.gob.ar.");
      finReq("You may need a return ticket (or funds to buy one), medical insurance covering the stay, and funds for your initial expenses.", w);
      w.push("Meeting the requirements does not guarantee the visa; approval is a prerogative of the Argentine State.");
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
      /* v1.136.0 — AUDITADO. Fuente: Dirección Nacional de Migraciones
         (argentina.gob.ar), capturado con navegador real el 3-ago-2026.
         Snapshot: snapshots/ar-verificacion-2026-08/ */
      m.push("Argentina's student temporary residence covers secondary, tertiary, university or recognised specialised studies as a regular student at an officially recognised institution.");
      w.push("You register as a regular student and present the electronic enrolment certificate (Constancia de Inscripción Electrónica).");
      w.push("You need a valid passport, proof of address and a regular entry into the country.");
      w.push("The Argentine criminal record certificate is pulled automatically through the Radex system: you do not have to obtain it separately.");
      w.push("You also need a criminal record certificate from every country where you lived more than one year during the last three years, if you are over 16.");
      finReq("You may need to show sufficient funds for tuition and living costs. Check official Argentine migration requirements.", w);
      w.push("Always verify with Argentina's Dirección Nacional de Migraciones (argentina.gob.ar).");
      var r = visaResult("student", Math.min(score, 64), m, w, x);
      r.officialName = "Argentina residencia temporaria como estudiante (Ley 25.871, art. 23.j)"; r.route = "ar_student";
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
      w.push("Verify current conditions with the Dirección Nacional de Migraciones.");
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
      w.push("Always verify with the Instituto Nacional de Migración (inm.gob.mx).");
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
        /* v1.131.0 — AUDITADA. Fuente: red consular de la Secretaría de
           Relaciones Exteriores (capturado con navegador real el 3-ago-2026).
           Snapshot: snapshots/mx-visitante-2026-08/ */
        vm.push("This visitor condition covers tourism, transit, business meetings, technical work under 180 days, medical treatment, fairs and conferences, and even studies of less than 180 days.");
        vw.push("You do not need this visa if you already hold a valid multiple-entry visa for the United States, Canada, Japan, the United Kingdom or any Schengen country.");
        vw.push("You also do not need it if you hold permanent residence in those countries or in the Pacific Alliance members: Chile, Colombia and Peru.");
        vw.push("You must prove economic solvency or ties, through bank statements, employment or pension income over the last three months, or property and a stable job.");
        vw.push("The exact amounts are set by each consulate in its local currency, so check the one that covers your place of residence.");
        vw.push("Always verify with Mexico's Ministry of Foreign Affairs consular network (sre.gob.mx).");
        var consular = visaResult("tourist", 52, vm, vw, []);
        consular.officialName = "Mexico Visitor Visa (visa de visitante sin permiso para realizar actividades remuneradas)";
        consular.route = "mx_tourist_visa";
        cards.push(consular);
      }

      return cards;
    },

    work_and_holiday: function (p) {
      var m = [], w = [], x = [], score = 5;
      /* v1.159.0 — antes decía «México no tiene programa de vacaciones y
         trabajo», una negativa absoluta sin nada detrás. Ahora se dice lo que
         el INM sí publica —su catálogo de condiciones de estancia— y se deja
         que el lector saque la conclusión, igual que en el resto de tarjetas
         honestas del proyecto. */
      w.push("Mexico's migration institute publishes its conditions of stay and none of them is a working holiday programme.");
      w.push("Always verify with Mexico's Instituto Nacional de Migración (inm.gob.mx).");
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
            /* v1.148.0 — AUDITADA. Fuente: red consular de la SRE, ficha «Visa de
         Residente Temporal Estudiante» («Última actualización: 11 Agosto
         2025»), capturada con navegador real el 3-ago-2026.
         Snapshot: snapshots/nz-mx-2026-08/
         La buena noticia que la app no daba: siendo residente temporal
         estudiante PUEDES pedir permiso para trabajar. */
      m.push("As a temporary resident student you can ask the Instituto Nacional de Migración for authorisation to carry out paid activities in Mexico.");
      w.push("Your funds can be proved by you, by your parents or guardian if you are under twenty-five, by a scholarship letter from the institution, or by a bank or financial document showing the funding.");
      w.push("Once in Mexico you have 30 calendar days from entry to apply for the temporary resident student card.");
      w.push("The visa fee is 54 US dollars, and the appointment is booked through the MiConsulado portal.");
      w.push("Holding the visa does not guarantee entry: it only lets you present yourself at the border, where officers may interview you about your trip.");
      w.push("Always verify with Mexico's Ministry of Foreign Affairs consular network (sre.gob.mx).");
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
        x.push("passport");
      }
      w.push("Thailand approved changes to its visa exemption scheme in May 2026 (reducing stays for many nationalities); the change was pending official publication at capture time - verify before travelling.");
      w.push("You cannot work during a visa-exempt stay; paid activities are not allowed.");
      finReq("You may need to show sufficient funds for your stay and onward travel.", w);
      w.push("Always verify with the Ministry of Foreign Affairs of Thailand (mfa.go.th).");
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
      /* v1.146.0 — AUDITADA. Fuente: portal oficial de e-Visa del Ministerio de
         Asuntos Exteriores de Tailandia (thaievisa.go.th), capturado con
         navegador real el 3-ago-2026. Snapshot: snapshots/th-2026-08/ */
      tr.matched = (tr.matched || []).concat([
        "The tourist visa also covers MICE events supported by the Thailand Convention Exhibition Bureau, recreational training such as scuba diving, boxing, Thai massage or culinary courses, visiting family for under 60 days, medical treatment and football trials."]);
      tr.warnings = (tr.warnings || []).filter(function (t) {
        return !/could not be verified against a captured official source/.test(t);
      }).concat([
        "You can only apply for the e-Visa if you are currently outside Thailand.",
        "Applicants no longer submit passports and documents in person at the embassy or consulate.",
        "Always verify with the Thai e-Visa portal of the Ministry of Foreign Affairs (thaievisa.go.th)."]);
      tr.route = "th_tourist_tr";

      return [exemption, tr];
    },

    work_and_holiday: function (p) {
      var m = [], w = [], x = [], score = 5;
      w.push("Thailand does not operate a working holiday programme.");
      x.push("passport");
      /* v1.146.0 — la negativa deja de ser una afirmación suelta: el catálogo
         completo del portal oficial de e-Visa no tiene esa categoría.
         OJO: esto va ANTES de visaResult, que copia los arrays. */
      w.push("Thailand's official e-Visa portal publishes eighteen visa categories, from tourist and business to SMART, LTR and DTV, and none of them is a working holiday.");
      w.push("Always verify with the Thai e-Visa portal of the Ministry of Foreign Affairs (thaievisa.go.th).");
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
      /* v1.146.0 — AUDITADA. Misma fuente. Lo útil: la ED no es una sola cosa,
         son ocho supuestos distintos, y uno de ellos son los cursos cortos.
         OJO: esto va ANTES de visaResult, que copia los arrays. */
      m.push("Thailand's studying visas cover eight different situations, from elementary and secondary school to a bachelor's degree or higher.");
      w.push("They also cover short courses of Thai or English, Muaythai training, curricular internships and exchange students, and vocational or technical diplomas below bachelor level.");
      w.push("You can only apply for the e-Visa if you are currently outside Thailand.");
      w.push("Always verify with the Thai e-Visa portal of the Ministry of Foreign Affairs (thaievisa.go.th).");
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
      /* v1.115.0 — EL DINERO DEJA DE PUNTUAR Y DEJA DE AFIRMARSE.
         El cuestionario NO pregunta por ahorros: ui/App.jsx fijaba savings=15000
         en duro, así que la app le decía a TODO usuario que cumplía requisitos
         financieros que nunca había declarado, y esos puntos falsos le movían de
         banda. El umbral oficial se mantiene, pero como información. */
      score = 55;
      w.push("You need a bank statement for the last 3 months with an ending balance of no less than 500,000 THB.");
      w.push("You must show proof of salary or monthly income for the last 6 months, plus an employment contract or certificate authenticated by an embassy.");
      w.push("Proof of prolonged residence in Thailand for at least 6 months (such as a rental agreement) is required.");
      w.push("Your passport must be valid within 6 months from the travel date.");
      w.push("Approval is always a prerogative of the Thai authorities.");
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
      /* v1.115.0 — EL DINERO DEJA DE PUNTUAR Y DEJA DE AFIRMARSE.
         El cuestionario NO pregunta por ahorros: ui/App.jsx fijaba savings=15000
         en duro, así que la app le decía a TODO usuario que cumplía requisitos
         financieros que nunca había declarado, y esos puntos falsos le movían de
         banda. El umbral oficial se mantiene, pero como información. */
      var score = 55;
      w.push("You need a salary certificate of a minimum of 3,500 US dollars per month (or equivalent).");
      w.push("You must provide a copy of health insurance and a medical fitness test result.");
      w.push("Applications go to the federal ICP or to GDRFA Dubai.");
      w.push("Approval is always a prerogative of the UAE authorities.");
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

  /* v1.115.0 — TARJETA DE TRABAJO RESTAURADA. data/mock.js declara `work` para
     Singapur, pero COUNTRY_RULES.SG no lo declaraba y esta lista MANDA sobre
     mock.js: quien filtraba por "Trabajo" no veía NADA de Singapur. Es la misma
     trampa que borró la tarjeta de Argentina (corregida en v1.104.0). Se
     restaura por la vía modelada y honesta, sin inventar requisitos. */
  COUNTRY_RULES.SG = {
    work: function (p) { return genericDe("SG", "work", p); },

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
      }
      w.push("The period of stay is determined by the Visit Pass (e-Pass) granted electronically at the checkpoint, not by the visa.");
      w.push("You must submit the SG Arrival Card before entry; it is not a visa.");
      w.push("You cannot work during a visitor stay; paid activities are not allowed.");
      finReq("You may need to show sufficient funds for your stay and onward travel.", w);
      w.push("Always verify with the Immigration & Checkpoints Authority (ica.gov.sg).");
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
      w.push("The pass allows work and holiday in Singapore for up to 6 months.");
      w.push("The Work Holiday Programme has a capacity of 2,000 pass holders at any one time.");
      finReq("You may need to show proof of university enrolment or graduation and residence requirements.", w);
      w.push("Verify current conditions with the Ministry of Manpower (mom.gov.sg).");
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
  /* ── SINGAPUR: el Employment Pass y sus dos puertas (v1.147.0) ───────────
     Fuente: Ministry of Manpower (mom.gov.sg), capturado con navegador real el
     3-ago-2026. Snapshot: snapshots/sg-br-2026-08/
     Lo que hay que entender: son DOS filtros seguidos, y el primero es
     eliminatorio — si no llegas al salario, los puntos no te salvan. */
  COUNTRY_RULES.SG.work = (function (base) {
    return function (p) {
      var r = base(p);
      var uno = Array.isArray(r) ? r[0] : r;
      if (!uno.route) { uno.officialName = "Singapore Employment Pass (EP)"; uno.route = "sg_work_ep"; }
      uno.matched = (uno.matched || []).concat([
        "Singapore's Employment Pass has a two-stage framework: first the qualifying salary, then the points-based COMPASS."]);
      uno.warnings = (uno.warnings || []).concat([
        "If you do not meet the salary stage you are not eligible, no matter how many COMPASS points you would have scored.",
        "The qualifying salary is currently 5,600 dollars a month outside financial services and 6,200 inside it, and it rises with age up to 10,700 and 11,800 at 45 or over.",
        "From 1 January 2027 those minimums go up to 6,000 and 6,600, and up to 11,500 and 12,700 at 45 or over.",
        "COMPASS needs 40 points, scored on salary, qualifications, diversity, support for local employment, a shortage-occupation bonus and a strategic-priorities bonus.",
        "You are exempt from COMPASS with a fixed monthly salary of at least 22,500 dollars, as an overseas intra-corporate transferee, or for a role of one month or less.",
        "Your employer must also meet the Fair Consideration Framework job advertising requirement before applying.",
        "Always verify with Singapore's Ministry of Manpower (mom.gov.sg)."]);
      return r;
    };
  })(COUNTRY_RULES.SG.work);


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
  /* v1.133.0 — CHIPRE faltaba en esta lista. Era el ÚNICO país de la UE/EEE que
     el motor no sabía evaluar: quien lo pinchaba en el mapa recibía el trato de
     «país sin datos», aunque un ciudadano europeo tiene allí libre circulación
     igual que en los otros 26. Es miembro de la UE desde 2004. */
  /* ── NÓMADAS DIGITALES EUROPEOS CON FUENTE PROPIA (v1.134.0) ─────────────
     La fábrica genérica decía «National remote-work provisions (unverified)»
     para TODOS. Pero varios de estos países SÍ publican un programa. Aquí van
     los capturados con navegador real el 3-ago-2026.
     Snapshot: snapshots/nomadas-ue-2026-08/ */
  /* Lista CERRADA de nacionalidades admitidas al programa checo de nómadas
     digitales. Fuente literal: PDF oficial del Ministerio de Industria y
     Comercio (mpo.gov.cz), capturado el 3-ago-2026. */
  var CZ_NOMADA = {};
  ("AU BR IL JP CA KR MX NZ SG GB US TW").split(" ").forEach(function (i) { CZ_NOMADA[i] = 1; });

  var NOMADA_UE = {
    HR: {
      nombre: "Croatia temporary stay of digital nomads",
      ruta: "hr_digital_nomad",
      m: ["Croatia grants a temporary stay for digital nomads: third-country nationals who work through communication technology for a company that is not registered in Croatia.",
          "The stay is granted for up to eighteen months.",
          "Close family members can join you through family reunification."],
      w: ["You cannot work for or provide services to employers in Croatia.",
          "You must show at least 2.5 average monthly net salaries: currently a minimum of 3,622.50 euros a month, or 43,470 euros in the bank for a twelve-month stay.",
          "That amount rises by 10% of the average net salary for each additional family member.",
          "Once the stay expires you must wait six months before applying again.",
          "Always verify with Croatia's Ministry of the Interior (mup.gov.hr)."]
    },
    MT: {
      nombre: "Malta Nomad Residence Permit",
      ruta: "mt_nomad_residence",
      m: ["Malta issues a Nomad Residence Permit for third-country nationals who work remotely using telecommunications.",
          "It covers employees of a foreign employer, partners or shareholders of a foreign company, and freelancers with foreign clients.",
          "The permit is issued for one year and can be renewed at the agency's discretion."],
      w: ["You must have a minimum gross yearly income of 42,000 euros.",
          "You need health insurance covering the European Union and the United Kingdom, a rental or purchase agreement, a police conduct certificate and a background check.",
          "If you are contracted by a foreign company but give services to its Maltese subsidiary you are not eligible.",
          "Always verify with Residency Malta (residencymalta.gov.mt)."]
    },
    SI: {
      nombre: "Slovenia temporary residence permit for digital nomads",
      ruta: "si_digital_nomad",
      m: ["Slovenia introduced a temporary residence permit for digital nomads on 21 November 2025.",
          "It is for non-EU and non-EEA citizens who work remotely for a business based outside Slovenia, or as self-employed abroad.",
          "Because you are not entering the Slovenian labour market, you do not need the work permit the Employment Service normally issues.",
          "Family reunification is more favourable here: you can bring your family immediately, with no waiting period tied to how long you have lived there."],
      w: ["It is issued for up to one year and cannot be extended.",
          "You can reapply six months after the previous permit expires.",
          "If you decide to stay on — for example to take a job in Slovenia — you can apply at any time during its validity for a different type of permit.",
          "You must show monthly funds of at least twice the average monthly net salary in Slovenia.",
          "You apply at a Slovenian embassy or consulate abroad, or at any administrative unit if you already live there legally.",
          "Always verify with Slovenia's government portal (gov.si)."]
    },
    LV: {
      nombre: "Latvia long-stay visa for remote work",
      ruta: "lv_remote_work",
      m: ["Latvia issues a one-year long-stay visa for remote work to people employed by, or self-employed and registered in, an OECD member state, who can do their job from Latvia."],
      w: ["Your employer must certify at least six months of previous employment with them, and that you can work remotely.",
          "The income must be at least 2.5 times the previous year's average monthly gross salary: 4,213 euros according to the figure published by the Central Statistical Office.",
          "You need health insurance valid in Latvia and the Schengen states.",
          "Holders of this visa have NO right to employment in Latvia.",
          "Always verify with Latvia's Office of Citizenship and Migration Affairs (pmlp.gov.lv)."]
    },
    HU: {
      nombre: "Hungary White Card (residency for digital nomads)",
      ruta: "hu_white_card",
      m: ["Hungary's White Card is for people with a verified employment relationship in another country, or a share in a company with verified profit abroad, who do the work from Hungary using digital technology.",
          "It is issued for a year and can be extended once for another year."],
      w: ["It is granted only to people who pursue no gainful activity in Hungary and hold no share in a Hungarian company.",
          "You must show a monthly legal income of at least 3,000 euros net for the six months before entry.",
          "It is not granted if you qualify for other Hungarian permits, nor to students, posted workers, intra-corporate transfers or highly qualified workers admitted as such.",
          "Always verify with Hungary's Directorate-General for Aliens Policing (oif.gov.hu)."]
    },
    CZ: {
      nombre: "Czechia Digital Nomad Program (long-stay visa)",
      ruta: "cz_digital_nomad",
      m: ["Czechia runs a government-approved Digital Nomad Program for highly skilled IT and marketing specialists working remotely for a foreign employer or as self-employed.",
          "Your spouse, registered partner and dependent children can apply for a residence permit together with you."],
      w: ["The programme is limited to a closed list of twelve nationalities: Australia, Brazil, Israel, Japan, Canada, South Korea, Mexico, New Zealand, Singapore, the United Kingdom, the United States and Taiwan.",
          "You must not hold, and must not have held in the previous year, a Czech long-term visa or long-term residence permit.",
          "As an employee, your foreign employer must have at least 50 employees worldwide and remote work must be written into your contract or certified by the employer.",
          "You must prove income of at least 1.5 times the average gross annual salary published by the Ministry of Labour and Social Affairs.",
          "IT specialists need STEM higher education or three years of proven IT experience; marketing specialists need at least three years of higher education in marketing, advertising or a related field.",
          "Always verify with Czechia's Ministry of Industry and Trade (mpo.gov.cz)."]
    },
    GR: {
      nombre: "Greece Digital Nomad Visa",
      ruta: "gr_digital_nomad",
      m: ["Greece publishes a Digital Nomad Visa that lets non-European professionals obtain a residence permit."],
      w: ["Wayfare could not capture the income threshold or the detailed conditions from an official page: check them before you rely on this route.",
          "Always verify with Greece's Ministry of Foreign Affairs (mfa.gr)."]
    }
  };

  var EU_SCHENGEN_SHARED = ["AT","BE","BG","CH","CY","CZ","DE","DK","EE","FI","FR","GR","HR","HU",
    "IS","IT","LI","LT","LU","LV","MT","NL","NO","PL","RO","SE","SI","SK"];

  /* v1.128.0 — Suiza no está en la lista UE/EEE, y hasta hoy un suizo que
     miraba Alemania leía «necesitas visa de trabajo con patrocinio»: falso.
     El Acuerdo CE-Suiza de libre circulación de personas le da los mismos
     derechos de entrada, residencia y trabajo. Fuente: EUR-Lex, resumen oficial
     del Acuerdo (eur-lex.europa.eu, capturado el 3-ago-2026). */
  /* v1.133.0 — DERECHO EUROPEO PARA EXTRACOMUNITARIOS ─────────────────────
     Dos directivas fijan reglas mínimas comunes en todos los Estados miembros,
     así que una sola fuente vale para todos los destinos de la UE:
       · Directiva (UE) 2016/801 — estudiantes e investigadores
       · Directiva (UE) 2024/1233 — permiso único de residencia y trabajo
         (se aplica desde el 22-mayo-2026 y deroga la 2011/98/UE)
     Fuente: resúmenes oficiales de EUR-Lex, capturados el 3-ago-2026.
     Snapshot: snapshots/ue-extracomunitarios-2026-08/

     OJO CON DOS COSAS:
     1) Islandia, Liechtenstein, Noruega y Suiza NO están vinculados: no son
        Estados miembros de la UE.
     2) Cita literal del propio resumen: «The directive does not apply in either
        Denmark or Ireland». Dinamarca e Irlanda tienen exclusión voluntaria, así
        que la app no les aplica el permiso único. */
  var UE_MIEMBROS = {};
  ("AT BE BG CY CZ DE DK EE ES FI FR GR HR HU IE IT LT LU LV MT NL PL PT RO SE SI SK")
    .split(" ").forEach(function (i) { UE_MIEMBROS[i] = 1; });
  /* Vinculados por las directivas de migración: los 27 menos Dinamarca e Irlanda. */
  function vinculadoDirectivas(iso) {
    return !!UE_MIEMBROS[iso] && iso !== "DK" && iso !== "IE";
  }

  function libreCirculacionUE(nat) {
    return inList(PASSPORT.euEea, nat) || nat === "CH";
  }

  function makeSchengenRules(iso) {
    var slug = iso.toLowerCase();
    return {
      tourist: function (p) {
        var r = COUNTRY_RULES.ES.tourist(p);   /* regla Schengen auditada compartida */
        r.type = "tourist";
        /* =================================================================
           v1.159.0 — CHIPRE NO ESTÁ EN EL ESPACIO SCHENGEN, y esta tarjeta le
           decía a un visitante que entra con la regla 90/180. Es falso, y del
           tipo de falso que hace que alguien planifique mal un viaje.
           Chipre entró en esta lista en v1.133.0 por un motivo correcto —era el
           único país UE/EEE que el motor no sabía evaluar, y un europeo tiene
           allí libre circulación— pero la lista se usa para DOS cosas distintas:
           libre circulación (cierto para Chipre) y régimen de visado Schengen
           (falso para Chipre). Se separan aquí.
           Fuente: Comisión Europea, home-affairs.ec.europa.eu, página del
           espacio Schengen fechada el 27-may-2025.
           Snapshot: snapshots/cy-ie-schengen-2026-08/ ===================== */
        if (slug === "cy") {
          /* Se retira TODA la redacción Schengen heredada: no solo la regla
             90/180, también los avisos de «visa Schengen» y sus requisitos,
             que en Chipre no deciden la entrada y se contradirían con lo que
             la tarjeta pasa a decir. */
          var fueraSchengen = function (t) { return !/Schengen/.test(t); };
          var mC = (r.matched  || []).filter(fueraSchengen);
          var wC = (r.warnings || []).filter(fueraSchengen);
          /* el hecho primero, la consecuencia después: dos unshift seguidos las
             dejaban al revés y la tarjeta empezaba por «Así que…» */
          wC.unshift("So the 90/180 Schengen clock does not run here, and a Schengen visa alone does not decide your entry: Cyprus applies its own rules.");
          wC.unshift("Cyprus participates in Schengen cooperation, but the Council has not yet abolished its internal border controls: its integration into the Schengen area is still underway.");
          wC.push("Always verify with the Republic of Cyprus before you travel.");
          var rC = visaResult("tourist", Math.min(r.score, 46), mC, wC, r.missing || []);
          rC.officialName = "Cyprus short stay (outside the Schengen area)";
          rC.route = "cy_short_stay";
          return rC;
        }
        r.officialName = "Schengen short stay (90/180)";
        r.route = slug + "_schengen_visit";
        return r;
      },
      work: function (p) {
        var m = [], w = [], x = [], score = 0, nat = p.nationality, esUE = false;
        if (libreCirculacionUE(nat)) {
          /* v1.128.0 — rama UE con fuente propia: europa.eu (Your Europe, portal
             oficial de la Comisión Europea, «Workers - residence rights»,
             última revisión 1-jul-2026). Una sola fuente vale para TODOS los
             destinos de la UE/EEE porque el derecho es europeo, no nacional. */
          score += 50; m.push("EU/EEA citizens can work in this destination under freedom of movement.");
          if (nat === "CH") m.push("Under the EU-Switzerland agreement, EU and Swiss nationals enjoy reciprocal rights of entry, residence, access to paid work and establishment on a self-employed basis.");
          m.push("You have the right to live in any EU country where you work as an employee, a self-employed person or a posted worker.");
          w.push("After the first three months you should register your residence with the local authority; you will need your ID or passport and a certificate of employment or proof of self-employment, and nothing else.");
          w.push("Some EU countries also require you to report your presence shortly after arrival, and may fine you if you do not.");
          w.push("If you lose your job you can still stay if you are temporarily unable to work, registered as involuntarily unemployed, or in vocational training.");
          m.push("After five continuous years meeting the conditions you automatically acquire the right of permanent residence.");
          w.push("Always verify with Your Europe, the official EU portal (europa.eu/youreurope).");
          esUE = true;
        } else if (passportTier(nat) <= 2) {
          score += 14; w.push("A work visa with employer sponsorship is required for non-EU nationals."); x.push("passport");
        } else {
          score += 6; w.push("A work visa is required. Conditions vary significantly by nationality."); x.push("passport");
        }
        score += scoreEdu(p, "university_plus", 28);
        if (eduRank(p.education) < eduRank("university_plus")) { x.push("minEdu"); }
        else { m.push("Your education level appears to meet typical requirements."); }
        score += scoreEng(p, "intermediate", 16);
        if (!esUE) {
          finReq("You may need to show sufficient funds. Check official work visa requirements for this destination.", w);
          if (vinculadoDirectivas(iso)) {
            /* Reglas mínimas comunes de la Directiva (UE) 2024/1233. */
            m.push("EU law gives you a single permit covering both residence and work, applied for in one procedure.");
            m.push("The authority must decide within 90 days of a complete application, with up to 30 extra days for complex cases.");
            m.push("You may change employer while the permit is valid, under certain conditions.");
            m.push("If you lose your job you can stay at least three months, or at least six if you have held the permit for more than two years.");
            m.push("You are entitled to equal treatment with nationals on pay, working hours, leave, health and safety, and the right to strike.");
            w.push("A rejection must be explained in writing and must tell you where and by when you can appeal.");
            w.push("These are the EU minimums: you still need an employer and the national conditions, which Wayfare has not captured for this destination yet.");
          } else {
            w.push("Non-EU work permits typically require employer sponsorship. Simulated guidance only.");
          }
        }
        var r = visaResult("work", score, m, w, x);
        r.officialName = esUE ? "EU freedom of movement: no work permit needed"
          : (vinculadoDirectivas(iso) ? "EU single permit for residence and work" : "National work permit");
        r.route = esUE ? "eu_fom_work" : (vinculadoDirectivas(iso) ? "eu_single_permit" : (slug + "_work"));
        return r;
      },
      student: function (p) {
        var m = [], w = [], x = [], score = 0, nat = p.nationality, esUEest = false;
        if (libreCirculacionUE(nat)) {
          /* v1.128.0 — rama UE con fuente propia: europa.eu (Your Europe,
             «Students - residence rights», última revisión 12-may-2025). */
          score += 22; m.push("EU/EEA citizens face minimal visa barriers for studying in this destination.");
          if (nat === "CH") m.push("Under the EU-Switzerland agreement, EU and Swiss nationals enjoy reciprocal rights of entry, residence, access to paid work and establishment on a self-employed basis.");
          m.push("You have the right to live in the EU country where you are studying for as long as your studies last, if you are enrolled in an approved establishment, have enough income from any source, and hold comprehensive health insurance.");
          w.push("During your first three months the host country cannot require you to register your residence; after three months it may.");
          w.push("To register you need proof of enrolment, proof of comprehensive health insurance and a declaration of sufficient resources: no other documents can be demanded.");
          w.push("National authorities may not require your income to be above the level that would qualify you for basic income support.");
          w.push("You could lose the right to stay if you finish your studies and cannot show you are working or have enough resources.");
          w.push("Always verify with Your Europe, the official EU portal (europa.eu/youreurope).");
          esUEest = true;
        }
        else if (passportTier(nat) <= 2) { score += 16; m.push("Your passport nationality is generally accepted for student visa applications in this destination."); }
        else                              { score += 8;  w.push("Additional documentation requirements may apply for your passport nationality."); }
        /* v1.115.0 — antes: scoreEng(p, "basic", 14). En la escala interna
           "basic" es el nivel MÍNIMO (índice 0), así que la comprobación siempre
           pasaba y los 14 puntos se concedían igual. Se deja explícito: en estos
           destinos el inglés no diferencia (los cursos pueden impartirse en el
           idioma local). Si algún día se quiere puntuar, hay que elegir un umbral
           real, no "basic". */
        score += 14;   /* no depende del inglés: ver nota */
        score += scoreEdu(p, "secondary", 24);
        if (eduRank(p.education) < eduRank("secondary")) x.push("minEdu");
        else m.push("Your education level appears to meet general requirements.");
        score += scoreAge(p.age, 17, 65, 10);
        if (!esUEest) {
          finReq("You may need to show sufficient funds for tuition and living costs. Check official student visa requirements for this destination.", w);
          if (vinculadoDirectivas(iso)) {
            /* Reglas mínimas comunes de la Directiva (UE) 2016/801. */
            m.push("EU law sets minimum common rules for non-EU students: acceptance by a higher education institution, a valid travel document, proof of resources for subsistence and return travel, and health insurance.");
            m.push("EU countries cannot restrict your working hours alongside your studies to under 15 hours a week.");
            m.push("After finishing your studies you have the right to stay at least 9 months to look for work or set up a business.");
            w.push("The country must publish its entry and residence conditions, including the minimum amount of money required per month, and cannot charge disproportionate fees.");
            w.push("These are the EU minimums: each country adds its own conditions, which Wayfare has not captured for this destination yet.");
          } else {
            w.push("Enrollment acceptance from a recognised institution is required. National requirements have not been verified by Wayfare yet - simulated guidance only.");
          }
        }
        /* v1.115.0 — el tope de 68 existe porque no podemos evaluar la carta de
           admisión, pero un ciudadano de la UE/EEE NO necesita visado de
           estudios en otro país de la UE: para ese caso no se topa, igual que
           ya hacían España y Portugal. Antes, el mismo perfil europeo salía
           «podrías calificar» en España y «parcial» en Alemania. */
        var tope = libreCirculacionUE(nat) ? 100 : 68;
        var r = visaResult("student", Math.min(score, tope), m, w, x);
        r.officialName = esUEest ? "EU freedom of movement: no student visa needed"
          : (vinculadoDirectivas(iso) ? "EU student permit (Directive 2016/801 minimums)" : "National student visa");
        r.route = esUEest ? "eu_fom_study" : (vinculadoDirectivas(iso) ? "eu_student_directive" : (slug + "_study"));
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
        /* v1.134.0 — si este país tiene programa capturado, se usa. */
        var cfgN = NOMADA_UE[iso];
        if (cfgN && !libreCirculacionUE(p.nationality)) {
          /* Chequia limita su programa a doce nacionalidades: si la tuya no
             está, la tarjeta lo dice en vez de dar esperanzas. */
          if (iso === "CZ" && !CZ_NOMADA[p.nationality]) {
            var rCz = visaResult("digital_nomad", 10, [],
              ["Czechia's Digital Nomad Program is limited to a closed list of twelve nationalities, and yours is not on it.",
               "The list covers Australia, Brazil, Israel, Japan, Canada, South Korea, Mexico, New Zealand, Singapore, the United Kingdom, the United States and Taiwan.",
               "Always verify with Czechia's Ministry of Industry and Trade (mpo.gov.cz)."], ["passport"]);
            rCz.officialName = "Czechia Digital Nomad Program (long-stay visa)";
            rCz.route = "cz_digital_nomad";
            return rCz;
          }
          var mN = cfgN.m.slice(), wN = cfgN.w.slice(), xN = [], scN = 30;
          if (p.remoteWork) { scN += 28; mN.push("Your profile indicates remote work, which is the primary condition for this route."); }
          else { wN.push("This route is for people who work remotely, and your profile does not indicate remote work."); xN.push("remote"); }
          var rN = visaResult("digital_nomad", Math.min(scN, 72), mN, wN, xN);
          rN.officialName = cfgN.nombre; rN.route = cfgN.ruta;
          return rN;
        }
        var m = [], w = [], x = [], score = 0, nat = p.nationality;
        function dnv(sc) {
          var r = visaResult("digital_nomad", sc, m, w, x);
          r.officialName = "National remote-work provisions (unverified)"; r.route = slug + "_dnv";
          return r;
        }
        if (inList(PASSPORT.euEea, nat)) {
          m.push("As an EU/EEA citizen, you can live and work in this destination under freedom of movement.");
          w.push("EU freedom of movement rules apply. No Digital Nomad Visa is required.");
          /* v1.153.0 — ESTA TARJETA SE DESMENTÍA A SÍ MISMA. Heredaba el nombre
             genérico «National remote-work provisions (unverified)», así que la
             app le ponía encima «sin fuente oficial capturada» y aun así la
             puntuaba 82. Pero lo que dice —que un ciudadano UE/EEE no necesita
             visado de nómada— es libre circulación, está auditado, y sus dos
             tarjetas hermanas (trabajo y estudios) ya lo dicen con todas las
             letras. Solo cambia el rótulo: el contenido y la puntuación son los
             mismos que antes. */
          var rUE = visaResult("digital_nomad", 82, m, w, x);
          rUE.officialName = "EU freedom of movement: no digital nomad visa needed";
          rUE.route = "eu_fom_digital_nomad";   /* compartida, como eu_fom_work y eu_fom_study */
          return rUE;
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

  /* ═══════════════════════════════════════════════════════════════════════
     NORTE DE CHIPRE (XNC) — AVISO, NO DESTINO. v1.164.0
     ───────────────────────────────────────────────────────────────────────
     Hasta hoy este territorio heredaba el código CY, así que quien lo pinchaba
     en el mapa recibía las normas de la República de Chipre, incluido un
     permiso de estudios europeo con nota 56. Eso no es un matiz geográfico:
     la República de Chipre publica que entrar por los puertos y aeropuertos de
     esa zona ES ILEGAL a sus efectos, y advierte de que allí operan
     «universidades» sin acreditar que los traficantes anuncian como vía fácil
     de migración a la UE vendiendo «visados de estudiante».

     O sea, la app orientaba hacia una ruta de trata documentada, y justo al
     perfil de persona que la usa. Es el fallo con peores consecuencias posibles
     de todos los encontrados, y el único donde el daño no sería un viaje mal
     planificado.

     Esta tarjeta NO evalúa elegibilidad: no hay nada que evaluar. Repite lo que
     la fuente oficial dice, atribuido, y no puntúa.
     Fuente: «Legal ports of entry in the Republic of Cyprus», organismo chipriota
     de acreditación de educación superior (dipae.ac.cy), capturado el 5-ago-2026.
     Snapshot: snapshots/cy-norte-2026-08/
     ═══════════════════════════════════════════════════════════════════════ */
  COUNTRY_RULES.XNC = {
    tourist: function (p) {
      var w = [
        "The Republic of Cyprus states that it does not exercise effective control in the northern part of the island, which has been under military occupation by Türkiye since 1974.",
        "It also states that the legal points of entry to the Republic are the airports of Larnaca and Paphos and the ports of Larnaca, Limassol, Latsi and Paphos, and that entry through any airport or port in the occupied area is illegal.",
        "Because it does not control the area, the Republic says it cannot guarantee the safety of visitors there, nor provide consular assistance.",
        "Wayfare does not assess eligibility here: there is no route to assess.",
      ];
      var r = {
        type: "tourist", score: null, status: "nodata",
        matched: [], warnings: w, missing: [],
      };
      r.officialName = "Northern Cyprus: not a route Wayfare can assess";
      r.route = "xnc_aviso";
      return r;
    },
    student: function (p) {
      var w = [
        "Be careful with study offers in the northern part of Cyprus. The Republic of Cyprus states that the institutions calling themselves universities there operate unlawfully, and are not accredited by its competent authorities.",
        "It warns that traffickers advertise this as an easy route of migration into the European Union, selling so-called student visas, and that this is not a legal way to enter Cyprus or the European Union.",
        "It adds that people who take that route often end up stranded there, or become victims of human trafficking.",
        "If someone is offering you a study place there as a way into Europe, check it with the Republic of Cyprus before paying anything.",
      ];
      var r = {
        type: "student", score: null, status: "nodata",
        matched: [], warnings: w, missing: [],
      };
      r.officialName = "Northern Cyprus: study offers carry an official warning";
      r.route = "xnc_estudios_aviso";
      return r;
    },
  };

  /* ── RUMANÍA: condiciones nacionales de estudios (v1.160.0) ──────────────
     La tarjeta rumana usaba los mínimos de la Directiva 2016/801 y decía
     expresamente que le faltaban las condiciones nacionales. Aquí entran, del
     Inspectorado General para Inmigración (igi.mai.gov.ro/en/studies).

     ⚠ CON UNA SALVEDAD QUE VA EN LA PROPIA TARJETA. El sitio inglés del IGI no
     se actualiza desde DICIEMBRE DE 2022: su última noticia es de entonces y
     los años que aparecen en portada son 2021 y 2022. Comprobar una página hoy
     no la hace actual — Wayfare mide cuándo la miramos nosotros, no cuándo la
     tocó el gobierno. Así que estos datos se dan citados y con su antigüedad
     declarada, que es la única forma honesta de usarlos.

     ⚠ Y POR EL MISMO MOTIVO NO se toca la tarjeta de nómada digital. Que el
     catálogo del IGI no mencione esa figura NO prueba que no exista: prueba que
     esa página no la menciona. Es la lección de Islandia (v1.158.0).
     Snapshot: snapshots/ro-estudios-2026-08/ */
  (function rumania() {
    var base = COUNTRY_RULES.RO;
    if (!base || !base.student) return;
    var baseStudent = base.student;
    COUNTRY_RULES.RO.student = function (p) {
      var r = baseStudent(p);
      /* Se pega SOLO a la tarjeta de tercer país. Al principio usé r[0], «la
         primera tarjeta», y los requisitos rumanos aterrizaron también en la de
         libre circulación: a un europeo, que no necesita este visado, se le
         decía que pagara un año de matrícula y presentara antecedentes. Es el
         mismo fallo de envoltorio que Perú en v1.154.0. Un dato se pega por
         ruta, no por posición. */
      var uno = (Array.isArray(r) ? r : [r]).find(function (c) {
        return c.route === "eu_student_directive";
      });
      if (!uno) return r;
      uno.warnings = (uno.warnings || []).concat([
        "Romania grants the long stay visa for studies as a student, master student or doctoral candidate, at a public or private institution, on condition that it is accredited.",
        "You must show proof of acceptance issued by the Ministry of Education for a full-time course, and proof that you have paid the tuition fee for at least one year of study.",
        "Your means of support must be at least the minimum gross national salary, monthly, for the whole period written on the visa.",
        "You also need a criminal record certificate and travel medical insurance with minimum cover of 30,000 euros, valid across the Member States.",
        "Careful with the date: Romania's immigration inspectorate has not updated its English pages since December 2022, so confirm these conditions before you rely on them."]);
      return r;
    };
  })();

  /* ── ISLANDIA: trabajo y estudios RECUPERADOS (v1.158.0) ─────────────────
     El 3-ago-2026 se documentó Islandia como inalcanzable: la URL histórica
     redirigía a la portada y las fichas de island.is daban 404, porque la
     Dirección de Inmigración anunció el 8-jul-2026 que entraban en vigor
     nuevas normas de permisos de residencia y trabajo. No se afirmó nada.

     Al reintentar hoy (4-ago-2026) el sitio responde. Lo que había cambiado
     son las RUTAS: el catálogo enlaza a /en/permit-based-on-work, no a
     /en/residence-permit-based-on-work, que es la que se probaba antes y
     sigue dando 404. Un cambio de slug tenía la fuente escondida.

     Fuente: island.is (Útlendingastofnun / Directorate of Immigration).
     Snapshot: snapshots/is-recuperada-2026-08/
     ⚠ El catálogo lista 27 permisos de residencia y NINGUNO es de trabajo
     remoto: la tarjeta de nómada sigue como está, ahora por comprobación y
     no por desconocimiento. */
  (function islandia() {
    var base = COUNTRY_RULES.IS;
    if (!base) return;
    var baseWork = base.work, baseStudent = base.student;

    COUNTRY_RULES.IS.work = function (p) {
      if (libreCirculacionUE(p.nationality)) return baseWork(p);
      var b = trabajoBase(p, 54), m = b.m, w = b.w;
      m.push("Iceland grants residence permits based on work to people who have received a job offer on the Icelandic labour market.");
      w.push("There are three grounds: work requiring expert knowledge, a shortage of labour, or a collaboration or service contract.");
      w.push("Applications must be submitted in their original form on paper, by post or in the Directorate's drop box: there is no online route.");
      finReq("You must pay the processing fee by bank transfer first, and submit the receipt with the application.", w);
      w.push("Always verify with Iceland's Directorate of Immigration (island.is).");
      var r = visaResult("work", Math.min(b.score, b.tope), m, w, []);
      r.officialName = "Iceland residence permit based on work";
      r.route = "is_work";
      return r;
    };

    COUNTRY_RULES.IS.student = function (p) {
      if (libreCirculacionUE(p.nationality)) return baseStudent(p);
      var b = estudioBase(p, 58), m = b.m, w = b.w;
      m.push("Iceland grants student residence permits for full time studies at a university in Iceland, and for doctoral studies at a foreign university collaborating with an Icelandic one.");
      w.push("You must first gain admission to a study programme recognised as the basis for a student permit.");
      w.push("The deadline is strict: your application and supporting documents must arrive by 1 May for the autumn semester, or by 1 October for the spring semester.");
      w.push("Start early: gathering the documents takes time, and a criminal record certificate is one of them.");
      w.push("Always verify with Iceland's Directorate of Immigration (island.is).");
      var r = visaResult("student", Math.min(b.score, b.tope), m, w,
        eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
      r.officialName = "Iceland residence permit for students";
      r.route = "is_student";
      return r;
    };
  })();

  /* ── PAÍSES BAJOS: estudios y trabajo con fuente propia (v1.123.0) ───────
     Antes usaban la fábrica genérica de Schengen. El IND publica una regla
     estructural que cambia por completo lo que tiene que hacer el usuario, y
     que la versión genérica ocultaba: EN LOS DOS CASOS NO SOLICITA ÉL.
     Fuente: ind.nl (capturado con navegador real el 3-ago-2026; la página se
     pinta con JavaScript y sus requisitos concretos viven tras un asistente
     que exige elegir nacionalidad, así que solo se afirma lo que la página
     muestra de forma estable). Snapshot: snapshots/nl-verificacion-2026-08/ */
  (function () {
    /* OJO: hay que guardar las funciones ORIGINALES antes de sobrescribirlas.
       Guardar el objeto (var base = COUNTRY_RULES.NL) no vale: base.student
       apuntaría a la función nueva y se llamaría a sí misma sin fin. */
    var estudiosBase = COUNTRY_RULES.NL.student;
    var trabajoBaseNL = COUNTRY_RULES.NL.work;
    COUNTRY_RULES.NL.student = function (p) {
      var r = estudiosBase(p);
      var libre = inList(PASSPORT.euEea, p.nationality) || p.nationality === "CH";
      if (!libre) {
        r.matched = ["In the Netherlands only the educational institution can apply for your student residence permit — you cannot apply yourself."]
          .concat(r.matched || []);
        r.warnings = (r.warnings || []).filter(function (t) { return !/National requirements have not been verified/.test(t); });
        r.warnings.push("Always verify with the Immigration and Naturalisation Service (ind.nl).");
        /* El nombre oficial y la ruta auditada solo se ponen aquí: un
           ciudadano de la UE no necesita este permiso, y ponérselo daría a
           entender que sí. Su tarjeta se queda como estaba. */
        r.officialName = "Netherlands student residence permit (university / HBO)";
        r.route = "nl_study_ind";
      }
      return r;
    };
    COUNTRY_RULES.NL.work = function (p) {
      var r = trabajoBaseNL(p);
      var libre = inList(PASSPORT.euEea, p.nationality) || p.nationality === "CH";
      if (!libre) {
        r.matched = ["For the highly skilled migrant route only an employer recognised by the IND can apply for your permit."]
          .concat(r.matched || []);
        r.warnings = (r.warnings || []).filter(function (t) { return !/Simulated guidance only/.test(t); });
        r.warnings.push("The IND also publishes other work routes: European Blue Card, intra-corporate transfer, single permit (GVVA), orientation year, start-up and self-employed.");
        r.warnings.push("Always verify with the Immigration and Naturalisation Service (ind.nl).");
        /* El nombre oficial y la ruta auditada solo se ponen aquí: un
           ciudadano de la UE no necesita este permiso, y ponérselo daría a
           entender que sí. Su tarjeta se queda como estaba. */
        r.officialName = "Netherlands work residence permit (highly skilled migrant and others)";
        r.route = "nl_work_ind";
      }
      return r;
    };
  })();

  /* ── ALEMANIA: estudios, trabajo y autónomo con fuente propia (v1.124.0) ─
     Fuente: make-it-in-germany.com, portal del Gobierno federal (capturado con
     navegador real el 3-ago-2026; bloquea el acceso automatizado con Radware).
     Snapshot: snapshots/de-verificacion-2026-08/
     Lo importante: la plantilla genérica de Schengen NO conocía la regla de los
     45 años, que es la que de verdad cambia el resultado para un perfil mayor. */
  (function () {
    var estudiosDE = COUNTRY_RULES.DE.student;
    var trabajoDE  = COUNTRY_RULES.DE.work;
    var libreDE = function (p) {
      return inList(PASSPORT.euEea, p.nationality) || p.nationality === "CH";
    };

    COUNTRY_RULES.DE.student = function (p) {
      var r = estudiosDE(p);
      if (libreDE(p)) return r;
      r.matched = ["Germany issues the study residence permit under Section 16b of the Residence Act, which also covers language courses, preparatory courses and doctoral studies."]
        .concat(r.matched || []);
      r.matched.push("You can work up to 140 full days or 280 half days per year, or up to 20 hours per week, alongside your studies.");
      r.warnings = (r.warnings || []).filter(function (t) { return !/National requirements have not been verified/.test(t); });
      r.warnings.push("You must already have been admitted to a state-recognised German higher education institution before you apply.");
      r.warnings.push("Funds are proved with a blocked bank account (at least EUR 11,904 in 2026), a scholarship or a declaration of commitment.");
      r.warnings.push("If you have not been admitted yet, Germany has a separate visa for seeking a place in higher education, valid for up to nine months.");
      r.warnings.push("After graduating you can apply for an 18-month jobseeker residence permit to look for skilled employment.");
      r.warnings.push("Always verify with Make it in Germany, the federal government portal (make-it-in-germany.com).");
      r.officialName = "Germany student residence permit (Residence Act, Section 16b)";
      r.route = "de_study_mig";
      return r;
    };

    COUNTRY_RULES.DE.work = function (p) {
      var r = trabajoDE(p);
      if (libreDE(p)) return r;
      var edad = Number(p.age);
      r.matched = ["Germany issues the qualified-employment residence permit under Sections 18a and 18b of the Residence Act."]
        .concat(r.matched || []);
      r.matched.push("Your job in Germany does not have to be related to your qualification.");
      r.warnings = (r.warnings || []).filter(function (t) { return !/Simulated guidance only/.test(t); });
      r.warnings.push("Your qualification must be recognised in Germany or comparable to a German academic qualification; regulated professions also need a licence to practise.");
      r.warnings.push("You need a specific job offer for a qualified position: auxiliary tasks are not enough.");
      r.warnings.push("As a rule the Federal Employment Agency must approve your employment before the permit is issued.");
      /* La regla de los 45 años: la fuente la publica como condición, no como
         consejo. Solo se aplica si conocemos la edad. */
      if (edad > 45) {
        r.warnings.push("Coming to work in Germany for the first time above the age of 45 requires either a gross annual salary of at least EUR 55,770 (2026) or proof of adequate pension provision.");
        r.missing = (r.missing || []).concat(["age"]);
        r.score = Math.min(r.score, 55);
      }
      r.warnings.push("Always verify with Make it in Germany, the federal government portal (make-it-in-germany.com).");
      r.officialName = "Germany work residence permit for qualified professionals (Sections 18a/18b)";
      r.route = "de_work_mig";
      r.status = scoreToStatus(r.score);
      return r;
    };

    COUNTRY_RULES.DE.digital_nomad = function (p) {
      var m = [], w = [], x = [], score = 0;
      var r, nombre = "Germany: no digital nomad visa (self-employment permit, Section 21 (5))";
      if (libreDE(p)) {
        m.push("EU/EEA citizens can live and work remotely from this destination under freedom of movement.");
        score = 88;
        /* A un ciudadano de la UE no se le anuncia un permiso que no necesita. */
        nombre = "Germany: no permit needed (EU/EEA freedom of movement)";
      } else {
        w.push("Germany does not publish a dedicated digital nomad visa.");
        w.push("The closest published route is the self-employment residence permit under Section 21 (5) of the Residence Act, for freelancers in the liberal professions.");
        w.push("You must prove sufficient funds to finance your projects and hold any licence the profession requires.");
        w.push("Above the age of 45 you must also prove adequate old-age pension provision.");
        m.push("The self-employment residence permit is initially issued for up to three years.");
        score = p.remoteWork ? 46 : 28;
        x.push("route");
      }
      w.push("Always verify with Make it in Germany, the federal government portal (make-it-in-germany.com).");
      r = visaResult("digital_nomad", score, m, w, x);
      r.officialName = nombre;
      r.route = "de_self_employment";
      return r;
    };
  })();

  /* ── FRANCIA: estudios, trabajo y autónomo con fuente propia (v1.125.0) ──
     Fuente: france-visas.gouv.fr, sitio oficial de visados del Gobierno francés
     (capturado con navegador real el 3-ago-2026: los apartados se despliegan con
     JavaScript). Snapshot: snapshots/fr-verificacion-2026-08/ */
  (function () {
    var estudiosFR = COUNTRY_RULES.FR.student;
    var trabajoFR  = COUNTRY_RULES.FR.work;
    var libreFR = function (p) {
      return inList(PASSPORT.euEea, p.nationality) || p.nationality === "CH";
    };
    /* Nacionalidades obligadas al procedimiento «Etudes en France» (EEF), que
       cambia el trámite y el precio del visado. Lista literal de la fuente. */
    var FR_EEF = {};
    ("AO BJ BF BI CM CF TD KM CG CI CD ET DJ GA GH GN KE MG ML MR MU NG RW SN ZA TG " +
     "MM KH CN IN ID JP MY NP PK SG KR TW TH VN " +
     "AR BO BR CA CL CO DO EC HT MX PE US " +
     "DZ BH EG IR IL JO KW LB MA QA SA TN AE " +
     "AM AZ GE GB RU TR").split(" ").forEach(function (i) { FR_EEF[i] = 1; });

    COUNTRY_RULES.FR.student = function (p) {
      var r = estudiosFR(p);
      if (libreFR(p)) return r;
      var edad = Number(p.age);
      r.matched = ["France issues a long-stay student visa for courses longer than three months, and a short-stay visa for courses of three months or less."]
        .concat(r.matched || []);
      r.warnings = (r.warnings || []).filter(function (t) { return !/National requirements have not been verified/.test(t); });
      r.warnings.push("You must be accepted by a higher education establishment and include its certificate of enrolment with your application.");
      if (FR_EEF[p.nationality]) {
        r.warnings.push("Your nationality is on France's Etudes en France (EEF) list, so you must apply through that online procedure; the visa fee is EUR 50 instead of EUR 99.");
      } else {
        r.warnings.push("Your nationality is not on France's Etudes en France list, so you enrol directly with the establishment; the visa fee is EUR 99.");
      }
      r.matched.push("Foreign students are authorised to work 964 hours a year, 60% of normal working hours in France.");
      if (p.nationality === "DZ") {
        r.warnings.push("Algerian nationals are limited to 50% of normal working hours in France instead of 60%.");
      }
      /* La fuente pone un mínimo de edad explícito: por debajo, no hay ruta. */
      if (edad && edad < 18) {
        r.warnings.push("France requires student visa applicants to be over 18 years of age.");
        r.missing = (r.missing || []).concat(["age"]);
        r.score = Math.min(r.score, 25);
      }
      r.warnings.push("Always verify with France-Visas, the French government visa site (france-visas.gouv.fr).");
      r.officialName = "France long-stay student visa (VLS-TS etudiant)";
      r.route = "fr_study_mig";
      r.status = scoreToStatus(r.score);
      return r;
    };

    COUNTRY_RULES.FR.work = function (p) {
      var r = trabajoFR(p);
      if (libreFR(p)) return r;
      r.matched = ["France issues a long-stay visa equivalent to a residence permit of up to 12 months, marked 'salarie' for permanent contracts and 'travailleur temporaire' for fixed-term contracts."]
        .concat(r.matched || []);
      r.warnings = (r.warnings || []).filter(function (t) { return !/Simulated guidance only/.test(t); });
      r.warnings.push("Any employer wishing to recruit you in France must first request authorisation from the French authorities, and you submit that work permit with your visa application.");
      r.warnings.push("Contracts of 90 days or less are exempt from the work permit for a closed list of activities: sporting, cultural, artistic or scientific events, conferences, seminars, trade fairs and a few others.");
      r.warnings.push("You must validate the visa within three months of arriving in France.");
      r.warnings.push("Always verify with France-Visas, the French government visa site (france-visas.gouv.fr).");
      r.officialName = "France long-stay work visa (salarie / travailleur temporaire)";
      r.route = "fr_work_mig";
      return r;
    };

    COUNTRY_RULES.FR.digital_nomad = function (p) {
      var m = [], w = [], x = [], score = 0;
      var nombre = "France: no digital nomad visa (entrepreneur / profession liberale visa)";
      if (libreFR(p)) {
        m.push("EU/EEA citizens can live and work remotely from this destination under freedom of movement.");
        score = 88;
        nombre = "France: no permit needed (EU/EEA freedom of movement)";
      } else {
        w.push("France does not publish a dedicated digital nomad visa.");
        w.push("The closest published route is the long-stay visa marked 'entrepreneur/profession liberale', valid for one year and validated within fifteen days of arrival.");
        w.push("For a liberal profession or an existing activity you must prove financial resources equivalent to the French full-time minimum wage.");
        w.push("If your activity contributes to France's economic attractiveness you can instead apply for the passeport-talent, granted for an initial four years.");
        score = p.remoteWork ? 46 : 28;
        x.push("route");
      }
      w.push("Always verify with France-Visas, the French government visa site (france-visas.gouv.fr).");
      var r = visaResult("digital_nomad", score, m, w, x);
      r.officialName = nombre;
      r.route = "fr_self_employment";
      return r;
    };
  })();

  /* ── ITALIA: estudios, trabajo y nómada digital con fuente propia (v1.126.0)
     Fuentes: studyinitaly.esteri.it (Exteriores), lavoro.gov.it (decreto flussi
     2026-2028) y la red consular de esteri.it para el visado de nómada digital.
     Capturado con navegador real el 3-ago-2026.
     Snapshot: snapshots/it-verificacion-2026-08/
     HALLAZGO: la app daba las provisiones italianas de trabajo remoto por «no
     verificadas». Italia SÍ tiene visa de nómada digital desde abril de 2024. */
  (function () {
    var estudiosIT = COUNTRY_RULES.IT.student;
    var trabajoIT  = COUNTRY_RULES.IT.work;
    var libreIT = function (p) {
      return inList(PASSPORT.euEea, p.nationality) || p.nationality === "CH";
    };

    COUNTRY_RULES.IT.student = function (p) {
      var r = estudiosIT(p);
      if (libreIT(p)) return r;
      r.matched = ["Italy requires a university pre-enrolment application through the Universitaly portal before you can apply for the study visa."]
        .concat(r.matched || []);
      r.warnings = (r.warnings || []).filter(function (t) { return !/National requirements have not been verified/.test(t); });
      r.warnings.push("Once in Italy you must apply for the residence permit within 8 working days of arrival: missing that window puts your stay at risk.");
      r.warnings.push("The residence permit application costs around EUR 116 for stays of up to one year, and renewals must be filed at least 60 days before expiry.");
      r.warnings.push("Always verify with Study in Italy, the Italian Ministry of Foreign Affairs portal (studyinitaly.esteri.it).");
      r.officialName = "Italy national study visa (type D) and study residence permit";
      r.route = "it_study_mig";
      return r;
    };

    COUNTRY_RULES.IT.work = function (p) {
      var r = trabajoIT(p);
      if (libreIT(p)) return r;
      r.matched = ["Italy sets its non-EU work entries by decree: the 2026-2028 decreto flussi allows 497,550 entries in total, 164,850 of them in 2026."]
        .concat(r.matched || []);
      r.warnings = (r.warnings || []).filter(function (t) { return !/Simulated guidance only/.test(t); });
      r.warnings.push("Entry for salaried work runs through an annual quota with fixed application dates: for the 2026 quota, non-seasonal applications opened on 16 and 18 February through the Interior Ministry's ALI portal.");
      r.warnings.push("Nationals of countries with a migration cooperation agreement with Italy apply two days earlier than everyone else, which matters when quotas run out.");
      r.warnings.push("Your employer files the request; you cannot apply on your own, and the forms must be pre-filled during the window set by the ministerial circular.");
      r.warnings.push("Quotas and dates are set anew by decree each year. Always verify with the Italian Ministry of Labour (lavoro.gov.it).");
      /* Ruta con cupo y fecha fija: no puede salir en verde como si bastara con
         el perfil. El cupo manda por encima del mérito. */
      r.score = Math.min(r.score, 62);
      r.status = scoreToStatus(r.score);
      r.officialName = "Italy work entry under the decreto flussi quota (lavoro subordinato)";
      r.route = "it_work_mig";
      return r;
    };

    COUNTRY_RULES.IT.digital_nomad = function (p) {
      var m = [], w = [], x = [], score = 0;
      var nombre = "Italy Digital Nomad / Remote Worker visa";
      if (libreIT(p)) {
        m.push("EU/EEA citizens can live and work remotely from this destination under freedom of movement.");
        score = 88;
        nombre = "Italy: no permit needed (EU/EEA freedom of movement)";
      } else {
        m.push("Italy has published a digital nomad and remote worker visa since April 2024, valid for up to 365 days.");
        score = 30;
        if (p.remoteWork) { score += 26; m.push("Your profile indicates remote work, which is the primary condition for this route."); }
        else { w.push("This route is only for people who work remotely, either self-employed (digital nomad) or employed (remote worker)."); x.push("remote"); }
        /* La fuente exige título de tres años o experiencia equivalente: es
           condición publicada, no señal blanda. */
        if (p.education === "university_plus") { score += 18; m.push("Italy requires a highly qualified worker: a tertiary qualification of at least three years meets that test."); }
        else { w.push("Italy requires a highly qualified worker: a three-year tertiary qualification, a regulated profession, or three to five years of comparable professional experience."); x.push("education"); }
        w.push("You must show annual income of at least three times the health-care exemption threshold (three times EUR 8,500), health insurance valid in Italy, and registered accommodation.");
        w.push("You need at least six months of prior experience working as a digital nomad or remote worker.");
        w.push("After arriving you must apply for the residence permit at the Questura within eight working days.");
      }
      w.push("Always verify with the Italian Ministry of Foreign Affairs consular network (esteri.it).");
      var r = visaResult("digital_nomad", Math.min(score, 82), m, w, x);
      r.officialName = nombre;
      r.route = "it_digital_nomad";
      return r;
    };
  })();

  /* ── SUECIA: estudios y trabajo con fuente propia (v1.127.0) ────────────
     Fuente: migrationsverket.se (Swedish Migration Agency). Capturado con
     navegador real el 3-ago-2026: los requisitos viven en acordeones.
     Snapshot: snapshots/se-verificacion-2026-08/
     La regla de salario es de junio de 2026 y el importe lo recalcula Statistics
     Sweden: se cita con su fecha, nunca como cifra permanente. */
  (function () {
    var estudiosSE = COUNTRY_RULES.SE.student;
    var trabajoSE  = COUNTRY_RULES.SE.work;
    var libreSE = function (p) {
      return inList(PASSPORT.euEea, p.nationality) || p.nationality === "CH";
    };

    COUNTRY_RULES.SE.student = function (p) {
      var r = estudiosSE(p);
      if (libreSE(p)) return r;
      r.matched = ["Sweden grants the study residence permit only for full-time on-site studies: distance learning does not qualify."]
        .concat(r.matched || []);
      r.warnings = (r.warnings || []).filter(function (t) { return !/National requirements have not been verified/.test(t); });
      r.warnings.push("You count as finally admitted only once you have paid the tuition fee; your institution notifies the Migration Agency.");
      r.warnings.push("The maintenance requirement is at least SEK 10,656 per month for 2026 applications, plus SEK 4,440 for a partner and SEK 2,664 per child.");
      r.warnings.push("You need comprehensive health insurance, or proof that you have applied for one.");
      r.warnings.push("For studies of less than three months you should not apply for a residence permit at all.");
      r.warnings.push("Always verify with the Swedish Migration Agency (migrationsverket.se).");
      r.officialName = "Sweden residence permit for higher education studies";
      r.route = "se_study_mig";
      return r;
    };

    COUNTRY_RULES.SE.work = function (p) {
      var r = trabajoSE(p);
      if (libreSE(p)) return r;
      r.matched = ["Sweden issues a work permit tied to a signed employment contract and to one single job: you cannot combine two jobs to meet the requirements."]
        .concat(r.matched || []);
      r.warnings = (r.warnings || []).filter(function (t) { return !/Simulated guidance only/.test(t); });
      r.warnings.push("Since 1 June 2026 the salary must be at least 90% of the Swedish median salary at the time of application, currently SEK 34,470 per month.");
      r.warnings.push("Pay and conditions must also match Swedish collective agreements or common practice in the profession.");
      r.warnings.push("Before you start, your employer must have taken out health, life, industrial injuries and occupational pension insurance for you.");
      r.warnings.push("The salary figure is recalculated by Statistics Sweden. Always verify with the Swedish Migration Agency (migrationsverket.se).");
      r.officialName = "Sweden work permit (arbetstillstand)";
      r.route = "se_work_mig";
      return r;
    };
  })();

  /* ── ESTONIA: estudios y nómada digital con fuente propia (v1.127.0) ────
     Fuentes: vm.ee (Ministerio de Asuntos Exteriores) y politsei.ee (Policía y
     Guardia de Fronteras). Capturado con navegador real el 3-ago-2026.
     Snapshot: snapshots/ee-verificacion-2026-08/
     La app daba las provisiones estonias de trabajo remoto por no verificadas.
     Estonia SÍ tiene visa de nómada digital y el ministerio publica su umbral.
     LÍMITE: la condición de que el empleador esté fuera de Estonia no se ha
     podido citar literalmente, así que la app NO la afirma. */
  (function () {
    var estudiosEE = COUNTRY_RULES.EE.student;
    var libreEE = function (p) {
      return inList(PASSPORT.euEea, p.nationality) || p.nationality === "CH";
    };

    COUNTRY_RULES.EE.student = function (p) {
      var r = estudiosEE(p);
      if (libreEE(p)) return r;
      r.matched = ["Estonia issues a long-stay (D) visa valid for up to 12 months, allowing up to 365 days of stay in any 12 consecutive months."]
        .concat(r.matched || []);
      r.warnings = (r.warnings || []).filter(function (t) { return !/National requirements have not been verified/.test(t); });
      r.warnings.push("For studies the ministry requires proof of 880 euros per month, evidenced by your income over the three months before you apply.");
      r.warnings.push("The visa fee is 120 euros.");
      r.warnings.push("Always verify with the Estonian Ministry of Foreign Affairs (vm.ee).");
      r.officialName = "Estonia long-stay (D) visa for studies";
      r.route = "ee_study_mig";
      return r;
    };

    COUNTRY_RULES.EE.digital_nomad = function (p) {
      var m = [], w = [], x = [], score = 0;
      var nombre = "Estonia Digital Nomad Visa (teleworking, long-stay D)";
      if (libreEE(p)) {
        m.push("EU/EEA citizens can live and work remotely from this destination under freedom of movement.");
        score = 88;
        nombre = "Estonia: no permit needed (EU/EEA freedom of movement)";
      } else {
        m.push("Estonia publishes a digital nomad visa for teleworking, issued as a long-stay (D) visa.");
        m.push("Estonia issues a long-stay (D) visa valid for up to 12 months, allowing up to 365 days of stay in any 12 consecutive months.");
        score = 34;
        if (p.remoteWork) { score += 26; m.push("Your profile indicates remote work, which is the primary condition for this route."); }
        else { w.push("This route is for people who work remotely, and your profile does not indicate remote work."); x.push("remote"); }
        w.push("The ministry requires 132 euros per day, that is 3,960 euros per month, proved with your income over the three months before you apply.");
        w.push("The visa fee is 120 euros and travel medical insurance is required for the whole period.");
        /* Honestidad explícita sobre lo que NO hemos capturado. */
        w.push("Wayfare has not captured the full eligibility conditions from an official page: check them before you rely on this route.");
      }
      w.push("Always verify with the Estonian Ministry of Foreign Affairs (vm.ee).");
      var r = visaResult("digital_nomad", Math.min(score, 78), m, w, x);
      r.officialName = nombre;
      r.route = "ee_digital_nomad";
      return r;
    };
  })();

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
    w.push("Work allowances vary by nationality (e.g., limits on months worked or per employer). Verify current conditions with the German mission.");
    return deYm(score);
  };

  /* Francia — france-visas.gouv.fr (snapshot archive.org 18-oct-2025):
     16 socios · 18-30 (AR/AU/CA hasta 35) · motivo principal turístico-cultural. */
  var FR_YM = { AU:35, AR:35, BR:30, CA:35, CL:30, CO:30, KR:30, EC:30, JP:30, NZ:30, HK:30, MX:30, PE:30, RU:30, TW:30, UY:30 };
  /* Plazo que termina EL DÍA del 30º cumpleaños (no la víspera del 31º). */
  var FR_YM_DIA_CUMPLE = { CL:1, EC:1, HK:1, MX:1, PE:1 };
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
    /* v1.113.0 — france-visas distingue dos plazos y la app solo veía uno:
       para Chile, Ecuador, Hong Kong, México y Perú la solicitud se presenta
       «entre ses 18 ans et le JOUR de son 30ème anniversaire»; para el resto,
       hasta la VÍSPERA del 31º (o del 36º). Con edades enteras no se puede
       distinguir el día exacto, así que se avisa siempre en vez de fingir
       precisión: es su plazo, lo sepa a los 25 o a los 29. */
    if (FR_YM_DIA_CUMPLE[nat]) {
      w.push("For your nationality the application must be lodged on or before your 30th birthday, not during your 30th year.");
    }
    w.push("The main purpose of the stay must be tourist and cultural discovery of France; work is complementary.");
    finReq("You must meet the funds level set by your country's agreement. Check france-visas.gouv.fr.", w);
    w.push("Apply at the competent visa centre in your country of nationality.");
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
      /* v1.159.0 — lo que ya decía era cierto, pero no citaba a nadie. Ahora
         se apoya en la misma página de la Comisión Europea que destapó lo de
         Chipre: el Protocolo de Schengen permite a Irlanda no aplicar sus
         reglas, y por eso mantiene su propia política de visados y fronteras.
         Snapshot: snapshots/cy-ie-schengen-2026-08/ */
      w.push("The Schengen Protocol exceptionally allows Ireland not to apply the Schengen rules, so it continues to enforce its own visa and border policies.");
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
      w.push("Applications are made through the Department of Foreign Affairs.");
      finReq("You may need to show sufficient funds for your stay.", w);
      return ieYm(Math.min(score, 68));
    },
    /* v1.122.0 — ESTUDIOS Y TRABAJO AUDITADOS. Antes reutilizaban las reglas
       de Schengen, algo que la propia tarjeta de turismo de Irlanda desmiente:
       Irlanda NO está en Schengen y aplica sus propias normas. Ahora salen de
       irishimmigration.ie (capturado con navegador real el 3-ago-2026, porque
       el sitio exige superar un reto de Cloudflare).
       Snapshot: snapshots/ie-verificacion-2026-08/ */
    student: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      var libre = inList(PASSPORT.euEea, nat) || nat === "CH";
      if (libre) {
        score += 52;
        m.push("As an EU/EEA or Swiss citizen you do not need permission to study in Ireland.");
      } else {
        score += 16;
        m.push("Ireland issues a Short Stay C visa for courses under 90 days and a Long Stay D visa for longer ones.");
        w.push("Non-EEA and non-Swiss students need a letter of enrolment and to have paid their course fees.");
        w.push("If your course lasts more than 90 days you must also register with immigration after arriving.");
        w.push("Whether you need the visa itself depends on your nationality; the permission requirements apply either way.");
      }
      score += scoreEdu(p, "secondary", 22);
      if (eduRank(p.education) < eduRank("secondary")) x.push("minEdu");
      else m.push("Your education level appears to meet general requirements.");
      score += scoreEng(p, "intermediate", 18);
      if (engRank(p.english) < engRank("intermediate")) x.push("minEnglish");
      else m.push("Your English level appears to meet general requirements.");
      m.push("Study options include a third-level course, a language course, a fee paying private school or a short-term course.");
      finReq("You may need to show sufficient funds for tuition and living costs. Check official Irish student visa requirements.", w);
      w.push("Always verify with Irish Immigration Service Delivery (irishimmigration.ie).");
      var r = visaResult("student", Math.min(score, libre ? 92 : 68), m, w, x);
      r.officialName = "Ireland study permission (Short Stay C / Long Stay D)";
      r.route = "ie_study";
      return r;
    },
    work: function (p) {
      var m = [], w = [], x = [], score = 0, nat = p.nationality;
      var libre = inList(PASSPORT.euEea, nat) || nat === "CH";
      if (libre) {
        score += 52;
        m.push("As an EU/EEA or Swiss citizen you can work in Ireland without an employment permit.");
      } else {
        score += 14;
        m.push("Ireland's route is an employment permit from the Department of Enterprise, Trade and Employment (DETE).");
        w.push("You must have a contract of employment before coming to work for more than 90 days.");
        w.push("With a job on the critical skills eligible occupations list, you or your Irish employer can apply for a Critical Skills permit.");
        w.push("For general work your Irish employer applies, and the job must not be on the ineligible list of employment.");
        w.push("Once the permit is granted you must apply for a long stay (D) visa if your nationality needs one.");
      }
      score += scoreEdu(p, "university_plus", 26);
      if (eduRank(p.education) < eduRank("university_plus")) x.push("minEdu");
      else m.push("Your education level appears to meet typical requirements.");
      score += scoreEng(p, "intermediate", 20);
      if (engRank(p.english) < engRank("intermediate")) x.push("minEnglish");
      else m.push("Your English level appears to meet general requirements.");
      finReq("You may need to show sufficient funds. Check official Irish work permission requirements.", w);
      w.push("Always verify with Irish Immigration Service Delivery (irishimmigration.ie).");
      var r2 = visaResult("work", Math.min(score, libre ? 92 : 68), m, w, x);
      r2.officialName = "Ireland employment permit (Critical Skills / General)";
      r2.route = "ie_work";
      return r2;
    },
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
        else if (p.age <= 30) m.push("Your age is within the range these programmes usually accept (18 to 30).");
        else w.push("Most working holiday agreements stop at 30; only a few extend to 35, and only for some nationalities.");
        finReq("You may need to show sufficient funds for your stay. Check official working holiday requirements for this destination.", w);
        break;

      case "student":
        /* v1.115.0 — mismo arreglo que en "work": los puntos por pasaporte,
           inglés y estudios se sumaban sin decir nada, así que la tarjeta podía
           mostrar «coincidencia parcial» con solo avisos y ningún motivo. */
        if (pt <= 2) { score += 16; m.push("Your passport nationality is generally accepted for this route."); }
        else         { score += 7;  w.push("Additional documentation may be required for your passport nationality."); }
        score += scoreEng(p, hints.minEnglish || "intermediate", 26);
        if (engRank(p.english) < engRank(hints.minEnglish || "intermediate")) x.push("minEnglish");
        else m.push("Your English level appears to meet general requirements.");
        score += scoreEdu(p, hints.minEdu || "secondary", 22);
        if (eduRank(p.education) < eduRank(hints.minEdu || "secondary")) x.push("minEdu");
        else m.push("Your education level appears to meet typical requirements.");
        finReq("You may need to show sufficient funds for tuition and living costs. Check official student visa requirements for this destination.", w);
        break;

      case "work":
        /* v1.115.0 — DOS FALLOS CORREGIDOS AQUÍ:
           1) Los puntos se sumaban EN SILENCIO: pasaporte (14) + estudios (32)
              + inglés (26) = 72 → la tarjeta salía «podrías calificar» EN VERDE
              sin una sola frase a favor. El usuario veía una afirmación fuerte
              sostenida por nada. Ahora cada punto que se concede, se explica.
           2) Un destino MODELADO no puede prometer «podrías calificar» para
              trabajar: los permisos de trabajo dependen casi siempre de una
              oferta de empleo o de un patrocinador, y de eso no sabemos nada.
              Se topa en 68 (coincidencia parcial), igual que hacen las rutas
              auditadas cuyos requisitos centrales no podemos evaluar. */
        if (pt <= 2) { score += 14; m.push("Your passport nationality is generally accepted for this route."); }
        else         { score += 5;  w.push("Work permit processes may be more complex for your passport nationality."); }
        score += scoreEdu(p, hints.minEdu || "university_plus", 32);
        if (eduRank(p.education) < eduRank(hints.minEdu || "university_plus")) x.push("minEdu");
        else m.push("Your education level appears to meet typical requirements.");
        score += scoreEng(p, hints.minEnglish || "intermediate", 26);
        if (engRank(p.english) < engRank(hints.minEnglish || "intermediate")) x.push("minEnglish");
        else m.push("Your English level appears to meet general requirements.");
        w.push("Most work visas require a job offer or an employer willing to sponsor you.");
        finReq("You may need to show sufficient funds. Check official work visa requirements for this destination.", w);
        score = Math.min(score, 68);
        break;

      case "digital_nomad":
        if (!p.remoteWork) {
          w.push("Remote work is the primary eligibility factor for Digital Nomad visas.");
          finReq("You may need to show sufficient funds and income. Check official digital nomad visa requirements for this destination.", w);
          score = 5;
        } else {
          score += 34; m.push("Your profile indicates remote work, which is the main qualifying factor.");
          w.push("Income requirements should be verified against official digital nomad visa requirements for this destination.");
          finReq("You may need to show sufficient funds and income. Check official digital nomad visa requirements for this destination.", w);
        }
        break;

      default:
        score = 18;
    }

    /* =======================================================================
       v1.155.0 — ESTA FÁBRICA PUNTUABA SIN SABER NADA DEL PAÍS.
       Lee lo que producía para Indonesia: «tu nivel educativo parece cumplir los
       requisitos habituales», «la mayoría de visados de trabajo exigen una oferta
       de empleo»… ni una palabra sobre Indonesia. El mismo texto salía idéntico
       para Cuba, Honduras o Vietnam. Y aun así puntuaba 63 y se pintaba naranja,
       «coincidencia parcial», junto a tarjetas que sí tienen tratado detrás.

       Es exactamente lo que matamos en v1.132.0 a nivel de PAÍS, cuando el
       generador de azar inventaba puntuaciones: enseñar un número que no puedes
       respaldar. Aquí seguía vivo a nivel de TARJETA.

       Los consejos genéricos se quedan —son ciertos y ayudan— pero pierden la
       puntuación y se marcan como lo que son.

       PERO EL ALCANCE NO ES ESTA FUNCIÓN, y el auditor me lo dijo. Guatemala,
       Costa Rica, El Salvador, Nicaragua, Indonesia, Catar y Singapur se apoyan
       en esta base genérica y DESPUÉS renombran la tarjeta con su vía real —y lo
       hacen solo `if (!uno.route)`—. Al marcarla aquí, esos siete países perdían
       el nombre que sí tienen ganado. El corte honesto no es «viene de la fábrica
       genérica», sino «después de pasar por todos los envoltorios SIGUE sin ruta».
       Por eso la degradación vive al final del bucle de evaluación, no aquí.
    ======================================================================= */
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
    w.push("Always verify with GOV.UK.");
  }

  /* v1.115.0 — TARJETA DE TRABAJO RESTAURADA, misma trampa que en Singapur:
     data/mock.js declara `work` para el Reino Unido y COUNTRY_RULES.GB no, así
     que uno de los destinos laborales más consultados no mostraba nada. El
     Skilled Worker sigue sin auditar, así que se usa la vía modelada. */
  COUNTRY_RULES.GB = {
    work: function (p) { return genericDe("GB", "work", p); },

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
        w.push("Always verify with GOV.UK.");
        return gbYmsResult(18, m, w, x);
      }

      /* Passport not on the YMS list */
      if (!cfg) {
        x.push("passport");
        w.push("Your passport does not appear to be on the UK Youth Mobility Scheme country list that Wayfare currently covers.");
        w.push("Check GOV.UK for the full list of eligible countries and conditions.");
        w.push("Always verify with GOV.UK.");
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
        wE.push("Always verify with GOV.UK.");
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
      w.push("Always verify with GOV.UK.");

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
      /* v1.129.0 — RETIRADA una afirmación que la app llevaba desde v1.92.0:
         «desde 2024 las normas de visitante permiten trabajar en remoto para tu
         empleador de fuera». La palabra «remote» NO aparece en ninguna parte de
         gov.uk/standard-visitor ni del Apéndice V de las Immigration Rules
         (comprobado el 3-ago-2026). Si no puedo citarlo, la app no lo dice.
         En su lugar, lo que la fuente sí publica, que además es lo que más
         importa a quien planea quedarse: */
      w.push("As a Standard Visitor you can usually stay up to 6 months, and you cannot do paid or unpaid work for a UK company or as a self-employed person.");
      w.push("You also cannot live in the UK for long periods through frequent or successive visits.");
      w.push("The UK visitor rules do not mention remote work for a foreign employer, so Wayfare does not claim it is allowed: check your situation before you rely on it.");
      w.push("GOV.UK lists 27 work routes, from Skilled Worker to Frontier Worker permit, and none of them is a digital nomad visa.");
      w.push("Always verify with GOV.UK, the official UK government site (gov.uk).");
      var r = visaResult("digital_nomad", p.remoteWork ? 34 : 14, m, w, []);
      r.officialName = "United Kingdom: no digital nomad visa";
      r.route = "gb_digital_nomad";
      return r;
    },

    /* ── Skilled Worker visa: AUDITADA (v1.129.0) ──────────────────────────
       Fuente: GOV.UK (gov.uk/skilled-worker-visa y /your-job), capturado con
       navegador real el 3-ago-2026. Snapshot: snapshots/gb-verificacion-2026-08/
       Antes esta tarjeta salía de la plantilla genérica y no nombraba ni el
       patrocinador aprobado, ni el certificado de patrocinio, ni el salario. */
    work: function (p) {
      var b = trabajoBase(p, 68), m = b.m, w = b.w, x = [];
      m.push("The Skilled Worker visa lets you do an eligible job in the UK with an employer approved by the Home Office.");
      w.push("You need a confirmed job offer before you apply, and a certificate of sponsorship from that employer.");
      w.push("Your job must appear on the list of eligible occupations: if its occupation code is 'higher skilled' you can apply, and if it is 'medium skilled' only through the immigration salary list or the temporary shortage list.");
      w.push("You must be paid whichever is higher: 41,700 pounds a year, or the published going rate for your occupation code.");
      w.push("You must be able to speak, read, write and understand English, and you will usually have to prove it.");
      m.push("The visa lasts up to 5 years before you need to extend it, and after 5 years you may be able to apply for indefinite leave to remain.");
      w.push("Always verify with GOV.UK, the official UK government site (gov.uk).");
      if (!p.english || engRank(p.english) < engRank("intermediate")) { x.push("english"); }
      var r = visaResult("work", Math.min(b.score, b.tope), m, w, x);
      r.officialName = "United Kingdom Skilled Worker visa";
      r.route = "gb_skilled_worker";
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
      w.push("Always verify with GOV.UK.");

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

  /* Estados PARTES del acuerdo original (Brasilia, 6-dic-2002). El resto de la
     lista MERCOSUR son asociados que se adhirieron por instrumentos aparte, que
     Wayfare NO ha capturado — y la tarjeta lo dice en voz alta. */
  var MERCOSUR_PARTES = { AR:1, BR:1, PY:1, UY:1 };

  function mercosurWork(iso, p) {
    if (MERCOSUR[p.nationality] && p.nationality !== iso) {
      /* =====================================================================
         v1.154.0 — ESTA TARJETA ERA LA MÁS FUERTE DE LA APP Y LA MENOS VIGILADA.
         Puntuaba 88 (verde, «podrías calificar»), pero salía SIN NOMBRE y SIN
         RUTA: en pantalla era una tarjeta sin título, y al no tener ruta el
         auditor no podía verla siquiera. La nota más alta, en el punto ciego.
         Ahora tiene nombre, ruta y fuente: el texto del propio tratado, según lo
         publica InfoLEG (Ministerio de Justicia argentino, Ley 25.903).
         Y trae un requisito que la app CALLABA y decide quién califica: quien
         tiene la nacionalidad por naturalización solo cuenta como «nacional de
         una Parte» si la ostenta desde hace cinco años.
         Snapshot: snapshots/mercosur-2026-08/ ==================================== */
      var m = ["Mercosur Residence Agreement: nationals of one State Party who wish to reside in another can obtain legal residence by proving their nationality, without needing a job offer.",
               "Temporary residence is granted for up to two years.",
               "Once you hold it you can take up any activity, employed or self-employed, on the same conditions as nationals of the receiving country."];
      var w = ["If you hold your nationality by naturalisation rather than by birth, you only count as a national of a State Party once you have held it for five years.",
               "You need a valid passport, identity card or certificate of nationality, plus a birth certificate and proof of civil status.",
               "You need a certificate of no criminal record from your country of origin and from any country where you lived in the five years before applying.",
               "On labour law, and especially on pay, working conditions and social insurance, you must be treated no less favourably than nationals of the receiving country.",
               "To turn temporary residence into permanent you must apply within the ninety days before it expires, and prove lawful means of subsistence for yourself and your family."];
      if (!MERCOSUR_PARTES[p.nationality] || !MERCOSUR_PARTES[iso]) {
        w.push("Wayfare has captured the original agreement between the States Parties (Argentina, Brazil, Paraguay and Uruguay). The extension to associated countries rests on separate instruments that are not yet captured here, so treat this route as guidance and confirm it with the destination's migration service.");
      }
      var rM = visaResult("work", 88, m, w, []);
      rM.officialName = "Mercosur Residence Agreement (temporary residence with the right to work)";
      rM.route = "mercosur_residencia";
      return rM;
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
    finReq("The fees are R$168.13 for the residence authorisation and R$204.77 for issuing the registry card.", w);
    w.push("You need criminal record certificates from every country where you have lived in the last five years.");
    w.push("Always verify with Brazil's Ministry of Justice.");
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
    w.push("Always verify with Brazil's Ministry of Justice.");
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
  /* ── CHILE: trabajo y permanencia transitoria AUDITADOS (v1.135.0) ───────
     Fuente: Servicio Nacional de Migraciones (serviciomigraciones.cl),
     capturado con navegador real el 3-ago-2026.
     Snapshot: snapshots/cl-verificacion-2026-08/
     Lo más importante que la app callaba: siendo turista en Chile NO puedes
     pedir residencia, salvo excepciones tasadas del artículo 69. */
  COUNTRY_RULES.CL.work = (function (base) {
    return function (p) {
      var r = base(p);
      r.matched = (r.matched || []).concat([
        "Chile's Residencia Temporal is valid for up to 2 years.",
        "With an employer who has a domicile or branch office in Chile the permit lasts up to two years and can be extended for two more."]);
      r.warnings = (r.warnings || []).concat([
        "The application must be made from OUTSIDE Chile, through the Portal de Trámites Digitales of the Servicio Nacional de Migraciones.",
        "With a formal job offer instead of a contract you get 90 calendar days, and once inside you have 45 days to present the employment contract to earn a one-year extension.",
        "Your passport must be valid for at least one year from the date you apply.",
        "The criminal record certificate must be no more than 60 days old, and the employment contract must be signed by the employer before a Chilean notary.",
        "Always verify with Chile's Servicio Nacional de Migraciones (serviciomigraciones.cl)."]);
      r.officialName = "Chile Residencia Temporal (actividades remuneradas)";
      r.route = "cl_work_temporal";
      return r;
    };
  })(COUNTRY_RULES.CL.work);


  COUNTRY_RULES.CL.student = function (p) {
    var b = estudioBase(p, 60), m = b.m, w = b.w;
    m.push("Chile's temporary residence permit for students covers studies at state-recognised institutions.");
    w.push("It must be applied for from OUTSIDE Chile, through the online portal of the Servicio Nacional de Migraciones — Chilean consulates do not process it.");
    w.push("You need proof of admission or enrolment at the institution: a certificate of regular student status or of enrolment.");
    finReq("You must show you can support yourself during your studies, with bank deposits, regular transfers, a notarised affidavit from whoever supports you, or a scholarship certificate.", w);
    m.push("With this residence you can work up to 30 hours a week without needing any extra authorisation, either at your own institution or for any other employer.");
    w.push("Your passport must be valid for at least one year from the date you apply.");
    w.push("The criminal record certificate from your country must be no more than 60 days old, and documents issued abroad need an apostille and, if not in Spanish or English, an official translation.");
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
    /* v1.143.0 — AUDITADA. Fuente: Federal Authority for Identity, Citizenship,
       Customs & Port Security (icp.gov.ae/en/green-residency), capturada con
       navegador real el 3-ago-2026. Snapshot: snapshots/id-ae-2026-08/ */
    gm.push("It is renewable, and you can sponsor your spouse and children under the approved terms.");
    gw.push("The skilled-worker route needs a valid UAE employment contract in skill levels 1 to 3 of the Ministry of Human Resources classification.");
    gw.push("There is a third route for investors and business partners, who prove an investment or partnership in a UAE project.");
    gw.push("When the residence expires there are grace periods, which gives more room than the employer-tied visa.");
    gw.push("Always verify with the Federal Authority for Identity and Citizenship (icp.gov.ae).");
    /* v1.115.0 — decía eduRank("university"), nivel que NO existe en la escala
       (primary/secondary/baccalaureate/university_plus). eduRank devolvía 0 y la
       condición era SIEMPRE cierta: a alguien con estudios primarios la app le
       afirmaba «tu educación universitaria es una señal positiva». */
    if (eduRank(p.education) >= eduRank("university_plus")) gm.push("Your university education is a positive signal for the skilled-employee route.");
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
    /* v1.143.0 — AUDITADA. Fuente: portal oficial del Gobierno de los EAU
       (u.ae), capturada con navegador real el 3-ago-2026. */
    m.push("The alternative is being sponsored by a parent who is already a UAE resident.");
    w.push("Outstanding students can qualify for the Golden visa, a long-term residence.");
    w.push("Always verify with the official UAE government portal (u.ae).");
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
      w.push("Always verify with the Dirección General de Migración y Extranjería.");
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
  /* ── COSTA RICA: el documento que manda (v1.140.0) ───────────────────────
     Fuente: migracion.go.cr, capturado con navegador real el 3-ago-2026.
     Snapshot: snapshots/cr-gt-sv-2026-08/
     Lo que la app no decía: quién necesita visa y quién no lo fija UN solo
     documento, las Directrices Generales de Visas, que se reedita — la versión
     vigente es la de noviembre de 2025. */
  ["tourist", "student", "work"].forEach(function (tipo) {
    var base = COUNTRY_RULES.CR[tipo];
    if (!base) return;
    COUNTRY_RULES.CR[tipo] = function (p) {
      var r = base(p);
      var uno = Array.isArray(r) ? r[0] : r;
      if (!uno.route) { uno.officialName = "Costa Rica entry for non-residents (Directrices Generales de Visas)"; uno.route = "cr_tourist"; }
      /* Ya está verificada contra fuente: fuera el aviso de «preliminar». */
      uno.warnings = (uno.warnings || []).filter(function (t) {
        return !/could not be verified against a captured official source/.test(t);
      });
      uno.warnings = (uno.warnings || []).concat([
        "Whether your nationality needs a visa for Costa Rica is set by a single document, the Directrices Generales de Visas de Ingreso y Permanencia para No Residentes, reissued periodically: the version in force is dated November 2025.",
        "To reside there you must apply for a migratory category that fits your situation: permanent residence, temporary residence or one of the special categories.",
        "Always verify with Costa Rica's Dirección General de Migración y Extranjería (migracion.go.cr)."]);
      return r;
    };
  });


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

  /* v1.135.0 — este envoltorio va DESPUÉS de la definición de arriba: puesto
     antes, la reasignación literal lo pisaba y no se veía nada. */
  COUNTRY_RULES.CL.tourist = (function (base) {
    return function (p) {
      var r = base(p);
      var uno = Array.isArray(r) ? r[0] : r;
      uno.matched = (uno.matched || []).concat([
        "Chile's Permanencia Transitoria allows up to 90 days, extendable once for up to 90 more."]);
      uno.warnings = (uno.warnings || []).concat([
        "You must prove you have sufficient financial means to support your stay.",
        "Holding a Permanencia Transitoria does NOT let you apply for a residence permit from inside Chile, except in the narrow cases of article 69 of Law 21.325, such as family ties with Chileans or permanent residents.",
        "Always verify with Chile's Servicio Nacional de Migraciones (serviciomigraciones.cl)."]);
      /* Ya está verificada contra fuente: fuera el aviso de «preliminar». */
      uno.warnings = (uno.warnings || []).filter(function (t) {
        return !/could not be verified against a captured official source/.test(t);
      });
      uno.officialName = "Chile Permanencia Transitoria (tourism, up to 90 days)";
      uno.route = "cl_permanencia_transitoria";
      return r;
    };
  })(COUNTRY_RULES.CL.tourist);

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
    /* v1.142.0 — AUDITADA. Sudáfrica SÍ tiene visa de trabajo remoto desde el
       9-oct-2024, y la app la daba por genérica. Fuente: PDF oficial de
       requisitos del Department of Home Affairs, extraído el 3-ago-2026.
       Snapshot: snapshots/za-ge-2026-08/ */
    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 28;
      m.push("South Africa issues a Remote Work visitor's visa under section 11(1)(b)(iv), for stays exceeding three months and up to three years.");
      m.push("It is for people who stay in the country to work for a foreign employer under a contract.");
      if (p.remoteWork) { score += 26; m.push("Your profile indicates remote work, which is the primary condition for this route."); }
      else { w.push("This route is for people who work remotely, and your profile does not indicate remote work."); x.push("remote"); }
      w.push("You must prove a gross salary of no less than the equivalent of 650,796 rand a year, shown through three months of bank statements.");
      w.push("You need a contract of employment signed by both you and the foreign-based employer, and a return flight ticket or reservation.");
      w.push("Your passport must expire no less than 30 days after your intended departure date.");
      w.push("Holding this visa does not entitle you to take up employment in South Africa, and you cannot apply to change your status from inside the country except in exceptional circumstances.");
      w.push("If you stay more than 183 days in any 12 months you must register with the South African Revenue Service; if your country has no double-taxation treaty with South Africa, you must register regardless.");
      w.push("Always verify with South Africa's Department of Home Affairs (dha.gov.za).");
      var r = visaResult("digital_nomad", Math.min(score, 68), m, w, x);
      r.officialName = "South Africa Remote Work visitor's visa (section 11(1)(b)(iv))";
      r.route = "za_remote_work";
      return r;
    },

    work: function (p) {
      var b = trabajoBase(p, 58), m = b.m, w = b.w;
      m.push("South Africa's general work visa is valid for the duration of the employment contract, up to a maximum of five years.");
      w.push("You need a police clearance certificate from every country where you lived for longer than 12 months in the last five years, and it cannot be older than six months when you submit it.");
      w.push("You also need a medical report signed by a medical practitioner, no older than six months at submission.");
      w.push("Always verify with the Department of Home Affairs.");
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
      w.push("Always verify with the Department of Home Affairs.");
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
  /* v1.155.0 — salía sin nombre y sin ruta, cuando el resto de tarjetas honestas
     ya usan honestDN(), que se las pone. Mismo texto, ahora con identidad. */
  COUNTRY_RULES.CL.digital_nomad = honestDN([
    "Chile does not currently offer a dedicated Digital Nomad visa.",
    "Remote workers commonly stay under the visitor permit (up to 90 days); longer stays require a residence visa."],
    { nombre: "Chile", iso: "CL" });
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
      /* v1.120.0 — SE RETIRARON TRES AFIRMACIONES SIN EVIDENCIA. La tarjeta
         decía que el empleador debe anunciar el puesto 10 días hábiles, que
         hay plazo hasta el 1-ene-2027 para quien ya trabajaba, y que trabajar
         sin permiso está multado «para el trabajador y la empresa». Nada de
         eso aparece en la fuente capturada: el aviso oficial del Ministerio de
         Exteriores georgiano (26-feb-2026) no lo menciona, y el portal
         labourmigration.moh.gov.ge está SOLO EN GEORGIANO. Afirmar multas y
         plazos legales traduciendo una ley a máquina es exactamente lo que
         este proyecto no hace. Se queda lo que sí dice la fuente. */
      m.push("Since 1 March 2026 Georgia has a work permit system: you need the right to labour activity plus a D1 visa or a work residence permit.");
      w.push("Your employer applies for you if you are employed; if you are self-employed you apply directly.");
      w.push("It covers employees, self-employed people and entrepreneurs earning from activity in Georgia, including paid work done remotely.");
      w.push("Holders of a permanent residence permit in Georgia are outside this requirement.");
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
      /* v1.120.0 — HONESTIDAD SOBRE ESTA LISTA. Las nacionalidades sin visado
         salen de una lista escrita en este archivo, no de una fuente capturada:
         mfa.gov.ge respondía 522 y geoconsul.gov.ge está en modo prueba con
         404 el 2-ago-2026. Mientras no se pueda capturar, la tarjeta lo dice
         en vez de presentarlo como verificado. */
      fw.push("The visa-free list shown here has not been verified against a captured official source: check the Georgian foreign ministry before you travel.");
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
  /* ── GEORGIA: nómada digital con la fuente que hay, y su fecha (v1.142.0) ─
     Fuentes: geoconsul.gov.ge (MAE de Georgia) y matsne.gov.ge (registro legal).
     Capturado con navegador real el 3-ago-2026.
     Snapshot: snapshots/za-ge-2026-08/
     ⚠ La única página oficial del programa está FECHADA EN JUNIO DE 2022 y
     todavía exige cuarentena de 8 días y PCR: medidas de pandemia. No puede
     darse por vigente, y la app lo dice. Y la lista de exención de visado, que
     es lo que de verdad usa casi todo el mundo, está en una ordenanza cuya
     versión consolidada el registro legal solo sirve DE PAGO. */
  COUNTRY_RULES.GE.digital_nomad = function (p) {
    var m = [], w = [], x = [], score = 26;
    m.push("Georgia has published a programme called Remotely from Georgia, open to nationals of 95 countries.");
    if (p.remoteWork) { score += 22; m.push("Your profile indicates remote work, which is the primary condition for this route."); }
    else { w.push("This route is for people who work remotely, and your profile does not indicate remote work."); x.push("remote"); }
    w.push("As published, it asks for a bank statement showing monthly income of at least 2,000 US dollars and health insurance valid for at least six months.");
    w.push("Careful: the only official page Wayfare could capture is dated June 2022 and still requires an 8-day quarantine and PCR testing, so it is out of date and cannot be taken as current.");
    w.push("For many nationalities the simpler route is Georgia's visa-free entry, which allows a long stay without any programme.");
    w.push("The visa-free list comes from Government Ordinance No 255 of 5 June 2015, whose consolidated current version the Georgian legal register only serves behind a paywall.");
    w.push("Always verify with Georgia's Ministry of Foreign Affairs (geoconsul.gov.ge).");
    var r = visaResult("digital_nomad", Math.min(score, 58), m, w, x);
    r.officialName = "Georgia: Remotely from Georgia (source not updated since 2022)";
    r.route = "ge_remotely_from_georgia";
    return r;
  };


  /* v1.93.0 — estudios de Georgia (R5): va AQUÍ, después del objeto literal de
     COUNTRY_RULES.GE, porque asignarlo antes lo borraría al crearse el objeto. */
  COUNTRY_RULES.GE.student = function (p) {
    var b = estudioBase(p, 58), m = b.m, w = b.w;
    m.push("Georgia issues a study visa (D3) and, for longer courses, a temporary residence permit for study.");
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
           "Approval is always a prerogative of the Colombian State."],
          []);
        r.officialName = "Colombia Migrante (M) — Acuerdo de Residencia Mercosur";
        r.route = "co_work_mercosur";
        return r;
      }
      var rw = genericDe("CO", "work", p);
      var unow = Array.isArray(rw) ? rw[0] : rw;
      unow.matched = (unow.matched || []).concat([
        "Colombia's Migrant visa (M) is the one for settling, and includes the categories Trabajador, Profesional Independiente and Socio o Propietario."]);
      unow.warnings = (unow.warnings || []).concat([
        "There is also a Migrante Andino category for nationals of the Andean Community.",
        "Time held as a Migrant (M) counts towards the Resident (R) visa by accumulated stay in Colombia.",
        "Every visa application is filed through the Foreign Ministry's digital platform, not on paper.",
        "Always verify with Colombia's Ministerio de Relaciones Exteriores (cancilleria.gov.co)."]);
      unow.officialName = "Colombia Visa de Migrante (M) — Trabajador";
      unow.route = "co_work_m";
      return rw;
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
      w.push("Bank statements must show minimum income equivalent to three (3) Colombian legal monthly minimum wages (SMLMV) over the last 3 months.");
      w.push("You need a health policy with full coverage in Colombia for the whole planned stay.");
      w.push("You will need a letter from the foreign company (or a contract, or proof of company partnership); entrepreneurs present a motivation letter for their venture.");
      /* v1.137.0 — dos cosas del artículo 46 que la tarjeta callaba y que
         cambian la decisión de mucha gente. Fuente: Resolución 5477 de 2022,
         normograma de la Cancillería, capturado el 3-ago-2026.
         Snapshot: snapshots/co-verificacion-2026-08/ */
      w.push("This visa does not let you work or carry out paid activity for any person or company domiciled in Colombia.");
      w.push("If your passport does not need a short-stay visa, you can enter without any visa and stay up to 90 days, extendable to a maximum of 180 days per calendar year, as long as no Colombian company pays you.");
      w.push("Approval is always a prerogative of the Colombian State.");
      return coDn(score);
    },
    student: function (p) {
      var r = genericDe("CO", "student", p);
      var uno = Array.isArray(r) ? r[0] : r;
      uno.matched = (uno.matched || []).concat([
        "Colombia issues studies through the Visitor visa (V), category Estudiante."]);
      uno.warnings = (uno.warnings || []).concat([
        "The Visitor visa is meant for a temporary activity, without the intention of settling in the country.",
        "Every visa application is filed through the Foreign Ministry's digital platform, not on paper.",
        "For primary, secondary or undergraduate studies with the intention of settling there is a separate Migrant visa (M).",
        "Always verify with Colombia's Ministerio de Relaciones Exteriores (cancilleria.gov.co)."]);
      uno.officialName = "Colombia Visa de Visitante (V) — Estudiante";
      uno.route = "co_student_v";
      return r;
    },
    tourist: function (p) {
      var r = genericDe("CO", "tourist", p);
      var uno = Array.isArray(r) ? r[0] : r;
      uno.matched = (uno.matched || []).concat([
        "Colombia handles tourism through the Visitor visa (V), category Turismo, for those nationalities that need a visa."]);
      uno.warnings = (uno.warnings || []).concat([
        "The Visitor visa is meant for a temporary activity, without the intention of settling in the country.",
        "Every visa application is filed through the Foreign Ministry's digital platform, not on paper.",
        "Always verify with Colombia's Ministerio de Relaciones Exteriores (cancilleria.gov.co)."]);
      uno.officialName = "Colombia Visa de Visitante (V) — Turismo";
      uno.route = "co_tourist_v";
      return r;
    },
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
  /* ── PERÚ: calidad migratoria de trabajador residente AUDITADA (v1.136.0)
     Fuente: Superintendencia Nacional de Migraciones (gob.pe), capturado con el
     navegador real del usuario el 3-ago-2026 — gob.pe rechaza los navegadores
     automatizados con «Acceso restringido».
     Snapshot: snapshots/pe-verificacion-2026-08/
     Lo decisivo: hay que estar FUERA del país para obtenerla. */
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

  /* v1.136.0 — la tarjeta peruana ya estaba casi auditada: solo faltaba el
     dato que más cambia los planes, y que la fuente publica como CONDICIÓN.
     Fuente: gob.pe (Superintendencia Nacional de Migraciones), capturado con el
     navegador real del usuario el 3-ago-2026: gob.pe rechaza los navegadores
     automatizados con «Acceso restringido».
     Snapshot: snapshots/pe-verificacion-2026-08/ */
  /* v1.154.0 — ESTE ENVOLTORIO SE PEGABA A LA TARJETA EQUIVOCADA. Cogía r[0],
     «la primera tarjeta», y desde que los nacionales del Mercosur reciben la suya
     esa primera dejó de ser la peruana. Resultado: el aviso «debes estar FUERA de
     Perú» —que la fuente publica para la calidad de trabajador residente— aterrizó
     en la tarjeta del Acuerdo del Mercosur, donde además contradice al tratado
     (su artículo 3.2 permite regularizarse ya estando dentro), y DESAPARECIÓ de la
     tarjeta a la que pertenece. Un dato no se pega por posición: se pega por ruta. */
  COUNTRY_RULES.PE.work = (function (base) {
    return function (p) {
      var r = base(p);
      var lista = Array.isArray(r) ? r : [r];
      lista.forEach(function (c) {
        if (c.route === "pe_work") {
          c.warnings = ["You must be OUTSIDE Peru to obtain this migration status."]
            .concat(c.warnings || []);
        }
        c.warnings = (c.warnings || []).concat(
          ["Always verify with Peru's Superintendencia Nacional de Migraciones (gob.pe)."]);
      });
      return r;
    };
  })(COUNTRY_RULES.PE.work);

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
    w.push("Always verify with the Ecuadorian Ministry of Foreign Affairs.");
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
    w.push("Always verify with the Ecuadorian Ministry of Foreign Affairs.");
    var r = visaResult("work", Math.min(b.score, b.tope), m, w, []);
    /* v1.138.0 — la lista oficial de categorías de residencia temporal, que
       hasta ahora la app no nombraba. Fuente: cancilleria.gob.ec, capturada con
       el navegador real del usuario el 3-ago-2026.
       Snapshot: snapshots/ec-verificacion-2026-08/ */
    m.push("Ecuador's temporary residence has a category for work under an employment relationship, and separate ones for autonomous work, professional services and consultancy.");
    w.push("There are also categories for Rentista, Jubilado, Inversionista and MERCOSUR nationals.");
    r.officialName = "Ecuador temporary resident visa for work";
    r.route = "ec_work";
    cards.push(r);
    return cards;
  };

  /* ── ECUADOR: estudios y nómada digital con la taxonomía oficial (v1.138.0)
     Ecuador SÍ tiene visa de nómada digital: «Rentista para trabajo remoto
     (Visa Nómada)» aparece en la lista oficial de categorías.
     LÍMITE COMPROBADO: las fichas de detalle viven en gob.ec, que rechaza la
     conexión desde esta red y congela el renderizador incluso en el navegador
     real. La app afirma qué categorías existen y DECLARA que no ha capturado
     los requisitos. Los importes que circulan por internet no se citan. */
  COUNTRY_RULES.EC.student = function (p) {
    var b = estudioBase(p, 60), m = b.m, w = b.w;
    m.push("Ecuador has a dedicated Estudiante category within its temporary residence visa.");
    w.push("Wayfare has not captured the specific requirements for this category from an official page: check them before you rely on this route.");
    w.push("Always verify with the Ecuadorian Ministry of Foreign Affairs (cancilleria.gob.ec).");
    var r = visaResult("student", Math.min(b.score, b.tope), m, w,
      eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
    r.officialName = "Ecuador temporary residence — Estudiante";
    r.route = "ec_student";
    return r;
  };

  COUNTRY_RULES.EC.digital_nomad = function (p) {
    var m = [], w = [], x = [], score = 30;
    m.push("Ecuador publishes a digital nomad category: Rentista para trabajo remoto (Visa Nomada), within its temporary residence visa.");
    if (p.remoteWork) { score += 26; m.push("Your profile indicates remote work, which is the primary condition for this route."); }
    else { w.push("This route is for people who work remotely, and your profile does not indicate remote work."); x.push("remote"); }
    w.push("Wayfare has not captured the specific requirements for this category from an official page: check them before you rely on this route.");
    w.push("Always verify with the Ecuadorian Ministry of Foreign Affairs (cancilleria.gob.ec).");
    var r = visaResult("digital_nomad", Math.min(score, 62), m, w, x);
    r.officialName = "Ecuador temporary residence — Rentista para trabajo remoto (Visa Nomada)";
    r.route = "ec_digital_nomad";
    return r;
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
           "Approval is always a prerogative of the Uruguayan State."],
          []);
        r.officialName = "Uruguay Residencia Legal — Permanente Mercosur";
        r.route = "uy_work_mercosur";
        return r;
      }
      /* v1.135.0 — AUDITADO. Fuente: Dirección Nacional de Migración
         (gub.uy/tramites/residencia-legal-temporaria, «Última actualización:
         12/03/2026»), capturado con navegador real el 3-ago-2026.
         Snapshot: snapshots/uy-verificacion-2026-08/ */
      var mT = ["Uruguay's Residencia Temporaria is open to any nationality, for work or study, for a minimum of 6 months and a maximum of 2 years, extendable."],
          wT = [];
      wT.push("For work you need a letterhead letter from the employer stating your activity and contract period, with monthly pay equal to or above the Uruguayan national minimum wage.");
      wT.push("That letter must come with a notarial certificate of the company's details, or a BPS employment history record.");
      wT.push("Foreign documents must be apostilled or legalised and translated by a Uruguayan public translator, except Brazilian ones; electronic documents that can be verified need neither.");
      wT.push("If you do not speak Spanish you must attend the appointment with an interpreter.");
      wT.push("Always verify with Uruguay's Dirección Nacional de Migración (gub.uy).");
      var rT = visaResult("work", 62, mT, wT, []);
      rT.officialName = "Uruguay Residencia Legal — Temporaria (trabajo)";
      rT.route = "uy_work_temporaria";
      return rT;
    },
    digital_nomad: function (p) {
      var m = ["Uruguay grants a special residence permit for people who work on their own account or for companies abroad."],
          w = [], x = [], score = 32;
      if (p.remoteWork) { score += 26; m.push("Your profile indicates remote work, which is the primary condition for this route."); }
      else { w.push("This route is for people who work remotely, and your profile does not indicate remote work."); x.push("remote"); }
      m.push("You enter Uruguay as an ordinary tourist and then apply online for six months as a digital nomad, with a signed sworn statement that you have the means to support yourself.");
      w.push("To extend for a further six months, and complete the year, you must show you have no criminal record in any country where you lived more than six months in the last five years, plus a vaccination certificate issued in Uruguay.");
      w.push("Always verify with Uruguay's Dirección Nacional de Migración (gub.uy).");
      var r = visaResult("digital_nomad", Math.min(score, 70), m, w, x);
      r.officialName = "Uruguay digital nomad residence permit (hoja de identidad provisoria)";
      r.route = "uy_digital_nomad";
      return r;
    },
    student: function (p) {
      var m = ["Uruguay's Residencia Temporaria is open to any nationality, for work or study, for a minimum of 6 months and a maximum of 2 years, extendable."],
          w = [];
      m.push("For studies the residence is granted for up to a year, extendable for equal periods, without exceeding two years of the whole course.");
      w.push("You must prove your student status with an official certificate from the institution, and show means of support sufficient to maintain yourself.");
      w.push("If you have no means of your own you can use a relative's, proving the relationship, or a notarial certificate of money received from abroad.");
      w.push("Foreign documents must be apostilled or legalised and translated by a Uruguayan public translator, except Brazilian ones; electronic documents that can be verified need neither.");
      w.push("Always verify with Uruguay's Dirección Nacional de Migración (gub.uy).");
      var r = visaResult("student", 64, m, w, []);
      r.officialName = "Uruguay Residencia Legal — Temporaria (estudios)";
      r.route = "uy_study_temporaria";
      return r;
    },
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
    w.push("Always verify with the Paraguayan Ministry of Foreign Affairs.");
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
    w.push("Always verify with the Bolivian consular network.");
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

  /* ── BOLIVIA: lo ÚNICO que faltaba (v1.139.0) ────────────────────────────
     Las tarjetas bolivianas ya estaban bien surtidas; no repito lo que ya
     dicen. Lo que no contaban, y decide el trámite entero, es que Bolivia
     ordena las nacionalidades en TRES grupos, y que el tercero necesita además
     una resolución previa de DIGEMIG antes de poder pedir nada.
     Fuente: red consular de la Cancillería (consulados.cancilleria.gob.bo),
     capturada con el navegador real del usuario el 3-ago-2026. migracion.gob.bo
     redirige sus rutas de detalle a la portada y gob.bo/tramite/1418 da 404.
     Snapshot: snapshots/bo-verificacion-2026-08/ */
  COUNTRY_RULES.BO.work = (function (base) {
    return function (p) {
      var r = base(p);
      var uno = Array.isArray(r) ? r[r.length - 1] : r;
      uno.warnings = (uno.warnings || []).concat([
        "Bolivia sorts nationalities into three groups: Group I needs no tourist visa, Group II does, and Group III also needs a prior entry authorisation from the Dirección General de Migración (DIGEMIG).",
        "Visas are issued by Bolivian consulates and embassies abroad.",
        "Always verify with Bolivia's consular network (consulados.cancilleria.gob.bo)."]);
      return r;
    };
  })(COUNTRY_RULES.BO.work);

  /* v1.72.0 — Vietnam y Sri Lanka: destinos nómada MUY populares pero SIN visa
     dedicada → ruta honesta (estilo AU/CA/NZ/CL/GE); el resto de sus tipos,
     genérico desde mock.js (recordar: COUNTRY_RULES manda sobre esa lista). */
  function honestDN(frases, pais, fuente) {
    return function (p) {
      /* v1.145.0 — tercer argumento opcional: cuando la ausencia SÍ está
         respaldada por el catálogo oficial completo del país, se cita la fuente
         en vez de decir «orientación simulada». India y Fiyi son los primeros. */
      var cierre = fuente
        ? ["The official catalogue of visas published by " + fuente + " has no digital nomad or remote work category.",
           "Always verify with the official immigration source of this destination."]
        : ["Simulated guidance only. Always verify with official immigration sources."];
      var r = visaResult("digital_nomad", p.remoteWork ? 32 : 12,
        p.remoteWork ? ["Your profile indicates remote work, which is the main factor for nomad-style stays."] : [],
        frases.concat(cierre),
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

     v1.152.0 — SE LEVANTA EL RECORTE. El usuario autorizó ampliar Venezuela el
     4-ago-2026, y las fuentes ya estaban capturadas: entran estudios, trabajo y
     la tarjeta honesta de remoto. Snapshot: snapshots/ve-2026-08/.
     El catálogo del ministerio (mppre.gob.ve/detalles_servicio/1, HTTP 200)
     lista los TRECE visados venezolanos y entre ellos NO hay nómada digital:
     ese es el respaldo del honestDN, no una suposición.
     Los requisitos literales de TR-E y TR-L vienen de las fichas consulares
     (colombia.embajada.gob.ve), porque info.saime.gob.ve NO RESUELVE POR DNS.
     ⚠ La ficha del TR-L tiene una errata de la propia embajada: lista «ser
     familiar de un extranjero titular de un visado de Transeúnte Laboral»
     entre los requisitos, que es el requisito de OTRO visado. No se copia.
  ========================================================================= */
  COUNTRY_RULES.VE = reglasModeladas("VE", {
    student: function (p) {
      var b = estudioBase(p, 60), m = b.m, w = b.w;
      m.push("Venezuela's student transit visa is granted to non-migrants entering for higher, technical or university studies, for specialisation, or for internships in their field.");
      w.push("This visa is only open to nationalities for which Venezuela has not suppressed the visa requirement.");
      w.push("Your passport must be valid for at least six months.");
      w.push("You must provide proof of enrolment from the institution that backs your application.");
      w.push("Always verify with the Venezuelan Ministry of Foreign Affairs.");
      var r = visaResult("student", Math.min(b.score, b.tope), m, w,
        eduRank(p.education) < eduRank("secondary") ? ["minEdu"] : []);
      r.officialName = "Venezuela student transit visa (TR-E)";
      r.route = "ve_student";
      return r;
    },
    work: function (p) {
      var b = trabajoBase(p, 58), m = b.m, w = b.w;
      m.push("Venezuela's labour transit visa is the route for foreigners coming to work.");
      w.push("This visa is not decided by the consulate alone: the Ministry of Interior, Justice and Peace authorises it, and only after the Ministry of Labour agrees.");
      w.push("The application is filed before the Ministry of Labour by whoever hires you, or by you as the worker, so you cannot start it on your own from abroad.");
      w.push("Your passport must be valid for more than six months.");
      finReq("You must pay the consular fee.", w);
      w.push("Always verify with the Venezuelan Ministry of Foreign Affairs.");
      var r = visaResult("work", Math.min(b.score, b.tope), m, w, []);
      r.officialName = "Venezuela labour transit visa (TR-L)";
      r.route = "ve_work";
      return r;
    },
    digital_nomad: honestDN([
      "Venezuela's published catalogue covers permanent migrant family, domestic employee, rentier (TR-RE), business owner or industrialist, re-entry (TR-RI), Venezuelan family member, student (TR-E), religious (TR-REL), labour (TR-L), investor (TR-I), business (TR-N), transit (V-T) and tourist (T) visas.",
      "The closest categories are the rentier visa, for people living on income from abroad, and the business visa, but neither is designed for remote work for a foreign employer.",
    ], { nombre: "Venezuela", iso: "VE" },
       "the Venezuelan Ministry of Foreign Affairs"),
    tourist: function (p) {
      var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
      if (pt <= 2) { score += 20; m.push("Your passport nationality is generally accepted for visits to this destination."); }
      else         { score += 10; w.push("Additional documentation requirements may apply for your passport nationality."); }
      m.push("Venezuela's tourist visa is granted to foreigners entering for leisure, health or activities that do not involve pay or profit.");
      w.push("You need the original passport and a copy, valid for at least six months.");
      finReq("You must provide a bank letter stating when the account was opened, its number and its balance.", w);
      w.push("Always verify with the Venezuelan Ministry of Foreign Affairs.");
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
      w.push("This permit is exclusively for studying: while it is valid you are banned from working, except for the placements and internships your centre requires.");
      finReq("A certified cheque for B/.250.00 payable to the National Treasury is required.", w);
      w.push("Always verify with the Servicio Nacional de Migración.");
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
      w.push("Always verify with the Servicio Nacional de Migración.");
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
      w.push("Always verify with the Servicio Nacional de Migración.");
      var r = visaResult("tourist", clamp(score + 32, 0, 64), m, w, x);
      r.officialName = "Panama visitor entry (Ley de Migración, artículo 43)";
      r.route = "pa_tourist";
      return r;
    },
  });

  /* ── PANAMÁ: la tarjeta de trabajo, con el mapa real de vías (v1.139.0) ──
     Estudios y trabajador remoto ya estaban auditados. Faltaba trabajo, y lo
     que la app no contaba es que Panamá NO tiene una vía única: reparte el
     trabajo entre no residentes (visas de corta estancia y trabajadores
     eventuales) y residentes temporales por razones laborales, cada una atada
     a un supuesto concreto.
     Fuente: Servicio Nacional de Migración (migracion.gob.pa/permisos-migratorios),
     capturado con navegador real el 3-ago-2026.
     Snapshot: snapshots/pa-verificacion-2026-08/ */
  COUNTRY_RULES.PA.work = (function (base) {
    return function (p) {
      var r = base ? base(p) : trabajoGenerico("PA", p);
      var uno = Array.isArray(r) ? r[r.length - 1] : r;
      uno.matched = (uno.matched || []).concat([
        "Panama does not have a single work route: it splits work between non-resident visas and temporary residence permits for labour reasons."]);
      uno.warnings = (uno.warnings || []).concat([
        "Among temporary residence for labour reasons there is a category for foreign staff paid from abroad without diplomatic status, and others for government contractors, Colon Free Zone executives, international press correspondents and sports professionals.",
        "As a non-resident there are also visas for occasional workers and technicians (V-TET), domestic workers and touring or occasional artists.",
        "Each category is tied to a specific situation, so the right one depends on who hires you and where the money comes from.",
        "Always verify with Panama's Servicio Nacional de Migración (migracion.gob.pa)."]);
      uno.officialName = "Panama work permits (no residente and residente temporal por razones laborales)";
      uno.route = "pa_work_permisos";
      return r;
    };
  })(COUNTRY_RULES.PA.work);

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
      w.push("Always verify with the Dominican Ministry of Foreign Affairs.");
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
      w.push("Always verify with the Dominican Ministry of Foreign Affairs.");
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
      w.push("Always verify with the Dominican Ministry of Foreign Affairs.");
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
      w.push("Always verify with Nicaragua's Dirección General de Migración y Extranjería.");
      var r = visaResult("tourist", clamp(score + 30, 0, 62), m, w, x);
      r.officialName = "Nicaragua entry visa (categoría A / visa consultada C)";
      r.route = "ni_tourist";
      return r;
    },
  });
  /* ── NICARAGUA: la residencia temporal de estudiante (v1.142.0) ──────────
     Fuente: Dirección General de Migración y Extranjería (migob.gob.ni),
     capturada con navegador real el 3-ago-2026. Snapshot: snapshots/ni-2026-08/
     Detalle que sorprende: la traducción la tiene que hacer un traductor
     autorizado ante un notario con MÁS DE DIEZ AÑOS de ejercicio. */
  COUNTRY_RULES.NI.student = (function (base) {
    return function (p) {
      var r = base(p);
      var uno = Array.isArray(r) ? r[0] : r;
      if (!uno.route) { uno.officialName = "Nicaragua residencia temporal (estudiante)"; uno.route = "ni_student"; }
      uno.matched = (uno.matched || []).concat([
        "Nicaragua grants studies through a temporary residence, applied for at the Dirección General de Migración y Extranjería."]);
      uno.warnings = (uno.warnings || []).concat([
        "You need a pre-enrolment certificate from the institution stating your details, level, course and study period.",
        "You must also present a notarised declaration of where the money to fund your studies comes from, or one from whoever will cover your costs in Nicaragua.",
        "Your degree or school certificate, or your transcripts, must be apostilled or authenticated.",
        "Common requirements include a passport valid at least six months, a criminal record certificate covering the last three years, and a health certificate.",
        "Documents from abroad must be translated into Spanish by a translator authorised before a notary with more than ten years in practice.",
        "Every step of the procedure has to be done in person.",
        "Always verify with Nicaragua's Dirección General de Migración y Extranjería (migob.gob.ni)."]);
      return r;
    };
  })(COUNTRY_RULES.NI.student);

  /* ── REPÚBLICA DOMINICANA: el catálogo publicado (v1.141.0) ──────────────
     Fuente: Dirección General de Migración (migracion.gob.do), capturada con
     navegador real el 3-ago-2026. Snapshot: snapshots/do-bz-2026-08/
     El permiso de estudiante es de NO residente y se renueva hasta seis años:
     eso no lo decía la app. Y su catálogo completo confirma que no hay
     categoría de nómada digital. */
  COUNTRY_RULES.DO.student = (function (base) {
    return function (p) {
      var r = base(p);
      var uno = Array.isArray(r) ? r[0] : r;
      uno.matched = (uno.matched || []).concat([
        "The Dominican student permit (E-1) is a non-resident permit for studying at an officially registered institution, valid one year and renewable annually up to six years."]);
      uno.warnings = (uno.warnings || []).concat([
        "You need a passport valid at least six months, the student visa (E), an apostilled birth certificate and a criminal record certificate from your country or wherever you lived in the last five years.",
        "Always verify with the Dirección General de Migración of the Dominican Republic (migracion.gob.do)."]);
      return r;
    };
  })(COUNTRY_RULES.DO.student);

  COUNTRY_RULES.DO.digital_nomad = (function (base) {
    return function (p) {
      var r = base(p);
      var uno = Array.isArray(r) ? r[0] : r;
      uno.warnings = (uno.warnings || []).concat([
        "The published catalogue of permits and residences covers business (NG-1), short stay (PCP), seasonal workers, labour temporary residence (RT-3), investors, pensioners and rentiers, and none of them is a digital nomad category.",
        "Always verify with the Dirección General de Migración of the Dominican Republic (migracion.gob.do)."]);
      return r;
    };
  })(COUNTRY_RULES.DO.digital_nomad);


  COUNTRY_RULES.CU = reglasModeladas("CU", {
    tourist: function (p) {
      var m = [], w = [], x = [], pt = passportTier(p.nationality), score = 0;
      if (pt <= 2) { score += 20; m.push("Your passport nationality is generally accepted for visits to this destination."); }
      else         { score += 10; w.push("Additional documentation requirements may apply for your passport nationality."); }
      m.push("Cuba issues tourist visas or tourist cards only to foreigners travelling for pleasure, tourism or recreation, by air or sea.");
      w.push("The card is valid for a single entry and a 90-day stay, extendable once for the same period.");
      w.push("Foreign minors need their own individual tourist card, even if they appear in their parents' passports.");
      w.push("Always verify with Cuba's Ministry of Foreign Affairs.");
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
      w.push("Always verify with the Instituto Guatemalteco de Migración.");
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
      w.push("Always verify with the Indian Bureau of Immigration.");
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
      w.push("Always verify with the Indian Bureau of Immigration.");
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
      w.push("Always verify with the Indian Bureau of Immigration.");
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
    w.push("Always verify with the Qatari Ministry of Interior.");
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
    { nombre: "India", iso: "IN" }, "the Bureau of Immigration of India") });

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
      w.push("Always verify with the Fiji Immigration Department.");
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
      w.push("Always verify with the Fiji Immigration Department.");
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
      w.push("Always verify with the Fiji Immigration Department.");
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
    { nombre: "Fiji", iso: "FJ" }, "Fiji's Ministry of Immigration") });

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
      w.push("Always verify with the Salvadoran migration authority.");
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
      w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var r = visaResult("digital_nomad", clamp(score + 10, 0, 62), m, w, []);
      r.officialName = "El Salvador digital nomad residence";
      r.route = "sv_digital_nomad";
      return r;
    },
  });
  /* ── QATAR: el permiso de residencia por trabajo (v1.144.0) ──────────────
     Fuente: Hukoomi, portal oficial del Gobierno de Qatar, capturado con
     navegador real el 3-ago-2026. Snapshot: snapshots/qa-vn-2026-08/
     El dato duro: mientras se convierte el visado temporal en permiso —de dos
     a cuatro semanas, a veces más— NO PUEDES SALIR DEL PAÍS. */
  COUNTRY_RULES.QA.work = (function (base) {
    return function (p) {
      var r = base(p);
      var uno = Array.isArray(r) ? r[0] : r;
      if (!uno.route) { uno.officialName = "Qatar Work Residence Permit (RP)"; uno.route = "qa_work"; }
      uno.matched = (uno.matched || []).concat([
        "Everyone who wants to work and live in Qatar needs a Work Residence Permit, and for that a Qatari employer, whether a company or an individual.",
        "The permit lets you personally sponsor your spouse and children to come and live with you."]);
      uno.warnings = (uno.warnings || []).concat([
        "The employer normally handles all the paperwork: they arrange a temporary visa on arrival which is then converted into the work residence permit.",
        "That conversion usually takes two to four weeks and sometimes longer, and you may NOT leave the country while it is going on.",
        "The permit is renewed every year by your employer, not by you.",
        "Each family member, including infants, needs their own Family Residence Visa, bought for one to five years and stamped in their passport.",
        "Always verify with Qatar's official government portal (hukoomi.gov.qa)."]);
      return r;
    };
  })(COUNTRY_RULES.QA.work);

  COUNTRY_RULES.QA.student = (function (base) {
    return function (p) {
      var r = base(p);
      var uno = Array.isArray(r) ? r[0] : r;
      if (!uno.route) { uno.officialName = "Qatar residence permit (studies)"; uno.route = "qa_student"; }
      uno.warnings = (uno.warnings || []).concat([
        "Qatar organises long stays around the residence permit, which needs a sponsor in the country.",
        "Wayfare has not captured the specific student conditions from an official page: check them before you rely on this route.",
        "Always verify with Qatar's official government portal (hukoomi.gov.qa)."]);
      return r;
    };
  })(COUNTRY_RULES.QA.student);

  /* ── EL SALVADOR: el catálogo de formularios (v1.140.0) ──────────────────
     Fuente: migracion.gob.sv/servicios/residencias-temporales, capturado con
     navegador real el 3-ago-2026. Snapshot: snapshots/cr-gt-sv-2026-08/
     El Salvador publica cada residencia temporal con SU formulario numerado:
     trabajar es la F3 y estudiar la F10. Y en ese catálogo NO hay ninguna
     categoría de nómada digital ni de trabajo remoto. */
  ["student", "work"].forEach(function (tipo) {
    var base = COUNTRY_RULES.SV[tipo];
    if (!base) return;
    COUNTRY_RULES.SV[tipo] = function (p) {
      var r = base(p);
      var uno = Array.isArray(r) ? r[0] : r;
      if (!uno.route) {
        uno.officialName = (tipo === "student")
          ? "El Salvador Residencia Temporal Estudios (F10)"
          : "El Salvador Residencia Temporal con Autorizacion de Trabajar (F3)";
        uno.route = "sv_" + tipo;
      }
      uno.matched = (uno.matched || []).concat([
        tipo === "student"
          ? "El Salvador publishes studies as its own temporary residence with its own form: F10 Residencia Temporal Estudios."
          : "El Salvador publishes work as its own temporary residence with its own form: F3 Residencia Temporal con Autorización de Trabajar."]);
      uno.warnings = (uno.warnings || []).concat([
        "Each temporary residence has its own numbered form, and there are separate ones for investors, business people, pensioners, rentiers, shareholders and accompanying family.",
        "Always verify with El Salvador's Dirección General de Migración y Extranjería (migracion.gob.sv)."]);
      return r;
    };
  });

  /* ── GUATEMALA: la regla de los cinco años (v1.140.0) ────────────────────
     Fuente: igm.gob.gt/residencias, capturado con navegador real el 3-ago-2026.
     Snapshot: snapshots/cr-gt-sv-2026-08/
     Lo que cambia planes: la residencia temporal NO se puede estirar más de
     cinco años... salvo si estudias, que puedes prorrogarla mientras duren los
     estudios. Es una excepción que casi nadie conoce. */
  ["student", "work"].forEach(function (tipo) {
    var base = COUNTRY_RULES.GT[tipo];
    if (!base) return;
    COUNTRY_RULES.GT[tipo] = function (p) {
      var r = base(p);
      var uno = Array.isArray(r) ? r[0] : r;
      if (!uno.route) {
        uno.officialName = (tipo === "student")
          ? "Guatemala residencia temporal (estudiante)"
          : "Guatemala residencia temporal (trabajador migrante)";
        uno.route = "gt_" + tipo;
      }
      uno.matched = (uno.matched || []).concat([
        "Guatemalan residence is the ordinary migratory status, temporary or permanent, and the temporary one can be renewed."]);
      if (tipo === "student") {
        uno.matched.push("Students are the exception to the five-year ceiling: a temporary student residence can be renewed for as long as the studies last.");
      } else {
        uno.warnings.push("To stay as a resident beyond five years you must move to permanent residence under article 78 of the Migration Code.");
      }
      uno.warnings = (uno.warnings || []).concat([
        "The general requirements are the application form, a valid original passport with a fully legalised copy, a criminal and police record certificate with apostille, a certificate of your last entry movement, and a 25 US dollar fee.",
        "Being a temporary resident for five years or more is one of the routes to permanent residence; for people born elsewhere in Central America it is one year.",
        "Always verify with the Instituto Guatemalteco de Migración (igm.gob.gt)."]);
      return r;
    };
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
      w.push("Always verify with the Belize Immigration Department.");
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
      w.push("Always verify with the Belize Immigration Department.");
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
      w.push("Always verify with the Belize Immigration Department.");
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
      /* v1.141.0 — CORREGIDO. Esta frase decía «(less for a couple applying
         together)»: era al revés. La fuente oficial exige MÁS a las parejas y
         familias — 100.000 $ frente a 75.000 $. Un error que empujaba a
         solicitar a quien no llegaba al umbral. */
      w.push("You must show annual earnings of at least US$75,000, and more for a couple or family, plus health insurance covering at least US$50,000.");
      w.push("The income threshold is high: check it carefully before applying.");
      w.push("This route could not be verified against a captured official source yet. Treat as preliminary guidance.");
      var r = visaResult("digital_nomad", clamp(score + 10, 0, 62), m, w, []);
      r.officialName = "Belize Work Where You Vacation (remote workers)";
      r.route = "bz_digital_nomad";
      return r;
    },
  });
  /* ── BELICE: Work Where You Vacation con sus cifras (v1.141.0) ───────────
     Fuente: Belize Tourism Board (travelbelize.org/work-where-you-vacation),
     capturada con navegador real el 3-ago-2026. El trámite se presenta ante el
     Departamento de Inmigración. Snapshot: snapshots/do-bz-2026-08/
     Lo que de verdad decide: el umbral de renta, que es alto. */
  COUNTRY_RULES.BZ.digital_nomad = (function (base) {
    return function (p) {
      var r = base(p);
      var uno = Array.isArray(r) ? r[0] : r;
      uno.matched = (uno.matched || []).concat([
        "Work Where You Vacation waives work permits for participants and student permits for their children, who can enrol in Belizean schools."]);
      uno.warnings = (uno.warnings || []).filter(function (t) {
        return !/could not be verified against a captured official source/.test(t);
      }).concat([
        "For couples and families the income threshold rises to 100,000 US dollars a year.",
        "You also need a notarised banking reference and statement, a criminal record no more than six months old, a valid passport and travel insurance with at least 50,000 US dollars of cover.",
        "The fee is 500 Belize dollars per adult and 200 per child under 18, and it is paid at the airport.",
        "Always verify with Belize's Immigration Department (immigration.gov.bz)."]);
      return r;
    };
  })(COUNTRY_RULES.BZ.digital_nomad);

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
    /* v1.155.0 — le faltaba el segundo argumento, así que salía SIN NOMBRE ni
       ruta: en pantalla, una tarjeta sin título e invisible para el auditor. */
    digital_nomad: honestDN([
      "Vietnam does not currently offer a dedicated Digital Nomad visa.",
      "Remote workers commonly use the 90-day tourist e-visa; longer stays require another visa type."],
      { nombre: "Vietnam", iso: "VN" }),

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
    /* v1.145.0 — CORREGIDO. La app afirmaba que Sri Lanka NO tiene visa de
       nómada digital. SÍ LA TIENE: el Department of Immigration and Emigration
       publica su ficha oficial en PDF. Era una negativa falsa, del peor tipo:
       cerraba una puerta que está abierta.
       Fuente: immigration.gov.lk, PDF «Digital Nomad Visa Category», extraído
       con PDFKit el 3-ago-2026. Snapshot: snapshots/in-lk-fj-2026-08/ */
    digital_nomad: function (p) {
      var m = [], w = [], x = [], score = 30;
      m.push("Sri Lanka offers a Digital Nomad Visa for foreign professionals who live and work remotely while serving clients or companies outside the country.");
      if (p.remoteWork) { score += 26; m.push("Your profile indicates remote work, which is the primary condition for this route."); }
      else { w.push("This route is for people who work remotely, and your profile does not indicate remote work."); x.push("remote"); }
      m.push("It lasts one year, renewable annually, and your spouse and dependants can come with you.");
      m.push("Holders can open Sri Lankan bank accounts, sign rental or lease agreements and enrol dependent children in international or private schools.");
      w.push("You must be 18 or older and be in remote employment, freelancing, or own a business not registered in Sri Lanka that serves clients abroad.");
      w.push("You must remit at least 2,000 US dollars a month, plus 500 more for each dependant beyond two.");
      w.push("You need a police clearance certificate no older than three months, a medical clearance report, international health insurance covering care in Sri Lanka, and a recommendation from the Ministry of Digital Economy.");
      w.push("The fee is 500 US dollars a year for the main applicant and 500 for each spouse or dependant.");
      w.push("To renew you must show tax registration with the Inland Revenue Department.");
      w.push("You are not permitted to take local employment in Sri Lanka: all your income must come from abroad.");
      w.push("Any change in employment, income or dependants must be notified within 30 days, and breaking the conditions can cancel the visa immediately.");
      w.push("Always verify with Sri Lanka's Department of Immigration and Emigration (immigration.gov.lk).");
      var r = visaResult("digital_nomad", Math.min(score, 72), m, w, x);
      r.officialName = "Sri Lanka Digital Nomad Visa (DNV)";
      r.route = "lk_digital_nomad";
      return r;
    },
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
      w.push("Always verify with the Sri Lanka Department of Immigration and Emigration.");
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
      w.push("Always verify with the Sri Lanka Department of Immigration and Emigration.");
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
      w.push("Always verify with the Sri Lanka Department of Immigration and Emigration.");
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
      /* v1.115.0 — EL DINERO DEJA DE PUNTUAR Y DEJA DE AFIRMARSE.
         El cuestionario NO pregunta por ahorros: ui/App.jsx fijaba savings=15000
         en duro, así que la app le decía a TODO usuario que cumplía requisitos
         financieros que nunca había declarado, y esos puntos falsos le movían de
         banda. El umbral oficial se mantiene, pero como información. */
      var score = 55;
      w.push("You must show living funds: a bank statement for the last 3 months with at least USD $2,000.");
      w.push("Bank records must show salary or income of at least US$60,000 per year, plus an employment agreement with the foreign company.");
      w.push("The visa fee (PNBP) is Rp 7,000,000 for the 1-year stay, plus other components.");
      w.push("Your passport must be valid for at least 6 months.");
      w.push("Approval is always a prerogative of the Indonesian State.");
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
  /* ── INDONESIA: el visado de estudios, con sus prohibiciones (v1.143.0) ──
     Fuente: portal oficial de e-Visa de la Dirección General de Inmigración
     (evisa.imigrasi.go.id), capturado con navegador real el 3-ago-2026.
     Snapshot: snapshots/id-ae-2026-08/
     Lo que importa y no se decía: con este visado NO puedes trabajar, ni vender
     nada, ni cobrar de nadie en Indonesia. Ni siquiera una colaboración suelta. */
  COUNTRY_RULES.ID.student = (function (base) {
    return function (p) {
      var r = base(p);
      var uno = Array.isArray(r) ? r[0] : r;
      if (!uno.route) { uno.officialName = "Indonesia student visa (e-ITAS on arrival)"; uno.route = "id_student"; }
      uno.matched = (uno.matched || []).concat([
        "Indonesia issues the student visa for one, two or four years, all extendable.",
        "It lets you bring eligible family members, and to enter and leave the country while the re-entry permit is valid.",
        "If you meet the conditions you get the electronic limited stay permit (e-ITAS) and the re-entry permit on arrival, without going to an immigration office."]);
      uno.warnings = (uno.warnings || []).concat([
        "You are prohibited from doing work or employment, from selling goods or services, and from receiving any payment or wages from people or companies in Indonesia.",
        "You need a passport valid at least six months, proof of living expenses of at least 2,000 US dollars, a CV, a travel itinerary, a guarantee letter from an Indonesian guarantor or from the institution, and a letter of acceptance stating how long you will be enrolled.",
        "The visa costs 6,000,000 rupiah for up to one year, 8,500,000 for two and 12,000,000 for four, and must be used within 90 days of issue.",
        "Always verify with Indonesia's Directorate General of Immigration (imigrasi.go.id)."]);
      return r;
    };
  })(COUNTRY_RULES.ID.student);

  /* ── INDONESIA: TRABAJO. Lo que la fuente oficial NO publica (v1.156.0) ──
     Hasta v1.155.0 esta tarjeta era relleno genérico —«la mayoría de los visados
     de trabajo exigen una oferta de empleo»— sin una palabra sobre Indonesia, y
     desde v1.155.0 se declaraba honestamente sin fuente.
     Al ir a capturarla apareció algo que merece contarse: la Dirección General
     de Inmigración publica su catálogo completo, con CATORCE vías de trabajo…
     y de las catorce, la ficha de trece dice literalmente «Data Belum Tersedia»
     (datos aún no disponibles). Incluido el visado de trabajo general, el E23.
     La única con requisitos publicados es la de investigador, la E29.
     Comprobado que no es un fallo del sitio: C1, E28B, E31A y E33G sí cargan.
     Fuente: imigrasi.go.id/wna/daftar-visa-indonesia, capturado el 4-ago-2026.
     Snapshot: snapshots/id-trabajo-2026-08/
     OJO: no se copia NADA de las agencias de visados que salen al buscar «E23
     requisitos». Si la fuente oficial no lo publica, Wayfare no lo afirma. */
  COUNTRY_RULES.ID.work = function (p) {
    var b = trabajoBase(p, 46), m = b.m, w = b.w;
    m.push("Indonesia's official visa list has a family of work visas: the general Work Visa (E23), company officer visas (E25), offshore and maritime crew (E26), religious worker (E27) and researcher (E29).");
    w.push("Of that whole family, Indonesia's immigration department has published the requirements of only one: the researcher visa. Every other work visa, including the general E23, is listed on the official site as data not yet available.");
    w.push("For the researcher visa, the limited stay is one year counted from your date of arrival, and it can be extended online through the immigration e-visa portal.");
    w.push("You need a sponsor to apply, and your sponsor must already hold an account on that portal before applying on your behalf.");
    finReq("The published fee for the researcher visa is 6,000,000 rupiah for a one-year stay, made up of the visa, the limited stay permit, the re-entry permit and a verification charge.", w);
    w.push("Always verify with Indonesia's Directorate General of Immigration (imigrasi.go.id).");
    var rID = visaResult("work", Math.min(b.score, b.tope), m, w, []);
    rID.officialName = "Indonesia work visas (E23 family) — requirements not published";
    rID.route = "id_work";
    return rID;
  };


  /* =========================================================================
     EVALUATE ONE COUNTRY
  ========================================================================= */
  function evaluateCountry(country, profile) {
    var iso   = country.iso;
    var rules = COUNTRY_RULES[iso];

    /* v1.115.0 — TU PROPIO PAÍS. Hasta ahora la app trataba al usuario como un
       extranjero cualquiera en su país de nacionalidad: a un boliviano le decía
       «coincidencia parcial» para una visa de turista a Bolivia, y a un
       australiano le ofrecía una visa de trabajo cualificado en Australia.
       Nadie necesita visado para entrar en el país del que es nacional. */
    if (profile.nationality && iso === profile.nationality) {
      return {
        iso: iso, name: country.name, region: country.region || "other",
        synthetic: !!country.synthetic, status: "eligible", score: 100,
        ownCountry: true,
        visas: [visaResult("tourist", 100,
          ["This is your country of citizenship: you do not need a visa to enter, live, study or work here."],
          [], [])]
      };
    }

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
        /* ===================================================================
           v1.155.0 — AQUÍ, Y NO ANTES. Una tarjeta que llega hasta este punto
           SIN RUTA es una que ningún país ha reclamado como vía suya: puro
           relleno genérico. Lee lo que enseñaba Indonesia — «tu nivel educativo
           parece cumplir los requisitos habituales», «la mayoría de visados de
           trabajo exigen una oferta de empleo»— sin una palabra sobre Indonesia,
           idéntica a la de Cuba o Honduras, y puntuando 63 en naranja al lado de
           tarjetas con tratado detrás.

           Es lo mismo que matamos en v1.132.0 a nivel de PAÍS, cuando el
           generador de azar inventaba notas. Seguía vivo a nivel de TARJETA.

           Los consejos se quedan —son ciertos— pero se cae la puntuación, que es
           lo que no podemos respaldar. Y le ponemos nombre y ruta: hasta hoy
           estas tarjetas eran INVISIBLES para el auditor, que solo mira rutas. */
        if (!one.route) {
          var tipoLegible = { tourist: "visitor", student: "study", work: "work",
                              digital_nomad: "remote work",
                              work_and_holiday: "working holiday" }[one.type] || one.type;
          one.warnings = (one.warnings || []).concat(
            ["Wayfare has not yet captured an official source for the " + tipoLegible +
             " route in this destination, so this card carries no score: general guidance only, not an assessment of your case."]);
          one.matched      = [];
          one.score        = null;
          one.officialName = "No official source captured yet";
          one.route        = "sin_fuente_" + one.type;
        }
        one.status = scoreToStatus(one.score);
        visaResults.push(one);
      });
    });

    /* v1.155.0 — si NINGUNA tarjeta tiene puntuación, el país tampoco tiene
       veredicto. Antes caía en «ineligible» por defecto, y el mapa pintaba de
       rojo «poco probable» a un país del que sencillamente no sabemos nada:
       la misma mentira que las tarjetas, un nivel más arriba. */
    var countryStatus;
    if (visaResults.length && visaResults.every(function(r) { return r.status === "nodata"; })) {
      countryStatus = "nodata";
    } else {
      countryStatus = "ineligible";
      if (visaResults.some(function(r) { return r.status === "eligible"; }))  countryStatus = "eligible";
      else if (visaResults.some(function(r) { return r.status === "partial"; })) countryStatus = "partial";
    }

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
      /* Las tarjetas sin puntuación van al final: null en una resta da resultados
         raros y las colaba entre medias de las que sí valoran algo. */
      visas: visaResults.sort(function(a, b) {
        if (a.score === null && b.score === null) return 0;
        if (a.score === null) return 1;
        if (b.score === null) return -1;
        return b.score - a.score;
      }),
    };
  }

  /* =========================================================================
     SYNTHETIC FALLBACK
  ========================================================================= */
  function syntheticCountry(iso, name, profile) {
    /* v1.132.0 — ANTES ESTA FUNCIÓN INVENTABA PUNTUACIONES.
       Usaba un generador pseudoaleatorio con semilla (mulberry32) para fabricar
       de una a dos tarjetas de visa con notas entre 12 y 88, ajustadas por el
       nivel del pasaporte, y las presentaba con el mismo aspecto que un
       resultado real. Un usuario español que pinchaba Rusia leía «Nómada
       digital · Podrías calificar · 95». Ese 95 no significaba nada: salía de
       una función de azar. El único aviso era una nota pequeña, y encima el
       texto de dentro de la tarjeta estaba sin traducir.

       Wayfare no puede inventar un número y enseñarlo como resultado. Si no hay
       datos de un país, se dice que no hay datos. Sin tarjetas y sin nota.
       La leyenda ya tenía la categoría «Aún sin datos» para esto. */
    return {
      iso: iso, name: name, region: "other",
      synthetic: true, noData: true,
      status: "nodata", score: null, visas: []
    };
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
    /* v1.132.0 — cuenta también los países sin datos. Antes t[r.status]++ con
       un estado desconocido escribía NaN en el contador. */
    var t = { eligible: 0, partial: 0, ineligible: 0, nodata: 0 };
    Object.values(resultsMap).forEach(function(r) {
      if (t[r.status] === undefined) return;
      t[r.status]++;
    });
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

  /* v1.132.0 — HUECO DESCUBIERTO EL 3-AGO-2026 ─────────────────────────────
     El mapa colorea y deja pinchar 22 países que NO están en VISA_DATA.COUNTRIES
     (Austria, Bélgica, Bulgaria, Croacia, Chipre, Chequia, Dinamarca, Finlandia,
     Grecia, Hungría, Islandia, Letonia, Liechtenstein, Lituania, Luxemburgo,
     Malta, Noruega, Polonia, Rumanía, Eslovaquia, Eslovenia y Suiza): el motor
     los sabe evaluar porque tienen entrada en COUNTRY_RULES.
     El problema: las guardias barrían solo la lista de datos, así que las
     tarjetas de esos 22 países NO las miraba nadie. Y ninguno de los 47
     destinos de la lista usa ya la fábrica genérica pura, porque todos los
     europeos tienen regla propia: el texto genérico quedaba sin vigilar.
     Esta función expone TODO lo que el motor puede evaluar, para que las
     guardias barran la superficie real y no una parte. */
  function evaluableCountries() {
    var vistos = {}, salida = [];
    (D.COUNTRIES || []).forEach(function (c) {
      var iso = c.iso || c.code; if (iso && !vistos[iso]) { vistos[iso] = 1; salida.push(iso); }
    });
    Object.keys(COUNTRY_RULES).forEach(function (iso) {
      if (!vistos[iso]) { vistos[iso] = 1; salida.push(iso); }
    });
    return salida;
  }

  return {
    passportTier: passportTier, evaluateCountry: evaluateCountry,
    evaluateAll: evaluateAll, resolveCountry: resolveCountry,
    topRecommendations: topRecommendations, tally: tally,
    hasRealRules: hasRealRules, specialAccess: specialAccess,
    evaluableCountries: evaluableCountries,
  };

})();