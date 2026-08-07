/* =============================================================================
   i18n STRING TABLES  (EN / ES)
   -----------------------------------------------------------------------------
   All user-facing copy lives here. Components read strings via t(key) so adding
   a language later = adding one more object. Enum values (education levels,
   visa types, regions, countries) are translated through dedicated maps so the
   data layer never stores display text.
   ========================================================================== */

window.I18N = {
  en: {
    /* v1.173.0 — ESTAS OCHO CLAVES ESTABAN FUERA DEL BLOQUE DE IDIOMA.
       Colgaban un nivel más arriba, en la raíz de window.I18N, y t() busca
       dentro de I18N[idioma]. Resultado: nunca se encontraban.
       Dos se notaban de verdad: los botones de cerrar se anunciaban a los
       lectores de pantalla como «a11y_close», y el mapa compartido se
       descargaba con el nombre «share_filename» en vez de wayfare-mi-mapa.png.
       Las otras seis tenían texto de reserva en el código y por eso no cantaban.
       Apareció al mirar el aria-label del tirador nuevo. */
    /* v1.176.0 — avisos por correo cuando cambie una fuente oficial */
    bol_previa: "⚠ Preview: this does not work yet. It is here so you can see where the product is going — tell us what you think.",
    bol_titulo: "Want us to email you if anything changes in {pais}?",
    bol_sub: "Only when an official source changes: a rule, a requirement, or a quota opening. Nothing else.",
    bol_placeholder: "your@email.com",
    bol_consent: "I want to receive these notices, and I have read the",
    bol_boton: "Notify me",
    bol_enviando: "Sending…",
    bol_revisa: "Check your inbox",
    bol_revisa_pie: "We have sent you an email to confirm. Until you click it you are not subscribed — that is on purpose.",
    bol_error: "It could not be sent. Try again in a moment.",
    a11y_close: "Close",
    app_version_title: "App version",
    q_reset_confirm: "This will delete your saved profile and your map on this device. Continue?",
    crash_title: "Something broke on our side",
    crash_text: "Sorry — this screen failed to load. Your saved profile is untouched. Reloading usually fixes it.",
    crash_reload: "Reload",
    crash_reset: "Reload and start from scratch",
    share_filename: "wayfare-my-map.png",
    vc_modelled_title: "This route is modelled: we have not captured its official source yet. Check it before you make any decision.",
    vc_modelled: "No captured official source",
    /* brand + chrome */
    brand: "Wayfare",
    tagline: "See where in the world you could go.",
    lang_label: "EN",

    /* questionnaire */
    q_title: "Build your mobility profile",
    q_sub: "Answer a few questions and we'll map every country against your eligibility. Your answers are saved only on this device (your browser) — nothing is sent to any server.",
    sec_identity: "About you",
    sec_identity_sub: "The essentials that shape what you qualify for.",
    sec_education: "Education",
    sec_education_sub: "Your highest level of completed education.",
    sec_background: "Education & work",
    sec_background_sub: "What you bring to a destination.",
    sec_means: "Language & work style",
    sec_means_sub: "Language level and remote work shape which routes fit you.",
    sec_intent: "What you're looking for",
    sec_intent_sub: "Tell us where your head's at — we'll prioritise it.",

    f_nationality: "Current passport",
    f_residence: "Current country of residence",
    f_age: "Age",
    f_situation: "You're moving",
    f_education: "Highest education",
    f_profession: "Field of work",
    f_experience: "Years of experience",
    f_english: "English level",
    f_savings: "Approximate savings (USD)",
    f_remote_work: "Do you work remotely?",
    f_monthly_income: "Approximate monthly income",
    f_monthly_income_hint: "Enable remote work to add monthly income.",
    remote_yes: "Yes",
    remote_no: "No",
    f_countries: "Countries you're curious about",
    f_visas: "What do you want to do?",
    goal_study: "Study",
    goal_work: "Work",
    goal_tourism: "Tourism / travel",
    goal_remote: "Work remotely",
    f_countries_hint: "Optional — pick any that excite you. We still scan the whole map.",
    f_visas_hint: "Pick one or several — your map is built around your goals.",
    goal_required: "Choose at least one goal so we can build your map.",

    submit: "Map my options",
    reset: "Reset",

    /* situations */
    sit_alone: "Alone",
    sit_partner: "With a partner",
    sit_family: "With family",

    /* education */
    edu_primary: "Primary education",
    edu_secondary: "Secondary education",
    edu_baccalaureate: "Baccalaureate / Upper secondary",
    edu_university_plus: "University studies or higher",

    /* english */
    eng_basic: "Basic",
    eng_intermediate: "Intermediate",
    eng_advanced: "Advanced",
    eng_native: "Native",
    eng_a1: "A1",
    eng_a2: "A2",
    eng_b1: "B1",
    eng_b2: "B2",
    eng_c1: "C1",
    eng_c2: "C2",
    f_english_hint: "CEFR levels — A1 beginner to C2 mastery/native.",

    /* professions */
    prof_tech: "Tech & engineering",
    prof_health: "Healthcare",
    prof_business: "Business & finance",
    prof_creative: "Creative & media",
    prof_education: "Education",
    prof_trades: "Skilled trades",
    prof_hospitality: "Hospitality & service",
    prof_other: "Other",

    /* processing */
    p_title: "Scanning the globe",
    p_step1: "Reading your profile",
    p_step2: "Matching passport mobility",
    p_step3: "Checking visa requirements",
    p_step4: "Scoring every country",
    p_live_routes: "Checking %N% official visa routes",
    p_live_facts: "Cross-checking %N% verified facts",
    p_live_dest: "Reviewing %N% audited destinations",

    /* globe + results */
    g_overview: "Your results",
    g_eligible_count: "may match",
    g_partial_count: "partial",
    g_unlikely_count: "unlikely",
    g_recs: "Top matches for you",
    g_click_hint: "Spin the globe to find your region — zoom in to see the flags and pick your country.",
    g_no_selection: "No country selected",
    g_no_selection_sub: "Tap any country on the globe to see which visas could fit your profile.",
    /* v1.104.0 — ficha vacía: Venezuela, Nicaragua y Cuba no tienen rutas para
       algunos objetivos (recortes deliberados) y el panel se quedaba MUDO. */
    g_no_visas_goal: "Nothing here for that objective",
    g_no_visas_goal_sub: "Wayfare has no visa modelled in this destination for the objective you chose. Try another objective in your profile.",
    g_visas_here: "Visa programs here",
    g_missing: "Missing",
    g_matched: "What you seem to meet",
    g_warnings: "Requirements & warnings",
    g_score: "Score",
    g_restart: "Edit profile",
    g_profile: "Profile",
    g_simulated: "Simulated eligibility",
    g_verified_prefix: "Data checked against official government sources — last source check: ",
    sa_eu_freedom: "Freedom of movement: as an EU/EEA citizen you can travel, live, work and study in this country without a visa.",
    sa_trans_tasman: "Trans-Tasman arrangement: Australian and New Zealand citizens can visit, live and work in each other's country without applying for a visa in advance. Check official sources for conditions.",
    sa_cta: "Common Travel Area: British and Irish citizens can live, work and study in each other's country without a visa.",
    g_unverified_note: "Not yet audited against official sources — treat as demo guidance.",
    ev_btn_title: "Show the official evidence for this requirement",
    ev_source: "Official source",
    ev_captured: "captured ",
    ev_review: "pending review",
    adv_section: "Verified immigration advisers",
    adv_demo_note: "Demo profiles: these advisers are fictitious examples while we finish onboarding real licensed professionals. Tell us what you think of this section!",
    adv_reviews: "reviews",
    adv_reviews_title: "Read the reviews in the full directory",
    adv_lic_title: "Check this licence in the official register",
    adv_web: "Website ↗",
    adv_langs: "Languages: ",
    adv_view_all: "See the full verified directory →",
    q_back_map: "Back to my map",
    q_reset: "Reset and start from scratch (clears your saved profile)",
    q_discard: "Discard my changes and go back to my map",
    submit_update: "Update my map with these changes",
    cmp_btn: "Compare destinations",
    cmp_title: "Side-by-side comparison",
    cmp_choose: "Compare with…",
    cmp_note: "Same profile, same engine: each column is evaluated with your answers. Simulated guidance only.",
    elg_load_error: "Eligibility engine failed to load. Please check eligibility.js.",
    disclaimer_short: "Simulated guidance only. Wayfare is not an immigration adviser or migration agency.",
    legal_privacy: "Privacy",
    legal_notice: "Legal notice",
    disclaimer_long: "Wayfare is not an immigration adviser or migration agency. Results are simulated for general guidance only and are not legal or immigration advice. Always check official government sources before applying.",
    g_nodata_panel: "Wayfare does not have data for this country yet. Rather than showing you a number we cannot back, we prefer to tell you so.",
    g_legend_nodata: "No data yet",
    g_legend_eligible: "May qualify",
    g_legend_partial: "Partial match",
    g_legend_unlikely: "Unlikely",
    demo_map_tag: "Example map",
    demo_map_text: "You're viewing a sample result (Spanish passport, age 25) so you can see how Wayfare works.",
    demo_map_cta: "Make YOUR map — 2 minutes",
    g_share_btn: "Share your map",
    g_share_text: "My passport could take me to {E} countries (plus {P} more with conditions). Find your own map on Wayfare:",
    g_share_copied: "Copied! Paste it anywhere — your map image was downloaded too.",
    g_share_saved: "Your map image was downloaded. Link: edulino-byte.github.io/wayfare-site",
    g_share_img_countries: "countries are waiting for me",
    g_share_img_footer: "Find your map · data verified against official sources",

    /* statuses */
    st_eligible: "Likely eligible",
    st_partial: "Close — some gaps",
    st_ineligible: "Unlikely",
    /* v1.155.0 — una tarjeta sin fuente capturada no lleva veredicto */
    st_nodata: "No source captured yet",
    ap_comprobado: "Checked with the official source on ",
    ap_abierta: "Open now",
    ap_cerrada_sin_fecha: "Closed \u00b7 no date published",
    ap_cerrada_abre: "Closed \u00b7 opens ",

    /* requirement labels (for "missing") */
    rq_minAge: "minimum age",
    rq_maxAge: "age limit",
    rq_minSavings: "savings",
    rq_minEdu: "education",
    rq_minExp: "experience",
    rq_minEnglish: "English level",
    rq_passport: "passport eligibility",

    /* visa type names */
    vt_student: "Student Visa",
    vt_work_and_holiday: "Work and Holiday Visa",
    vt_work: "Work Visa",
    vt_tourist: "Tourist Visa",
    vt_digital_nomad: "Digital Nomad Visa",

    /* regions */
    rg_europe: "Europe",
    rg_asia: "Asia",
    rg_north_america: "North America",
    rg_south_america: "South America",
    rg_oceania: "Oceania",
    rg_africa: "Africa",
    rg_other: "Elsewhere",

    units_years: "yrs",

    /* ── Australia visa result translations (keys = exact EN strings from eligibility.js) ── */
    /* Official names */
    "Working Holiday visa (subclass 417)": "Working Holiday visa (subclass 417)",
    "Work and Holiday visa (subclass 462)": "Work and Holiday visa (subclass 462)",
    "Student visa (subclass 500)": "Student visa (subclass 500)",
    "Visitor visa (subclass 600) — Tourist stream": "Visitor visa (subclass 600) — Tourist stream",

    /* 417 matched */
    "Your passport appears to match the subclass 417 eligible passport list.": "Your passport appears to match the subclass 417 eligible passport list.",
    "Your age appears to be within the allowed range for your passport under subclass 417 (18 to 35).": "Your age appears to be within the allowed range for your passport under subclass 417 (18 to 35).",
    "Your age appears to be within the allowed range for your passport under subclass 417 (18 to 30).": "Your age appears to be within the allowed range for your passport under subclass 417 (18 to 30).",
    "Your age appears to be outside the allowed range for subclass 417. The allowed range for your passport is 18 to 35.": "Your age appears to be outside the allowed range for subclass 417. The allowed range for your passport is 18 to 35.",
    "Your age appears to be outside the allowed range for subclass 417. The allowed range for your passport is 18 to 30.": "Your age appears to be outside the allowed range for subclass 417. The allowed range for your passport is 18 to 30.",

    /* 417 / shared warnings */
    "You may need around AUD 5,000 for your initial stay, plus enough to cover onward travel after leaving Australia.": "You may need around AUD 5,000 for your initial stay, plus enough to cover onward travel after leaving Australia.",
    "Always verify with the Australian Department of Home Affairs (immi.homeaffairs.gov.au).": "Always verify with the Australian Department of Home Affairs (immi.homeaffairs.gov.au).",
    "As a New Zealand citizen, the Special Category visa (subclass 444) granted on arrival already lets you visit, study and work in Australia without employer sponsorship.": "As a New Zealand citizen, the Special Category visa (subclass 444) granted on arrival already lets you visit, study and work in Australia without employer sponsorship.",
    "Sponsorship and visa assessment may be more complex for your passport nationality.": "Sponsorship and visa assessment may be more complex for your passport nationality.",
    "You must remain a New Zealand citizen and continue to meet the character requirements.": "You must remain a New Zealand citizen and continue to meet the character requirements.",

    /* 417 notEvaluated */
    "You must apply online from outside Australia.": "You must apply online from outside Australia.",
    "You must apply on your own and cannot include family members in the application.": "You must apply on your own and cannot include family members in the application.",
    "You must not be accompanied by dependent children.": "You must not be accompanied by dependent children.",
    "You must not have previously entered Australia on a subclass 417 or 462 visa.": "You must not have previously entered Australia on a subclass 417 or 462 visa.",
    "You must meet health and character requirements.": "You must meet health and character requirements.",
    "You must have paid back, or arranged to repay, any debts to the Australian Government.": "You must have paid back, or arranged to repay, any debts to the Australian Government.",
    "Your immigration history, including cancelled visas or refused applications, may be considered.": "Your immigration history, including cancelled visas or refused applications, may be considered.",
    "You must acknowledge the Australian Values Statement.": "You must acknowledge the Australian Values Statement.",

    /* 462 matched */
    "Your passport appears to match the subclass 462 eligible passport list.": "Your passport appears to match the subclass 462 eligible passport list.",
    "Your age appears to be within the 18 to 30 range.": "Your age appears to be within the 18 to 30 range.",
    "Your education appears to align with the subclass 462 education requirement for your passport.": "Your education appears to align with the subclass 462 education requirement for your passport.",
    "Your education appears to meet the Senior Secondary requirement for this passport route.": "Your education appears to meet the Senior Secondary requirement for this passport route.",
    "Your English level appears to align with the Functional English requirement.": "Your English level appears to align with the Functional English requirement.",

    /* 462 warnings */
    "Your age appears to be outside the 18 to 30 range for subclass 462.": "Your age appears to be outside the 18 to 30 range for subclass 462.",
    "This passport route may require a tertiary qualification or completion of at least 2 years of undergraduate university study.": "This passport route may require a tertiary qualification or completion of at least 2 years of undergraduate university study.",
    "This passport route may require at least 2 years of post-secondary study.": "This passport route may require at least 2 years of post-secondary study.",
    "Chile passport holders may need tertiary qualifications or completion/approval for third-year undergraduate study.": "Chile passport holders may need tertiary qualifications or completion/approval for third-year undergraduate study.",
    "Israel passport holders may need a Senior Secondary Certificate of Education or equivalent.": "Israel passport holders may need a Senior Secondary Certificate of Education or equivalent.",
    "Israel passport holders may also need to show completed military service or legal exemption from military service.": "Israel passport holders may also need to show completed military service or legal exemption from military service.",
    "Malaysia passport holders should verify their qualification type meets the accepted list (degrees, graduate diplomas, graduate certificates).": "Malaysia passport holders should verify their qualification type meets the accepted list (degrees, graduate diplomas, graduate certificates).",
    "Malaysia passport holders may need an accepted tertiary qualification or completion of 2 years of undergraduate university study.": "Malaysia passport holders may need an accepted tertiary qualification or completion of 2 years of undergraduate university study.",
    "Malaysia passport holders may need a Good Conduct Certificate or accepted support document.": "Malaysia passport holders may need a Good Conduct Certificate or accepted support document.",
    "Thailand passport holders may need a tertiary qualification from a university, college or training centre.": "Thailand passport holders may need a tertiary qualification from a university, college or training centre.",
    "Switzerland passport holders may need to show 2 years of study following compulsory schooling.": "Switzerland passport holders may need to show 2 years of study following compulsory schooling.",
    "United States passport holders may need a Senior Secondary Certificate of Education or equivalent.": "United States passport holders may need a Senior Secondary Certificate of Education or equivalent.",
    "You may need to show Functional English through an approved passport, study history, or English test/assessment.": "You may need to show Functional English through an approved passport, study history, or English test/assessment.",
    "Israel passport holders may need to show Functional English through the English Bagrut route or another approved method.": "Israel passport holders may need to show Functional English through the English Bagrut route or another approved method.",
    "This passport route may require a government letter of support or an accepted alternative.": "This passport route may require a government letter of support or an accepted alternative.",
    "Passport holders from China, India and Vietnam must participate in a visa pre-application process/ballot and be randomly selected before they can apply. Wayfare cannot determine whether you have been selected.": "Passport holders from China, India and Vietnam must participate in a visa pre-application process/ballot and be randomly selected before they can apply. Wayfare cannot determine whether you have been selected.",
    "You may need to be selected through the subclass 462 pre-application ballot before you can apply.": "You may need to be selected through the subclass 462 pre-application ballot before you can apply.",
    "Your passport does not appear to be listed for Australia's Working Holiday visa subclass 417 or Work and Holiday visa subclass 462.": "Your passport does not appear to be listed for Australia's Working Holiday visa subclass 417 or Work and Holiday visa subclass 462.",
    "Check the Australian Department of Home Affairs website for the full current eligibility lists.": "Check the Australian Department of Home Affairs website for the full current eligibility lists.",
    "You must not have previously entered Australia on a subclass 462 or 417 visa.": "You must not have previously entered Australia on a subclass 462 or 417 visa.",

    /* 500 matched / warnings */
    "Your age appears to meet the minimum age requirement for subclass 500.": "Your age appears to meet the minimum age requirement for subclass 500.",
    "Student visa subclass 500 generally requires applicants to be at least 6 years old.": "Student visa subclass 500 generally requires applicants to be at least 6 years old.",
    "Applicants under 18 may need to prove adequate welfare arrangements while in Australia.": "Applicants under 18 may need to prove adequate welfare arrangements while in Australia.",
    "For applicants under 18, the visa may not be granted if it is not in the best interests of the child.": "For applicants under 18, the visa may not be granted if it is not in the best interests of the child.",
    "Your English level appears to align with the possible English evidence requirement, although official evidence may still be required.": "Your English level appears to align with the possible English evidence requirement, although official evidence may still be required.",
    "You may need to provide evidence of English language skills or fall into an exemption category.": "You may need to provide evidence of English language skills or fall into an exemption category.",
    "Your education background may support a student visa pathway, depending on your intended course.": "Your education background may support a student visa pathway, depending on your intended course.",
    "Your intended course and enrolment evidence will be more important than prior education level.": "Your intended course and enrolment evidence will be more important than prior education level.",
    "You must be enrolled in an eligible course of study in Australia.": "You must be enrolled in an eligible course of study in Australia.",
    "You must provide a valid Confirmation of Enrolment (CoE), unless another accepted evidence pathway applies.": "You must provide a valid Confirmation of Enrolment (CoE), unless another accepted evidence pathway applies.",
    "You must hold Overseas Student Health Cover (OSHC), unless an exemption applies.": "You must hold Overseas Student Health Cover (OSHC), unless an exemption applies.",
    "You may need to show evidence of English language skills, unless exempt.": "You may need to show evidence of English language skills, unless exempt.",
    "You must show that you are a genuine student and that studying in Australia is the primary reason for the visa.": "You must show that you are a genuine student and that studying in Australia is the primary reason for the visa.",
    "You must have enough money for your stay. Wayfare does not currently assess financial evidence.": "You must have enough money for your stay. Wayfare does not currently assess financial evidence.",
    "If you are 18 or older, you must acknowledge the Australian Values Statement.": "If you are 18 or older, you must acknowledge the Australian Values Statement.",
    "If applying while in Australia, you may need to hold an eligible substantive visa.": "If applying while in Australia, you may need to hold an eligible substantive visa.",

    /* 600 matched / warnings */
    "This route does not appear to require a specific eligible passport list based on the captured official page.": "This route does not appear to require a specific eligible passport list based on the captured official page.",
    "Your current residence appears consistent with an outside-Australia tourist stream, but your actual location at application time must be checked.": "Your current residence appears consistent with an outside-Australia tourist stream, but your actual location at application time must be checked.",
    "This tourist stream requires you to be outside Australia when you apply and when the visa is decided.": "This tourist stream requires you to be outside Australia when you apply and when the visa is decided.",
    "You must be a genuine visitor and only intend to stay temporarily in Australia.": "You must be a genuine visitor and only intend to stay temporarily in Australia.",
    "You must have, or have access to, enough money to support yourself while in Australia. Wayfare does not currently assess financial evidence.": "You must have, or have access to, enough money to support yourself while in Australia. Wayfare does not currently assess financial evidence.",
    "This visa does not allow work in Australia. If you plan to work remotely while in Australia, you should check official conditions carefully.": "This visa does not allow work in Australia. If you plan to work remotely while in Australia, you should check official conditions carefully.",
    "You must intend to visit Australia only, such as tourism, a cruise, or visiting family or friends.": "You must intend to visit Australia only, such as tourism, a cruise, or visiting family or friends.",
    "This tourist stream is not for business or medical treatment purposes.": "This tourist stream is not for business or medical treatment purposes.",
    "You must not work in Australia.": "You must not work in Australia.",
    "You must be outside Australia when you apply and when the visa is decided.": "You must be outside Australia when you apply and when the visa is decided.",
    "You must be a genuine visitor and obey any visa conditions and stay period.": "You must be a genuine visitor and obey any visa conditions and stay period.",

    /* AU digital nomad */
    "Australia does not currently offer a dedicated Digital Nomad visa. Remote work on a visitor visa is a legally uncertain arrangement.": "Australia does not currently offer a dedicated Digital Nomad visa. Remote work on a visitor visa is a legally uncertain arrangement.",
    "Remote work status is the primary factor for digital nomad-style stays.": "Remote work status is the primary factor for digital nomad-style stays.",
    "Your profile indicates remote work, which is the main factor for this route.": "Your profile indicates remote work, which is the main factor for this route.",
    "Income requirements for extended stays should be verified against official visitor visa guidance.": "Income requirements for extended stays should be verified against official visitor visa guidance.",
    "You may need to show sufficient funds for your planned stay. Check official visitor visa requirements.": "You may need to show sufficient funds for your planned stay. Check official visitor visa requirements.",
    "You may need to show sufficient funds for your stay. Check official visitor visa requirements.": "You may need to show sufficient funds for your stay. Check official visitor visa requirements.",

    /* ── New Zealand Working Holiday — official names ── */
    "Argentina Working Holiday Visa": "Argentina Working Holiday Visa",
    "Austria Working Holiday Visa": "Austria Working Holiday Visa",
    "Belgium Working Holiday Visa": "Belgium Working Holiday Visa",
    "Brazil Working Holiday Visa": "Brazil Working Holiday Visa",
    "Canada Working Holiday Visa": "Canada Working Holiday Visa",
    "Chile Working Holiday Visa": "Chile Working Holiday Visa",
    "China Working Holiday Visa": "China Working Holiday Visa",
    "Croatia Working Holiday Visa": "Croatia Working Holiday Visa",

    /* ── New Zealand Working Holiday — matched ── */
    "Your passport appears to be eligible for a New Zealand Working Holiday visa.": "Your passport appears to be eligible for a New Zealand Working Holiday visa.",
    "Your age appears to be within the eligible range for this visa (18 to 35).": "Your age appears to be within the eligible range for this visa (18 to 35).",
    "Your age appears to be within the eligible range for this visa (18 to 30).": "Your age appears to be within the eligible range for this visa (18 to 30).",
    "You appear to be living in China, which this visa requires.": "You appear to be living in China, which this visa requires.",
    "Your education appears to meet the senior high school requirement for this visa.": "Your education appears to meet the senior high school requirement for this visa.",
    "Your English level appears to meet the requirement to speak and understand English.": "Your English level appears to meet the requirement to speak and understand English.",

    /* ── New Zealand Working Holiday — warnings ── */
    "Your age appears to be outside the eligible range for this visa. The range is 18 to 35.": "Your age appears to be outside the eligible range for this visa. The range is 18 to 35.",
    "Your age appears to be outside the eligible range for this visa. The range is 18 to 30.": "Your age appears to be outside the eligible range for this visa. The range is 18 to 30.",
    "You may need to show around NZD 2,250 in living expenses, plus enough funds for onward travel.": "You may need to show around NZD 2,250 in living expenses, plus enough funds for onward travel.",
    "You may need to show around NZD 4,200 in living expenses, plus enough funds for onward travel.": "You may need to show around NZD 4,200 in living expenses, plus enough funds for onward travel.",
    "The application fee starts from NZD 770.": "The application fee starts from NZD 770.",
    "This visa has a limited annual quota of about 1,000 places, which can run out.": "This visa has a limited annual quota of about 1,000 places, which can run out.",
    "This visa has a limited annual quota of about 940 places, which can run out.": "This visa has a limited annual quota of about 940 places, which can run out.",
    "This visa has a limited annual quota of about 300 places, which can run out.": "This visa has a limited annual quota of about 300 places, which can run out.",
    "This visa has a limited annual quota of about 100 places, which can run out.": "This visa has a limited annual quota of about 100 places, which can run out.",
    "You must hold full medical and hospital insurance for your entire stay in New Zealand.": "You must hold full medical and hospital insurance for your entire stay in New Zealand.",
    "You must have a genuine intention to holiday in New Zealand, with any work being secondary.": "You must have a genuine intention to holiday in New Zealand, with any work being secondary.",
    "You must plan to leave New Zealand at the end of your stay.": "You must plan to leave New Zealand at the end of your stay.",
    "You must not have held a New Zealand Working Holiday visa before.": "You must not have held a New Zealand Working Holiday visa before.",
    "You cannot take permanent employment, and no job offer is required before you apply.": "You cannot take permanent employment, and no job offer is required before you apply.",
    "Any partner or child travelling with you must apply for their own visa.": "Any partner or child travelling with you must apply for their own visa.",
    "You can work for any one employer for up to 3 months.": "You can work for any one employer for up to 3 months.",
    "You can work for any one employer for up to 6 months.": "You can work for any one employer for up to 6 months.",
    "You can study or train for up to 6 months during your stay.": "You can study or train for up to 6 months during your stay.",
    "If you stay longer than 12 months, you may need a chest X-ray and medical examination.": "If you stay longer than 12 months, you may need a chest X-ray and medical examination.",
    "This visa requires you to normally live in China and to be in China when you apply. Your current residence does not appear to be China.": "This visa requires you to normally live in China and to be in China when you apply. Your current residence does not appear to be China.",
    "This visa requires a senior high school qualification involving at least 3 years of full-time study.": "This visa requires a senior high school qualification involving at least 3 years of full-time study.",
    "You must be able to speak and understand English, and may need an English test result that is no more than 2 years old.": "You must be able to speak and understand English, and may need an English test result that is no more than 2 years old.",
    "You will need extra documents, including a supplementary form for Chinese citizens, proof that you normally live in China, a verified senior high school qualification, and possibly an English test result, a medical or chest X-ray, and police certificates.": "You will need extra documents, including a supplementary form for Chinese citizens, proof that you normally live in China, a verified senior high school qualification, and possibly an English test result, a medical or chest X-ray, and police certificates.",
    "Your passport does not appear to be on the New Zealand Working Holiday visa country list that Wayfare currently covers.": "Your passport does not appear to be on the New Zealand Working Holiday visa country list that Wayfare currently covers.",
    "Check Immigration New Zealand for the full list of eligible countries and conditions.": "Check Immigration New Zealand for the full list of eligible countries and conditions.",
    "This is simulated guidance only. Always verify with Immigration New Zealand.": "This is simulated guidance only. Always verify with Immigration New Zealand.",
    "Always verify with Immigration New Zealand.": "This is simulated guidance only. Always verify with Immigration New Zealand.",

    /* ── New Zealand Working Holiday — validated dataset additions ── */
    "You must be a citizen of the country offering this Working Holiday arrangement and hold a valid passport.": "You must be a citizen of the country offering this Working Holiday arrangement and hold a valid passport.",
    "Your passport should be valid for at least 3 months after the visa expires.": "Your passport should be valid for at least 3 months after the visa expires.",
    "If you apply from outside New Zealand, your passport may need to be valid for at least 15 months after you arrive.": "If you apply from outside New Zealand, your passport may need to be valid for at least 15 months after you arrive.",
    "If you apply from inside New Zealand, your passport may need to be valid for at least 3 months after the visa expires.": "If you apply from inside New Zealand, your passport may need to be valid for at least 3 months after the visa expires.",
    "You must have funds for onward travel, or a ticket to leave New Zealand.": "You must have funds for onward travel, or a ticket to leave New Zealand.",
    "Immigration New Zealand may ask for medical examinations, chest X-rays or police certificates.": "Immigration New Zealand may ask for medical examinations, chest X-rays or police certificates.",
    "You must not have held a New Zealand Working Holiday visa before, unless a country-specific subsequent or extension rule applies.": "You must not have held a New Zealand Working Holiday visa before, unless a country-specific subsequent or extension rule applies.",
    "You can work in temporary jobs during your stay.": "You can work in temporary jobs during your stay.",
    "You can apply for a 12-month or a 23-month visa.": "You can apply for a 12-month or a 23-month visa.",
    "With a 12-month visa, you may later apply for a subsequent work visa to extend your stay up to 23 months if you meet extra criteria.": "With a 12-month visa, you may later apply for a subsequent work visa to extend your stay up to 23 months if you meet extra criteria.",
    "You can travel in and out of New Zealand while your visa is valid.": "You can travel in and out of New Zealand while your visa is valid.",
    "You must not have been outside China for more than 2 years immediately before you apply.": "You must not have been outside China for more than 2 years immediately before you apply.",
    "Your senior high school qualification may need to be verified by CSSD, Ministry of Education, PRC.": "Your senior high school qualification may need to be verified by CSSD, Ministry of Education, PRC.",
    "You must complete the Supplementary Form for Chinese citizens, and your Hukou household registration book may be used as additional identity evidence.": "You must complete the Supplementary Form for Chinese citizens, and your Hukou household registration book may be used as additional identity evidence.",
    "If you are coming to New Zealand for more than 6 months, applicants from China, Hong Kong or Macao may need a recent chest X-ray.": "If you are coming to New Zealand for more than 6 months, applicants from China, Hong Kong or Macao may need a recent chest X-ray.",

    /* ── New Zealand Working Holiday — CZ + DK ── */
    "Czech Working Holiday Visa": "Czech Working Holiday Visa",
    "Denmark Working Holiday Visa": "Denmark Working Holiday Visa",
    "This visa has a limited annual quota of about 1,200 places, which can run out.": "This visa has a limited annual quota of about 1,200 places, which can run out.",
    "You may be able to stay longer by applying for a Working Holiday Extension Work Visa if you do seasonal work in the viticulture or horticulture industries.": "You may be able to stay longer by applying for a Working Holiday Extension Work Visa if you do seasonal work in the viticulture or horticulture industries.",

    /* ── New Zealand Working Holiday — EE + FI + FR ── */
    "Estonia Working Holiday Visa": "Estonia Working Holiday Visa",
    "Finland Working Holiday Visa": "Finland Working Holiday Visa",
    "France Working Holiday Visa": "France Working Holiday Visa",
    "Germany Working Holiday Visa": "Germany Working Holiday Visa",
    "Hungary Working Holiday Visa": "Hungary Working Holiday Visa",
    "Ireland Working Holiday Visa": "Ireland Working Holiday Visa",
    "Italy Working Holiday Visa": "Italy Working Holiday Visa",
    "Japan Working Holiday Visa": "Japan Working Holiday Visa",
    "Latvia Working Holiday Visa": "Latvia Working Holiday Visa",
    "Lithuania Working Holiday Visa": "Lithuania Working Holiday Visa",
    "Luxembourg Working Holiday Visa": "Luxembourg Working Holiday Visa",
    "Mexico Working Holiday Visa": "Mexico Working Holiday Visa",
    "Netherlands Working Holiday Visa": "Netherlands Working Holiday Visa",
    "Norway Working Holiday Visa": "Norway Working Holiday Visa",
    "Peru Working Holiday Visa": "Peru Working Holiday Visa",
    "Poland Working Holiday Visa": "Poland Working Holiday Visa",
    "Your education appears to meet the requirement of at least 3 years of full-time study towards a tertiary qualification.": "Your education appears to meet the requirement of at least 3 years of full-time study towards a tertiary qualification.",
    "This visa requires you to have completed at least 3 years of full-time study towards a tertiary qualification.": "This visa requires you to have completed at least 3 years of full-time study towards a tertiary qualification.",
    "Your qualifications or course transcript must be verified by the Peru Ministry of Foreign Affairs.": "Your qualifications or course transcript must be verified by the Peru Ministry of Foreign Affairs.",
    "If you have an acceptable English language test result that is no more than 2 years old, you need at least NZD 4,200; otherwise you need at least NZD 7,000.": "If you have an acceptable English language test result that is no more than 2 years old, you need at least NZD 4,200; otherwise you need at least NZD 7,000.",
    "Your education appears to meet the requirement of a tertiary qualification involving at least 4 years of full-time study.": "Your education appears to meet the requirement of a tertiary qualification involving at least 4 years of full-time study.",
    "This visa requires a tertiary qualification involving at least 4 years of full-time study.": "This visa requires a tertiary qualification involving at least 4 years of full-time study.",
    "You must be able to speak and understand English, and provide an acceptable English test result or a tertiary qualification taught entirely in English.": "You must be able to speak and understand English, and provide an acceptable English test result or a tertiary qualification taught entirely in English.",
    "You must have at least NZD 7,000 to cover your living expenses.": "You must have at least NZD 7,000 to cover your living expenses.",
    "Portugal Working Holiday Visa": "Portugal Working Holiday Visa",
    "Spain Working Holiday Visa": "Spain Working Holiday Visa",
    "Sweden Working Holiday Visa": "Sweden Working Holiday Visa",
    "Turkey Working Holiday Visa": "Turkey Working Holiday Visa",
    "United Kingdom Working Holiday Visa": "United Kingdom Working Holiday Visa",

    /* GB destination (Phase 10F) — Youth Mobility / Standard Visitor / Student */
    "Youth Mobility Scheme visa": "Youth Mobility Scheme visa",
    "Standard Visitor visa": "Standard Visitor visa",
    "Student visa": "Student visa",
    "Your passport appears to be eligible for the UK Youth Mobility Scheme.": "Your passport appears to be eligible for the UK Youth Mobility Scheme.",
    "Your age appears to be within the eligible range for this visa (18 to 35 at application).": "Your age appears to be within the eligible range for this visa (18 to 35 at application).",
    "Your age appears to be within the eligible range for this visa (18 to 30 at application).": "Your age appears to be within the eligible range for this visa (18 to 30 at application).",
    "Your age appears to be outside the eligible range for this visa. The range is 18 to 35 at the time you apply.": "Your age appears to be outside the eligible range for this visa. The range is 18 to 35 at the time you apply.",
    "Your age appears to be outside the eligible range for this visa. The range is 18 to 30 at the time you apply.": "Your age appears to be outside the eligible range for this visa. The range is 18 to 30 at the time you apply.",
    "Your passport does not appear to be on the UK Youth Mobility Scheme country list that Wayfare currently covers.": "Your passport does not appear to be on the UK Youth Mobility Scheme country list that Wayfare currently covers.",
    "Check GOV.UK for the full list of eligible countries and conditions.": "Check GOV.UK for the full list of eligible countries and conditions.",
    "You must be selected in the Youth Mobility Scheme ballot before you can apply. Ballot places and windows are limited and change over time.": "You must be selected in the Youth Mobility Scheme ballot before you can apply. Ballot places and windows are limited and change over time.",
    "Indian citizens use the separate India Young Professionals Scheme, which has its own ballot and requirements. This is not the standard Youth Mobility Scheme.": "Indian citizens use the separate India Young Professionals Scheme, which has its own ballot and requirements. This is not the standard Youth Mobility Scheme.",
    "You may be given a visa to live and work in the UK for up to 24 months.": "You may be given a visa to live and work in the UK for up to 24 months.",
    "If you are from Australia, Canada or New Zealand, you may be able to extend your visa by one year after the 2-year period ends.": "If you are from Australia, Canada or New Zealand, you may be able to extend your visa by one year after the 2-year period ends.",
    "You must have at least £2,530 in savings, held for at least 28 days in a row; day 28 must be within 31 days of applying.": "You must have at least £2,530 in savings, held for at least 28 days in a row; day 28 must be within 31 days of applying.",
    "The application fee is £340, and you usually pay the healthcare surcharge of £776 per year. Fees can change.": "The application fee is £340, and you usually pay the healthcare surcharge of £776 per year. Fees can change.",
    "The earliest you can apply is 6 months before you travel.": "The earliest you can apply is 6 months before you travel.",
    "You can work in most jobs. Self-employment is only allowed if your premises are rented, your equipment is worth no more than £5,000 and you have no employees.": "You can work in most jobs. Self-employment is only allowed if your premises are rented, your equipment is worth no more than £5,000 and you have no employees.",
    "You cannot work as a professional sportsperson, and you cannot get public funds.": "You cannot work as a professional sportsperson, and you cannot get public funds.",
    "You can study, but some courses need an Academic Technology Approval Scheme certificate.": "You can study, but some courses need an Academic Technology Approval Scheme certificate.",
    "You cannot bring family members on this visa, and you cannot apply if you have children under 18 who live with you or who you are financially responsible for.": "You cannot bring family members on this visa, and you cannot apply if you have children under 18 who live with you or who you are financially responsible for.",
    "You cannot apply if you have already been in the UK under the Youth Mobility Scheme.": "You cannot apply if you have already been in the UK under the Youth Mobility Scheme.",
    "Icelandic citizens must provide a criminal certificate.": "Icelandic citizens must provide a criminal certificate.",
    "You may need to provide tuberculosis (TB) test results depending on where you live.": "You may need to provide tuberculosis (TB) test results depending on where you live.",
    "This is simulated guidance only. Always verify with GOV.UK.": "This is simulated guidance only. Always verify with GOV.UK.",
    "Always verify with GOV.UK.": "This is simulated guidance only. Always verify with GOV.UK.",
    "Depending on your passport, you either need a Standard Visitor visa before you travel or an Electronic Travel Authorisation (ETA); check GOV.UK to see which applies to you.": "Depending on your passport, you either need a Standard Visitor visa before you travel or an Electronic Travel Authorisation (ETA); check GOV.UK to see which applies to you.",
    "You can usually stay in the UK for up to 6 months as a Standard Visitor.": "You can usually stay in the UK for up to 6 months as a Standard Visitor.",
    "You must be a genuine visitor who will leave the UK at the end of your visit.": "You must be a genuine visitor who will leave the UK at the end of your visit.",
    "You must be able to support yourself and any dependants during your trip, or have funding from someone else to support you.": "You must be able to support yourself and any dependants during your trip, or have funding from someone else to support you.",
    "You cannot do paid or unpaid work for a UK company or as a self-employed person, unless you are doing a permitted paid engagement or event.": "You cannot do paid or unpaid work for a UK company or as a self-employed person, unless you are doing a permitted paid engagement or event.",
    "You cannot live in the UK for long periods of time through frequent or successive visits.": "You cannot live in the UK for long periods of time through frequent or successive visits.",
    "You cannot marry or register a civil partnership, or give notice of marriage or civil partnership, on this visa.": "You cannot marry or register a civil partnership, or give notice of marriage or civil partnership, on this visa.",
    "You can study for up to 6 months on a Standard Visitor visa.": "You can study for up to 6 months on a Standard Visitor visa.",
    "A Standard Visitor visa costs £135 for up to 6 months. Long-term visas cost £506 (2 years), £903 (5 years) or £1,128 (10 years), each allowing stays of up to 6 months per visit. Fees can change.": "A Standard Visitor visa costs £135 for up to 6 months. Long-term visas cost £506 (2 years), £903 (5 years) or £1,128 (10 years), each allowing stays of up to 6 months per visit. Fees can change.",
    "Visitor visas for medical reasons (up to 11 months, £234) and for academics (up to 12 months, £234) have different fees and lengths.": "Visitor visas for medical reasons (up to 11 months, £234) and for academics (up to 12 months, £234) have different fees and lengths.",
    "The earliest you can apply is 3 months before you travel.": "The earliest you can apply is 3 months before you travel.",
    "Your education background is a positive signal for a UK Student visa application.": "Your education background is a positive signal for a UK Student visa application.",
    "Your English level is a positive signal for the Student visa English requirement.": "Your English level is a positive signal for the Student visa English requirement.",
    "You must be 16 or over to apply for a Student visa.": "You must be 16 or over to apply for a Student visa.",
    "You need an unconditional offer and a Confirmation of Acceptance for Studies (CAS) from a licensed student sponsor.": "You need an unconditional offer and a Confirmation of Acceptance for Studies (CAS) from a licensed student sponsor.",
    "You must have enough money to support yourself: £1,529 a month for courses in London or £1,171 a month elsewhere, for up to 9 months, held for at least 28 days in a row. Amounts can change.": "You must have enough money to support yourself: £1,529 a month for courses in London or £1,171 a month elsewhere, for up to 9 months, held for at least 28 days in a row. Amounts can change.",
    "You must prove knowledge of English: CEFR level B2 for degree level or above, or B1 below degree level.": "You must prove knowledge of English: CEFR level B2 for degree level or above, or B1 below degree level.",
    "The application fee is £558, and you usually pay the healthcare surcharge as part of your application. Fees can change.": "The application fee is £558, and you usually pay the healthcare surcharge as part of your application. Fees can change.",
    "You may be able to work, but how much depends on your course level and term time; you cannot claim public funds.": "You may be able to work, but how much depends on your course level and term time; you cannot claim public funds.",
    "Your partner and children can only join you in limited cases, such as some postgraduate research courses. These rules changed in 2024.": "Your partner and children can only join you in limited cases, such as some postgraduate research courses. These rules changed in 2024.",
    "Some courses need an Academic Technology Approval Scheme (ATAS) certificate, and you may need tuberculosis (TB) test results.": "Some courses need an Academic Technology Approval Scheme (ATAS) certificate, and you may need tuberculosis (TB) test results.",
    "The earliest you can apply is 6 months before your course starts (from outside the UK).": "The earliest you can apply is 6 months before your course starts (from outside the UK).",
    "You can usually get a decision within 3 weeks when applying from outside the UK.": "You can usually get a decision within 3 weeks when applying from outside the UK.",

    /* CA destination tune-up (Phase 10M) — visitor / student / IEC */
    "You must be a genuine visitor who will leave Canada at the end of your stay.": "You must be a genuine visitor who will leave Canada at the end of your stay.",
    "You must be able to support yourself and any family members during your stay.": "You must be able to support yourself and any family members during your stay.",
    "As a visitor you cannot work for a Canadian employer; short courses of study may be possible - check IRCC conditions.": "As a visitor you cannot work for a Canadian employer; short courses of study may be possible - check IRCC conditions.",
    "A visitor visa (TRV) costs CAN$100 per person and an eTA costs CAN$7. Fees can change - check IRCC.": "A visitor visa (TRV) costs CAN$100 per person and an eTA costs CAN$7. Fees can change - check IRCC.",
    "You may need to give biometrics: CAN$85 per person or CAN$170 per family. Fees can change - check IRCC.": "You may need to give biometrics: CAN$85 per person or CAN$170 per family. Fees can change - check IRCC.",
    "The IEC Working Holiday category gives an open work permit - you do not need a job offer and you can work for most employers in Canada.": "The IEC Working Holiday category gives an open work permit - you do not need a job offer and you can work for most employers in Canada.",
    "Category availability and the upper age limit (30 or 35) depend on your country of citizenship - check the IEC country list.": "Category availability and the upper age limit (30 or 35) depend on your country of citizenship - check the IEC country list.",
    "You must have health insurance for the length of your stay; you may need to show proof at the border.": "You must have health insurance for the length of your stay; you may need to show proof at the border.",
    "You may need a police certificate and/or a medical exam.": "You may need a police certificate and/or a medical exam.",
    "IEC fees: CAN$184.75 participation fee, plus the CAN$100 open work permit holder fee for Working Holiday, plus CAN$85 biometrics if required. Fees can change - check IRCC.": "IEC fees: CAN$184.75 participation fee, plus the CAN$100 open work permit holder fee for Working Holiday, plus CAN$85 biometrics if required. Fees can change - check IRCC.",
    "Rounds of invitations and available spots change during the season.": "Rounds of invitations and available spots change during the season.",
    "Most applicants must include a provincial or territorial attestation letter (PAL/TAL) with the application.": "Most applicants must include a provincial or territorial attestation letter (PAL/TAL) with the application.",
    "For applications on or after September 1, 2025 (outside Quebec) you must show CAN$22,895 per year for a single applicant, excluding tuition and transportation; amounts scale with family size and can change.": "For applications on or after September 1, 2025 (outside Quebec) you must show CAN$22,895 per year for a single applicant, excluding tuition and transportation; amounts scale with family size and can change.",
    "The study permit fee is CAN$150. Fees can change - check IRCC.": "The study permit fee is CAN$150. Fees can change - check IRCC.",
    "You may need to give biometrics: CAN$85 per person.": "You may need to give biometrics: CAN$85 per person.",
    /* CA official route names (v1.7.0 micro-tweak) */
    "Visitor visa / eTA": "Visitor visa / eTA",
    "Study permit": "Study permit",
    "IEC Working Holiday": "IEC Working Holiday",
    "You may need a medical exam and/or a police certificate.": "You may need a medical exam and/or a police certificate.",
    "You may be able to work while studying - conditions and hour limits apply; check IRCC.": "You may be able to work while studying - conditions and hour limits apply; check IRCC.",
    "You must show that your main purpose in Canada is to study.": "You must show that your main purpose in Canada is to study.",

    "Uruguay Working Holiday Visa": "Uruguay Working Holiday Visa",
    "USA Working Holiday Visa": "USA Working Holiday Visa",
    "This visa has a limited annual quota of about 15,000 places, which can run out.": "This visa has a limited annual quota of about 15,000 places, which can run out.",
    "You can apply for a 12-month, 23-month or 36-month visa.": "You can apply for a 12-month, 23-month or 36-month visa.",
    "You must have at least NZD 350 a month to cover your living expenses, and the money for your onward ticket must be in addition to this.": "You must have at least NZD 350 a month to cover your living expenses, and the money for your onward ticket must be in addition to this.",
    "You must normally live in the United Kingdom or the Crown Dependencies of Jersey, Guernsey or the Isle of Man.": "You must normally live in the United Kingdom or the Crown Dependencies of Jersey, Guernsey or the Isle of Man.",
    "To meet the residence requirement, you must not have been outside the United Kingdom or Crown Dependencies for more than 2 years immediately before applying.": "To meet the residence requirement, you must not have been outside the United Kingdom or Crown Dependencies for more than 2 years immediately before applying.",

    /* ── New Zealand Fee Paying Student Visa ── */
    "Fee Paying Student Visa": "Fee Paying Student Visa",
    "Your English level may help meet the English requirements of your chosen course.": "Your English level may help meet the English requirements of your chosen course.",
    "Your course may require evidence of English language ability. Requirements vary by provider and course.": "Your course may require evidence of English language ability. Requirements vary by provider and course.",
    "Your education background may support entry to a range of courses, depending on your chosen provider.": "Your education background may support entry to a range of courses, depending on your chosen provider.",
    "Students under 10 years old generally need a parent or legal guardian living with them in New Zealand.": "Students under 10 years old generally need a parent or legal guardian living with them in New Zealand.",
    "You must have an offer of place from an education provider approved by the Education (NZQA) authorities.": "You must have an offer of place from an education provider approved by the Education (NZQA) authorities.",
    "You must have paid your tuition fees in full, hold a scholarship, or have an approval in principle, before the visa is granted.": "You must have paid your tuition fees in full, hold a scholarship, or have an approval in principle, before the visa is granted.",
    "Tertiary, English-language or other non-compulsory study of 1 year or more generally requires about NZD 20,000 per year for living costs (or about NZD 1,667 per month if your study is shorter than 1 year). Wayfare does not assess financial evidence.": "Tertiary, English-language or other non-compulsory study of 1 year or more generally requires about NZD 20,000 per year for living costs (or about NZD 1,667 per month if your study is shorter than 1 year). Wayfare does not assess financial evidence.",
    "School students in years 1–13 generally need about NZD 17,000 per year for living costs (or about NZD 1,417 per month if the study is shorter than 1 year).": "School students in years 1–13 generally need about NZD 17,000 per year for living costs (or about NZD 1,417 per month if the study is shorter than 1 year).",
    "You must have a paid onward travel ticket, or enough money to buy one, in addition to your living costs.": "You must have a paid onward travel ticket, or enough money to buy one, in addition to your living costs.",
    "You must meet health requirements, and may need a medical examination or chest X-ray.": "You must meet health requirements, and may need a medical examination or chest X-ray.",
    "You must meet character requirements, and may need to provide police certificates.": "You must meet character requirements, and may need to provide police certificates.",
    "You must genuinely intend to study, and be a bona fide applicant who intends to leave New Zealand at the end of your visa.": "You must genuinely intend to study, and be a bona fide applicant who intends to leave New Zealand at the end of your visa.",
    "You must hold travel and health insurance from the start of your course until your visa expires.": "You must hold travel and health insurance from the start of your course until your visa expires.",
    "A Fee Paying Student Visa can be granted for up to 4 years, depending on your course.": "A Fee Paying Student Visa can be granted for up to 4 years, depending on your course.",

    /* ── New Zealand Visitor Visa ── */
    "Visitor Visa": "Visitor Visa",
    "Some travellers can come to New Zealand on an NZeTA (Electronic Travel Authority) instead of a visitor visa; which one you need depends on your passport.": "Some travellers can come to New Zealand on an NZeTA (Electronic Travel Authority) instead of a visitor visa; which one you need depends on your passport.",
    "Your profile indicates remote work. Check the work conditions below for New Zealand Visitor Visa limits.": "Your profile indicates remote work. Check the work conditions below for New Zealand Visitor Visa limits.",
    "A Visitor Visa is usually granted for up to either 6 months or 9 months (a single-entry visa can allow up to 9 months in an 18-month period).": "A Visitor Visa is usually granted for up to either 6 months or 9 months (a single-entry visa can allow up to 9 months in an 18-month period).",
    "You cannot work for a New Zealand employer or provide services in the New Zealand labour market on this visa. Remote work for an overseas employer, business, or client may be possible.": "You cannot work for a New Zealand employer or provide services in the New Zealand labour market on this visa. Remote work for an overseas employer, business, or client may be possible.",
    "You can study for up to 3 months on a visitor visa.": "You can study for up to 3 months on a visitor visa.",
    "You must be a genuine visitor who intends to leave New Zealand at the end of your visit.": "You must be a genuine visitor who intends to leave New Zealand at the end of your visit.",
    "You must have enough money for your stay — generally at least NZD 1,000 a month, or NZD 400 a month if your accommodation is already paid for. Wayfare does not assess financial evidence.": "You must have enough money for your stay — generally at least NZD 1,000 a month, or NZD 400 a month if your accommodation is already paid for. Wayfare does not assess financial evidence.",
    "You must have a ticket for travel out of New Zealand, or enough money to buy one, in addition to your living costs.": "You must have a ticket for travel out of New Zealand, or enough money to buy one, in addition to your living costs.",
    "You must be in good health. A chest X-ray may be required for stays over 6 months from higher-tuberculosis-risk countries.": "You must be in good health. A chest X-ray may be required for stays over 6 months from higher-tuberculosis-risk countries.",
    "You must be of good character, and may need to provide police certificates.": "You must be of good character, and may need to provide police certificates.",
    "Your passport must be valid for at least 3 months after the date you plan to leave New Zealand.": "Your passport must be valid for at least 3 months after the date you plan to leave New Zealand.",
    "You can include your partner and any dependent children aged 19 or younger in your application, or they can apply for their own visas.": "You can include your partner and any dependent children aged 19 or younger in your application, or they can apply for their own visas.",
    "Work rights are informational only: you may be able to work part-time up to 25 hours per week during your studies, and full-time during scheduled holidays, if your visa conditions allow.": "Work rights are informational only: you may be able to work part-time up to 25 hours per week during your studies, and full-time during scheduled holidays, if your visa conditions allow.",
    "English is not a fixed visa requirement, but your English level and any test results can help show your genuine intention to study.": "English is not a fixed visa requirement, but your English level and any test results can help show your genuine intention to study.",
    "Students under 10 years old generally need a parent or legal guardian living with them in New Zealand, unless you are living in an NZQA-approved hostel.": "Students under 10 years old generally need a parent or legal guardian living with them in New Zealand, unless you are living in an NZQA-approved hostel.",
    "You must have an offer of place in an approved course of study from an approved education provider.": "You must have an offer of place in an approved course of study from an approved education provider.",
    "You must have enough money to pay your tuition fees or hold a scholarship, and show you have paid the tuition fees for 1 course or 1 year of study, whichever is shorter.": "You must have enough money to pay your tuition fees or hold a scholarship, and show you have paid the tuition fees for 1 course or 1 year of study, whichever is shorter.",
    "You may need to show bank statements covering the last 3 months. Large deposits may need a source explanation.": "You may need to show bank statements covering the last 3 months. Large deposits may need a source explanation.",
    "You must be in good health. A chest X-ray or medical exam may be required depending on your stay length and tuberculosis-risk country rules.": "You must be in good health. A chest X-ray or medical exam may be required depending on your stay length and tuberculosis-risk country rules.",
    "You must be of good character. Police certificates may be required if you are 17 or older and your total time in New Zealand will be 24 months or longer.": "You must be of good character. Police certificates may be required if you are 17 or older and your total time in New Zealand will be 24 months or longer.",
    "You must have travel and health insurance acceptable to your education provider, from the start of your course until your visa expires.": "You must have travel and health insurance acceptable to your education provider, from the start of your course until your visa expires.",
    "This visa has a limited annual quota of about 2,000 places, which can run out.": "This visa has a limited annual quota of about 2,000 places, which can run out.",
    "This visa has a limited annual quota of about 200 places, which can run out.": "This visa has a limited annual quota of about 200 places, which can run out.",
    "This visa has a limited annual quota of about 50 places, which can run out.": "This visa has a limited annual quota of about 50 places, which can run out.",
    "You must normally live in the USA.": "You must normally live in the USA.",
    "You must hold a valid physical passport when you apply; without one your application may be declined.": "You must hold a valid physical passport when you apply; without one your application may be declined.",
  },

  es: {
    /* v1.173.0 — ESTAS OCHO CLAVES ESTABAN FUERA DEL BLOQUE DE IDIOMA.
       Colgaban un nivel más arriba, en la raíz de window.I18N, y t() busca
       dentro de I18N[idioma]. Resultado: nunca se encontraban.
       Dos se notaban de verdad: los botones de cerrar se anunciaban a los
       lectores de pantalla como «a11y_close», y el mapa compartido se
       descargaba con el nombre «share_filename» en vez de wayfare-mi-mapa.png.
       Las otras seis tenían texto de reserva en el código y por eso no cantaban.
       Apareció al mirar el aria-label del tirador nuevo. */
    /* v1.176.0 — avisos por correo cuando cambie una fuente oficial */
    bol_previa: "⚠ Vista previa: esto todavía no funciona. Está aquí para que veas por dónde va el producto — dinos qué te parece.",
    bol_titulo: "¿Te avisamos por correo si cambia algo de {pais}?",
    bol_sub: "Solo cuando cambie una fuente oficial: una norma, un requisito o la apertura de un cupo. Nada más.",
    bol_placeholder: "tu@correo.com",
    bol_consent: "Quiero recibir estos avisos, y he leído la",
    bol_boton: "Avísame",
    bol_enviando: "Enviando…",
    bol_revisa: "Revisa tu correo",
    bol_revisa_pie: "Te hemos enviado un correo para confirmar. Hasta que no lo pulses no estás suscrito — y es a propósito.",
    bol_error: "No se ha podido enviar. Inténtalo dentro de un momento.",
    a11y_close: "Cerrar",
    app_version_title: "Versión de la app",
    q_reset_confirm: "Esto borrará tu perfil guardado y tu mapa en este dispositivo. ¿Seguimos?",
    crash_title: "Se ha roto algo por nuestra parte",
    crash_text: "Lo sentimos: esta pantalla no ha cargado. Tu perfil guardado está intacto. Recargar suele arreglarlo.",
    crash_reload: "Recargar",
    crash_reset: "Recargar y empezar de cero",
    share_filename: "wayfare-mi-mapa.png",
    "Always verify with Irish Immigration Service Delivery (irishimmigration.ie).": "Verifica siempre en el Servicio de Inmigración de Irlanda (irishimmigration.ie).",
    "As an EU/EEA or Swiss citizen you can work in Ireland without an employment permit.": "Como ciudadano de la UE, del EEE o suizo, puedes trabajar en Irlanda sin permiso de trabajo.",
    "As an EU/EEA or Swiss citizen you do not need permission to study in Ireland.": "Como ciudadano de la UE, del EEE o suizo, no necesitas permiso para estudiar en Irlanda.",
    "For general work your Irish employer applies, and the job must not be on the ineligible list of employment.": "Para el trabajo general lo solicita tu empleador irlandés, y el puesto no puede estar en la lista de empleos no elegibles.",
    "If your course lasts more than 90 days you must also register with immigration after arriving.": "Si tu curso dura más de 90 días, además tienes que registrarte en inmigración al llegar.",
    "Ireland issues a Short Stay C visa for courses under 90 days and a Long Stay D visa for longer ones.": "Irlanda concede una visa de estancia corta (C) para cursos de menos de 90 días y una de estancia larga (D) para los más largos.",
    "Ireland's route is an employment permit from the Department of Enterprise, Trade and Employment (DETE).": "La vía irlandesa es un permiso de trabajo del Departamento de Empresa, Comercio y Empleo (DETE).",
    "Non-EEA and non-Swiss students need a letter of enrolment and to have paid their course fees.": "Los estudiantes de fuera del EEE y de Suiza necesitan carta de matrícula y tener pagadas las tasas del curso.",
    "Once the permit is granted you must apply for a long stay (D) visa if your nationality needs one.": "Una vez concedido el permiso, debes pedir la visa de estancia larga (D) si tu nacionalidad la necesita.",
    "Study options include a third-level course, a language course, a fee paying private school or a short-term course.": "Puedes cursar estudios superiores, un curso de idiomas, un colegio privado de pago o un curso de corta duración.",
    "Whether you need the visa itself depends on your nationality; the permission requirements apply either way.": "Que necesites o no la visa depende de tu nacionalidad; los requisitos del permiso se aplican igualmente.",
    "With a job on the critical skills eligible occupations list, you or your Irish employer can apply for a Critical Skills permit.": "Con un puesto de la lista de ocupaciones de competencias críticas, tú o tu empleador irlandés podéis pedir el permiso Critical Skills.",
    "You may need to show sufficient funds for tuition and living costs. Check official Irish student visa requirements.": "Puede que necesites demostrar fondos suficientes para matrícula y manutención. Consulta los requisitos oficiales irlandeses.",
    "You may need to show sufficient funds. Check official Irish work permission requirements.": "Puede que necesites demostrar fondos suficientes. Consulta los requisitos oficiales del permiso de trabajo irlandés.",
    "You must have a contract of employment before coming to work for more than 90 days.": "Debes tener un contrato de trabajo antes de venir a trabajar más de 90 días.",
    vc_modelled_title: "Esta vía está modelada: aún no hemos capturado su fuente oficial. Verifícala antes de decidir nada.",
    vc_modelled: "Sin fuente oficial capturada",
    "Your employer applies for you if you are employed; if you are self-employed you apply directly.": "Si estás empleado, lo tramita tu empleador; si trabajas por cuenta propia, lo tramitas tú.",
    "It covers employees, self-employed people and entrepreneurs earning from activity in Georgia, including paid work done remotely.": "Alcanza a empleados, autónomos y emprendedores que obtienen ingresos por actividad en Georgia, incluido el trabajo remunerado hecho en remoto.",
    "Holders of a permanent residence permit in Georgia are outside this requirement.": "Quien tiene permiso de residencia permanente en Georgia queda fuera de este requisito.",
    "The visa-free list shown here has not been verified against a captured official source: check the Georgian foreign ministry before you travel.": "La lista de países sin visado que ves aquí no está verificada contra una fuente oficial capturada: consulta el Ministerio de Exteriores de Georgia antes de viajar.",
    "It covers employees, self-employed people and entrepreneurs earning from activity in Georgia; processing takes up to 30 days.": "Cubre a empleados, autónomos y empresarios que ganan por actividad en Georgia; la tramitación tarda hasta 30 días.",
    brand: "Wayfare",
    tagline: "Descubre a qué países podrías ir.",
    lang_label: "ES",

    q_title: "Crea tu perfil de movilidad",
    q_sub: "Responde unas preguntas y compararemos cada país con tu elegibilidad. Tus respuestas se guardan solo en este dispositivo (tu navegador) — nada se envía a ningún servidor.",
    sec_identity: "Sobre ti",
    sec_identity_sub: "Lo esencial que define a qué puedes optar.",
    sec_education: "Educación",
    sec_education_sub: "Tu nivel de estudios más alto completado.",
    sec_background: "Educación y trabajo",
    sec_background_sub: "Lo que aportas a un destino.",
    sec_means: "Idioma y forma de trabajo",
    sec_means_sub: "Tu nivel de idioma y el trabajo remoto definen qué rutas te encajan.",
    sec_intent: "Qué estás buscando",
    sec_intent_sub: "Cuéntanos qué te interesa — lo priorizaremos.",

    f_nationality: "Pasaporte actual",
    f_residence: "País de residencia actual",
    f_age: "Edad",
    f_situation: "Te mudas",
    f_education: "Educación máxima",
    f_profession: "Área de trabajo",
    f_experience: "Años de experiencia",
    f_english: "Nivel de inglés",
    f_savings: "Ahorros aproximados (USD)",
    f_remote_work: "¿Trabajas en remoto?",
    f_monthly_income: "Ingresos mensuales aproximados",
    f_monthly_income_hint: "Activa trabajo remoto para añadir ingresos mensuales.",
    remote_yes: "Sí",
    remote_no: "No",
    f_countries: "Países que te interesan",
    f_visas: "¿Qué quieres hacer?",
    goal_study: "Estudiar",
    goal_work: "Trabajar",
    goal_tourism: "Turismo",
    goal_remote: "Trabajar en remoto",
    f_countries_hint: "Opcional — elige los que te llamen. Igual escaneamos todo el mapa.",
    f_visas_hint: "Elige uno o varios — tu mapa se construye según tus objetivos.",
    goal_required: "Elige al menos un objetivo para que podamos generar tu mapa.",

    submit: "Mapear mis opciones",
    reset: "Reiniciar",

    sit_alone: "Solo/a",
    sit_partner: "Con pareja",
    sit_family: "Con familia",

    edu_primary: "Primaria",
    edu_secondary: "Secundaria",
    edu_baccalaureate: "Bachillerato",
    edu_university_plus: "Estudios universitarios o superiores",

    eng_basic: "Básico",
    eng_intermediate: "Intermedio",
    eng_advanced: "Avanzado",
    eng_native: "Nativo",
    eng_a1: "A1",
    eng_a2: "A2",
    eng_b1: "B1",
    eng_b2: "B2",
    eng_c1: "C1",
    eng_c2: "C2",
    f_english_hint: "Niveles del Marco Común Europeo (MCER) — de A1 principiante a C2 dominio/nativo.",

    prof_tech: "Tecnología e ingeniería",
    prof_health: "Salud",
    prof_business: "Negocios y finanzas",
    prof_creative: "Creativo y medios",
    prof_education: "Educación",
    prof_trades: "Oficios especializados",
    prof_hospitality: "Hostelería y servicios",
    prof_other: "Otro",

    p_title: "Escaneando el mundo",
    p_step1: "Leyendo tu perfil",
    p_step2: "Cruzando movilidad del pasaporte",
    p_step3: "Revisando requisitos de visa",
    p_step4: "Puntuando cada país",
    p_live_routes: "Consultando %N% rutas de visa oficiales",
    p_live_facts: "Cotejando %N% hechos verificados",
    p_live_dest: "Revisando %N% destinos auditados",

    g_overview: "Tus resultados",
    g_eligible_count: "compatibles",
    g_partial_count: "parciales",
    g_unlikely_count: "poco probables",
    g_recs: "Mejores opciones para ti",
    g_click_hint: "Gira el globo hasta tu zona — acerca el zoom para ver las banderas y elegir país.",
    g_no_selection: "Ningún país seleccionado",
    g_no_selection_sub: "Toca cualquier país del globo para ver qué visas encajan con tu perfil.",
    g_no_visas_goal: "Aquí no hay nada para ese objetivo",
    g_no_visas_goal_sub: "Wayfare no tiene ninguna visa modelada en este destino para el objetivo que elegiste. Prueba con otro objetivo en tu perfil.",
    g_visas_here: "Programas de visa aquí",
    g_missing: "Falta",
    g_matched: "Lo que pareces cumplir",
    g_warnings: "Requisitos y advertencias",
    g_score: "Puntuación",
    g_restart: "Editar perfil",
    g_profile: "Perfil",
    g_simulated: "Elegibilidad simulada",
    g_verified_prefix: "Datos cotejados con fuentes oficiales del gobierno — última revisión de fuentes: ",
    g_unverified_note: "Aún no auditado contra fuentes oficiales — tómalo como orientación de demostración.",
    ev_btn_title: "Ver la evidencia oficial de este requisito",
    ev_source: "Fuente oficial",
    ev_captured: "capturado el ",
    ev_review: "en revisión",
    adv_section: "Asesores migratorios verificados",
    adv_demo_note: "Perfiles de demostración: estos asesores son ejemplos ficticios mientras incorporamos a profesionales autorizados reales. ¡Dinos qué te parece esta sección!",
    adv_reviews: "reseñas",
    adv_reviews_title: "Leer las reseñas en el directorio completo",
    adv_lic_title: "Comprobar esta licencia en el registro oficial",
    adv_web: "Sitio web ↗",
    adv_langs: "Atiende en: ",
    adv_view_all: "Ver el directorio completo →",
    q_back_map: "Volver a mi mapa",
    q_reset: "Restablecer y empezar de cero (borra tu perfil guardado)",
    q_discard: "Descartar mis cambios y volver a mi mapa",
    submit_update: "Actualizar mi mapa con estos cambios",
    cmp_btn: "Comparar destinos",
    cmp_title: "Comparación lado a lado",
    cmp_choose: "Comparar con…",
    cmp_note: "Mismo perfil, mismo motor: cada columna se evalúa con tus respuestas. Solo orientación simulada.",

    /* ── Corea del Sur — Wave 3 (v1.29.0) ── */
    "Your passport nationality has a bilateral working holiday agreement with Korea (H-1 visa).": "Tu nacionalidad de pasaporte tiene un acuerdo bilateral de working holiday con Corea (visa H-1).",
    "The working holiday visa allows a one-year extended holiday in Korea, with short-term employment as a secondary part of your stay.": "La visa working holiday permite unas vacaciones prolongadas de un año en Corea, con empleo de corta duración como parte secundaria de la estancia.",
    "You may generally work up to 25 hours per week with this visa.": "Con esta visa generalmente se puede trabajar hasta 25 horas por semana.",
    "This is a one-time only visa; extensions or a second participation exist only in specific bilateral cases (e.g. Canada, Japan, the US and the UK).": "Es una visa de una sola vez; las extensiones o una segunda participación solo existen en casos bilaterales concretos (p. ej. Canadá, Japón, EE.UU. y Reino Unido).",
    "Language courses at private institutions are allowed; regular university degree courses require a study visa instead.": "Se permiten cursos de idioma en instituciones privadas; los estudios universitarios regulares requieren una visa de estudios.",
    "You may need to show a return ticket (or funds to buy one) and reasonable funds for your initial stay.": "Puede que necesites demostrar un pasaje de vuelta (o fondos para comprarlo) y fondos razonables para tu estancia inicial.",
    "Verify current conditions with the Korean embassy or consulate in your country. Simulated guidance only.": "Verifica las condiciones vigentes con la embajada o consulado de Corea en tu país. Solo orientación simulada.",
    "Verify current conditions with the Korean embassy or consulate in your country.": "Verifica las condiciones vigentes con la embajada o consulado de Corea en tu país.",
    "Your passport nationality appears to be eligible for K-ETA: visa-free short stays of up to 90 days (3 months for some countries).": "Tu nacionalidad de pasaporte parece ser elegible para la K-ETA: estancias cortas sin visado de hasta 90 días (3 meses para algunos países).",
    "You must obtain K-ETA approval before boarding the flight or ship to Korea.": "Debes obtener la aprobación de la K-ETA antes de embarcar en el avión o barco hacia Corea.",
    "This is simulated guidance only. Always verify with the official K-ETA portal (k-eta.go.kr).": "Esto es solo orientación simulada. Verifica siempre en el portal oficial K-ETA (k-eta.go.kr).",
    "Always verify with the official K-ETA portal (k-eta.go.kr).": "Verifica siempre en el portal oficial K-ETA (k-eta.go.kr).",
    "Your passport nationality is generally accepted for Korean student visa applications.": "Tu nacionalidad de pasaporte es generalmente aceptada para solicitudes de visa de estudiante coreana.",
    "For degree programmes at institutions offering associate degrees or higher, a D-2 visa is required; non-degree training uses the D-4 visa.": "Para programas con titulación en instituciones de grado asociado o superior se requiere la visa D-2; la formación sin titulación usa la visa D-4.",
    "You may need to show sufficient funds for tuition and living costs. Check official Korean student visa requirements.": "Puede que necesites demostrar fondos suficientes para matrícula y manutención. Consulta los requisitos oficiales de la visa de estudiante coreana.",
    "Admission to a Korean educational institution is required before the visa. Simulated guidance only.": "Se requiere la admisión en una institución educativa coreana antes del visado. Solo orientación simulada.",
    "Admission to a Korean educational institution is required before the visa.": "Se requiere la admisión en una institución educativa coreana antes del visado.",
    "Your profile indicates remote work, which is the primary condition for this route.": "Tu perfil indica trabajo remoto, que es la condición principal de esta ruta.",
    "Korea introduced a digital nomad (workation) visa with income and insurance requirements - check the Korea Immigration Service or a Korean embassy for current requirements.": "Corea introdujo una visa de nómada digital (workation) con requisitos de ingresos y seguro - consulta el Servicio de Inmigración de Corea o una embajada coreana.",
    "Korea's digital nomad (workation) visa requires active remote work for a foreign employer or clients.": "La visa de nómada digital (workation) de Corea requiere trabajo remoto activo para un empleador o clientes extranjeros.",
    "Your age appears to be within the eligible range for this visa (18 to 25).": "Tu edad parece estar dentro del rango elegible para esta visa (18 a 25).",
    "US participants must be bona fide post-secondary students or recent graduates (within 1 year after graduation).": "Los participantes de EE.UU. deben ser estudiantes postsecundarios de buena fe o recién graduados (hasta 1 año tras graduarse).",
    "This visa has a limited annual quota of about 12,000 places, which can run out.": "Esta visa tiene un cupo anual limitado de unas 12.000 plazas, que puede agotarse.",
    "Canadian participants may stay up to 24 months, participate twice, and are exempt from the 25-hour weekly limit.": "Los participantes canadienses pueden quedarse hasta 24 meses, participar dos veces y están exentos del límite semanal de 25 horas.",
    "Canadian citizens appear to be eligible for K-ETA, with visa-free stays of up to 6 months.": "Los ciudadanos canadienses parecen ser elegibles para la K-ETA, con estancias sin visado de hasta 6 meses.",
    "This visa has a limited annual quota of about 5,000 places, which can run out.": "Esta visa tiene un cupo anual limitado de unas 5.000 plazas, que puede agotarse.",
    "Korea has bilateral working holiday agreements with thirty countries/regions; your nationality does not appear to be among them.": "Corea tiene acuerdos bilaterales de working holiday con treinta países/regiones; tu nacionalidad no parece estar entre ellos.",
    "A short-term visa is likely required for your nationality. Check the Korean embassy or consulate in your country.": "Probablemente necesites una visa de corta estancia para tu nacionalidad. Consulta la embajada o consulado de Corea en tu país.",
    "Your passport nationality appears to be eligible for K-ETA, with visa-free stays of up to 30 days.": "Tu nacionalidad de pasaporte parece ser elegible para la K-ETA, con estancias sin visado de hasta 30 días.",
    "Your passport nationality appears to be eligible for K-ETA, with visa-free stays of up to 60 days.": "Tu nacionalidad de pasaporte parece ser elegible para la K-ETA, con estancias sin visado de hasta 60 días.",
    "This visa has a limited annual quota of about 3,000 places, which can run out.": "Esta visa tiene un cupo anual limitado de unas 3.000 plazas, que puede agotarse.",
    "This visa has a limited annual quota of about 3,400 places, which can run out.": "Esta visa tiene un cupo anual limitado de unas 3.400 plazas, que puede agotarse.",
    "This visa has a limited annual quota of about 900 places, which can run out.": "Esta visa tiene un cupo anual limitado de unas 900 plazas, que puede agotarse.",

    /* ── Argentina y México — Wave 3 tanda LatAm (v1.30.0) ── */
    "Your passport nationality has a working holiday agreement with Argentina (Vacaciones y Trabajo).": "Tu nacionalidad de pasaporte tiene un acuerdo de working holiday con Argentina (Vacaciones y Trabajo).",
    "Your age appears to be within the typical range for this visa (18 to 30 - some agreements vary).": "Tu edad parece estar dentro del rango típico para esta visa (18 a 30 - algunos acuerdos varían).",
    "Stays are for up to 12 months, non-renewable; work must be incidental to the holiday purpose.": "Las estancias son de hasta 12 meses, no renovables; el trabajo debe ser incidental al propósito vacacional.",
    "Requirements vary by bilateral agreement - check the procedure for your nationality on cancilleria.gob.ar.": "Los requisitos varían según el acuerdo bilateral - consulta el procedimiento para tu nacionalidad en cancilleria.gob.ar.",
    "You may need a return ticket (or funds to buy one), medical insurance covering the stay, and funds for your initial expenses.": "Puede que necesites pasaje de vuelta (o fondos para comprarlo), seguro médico que cubra la estancia y fondos para tus gastos iniciales.",
    "Meeting the requirements does not guarantee the visa; approval is a prerogative of the Argentine State. Simulated guidance only.": "Cumplir los requisitos no garantiza la visa; la aprobación es prerrogativa del Estado argentino. Solo orientación simulada.",
    "Meeting the requirements does not guarantee the visa; approval is a prerogative of the Argentine State.": "Cumplir los requisitos no garantiza la visa; la aprobación es prerrogativa del Estado argentino.",
    "Your passport nationality appears on Argentina's visa-free list for tourism (ordinary passport).": "Tu nacionalidad de pasaporte aparece en la lista sin visa de Argentina para turismo (pasaporte ordinario).",
    "Tourist stays are authorised for up to 3 months, extendable once for a similar period.": "Las estancias de turista se autorizan por hasta 3 meses, prorrogables una vez por un periodo similar.",
    "You cannot work during a tourist stay; paid activities are not allowed.": "No se puede trabajar durante una estancia de turista; las actividades remuneradas no están permitidas.",
    "This is simulated guidance only. Always verify with the Dirección Nacional de Migraciones (migraciones.gob.ar).": "Esto es solo orientación simulada. Verifica siempre en la Dirección Nacional de Migraciones (migraciones.gob.ar).",
    "Always verify with the Dirección Nacional de Migraciones (migraciones.gob.ar).": "Verifica siempre en la Dirección Nacional de Migraciones (migraciones.gob.ar).",
    "Your passport nationality appears eligible: the digital nomad residence is aimed at nationals of countries that do not require a tourist visa for Argentina.": "Tu nacionalidad de pasaporte parece elegible: la residencia de nómada digital está dirigida a nacionales de países que no requieren visa de turista para Argentina.",
    "The transitory residence for digital nomads (Disposición 758/2022) is granted for up to 180 days, extendable once.": "La residencia transitoria para nómades digitales (Disposición 758/2022) se otorga por hasta 180 días, prorrogable una vez.",
    "You will need a request note, a brief CV, a valid passport and documentation proving your remote work relationship.": "Necesitarás una nota de solicitud, un CV breve, pasaporte vigente y documentación que acredite tu relación de trabajo remoto.",
    "Verify current conditions with the Dirección Nacional de Migraciones. Simulated guidance only.": "Verifica las condiciones vigentes en la Dirección Nacional de Migraciones. Solo orientación simulada.",
    "Verify current conditions with the Dirección Nacional de Migraciones.": "Verifica las condiciones vigentes en la Dirección Nacional de Migraciones.",
    "Your passport nationality is generally accepted for Argentine student residence applications.": "Tu nacionalidad de pasaporte es generalmente aceptada para solicitudes de residencia de estudiante en Argentina.",
    "Studying in Argentina requires admission to a recognised institution and a student residence (residencia transitoria o temporaria como estudiante).": "Estudiar en Argentina requiere la admisión en una institución reconocida y una residencia de estudiante (residencia transitoria o temporaria como estudiante).",
    "You may need to show sufficient funds for tuition and living costs. Check official Argentine migration requirements.": "Puede que necesites demostrar fondos suficientes para matrícula y manutención. Consulta los requisitos migratorios oficiales argentinos.",
    "Your passport nationality appears on Mexico's official list of countries that do not require a visa (visitor without paid activities).": "Tu nacionalidad de pasaporte aparece en la lista oficial de México de países que no requieren visa (visitante sin actividades remuneradas).",
    "Visitor stays cannot exceed 180 days.": "Las estancias de visitante no pueden superar los 180 días.",
    "The migration authority may ask for hotel bookings, return tickets and proof of your travel purpose.": "La autoridad migratoria puede pedir reservas de hotel, boletos de regreso y pruebas del motivo del viaje.",
    "This is simulated guidance only. Always verify with the Instituto Nacional de Migración (inm.gob.mx).": "Esto es solo orientación simulada. Verifica siempre en el Instituto Nacional de Migración (inm.gob.mx).",
    "Always verify with the Instituto Nacional de Migración (inm.gob.mx).": "Verifica siempre en el Instituto Nacional de Migración (inm.gob.mx).",
    "Your passport nationality is generally accepted for Mexican student residence applications.": "Tu nacionalidad de pasaporte es generalmente aceptada para solicitudes de residencia de estudiante en México.",
    "Studies over 180 days require the residente temporal estudiante condition, with an acceptance letter from a Mexican institution.": "Los estudios de más de 180 días requieren la condición de residente temporal estudiante, con carta de aceptación de una institución mexicana.",
    "You may need to show sufficient funds for tuition and living costs. Check official Mexican requirements.": "Puede que necesites demostrar fondos suficientes para matrícula y manutención. Consulta los requisitos oficiales mexicanos.",
    "Courses of up to 180 days can be done as a visitor with an acceptance letter. Simulated guidance only.": "Los cursos de hasta 180 días pueden hacerse como visitante con carta de aceptación. Solo orientación simulada.",
    "For stays of up to 180 days, your nationality can enter as a visitor without a Mexican visa.": "Para estancias de hasta 180 días, tu nacionalidad puede entrar como visitante sin visa mexicana.",
    "Mexico has no dedicated digital nomad visa; remote workers commonly use the visitor condition (up to 180 days) or the temporary resident route (economic solvency requirements).": "México no tiene una visa de nómada digital dedicada; los trabajadores remotos suelen usar la condición de visitante (hasta 180 días) o la vía de residente temporal (requisitos de solvencia económica).",
    "Mexico does not operate a working holiday programme.": "México no opera un programa de working holiday.",
    "Argentina's digital nomad residence requires providing remote services for persons or companies domiciled abroad.": "La residencia de nómada digital de Argentina requiere prestar servicios remotos para personas o empresas domiciliadas en el exterior.",
    "Working remotely from Mexico requires an active remote work relationship with an employer or clients abroad.": "Trabajar en remoto desde México requiere una relación activa de trabajo remoto con un empleador o clientes en el extranjero.",
    "Argentina's digital nomad residence is aimed at nationals of countries that do not require a tourist visa; your nationality appears to need one.": "La residencia de nómada digital de Argentina está dirigida a nacionales de países que no requieren visa de turista; tu nacionalidad parece necesitarla.",
    "A tourist visa is likely required for your nationality. Check the Argentine consulate in your country.": "Probablemente necesites una visa de turista para tu nacionalidad. Consulta el consulado argentino de tu país.",
    "Argentina has working holiday agreements with nineteen countries; your nationality does not appear to be among them.": "Argentina tiene acuerdos de working holiday con diecinueve países; tu nacionalidad no parece estar entre ellos.",
    "A Mexican visitor visa is likely required for your nationality - or, as an alternative, a valid visa or permanent residence of the US, Canada, Japan, the UK or a Schengen country.": "Probablemente necesites una visa mexicana de visitante para tu nacionalidad - o, como alternativa, una visa o residencia permanente vigente de EE.UU., Canadá, Japón, Reino Unido o un país Schengen.",
    "This visa has a limited annual quota of about 150 places, which can run out.": "Esta visa tiene un cupo anual limitado de unas 150 plazas, que puede agotarse.",

    /* ── Tailandia y Singapur — Wave 3 sudeste asiático (v1.31.0) ── */
    "Your passport nationality appears on Thailand's visa exemption list: stays of up to 60 days for tourism, extendable once by up to 30 days.": "Tu nacionalidad de pasaporte aparece en la lista de exención de visado de Tailandia: estancias de hasta 60 días por turismo, prorrogables una vez por hasta 30 días.",
    "Thailand approved changes to its visa exemption scheme in May 2026 (reducing stays for many nationalities); the change was pending official publication at capture time - verify before travelling.": "Tailandia aprobó cambios en su esquema de exención de visado en mayo de 2026 (reduciendo estancias para muchas nacionalidades); el cambio estaba pendiente de publicación oficial al capturar los datos - verifícalo antes de viajar.",
    "You cannot work during a visa-exempt stay; paid activities are not allowed.": "No se puede trabajar durante una estancia exenta de visado; las actividades remuneradas no están permitidas.",
    "This is simulated guidance only. Always verify with the Ministry of Foreign Affairs of Thailand (mfa.go.th).": "Esto es solo orientación simulada. Verifica siempre en el Ministerio de Asuntos Exteriores de Tailandia (mfa.go.th).",
    "Always verify with the Ministry of Foreign Affairs of Thailand (mfa.go.th).": "Verifica siempre en el Ministerio de Asuntos Exteriores de Tailandia (mfa.go.th).",
    "Your passport nationality is generally accepted for Thai education visa applications.": "Tu nacionalidad de pasaporte es generalmente aceptada para solicitudes de visa de educación tailandesa.",
    "Studying in Thailand requires admission to a recognised institution and a Non-Immigrant ED visa.": "Estudiar en Tailandia requiere la admisión en una institución reconocida y una visa Non-Immigrant ED.",
    "You may need to show sufficient funds for tuition and living costs. Check official Thai requirements.": "Puede que necesites demostrar fondos suficientes para matrícula y manutención. Consulta los requisitos oficiales tailandeses.",
    "Thailand introduced the Destination Thailand Visa (DTV) with financial requirements and multi-year validity - check the Royal Thai embassy or the official Thai e-Visa site for current conditions.": "Tailandia introdujo la Destination Thailand Visa (DTV) con requisitos financieros y validez plurianual - consulta la embajada tailandesa o el sitio oficial Thai e-Visa.",
    "Thailand does not operate a working holiday programme.": "Tailandia no opera un programa de working holiday.",
    "Your passport nationality does not appear on Singapore's visa-required lists: most visitors enter visa-free.": "Tu nacionalidad de pasaporte no aparece en las listas de visado requerido de Singapur: la mayoría de visitantes entra sin visa.",
    "The period of stay is determined by the Visit Pass (e-Pass) granted electronically at the checkpoint, not by the visa.": "El periodo de estancia lo determina el Visit Pass (e-Pass) concedido electrónicamente en el control fronterizo, no la visa.",
    "You must submit the SG Arrival Card before entry; it is not a visa.": "Debes enviar la SG Arrival Card antes de entrar; no es una visa.",
    "This is simulated guidance only. Always verify with the Immigration & Checkpoints Authority (ica.gov.sg).": "Esto es solo orientación simulada. Verifica siempre en la Immigration & Checkpoints Authority (ica.gov.sg).",
    "Always verify with the Immigration & Checkpoints Authority (ica.gov.sg).": "Verifica siempre en la Immigration & Checkpoints Authority (ica.gov.sg).",
    "Your passport nationality is generally accepted for Singapore student pass applications.": "Tu nacionalidad de pasaporte es generalmente aceptada para solicitudes de Student's Pass de Singapur.",
    "Studying in Singapore requires admission to a registered institution and a Student's Pass (ICA).": "Estudiar en Singapur requiere la admisión en una institución registrada y un Student's Pass (ICA).",
    "You may need to show sufficient funds for tuition and living costs. Check official Singapore requirements.": "Puede que necesites demostrar fondos suficientes para matrícula y manutención. Consulta los requisitos oficiales de Singapur.",
    "Singapore has no dedicated digital nomad visa; short remote-work stays happen under visitor rules and longer stays require a work pass.": "Singapur no tiene una visa de nómada digital dedicada; las estancias cortas de trabajo remoto ocurren bajo reglas de visitante y las largas requieren un permiso de trabajo.",
    "Singapore's Work Holiday Programme covers university students and graduates from ten countries or regions; your nationality does not appear to be among them.": "El Work Holiday Programme de Singapur cubre a estudiantes universitarios y graduados de diez países o regiones; tu nacionalidad no parece estar entre ellos.",
    "Thailand's Destination Thailand Visa (DTV) is aimed at remote workers, freelancers and long-stay visitors with activities such as Thai soft-power programmes.": "La Destination Thailand Visa (DTV) de Tailandia está dirigida a trabajadores remotos, freelancers y visitantes de larga estancia con actividades como los programas de soft power tailandés.",
    "Working remotely from Singapore requires an active remote work relationship with an employer or clients abroad.": "Trabajar en remoto desde Singapur requiere una relación activa de trabajo remoto con un empleador o clientes en el extranjero.",
    "Your passport nationality has a bilateral visa exemption agreement with Thailand; the period of stay is based on the respective agreement.": "Tu nacionalidad de pasaporte tiene un acuerdo bilateral de exención de visado con Tailandia; el periodo de estancia depende del acuerdo respectivo.",
    "Your passport nationality is among the ten countries or regions covered by Singapore's Work Holiday Programme.": "Tu nacionalidad de pasaporte está entre los diez países o regiones cubiertos por el Work Holiday Programme de Singapur.",
    "Your age appears to be within the eligible range for this pass (18 to 25 at the time of application).": "Tu edad parece estar dentro del rango elegible para este pase (18 a 25 al momento de la solicitud).",
    "You must be an undergraduate or graduate of a university in one of the ten eligible countries or regions, recognised by its government.": "Debes ser estudiante o graduado de una universidad de uno de los diez países o regiones elegibles, reconocida por su gobierno.",
    "The pass allows work and holiday in Singapore for up to 6 months.": "El pase permite trabajar y vacacionar en Singapur hasta 6 meses.",
    "The Work Holiday Programme has a capacity of 2,000 pass holders at any one time.": "El Work Holiday Programme tiene una capacidad de 2.000 titulares del pase simultáneos.",
    "You may need to show proof of university enrolment or graduation and residence requirements.": "Puede que necesites demostrar matrícula o graduación universitaria y requisitos de residencia.",
    "Verify current conditions with the Ministry of Manpower (mom.gov.sg). Simulated guidance only.": "Verifica las condiciones vigentes en el Ministry of Manpower (mom.gov.sg). Solo orientación simulada.",
    "Verify current conditions with the Ministry of Manpower (mom.gov.sg).": "Verifica las condiciones vigentes en el Ministry of Manpower (mom.gov.sg).",
    "A tourist visa is likely required for your nationality. Check the Royal Thai embassy or consulate in your country.": "Probablemente necesites una visa de turista para tu nacionalidad. Consulta la embajada o consulado tailandés de tu país.",
    "Your travel document appears on Singapore's list of countries that require a valid entry visa before travelling.": "Tu documento de viaje aparece en la lista de Singapur de países que requieren una visa de entrada válida antes de viajar.",
    elg_load_error: "No se pudo cargar el motor de elegibilidad. Revisa eligibility.js.",
    disclaimer_short: "Orientación simulada. Wayfare no es asesor migratorio ni agencia de inmigración.",
    legal_privacy: "Privacidad",
    legal_notice: "Aviso legal",
    disclaimer_long: "Wayfare no es un asesor migratorio ni una agencia de inmigración. Los resultados son simulados y solo sirven como orientación general; no constituyen asesoramiento legal ni migratorio. Consulta siempre fuentes oficiales antes de aplicar.",
    g_nodata_panel: "Wayfare todavía no tiene datos de este país. Antes que enseñarte un número que no podemos respaldar, preferimos decírtelo.",
    g_legend_nodata: "Aún sin datos",
    g_legend_eligible: "Podrías calificar",
    g_legend_partial: "Coincidencia parcial",
    g_legend_unlikely: "Poco probable",
    demo_map_tag: "Mapa de ejemplo",
    demo_map_text: "Estás viendo un resultado de muestra (pasaporte español, 25 años) para que veas cómo funciona Wayfare.",
    demo_map_cta: "Haz TU mapa — 2 minutos",
    g_share_btn: "Comparte tu mapa",
    g_share_text: "Con mi pasaporte puedo irme a {E} países (y a otros {P} con condiciones). Descubre tu propio mapa en Wayfare:",
    g_share_copied: "¡Copiado! Pégalo donde quieras — la imagen de tu mapa también se ha descargado.",
    g_share_saved: "Imagen de tu mapa descargada. Enlace: edulino-byte.github.io/wayfare-site",
    g_share_img_countries: "países me esperan",
    g_share_img_footer: "Descubre tu mapa · datos verificados contra fuentes oficiales",

    st_eligible: "Probablemente elegible",
    st_partial: "Cerca — con vacíos",
    st_ineligible: "Poco probable",
    /* v1.155.0 — una tarjeta sin fuente capturada no lleva veredicto */
    st_nodata: "Sin fuente capturada",
    ap_comprobado: "Comprobado en la fuente oficial el ",
    ap_abierta: "Abierta ahora",
    ap_cerrada_sin_fecha: "Cerrada · sin fecha publicada",
    ap_cerrada_abre: "Cerrada · abre el ",
    "No official source captured yet": "Todavía sin fuente oficial capturada",
    /* v1.155.0 — las cuatro tarjetas honestas: relleno genérico sin puntuación */
    "Wayfare has not yet captured an official source for the visitor route in this destination, so this card carries no score: general guidance only, not an assessment of your case.":
      "Wayfare todavía no ha capturado una fuente oficial para la vía de turismo en este destino, así que esta tarjeta no lleva puntuación: son consejos generales, no una valoración de tu caso.",
    "Wayfare has not yet captured an official source for the study route in this destination, so this card carries no score: general guidance only, not an assessment of your case.":
      "Wayfare todavía no ha capturado una fuente oficial para la vía de estudios en este destino, así que esta tarjeta no lleva puntuación: son consejos generales, no una valoración de tu caso.",
    "Wayfare has not yet captured an official source for the work route in this destination, so this card carries no score: general guidance only, not an assessment of your case.":
      "Wayfare todavía no ha capturado una fuente oficial para la vía de trabajo en este destino, así que esta tarjeta no lleva puntuación: son consejos generales, no una valoración de tu caso.",
    "Wayfare has not yet captured an official source for the remote work route in this destination, so this card carries no score: general guidance only, not an assessment of your case.":
      "Wayfare todavía no ha capturado una fuente oficial para la vía de trabajo en remoto en este destino, así que esta tarjeta no lleva puntuación: son consejos generales, no una valoración de tu caso.",
    "Wayfare has not yet captured an official source for the working holiday route in this destination, so this card carries no score: general guidance only, not an assessment of your case.":
      "Wayfare todavía no ha capturado una fuente oficial para la vía de vacaciones y trabajo en este destino, así que esta tarjeta no lleva puntuación: son consejos generales, no una valoración de tu caso.",

    rq_minAge: "edad mínima",
    rq_maxAge: "límite de edad",
    rq_minSavings: "ahorros",
    rq_minEdu: "educación",
    rq_minExp: "experiencia",
    rq_minEnglish: "nivel de inglés",
    rq_passport: "elegibilidad del pasaporte",

    vt_student: "Visa de estudiante",
    vt_work_and_holiday: "Visa Work and Holiday",
    vt_work: "Visa de trabajo",
    vt_tourist: "Visa de turista",
    vt_digital_nomad: "Visa de nómada digital",

    rg_europe: "Europa",
    rg_asia: "Asia",
    rg_north_america: "Norteamérica",
    rg_south_america: "Sudamérica",
    rg_oceania: "Oceanía",
    rg_africa: "África",
    rg_other: "Otros",

    units_years: "años",

    /* ── Traducciones de resultados de visas Australia ── */
    /* Nombres oficiales */
    "Working Holiday visa (subclass 417)": "Working Holiday visa (subclase 417)",
    "Work and Holiday visa (subclass 462)": "Work and Holiday visa (subclase 462)",
    "Student visa (subclass 500)": "Visa de estudiante (subclase 500)",
    "Visitor visa (subclass 600) — Tourist stream": "Visa de visitante (subclase 600) — Flujo turístico",

    /* 417 coincidencias */
    "Your passport appears to match the subclass 417 eligible passport list.": "Tu pasaporte parece estar incluido en la lista de pasaportes elegibles para la subclase 417.",
    "Your age appears to be within the allowed range for your passport under subclass 417 (18 to 35).": "Tu edad parece estar dentro del rango permitido para tu pasaporte en la subclase 417 (18 a 35 años).",
    "Your age appears to be within the allowed range for your passport under subclass 417 (18 to 30).": "Tu edad parece estar dentro del rango permitido para tu pasaporte en la subclase 417 (18 a 30 años).",
    "Your age appears to be outside the allowed range for subclass 417. The allowed range for your passport is 18 to 35.": "Tu edad parece estar fuera del rango permitido para la subclase 417. El rango para tu pasaporte es de 18 a 35 años.",
    "Your age appears to be outside the allowed range for subclass 417. The allowed range for your passport is 18 to 30.": "Tu edad parece estar fuera del rango permitido para la subclase 417. El rango para tu pasaporte es de 18 a 30 años.",

    /* Advertencias compartidas */
    "You may need around AUD 5,000 for your initial stay, plus enough to cover onward travel after leaving Australia.": "Puede que necesites alrededor de AUD 5.000 para tu estancia inicial, además de fondos suficientes para el viaje de salida de Australia.",
    "Always verify with the Australian Department of Home Affairs (immi.homeaffairs.gov.au).": "Verifica siempre en el Departamento de Interior de Australia (immi.homeaffairs.gov.au).",
    "As a New Zealand citizen, the Special Category visa (subclass 444) granted on arrival already lets you visit, study and work in Australia without employer sponsorship.": "Como ciudadano neozelandés, la Special Category visa (subclass 444) que recibes al llegar ya te permite visitar, estudiar y trabajar en Australia sin patrocinio de un empleador.",
    "Sponsorship and visa assessment may be more complex for your passport nationality.": "El patrocinio y la evaluación del visado pueden ser más complejos para la nacionalidad de tu pasaporte.",
    "You must remain a New Zealand citizen and continue to meet the character requirements.": "Debes seguir siendo ciudadano neozelandés y seguir cumpliendo los requisitos de carácter.",

    /* 417 requisitos no evaluados */
    "You must apply online from outside Australia.": "Debes solicitar la visa en línea desde fuera de Australia.",
    "You must apply on your own and cannot include family members in the application.": "Debes solicitar la visa de forma individual; no puedes incluir familiares en la solicitud.",
    "You must not be accompanied by dependent children.": "No debes estar acompañado/a de hijos dependientes.",
    "You must not have previously entered Australia on a subclass 417 or 462 visa.": "No debes haber ingresado previamente a Australia con una visa de subclase 417 o 462.",
    "You must meet health and character requirements.": "Debes cumplir los requisitos de salud y buena conducta.",
    "You must have paid back, or arranged to repay, any debts to the Australian Government.": "Debes haber reembolsado, o acordado reembolsar, cualquier deuda con el Gobierno australiano.",
    "Your immigration history, including cancelled visas or refused applications, may be considered.": "Tu historial migratorio, incluidas visas canceladas o solicitudes rechazadas, puede ser tenido en cuenta.",
    "You must acknowledge the Australian Values Statement.": "Debes aceptar la Declaración de Valores Australianos.",

    /* 462 coincidencias */
    "Your passport appears to match the subclass 462 eligible passport list.": "Tu pasaporte parece estar incluido en la lista de pasaportes elegibles para la subclase 462.",
    "Your age appears to be within the 18 to 30 range.": "Tu edad parece estar dentro del rango permitido de 18 a 30 años.",
    "Your education appears to align with the subclass 462 education requirement for your passport.": "Tu nivel educativo parece alinearse con el requisito de educación de la subclase 462 para tu pasaporte.",
    "Your education appears to meet the Senior Secondary requirement for this passport route.": "Tu nivel educativo parece cumplir el requisito de educación secundaria superior para esta vía.",
    "Your English level appears to align with the Functional English requirement.": "Tu nivel de inglés parece cumplir el requisito de inglés funcional.",

    /* 462 advertencias */
    "Your age appears to be outside the 18 to 30 range for subclass 462.": "Tu edad parece estar fuera del rango permitido de 18 a 30 años para la subclase 462.",
    "This passport route may require a tertiary qualification or completion of at least 2 years of undergraduate university study.": "Esta vía puede requerir una titulación universitaria o haber completado al menos 2 años de estudios universitarios de grado.",
    "This passport route may require at least 2 years of post-secondary study.": "Esta vía puede requerir al menos 2 años de estudios postsecundarios.",
    "Chile passport holders may need tertiary qualifications or completion/approval for third-year undergraduate study.": "Los titulares de pasaporte chileno pueden necesitar titulación universitaria o haber completado/estar aprobados para el tercer año de grado.",
    "Israel passport holders may need a Senior Secondary Certificate of Education or equivalent.": "Los titulares de pasaporte israelí pueden necesitar el Certificado de Educación Secundaria Superior o equivalente.",
    "Israel passport holders may also need to show completed military service or legal exemption from military service.": "Los titulares de pasaporte israelí también pueden necesitar acreditar el servicio militar completado o exención legal.",
    "Malaysia passport holders should verify their qualification type meets the accepted list (degrees, graduate diplomas, graduate certificates).": "Los titulares de pasaporte malayo deben verificar que su tipo de titulación figure en la lista aceptada (licenciaturas, diplomas de posgrado, certificados de posgrado).",
    "Malaysia passport holders may need an accepted tertiary qualification or completion of 2 years of undergraduate university study.": "Los titulares de pasaporte malayo pueden necesitar una titulación universitaria aceptada o haber completado 2 años de estudios universitarios.",
    "Malaysia passport holders may need a Good Conduct Certificate or accepted support document.": "Los titulares de pasaporte malayo pueden necesitar un Certificado de Buena Conducta u otro documento de apoyo aceptado.",
    "Thailand passport holders may need a tertiary qualification from a university, college or training centre.": "Los titulares de pasaporte tailandés pueden necesitar una titulación universitaria de una universidad, instituto o centro de formación.",
    "Switzerland passport holders may need to show 2 years of study following compulsory schooling.": "Los titulares de pasaporte suizo pueden necesitar acreditar 2 años de estudios tras la escolarización obligatoria.",
    "United States passport holders may need a Senior Secondary Certificate of Education or equivalent.": "Los titulares de pasaporte estadounidense pueden necesitar el Certificado de Educación Secundaria Superior o equivalente.",
    "You may need to show Functional English through an approved passport, study history, or English test/assessment.": "Puede que necesites acreditar inglés funcional mediante un pasaporte aprobado, historial de estudios o prueba de inglés.",
    "Israel passport holders may need to show Functional English through the English Bagrut route or another approved method.": "Los titulares de pasaporte israelí pueden necesitar acreditar inglés funcional mediante el examen Bagrut de inglés u otro método aprobado.",
    "This passport route may require a government letter of support or an accepted alternative.": "Esta vía puede requerir una carta de apoyo gubernamental o una alternativa aceptada.",
    "Passport holders from China, India and Vietnam must participate in a visa pre-application process/ballot and be randomly selected before they can apply. Wayfare cannot determine whether you have been selected.": "Los titulares de pasaporte de China, India y Vietnam deben participar en un proceso de preselección/sorteo y ser seleccionados al azar antes de poder solicitar la visa. Wayfare no puede determinar si has sido seleccionado/a.",
    "You may need to be selected through the subclass 462 pre-application ballot before you can apply.": "Es posible que debas ser seleccionado/a mediante el sorteo de preselección de la subclase 462 antes de poder solicitar la visa.",
    "Your passport does not appear to be listed for Australia's Working Holiday visa subclass 417 or Work and Holiday visa subclass 462.": "Tu pasaporte no parece estar incluido en la lista de la Working Holiday visa (subclase 417) ni en la Work and Holiday visa (subclase 462) de Australia.",
    "Check the Australian Department of Home Affairs website for the full current eligibility lists.": "Consulta el sitio web del Departamento del Interior de Australia para ver las listas de elegibilidad actualizadas.",
    "You must not have previously entered Australia on a subclass 462 or 417 visa.": "No debes haber ingresado previamente a Australia con una visa de subclase 462 o 417.",

    /* 500 coincidencias y advertencias */
    "Your age appears to meet the minimum age requirement for subclass 500.": "Tu edad parece cumplir el requisito de edad mínima para la subclase 500.",
    "Student visa subclass 500 generally requires applicants to be at least 6 years old.": "La visa de estudiante (subclase 500) generalmente requiere que los solicitantes tengan al menos 6 años.",
    "Applicants under 18 may need to prove adequate welfare arrangements while in Australia.": "Los solicitantes menores de 18 años pueden necesitar acreditar acuerdos de bienestar adecuados durante su estancia en Australia.",
    "For applicants under 18, the visa may not be granted if it is not in the best interests of the child.": "Para solicitantes menores de 18 años, la visa puede denegarse si no es en el mejor interés del menor.",
    "Your English level appears to align with the possible English evidence requirement, although official evidence may still be required.": "Tu nivel de inglés parece cumplir el posible requisito de acreditación de inglés, aunque puede ser necesario aportar evidencia oficial.",
    "You may need to provide evidence of English language skills or fall into an exemption category.": "Es posible que necesites aportar evidencia de tu nivel de inglés o pertenecer a una categoría exenta.",
    "Your education background may support a student visa pathway, depending on your intended course.": "Tu formación académica puede respaldar una solicitud de visa de estudiante, según el curso que pretendas cursar.",
    "Your intended course and enrolment evidence will be more important than prior education level.": "El curso que vayas a cursar y la evidencia de matrícula tendrán más peso que tu nivel educativo previo.",
    "You must be enrolled in an eligible course of study in Australia.": "Debes estar matriculado/a en un curso de estudios elegible en Australia.",
    "You must provide a valid Confirmation of Enrolment (CoE), unless another accepted evidence pathway applies.": "Debes aportar una Confirmación de Matrícula (CoE) válida, salvo que se aplique otra vía de evidencia aceptada.",
    "You must hold Overseas Student Health Cover (OSHC), unless an exemption applies.": "Debes contar con el Seguro Médico para Estudiantes en el Extranjero (OSHC), salvo que se aplique una exención.",
    "You may need to show evidence of English language skills, unless exempt.": "Es posible que debas acreditar tu nivel de inglés, salvo que estés exento/a.",
    "You must show that you are a genuine student and that studying in Australia is the primary reason for the visa.": "Debes demostrar que eres un estudiante genuino/a y que estudiar en Australia es el motivo principal de la visa.",
    "You must have enough money for your stay. Wayfare does not currently assess financial evidence.": "Debes disponer de fondos suficientes para tu estancia. Wayfare no evalúa actualmente la evidencia financiera.",
    "If you are 18 or older, you must acknowledge the Australian Values Statement.": "Si tienes 18 años o más, debes aceptar la Declaración de Valores Australianos.",
    "If applying while in Australia, you may need to hold an eligible substantive visa.": "Si solicitas la visa desde Australia, puede que necesites tener una visa sustantiva elegible.",

    /* 600 coincidencias y advertencias */
    "This route does not appear to require a specific eligible passport list based on the captured official page.": "Esta vía no parece requerir una lista específica de pasaportes elegibles según la página oficial consultada.",
    "Your current residence appears consistent with an outside-Australia tourist stream, but your actual location at application time must be checked.": "Tu residencia actual parece compatible con el flujo turístico desde fuera de Australia, pero debes verificar tu ubicación real en el momento de la solicitud.",
    "This tourist stream requires you to be outside Australia when you apply and when the visa is decided.": "Este flujo turístico requiere que estés fuera de Australia tanto al solicitar la visa como en el momento en que se resuelve.",
    "You must be a genuine visitor and only intend to stay temporarily in Australia.": "Debes ser un visitante genuino/a y tener intención de permanecer temporalmente en Australia.",
    "You must have, or have access to, enough money to support yourself while in Australia. Wayfare does not currently assess financial evidence.": "Debes disponer o tener acceso a fondos suficientes para mantenerte en Australia. Wayfare no evalúa actualmente la evidencia financiera.",
    "This visa does not allow work in Australia. If you plan to work remotely while in Australia, you should check official conditions carefully.": "Esta visa no permite trabajar en Australia. Si planeas trabajar en remoto desde Australia, debes revisar detenidamente las condiciones oficiales.",
    "You must intend to visit Australia only, such as tourism, a cruise, or visiting family or friends.": "Debes tener intención de visitar Australia únicamente con fines turísticos, como turismo, crucero o visita a familiares o amigos.",
    "This tourist stream is not for business or medical treatment purposes.": "Este flujo turístico no está destinado a actividades empresariales ni tratamientos médicos.",
    "You must not work in Australia.": "No puedes trabajar en Australia.",
    "You must be outside Australia when you apply and when the visa is decided.": "Debes estar fuera de Australia tanto al solicitar la visa como en el momento en que se resuelve.",
    "You must be a genuine visitor and obey any visa conditions and stay period.": "Debes ser un visitante genuino/a y cumplir las condiciones de la visa y el período de estancia.",

    /* AU digital nomad */
    "Australia does not currently offer a dedicated Digital Nomad visa. Remote work on a visitor visa is a legally uncertain arrangement.": "Australia no ofrece actualmente una visa específica para nómadas digitales. El trabajo remoto con una visa de visitante es una situación legalmente incierta.",
    "Remote work status is the primary factor for digital nomad-style stays.": "El trabajo en remoto es el factor principal para estancias de tipo nómada digital.",
    "Your profile indicates remote work, which is the main factor for this route.": "Tu perfil indica trabajo en remoto, que es el factor principal para esta vía.",
    "Income requirements for extended stays should be verified against official visitor visa guidance.": "Los requisitos de ingresos para estancias prolongadas deben verificarse con la guía oficial de visa de visitante.",
    "You may need to show sufficient funds for your planned stay. Check official visitor visa requirements.": "Puede que necesites demostrar fondos suficientes para tu estancia prevista. Consulta los requisitos oficiales de la visa de visitante.",
    "You may need to show sufficient funds for your stay. Check official visitor visa requirements.": "Puede que necesites demostrar fondos suficientes para tu estancia. Consulta los requisitos oficiales de la visa de visitante.",

    /* ── Working Holiday de Nueva Zelanda — nombres oficiales ── */
    "Argentina Working Holiday Visa": "Visa Working Holiday de Argentina",
    "Austria Working Holiday Visa": "Visa Working Holiday de Austria",
    "Belgium Working Holiday Visa": "Visa Working Holiday de Bélgica",
    "Brazil Working Holiday Visa": "Visa Working Holiday de Brasil",
    "Canada Working Holiday Visa": "Visa Working Holiday de Canadá",
    "Chile Working Holiday Visa": "Visa Working Holiday de Chile",
    "China Working Holiday Visa": "Visa Working Holiday de China",
    "Croatia Working Holiday Visa": "Visa Working Holiday de Croacia",

    /* ── Working Holiday de Nueva Zelanda — coincidencias ── */
    "Your passport appears to be eligible for a New Zealand Working Holiday visa.": "Tu pasaporte parece ser elegible para una visa Working Holiday de Nueva Zelanda.",
    "Your age appears to be within the eligible range for this visa (18 to 35).": "Tu edad parece estar dentro del rango elegible para esta visa (18 a 35 años).",
    "Your age appears to be within the eligible range for this visa (18 to 30).": "Tu edad parece estar dentro del rango elegible para esta visa (18 a 30 años).",
    "You appear to be living in China, which this visa requires.": "Pareces estar viviendo en China, lo cual exige esta visa.",
    "Your education appears to meet the senior high school requirement for this visa.": "Tu nivel educativo parece cumplir el requisito de educación secundaria superior para esta visa.",
    "Your English level appears to meet the requirement to speak and understand English.": "Tu nivel de inglés parece cumplir el requisito de hablar y entender inglés.",

    /* ── Working Holiday de Nueva Zelanda — advertencias ── */
    "Your age appears to be outside the eligible range for this visa. The range is 18 to 35.": "Tu edad parece estar fuera del rango elegible para esta visa. El rango es de 18 a 35 años.",
    "Your age appears to be outside the eligible range for this visa. The range is 18 to 30.": "Tu edad parece estar fuera del rango elegible para esta visa. El rango es de 18 a 30 años.",
    "You may need to show around NZD 2,250 in living expenses, plus enough funds for onward travel.": "Puede que necesites demostrar alrededor de NZD 2.250 en gastos de manutención, además de fondos suficientes para el viaje de salida.",
    "You may need to show around NZD 4,200 in living expenses, plus enough funds for onward travel.": "Puede que necesites demostrar alrededor de NZD 4.200 en gastos de manutención, además de fondos suficientes para el viaje de salida.",
    "The application fee starts from NZD 770.": "La tasa de solicitud parte desde NZD 770.",
    "This visa has a limited annual quota of about 1,000 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 1.000 plazas, que puede agotarse.",
    "This visa has a limited annual quota of about 940 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 940 plazas, que puede agotarse.",
    "This visa has a limited annual quota of about 300 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 300 plazas, que puede agotarse.",
    "This visa has a limited annual quota of about 100 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 100 plazas, que puede agotarse.",
    "You must hold full medical and hospital insurance for your entire stay in New Zealand.": "Debes contar con un seguro médico y hospitalario completo durante toda tu estancia en Nueva Zelanda.",
    "You must have a genuine intention to holiday in New Zealand, with any work being secondary.": "Debes tener una intención genuina de vacacionar en Nueva Zelanda, siendo el trabajo algo secundario.",
    "You must plan to leave New Zealand at the end of your stay.": "Debes tener previsto salir de Nueva Zelanda al final de tu estancia.",
    "You must not have held a New Zealand Working Holiday visa before.": "No debes haber tenido antes una visa Working Holiday de Nueva Zelanda.",
    "You cannot take permanent employment, and no job offer is required before you apply.": "No puedes aceptar un empleo permanente, y no se requiere una oferta de trabajo antes de solicitar la visa.",
    "Any partner or child travelling with you must apply for their own visa.": "Cualquier pareja o hijo/a que viaje contigo debe solicitar su propia visa.",
    "You can work for any one employer for up to 3 months.": "Puedes trabajar para un mismo empleador durante un máximo de 3 meses.",
    "You can work for any one employer for up to 6 months.": "Puedes trabajar para un mismo empleador durante un máximo de 6 meses.",
    "You can study or train for up to 6 months during your stay.": "Puedes estudiar o formarte durante un máximo de 6 meses durante tu estancia.",
    "If you stay longer than 12 months, you may need a chest X-ray and medical examination.": "Si te quedas más de 12 meses, puede que necesites una radiografía de tórax y un examen médico.",
    "This visa requires you to normally live in China and to be in China when you apply. Your current residence does not appear to be China.": "Esta visa exige que residas habitualmente en China y que estés en China al solicitarla. Tu residencia actual no parece ser China.",
    "This visa requires a senior high school qualification involving at least 3 years of full-time study.": "Esta visa exige una titulación de educación secundaria superior que implique al menos 3 años de estudio a tiempo completo.",
    "You must be able to speak and understand English, and may need an English test result that is no more than 2 years old.": "Debes ser capaz de hablar y entender inglés, y puede que necesites un resultado de examen de inglés con una antigüedad no superior a 2 años.",
    "You will need extra documents, including a supplementary form for Chinese citizens, proof that you normally live in China, a verified senior high school qualification, and possibly an English test result, a medical or chest X-ray, and police certificates.": "Necesitarás documentos adicionales, incluido un formulario complementario para ciudadanos chinos, prueba de que resides habitualmente en China, una titulación de secundaria superior verificada y, posiblemente, un resultado de examen de inglés, un examen médico o radiografía de tórax y certificados policiales.",
    "Your passport does not appear to be on the New Zealand Working Holiday visa country list that Wayfare currently covers.": "Tu pasaporte no parece estar en la lista de países con visa Working Holiday de Nueva Zelanda que Wayfare cubre actualmente.",
    "Check Immigration New Zealand for the full list of eligible countries and conditions.": "Consulta Immigration New Zealand para ver la lista completa de países elegibles y sus condiciones.",
    "This is simulated guidance only. Always verify with Immigration New Zealand.": "Esto es solo orientación simulada. Verifica siempre con Immigration New Zealand.",
    "Always verify with Immigration New Zealand.": "This is simulated guidance only. Always verify with Immigration New Zealand.",

    /* ── Working Holiday de Nueva Zelanda — añadidos del conjunto validado ── */
    "You must be a citizen of the country offering this Working Holiday arrangement and hold a valid passport.": "Debes ser ciudadano/a del país que ofrece este acuerdo de Working Holiday y tener un pasaporte válido.",
    "Your passport should be valid for at least 3 months after the visa expires.": "Tu pasaporte debe ser válido durante al menos 3 meses después de que caduque la visa.",
    "If you apply from outside New Zealand, your passport may need to be valid for at least 15 months after you arrive.": "Si solicitas la visa desde fuera de Nueva Zelanda, puede que tu pasaporte deba ser válido durante al menos 15 meses después de tu llegada.",
    "If you apply from inside New Zealand, your passport may need to be valid for at least 3 months after the visa expires.": "Si solicitas la visa desde dentro de Nueva Zelanda, puede que tu pasaporte deba ser válido durante al menos 3 meses después de que caduque la visa.",
    "You must have funds for onward travel, or a ticket to leave New Zealand.": "Debes disponer de fondos para el viaje de salida, o de un billete para abandonar Nueva Zelanda.",
    "Immigration New Zealand may ask for medical examinations, chest X-rays or police certificates.": "Immigration New Zealand puede solicitar exámenes médicos, radiografías de tórax o certificados policiales.",
    "You must not have held a New Zealand Working Holiday visa before, unless a country-specific subsequent or extension rule applies.": "No debes haber tenido antes una visa Working Holiday de Nueva Zelanda, salvo que se aplique una regla de visa posterior o de extensión específica del país.",
    "You can work in temporary jobs during your stay.": "Puedes trabajar en empleos temporales durante tu estancia.",
    "You can apply for a 12-month or a 23-month visa.": "Puedes solicitar una visa de 12 meses o de 23 meses.",
    "With a 12-month visa, you may later apply for a subsequent work visa to extend your stay up to 23 months if you meet extra criteria.": "Con una visa de 12 meses, puedes solicitar posteriormente una visa de trabajo subsiguiente para ampliar tu estancia hasta 23 meses si cumples criterios adicionales.",
    "You can travel in and out of New Zealand while your visa is valid.": "Puedes entrar y salir de Nueva Zelanda mientras tu visa esté vigente.",
    "You must not have been outside China for more than 2 years immediately before you apply.": "No debes haber estado fuera de China durante más de 2 años inmediatamente antes de solicitar la visa.",
    "Your senior high school qualification may need to be verified by CSSD, Ministry of Education, PRC.": "Tu titulación de educación secundaria superior puede necesitar verificación por parte del CSSD, Ministerio de Educación de la R.P. China.",
    "You must complete the Supplementary Form for Chinese citizens, and your Hukou household registration book may be used as additional identity evidence.": "Debes completar el Formulario Complementario para ciudadanos chinos, y tu libro de registro familiar Hukou puede usarse como prueba de identidad adicional.",
    "If you are coming to New Zealand for more than 6 months, applicants from China, Hong Kong or Macao may need a recent chest X-ray.": "Si vas a Nueva Zelanda por más de 6 meses, los solicitantes de China, Hong Kong o Macao pueden necesitar una radiografía de tórax reciente.",

    /* ── Working Holiday de Nueva Zelanda — CZ + DK ── */
    "Czech Working Holiday Visa": "Visa Working Holiday de Chequia",
    "Denmark Working Holiday Visa": "Visa Working Holiday de Dinamarca",
    "This visa has a limited annual quota of about 1,200 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 1.200 plazas, que puede agotarse.",
    "You may be able to stay longer by applying for a Working Holiday Extension Work Visa if you do seasonal work in the viticulture or horticulture industries.": "Es posible que puedas quedarte más tiempo solicitando una Working Holiday Extension Work Visa si realizas trabajo estacional en los sectores de viticultura u horticultura.",

    /* ── Working Holiday de Nueva Zelanda — EE + FI + FR ── */
    "Estonia Working Holiday Visa": "Visa Working Holiday de Estonia",
    "Finland Working Holiday Visa": "Visa Working Holiday de Finlandia",
    "France Working Holiday Visa": "Visa Working Holiday de Francia",
    "Germany Working Holiday Visa": "Visa Working Holiday de Alemania",
    "Hungary Working Holiday Visa": "Visa Working Holiday de Hungría",
    "Ireland Working Holiday Visa": "Visa Working Holiday de Irlanda",
    "Italy Working Holiday Visa": "Visa Working Holiday de Italia",
    "Japan Working Holiday Visa": "Visa Working Holiday de Japón",
    "Latvia Working Holiday Visa": "Visa Working Holiday de Letonia",
    "Lithuania Working Holiday Visa": "Visa Working Holiday de Lituania",
    "Luxembourg Working Holiday Visa": "Visa Working Holiday de Luxemburgo",
    "Mexico Working Holiday Visa": "Visa Working Holiday de México",
    "Netherlands Working Holiday Visa": "Visa Working Holiday de Países Bajos",
    "Norway Working Holiday Visa": "Visa Working Holiday de Noruega",
    "Peru Working Holiday Visa": "Visa Working Holiday de Perú",
    "Poland Working Holiday Visa": "Visa Working Holiday de Polonia",
    "Your education appears to meet the requirement of at least 3 years of full-time study towards a tertiary qualification.": "Tu nivel educativo parece cumplir el requisito de al menos 3 años de estudio a tiempo completo hacia una titulación terciaria.",
    "This visa requires you to have completed at least 3 years of full-time study towards a tertiary qualification.": "Esta visa exige haber completado al menos 3 años de estudio a tiempo completo hacia una titulación terciaria.",
    "Your qualifications or course transcript must be verified by the Peru Ministry of Foreign Affairs.": "Tu titulación o expediente académico debe estar verificado por el Ministerio de Relaciones Exteriores de Perú.",
    "If you have an acceptable English language test result that is no more than 2 years old, you need at least NZD 4,200; otherwise you need at least NZD 7,000.": "Si tienes un resultado de examen de inglés aceptable con una antigüedad no superior a 2 años, necesitas al menos NZD 4.200; de lo contrario, necesitas al menos NZD 7.000.",
    "Your education appears to meet the requirement of a tertiary qualification involving at least 4 years of full-time study.": "Tu nivel educativo parece cumplir el requisito de una titulación terciaria que implique al menos 4 años de estudio a tiempo completo.",
    "This visa requires a tertiary qualification involving at least 4 years of full-time study.": "Esta visa exige una titulación terciaria que implique al menos 4 años de estudio a tiempo completo.",
    "You must be able to speak and understand English, and provide an acceptable English test result or a tertiary qualification taught entirely in English.": "Debes ser capaz de hablar y entender inglés, y aportar un resultado de examen de inglés aceptable o una titulación terciaria impartida íntegramente en inglés.",
    "You must have at least NZD 7,000 to cover your living expenses.": "Debes tener al menos NZD 7.000 para cubrir tus gastos de manutención.",
    "Portugal Working Holiday Visa": "Visa Working Holiday de Portugal",
    "Spain Working Holiday Visa": "Visa Working Holiday de España",
    "Sweden Working Holiday Visa": "Visa Working Holiday de Suecia",
    "Turkey Working Holiday Visa": "Visa Working Holiday de Turquía",
    "United Kingdom Working Holiday Visa": "Visa Working Holiday de Reino Unido",

    /* GB destination (Phase 10F) — Youth Mobility / Standard Visitor / Student */
    "Youth Mobility Scheme visa": "Visa Youth Mobility Scheme",
    "Standard Visitor visa": "Visa Standard Visitor (visitante)",
    "Student visa": "Visa de Estudiante",
    "Your passport appears to be eligible for the UK Youth Mobility Scheme.": "Tu pasaporte parece ser elegible para el Youth Mobility Scheme del Reino Unido.",
    "Your age appears to be within the eligible range for this visa (18 to 35 at application).": "Tu edad parece estar dentro del rango elegible para esta visa (18 a 35 al solicitar).",
    "Your age appears to be within the eligible range for this visa (18 to 30 at application).": "Tu edad parece estar dentro del rango elegible para esta visa (18 a 30 al solicitar).",
    "Your age appears to be outside the eligible range for this visa. The range is 18 to 35 at the time you apply.": "Tu edad parece estar fuera del rango elegible para esta visa. El rango es de 18 a 35 años en el momento de solicitar.",
    "Your age appears to be outside the eligible range for this visa. The range is 18 to 30 at the time you apply.": "Tu edad parece estar fuera del rango elegible para esta visa. El rango es de 18 a 30 años en el momento de solicitar.",
    "Your passport does not appear to be on the UK Youth Mobility Scheme country list that Wayfare currently covers.": "Tu pasaporte no parece estar en la lista de países del Youth Mobility Scheme del Reino Unido que Wayfare cubre actualmente.",
    "Check GOV.UK for the full list of eligible countries and conditions.": "Consulta GOV.UK para ver la lista completa de países elegibles y condiciones.",
    "You must be selected in the Youth Mobility Scheme ballot before you can apply. Ballot places and windows are limited and change over time.": "Debes ser seleccionado en el sorteo (ballot) del Youth Mobility Scheme antes de poder solicitar. Las plazas y ventanas del sorteo son limitadas y cambian con el tiempo.",
    "Indian citizens use the separate India Young Professionals Scheme, which has its own ballot and requirements. This is not the standard Youth Mobility Scheme.": "Los ciudadanos de la India usan el esquema separado India Young Professionals Scheme, que tiene su propio sorteo y requisitos. No es el Youth Mobility Scheme estándar.",
    "You may be given a visa to live and work in the UK for up to 24 months.": "Se te puede otorgar una visa para vivir y trabajar en el Reino Unido por hasta 24 meses.",
    "If you are from Australia, Canada or New Zealand, you may be able to extend your visa by one year after the 2-year period ends.": "Si eres de Australia, Canadá o Nueva Zelanda, podrías extender tu visa un año más al terminar el período de 2 años.",
    "You must have at least £2,530 in savings, held for at least 28 days in a row; day 28 must be within 31 days of applying.": "Debes tener al menos £2.530 en ahorros, mantenidos durante al menos 28 días seguidos; el día 28 debe estar dentro de los 31 días previos a la solicitud.",
    "The application fee is £340, and you usually pay the healthcare surcharge of £776 per year. Fees can change.": "La tarifa de solicitud es de £340 y normalmente pagas el recargo sanitario de £776 por año. Las tarifas pueden cambiar.",
    "The earliest you can apply is 6 months before you travel.": "Lo más pronto que puedes solicitar es 6 meses antes de viajar.",
    "You can work in most jobs. Self-employment is only allowed if your premises are rented, your equipment is worth no more than £5,000 and you have no employees.": "Puedes trabajar en la mayoría de los empleos. El trabajo por cuenta propia solo se permite si tu local es alquilado, tu equipo no vale más de £5.000 y no tienes empleados.",
    "You cannot work as a professional sportsperson, and you cannot get public funds.": "No puedes trabajar como deportista profesional ni acceder a fondos públicos.",
    "You can study, but some courses need an Academic Technology Approval Scheme certificate.": "Puedes estudiar, pero algunos cursos requieren un certificado del Academic Technology Approval Scheme.",
    "You cannot bring family members on this visa, and you cannot apply if you have children under 18 who live with you or who you are financially responsible for.": "No puedes traer familiares con esta visa, y no puedes solicitar si tienes hijos menores de 18 años que viven contigo o de los que eres responsable económicamente.",
    "You cannot apply if you have already been in the UK under the Youth Mobility Scheme.": "No puedes solicitar si ya has estado en el Reino Unido bajo el Youth Mobility Scheme.",
    "Icelandic citizens must provide a criminal certificate.": "Los ciudadanos de Islandia deben presentar un certificado de antecedentes penales.",
    "You may need to provide tuberculosis (TB) test results depending on where you live.": "Puede que debas presentar resultados de la prueba de tuberculosis (TB) según dónde vivas.",
    "This is simulated guidance only. Always verify with GOV.UK.": "Esta es una guía simulada. Verifica siempre con GOV.UK.",
    "Always verify with GOV.UK.": "This is simulated guidance only. Always verify with GOV.UK.",
    "Depending on your passport, you either need a Standard Visitor visa before you travel or an Electronic Travel Authorisation (ETA); check GOV.UK to see which applies to you.": "Según tu pasaporte, necesitas una visa Standard Visitor antes de viajar o una Electronic Travel Authorisation (ETA); consulta GOV.UK para saber cuál te corresponde.",
    "You can usually stay in the UK for up to 6 months as a Standard Visitor.": "Normalmente puedes permanecer en el Reino Unido hasta 6 meses como Standard Visitor.",
    "You must be a genuine visitor who will leave the UK at the end of your visit.": "Debes ser un visitante genuino que saldrá del Reino Unido al final de su visita.",
    "You must be able to support yourself and any dependants during your trip, or have funding from someone else to support you.": "Debes poder mantenerte a ti mismo y a tus dependientes durante el viaje, o contar con financiación de otra persona.",
    "You cannot do paid or unpaid work for a UK company or as a self-employed person, unless you are doing a permitted paid engagement or event.": "No puedes hacer trabajo pagado ni no pagado para una empresa del Reino Unido ni por cuenta propia, salvo que sea un compromiso pagado permitido (permitted paid engagement).",
    "You cannot live in the UK for long periods of time through frequent or successive visits.": "No puedes vivir en el Reino Unido por períodos largos mediante visitas frecuentes o sucesivas.",
    "You cannot marry or register a civil partnership, or give notice of marriage or civil partnership, on this visa.": "No puedes casarte ni registrar una unión civil, ni dar aviso de matrimonio o unión civil, con esta visa.",
    "You can study for up to 6 months on a Standard Visitor visa.": "Puedes estudiar hasta 6 meses con una visa Standard Visitor.",
    "A Standard Visitor visa costs £135 for up to 6 months. Long-term visas cost £506 (2 years), £903 (5 years) or £1,128 (10 years), each allowing stays of up to 6 months per visit. Fees can change.": "La visa Standard Visitor cuesta £135 por hasta 6 meses. Las visas de larga duración cuestan £506 (2 años), £903 (5 años) o £1.128 (10 años), cada una con estancias de hasta 6 meses por visita. Las tarifas pueden cambiar.",
    "Visitor visas for medical reasons (up to 11 months, £234) and for academics (up to 12 months, £234) have different fees and lengths.": "Las visas de visitante por razones médicas (hasta 11 meses, £234) y para académicos (hasta 12 meses, £234) tienen tarifas y duraciones diferentes.",
    "The earliest you can apply is 3 months before you travel.": "Lo más pronto que puedes solicitar es 3 meses antes de viajar.",
    "Your education background is a positive signal for a UK Student visa application.": "Tu formación académica es una señal positiva para una solicitud de visa de Estudiante del Reino Unido.",
    "Your English level is a positive signal for the Student visa English requirement.": "Tu nivel de inglés es una señal positiva para el requisito de inglés de la visa de Estudiante.",
    "You must be 16 or over to apply for a Student visa.": "Debes tener 16 años o más para solicitar una visa de Estudiante.",
    "You need an unconditional offer and a Confirmation of Acceptance for Studies (CAS) from a licensed student sponsor.": "Necesitas una oferta incondicional y una Confirmation of Acceptance for Studies (CAS) de un patrocinador estudiantil autorizado.",
    "You must have enough money to support yourself: £1,529 a month for courses in London or £1,171 a month elsewhere, for up to 9 months, held for at least 28 days in a row. Amounts can change.": "Debes tener dinero suficiente para mantenerte: £1.529 al mes para cursos en Londres o £1.171 al mes en otros lugares, por hasta 9 meses, mantenido durante al menos 28 días seguidos. Los montos pueden cambiar.",
    "You must prove knowledge of English: CEFR level B2 for degree level or above, or B1 below degree level.": "Debes demostrar conocimiento de inglés: nivel B2 del MCER para nivel de grado o superior, o B1 por debajo del nivel de grado.",
    "The application fee is £558, and you usually pay the healthcare surcharge as part of your application. Fees can change.": "La tarifa de solicitud es de £558 y normalmente pagas el recargo sanitario como parte de tu solicitud. Las tarifas pueden cambiar.",
    "You may be able to work, but how much depends on your course level and term time; you cannot claim public funds.": "Es posible que puedas trabajar, pero cuánto depende del nivel de tu curso y del período lectivo; no puedes reclamar fondos públicos.",
    "Your partner and children can only join you in limited cases, such as some postgraduate research courses. These rules changed in 2024.": "Tu pareja e hijos solo pueden acompañarte en casos limitados, como algunos cursos de investigación de posgrado. Estas reglas cambiaron en 2024.",
    "Some courses need an Academic Technology Approval Scheme (ATAS) certificate, and you may need tuberculosis (TB) test results.": "Algunos cursos requieren un certificado del Academic Technology Approval Scheme (ATAS), y puede que necesites resultados de la prueba de tuberculosis (TB).",
    "The earliest you can apply is 6 months before your course starts (from outside the UK).": "Lo más pronto que puedes solicitar es 6 meses antes de que comience tu curso (desde fuera del Reino Unido).",
    "You can usually get a decision within 3 weeks when applying from outside the UK.": "Normalmente recibes una decisión en 3 semanas al solicitar desde fuera del Reino Unido.",

    /* CA destination tune-up (Phase 10M) — visitor / student / IEC */
    "You must be a genuine visitor who will leave Canada at the end of your stay.": "Debes ser un visitante genuino que saldrá de Canadá al final de su estadía.",
    "You must be able to support yourself and any family members during your stay.": "Debes poder mantenerte a ti mismo y a tus familiares durante tu estadía.",
    "As a visitor you cannot work for a Canadian employer; short courses of study may be possible - check IRCC conditions.": "Como visitante no puedes trabajar para un empleador canadiense; los cursos cortos de estudio pueden ser posibles - consulta las condiciones de IRCC.",
    "A visitor visa (TRV) costs CAN$100 per person and an eTA costs CAN$7. Fees can change - check IRCC.": "La visa de visitante (TRV) cuesta CAN$100 por persona y la eTA cuesta CAN$7. Las tarifas pueden cambiar - consulta IRCC.",
    "You may need to give biometrics: CAN$85 per person or CAN$170 per family. Fees can change - check IRCC.": "Puede que debas dar tus datos biométricos: CAN$85 por persona o CAN$170 por familia. Las tarifas pueden cambiar - consulta IRCC.",
    "The IEC Working Holiday category gives an open work permit - you do not need a job offer and you can work for most employers in Canada.": "La categoría Working Holiday de IEC otorga un permiso de trabajo abierto - no necesitas una oferta de empleo y puedes trabajar para la mayoría de los empleadores en Canadá.",
    "Category availability and the upper age limit (30 or 35) depend on your country of citizenship - check the IEC country list.": "La disponibilidad de categorías y el límite superior de edad (30 o 35) dependen de tu país de ciudadanía - consulta la lista de países de IEC.",
    "You must have health insurance for the length of your stay; you may need to show proof at the border.": "Debes tener seguro médico durante toda tu estadía; puede que debas mostrar prueba en la frontera.",
    "You may need a police certificate and/or a medical exam.": "Puede que necesites un certificado de antecedentes penales y/o un examen médico.",
    "IEC fees: CAN$184.75 participation fee, plus the CAN$100 open work permit holder fee for Working Holiday, plus CAN$85 biometrics if required. Fees can change - check IRCC.": "Tarifas de IEC: CAN$184.75 de participación, más CAN$100 por el permiso de trabajo abierto de Working Holiday, más CAN$85 de biometría si se requiere. Las tarifas pueden cambiar - consulta IRCC.",
    "Rounds of invitations and available spots change during the season.": "Las rondas de invitaciones y las plazas disponibles cambian durante la temporada.",
    "Most applicants must include a provincial or territorial attestation letter (PAL/TAL) with the application.": "La mayoría de los solicitantes deben incluir una carta de certificación provincial o territorial (PAL/TAL) con la solicitud.",
    "For applications on or after September 1, 2025 (outside Quebec) you must show CAN$22,895 per year for a single applicant, excluding tuition and transportation; amounts scale with family size and can change.": "Para solicitudes a partir del 1 de septiembre de 2025 (fuera de Quebec) debes demostrar CAN$22.895 por año para un solicitante individual, sin incluir matrícula ni transporte; los montos aumentan según el tamaño de la familia y pueden cambiar.",
    "The study permit fee is CAN$150. Fees can change - check IRCC.": "La tarifa del permiso de estudios es de CAN$150. Las tarifas pueden cambiar - consulta IRCC.",
    /* Nombres oficiales de rutas CA (micro-ajuste v1.7.0) */
    "Visitor visa / eTA": "Visa de visitante / eTA",
    "Study permit": "Permiso de estudios (Study permit)",
    "IEC Working Holiday": "IEC Working Holiday",
    "You may need to give biometrics: CAN$85 per person.": "Puede que debas dar tus datos biométricos: CAN$85 por persona.",
    "You may need a medical exam and/or a police certificate.": "Puede que necesites un examen médico y/o un certificado de antecedentes penales.",
    "You may be able to work while studying - conditions and hour limits apply; check IRCC.": "Es posible que puedas trabajar mientras estudias - se aplican condiciones y límites de horas; consulta IRCC.",
    "You must show that your main purpose in Canada is to study.": "Debes demostrar que tu propósito principal en Canadá es estudiar.",

    "Uruguay Working Holiday Visa": "Visa Working Holiday de Uruguay",
    "USA Working Holiday Visa": "Visa Working Holiday de Estados Unidos",
    "This visa has a limited annual quota of about 15,000 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 15.000 plazas, que puede agotarse.",
    "You can apply for a 12-month, 23-month or 36-month visa.": "Puedes solicitar una visa de 12, 23 o 36 meses.",
    "You must have at least NZD 350 a month to cover your living expenses, and the money for your onward ticket must be in addition to this.": "Debes tener al menos NZD 350 al mes para cubrir tus gastos de manutención, y el dinero para tu billete de salida debe ser adicional a esto.",
    "You must normally live in the United Kingdom or the Crown Dependencies of Jersey, Guernsey or the Isle of Man.": "Debes residir habitualmente en el Reino Unido o en las Dependencias de la Corona de Jersey, Guernsey o la Isla de Man.",
    "To meet the residence requirement, you must not have been outside the United Kingdom or Crown Dependencies for more than 2 years immediately before applying.": "Para cumplir el requisito de residencia, no debes haber estado fuera del Reino Unido o las Dependencias de la Corona durante más de 2 años inmediatamente antes de solicitar la visa.",

    /* ── Fee Paying Student Visa de Nueva Zelanda ── */
    "Fee Paying Student Visa": "Visa de Estudiante de Pago (Fee Paying Student Visa)",
    "Your English level may help meet the English requirements of your chosen course.": "Tu nivel de inglés puede ayudarte a cumplir los requisitos de inglés del curso que elijas.",
    "Your course may require evidence of English language ability. Requirements vary by provider and course.": "Tu curso puede exigir evidencia de tu nivel de inglés. Los requisitos varían según el proveedor y el curso.",
    "Your education background may support entry to a range of courses, depending on your chosen provider.": "Tu formación académica puede facilitar el acceso a diversos cursos, según el proveedor que elijas.",
    "Students under 10 years old generally need a parent or legal guardian living with them in New Zealand.": "Los estudiantes menores de 10 años generalmente necesitan que un padre/madre o tutor legal viva con ellos en Nueva Zelanda.",
    "You must have an offer of place from an education provider approved by the Education (NZQA) authorities.": "Debes tener una oferta de plaza de un proveedor educativo aprobado por las autoridades educativas (NZQA).",
    "You must have paid your tuition fees in full, hold a scholarship, or have an approval in principle, before the visa is granted.": "Debes haber pagado la matrícula completa, tener una beca, o contar con una aprobación en principio, antes de que se conceda la visa.",
    "Tertiary, English-language or other non-compulsory study of 1 year or more generally requires about NZD 20,000 per year for living costs (or about NZD 1,667 per month if your study is shorter than 1 year). Wayfare does not assess financial evidence.": "Los estudios terciarios, de inglés u otros estudios no obligatorios de 1 año o más generalmente requieren unos NZD 20.000 al año para gastos de manutención (o unos NZD 1.667 al mes si tu estudio dura menos de 1 año). Wayfare no evalúa la evidencia financiera.",
    "School students in years 1–13 generally need about NZD 17,000 per year for living costs (or about NZD 1,417 per month if the study is shorter than 1 year).": "Los estudiantes escolares de los años 1 a 13 generalmente necesitan unos NZD 17.000 al año para gastos de manutención (o unos NZD 1.417 al mes si el estudio dura menos de 1 año).",
    "You must have a paid onward travel ticket, or enough money to buy one, in addition to your living costs.": "Debes tener un billete de salida pagado, o dinero suficiente para comprarlo, además de tus gastos de manutención.",
    "You must meet health requirements, and may need a medical examination or chest X-ray.": "Debes cumplir los requisitos de salud, y puede que necesites un examen médico o una radiografía de tórax.",
    "You must meet character requirements, and may need to provide police certificates.": "Debes cumplir los requisitos de buen carácter, y puede que necesites aportar certificados policiales.",
    "You must genuinely intend to study, and be a bona fide applicant who intends to leave New Zealand at the end of your visa.": "Debes tener la intención genuina de estudiar y ser un solicitante de buena fe que pretende salir de Nueva Zelanda al final de tu visa.",
    "You must hold travel and health insurance from the start of your course until your visa expires.": "Debes contar con seguro médico y de viaje desde el inicio de tu curso hasta que caduque tu visa.",
    "A Fee Paying Student Visa can be granted for up to 4 years, depending on your course.": "Una Fee Paying Student Visa puede concederse por hasta 4 años, según tu curso.",

    /* ── Visa de visitante de Nueva Zelanda ── */
    "Visitor Visa": "Visa de visitante",
    "Some travellers can come to New Zealand on an NZeTA (Electronic Travel Authority) instead of a visitor visa; which one you need depends on your passport.": "Algunos viajeros pueden venir a Nueva Zelanda con una NZeTA (Autoridad Electrónica de Viaje) en lugar de una visa de visitante; cuál necesitas depende de tu pasaporte.",
    "Your profile indicates remote work. Check the work conditions below for New Zealand Visitor Visa limits.": "Tu perfil indica trabajo remoto. Revisa las condiciones de trabajo más abajo para los límites de la Visitor Visa de Nueva Zelanda.",
    "A Visitor Visa is usually granted for up to either 6 months or 9 months (a single-entry visa can allow up to 9 months in an 18-month period).": "Una visa de visitante suele concederse por hasta 6 o 9 meses (una visa de entrada única puede permitir hasta 9 meses en un período de 18 meses).",
    "You cannot work for a New Zealand employer or provide services in the New Zealand labour market on this visa. Remote work for an overseas employer, business, or client may be possible.": "No puedes trabajar para un empleador de Nueva Zelanda ni prestar servicios en el mercado laboral neozelandés con esta visa. El trabajo remoto para un empleador, negocio o cliente extranjero puede ser posible.",
    "You can study for up to 3 months on a visitor visa.": "Puedes estudiar hasta 3 meses con una visa de visitante.",
    "You must be a genuine visitor who intends to leave New Zealand at the end of your visit.": "Debes ser un visitante genuino que tiene la intención de salir de Nueva Zelanda al final de su visita.",
    "You must have enough money for your stay — generally at least NZD 1,000 a month, or NZD 400 a month if your accommodation is already paid for. Wayfare does not assess financial evidence.": "Debes tener dinero suficiente para tu estancia: generalmente al menos NZD 1.000 al mes, o NZD 400 al mes si tu alojamiento ya está pagado. Wayfare no evalúa la evidencia financiera.",
    "You must have a ticket for travel out of New Zealand, or enough money to buy one, in addition to your living costs.": "Debes tener un billete para salir de Nueva Zelanda, o dinero suficiente para comprarlo, además de tus gastos de manutención.",
    "You must be in good health. A chest X-ray may be required for stays over 6 months from higher-tuberculosis-risk countries.": "Debes tener buena salud. Puede requerirse una radiografía de tórax para estancias de más de 6 meses desde países con mayor riesgo de tuberculosis.",
    "You must be of good character, and may need to provide police certificates.": "Debes ser de buen carácter, y puede que necesites aportar certificados policiales.",
    "Your passport must be valid for at least 3 months after the date you plan to leave New Zealand.": "Tu pasaporte debe ser válido durante al menos 3 meses después de la fecha en que planeas salir de Nueva Zelanda.",
    "You can include your partner and any dependent children aged 19 or younger in your application, or they can apply for their own visas.": "Puedes incluir a tu pareja y a cualquier hijo/a dependiente de 19 años o menos en tu solicitud, o ellos pueden solicitar sus propias visas.",
    "Work rights are informational only: you may be able to work part-time up to 25 hours per week during your studies, and full-time during scheduled holidays, if your visa conditions allow.": "Los derechos de trabajo son solo informativos: es posible que puedas trabajar a tiempo parcial hasta 25 horas por semana durante tus estudios, y a tiempo completo durante las vacaciones programadas, si las condiciones de tu visa lo permiten.",
    "English is not a fixed visa requirement, but your English level and any test results can help show your genuine intention to study.": "El inglés no es un requisito fijo de la visa, pero tu nivel de inglés y cualquier resultado de examen pueden ayudar a demostrar tu intención genuina de estudiar.",
    "Students under 10 years old generally need a parent or legal guardian living with them in New Zealand, unless you are living in an NZQA-approved hostel.": "Los estudiantes menores de 10 años generalmente necesitan que un padre/madre o tutor legal viva con ellos en Nueva Zelanda, salvo que residan en un internado aprobado por la NZQA.",
    "You must have an offer of place in an approved course of study from an approved education provider.": "Debes tener una oferta de plaza en un curso de estudios aprobado de un proveedor educativo aprobado.",
    "You must have enough money to pay your tuition fees or hold a scholarship, and show you have paid the tuition fees for 1 course or 1 year of study, whichever is shorter.": "Debes disponer de fondos suficientes para pagar la matrícula o tener una beca, y demostrar que has pagado la matrícula de 1 curso o 1 año de estudio, lo que sea más corto.",
    "You may need to show bank statements covering the last 3 months. Large deposits may need a source explanation.": "Es posible que debas mostrar extractos bancarios de los últimos 3 meses. Los depósitos grandes pueden requerir una explicación de su origen.",
    "You must be in good health. A chest X-ray or medical exam may be required depending on your stay length and tuberculosis-risk country rules.": "Debes tener buena salud. Puede que se requiera una radiografía de tórax o un examen médico según la duración de tu estancia y las reglas de países con riesgo de tuberculosis.",
    "You must be of good character. Police certificates may be required if you are 17 or older and your total time in New Zealand will be 24 months or longer.": "Debes ser de buen carácter. Pueden requerirse certificados policiales si tienes 17 años o más y tu tiempo total en Nueva Zelanda será de 24 meses o más.",
    "You must have travel and health insurance acceptable to your education provider, from the start of your course until your visa expires.": "Debes contar con un seguro médico y de viaje aceptable para tu proveedor educativo, desde el inicio de tu curso hasta que caduque tu visa.",
    "This visa has a limited annual quota of about 2,000 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 2.000 plazas, que puede agotarse.",
    "This visa has a limited annual quota of about 200 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 200 plazas, que puede agotarse.",
    "This visa has a limited annual quota of about 50 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 50 plazas, que puede agotarse.",
    "You must normally live in the USA.": "Debes residir habitualmente en Estados Unidos.",
    "You must hold a valid physical passport when you apply; without one your application may be declined.": "Debes tener un pasaporte físico válido al solicitar la visa; sin él, tu solicitud puede ser rechazada.",

    /* ── Cadenas legadas (CA/ES/PT/AU/NZ genéricas) traducidas en v1.6.0 ──
       Estas existían solo en inglés desde el prototipo; misma semántica,
       tono conservador ("parece", "solo orientación simulada"). */
    "A letter of acceptance from a Designated Learning Institution (DLI) is required. Simulated guidance only.": "Se requiere una carta de aceptación de una institución de aprendizaje designada (DLI). Solo orientación simulada.",
    "A letter of acceptance from a Designated Learning Institution (DLI) is required.": "Se requiere una carta de aceptación de una institución de aprendizaje designada (DLI).",
    "A visitor visa is likely required. Approval rates and documentation requirements vary by nationality.": "Probablemente se requiera una visa de visitante. Las tasas de aprobación y la documentación exigida varían según la nacionalidad.",
    "Additional financial and country-of-origin documentation may be required.": "Puede requerirse documentación adicional financiera y del país de origen.",
    "An Accredited Employer Work Visa typically requires a job offer from a NZ employer. Simulated guidance only.": "La Accredited Employer Work Visa normalmente requiere una oferta de trabajo de un empleador neozelandés. Solo orientación simulada.",
    "An eTA may be required before travelling by air. Check the IRCC website to confirm.": "Puede requerirse una eTA (autorización electrónica de viaje) antes de viajar en avión. Confírmalo en la web de IRCC.",
    "As an EU/EEA citizen, you may live and work in Spain under freedom of movement without a Digital Nomad Visa.": "Como ciudadano de la UE/EEE, puedes vivir y trabajar en España por libre circulación, sin necesidad de la visa de nómada digital.",
    "Canada does not currently offer a dedicated Digital Nomad visa. Remote work on a visitor permit is legally uncertain.": "Canadá no ofrece actualmente una visa específica de nómada digital. Trabajar en remoto con permiso de visitante es legalmente incierto.",
    "Check IRCC for the current list of IEC partner countries.": "Consulta en IRCC la lista actual de países socios del IEC.",
    "EU freedom of movement applies. No Digital Nomad Visa needed for EU/EEA citizens.": "Aplica la libre circulación de la UE. Los ciudadanos UE/EEE no necesitan visa de nómada digital.",
    "EU freedom of movement rules apply. No Digital Nomad Visa is required.": "Aplican las reglas de libre circulación de la UE. No se requiere visa de nómada digital.",
    "EU/EEA citizens face minimal visa barriers for studying in Spain.": "Los ciudadanos UE/EEE tienen barreras de visado mínimas para estudiar en España.",
    "EU/EEA citizens may live and work in Portugal under freedom of movement. The D8 visa is not required.": "Los ciudadanos UE/EEE pueden vivir y trabajar en Portugal por libre circulación. La visa D8 no es necesaria.",
    "EU/EEA citizens may work freely in Portugal under freedom of movement.": "Los ciudadanos UE/EEE pueden trabajar libremente en Portugal por libre circulación.",
    "EU/EEA citizens may work freely in Spain under freedom of movement — no work permit required.": "Los ciudadanos UE/EEE pueden trabajar libremente en España por libre circulación — sin necesidad de permiso de trabajo.",
    "Employer sponsorship requirements may be more complex for your passport nationality.": "Los requisitos de patrocinio del empleador pueden ser más complejos para tu nacionalidad de pasaporte.",
    "Enrollment acceptance from an accredited Spanish institution is required. Simulated guidance only.": "Se requiere la aceptación de matrícula de una institución española acreditada. Solo orientación simulada.",
    "Enrollment acceptance from an accredited Spanish institution is required.": "Se requiere la aceptación de matrícula de una institución española acreditada.",
    "IEC places are allocated through random invitation draws (pools). Receiving an invitation is not guaranteed. Simulated guidance only.": "Las plazas del IEC se asignan mediante sorteos aleatorios de invitación (pools). Recibir una invitación no está garantizado. Solo orientación simulada.",
    "IEC places are allocated through random invitation draws (pools). Receiving an invitation is not guaranteed.": "Las plazas del IEC se asignan mediante sorteos aleatorios de invitación (pools). Recibir una invitación no está garantizado.",
    "LMIA sponsorship and assessment may be more complex for your passport nationality.": "El patrocinio y la evaluación LMIA pueden ser más complejos para tu nacionalidad de pasaporte.",
    "Most Australian work visas require a job offer or employer sponsorship. This is simulated guidance only.": "La mayoría de las visas de trabajo australianas requieren una oferta de empleo o el patrocinio de un empleador. Esto es solo orientación simulada.",
    "Most Canadian work permits require a job offer or an Express Entry invitation. Simulated guidance only.": "La mayoría de los permisos de trabajo canadienses requieren una oferta de empleo o una invitación de Express Entry. Solo orientación simulada.",
    "New Zealand does not currently offer a dedicated Digital Nomad visa.": "Nueva Zelanda no ofrece actualmente una visa específica de nómada digital.",
    "Non-EU work permits in Spain typically require employer sponsorship. Simulated guidance only.": "Los permisos de trabajo en España para no comunitarios normalmente requieren el patrocinio de un empleador. Solo orientación simulada.",
    "Non-EU work permits in Spain typically require employer sponsorship.": "Los permisos de trabajo en España para no comunitarios normalmente requieren el patrocinio de un empleador.",
    "Non-EU work permits typically require employer sponsorship. Simulated guidance only.": "Los permisos de trabajo para no comunitarios normalmente requieren el patrocinio de un empleador. Solo orientación simulada.",
    "Non-EU work permits typically require employer sponsorship.": "Los permisos de trabajo para no comunitarios normalmente requieren el patrocinio de un empleador.",
    "Portugal's Working Holiday programme appears limited to a specific set of nationalities.": "El programa Working Holiday de Portugal parece limitado a un conjunto específico de nacionalidades.",
    "Spain does not currently operate a Working Holiday visa programme. This route is not available.": "España no opera actualmente un programa de visas Working Holiday. Esta ruta no está disponible.",
    "The 90/180-day Schengen rule applies. This is simulated guidance only.": "Aplica la regla Schengen de 90/180 días. Esto es solo orientación simulada.",
    "The 90/180-day Schengen rule applies.": "Aplica la regla Schengen de 90/180 días.",
    "Proof of remote work contract or freelance client invoices is required.": "Se exige prueba del contrato de trabajo remoto o facturas de clientes autónomos.",
    "Proof of regular remote income may strengthen a Schengen visa application.": "Acreditar ingresos remotos regulares puede reforzar una solicitud de visado Schengen.",
    "Proof of remote employment or freelance clients is required. This is simulated guidance based on approximate thresholds.": "Se exige prueba de empleo remoto o de clientes autónomos. Esto es orientación simulada basada en umbrales aproximados.",
    "Your passport nationality is generally accepted for this route.": "La nacionalidad de tu pasaporte suele aceptarse para esta vía.",
    "Most working holiday agreements stop at 30; only a few extend to 35, and only for some nationalities.": "La mayoría de los acuerdos de working holiday llegan hasta los 30; solo unos pocos amplían a 35, y solo para algunas nacionalidades.",
    "Your age is within the range these programmes usually accept (18 to 30).": "Tu edad está dentro del rango que estos programas suelen aceptar (18 a 30).",
    "Most work visas require a job offer or an employer willing to sponsor you.": "La mayoría de las visas de trabajo exigen una oferta de empleo o un empleador dispuesto a patrocinarte.",
    "This is your country of citizenship: you do not need a visa to enter, live, study or work here.": "Es el país del que eres nacional: no necesitas visado para entrar, vivir, estudiar ni trabajar aquí.",
    "Your passport nationality is generally accepted for this visa route.": "La nacionalidad de tu pasaporte suele aceptarse para esta vía de visado.",
    "Your profile indicates remote work, which appears to satisfy the primary D8 condition.": "Tu perfil indica trabajo remoto, que parece cumplir la condición principal de la D8.",
    "Your profile indicates remote work, which appears to satisfy the primary condition.": "Tu perfil indica trabajo remoto, que parece cumplir la condición principal.",
    "Your profile indicates remote work, which is the main condition for this route.": "Tu perfil indica trabajo remoto, que es la condición principal de esta vía.",
    "A work permit is required. Approval depends heavily on employer sponsorship and labour market conditions.": "Se exige un permiso de trabajo. La aprobación depende en gran medida del patrocinio del empleador y de la situación del mercado laboral.",
    "Income requirements should be verified against official digital nomad visa requirements for this destination.": "Los requisitos de ingresos deben comprobarse con los requisitos oficiales del visado de nómada digital de este destino.",
    "Proof of regular remote income may support the visa application.": "Acreditar ingresos remotos regulares puede respaldar la solicitud de visado.",
    "Your profile indicates remote work, which is the primary factor for this route.": "Tu perfil indica trabajo remoto, que es el factor principal de esta vía.",
    "This is simulated guidance only. Verify with IRCC (Immigration, Refugees and Citizenship Canada).": "Esto es solo orientación simulada. Verifica con IRCC (Inmigración, Refugiados y Ciudadanía de Canadá).",
    "Verify with IRCC (Immigration, Refugees and Citizenship Canada).": "Verifica con IRCC (Inmigración, Refugiados y Ciudadanía de Canadá).",
    "You may need to show around CAD 2,500 for your initial stay. Check IRCC for current financial requirements.": "Puede que necesites demostrar alrededor de CAD 2.500 para tu estancia inicial. Consulta en IRCC los requisitos financieros vigentes.",
    "You may need to show sufficient funds for relocation. Check IRCC for current requirements.": "Puede que necesites demostrar fondos suficientes para instalarte. Consulta en IRCC los requisitos vigentes.",
    "You may need to show sufficient funds for relocation. Check Immigration New Zealand for current requirements.": "Puede que necesites demostrar fondos suficientes para instalarte. Consulta en Immigration New Zealand los requisitos vigentes.",
    "You may need to show sufficient funds for relocation. Check official Australian skilled visa requirements.": "Puede que necesites demostrar fondos suficientes para instalarte. Consulta los requisitos oficiales de las visas cualificadas australianas.",
    "You may need to show sufficient funds for tuition and living costs. Check IRCC for current requirements.": "Puede que necesites demostrar fondos suficientes para matrícula y manutención. Consulta en IRCC los requisitos vigentes.",
    "You may need to show sufficient funds for tuition and living costs. Check official Spanish student visa requirements.": "Puede que necesites demostrar fondos suficientes para matrícula y manutención. Consulta los requisitos oficiales de la visa de estudiante española.",
    "You may need to show sufficient funds for your stay. Check IRCC for current financial requirements.": "Puede que necesites demostrar fondos suficientes para tu estancia. Consulta en IRCC los requisitos financieros vigentes.",
    "You may need to show sufficient funds for your stay. Check official Schengen visa requirements.": "Puede que necesites demostrar fondos suficientes para tu estancia. Consulta los requisitos oficiales de la visa Schengen.",
    "You may need to show sufficient funds. Check official Portuguese work visa requirements.": "Puede que necesites demostrar fondos suficientes. Consulta los requisitos oficiales de las visas de trabajo portuguesas.",
    "You may need to show sufficient funds. Check official Spanish work visa requirements.": "Puede que necesites demostrar fondos suficientes. Consulta los requisitos oficiales de las visas de trabajo españolas.",
    "Your English level appears to meet general requirements.": "Tu nivel de inglés parece cumplir los requisitos generales.",
    "Your English level appears to meet the advanced threshold.": "Tu nivel de inglés parece alcanzar el umbral avanzado.",
    "Your English level appears to meet the threshold.": "Tu nivel de inglés parece alcanzar el umbral requerido.",
    "Your age appears to fall within the typical eligible range.": "Tu edad parece estar dentro del rango elegible típico.",
    "Your education level appears to meet Express Entry / skilled worker requirements.": "Tu nivel educativo parece cumplir los requisitos de Express Entry / trabajador cualificado.",
    "Your education level appears to meet general requirements.": "Tu nivel educativo parece cumplir los requisitos generales.",
    "Your education level appears to meet skilled worker requirements.": "Tu nivel educativo parece cumplir los requisitos de trabajador cualificado.",
    "Your education level appears to meet typical requirements.": "Tu nivel educativo parece cumplir los requisitos típicos.",
    "Your education level appears to meet typical skilled worker requirements.": "Tu nivel educativo parece cumplir los requisitos típicos de trabajador cualificado.",
    "Your passport appears to allow visa-free access to the Schengen Area for short stays (up to 90 days in any 180-day period).": "Tu pasaporte parece permitir el acceso sin visa al espacio Schengen para estancias cortas (hasta 90 días en cualquier período de 180).",
    "Your passport nationality appears generally accepted for Canadian work permit pathways.": "Tu nacionalidad de pasaporte parece generalmente aceptada para las vías de permiso de trabajo canadienses.",
    "Your passport nationality appears generally accepted for New Zealand work pathways.": "Tu nacionalidad de pasaporte parece generalmente aceptada para las vías de trabajo neozelandesas.",
    "Your passport nationality appears listed under International Experience Canada (IEC) Working Holiday.": "Tu nacionalidad de pasaporte parece estar listada en International Experience Canada (IEC) Working Holiday.",
    "Your passport nationality does not appear in the simulated International Experience Canada (IEC) eligible list.": "Tu nacionalidad de pasaporte no aparece en la lista elegible simulada de International Experience Canada (IEC).",
    "Your passport nationality is generally accepted for Australian skilled work visa pathways.": "Tu nacionalidad de pasaporte es generalmente aceptada para las vías de visas de trabajo cualificado australianas.",
    "Your passport nationality is generally accepted for Canadian study permit applications.": "Tu nacionalidad de pasaporte es generalmente aceptada para las solicitudes de permiso de estudios canadiense.",
    "Your passport nationality may be eligible for visa-free entry or an eTA (Electronic Travel Authorization) for Canada.": "Tu nacionalidad de pasaporte puede ser elegible para entrada sin visa o una eTA (autorización electrónica de viaje) para Canadá.",

    /* ── Portugal v1.14.0: youth mobility oficial + student propio + D8 actualizado ── */
    "Portugal's youth mobility programme is limited to: Argentina, Australia, Canada, Chile, Japan, New Zealand, Peru, South Korea and the USA.": "El programa de movilidad juvenil de Portugal está limitado a: Argentina, Australia, Canadá, Chile, Japón, Nueva Zelanda, Perú, Corea del Sur y EE.UU.",
    "Your passport nationality has a youth mobility memorandum with Portugal.": "Tu nacionalidad de pasaporte tiene un memorando de movilidad juvenil con Portugal.",
    "The USA arrangement is a 12-month pilot programme focused on training at innovative organizations; specific conditions apply.": "El acuerdo con EE.UU. es un programa piloto de 12 meses centrado en formación en organizaciones innovadoras; aplican condiciones específicas.",
    "Your age appears to be within the eligible range for this visa (18 to 31).": "Tu edad parece estar dentro del rango elegible para esta visa (18 a 31).",
    "Your age appears to be within the eligible range for this visa (18 to 34).": "Tu edad parece estar dentro del rango elegible para esta visa (18 a 34).",
    "This visa has a limited annual quota of about 500 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 500 plazas, que puede agotarse.",
    "This visa has a limited annual quota of about 600 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 600 plazas, que puede agotarse.",
    "This visa has a limited annual quota of about 400 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 400 plazas, que puede agotarse.",
    "Stays are limited to 12 months, with no possibility of extension.": "Las estancias están limitadas a 12 meses, sin posibilidad de extensión.",
    "Work or study must remain secondary to the holiday purpose of the stay.": "El trabajo o el estudio deben ser secundarios al propósito vacacional de la estancia.",
    "Peru's memorandum requires a university degree or at least 2 completed years of university studies.": "El memorando con Perú exige un título universitario o al menos 2 años completados de estudios universitarios.",
    "EU/EEA citizens face minimal visa barriers for studying in Portugal.": "Los ciudadanos UE/EEE tienen barreras de visado mínimas para estudiar en Portugal.",
    "Your passport nationality is generally accepted for Portuguese student visa applications.": "Tu nacionalidad de pasaporte es generalmente aceptada para solicitudes de visa de estudiante portuguesa.",
    "You may need to show sufficient funds for tuition and living costs. Check official Portuguese student visa requirements.": "Puede que necesites demostrar fondos suficientes para matrícula y manutención. Consulta los requisitos oficiales de la visa de estudiante portuguesa.",
    "Enrollment acceptance from an accredited Portuguese institution is required. Simulated guidance only.": "Se requiere la aceptación de matrícula de una institución portuguesa acreditada. Solo orientación simulada.",
    "Enrollment acceptance from an accredited Portuguese institution is required.": "Se requiere la aceptación de matrícula de una institución portuguesa acreditada.",
    "The Portugal D8 visa typically requires proof of income of approximately 4× the Portuguese minimum wage (about EUR 3,680/month with the 2026 minimum wage of EUR 920). Check the official threshold before applying.": "El visado D8 de Portugal normalmente requiere demostrar ingresos de aproximadamente 4× el salario mínimo portugués (unos 3.680 EUR/mes con el salario mínimo de 920 EUR de 2026). Verifica el umbral oficial antes de aplicar.",

    /* ── Cadenas PT preexistentes destapadas por la matriz ampliada (v1.14.0) ── */
    "A Schengen visa is likely required. Processing times and approval rates vary by nationality.": "Probablemente se requiera una visa Schengen. Los tiempos de tramitación y las tasas de aprobación varían según la nacionalidad.",
    "A work visa is required. Conditions vary significantly by nationality.": "Se requiere una visa de trabajo. Las condiciones varían significativamente según la nacionalidad.",
    "A work visa with employer sponsorship is required for non-EU nationals.": "Los no comunitarios necesitan una visa de trabajo con patrocinio de un empleador.",
    "Additional documentation requirements may apply for your passport nationality.": "Pueden aplicar requisitos de documentación adicionales para tu nacionalidad de pasaporte.",
    "CPLP nationals (Portuguese-speaking community) may benefit from simplified work access to Portugal.": "Los nacionales de la CPLP (comunidad de países de lengua portuguesa) pueden beneficiarse de un acceso laboral simplificado a Portugal.",
    "Specific conditions apply. Verify with AIMA (Portuguese immigration authority).": "Aplican condiciones específicas. Verifica con AIMA (la autoridad migratoria portuguesa).",
    "The Portugal D8 Digital Nomad Visa requires active remote work or freelancing.": "El visado D8 de nómada digital de Portugal requiere trabajo remoto activo o actividad freelance.",
    "Verify current conditions with the Portuguese consulate in your country. Simulated guidance only.": "Verifica las condiciones vigentes con el consulado portugués de tu país. Solo orientación simulada.",
    "Verify current conditions with the Portuguese consulate in your country.": "Verifica las condiciones vigentes con el consulado portugués de tu país.",
    "You may need to show sufficient financial means. Check official Portuguese immigration sources for current requirements.": "Puede que necesites demostrar medios económicos suficientes. Consulta las fuentes oficiales de inmigración portuguesa.",
    "You may need to show sufficient funds for your stay. Check with the Portuguese consulate for current financial requirements.": "Puede que necesites demostrar fondos suficientes para tu estancia. Consulta con el consulado portugués los requisitos financieros vigentes.",

    /* ── España v1.15.0: DNV con cifras oficiales (UGE + BOE SMI 2026) ── */
    "The Spain Digital Nomad Visa requires income of 200% of the Spanish minimum wage (about EUR 2,450/month with the 2026 SMI of EUR 1,221). Check the official threshold before applying.": "El visado de nómada digital de España exige ingresos del 200% del salario mínimo (unos 2.450 EUR/mes con el SMI 2026 de 1.221 EUR). Verifica el umbral oficial antes de aplicar.",
    "You must show a working relationship of at least 3 months with your foreign employer or clients, and a degree or 3 years of professional experience.": "Debes acreditar una relación laboral o profesional de al menos 3 meses con tu empleador o clientes extranjeros, y una titulación o 3 años de experiencia profesional.",
    "The Spain Digital Nomad Visa (Ley de Startups) requires active remote employment or freelancing for a non-Spanish entity.": "El visado de nómada digital de España (Ley de Startups) requiere empleo remoto activo o actividad freelance para una entidad no española.",
    "Spain's working holiday agreements cover Japan, Australia, Canada, New Zealand, South Korea and Argentina (official list of the Ministry of Inclusion, with BOE references). Verify current conditions with the Spanish consulate in your country.": "Los acuerdos de working holiday de España cubren Japón, Australia, Canadá, Nueva Zelanda, Corea del Sur y Argentina (lista oficial del Ministerio de Inclusión, con referencias BOE). Verifica las condiciones vigentes con el consulado español de tu país.",
    "Your passport nationality appears to have a working holiday agreement with Spain.": "Tu nacionalidad de pasaporte parece tener un acuerdo de working holiday con España.",
    "You must have sufficient funds for your maintenance during the stay.": "Debes contar con fondos suficientes para tu manutención durante la estancia.",
    "The main purpose of the stay must be holiday; work is complementary. Stays are limited to 12 months.": "El propósito principal de la estancia debe ser vacacional; el trabajo es complementario. Las estancias están limitadas a 12 meses.",
    "Programme details are country-specific and the agreement list can change - verify current conditions with the Spanish consulate in your country.": "Los detalles del programa varían por país y la lista de acuerdos puede cambiar - verifica las condiciones vigentes con el consulado español de tu país.",
    "A work permit with employer sponsorship (cuenta ajena) is typically required for non-EU nationals.": "Los no comunitarios normalmente necesitan un permiso de trabajo con patrocinio de empleador (cuenta ajena).",
    "You may need to show sufficient financial means. Check official Spanish immigration sources for current requirements.": "Puede que necesites demostrar medios económicos suficientes. Consulta las fuentes oficiales de inmigración española.",
    "Your passport nationality is generally accepted for Spanish student visa applications.": "Tu nacionalidad de pasaporte es generalmente aceptada para solicitudes de visa de estudiante española.",

    /* ── Japón Wave 2 (v1.16.0) ── */
    "Your passport nationality appears to be visa-exempt for short-term stays in Japan (up to 90 days).": "Tu nacionalidad de pasaporte parece estar exenta de visado para estancias cortas en Japón (hasta 90 días).",
    "The visa exemption applies only to holders of an ICAO-compliant ePassport; without one you must obtain a visa in advance.": "La exención solo aplica a titulares de pasaporte electrónico (norma ICAO); sin él debes obtener visado por adelantado.",
    "A short-term visa is likely required for your nationality. Check the Japanese embassy or consulate in your country.": "Probablemente necesites un visado de corta estancia para tu nacionalidad. Consulta la embajada o consulado de Japón en tu país.",
    "You cannot work during a short-term stay; paid activities are not allowed.": "No se puede trabajar durante una estancia corta; las actividades remuneradas no están permitidas.",
    "For Hong Kong, the exemption covers holders of a Hong Kong SAR passport, or a British National (Overseas) passport with right of residence in Hong Kong.": "Para Hong Kong, la exención cubre a quienes tienen pasaporte de la RAE de Hong Kong, o pasaporte British National (Overseas) con derecho de residencia en Hong Kong.",
    "For Taiwan, the visa exemption is limited to passport holders with a personal ID number.": "Para Taiwán, la exención de visado se limita a los pasaportes que llevan número de identidad personal.",
    "Uruguayan ordinary passports issued after 16 April 2025 without 'place of birth' on the data page are not recognised by Japan: the exemption applies only to the older version of the passport.": "Japón no reconoce los pasaportes uruguayos ordinarios emitidos después del 16 de abril de 2025 que no llevan «lugar de nacimiento» en la página de datos: la exención solo se aplica a la versión anterior del pasaporte.",
    "Your nationality has a bilateral arrangement allowing stays of up to 6 months; to stay beyond 90 days you must request an extension from the Ministry of Justice before your permitted stay expires.": "Tu nacionalidad tiene un acuerdo bilateral que permite estancias de hasta 6 meses; para pasar de 90 días debes pedir una prórroga al Ministerio de Justicia antes de que expire tu estancia autorizada.",
    "You may need to show sufficient funds for your stay and onward travel.": "Puede que necesites demostrar fondos suficientes para tu estancia y el viaje de salida.",
    "Always verify with the Ministry of Foreign Affairs of Japan.": "Verifica siempre con el Ministerio de Asuntos Exteriores de Japón.",
    "Japan's working holiday programmes cover 32 partner countries/regions; your nationality does not appear to be among them.": "Los programas working holiday de Japón cubren 32 países/regiones socios; tu nacionalidad no parece estar entre ellos.",
    "Your passport nationality has a working holiday programme with Japan.": "Tu nacionalidad de pasaporte tiene un programa working holiday con Japón.",
    "You must be residing in your country of nationality when you apply.": "Debes residir en tu país de nacionalidad al solicitar.",
    "You must intend primarily to spend a holiday in Japan; work must be incidental.": "Tu propósito principal debe ser vacacionar en Japón; el trabajo debe ser secundario.",
    "You cannot be accompanied by dependents or children.": "No puedes venir acompañado de dependientes o hijos.",
    "You must have a return ticket (or funds to buy one) and reasonable funds for your initial stay.": "Debes tener pasaje de vuelta (o fondos para comprarlo) y fondos razonables para tu estancia inicial.",
    "You must never have held a Japanese working holiday visa before.": "No debes haber tenido nunca una visa working holiday japonesa.",
    "Verify current conditions with the Japanese embassy or consulate in your country. Simulated guidance only.": "Verifica las condiciones vigentes con la embajada o consulado de Japón en tu país. Solo orientación simulada.",
    "Verify current conditions with the Japanese embassy or consulate in your country.": "Verifica las condiciones vigentes con la embajada o consulado de Japón en tu país.",
    "This visa has a limited annual quota of about 6,283 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 6.283 plazas, que puede agotarse.",
    "This visa has a limited annual quota of about 10,000 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 10.000 plazas, que puede agotarse.",
    "This visa has a limited annual quota of about 1,800 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 1.800 plazas, que puede agotarse.",
    "This visa has a limited annual quota of about 6,000 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 6.000 plazas, que puede agotarse.",
    "This visa has a limited annual quota of about 800 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 800 plazas, que puede agotarse.",
    "This visa has a limited annual quota of about 700 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 700 plazas, que puede agotarse.",
    "This visa has a limited annual quota of about 30 places, which can run out.": "Esta visa tiene un cupo anual limitado de aproximadamente 30 plazas, que puede agotarse.",
    "Your passport nationality is generally accepted for Japanese student visa applications.": "Tu nacionalidad de pasaporte es generalmente aceptada para solicitudes de visa de estudiante japonesa.",
    "You may need to show sufficient funds for tuition and living costs. Check official Japanese student visa requirements.": "Puede que necesites demostrar fondos suficientes para matrícula y manutención. Consulta los requisitos oficiales de la visa de estudiante japonesa.",
    "A Certificate of Eligibility (COE) sponsored by the receiving institution is required before the visa. Simulated guidance only.": "Se requiere un Certificate of Eligibility (COE) patrocinado por la institución receptora antes del visado. Solo orientación simulada.",
    "A Certificate of Eligibility (COE) sponsored by the receiving institution is required before the visa.": "Se requiere un Certificate of Eligibility (COE) patrocinado por la institución receptora antes del visado.",
    "Work visa processes may be more complex for your passport nationality.": "Los procesos de visa de trabajo pueden ser más complejos para tu nacionalidad de pasaporte.",
    "Japanese work visas require employer sponsorship and a Certificate of Eligibility (COE). Simulated guidance only.": "Las visas de trabajo japonesas requieren patrocinio de empleador y un Certificate of Eligibility (COE). Solo orientación simulada.",
    "You may need to show sufficient funds. Check official Japanese work visa requirements.": "Puede que necesites demostrar fondos suficientes. Consulta los requisitos oficiales de la visa de trabajo japonesa.",
    "Japan's digital nomad status requires active remote work for a foreign employer or clients.": "El estatus de nómada digital de Japón requiere trabajo remoto activo para un empleador o clientes extranjeros.",
    "Japan introduced a digital nomad status (designated activities) with strict conditions, a short stay (about 6 months) and a high income threshold - check the Immigration Services Agency of Japan for current requirements.": "Japón introdujo un estatus de nómada digital (actividades designadas) con condiciones estrictas, estancia corta (unos 6 meses) y un umbral de ingresos alto - consulta la Agencia de Servicios de Inmigración de Japón.",
    "This route could not be verified against a captured official source yet. Treat as preliminary guidance.": "Esta ruta aún no se ha podido verificar contra una fuente oficial capturada. Tómala como orientación preliminar.",

    /* ── EE.UU. Wave 2 (v1.17.0) ── */
    "Your passport nationality appears to be in the Visa Waiver Program: stays of 90 days or less without a visa.": "Tu nacionalidad de pasaporte parece estar en el Visa Waiver Program: estancias de 90 días o menos sin visado.",
    "You must obtain an approved ESTA (Electronic System for Travel Authorization) before travelling.": "Debes obtener una ESTA aprobada (autorización electrónica de viaje) antes de viajar.",
    "A B-1/B-2 visitor visa is likely required, including a consular interview. Approval rates vary by nationality and profile.": "Probablemente necesites una visa de visitante B-1/B-2, con entrevista consular. Las tasas de aprobación varían según nacionalidad y perfil.",
    "You cannot work during a visitor stay; paid activities are not allowed.": "No se puede trabajar durante una estancia de visitante; las actividades remuneradas no están permitidas.",
    "You may need to show sufficient funds and strong ties to your home country.": "Puede que necesites demostrar fondos suficientes y vínculos sólidos con tu país de origen.",
    "This is simulated guidance only. Always verify with travel.state.gov.": "Esto es solo orientación simulada. Verifica siempre en travel.state.gov.",
    "Always verify with travel.state.gov.": "Verifica siempre en travel.state.gov.",
    "The USA does not operate a working holiday programme. The closest alternative is the J-1 Exchange Visitor Program (e.g., Summer Work Travel for university students), which requires a designated sponsor.": "EE.UU. no opera un programa working holiday. La alternativa más cercana es el J-1 Exchange Visitor (p. ej. Summer Work Travel para universitarios), que requiere un patrocinador designado.",
    "Your passport nationality is generally accepted for US student visa applications.": "Tu nacionalidad de pasaporte es generalmente aceptada para solicitudes de visa de estudiante estadounidense.",
    "You need a Form I-20 issued by a SEVP-approved school, the SEVIS fee, and a consular interview. Simulated guidance only.": "Necesitas un formulario I-20 emitido por una escuela aprobada por SEVP, la tasa SEVIS y una entrevista consular. Solo orientación simulada.",
    "You need a Form I-20 issued by a SEVP-approved school, the SEVIS fee, and a consular interview.": "Necesitas un formulario I-20 emitido por una escuela aprobada por SEVP, la tasa SEVIS y una entrevista consular.",
    "You may need to show sufficient funds for tuition and living costs. Check official US student visa requirements.": "Puede que necesites demostrar fondos suficientes para matrícula y manutención. Consulta los requisitos oficiales de la visa de estudiante de EE.UU.",
    "Most US work visas (e.g., H-1B) require employer sponsorship and are subject to caps or lotteries. Simulated guidance only.": "La mayoría de las visas de trabajo de EE.UU. (p. ej. H-1B) requieren patrocinio de empleador y están sujetas a cupos o loterías. Solo orientación simulada.",
    "Most US work visas (e.g., H-1B) require employer sponsorship and are subject to caps or lotteries.": "La mayoría de las visas de trabajo de EE.UU. (p. ej. H-1B) requieren patrocinio de empleador y están sujetas a cupos o loterías.",
    "You may need to show sufficient funds. Check official US work visa requirements.": "Puede que necesites demostrar fondos suficientes. Consulta los requisitos oficiales de la visa de trabajo de EE.UU.",
    "The USA does not offer a digital nomad visa; working remotely while on a visitor status is restricted.": "EE.UU. no ofrece visa de nómada digital; trabajar en remoto con estatus de visitante está restringido.",
    "Additional scrutiny may apply for your passport nationality.": "Puede aplicarse un escrutinio adicional para tu nacionalidad de pasaporte.",

    /* ── Europa Schengen compartida (v1.19.0) ── */
    "EU/EEA citizens can work in this destination under freedom of movement.": "Los ciudadanos UE/EEE pueden trabajar en este destino por libre circulación.",
    /* Motor genérico — frases destapadas por la tanda LatAm (v1.68.0) */
    "A visa will likely be required for this destination.": "Lo más probable es que necesites visa para este destino.",
    "Additional documentation may be required for your passport nationality.": "Puede requerirse documentación adicional según tu nacionalidad de pasaporte.",
    "Remote work is the primary eligibility factor for Digital Nomad visas.": "El trabajo remoto es el factor principal de elegibilidad en las visas de nómada digital.",
    "Simulated guidance only. Always verify with official immigration sources.": "Orientación simulada. Verifica siempre con las fuentes oficiales de inmigración.",
    "Work permit processes may be more complex for your passport nationality.": "Los trámites de permiso de trabajo pueden ser más complejos según tu nacionalidad de pasaporte.",
    "You may need to show sufficient funds and income. Check official digital nomad visa requirements for this destination.": "Puede que debas demostrar fondos e ingresos suficientes. Consulta los requisitos oficiales de la visa de nómada digital de este destino.",
    "Your passport appears to provide strong global visa access.": "Tu pasaporte parece ofrecer un acceso global fuerte a visados.",
    /* CAPTURA CON NAVEGADOR REAL — Costa Rica, Vietnam, Guatemala, Nicaragua y Cuba (v1.109.0) */
    "Costa Rica calls this the Stay for Remote Workers and Service Providers (Estancia para Trabajador y Prestador Remoto de Servicios).": "Costa Rica la llama Estancia para Trabajador y Prestador Remoto de Servicios.",
    "This route is for people who provide paid services remotely to a person or company located abroad.": "Esta vía es para quienes prestan servicios remunerados en remoto a una persona o empresa que está en el exterior.",
    "Your pay must come from abroad and be at least USD 3,000 a month.": "Tu remuneración debe venir del exterior y ser de al menos 3.000 USD al mes.",
    "If you also apply for your dependants, the minimum rises to USD 4,000 a month.": "Si además solicitas la permanencia para tus dependientes, el mínimo sube a 4.000 USD al mes.",
    "The amounts are converted at the official selling rate set by the Central Bank of Costa Rica.": "Los importes se convierten al tipo de cambio oficial de venta que fija el Banco Central de Costa Rica.",
    "Once approved you are issued a DIMEX migration ID card, and you must hold a medical services policy.": "Una vez aprobada te expiden el documento de identidad migratorio DIMEX, y debes tener una póliza de servicios médicos.",
    "This is simulated guidance only. Always verify with the Dirección General de Migración y Extranjería.": "Esto es orientación simulada. Verifica siempre con la Dirección General de Migración y Extranjería.",
    "Always verify with the Dirección General de Migración y Extranjería.": "Verifica siempre con la Dirección General de Migración y Extranjería.",
    "Vietnam's e-visa is valid for a maximum of 90 days, for single or multiple entries.": "La e-visa de Vietnam vale un máximo de 90 días, con entrada única o múltiple.",
    "The fee is 25 USD for a single-entry visa and 50 USD for a multiple-entry one, and it is not refunded if the visa is refused.": "La tasa es de 25 USD para entrada única y 50 USD para entradas múltiples, y no se devuelve si deniegan la visa.",
    "You must be outside Vietnam when you apply, with a passport or valid international travel document.": "Debes estar fuera de Vietnam al solicitarla, con pasaporte o documento de viaje internacional válido.",
    "You can only enter and leave through the international border gates designated by the Government.": "Solo puedes entrar y salir por los puestos fronterizos internacionales designados por el Gobierno.",
    "The Immigration Department recommends filling in the pre-arrival form before you travel, to speed up entry.": "El Departamento de Inmigración recomienda rellenar el formulario previo a la llegada antes de viajar, para agilizar la entrada.",
    "Guatemala exempts the nationalities in its category A from needing a visa to enter.": "Guatemala exime de visa de ingreso a las nacionalidades de su categoría A.",
    "Your passport must be valid and in good condition; the officer checks that it is authentic and current.": "Tu pasaporte debe estar vigente y en buen estado; el agente comprueba su autenticidad y vigencia.",
    "You must go through an interview and answer truthfully about the purpose of your trip.": "Tienes que pasar una entrevista y declarar con veracidad el motivo de tu viaje.",
    "You must show economic solvency with cards or cash covering your stay, and it has to match what you declare.": "Debes demostrar solvencia económica con tarjetas o efectivo que respalden tu estadía, y ha de ser congruente con lo que declares.",
    "You need a hotel booking or proof of where you will stay, and a return ticket or other transport that guarantees you leave.": "Necesitas reserva de hotel o constancia de dónde te alojarás, y boleto de regreso u otro transporte que garantice tu salida.",
    "Granting a visa does not mean unconditional admission: the border officer decides.": "Que te concedan la visa no implica admisión incondicional: decide el agente en frontera.",
    "This is simulated guidance only. Always verify with the Instituto Guatemalteco de Migración.": "Esto es orientación simulada. Verifica siempre con el Instituto Guatemalteco de Migración.",
    "Always verify with the Instituto Guatemalteco de Migración.": "Verifica siempre con el Instituto Guatemalteco de Migración.",
    "Nicaragua sorts nationalities into two categories: category A needs no entry visa with any kind of passport; category C needs a consulted visa.": "Nicaragua clasifica las nacionalidades en dos categorías: la A no necesita visa de ingreso con ningún tipo de pasaporte; la C necesita visa consultada.",
    "The consulted visa is requested through a Nicaraguan diplomatic or consular mission abroad.": "La visa consultada se solicita ante una representación diplomática o consular de Nicaragua en el exterior.",
    "You need a passport valid for at least 6 months, a letter of application, a criminal or police record certificate from your country of origin or residence, and a notarised maintenance commitment.": "Necesitas pasaporte con al menos 6 meses de vigencia, carta de solicitud, certificado de antecedentes penales o policiales de tu país de origen o residencia, y compromiso de manutención notariado.",
    "You must show a return ticket to your country of origin or departure.": "Debes presentar el boleto de retorno a tu país de origen o procedencia.",
    "Once the visa is notified to the consulate you have 6 months to use it, or it lapses.": "Una vez notificada la visa al consulado tienes 6 meses para usarla, o queda sin efecto.",
    "This is simulated guidance only. Always verify with Nicaragua's Dirección General de Migración y Extranjería.": "Esto es orientación simulada. Verifica siempre con la Dirección General de Migración y Extranjería de Nicaragua.",
    "Always verify with Nicaragua's Dirección General de Migración y Extranjería.": "Verifica siempre con la Dirección General de Migración y Extranjería de Nicaragua.",
    "Cuba issues tourist visas or tourist cards only to foreigners travelling for pleasure, tourism or recreation, by air or sea.": "Cuba expide visas de turismo o tarjetas turísticas únicamente a extranjeros que viajan por placer, turismo o recreo, vía aérea o marítima.",
    "The card is valid for a single entry and a 90-day stay, extendable once for the same period.": "La tarjeta vale para una sola entrada y una estancia de 90 días, prorrogable una única vez por igual periodo.",
    "To extend it you ask at your hotel desk or directly at the immigration authorities.": "Para prorrogarla debes dirigirte al buró de tu hotel o directamente a las autoridades de inmigración.",
    "Foreign minors need their own individual tourist card, even if they appear in their parents' passports.": "Los menores extranjeros necesitan su propia tarjeta de turismo individual, aunque figuren en el pasaporte de sus padres.",
    "Cuba runs an official e-visa portal, but it only holds the application form: the requirements are published by the foreign ministry.": "Cuba tiene un portal oficial de e-visa, pero solo contiene el formulario de solicitud: los requisitos los publica su Cancillería.",
    "This is simulated guidance only. Always verify with Cuba's Ministry of Foreign Affairs.": "Esto es orientación simulada. Verifica siempre con el Ministerio de Relaciones Exteriores de Cuba.",
    "Always verify with Cuba's Ministry of Foreign Affairs.": "Verifica siempre con el Ministerio de Relaciones Exteriores de Cuba.",
    /* R5 — GEORGIA, BRASIL, EL SALVADOR y PANAMÁ (estudios y remoto) (v1.108.0) */
    "You must show documentation proving enrolment on the course you intend to take.": "Debes presentar documentación que acredite la matrícula en el curso que quieres cursar.",
    "The application is filed with the Federal Police, together with the request for the National Migration Registry Card.": "La solicitud se presenta ante la Policía Federal, junto con la petición de la Carteira de Registro Nacional Migratório.",
    "The fees are R$168.13 for the residence authorisation and R$204.77 for issuing the registry card.": "Las tasas son 168,13 R$ por la autorización de residencia y 204,77 R$ por la emisión de la tarjeta de registro.",
    "You need criminal record certificates from every country where you have lived in the last five years.": "Necesitas certificados de antecedentes penales de cada país donde hayas residido en los últimos cinco años.",
    "This is simulated guidance only. Always verify with Brazil's Ministry of Justice.": "Esto es orientación simulada. Verifica siempre con el Ministerio de Justicia de Brasil.",
    "Always verify with Brazil's Ministry of Justice.": "Verifica siempre con el Ministerio de Justicia de Brasil.",
    "Brazil grants a residence authorisation for study to immigrants who intend to follow a regular course, an internship or a study or research exchange.": "Brasil concede una autorización de residencia por estudios a quien vaya a cursar estudios regulares, hacer prácticas o un intercambio de estudio o investigación.",
    "Brazil grants a residence authorisation for work to immigrants carrying out a job in the country, with or without an employment relationship.": "Brasil concede una autorización de residencia por trabajo a quien ejerce una actividad laboral en el país, con o sin vínculo de empleo.",
    "Work-based applications are filed directly with the Ministry of Justice through the MigranteWeb system.": "Las solicitudes por trabajo se presentan directamente ante el Ministerio de Justicia a través del sistema MigranteWeb.",
    "There is also a working-holiday residence authorisation for people over 16 from countries that grant the same benefit to Brazilians.": "También existe una autorización de residencia de férias-trabalho para mayores de 16 años de países que conceden el mismo beneficio a los brasileños.",
    "El Salvador's consulted visa is filed at the Salvadoran consular office of your choice.": "La visa consultada de El Salvador se presenta en la oficina consular salvadoreña que elijas.",
    "The application must be submitted four weeks before you enter Salvadoran territory.": "El trámite debe presentarse cuatro semanas antes de entrar en territorio salvadoreño.",
    "If you hold a US, Canadian or Schengen visa valid for at least six months before your planned entry, you must contact the visa officer of the foreign ministry.": "Si tienes visa estadounidense, canadiense o Schengen con al menos seis meses de vigencia antes de la fecha prevista de entrada, debes contactar con el técnico de visas de la Cancillería.",
    "You need a photocopy of the ticket quote or travel itinerary showing the airline, flight number and the dates you enter and leave the country.": "Necesitas fotocopia de la cotización del boleto o itinerario de viaje con la aerolínea, el número de vuelo y las fechas de entrada y salida del país.",
    "Accepting your documents does not mean the visa is granted, and the fee is not refundable.": "Que te admitan los documentos no significa que te concedan la visa, y la tasa no es reembolsable.",
    "This is simulated guidance only. Always verify with the Salvadoran migration authority.": "Esto es orientación simulada. Verifica siempre con la Dirección General de Migración y Extranjería de El Salvador.",
    "Always verify with the Salvadoran migration authority.": "Verifica siempre con la Dirección General de Migración y Extranjería de El Salvador.",
    "Panama's temporary permit for education covers full-time regular studies at public or private centres recognised by the Ministry of Education.": "El permiso temporal por razones de educación de Panamá cubre estudios regulares a tiempo completo en centros públicos o privados reconocidos por el Ministerio de Educación.",
    "You must enrol in all the subjects of the study plan for the term, in daytime hours, unless the plan itself requires evening classes.": "Debes matricular todas las asignaturas del plan de estudios del periodo, en horario diurno, salvo que el propio plan exija clases nocturnas.",
    "This permit is exclusively for studying: while it is valid you are banned from working, except for the placements and internships your centre requires.": "Este permiso es exclusivo para estudiar: mientras esté vigente tienes prohibido trabajar, salvo las prácticas y pasantías que exija tu centro.",
    "A certified cheque for B/.250.00 payable to the National Treasury is required.": "Se exige un cheque certificado por 250,00 balboas a favor del Tesoro Nacional.",
    "Panama has a short-stay visa for remote workers: your work must produce its effects outside Panama.": "Panamá tiene una visa de corta estancia para trabajadores remotos: tu trabajo debe surtir efectos fuera de Panamá.",
    "You must receive income from a foreign source of at least B/.36,000 a year, or the equivalent in another currency.": "Debes recibir ingresos de fuente extranjera de al menos 36.000 balboas al año, o su equivalente en otra moneda.",
    "The visa lasts nine months, renewable once for the same period, and the card costs B/.50.": "La visa dura nueve meses, prorrogable una vez por el mismo periodo, y el carné cuesta 50 balboas.",
    "Once granted, it lets you work remotely from Panama with no extra permit from any other state body.": "Una vez concedida, te permite teletrabajar desde Panamá sin ningún trámite adicional ante otra entidad estatal.",
    "This route is for people employed by a transnational company abroad or self-employed, working in teleworking mode.": "Esta vía es para quien tiene contrato con una empresa transnacional extranjera o es autónomo, en modalidad de teletrabajo.",
    "For the D1 labour visa you need the work agreement and an invitation registered by the inviting company with the Georgian authorities.": "Para el visado laboral D1 necesitas el contrato de trabajo y una invitación registrada por la empresa que te invita ante las autoridades georgianas.",
    "You also need travel insurance covering accidents above 30,000 GEL for the whole visit, and the visa fee is around USD 20.": "También necesitas seguro de viaje que cubra accidentes por encima de 30.000 GEL durante toda la visita, y la tasa del visado ronda los 20 USD.",
    "If you do need a visa, the C1 category is the tourist one and a Georgian visa lasts 90 days.": "Si sí necesitas visado, la categoría C1 es la de turismo y el visado georgiano dura 90 días.",
    "Applicants must hold travel or health insurance covering accidents above 30,000 GEL for the period of the visit.": "Hay que tener seguro de viaje o de salud que cubra accidentes por encima de 30.000 GEL durante el periodo de la visita.",
    "You need an admission letter from the Georgian university and the order of the Minister of Education and Science accepting you.": "Necesitas carta de admisión de la universidad georgiana y la orden del Ministro de Educación y Ciencia que te acepta.",
    "You must show proof of financial support or a bank statement for the past 3 months.": "Debes acreditar apoyo financiero o un extracto bancario de los últimos 3 meses.",
    "Travel insurance covering accidents above 30,000 GEL for the whole visit is required.": "Se exige seguro de viaje que cubra accidentes por encima de 30.000 GEL durante toda la visita.",
    /* R5 — INDIA (3 rutas) y CATAR (turismo) auditados (v1.107.0) */
    "India's e-Tourist Visa comes in three lengths: 30 days, one year and five years, all with multiple entries.": "La e-Tourist Visa de India tiene tres duraciones: 30 días, un año y cinco años, todas con entradas múltiples.",
    "The 30-day version is non-extendable and non-convertible.": "La versión de 30 días no es prorrogable ni convertible.",
    "On the one-year and five-year visas your total stay in India during one calendar year cannot exceed 180 days.": "En las visas de uno y cinco años, tu estancia total en India durante un año natural no puede superar los 180 días.",
    "Beware of scams: the Government of India charges no emergency or express fee for any e-visa.": "Cuidado con las estafas: el Gobierno de la India no cobra ninguna tasa de urgencia ni exprés por ninguna e-visa.",
    "This is simulated guidance only. Always verify with the Indian Bureau of Immigration.": "Esto es orientación simulada. Verifica siempre con el Bureau of Immigration de la India.",
    "Always verify with the Indian Bureau of Immigration.": "Esto es orientación simulada. Verifica siempre con el Bureau of Immigration de la India.",
    "India's student visa is for people whose sole objective is to follow on-campus, full-time structured courses at recognised institutions.": "La visa de estudiante de India es para quienes tienen como único objetivo cursar estudios presenciales, a tiempo completo y estructurados, en instituciones reconocidas.",
    "For a medical or para-medical course you must produce a letter of approval or No Objection Certificate from the Ministry of Health.": "Para un curso médico o paramédico debes presentar carta de aprobación o «No Objection Certificate» del Ministerio de Salud.",
    "You must show evidence of transferring enough funds for at least four months of sustenance in India, or travellers cheques for a similar amount.": "Debes acreditar la transferencia de fondos suficientes para al menos cuatro meses de sustento en India, o cheques de viaje por importe similar.",
    "India's employment visa is granted to highly skilled or qualified professionals.": "La visa de empleo de India se concede a profesionales altamente cualificados.",
    "It is not granted for jobs where qualified Indians are available, nor for routine, ordinary or clerical work.": "No se concede para puestos que puedan cubrir indios cualificados, ni para trabajos rutinarios, ordinarios o administrativos.",
    "The person being sponsored must draw a gross salary above Rs. 16.25 lakhs per year, with some listed exceptions.": "La persona patrocinada debe cobrar un salario bruto superior a 16,25 lakhs de rupias al año, con algunas excepciones tasadas.",
    "Citizens of more than 95 countries can enter Qatar with a visa on arrival at its entry points, for varying lengths of stay.": "Los ciudadanos de más de 95 países pueden entrar en Catar con visa a la llegada en sus puestos de entrada, con estancias de duración variable.",
    "You need a passport valid for at least three months and a confirmed onward or return ticket.": "Necesitas un pasaporte con al menos tres meses de vigencia y un billete de continuación o de vuelta confirmado.",
    "Health insurance is compulsory: the policy must come from an insurer registered with Qatar's Ministry of Public Health.": "El seguro de salud es obligatorio: la póliza debe ser de una aseguradora registrada en el Ministerio de Salud Pública de Catar.",
    "This is simulated guidance only. Always verify with the Qatari Ministry of Interior.": "Esto es orientación simulada. Verifica siempre con el Ministerio del Interior de Catar.",
    "Always verify with the Qatari Ministry of Interior.": "Esto es orientación simulada. Verifica siempre con el Ministerio del Interior de Catar.",
    /* R5 — ECUADOR, PARAGUAY y VENEZUELA auditados (v1.106.0) */
    "Ecuador's tourist visa is authorised for 90 days.": "La visa de turista de Ecuador se autoriza por 90 días.",
    "You need a certificate of no criminal record from your country and from any country where you lived in the last five years; it is valid for 180 days and must be apostilled or legalised.": "Necesitas certificado de no antecedentes penales de tu país y de aquellos donde hayas residido los últimos cinco años; tiene 180 días de vigencia y debe estar apostillado o legalizado.",
    "You must show a bank balance of at least USD 1,380 — one Ecuadorian basic salary for each month of the 90-day stay — even if you plan to stay less.": "Debes acreditar un saldo bancario de al menos 1.380 USD —un salario básico ecuatoriano por cada mes de los 90 días— aunque pienses quedarte menos.",
    "This is simulated guidance only. Always verify with the Ecuadorian Ministry of Foreign Affairs.": "Esto es orientación simulada. Verifica siempre con la Cancillería de Ecuador.",
    "Always verify with the Ecuadorian Ministry of Foreign Affairs.": "Verifica siempre con la Cancillería de Ecuador.",
    "Ecuador's temporary resident visa for work is the general route for taking a job there.": "La visa de residente temporal de trabajo de Ecuador es la vía general para emplearse allí.",
    "You need a certificate of no criminal record from your country and from any country where you lived in the last five years, apostilled or legalised, and translated by an authorised professional if it is not in Spanish.": "Necesitas certificado de no antecedentes penales de tu país y de aquellos donde hayas residido los últimos cinco años, apostillado o legalizado, y traducido por un profesional autorizado si no está en castellano.",
    "You must prove lawful means of living that allow you to support your stay.": "Debes acreditar medios de vida lícitos que te permitan sostener tu estadía.",
    "Paraguay's tourist visa is applied for online through its foreign ministry.": "La visa de turista de Paraguay se solicita online a través de su Cancillería.",
    "It is advisable to apply at least 30 days before your planned travel date.": "Es recomendable solicitarla al menos 30 días antes de la fecha prevista de viaje.",
    "You need an invitation letter from a person or company based in Paraguay, a hotel or accommodation booking and a possible flight or land itinerary.": "Necesitas carta de invitación de una persona o empresa domiciliada en Paraguay, reserva de hotel o alojamiento y un posible itinerario aéreo o terrestre.",
    "You need a criminal record certificate from your country of residence, duly legalised or apostilled.": "Necesitas certificado de antecedentes penales de tu país de residencia, debidamente legalizado o apostillado.",
    "Under-18s cannot apply for the visa on their own.": "Los menores de 18 años no pueden solicitar la visa por sí solos.",
    "You must prove economic solvency with an employment certificate, a bank certificate or another suitable means.": "Debes acreditar solvencia económica con certificado de trabajo, certificado bancario u otro medio idóneo.",
    "This is simulated guidance only. Always verify with the Paraguayan Ministry of Foreign Affairs.": "Esto es orientación simulada. Verifica siempre con la Cancillería de Paraguay.",
    "Always verify with the Paraguayan Ministry of Foreign Affairs.": "Verifica siempre con la Cancillería de Paraguay.",
    "Venezuela's tourist visa is granted to foreigners entering for leisure, health or activities that do not involve pay or profit.": "El visado de turista de Venezuela se otorga a extranjeros que entran por recreo, esparcimiento, salud o actividades que no involucren remuneración ni lucro.",
    "You need the original passport and a copy, valid for at least six months.": "Necesitas el pasaporte original y una copia, con vigencia mínima de seis meses.",
    "You must provide a bank letter stating when the account was opened, its number and its balance.": "Debes aportar una carta bancaria que indique la fecha de apertura de la cuenta, su número y su balance.",
    "This is simulated guidance only. Always verify with the Venezuelan Ministry of Foreign Affairs.": "Esto es orientación simulada. Verifica siempre con el Ministerio del Poder Popular para Relaciones Exteriores de Venezuela.",
    "Always verify with the Venezuelan Ministry of Foreign Affairs.": "Verifica siempre con el Ministerio del Poder Popular para Relaciones Exteriores de Venezuela.",
    /* v1.152.0 — Venezuela ampliada a estudios, trabajo y remoto */
    "Venezuela's student transit visa is granted to non-migrants entering for higher, technical or university studies, for specialisation, or for internships in their field.": "El visado de transeúnte estudiante de Venezuela se otorga a personas no migrantes que entran a realizar estudios superiores, técnicos o universitarios, de especialización, o pasantías en su especialidad.",
    "This visa is only open to nationalities for which Venezuela has not suppressed the visa requirement.": "Este visado solo está abierto a las nacionalidades para las que Venezuela no ha suprimido la exigencia de visa.",
    "You must provide proof of enrolment from the institution that backs your application.": "Debes aportar la constancia de inscripción de la institución que te avala.",
    "Venezuela's labour transit visa is the route for foreigners coming to work.": "El visado de transeúnte laboral es la vía de Venezuela para los extranjeros que vienen a trabajar.",
    "This visa is not decided by the consulate alone: the Ministry of Interior, Justice and Peace authorises it, and only after the Ministry of Labour agrees.": "Este visado no lo decide el consulado por su cuenta: lo autoriza el Ministerio del Poder Popular para Relaciones Interiores, Justicia y Paz, y solo previa conformidad del Ministerio del Trabajo.",
    "The application is filed before the Ministry of Labour by whoever hires you, or by you as the worker, so you cannot start it on your own from abroad.": "La solicitud se presenta ante el Ministerio del Trabajo por quien te contrata, o por ti como trabajador, así que no puedes iniciarla por tu cuenta desde el extranjero.",
    "Your passport must be valid for more than six months.": "Tu pasaporte debe tener más de seis meses de vigencia.",
    "You must pay the consular fee.": "Debes pagar el arancel consular.",
    "Venezuela's published catalogue covers permanent migrant family, domestic employee, rentier (TR-RE), business owner or industrialist, re-entry (TR-RI), Venezuelan family member, student (TR-E), religious (TR-REL), labour (TR-L), investor (TR-I), business (TR-N), transit (V-T) and tourist (T) visas.": "El catálogo publicado por Venezuela recoge los visados de familiar migrante permanente, empleado doméstico, rentista (TR-RE), empresario o industrial, reingreso (TR-RI), familiar venezolano, estudiante (TR-E), religioso (TR-REL), laboral (TR-L), inversionista (TR-I), negocios (TR-N), tránsito (V-T) y turista (T).",
    "The closest categories are the rentier visa, for people living on income from abroad, and the business visa, but neither is designed for remote work for a foreign employer.": "Las categorías más cercanas son el visado de rentista, para quienes viven de rentas del exterior, y el de negocios, pero ninguno está pensado para trabajar en remoto para un empleador extranjero.",
    "The official catalogue of visas published by the Venezuelan Ministry of Foreign Affairs has no digital nomad or remote work category.": "El catálogo oficial de visados que publica el Ministerio del Poder Popular para Relaciones Exteriores de Venezuela no tiene categoría de nómada digital ni de trabajo en remoto.",
    /* R5 — SRI LANKA y FIYI auditadas en sus tres rutas (v1.103.0) */
    "You may be asked for proof of funds and onward travel.": "Puede que te pidan prueba de fondos y billete de salida.",
    "Sri Lanka grants a 30-day free tourist visa to seven nationalities on a payment basis: China, India, Russia, Japan, Thailand, Malaysia and Indonesia.": "Sri Lanka concede una visa de turismo gratuita de 30 días a siete nacionalidades: China, India, Rusia, Japón, Tailandia, Malasia e Indonesia.",
    "Your intended stay must end at least two months before your travel document expires.": "Tu estancia prevista debe terminar al menos dos meses antes de que caduque tu documento de viaje.",
    "Children under 12 must extend their tourist visa, paying the extension fee, if they stay longer than thirty days from arrival.": "Los menores de 12 años deben prorrogar su visa de turismo, pagando la tasa correspondiente, si permanecen más de treinta días desde su llegada.",
    "This is simulated guidance only. Always verify with the Sri Lanka Department of Immigration and Emigration.": "Esto es orientación simulada. Verifica siempre con el Departamento de Inmigración y Emigración de Sri Lanka.",
    "Always verify with the Sri Lanka Department of Immigration and Emigration.": "Verifica siempre con el Departamento de Inmigración y Emigración de Sri Lanka.",
    "Studying in Sri Lanka goes through a residence visa in the educational category.": "Estudiar en Sri Lanka se tramita mediante una visa de residencia en la categoría educativa.",
    "University students need a recommendation from the Ministry of Higher Education.": "Los estudiantes universitarios necesitan una recomendación del Ministerio de Educación Superior.",
    "You must show bank encashment receipts to the value of US$1500 for a year per person.": "Debes presentar recibos de cambio bancario por valor de 1500 US$ por año y persona.",
    "The residence visa is valid for one year, or the period recommended by the ministry or the academic institution, and can be renewed.": "La visa de residencia vale un año, o el periodo que recomiende el ministerio o la institución académica, y es renovable.",
    "A Sri Lankan residence visa is a permit for a non-Sri Lankan to obtain residence facilities for special purposes, and employment is one of those categories.": "La visa de residencia de Sri Lanka es un permiso para que una persona extranjera obtenga facilidades de residencia por motivos especiales, y el empleo es una de esas categorías.",
    "You need a request letter from the company or institute, its registration certificate and the details of its board of directors.": "Necesitas una carta de solicitud de la empresa o instituto, su certificado de registro y los datos de su consejo de administración.",
    "The residence visa is valid for one year, or the period the relevant authority recommends, and is renewed annually.": "La visa de residencia vale un año, o el periodo que recomiende la autoridad competente, y se renueva anualmente.",
    "Fiji's single-journey visa is valid for 3 months and can only be used for one trip.": "La visa de viaje único de Fiyi vale 3 meses y solo puede usarse para un viaje.",
    "There is also a multiple-entry visa valid for 12 months from issue, with each stay limited to 4 months.": "También existe una visa de entradas múltiples válida 12 meses desde su emisión, con estancias limitadas a 4 meses cada una.",
    "Processing takes 14 working days from the day the visa officer receives your application.": "La tramitación tarda 14 días hábiles desde que el oficial de visados recibe tu solicitud.",
    "Fees depend on the type: single entry costs $93 and multiple entry $185.": "Las tasas dependen del tipo: entrada única cuesta 93 y entradas múltiples 185.",
    "This is simulated guidance only. Always verify with the Fiji Immigration Department.": "Esto es orientación simulada. Verifica siempre con el Departamento de Inmigración de Fiyi.",
    "Always verify with the Fiji Immigration Department.": "Verifica siempre con el Departamento de Inmigración de Fiyi.",
    "Fiji issues a student permit for the current academic year.": "Fiyi expide un permiso de estudiante para el curso académico en vigor.",
    "You need an acceptance letter from the school or institution for the current academic year.": "Necesitas una carta de aceptación del centro para el curso académico en vigor.",
    "A local police report is required for people over 18 who have already studied 12 months or more in Fiji.": "Se exige un informe policial local a los mayores de 18 que ya hayan estudiado 12 meses o más en Fiyi.",
    "The student permit application costs $321 and takes about 21 working days.": "La solicitud del permiso de estudiante cuesta 321 y tarda unos 21 días hábiles.",
    "Fiji issues long-term work permits of three years, and short-term permits of one year or less for temporary engagements.": "Fiyi expide permisos de trabajo de larga duración de tres años, y de corta duración de un año o menos para encargos temporales.",
    "You cannot switch from a visitor permit: no work permit application is accepted from visitor permit holders inside the country.": "No se puede cambiar desde un permiso de visitante: no se acepta ninguna solicitud de permiso de trabajo de quien está en el país con permiso de visitante.",
    /* R5 — SUDÁFRICA auditada en sus tres rutas (v1.102.0, DHA) */
    "Visitors' visas are for stays of 90 days or less, for tourism or business.": "Las visas de visitante son para estancias de 90 días o menos, por turismo o negocios.",
    "Your passport must be valid for no less than 30 days after your intended visit ends.": "Tu pasaporte debe ser válido al menos 30 días después del final de tu visita prevista.",
    "Visas are not issued at South African ports of entry: airline staff are obliged to insist on the visa before letting you board.": "No se expiden visas en los puestos de entrada sudafricanos: el personal de la aerolínea está obligado a exigirte la visa antes de dejarte embarcar.",
    "South Africa's general work visa is valid for the duration of the employment contract, up to a maximum of five years.": "La visa general de trabajo de Sudáfrica vale por la duración del contrato de empleo, con un máximo de cinco años.",
    "You need a police clearance certificate from every country where you lived for longer than 12 months in the last five years, and it cannot be older than six months when you submit it.": "Necesitas certificado de antecedentes de cada país donde hayas vivido más de 12 meses en los últimos cinco años, y no puede tener más de seis meses cuando lo presentes.",
    "You also need a medical report signed by a medical practitioner, no older than six months at submission.": "También necesitas un informe médico firmado por un facultativo, con menos de seis meses de antigüedad al presentarlo.",
    "South Africa issues a study visa for the course you are accepted onto.": "Sudáfrica expide una visa de estudios para el curso en el que te admiten.",
    "You need an official letter confirming provisional acceptance or acceptance at the learning institution and the duration of the course.": "Necesitas una carta oficial que confirme la aceptación (o aceptación provisional) en el centro y la duración del curso.",
    "Proof of medical cover is required, and a cash deposit equivalent to a return or onward ticket may be asked for.": "Se exige prueba de cobertura médica, y pueden pedirte un depósito en efectivo equivalente a un billete de vuelta o de continuación.",
    "This is simulated guidance only. Always verify with the Department of Home Affairs.": "Esto es orientación simulada. Verifica siempre con el Department of Home Affairs.",
    "Always verify with the Department of Home Affairs.": "Verifica siempre con el Departamento de Interior de Sudáfrica (Department of Home Affairs).",
    /* R5 — BELICE y REP. DOMINICANA auditadas (v1.101.0) */
    "Your passport must be valid for more than 6 months.": "Tu pasaporte debe tener más de 6 meses de vigencia.",
    "Your original passport must be valid for at least six months.": "Tu pasaporte original debe tener una vigencia mínima de seis meses.",
    "A Belize visa lets you enter and stay legally for a maximum of 30 days from the date of entry.": "Una visa de Belice te permite entrar y permanecer legalmente un máximo de 30 días desde la fecha de entrada.",
    "Your flight itinerary must show the expected arrival in Belize and the return date to your country of origin.": "Tu itinerario de vuelo debe mostrar la llegada prevista a Belice y la fecha de retorno a tu país de origen.",
    "You and your sponsor must provide banking financials showing the last six months of transactions.": "Tú y tu patrocinador debéis aportar extractos bancarios con los movimientos de los últimos seis meses.",
    "This is simulated guidance only. Always verify with the Belize Immigration Department.": "Esto es orientación simulada. Verifica siempre con el Departamento de Inmigración de Belice.",
    "Always verify with the Belize Immigration Department.": "Esto es orientación simulada. Verifica siempre con el Departamento de Inmigración de Belice.",
    "Belize issues a student permit; at tertiary level it is issued for one semester.": "Belice expide un permiso de estudiante; en nivel terciario se concede por un semestre.",
    "You need a letter from the institution stating the duration of study, the programme and the institution's details.": "Necesitas una carta del centro que indique la duración de los estudios, el programa y los datos de la institución.",
    "The permit costs BZ$200 per school year or semester for most nationalities, and more for some.": "El permiso cuesta 200 dólares beliceños por curso o semestre para la mayoría de nacionalidades, y más para algunas.",
    "Belize's route is the Temporary Employment Permit, applied for at the Labour Department.": "La vía de Belice es el Permiso Temporal de Empleo, que se solicita en el Departamento de Trabajo.",
    "To apply you must already hold a valid passport and a valid Belize visa.": "Para solicitarlo debes tener ya un pasaporte vigente y una visa de Belice válida.",
    "Within 30 days you will receive a call from the Labour Department about your application.": "En un plazo de 30 días recibirás una llamada del Departamento de Trabajo sobre tu solicitud.",
    "Permits run for one week, one crop season or one year; for professional workers with a university degree the one-year fee is $3000.": "Los permisos son de una semana, una temporada de cosecha o un año; para trabajadores profesionales con título universitario la tasa de un año es de 3000.",
    "The Dominican tourist visa comes in a simple version (60 days, one entry) and a multiple version (60 days, two entries).": "La visa de turismo dominicana tiene una versión simple (60 días, una entrada) y una múltiple (60 días, dos entradas).",
    "You must show economic solvency: an employment certificate and a bank certification with the last three months of movements.": "Debes acreditar solvencia económica: constancia laboral y certificación bancaria con los movimientos de los últimos tres meses.",
    "This is simulated guidance only. Always verify with the Dominican Ministry of Foreign Affairs.": "Esto es orientación simulada. Verifica siempre con el Ministerio de Relaciones Exteriores de República Dominicana.",
    "Always verify with the Dominican Ministry of Foreign Affairs.": "Esto es orientación simulada. Verifica siempre con el Ministerio de Relaciones Exteriores de República Dominicana.",
    "The Dominican student visa is issued for one year with several entries.": "La visa de estudiante dominicana se expide por un año con varias entradas.",
    "You need an acceptance certificate from the university or institution in the Dominican Republic.": "Necesitas una certificación de aceptación de la universidad o institución en República Dominicana.",
    "You must show who will pay for your studies.": "Debes acreditar quién cubrirá tus estudios.",
    "The Dominican route for working is the business visa for employment purposes: it is granted to people who, because of their occupation, stay a year in the country without having to leave.": "La vía dominicana para trabajar es la visa de negocios con fines laborales: se otorga a quienes, por su ocupación, permanecen un año en el país sin tener que salir.",
    "It is issued for one year with several entries.": "Se expide por un año con varias entradas.",
    "You need a criminal record certificate issued by a federal authority of every country where you lived in the last 5 years, legalised or apostilled.": "Necesitas certificado de no antecedentes penales expedido por autoridad federal de cada país donde hayas residido en los últimos 5 años, legalizado o apostillado.",
    /* R5 — BOLIVIA: turismo, estudios y trabajo AUDITADOS (v1.100.0, red consular) */
    "Bolivia sorts nationalities into three groups: Group I does not need a tourist visa at all, Group II does, and Group III needs one with prior clearance from the migration authority.": "Bolivia clasifica las nacionalidades en tres grupos: el Grupo I no necesita visa de turismo, el Grupo II sí, y el Grupo III la necesita con consulta previa a la autoridad migratoria.",
    "Your passport must be valid for at least six months.": "Tu pasaporte debe tener una vigencia mínima de seis meses.",
    "You need a travel itinerary or return ticket, and either a hosting reservation or an invitation letter from someone living in Bolivia registered with the migration authority.": "Necesitas itinerario de viaje o pasaje de retorno, y una reserva de hospedaje o una carta de invitación de alguien domiciliado en Bolivia registrada ante la autoridad migratoria.",
    "A yellow fever vaccination certificate is required if you will visit high-risk endemic areas.": "Se exige certificado de vacuna contra la fiebre amarilla si vas a visitar zonas endémicas de alto riesgo.",
    "You must show economic solvency for your stay.": "Debes acreditar solvencia económica para tu estancia.",
    "This is simulated guidance only. Always verify with the Bolivian consular network.": "Esto es orientación simulada. Verifica siempre con la red consular boliviana.",
    "Always verify with the Bolivian consular network.": "Verifica siempre con la red consular boliviana.",
    "Bolivia's student visa covers primary and secondary schooling as well as higher and professional education.": "La visa de estudiante de Bolivia cubre estudios de nivel primario y secundario, además de educación superior y de formación profesional.",
    "The visa itself lasts up to 60 days: with it you then apply to the migration authority for a one-year temporary stay, renewable until you finish your studies.": "La visa en sí dura hasta 60 días: con ella tramitas ante la autoridad migratoria una permanencia temporal de un año, renovable hasta terminar tus estudios.",
    "You must produce study documents — certificate, degree or academic record — legalised beforehand by the Bolivian consular office.": "Debes presentar documentos de estudios —certificado, título o registro de notas— legalizados previamente por la oficina consular boliviana.",
    "A police, criminal or judicial record certificate from your country or country of residence is required from age 16.": "Se exige certificado de antecedentes policiales, penales o judiciales del país de origen o de residencia a partir de los 16 años.",
    "You must show economic solvency through bank statements or a credit card.": "Debes acreditar solvencia económica mediante extracto bancario o tarjeta de crédito.",
    "Bolivia's specific-purpose visa (Objeto Determinado) is the entry permit for work, temporary work, volunteering, academic exchange, health or family reasons — anything other than tourism.": "La Visa de Objeto Determinado de Bolivia es el permiso de ingreso por trabajo, trabajo transitorio, voluntariado, intercambio académico, salud o familia — cualquier motivo distinto al turismo.",
    "You need an invitation letter from the company or organisation, with supporting documents, except for temporary work, health and family cases.": "Necesitas carta de invitación de la empresa u organización con documentación de respaldo, salvo en trabajo transitorio, salud y familia.",
    /* R5 — PERÚ: turismo, estudios y trabajo AUDITADOS (v1.99.0, fichas de gob.pe) */
    "Many Latin American and European nationalities do not need this visa at all — check whether yours is one of them.": "Muchas nacionalidades de Latinoamérica y Europa no necesitan esta visa — comprueba si la tuya es una de ellas.",
    "If you do need it, the tourist visa is applied for at a Peruvian consular office in the country where you are.": "Si sí la necesitas, la visa de turismo se solicita en una oficina consular peruana del país donde te encuentres.",
    "You must start the procedure 15 calendar days before you travel.": "Debes realizar el trámite 15 días calendario antes de tu viaje.",
    "The maximum stay on this visa is up to 183 calendar days with no extension, whether in one visit or several consecutive visits within 12 months.": "La estancia máxima con esta visa es de hasta 183 días calendario sin posibilidad de prórroga, ya sea en una visita o en varias consecutivas dentro de 12 meses.",
    "Submitting the application and the documents does not guarantee the visa: each request is assessed individually by the consul.": "Presentar la solicitud y los documentos no garantiza la visa: cada pedido lo evalúa individualmente el cónsul.",
    "The consulate may ask for additional requirements during the process.": "El consulado puede pedirte requisitos adicionales durante el proceso.",
    "Peru's student migratory status (formación) covers studies at institutions recognised by the Peruvian State.": "La calidad migratoria de formación de Perú cubre estudios en centros reconocidos por el Estado peruano.",
    "You need an enrolment certificate from the institution showing that the studies last one year or more.": "Necesitas una constancia de matrícula del centro que indique que los estudios duran un año o más.",
    "You must prove you have no judicial, criminal or police record in your country or in any country where you lived over the previous five years.": "Debes acreditar que careces de antecedentes judiciales, penales y policiales en tu país o en aquellos donde hayas residido los cinco años anteriores.",
    "You need a sworn declaration of financial means covering the whole length of the stay; for minors it is signed by a parent or guardian.": "Necesitas una declaración jurada de solvencia económica por todo el tiempo de la estancia; en menores la firma el padre, la madre o el tutor.",
    "Documents issued abroad must be legalised by the Peruvian consulate or carry an apostille, and be translated into Spanish by a registered translator.": "Los documentos emitidos en el extranjero deben legalizarse en el consulado peruano o llevar apostilla, y traducirse al castellano por traductor colegiado.",
    "The application fee is S/ 58.80, paid through Pagalo.pe or at a Banco de la Nación branch.": "La tasa del trámite es de S/ 58,80, pagadera por Pagalo.pe o en una agencia del Banco de la Nación.",
    "Peru's resident worker status is the general route: it needs a job contract already approved by the labour authority.": "La calidad migratoria de trabajador residente de Perú es la vía general: exige un contrato de trabajo ya aprobado por la autoridad administrativa de trabajo.",
    "The contract must be no more than 30 calendar days old when you apply and must run for one year or more.": "El contrato no puede tener más de 30 días calendario al solicitar y su plazo debe ser igual o mayor a un año.",
    "The hiring company must appear as active and traceable with the tax authority (Sunat), and its legal representative signs a sworn declaration for you.": "La empresa contratante debe figurar como activo y habido ante la Sunat, y su representante legal firma una declaración jurada por ti.",
    "You will get an answer within a maximum of 30 calendar days.": "Recibirás respuesta en un plazo máximo de 30 días calendario.",
    /* R5 — Panamá turismo ASCENDIDA a nivel auditado (v1.98.0, artículo 43) */
    "Your passport nationality is generally accepted for visits to this destination.": "Tu nacionalidad de pasaporte suele aceptarse para visitar este destino.",
    "Panama's migration law sets the entry requirements: you must enter through an officially enabled land, air or sea migration post.": "La ley migratoria de Panamá fija los requisitos de entrada: debes entrar por un puesto migratorio terrestre, aéreo o marítimo oficialmente habilitado.",
    "You must show your valid passport or travel document and, where required, a valid entry visa.": "Debes presentar tu pasaporte o documento de viaje vigente y, cuando se requiera, la visa de ingreso vigente.",
    "You must agree to be interviewed by the authorities, to have your biometric data validated on the spot and your luggage and personal documents inspected.": "Debes aceptar ser entrevistado por las autoridades, que tus datos biométricos se validen in situ y que se inspeccionen tu equipaje y tus documentos personales.",
    "You must hand in the entry and exit card (Tarjeta de Ingreso y Egreso) that the international carrier gives you, filled in.": "Debes entregar debidamente completada la Tarjeta de Ingreso y Egreso que te suministra la empresa de transporte internacional.",
    "You must comply with the health rules set by the Ministry of Health.": "Debes cumplir las normas sanitarias establecidas por el Ministerio de Salud.",
    "Border officers can ask for proof of funds and onward travel.": "En frontera pueden pedirte prueba de fondos y billete de salida.",
    "This is simulated guidance only. Always verify with the Servicio Nacional de Migración.": "Esto es orientación simulada. Verifica siempre con el Servicio Nacional de Migración.",
    "Always verify with the Servicio Nacional de Migración.": "Verifica siempre con el Servicio Nacional de Migración.",
    /* R5 — Chile estudiantes ASCENDIDA a nivel auditado (v1.97.0, fuente SERMIG) */
    "You need proof of admission or enrolment at the institution: a certificate of regular student status or of enrolment.": "Necesitas acreditar la admisión o matrícula en el centro: certificado de alumno regular o certificado de matrícula.",
    "You must show you can support yourself during your studies, with bank deposits, regular transfers, a notarised affidavit from whoever supports you, or a scholarship certificate.": "Debes acreditar sustento económico durante tus estudios: depósitos bancarios, giros periódicos, declaración jurada de expensas de quien te mantiene firmada ante notario, o certificado de beca.",
    "With this residence you can work up to 30 hours a week without needing any extra authorisation, either at your own institution or for any other employer.": "Con esta residencia puedes trabajar hasta 30 horas semanales sin necesidad de ninguna autorización adicional, ya sea en tu propio centro de estudios o para cualquier otro empleador.",
    "Your passport must be valid for at least one year from the date you apply.": "Tu pasaporte debe tener una vigencia no inferior a un año desde la fecha de solicitud.",
    "The criminal record certificate from your country must be no more than 60 days old, and documents issued abroad need an apostille and, if not in Spanish or English, an official translation.": "El certificado de antecedentes penales de tu país no puede tener más de 60 días, y los documentos emitidos en el extranjero necesitan apostilla y, si no están en español o inglés, traducción oficial.",
    /* R5 (4ª parte) — trabajo en EAU, Costa Rica y Georgia (v1.95.0) */
    "Your passport nationality is generally accepted for work applications in this destination.": "Tu nacionalidad de pasaporte suele aceptarse en las solicitudes de trabajo de este destino.",
    "Your education level is a positive signal for a skilled work application.": "Tu nivel educativo es una señal positiva para una solicitud de trabajo cualificado.",
    "Since 1 March 2026 Georgia has a work permit system: you need the right to labour activity plus a D1 visa or a work residence permit.": "Desde el 1 de marzo de 2026 Georgia tiene sistema de permiso de trabajo: necesitas el derecho a actividad laboral más un visado D1 o un permiso de residencia por trabajo.",
    "Your employer applies for you, and must first advertise the job on the government portal for 10 working days.": "Tu empleador lo solicita por ti, y antes debe publicar el puesto en el portal del gobierno durante 10 días hábiles.",
    "Holders of permanent residence are exempt, and people already working there before March 2026 have until 1 January 2027 to get the permit.": "Quienes tienen residencia permanente están exentos, y quienes ya trabajaban allí antes de marzo de 2026 tienen hasta el 1 de enero de 2027 para obtener el permiso.",
    "Working without the permit is now fined, for both the worker and the company.": "Trabajar sin el permiso ahora se multa, tanto al trabajador como a la empresa.",
    "Careful: since 1 March 2026 Georgia requires a work permit for paid activity carried out in the country, and the rules do not yet make clear whether remote work for an employer abroad falls under it.": "Ojo: desde el 1 de marzo de 2026 Georgia exige permiso de trabajo para la actividad remunerada realizada en el país, y las normas todavía no aclaran si el trabajo en remoto para una empresa de fuera entra ahí.",
    "The standard UAE work route is sponsored by the company that hires you: the employer applies for the work permit and the residence visa.": "La vía de trabajo clásica en EAU la patrocina la empresa que te contrata: el empleador solicita el permiso de trabajo y la visa de residencia.",
    "It is normally issued for two to three years and is tied to that employer; if you leave the job, the residence has to be transferred or cancelled.": "Suele concederse por dos o tres años y está atada a ese empleador; si dejas el trabajo, la residencia hay que traspasarla o cancelarla.",
    "You will need a medical fitness test, an Emirates ID and health insurance, and your qualifications may have to be attested.": "Necesitarás una prueba de aptitud médica, el Emirates ID y seguro de salud, y puede que tengas que legalizar tus títulos.",
    "The UAE Green Visa is a five-year residence you sponsor yourself: no company holds it, and you keep it if you change jobs.": "La Green Visa de EAU es una residencia de cinco años que te auto-patrocinas: no la tiene ninguna empresa, y la conservas si cambias de trabajo.",
    "The skilled-employee route asks for a university degree, a job classified in the top MoHRE skill levels and a monthly salary of at least AED 15,000.": "La vía de empleado cualificado pide título universitario, un puesto clasificado en los niveles altos de cualificación del MoHRE y un salario mensual de al menos 15.000 AED.",
    "Freelancers go through a freelance permit and are asked for around AED 360,000 of income over the two previous years.": "Los autónomos van por un permiso de freelance y les piden unos 360.000 AED de ingresos en los dos años anteriores.",
    "It also lets you sponsor your family, which the standard employment visa restricts more.": "También te permite patrocinar a tu familia, algo que la visa de empleo clásica restringe más.",
    "Your university education is a positive signal for the skilled-employee route.": "Tu formación universitaria es una señal positiva para la vía de empleado cualificado.",
    "Costa Rica does not issue a separate work visa: the right to work comes inside a temporary residence, usually the special category for employed workers.": "Costa Rica no emite una visa de trabajo aparte: el derecho a trabajar viene dentro de una residencia temporal, normalmente la categoría especial de trabajador dependiente.",
    "A Costa Rican employer has to sponsor you and show that no Costa Rican or permanent resident can fill the post.": "Un empleador costarricense tiene que patrocinarte y demostrar que ningún costarricense ni residente permanente puede cubrir el puesto.",
    "The employer must be registered with the labour ministry and enrol you in the social security fund (CCSS).": "El empleador debe estar registrado en el ministerio de trabajo e inscribirte en la caja de seguridad social (CCSS).",
    "The permit is tied to that single employer and the process commonly takes between three and eight months.": "El permiso está atado a ese único empleador y el trámite suele tardar entre tres y ocho meses.",
    "Your documents from abroad normally need an apostille and an official Spanish translation.": "Tus documentos de fuera normalmente necesitan apostilla y traducción oficial al español.",
    "If you work remotely for a company abroad, the digital nomad route fits better than this one.": "Si trabajas en remoto para una empresa de fuera, la vía de nómada digital te encaja mejor que esta.",
    /* R5 (3ª parte) — tanda «Remoto»: 10 destinos sin tarjeta de nómada (v1.94.0) */
    "The Dominican Republic does not offer a dedicated Digital Nomad visa.": "República Dominicana no ofrece una visa de nómada digital dedicada.",
    "Remote workers commonly use the tourist entry, which does not allow taking a job in the country.": "Quienes trabajan en remoto suelen usar la entrada de turismo, que no permite emplearse en el país.",
    "Careful with the lists that say otherwise: the country with a nomad visa is Dominica, a different Caribbean state.": "Cuidado con las listas que dicen lo contrario: el país con visa de nómada es Dominica, un estado caribeño distinto.",
    "Guatemala does not offer a dedicated Digital Nomad visa.": "Guatemala no ofrece una visa de nómada digital dedicada.",
    "Remote workers commonly use the tourist entry, which covers up to 90 days shared across the CA-4 countries (Guatemala, El Salvador, Honduras and Nicaragua).": "Quienes trabajan en remoto suelen usar la entrada de turismo, que cubre hasta 90 días compartidos entre los países del CA-4 (Guatemala, El Salvador, Honduras y Nicaragua).",
    "Honduras does not offer a dedicated Digital Nomad visa.": "Honduras no ofrece una visa de nómada digital dedicada.",
    "Remote workers commonly use the tourist entry, which covers up to 90 days shared across the CA-4 countries; longer stays need a residence permit.": "Quienes trabajan en remoto suelen usar la entrada de turismo, que cubre hasta 90 días compartidos entre los países del CA-4; para más tiempo hace falta un permiso de residencia.",
    "Qatar does not offer a dedicated Digital Nomad visa.": "Catar no ofrece una visa de nómada digital dedicada.",
    "Residence in Qatar is normally tied to a local employer who sponsors you.": "La residencia en Catar suele estar ligada a un empleador local que te patrocina.",
    "India does not offer a dedicated Digital Nomad visa.": "India no ofrece una visa de nómada digital dedicada.",
    "Remote workers commonly use the e-tourist visa, which does not allow working for an Indian company.": "Quienes trabajan en remoto suelen usar la e-visa de turismo, que no permite trabajar para una empresa india.",
    "Fiji does not offer a dedicated Digital Nomad visa.": "Fiyi no ofrece una visa de nómada digital dedicada.",
    "Remote workers commonly use the visitor permit, which can usually be extended up to six months in total.": "Quienes trabajan en remoto suelen usar el permiso de visitante, que normalmente puede prorrogarse hasta seis meses en total.",
    "Paraguay does not offer a dedicated Digital Nomad visa.": "Paraguay no ofrece una visa de nómada digital dedicada.",
    "What remote workers actually use is its residence route: the 2022 migration law grants a two-year temporary residence that allows living and working there.": "Lo que usa de verdad quien trabaja en remoto es su vía de residencia: la ley de migraciones de 2022 concede una residencia temporal de dos años que permite vivir y trabajar allí.",
    "Bolivia does not offer a dedicated Digital Nomad visa.": "Bolivia no ofrece una visa de nómada digital dedicada.",
    "Remote workers commonly use the tourist entry, limited to 90 days per year; longer stays need a specific-purpose visa.": "Quienes trabajan en remoto suelen usar la entrada de turismo, limitada a 90 días al año; para más tiempo hace falta una visa de objeto determinado.",
    "El Salvador has a digital nomad residence for remote workers, created in 2023.": "El Salvador tiene una residencia de nómada digital para trabajadores remotos, creada en 2023.",
    "It is granted for one year and can be renewed, up to a total of four years.": "Se concede por un año y puede renovarse, hasta un total de cuatro años.",
    "You must show that your income comes from outside El Salvador, plus a clean criminal record and health insurance.": "Debes demostrar que tus ingresos vienen de fuera de El Salvador, además de antecedentes penales limpios y seguro de salud.",
    "You will be asked to prove regular income from abroad.": "Te pedirán demostrar ingresos regulares procedentes del extranjero.",
    "Belize runs the Work Where You Vacation programme for remote workers.": "Belice tiene el programa Work Where You Vacation para trabajadores remotos.",
    "It allows a stay of up to 180 days, working for your employer or clients abroad.": "Permite una estancia de hasta 180 días, trabajando para tu empleador o clientes de fuera.",
    "You must show annual earnings of at least US$75,000 (less for a couple applying together) and health insurance covering at least US$50,000.": "Debes demostrar ingresos anuales de al menos 75.000 US$ (menos si solicita una pareja junta) y un seguro de salud con cobertura mínima de 50.000 US$.",
    "The income threshold is high: check it carefully before applying.": "El umbral de ingresos es alto: compruébalo bien antes de solicitar.",
    "This route is for people employed or self-employed outside Belize.": "Esta vía es para personas empleadas o autónomas fuera de Belice.",
    "This route is for people who work remotely for employers or clients outside El Salvador.": "Esta vía es para personas que trabajan en remoto para empleadores o clientes de fuera de El Salvador.",
    "Your savings are a positive signal for the income and solvency checks.": "Tus ahorros son una señal positiva para las comprobaciones de ingresos y solvencia.",
    "This route is for people who work remotely for employers or clients outside the country.": "Esta vía es para personas que trabajan en remoto para empleadores o clientes de fuera del país.",
    /* R5 (2ª parte) — estudios de EAU, Chile, Costa Rica y Georgia (v1.93.0) */
    "Your passport nationality is generally accepted for student applications in this destination.": "Tu nacionalidad de pasaporte suele aceptarse para solicitudes de estudios en este destino.",
    "You may need to show funds for tuition and living costs.": "Puede que debas demostrar fondos para la matrícula y el coste de vida.",
    "Chile's temporary residence permit for students covers studies at state-recognised institutions.": "El permiso de residencia temporal para estudiantes de Chile cubre estudios en instituciones reconocidas por el Estado.",
    "It must be applied for from OUTSIDE Chile, through the online portal of the Servicio Nacional de Migraciones — Chilean consulates do not process it.": "Debe solicitarse DESDE FUERA de Chile, por el portal en línea del Servicio Nacional de Migraciones — los consulados chilenos no lo tramitan.",
    "You need proof of admission or enrolment at the institution.": "Necesitas prueba de admisión o matrícula en la institución.",
    "You must show you can support yourself during your studies.": "Debes demostrar que puedes mantenerte durante tus estudios.",
    "Once you hold it you can change category, for example to work, without leaving Chile.": "Una vez lo tienes puedes cambiar de categoría, por ejemplo a trabajo, sin salir de Chile.",
    "Georgia issues a study visa (D3) and, for longer courses, a temporary residence permit for study.": "Georgia emite un visado de estudios (D3) y, para cursos más largos, un permiso de residencia temporal por estudios.",
    "You must be admitted to an institution authorised to run higher-education programmes in Georgia.": "Debes ser admitido en una institución autorizada para impartir programas de educación superior en Georgia.",
    "Nationals who can enter Georgia visa-free often enrol first and apply for the study residence permit from inside the country.": "Quienes pueden entrar en Georgia sin visado suelen matricularse primero y solicitar el permiso de residencia por estudios ya dentro del país.",
    "A UAE student residence visa is sponsored by the university or higher-education institution that admits you.": "La visa de residencia por estudios de EAU la patrocina la universidad o institución de educación superior que te admite.",
    "It is normally issued for one year and renewed while you stay enrolled.": "Normalmente se emite por un año y se renueva mientras sigas matriculado.",
    "You need an acceptance letter, a medical fitness test, health insurance and an Emirates ID.": "Necesitas carta de admisión, prueba de aptitud médica, seguro de salud y Emirates ID.",
    "Outstanding students can qualify for a long-term residence under the UAE's talent schemes.": "Los estudiantes destacados pueden optar a una residencia de larga duración por las vías de talento de EAU.",
    "Costa Rica grants a special student category to people admitted to an accredited institution.": "Costa Rica concede una categoría especial de estudiante a quienes son admitidos en una institución acreditada.",
    "You need an acceptance letter from the institution and to register with the migration authority once there.": "Necesitas carta de admisión de la institución y registrarte ante la autoridad migratoria una vez allí.",
    "Documents issued abroad usually need an apostille and an official Spanish translation.": "Los documentos emitidos en el extranjero suelen necesitar apostilla y traducción oficial al español.",
    "It is normally granted for one year and renewed while you remain enrolled.": "Normalmente se concede por un año y se renueva mientras sigas matriculado.",
    /* R5 — agujeros tapados: turismo BR/CL/ZA + nómada honesto GB (v1.92.0) */
    "Brazil requires an e-visa from US, Canadian and Australian citizens: the visa exemption ended on 10 April 2025 when Brazil restored reciprocity.": "Brasil exige e-visa a los ciudadanos de EE.UU., Canadá y Australia: la exención de visado terminó el 10 de abril de 2025, cuando Brasil restableció la reciprocidad.",
    "It is applied for online before travelling, and the visa is valid for multiple entries over several years.": "Se solicita online antes de viajar, y la visa vale para entradas múltiples durante varios años.",
    "Each stay cannot exceed 90 days, with a limit of 180 days in any 12-month period.": "Cada estancia no puede superar los 90 días, con un límite de 180 días en cualquier periodo de 12 meses.",
    "You may be asked for proof of funds, accommodation and onward travel.": "Puede que te pidan prueba de fondos, alojamiento y billete de salida.",
    "Your passport nationality can enter Brazil for tourism without a visa.": "Tu nacionalidad de pasaporte puede entrar en Brasil como turista sin visado.",
    "Your passport nationality does not appear on the visa-exemption list we model for Brazil — check the official list before booking.": "Tu nacionalidad de pasaporte no aparece en la lista de exención de visado que modelamos para Brasil — consulta la lista oficial antes de reservar.",
    "Visa-free stays are up to 90 days, extendable at the Federal Police up to a total of 180 days in any 12-month period.": "Las estancias sin visado son de hasta 90 días, prorrogables en la Policía Federal hasta un total de 180 días en cualquier periodo de 12 meses.",
    "You cannot take paid work in Brazil as a tourist.": "No puedes trabajar de forma remunerada en Brasil como turista.",
    "Your passport nationality can enter Chile as a tourist without a visa.": "Tu nacionalidad de pasaporte puede entrar en Chile como turista sin visado.",
    "Your passport nationality does not appear on the visa-exemption list we model for Chile: you would need a consular tourist visa.": "Tu nacionalidad de pasaporte no aparece en la lista de exención de visado que modelamos para Chile: necesitarías una visa de turismo consular.",
    "Tourist stays are granted for up to 90 days, recorded in the Tarjeta Única Migratoria you receive on entry.": "Las estancias de turismo se conceden por hasta 90 días, anotados en la Tarjeta Única Migratoria que recibes al entrar.",
    "You cannot take paid work in Chile as a tourist; the stay can be extended once at the immigration service.": "No puedes trabajar de forma remunerada en Chile como turista; la estancia se puede prorrogar una vez en el servicio de migraciones.",
    "Your passport nationality can visit South Africa without a visa for up to 90 days.": "Tu nacionalidad de pasaporte puede visitar Sudáfrica sin visado hasta 90 días.",
    "Your passport nationality does not appear on the visa-exemption list we model for South Africa: you would need a visitor's visa from a South African mission.": "Tu nacionalidad de pasaporte no aparece en la lista de exención de visado que modelamos para Sudáfrica: necesitarías una visa de visitante de una misión sudafricana.",
    "Exempt nationalities are given between 30 and 90 days depending on the passport — check which applies to yours.": "A las nacionalidades exentas se les conceden entre 30 y 90 días según el pasaporte — comprueba cuál te corresponde.",
    "South Africa is rolling out an Electronic Travel Authorisation; exempt travellers are not obliged to use it yet, but it may speed up the border.": "Sudáfrica está implantando una Autorización Electrónica de Viaje; quienes están exentos no están obligados a usarla todavía, pero puede agilizar la frontera.",
    "You cannot take paid work in South Africa as a visitor.": "No puedes trabajar de forma remunerada en Sudáfrica como visitante.",
    "You may be asked for proof of funds, accommodation and a return ticket.": "Puede que te pidan prueba de fondos, alojamiento y billete de vuelta.",
    "The UK does not offer a digital nomad visa.": "El Reino Unido no ofrece visa de nómada digital.",
    "Since 2024 the visitor rules do allow you to work remotely for your employer abroad while you are in the UK, as long as remote working is not the main reason for your visit.": "Desde 2024 las normas de visitante sí permiten trabajar en remoto para tu empleador de fuera mientras estás en el Reino Unido, siempre que el trabajo remoto no sea el motivo principal de tu visita.",
    "A Standard Visitor stay is up to 6 months, and you cannot take a job with a UK employer or live in the UK through repeated visits.": "La estancia como Standard Visitor es de hasta 6 meses, y no puedes emplearte con una empresa británica ni vivir en el Reino Unido a base de visitas repetidas.",
    /* Fase 3 — turismo de México: entrada sin visa + visa consular (v1.89.0) */
    "Your passport nationality is not on Mexico's no-visa list, but a valid visa or permanent residence of the US, Canada, Japan, the UK or a Schengen country also lets you enter as a visitor without a Mexican visa.": "Tu nacionalidad de pasaporte no está en la lista de países sin visa de México, pero una visa vigente o residencia permanente de EE.UU., Canadá, Japón, Reino Unido o un país Schengen también te permite entrar como visitante sin visa mexicana.",
    "The days you are given are decided at the border and recorded in your entry record, and they can be fewer than the maximum.": "Los días que te conceden se deciden en la frontera y quedan anotados en tu registro de entrada, y pueden ser menos que el máximo.",
    "Mexico's visitor visa without permission to carry out paid activities is the consular route when you are not on the no-visa list.": "La visa de visitante sin permiso para realizar actividades remuneradas de México es la vía consular cuando no estás en la lista de países sin visa.",
    "It is applied for in person at a Mexican consulate, with an appointment, and the consulate decides after an interview.": "Se solicita en persona en un consulado mexicano, con cita previa, y el consulado decide tras una entrevista.",
    "Consulates usually ask for proof of economic solvency, employment or studies, and ties to your country of residence.": "Los consulados suelen pedir prueba de solvencia económica, de empleo o estudios, y de arraigo en tu país de residencia.",
    "Once granted, it is normally a multiple-entry visa, and each visitor stay still cannot exceed 180 days.": "Una vez concedida, suele ser una visa de entradas múltiples, y cada estancia de visitante sigue sin poder superar los 180 días.",
    /* Fase 3 — turismo de Tailandia: exención + Tourist Visa TR (v1.88.0) */
    "Your passport nationality does not appear on Thailand's visa exemption list, so you would need a visa before travelling.": "Tu nacionalidad de pasaporte no aparece en la lista de exención de visado de Tailandia, así que necesitarías una visa antes de viajar.",
    "Thailand's Tourist Visa (TR) is applied for before you travel and allows a 60-day stay, which an immigration office can extend once by 30 days.": "La Tourist Visa (TR) de Tailandia se solicita antes de viajar y permite una estancia de 60 días, que una oficina de inmigración puede prorrogar una vez por 30 días más.",
    "There is a single-entry version and a multiple-entry version valid for 6 months, with each stay of up to 60 days.": "Existe una versión de entrada única y otra de entradas múltiples válida 6 meses, con estancias de hasta 60 días cada una.",
    "It is applied for through Thailand's official e-Visa portal or a Royal Thai embassy or consulate, and the multiple-entry version asks for higher proof of funds.": "Se solicita en el portal oficial de e-Visa de Tailandia o en una embajada o consulado tailandés, y la versión de entradas múltiples exige demostrar más fondos.",
    "You cannot work in Thailand on a tourist visa; paid activities are not allowed.": "No puedes trabajar en Tailandia con una visa de turista; las actividades remuneradas no están permitidas.",
    /* Fase 3 — turismo de Vietnam y Georgia por visa concreta (v1.87.0) */
    "Your passport nationality appears on Vietnam's unilateral visa exemption list: tourist stays of up to 45 days without a visa.": "Tu nacionalidad de pasaporte aparece en la lista de exención unilateral de visado de Vietnam: estancias turísticas de hasta 45 días sin visado.",
    "Your passport nationality has a bilateral visa exemption agreement with Vietnam; the length of stay follows that agreement.": "Tu nacionalidad de pasaporte tiene un acuerdo bilateral de exención de visado con Vietnam; la duración de la estancia depende de ese acuerdo.",
    "The exemption covers tourism only: you cannot take paid work during a visa-free stay.": "La exención cubre solo el turismo: no puedes trabajar de forma remunerada durante una estancia sin visado.",
    "Vietnam has been extending visa exemption to further nationalities on a temporary basis — check the current official list before booking.": "Vietnam viene ampliando la exención de visado a más nacionalidades de forma temporal — consulta la lista oficial vigente antes de reservar.",
    "Vietnam's e-visa is open to citizens of all countries and territories, for stays of up to 90 days with multiple entries.": "La e-visa de Vietnam está abierta a los ciudadanos de todos los países y territorios, para estancias de hasta 90 días con entradas múltiples.",
    "It is applied for online through Vietnam's official immigration e-visa portal before travelling, and you can only enter through the designated ports of entry.": "Se solicita online en el portal oficial de e-visa de inmigración de Vietnam antes de viajar, y solo puedes entrar por los puestos fronterizos designados.",
    "You cannot take paid work in Vietnam on a tourist e-visa.": "No puedes trabajar de forma remunerada en Vietnam con una e-visa de turismo.",
    "Your passport nationality appears on Georgia's visa-free list: you can enter and stay for up to 1 year without a visa.": "Tu nacionalidad de pasaporte aparece en la lista de entrada sin visado de Georgia: puedes entrar y quedarte hasta 1 año sin visado.",
    "Your passport nationality can enter Georgia without a visa, but for a shorter period than the full year — check the official list.": "Tu nacionalidad de pasaporte puede entrar en Georgia sin visado, pero por un periodo más corto que el año completo — consulta la lista oficial.",
    "Your passport nationality does not appear on Georgia's visa-free list; the e-Visa is the usual route.": "Tu nacionalidad de pasaporte no aparece en la lista de entrada sin visado de Georgia; la e-Visa es la vía habitual.",
    "Holding a valid visa or residence permit from certain countries can also open visa-free entry — check the official conditions.": "Tener un visado o permiso de residencia válido de ciertos países también puede abrir la entrada sin visado — consulta las condiciones oficiales.",
    "The visa-free stay covers visiting; if you want to settle you must apply for a residence permit before it runs out.": "La estancia sin visado cubre la visita; si quieres establecerte debes solicitar un permiso de residencia antes de que se agote.",
    "Georgia's e-Visa is applied for online and covers short visits for nationalities that are not exempt for a full year.": "La e-Visa de Georgia se solicita online y cubre visitas cortas para las nacionalidades que no tienen la exención de un año.",
    "Depending on your nationality, the e-Visa allows 30 days within a 120-day period or 90 days within a 180-day period.": "Según tu nacionalidad, la e-Visa permite 30 días dentro de un periodo de 120 días o 90 días dentro de un periodo de 180 días.",
    "It is an ordinary (category C) short-stay visa: you cannot use it to work for a Georgian employer.": "Es un visado ordinario de corta estancia (categoría C): no puedes usarlo para trabajar para un empleador georgiano.",
    /* Fase 3 — estudios ES corta/larga y PT temporária/D4 (v1.86.0) */
    "This authorisation covers stays of more than 90 days for higher or post-compulsory secondary studies.": "Esta autorización cubre estancias de más de 90 días para estudios superiores o de educación secundaria postobligatoria.",
    "Spain's short-term study visa covers courses of 91 to 180 days.": "El visado de estudios de corta duración de España cubre cursos de 91 a 180 días.",
    "For programmes of a year or longer you apply for the D4 study visa leading to a residence permit.": "Para programas de un año o más se solicita el visado de estudios D4, que conduce a permiso de residencia.",
    "Portugal's temporary stay visa covers study programmes of up to one year.": "El visado de estada temporária de Portugal cubre programas de estudios de hasta un año.",
    /* Fase 3 — desdoble EE.UU. (v1.85.0) */
    "The full B-1/B-2 visitor visa is available to any nationality.": "La visa de visitante B-1/B-2 completa está disponible para cualquier nacionalidad.",
    /* Fase 3 — desdobles GB y CA (v1.84.0) */
    "The full Standard Visitor visa is available to any nationality.": "La Standard Visitor visa completa está disponible para cualquier nacionalidad.",
    "Canada's full visitor visa (TRV) is available to any nationality.": "La visitor visa completa de Canadá (TRV) está disponible para cualquier nacionalidad.",
    /* Fase 3 — desdoble del turismo de NZ (v1.83.0) */
    "New Zealand's full Visitor Visa is available to any nationality.": "La Visitor Visa completa de Nueva Zelanda está disponible para cualquier nacionalidad.",
    /* Fase 3 — desdoble del turismo de Australia (v1.82.0) */
    "The full Visitor visa (subclass 600) is available to any nationality.": "La Visitor visa completa (subclase 600) está disponible para cualquier nacionalidad.",
    /* Fase 2 — dos turismos de Indonesia (v1.81.0, nivel modelado) */
    "Indonesia's Visa on Arrival allows a 30-day tourist stay and can be extended once for another 30 days.": "La Visa on Arrival de Indonesia permite una estancia turística de 30 días, prorrogable una vez por otros 30.",
    "Available to nationals of the countries on Indonesia's VOA list — check the official list; it can also be applied for online as an e-VOA before travel.": "Disponible para nacionales de los países de la lista VOA de Indonesia — consulta la lista oficial; también puede solicitarse online como e-VOA antes de viajar.",
    "Indonesia's tourist visit visa allows stays of up to 60 days, with possible extensions in-country.": "La visa de visita turística de Indonesia permite estancias de hasta 60 días, con posibles prórrogas dentro del país.",
    "Applied for online via Indonesia's official e-visa portal before travel, with proof of funds and onward travel.": "Se solicita online en el portal oficial de e-visa de Indonesia antes de viajar, con prueba de fondos y billete de salida.",
    /* Tailandia DTV + Emiratos Virtual Work auditadas (v1.77.0) */
    "Thailand's DTV (Workcation) covers digital nomads, remote workers, foreign talent and freelancers.": "La DTV de Tailandia (modalidad Workcation) cubre a nómadas digitales, trabajadores remotos, talento extranjero y freelancers.",
    "A DTV track also exists for Thai soft power activities such as Muaythai, Thai culinary training and medical treatment.": "También existe una vía DTV para actividades de «soft power» tailandés como Muaythai, formación de cocina tailandesa y tratamiento médico.",
    "You appear to meet the funds requirement: a bank statement for the last 3 months with an ending balance of no less than 500,000 THB.": "Pareces cumplir el requisito de fondos: extracto bancario de los últimos 3 meses con saldo final no inferior a 500.000 THB.",
    "You need a bank statement for the last 3 months with an ending balance of no less than 500,000 THB.": "Necesitas un extracto bancario de los últimos 3 meses con saldo final no inferior a 500.000 THB.",
    "You must show proof of salary or monthly income for the last 6 months, plus an employment contract or certificate authenticated by an embassy.": "Debes demostrar salario o ingresos mensuales de los últimos 6 meses, más contrato o certificado de empleo autenticado por una embajada.",
    "Proof of prolonged residence in Thailand for at least 6 months (such as a rental agreement) is required.": "Se exige prueba de residencia prolongada en Tailandia de al menos 6 meses (por ejemplo, un contrato de alquiler).",
    "Your passport must be valid within 6 months from the travel date.": "Tu pasaporte debe tener vigencia de 6 meses desde la fecha de viaje.",
    "Approval is always a prerogative of the Thai authorities. Simulated guidance only.": "La aprobación es siempre potestad de las autoridades tailandesas. Orientación simulada.",
    "Approval is always a prerogative of the Thai authorities.": "La aprobación es siempre potestad de las autoridades tailandesas. Orientación simulada.",
    "The UAE virtual work visa lets you live in the UAE while working for a company outside the UAE.": "La visa de trabajo virtual de EAU te permite vivir en Emiratos trabajando para una empresa de fuera de EAU.",
    "It is a one-year visa under self-sponsorship.": "Es una visa de un año con auto-patrocinio.",
    "You need a salary certificate of a minimum of 3,500 US dollars per month (or equivalent).": "Necesitas un certificado de salario de mínimo 3.500 dólares estadounidenses al mes (o equivalente).",
    "You must provide a copy of health insurance and a medical fitness test result.": "Debes aportar copia del seguro de salud y el resultado de una prueba médica de aptitud.",
    "Applications go to the federal ICP or to GDRFA Dubai.": "Las solicitudes se presentan ante el ICP federal o ante la GDRFA de Dubái.",
    "Approval is always a prerogative of the UAE authorities. Simulated guidance only.": "La aprobación es siempre potestad de las autoridades emiratíes. Orientación simulada.",
    "Approval is always a prerogative of the UAE authorities.": "La aprobación es siempre potestad de las autoridades emiratíes. Orientación simulada.",
    /* Indonesia auditada (v1.75.0) — E33G Remote Worker */
    "Indonesia's E33G Remote Worker visa lets you live in Indonesia while working for a company established outside Indonesia.": "La visa E33G Remote Worker de Indonesia te permite vivir en Indonesia trabajando para una empresa establecida fuera de Indonesia.",
    "Stays of 1 year; the stay permit can be extended online, and no Indonesian sponsor is required.": "Estancia de 1 año; el permiso puede prorrogarse online y no se necesita sponsor indonesio.",
    "You appear to meet the living-funds requirement: a bank statement for the last 3 months with at least USD $2,000.": "Pareces cumplir el requisito de fondos de vida: extracto bancario de los últimos 3 meses con al menos USD $2.000.",
    "You must show living funds: a bank statement for the last 3 months with at least USD $2,000.": "Debes demostrar fondos de vida: extracto bancario de los últimos 3 meses con al menos USD $2.000.",
    "Bank records must show salary or income of at least US$60,000 per year, plus an employment agreement with the foreign company.": "Los extractos deben demostrar salario o ingresos de al menos US$60.000 al año, más el contrato de trabajo con la empresa extranjera.",
    "The visa fee (PNBP) is Rp 7,000,000 for the 1-year stay, plus other components.": "La tasa de la visa (PNBP) es de Rp 7.000.000 para la estancia de 1 año, más otros componentes.",
    "Your passport must be valid for at least 6 months.": "Tu pasaporte debe tener una vigencia mínima de 6 meses.",
    "Approval is always a prerogative of the Indonesian State. Simulated guidance only.": "La aprobación es siempre potestad del Estado indonesio. Orientación simulada.",
    "Approval is always a prerogative of the Indonesian State.": "La aprobación es siempre potestad del Estado indonesio. Orientación simulada.",
    /* Uruguay auditado (v1.74.0) — Residencia Legal Permanente Mercosur */
    "Uruguay's Permanente Mercosur grants DIRECT permanent legal residence to nationals of Mercosur member and associated states.": "La Permanente Mercosur de Uruguay concede residencia legal permanente DIRECTA a los nacionales de países parte y asociados del Mercosur.",
    "Uruguay's official list covers Argentina, Brazil, Chile, Bolivia, Paraguay, Peru, Ecuador, Colombia and Venezuela (plus Suriname and Guyana).": "La lista oficial de Uruguay cubre Argentina, Brasil, Chile, Bolivia, Paraguay, Perú, Ecuador, Colombia y Venezuela (más Surinam y Guyana).",
    "With the residence you can work and carry out any lawful activity.": "Con la residencia puedes trabajar y ejercer toda actividad lícita.",
    "A Temporaria Mercosur also exists for stays of up to 2 years, extendable for the same period.": "También existe la Temporaria Mercosur para estancias de hasta 2 años, prorrogable por el mismo plazo.",
    "You will need an ID document, a criminal record certificate from the country where you lived the last 5 years, and a vaccination certificate meeting Uruguay's official schedule.": "Necesitarás documento de identidad, certificado de antecedentes penales del país donde residiste los últimos 5 años y certificado de vacunas conforme al esquema oficial uruguayo.",
    "Approval is always a prerogative of the Uruguayan State. Simulated guidance only.": "La aprobación es siempre potestad del Estado uruguayo. Orientación simulada.",
    "Approval is always a prerogative of the Uruguayan State.": "La aprobación es siempre potestad del Estado uruguayo. Orientación simulada.",
    /* Colombia auditada (v1.73.0) — Migrante M Mercosur + Nómada Digital V */
    "Colombia's Migrante (M) Mercosur visa applies the regional Residence Agreement and is equivalent to the temporary resident visa under that instrument.": "La visa de Migrante (M) Mercosur de Colombia aplica el Acuerdo de Residencia regional y equivale a la visa de Residente Temporal establecida en dicho instrumento.",
    "Under the agreement you get temporary residence without needing to prove the activity you will carry out, with the right to work and carry out any lawful activity.": "Bajo el acuerdo obtienes residencia temporaria sin necesidad de acreditar la actividad que vas a desarrollar, con derecho a trabajar y ejercer toda actividad lícita.",
    "Time as a Migrante (M) holder counts towards Colombia's Resident (R) visa after a minimum stay of 2 years.": "El tiempo como titular de la visa Migrante (M) acumula para la visa de Residente (R) de Colombia tras una permanencia mínima de 2 años.",
    "You will need a request letter explaining your activity in Colombia and your means of subsistence, a passport valid for at least six (6) months, and a criminal record certificate covering the last three (3) years.": "Necesitarás una carta de solicitud explicando tu actividad en Colombia y tus medios de subsistencia, pasaporte con vigencia mínima de seis (6) meses y certificado de antecedentes de los últimos tres (3) años.",
    "Approval is always a prerogative of the Colombian State. Simulated guidance only.": "La aprobación es siempre potestad del Estado colombiano. Orientación simulada.",
    "Approval is always a prerogative of the Colombian State.": "La aprobación es siempre potestad del Estado colombiano. Orientación simulada.",
    "Colombia's Digital Nomad (V) visa is for remote work or teleworking from Colombia over digital media, exclusively for foreign companies, or for starting a digital-content or IT venture.": "La visa de Nómada Digital (V) de Colombia es para prestar trabajo remoto o teletrabajo desde Colombia por medios digitales, exclusivamente para empresas extranjeras, o para iniciar un emprendimiento digital o de tecnologías de la información.",
    "Your passport nationality appears to be on Colombia's short-stay visa exemption list, a requirement for this visa.": "Tu nacionalidad de pasaporte parece estar en la lista de exención de visa de corta estancia de Colombia, requisito de esta visa.",
    "This visa requires a passport from a country exempt from Colombia's short-stay visa (per the current Resolución); your nationality appears to need one — check the official list.": "Esta visa exige pasaporte de un país exento de la visa de corta estancia de Colombia (según la Resolución vigente); tu nacionalidad parece necesitarla — consulta la lista oficial.",
    "Stays are allowed for up to two (2) years.": "La vigencia es de hasta dos (2) años.",
    "Bank statements must show minimum income equivalent to three (3) Colombian legal monthly minimum wages (SMLMV) over the last 3 months.": "Los extractos bancarios deben demostrar ingresos mínimos equivalentes a tres (3) Salarios Mínimos Legales Mensuales Vigentes (SMLMV) durante los últimos 3 meses.",
    "You need a health policy with full coverage in Colombia for the whole planned stay.": "Necesitas una póliza de salud con cobertura total en Colombia durante toda la permanencia prevista.",
    "You will need a letter from the foreign company (or a contract, or proof of company partnership); entrepreneurs present a motivation letter for their venture.": "Necesitarás una carta de la empresa extranjera (o el contrato, o prueba de ser socio de la empresa); los emprendedores presentan una carta motivacional de su proyecto.",
    /* Nómada digital honesto VN/LK (v1.72.0) */
    "Vietnam does not currently offer a dedicated Digital Nomad visa.": "Vietnam no ofrece por ahora una visa de nómada digital dedicada.",
    "Remote workers commonly use the 90-day tourist e-visa; longer stays require another visa type.": "Quienes trabajan en remoto suelen usar la e-visa de turista de 90 días; estancias más largas requieren otro tipo de visa.",
    "Sri Lanka does not currently offer a dedicated Digital Nomad visa.": "Sri Lanka no ofrece por ahora una visa de nómada digital dedicada.",
    "Remote workers commonly use the extendable tourist visa (ETA).": "Quienes trabajan en remoto suelen usar la visa de turista prorrogable (ETA).",
    /* Nómada digital honesto CL/GE (v1.71.0) */
    "Proof of regular income may support a visitor application.": "Acreditar ingresos regulares puede reforzar una solicitud de visitante.",
    "Your profile indicates remote work, which is the main factor for nomad-style stays.": "Tu perfil indica trabajo remoto, el factor principal para estancias de tipo nómada.",
    "Your profile indicates remote work, which is the main qualifying factor.": "Tu perfil indica trabajo remoto, el principal factor de elegibilidad.",
    "Chile does not currently offer a dedicated Digital Nomad visa.": "Chile no ofrece por ahora una visa de nómada digital dedicada.",
    "Remote workers commonly stay under the visitor permit (up to 90 days); longer stays require a residence visa.": "Quienes trabajan en remoto suelen usar el permiso de visitante (hasta 90 días); estancias más largas requieren una visa de residencia.",
    "Georgia does not currently offer a dedicated Digital Nomad visa.": "Georgia no ofrece por ahora una visa de nómada digital dedicada.",
    "Citizens of many countries can stay in Georgia visa-free for a full year, which remote workers commonly use.": "Los ciudadanos de muchos países pueden permanecer en Georgia un año entero sin visado, opción habitual entre quienes trabajan en remoto.",
    /* Mercosur (v1.68.0) */
    "Mercosur Residence Agreement: citizens of member and associated countries can apply for temporary residence with the right to work, without needing a job offer.": "Acuerdo de Residencia de Mercosur: los ciudadanos de países miembros y asociados pueden solicitar la residencia temporal con derecho a trabajar, sin necesidad de oferta de empleo.",
    /* v1.154.0 — la tarjeta del Mercosur, ya con el texto del tratado detrás */
    "Mercosur Residence Agreement: nationals of one State Party who wish to reside in another can obtain legal residence by proving their nationality, without needing a job offer.":
      "Acuerdo de Residencia del Mercosur: los nacionales de un Estado Parte que quieran residir en otro pueden obtener residencia legal acreditando su nacionalidad, sin necesidad de oferta de empleo.",
    "Temporary residence is granted for up to two years.":
      "La residencia temporaria se concede por hasta dos años.",
    "Once you hold it you can take up any activity, employed or self-employed, on the same conditions as nationals of the receiving country.":
      "Una vez la tienes, puedes ejercer cualquier actividad, por cuenta propia o ajena, en las mismas condiciones que los nacionales del país de recepción.",
    "If you hold your nationality by naturalisation rather than by birth, you only count as a national of a State Party once you have held it for five years.":
      "Si tienes la nacionalidad por naturalización y no de origen, solo cuentas como nacional de un Estado Parte cuando la ostentas desde hace cinco años.",
    "You need a valid passport, identity card or certificate of nationality, plus a birth certificate and proof of civil status.":
      "Necesitas pasaporte vigente, cédula de identidad o certificado de nacionalidad, además de partida de nacimiento y comprobación de estado civil.",
    "You need a certificate of no criminal record from your country of origin and from any country where you lived in the five years before applying.":
      "Necesitas certificado de carencia de antecedentes de tu país de origen y de cualquier país donde hayas residido en los cinco años anteriores.",
    "On labour law, and especially on pay, working conditions and social insurance, you must be treated no less favourably than nationals of the receiving country.":
      "En materia laboral, y especialmente en remuneraciones, condiciones de trabajo y seguros sociales, deben darte un trato no menos favorable que a los nacionales del país de recepción.",
    "To turn temporary residence into permanent you must apply within the ninety days before it expires, and prove lawful means of subsistence for yourself and your family.":
      "Para convertir la residencia temporaria en permanente debes solicitarlo dentro de los noventa días anteriores a su vencimiento, y acreditar medios de vida lícitos para ti y tu familia.",
    "Wayfare has captured the original agreement between the States Parties (Argentina, Brazil, Paraguay and Uruguay). The extension to associated countries rests on separate instruments that are not yet captured here, so treat this route as guidance and confirm it with the destination's migration service.":
      "Wayfare ha capturado el acuerdo original entre los Estados Partes (Argentina, Brasil, Paraguay y Uruguay). La extensión a los países asociados descansa en instrumentos aparte que aquí todavía no están capturados, así que toma esta vía como orientación y confírmala con el servicio de migraciones del destino.",
    "After two years of temporary residence you can usually apply for permanent residence.": "Tras dos años de residencia temporal, normalmente puedes solicitar la residencia permanente.",
    "You will need a valid passport or ID and a clean criminal record certificate.": "Necesitarás pasaporte o documento de identidad vigente y certificado de antecedentes penales limpio.",
    "Modelled from the regional agreement; each country applies its own procedure and fees. Not yet audited against this destination's official sources.": "Modelado a partir del acuerdo regional; cada país aplica su propio procedimiento y tasas. Aún no auditado contra las fuentes oficiales de este destino.",
    "Your passport nationality is generally accepted for student visa applications in this destination.": "Tu nacionalidad de pasaporte es generalmente aceptada para solicitudes de visa de estudiante en este destino.",
    "EU/EEA citizens face minimal visa barriers for studying in this destination.": "Los ciudadanos UE/EEE tienen barreras de visado mínimas para estudiar en este destino.",
    "You may need to show sufficient funds for tuition and living costs. Check official student visa requirements for this destination.": "Puede que necesites demostrar fondos suficientes para matrícula y manutención. Consulta los requisitos oficiales de la visa de estudiante de este destino.",
    "Enrollment acceptance from a recognised institution is required. National requirements have not been verified by Wayfare yet - simulated guidance only.": "Se requiere aceptación de matrícula de una institución reconocida. Los requisitos nacionales aún no han sido verificados por Wayfare - solo orientación simulada.",
    "Working holiday availability for this destination depends on bilateral agreements and has not been verified by Wayfare yet. Check the official sources of this country.": "La disponibilidad de working holiday en este destino depende de acuerdos bilaterales y aún no ha sido verificada por Wayfare. Consulta las fuentes oficiales de este país.",
    "As an EU/EEA citizen, you can live and work in this destination under freedom of movement.": "Como ciudadano UE/EEE, puedes vivir y trabajar en este destino por libre circulación.",
    "Digital nomad or remote-work permits require active remote work for a foreign employer or clients.": "Los permisos de nómada digital o trabajo remoto requieren trabajo remoto activo para un empleador o clientes extranjeros.",
    "Several European countries offer national digital nomad or remote-work permits; provisions vary by country and have not been verified for this destination yet. Check official national sources.": "Varios países europeos ofrecen permisos nacionales de nómada digital o trabajo remoto; varían por país y aún no han sido verificados para este destino. Consulta las fuentes oficiales nacionales.",
    "You may need to show sufficient funds. Check official work visa requirements for this destination.": "Puede que necesites demostrar fondos suficientes. Consulta los requisitos oficiales de la visa de trabajo de este destino.",

    /* ── Tanda 2 Europa: DE/FR WHV + Irlanda (v1.20.0) ── */
    "Germany's working holiday programmes appear limited to: Argentina, Australia, Brazil, Chile, Hong Kong, Israel, Japan, South Korea, New Zealand, Taiwan and Uruguay.": "Los programas working holiday de Alemania parecen limitados a: Argentina, Australia, Brasil, Chile, Hong Kong, Israel, Japón, Corea del Sur, Nueva Zelanda, Taiwán y Uruguay.",
    "Your passport nationality has a working holiday programme with Germany.": "Tu nacionalidad de pasaporte tiene un programa working holiday con Alemania.",
    "The programme allows stays of up to 12 months; holiday jobs may be accepted to help finance the stay.": "El programa permite estancias de hasta 12 meses; se pueden aceptar trabajos vacacionales para ayudar a financiar la estancia.",
    "You may need to show sufficient funds for your stay. Check with the German mission in your country.": "Puede que necesites demostrar fondos suficientes para tu estancia. Consulta con la misión alemana de tu país.",
    "Work allowances vary by nationality (e.g., limits on months worked or per employer). Verify current conditions with the German mission. Simulated guidance only.": "Los permisos de trabajo varían por nacionalidad (p. ej. límites de meses trabajados o por empleador). Verifica las condiciones vigentes con la misión alemana. Solo orientación simulada.",
    "Work allowances vary by nationality (e.g., limits on months worked or per employer). Verify current conditions with the German mission.": "Los permisos de trabajo varían por nacionalidad (p. ej. límites de meses trabajados o por empleador). Verifica las condiciones vigentes con la misión alemana.",
    "France's working holiday agreements appear limited to 16 countries/territories, including Argentina, Brazil, Chile, Colombia, Ecuador, Mexico, Peru and Uruguay.": "Los acuerdos working holiday de Francia parecen limitados a 16 países/territorios, incluidos Argentina, Brasil, Chile, Colombia, Ecuador, México, Perú y Uruguay.",
    "Your passport nationality has a working holiday agreement with France.": "Tu nacionalidad de pasaporte tiene un acuerdo working holiday con Francia.",
    "The main purpose of the stay must be tourist and cultural discovery of France; work is complementary.": "El propósito principal de la estancia debe ser el descubrimiento turístico y cultural de Francia; el trabajo es complementario.",
    "You must meet the funds level set by your country's agreement. Check france-visas.gouv.fr.": "Debes cumplir el nivel de fondos fijado por el acuerdo de tu país. Consulta france-visas.gouv.fr.",
    "Apply at the competent visa centre in your country of nationality. Simulated guidance only.": "Solicita en el centro de visados competente de tu país de nacionalidad. Solo orientación simulada.",
    "Apply at the competent visa centre in your country of nationality.": "Solicita en el centro de visados competente de tu país de nacionalidad.",
    "For your nationality the application must be lodged on or before your 30th birthday, not during your 30th year.": "Para tu nacionalidad la solicitud debe presentarse el día de tu 30º cumpleaños o antes, no durante tu año 30.",
    "Your age appears to be within the eligible range for this visa (18 to 35).": "Tu edad parece estar dentro del rango elegible para esta visa (18 a 35).",
    "Ireland is not part of the Schengen area and applies its own entry rules. Check official Irish sources for your nationality.": "Irlanda no forma parte del espacio Schengen y aplica sus propias reglas de entrada. Consulta las fuentes oficiales irlandesas para tu nacionalidad.",
    "Ireland's Working Holiday Authorisation appears limited to: Andorra, Argentina, Australia, Canada, Chile, Hong Kong, Japan, New Zealand, South Korea, Taiwan and the USA.": "La Working Holiday Authorisation de Irlanda parece limitada a: Andorra, Argentina, Australia, Canadá, Chile, Hong Kong, Japón, Nueva Zelanda, Corea del Sur, Taiwán y EE.UU.",
    "Your passport nationality has a Working Holiday Authorisation agreement with Ireland.": "Tu nacionalidad de pasaporte tiene un acuerdo de Working Holiday Authorisation con Irlanda.",
    "Age limits and annual quotas vary by country (e.g., 18-30 or 18-35) - check the Department of Foreign Affairs before applying.": "Los límites de edad y los cupos anuales varían por país (p. ej. 18-30 o 18-35) - consulta el Department of Foreign Affairs antes de aplicar.",
    "Places are limited and you cannot apply if you are already in Ireland.": "Las plazas son limitadas y no puedes solicitar si ya estás en Irlanda.",
    "Applications are made through the Department of Foreign Affairs. Simulated guidance only.": "Las solicitudes se hacen a través del Department of Foreign Affairs. Solo orientación simulada.",
    "Applications are made through the Department of Foreign Affairs.": "Las solicitudes se hacen a través del Department of Foreign Affairs.",
    "You may need to show sufficient funds for your stay.": "Puede que necesites demostrar fondos suficientes para tu estancia.",
    "A visa may be required depending on bilateral agreements.": "Puede requerirse una visa según los acuerdos bilaterales.",
    sa_eu_freedom: "Libre circulación: como ciudadano UE/EEE puedes viajar, vivir, trabajar y estudiar en este país sin visado.",
    sa_trans_tasman: "Acuerdo Trans-Tasman: los ciudadanos de Australia y Nueva Zelanda pueden visitar, vivir y trabajar en el país del otro sin solicitar visa por adelantado. Verifica las condiciones en fuentes oficiales.",
    sa_cta: "Common Travel Area: los ciudadanos británicos e irlandeses pueden vivir, trabajar y estudiar en el país del otro sin visado.",
    "You may need to show sufficient funds for your stay. Check the official visa requirements for this destination.": "Puede que necesites demostrar fondos suficientes para tu estancia. Consulta los requisitos oficiales de visado de este destino.",

    /* ── Listas oficiales de exención (v1.24.0, idea #20) ── */
    "Australian citizens do not need a visa or NZeTA to visit New Zealand.": "Los ciudadanos australianos no necesitan visa ni NZeTA para visitar Nueva Zelanda.",
    "Your passport nationality is on New Zealand's visa waiver list: you do not need a visitor visa, but you must request an NZeTA (Electronic Travel Authority) before travelling.": "Tu nacionalidad de pasaporte está en la lista de exención de visado de Nueva Zelanda: no necesitas visa de visitante, pero debes solicitar una NZeTA (autorización electrónica de viaje) antes de viajar.",
    "Your passport nationality is not on New Zealand's visa waiver list: you need a visitor visa before travelling.": "Tu nacionalidad de pasaporte no está en la lista de exención de Nueva Zelanda: necesitas una visa de visitante antes de viajar.",
    "Your nationality is on the UK visa national list: you must obtain a Standard Visitor visa before you travel.": "Tu nacionalidad está en la lista de países con visado del Reino Unido: debes obtener una Standard Visitor visa antes de viajar.",
    "Your nationality is not on the UK visa national list: you can usually visit for up to 6 months without a visitor visa, but you may need an Electronic Travel Authorisation (ETA).": "Tu nacionalidad no está en la lista de países con visado del Reino Unido: normalmente puedes visitar hasta 6 meses sin visa de visitante, aunque puede que necesites una ETA (autorización electrónica de viaje).",
    "US citizens do not need a visa or an eTA to visit Canada.": "Los ciudadanos estadounidenses no necesitan visa ni eTA para visitar Canadá.",
    "Your passport nationality is visa-exempt for Canada: you need an eTA (Electronic Travel Authorization) to fly, not a visitor visa.": "Tu nacionalidad de pasaporte está exenta de visado para Canadá: necesitas una eTA (autorización electrónica de viaje) para volar, no una visa de visitante.",
    "Canada requires a visitor visa for your nationality, but you may be eligible for an eTA instead if you travel by air and have held a Canadian visa in the last 10 years or hold a valid US visa.": "Canadá exige visa de visitante para tu nacionalidad, pero puedes optar a una eTA en su lugar si viajas por aire y has tenido una visa canadiense en los últimos 10 años o tienes una visa de EE.UU. vigente.",

    /* ── Australia turista: listas oficiales eVisitor/ETA (v1.25.0, idea #20) ── */
    "New Zealand citizens can usually enter Australia under the Trans-Tasman Travel Arrangement (Special Category visa granted on arrival).": "Los ciudadanos neozelandeses normalmente pueden entrar en Australia bajo el acuerdo Trans-Tasman (Special Category visa concedida a la llegada).",
    "As a New Zealand citizen you are usually granted the Special Category visa (subclass 444) on arrival under the Trans-Tasman arrangement - it is free and lets you visit, study and work in Australia.": "Como ciudadano neozelandés normalmente recibes la Special Category visa (subclase 444) a la llegada bajo el acuerdo Trans-Tasman: es gratuita y te permite visitar, estudiar y trabajar en Australia.",
    "The F-1-D workation visa was officially launched on 30 June 2026: income thresholds range from about 1 to 2 times Korea's GNI per capita depending on age and region, and private health insurance is required.": "La visa workation F-1-D se oficializó el 30 de junio de 2026: los umbrales de ingresos van de aproximadamente 1 a 2 veces el PIB per cápita (GNI) de Corea según edad y región, y se exige seguro médico privado.",
    "Your passport nationality appears to be on the eVisitor (subclass 651) eligible list: apply online for free and stay up to 3 months at a time.": "Tu nacionalidad de pasaporte parece estar en la lista elegible de la eVisitor (subclase 651): se solicita en línea gratis y permite estancias de hasta 3 meses cada vez.",
    "The eVisitor lets you visit as often as you wish in a 12-month period, staying up to 3 months each time you enter Australia.": "La eVisitor te permite visitar Australia tantas veces como quieras durante un periodo de 12 meses, con estancias de hasta 3 meses en cada entrada.",
    "Your passport nationality appears to be on the Electronic Travel Authority (subclass 601) eligible list: stays of up to 3 months at a time.": "Tu nacionalidad de pasaporte parece estar en la lista elegible de la Electronic Travel Authority (subclase 601): estancias de hasta 3 meses cada vez.",
    "You must apply for the ETA before travelling, normally through the Australian ETA app.": "Debes solicitar la ETA antes de viajar, normalmente a través de la app Australian ETA.",
    "Your passport nationality does not appear on the eVisitor or ETA eligible lists, so a full Visitor visa (subclass 600) application is likely required.": "Tu nacionalidad de pasaporte no aparece en las listas elegibles de la eVisitor ni de la ETA, así que probablemente necesites una solicitud completa de Visitor visa (subclase 600).",

    "In the Netherlands only the educational institution can apply for your student residence permit — you cannot apply yourself.":
      "En los Países Bajos el permiso de residencia de estudiante lo solicita el centro de estudios, no tú.",
    "For the highly skilled migrant route only an employer recognised by the IND can apply for your permit.":
      "En la vía de profesional altamente cualificado, el permiso lo solicita un empleador reconocido por el IND, no tú.",
    "The IND also publishes other work routes: European Blue Card, intra-corporate transfer, single permit (GVVA), orientation year, start-up and self-employed.":
      "El IND publica además otras vías de trabajo: Tarjeta Azul europea, traslado dentro de la empresa, permiso único (GVVA), año de orientación, start-up y autónomo.",
    "Always verify with the Immigration and Naturalisation Service (ind.nl).":
      "Confirma siempre en el Servicio de Inmigración y Naturalización (ind.nl).",

    "Germany issues the study residence permit under Section 16b of the Residence Act, which also covers language courses, preparatory courses and doctoral studies.":
      "Alemania emite el permiso de residencia de estudios por el artículo 16b de la Ley de Residencia, que cubre también cursos de idiomas, cursos preparatorios y doctorados.",
    "You can work up to 140 full days or 280 half days per year, or up to 20 hours per week, alongside your studies.":
      "Puedes trabajar hasta 140 días completos o 280 medios días al año, o hasta 20 horas por semana, mientras estudias.",
    "You must already have been admitted to a state-recognised German higher education institution before you apply.":
      "Tienes que estar ya admitido en un centro alemán de educación superior reconocido por el Estado antes de solicitarlo.",
    "Funds are proved with a blocked bank account (at least EUR 11,904 in 2026), a scholarship or a declaration of commitment.":
      "Los fondos se demuestran con una cuenta bloqueada (al menos 11.904 € en 2026), una beca o una declaración de compromiso.",
    "If you have not been admitted yet, Germany has a separate visa for seeking a place in higher education, valid for up to nine months.":
      "Si todavía no te han admitido, Alemania tiene una visa aparte para buscar plaza universitaria, válida hasta nueve meses.",
    "After graduating you can apply for an 18-month jobseeker residence permit to look for skilled employment.":
      "Al graduarte puedes pedir un permiso de residencia de 18 meses para buscar empleo cualificado.",
    "Always verify with Make it in Germany, the federal government portal (make-it-in-germany.com).":
      "Confirma siempre en Make it in Germany, el portal del Gobierno federal alemán (make-it-in-germany.com).",
    "Germany issues the qualified-employment residence permit under Sections 18a and 18b of the Residence Act.":
      "Alemania emite el permiso de residencia por empleo cualificado por los artículos 18a y 18b de la Ley de Residencia.",
    "Your job in Germany does not have to be related to your qualification.":
      "El puesto que ocupes en Alemania no tiene por qué estar relacionado con tu titulación.",
    "Your qualification must be recognised in Germany or comparable to a German academic qualification; regulated professions also need a licence to practise.":
      "Tu titulación tiene que estar reconocida en Alemania o ser equiparable a una titulación académica alemana; las profesiones reguladas necesitan además colegiación o habilitación.",
    "You need a specific job offer for a qualified position: auxiliary tasks are not enough.":
      "Necesitas una oferta concreta para un puesto cualificado: las tareas auxiliares no sirven.",
    "As a rule the Federal Employment Agency must approve your employment before the permit is issued.":
      "Por regla general, la Agencia Federal de Empleo tiene que aprobar tu contrato antes de que se emita el permiso.",
    "Coming to work in Germany for the first time above the age of 45 requires either a gross annual salary of at least EUR 55,770 (2026) or proof of adequate pension provision.":
      "Ir a trabajar a Alemania por primera vez con más de 45 años exige un salario bruto anual de al menos 55.770 € (2026) o demostrar una previsión de jubilación suficiente.",
    "EU/EEA citizens can live and work remotely from this destination under freedom of movement.":
      "Los ciudadanos de la UE/EEE pueden vivir y trabajar en remoto desde este destino por libre circulación.",
    "Germany does not publish a dedicated digital nomad visa.":
      "Alemania no publica una visa específica de nómada digital.",
    "The closest published route is the self-employment residence permit under Section 21 (5) of the Residence Act, for freelancers in the liberal professions.":
      "La vía publicada más cercana es el permiso de residencia por cuenta propia del artículo 21 (5) de la Ley de Residencia, para autónomos de profesiones liberales.",
    "You must prove sufficient funds to finance your projects and hold any licence the profession requires.":
      "Tienes que demostrar fondos suficientes para financiar tus proyectos y tener la licencia que exija la profesión.",
    "Above the age of 45 you must also prove adequate old-age pension provision.":
      "Por encima de 45 años tienes que demostrar además una previsión de jubilación suficiente.",
    "The self-employment residence permit is initially issued for up to three years.":
      "El permiso de residencia por cuenta propia se emite inicialmente para un máximo de tres años.",

    "Germany: no permit needed (EU/EEA freedom of movement)":
      "Alemania: no necesitas permiso (libre circulación UE/EEE).",

    "France issues a long-stay student visa for courses longer than three months, and a short-stay visa for courses of three months or less.":
      "Francia emite un visado de estudios de larga duración para cursos de más de tres meses, y uno de corta duración para tres meses o menos.",
    "You must be accepted by a higher education establishment and include its certificate of enrolment with your application.":
      "Tienes que estar admitido en un centro de educación superior y adjuntar su certificado de matrícula a la solicitud.",
    "Your nationality is on France's Etudes en France (EEF) list, so you must apply through that online procedure; the visa fee is EUR 50 instead of EUR 99.":
      "Tu nacionalidad está en la lista «Etudes en France» (EEF) de Francia, así que tienes que tramitarlo por ese procedimiento en línea; la tasa del visado es de 50 € en vez de 99 €.",
    "Your nationality is not on France's Etudes en France list, so you enrol directly with the establishment; the visa fee is EUR 99.":
      "Tu nacionalidad no está en la lista «Etudes en France» de Francia, así que te matriculas directamente en el centro; la tasa del visado es de 99 €.",
    "Foreign students are authorised to work 964 hours a year, 60% of normal working hours in France.":
      "Los estudiantes extranjeros pueden trabajar 964 horas al año, el 60 % de la jornada normal en Francia.",
    "Algerian nationals are limited to 50% of normal working hours in France instead of 60%.":
      "Los nacionales de Argelia están limitados al 50 % de la jornada normal en Francia, en vez del 60 %.",
    "France requires student visa applicants to be over 18 years of age.":
      "Francia exige tener más de 18 años para solicitar el visado de estudios.",
    "Always verify with France-Visas, the French government visa site (france-visas.gouv.fr).":
      "Confirma siempre en France-Visas, el sitio oficial de visados del Gobierno francés (france-visas.gouv.fr).",
    "France issues a long-stay visa equivalent to a residence permit of up to 12 months, marked 'salarie' for permanent contracts and 'travailleur temporaire' for fixed-term contracts.":
      "Francia emite un visado de larga duración equivalente a un permiso de residencia de hasta 12 meses, con la mención «salarié» para contratos indefinidos y «travailleur temporaire» para los temporales.",
    "Any employer wishing to recruit you in France must first request authorisation from the French authorities, and you submit that work permit with your visa application.":
      "Cualquier empleador que quiera contratarte en Francia tiene que pedir antes autorización a las autoridades francesas, y ese permiso de trabajo lo presentas tú con la solicitud de visado.",
    "Contracts of 90 days or less are exempt from the work permit for a closed list of activities: sporting, cultural, artistic or scientific events, conferences, seminars, trade fairs and a few others.":
      "Los contratos de 90 días o menos están exentos del permiso de trabajo en una lista cerrada de actividades: eventos deportivos, culturales, artísticos o científicos, congresos, seminarios, ferias y algunas más.",
    "You must validate the visa within three months of arriving in France.":
      "Tienes que validar el visado en los tres meses siguientes a tu llegada a Francia.",
    "France does not publish a dedicated digital nomad visa.":
      "Francia no publica una visa específica de nómada digital.",
    "The closest published route is the long-stay visa marked 'entrepreneur/profession liberale', valid for one year and validated within fifteen days of arrival.":
      "La vía publicada más cercana es el visado de larga duración con la mención «entrepreneur/profession libérale», válido un año y que se valida en los quince días siguientes a la llegada.",
    "For a liberal profession or an existing activity you must prove financial resources equivalent to the French full-time minimum wage.":
      "Para una profesión liberal o una actividad ya creada tienes que demostrar recursos económicos equivalentes al salario mínimo francés a jornada completa.",
    "If your activity contributes to France's economic attractiveness you can instead apply for the passeport-talent, granted for an initial four years.":
      "Si tu actividad contribuye al atractivo económico de Francia, puedes pedir en su lugar el «passeport-talent», concedido inicialmente por cuatro años.",
    "France: no permit needed (EU/EEA freedom of movement)":
      "Francia: no necesitas permiso (libre circulación UE/EEE).",

    "Italy requires a university pre-enrolment application through the Universitaly portal before you can apply for the study visa.":
      "Italia exige una preinscripción universitaria por el portal Universitaly antes de poder pedir el visado de estudios.",
    "Once in Italy you must apply for the residence permit within 8 working days of arrival: missing that window puts your stay at risk.":
      "Una vez en Italia tienes que pedir el permiso de residencia en los 8 días hábiles siguientes a tu llegada: si se te pasa ese plazo, tu estancia queda en el aire.",
    "The residence permit application costs around EUR 116 for stays of up to one year, and renewals must be filed at least 60 days before expiry.":
      "El permiso de residencia cuesta unos 116 € para estancias de hasta un año, y las renovaciones se piden al menos 60 días antes de que caduque.",
    "Always verify with Study in Italy, the Italian Ministry of Foreign Affairs portal (studyinitaly.esteri.it).":
      "Confirma siempre en Study in Italy, el portal del Ministerio de Asuntos Exteriores italiano (studyinitaly.esteri.it).",
    "Italy sets its non-EU work entries by decree: the 2026-2028 decreto flussi allows 497,550 entries in total, 164,850 of them in 2026.":
      "Italia fija por decreto las entradas por trabajo de extracomunitarios: el «decreto flussi» 2026-2028 permite 497.550 entradas en total, 164.850 de ellas en 2026.",
    "Entry for salaried work runs through an annual quota with fixed application dates: for the 2026 quota, non-seasonal applications opened on 16 and 18 February through the Interior Ministry's ALI portal.":
      "La entrada por trabajo por cuenta ajena va por cupo anual con fechas fijas: para el cupo de 2026, las solicitudes no estacionales se abrieron el 16 y el 18 de febrero en el portal ALI del Ministerio del Interior.",
    "Nationals of countries with a migration cooperation agreement with Italy apply two days earlier than everyone else, which matters when quotas run out.":
      "Los nacionales de países con acuerdo de cooperación migratoria con Italia solicitan dos días antes que el resto, y eso pesa cuando los cupos se agotan.",
    "Your employer files the request; you cannot apply on your own, and the forms must be pre-filled during the window set by the ministerial circular.":
      "La solicitud la presenta tu empleador, no tú, y los formularios hay que precumplimentarlos en el plazo que fija la circular ministerial.",
    "Quotas and dates are set anew by decree each year. Always verify with the Italian Ministry of Labour (lavoro.gov.it).":
      "Los cupos y las fechas se fijan por decreto cada año. Confirma siempre en el Ministerio de Trabajo italiano (lavoro.gov.it).",
    "Italy has published a digital nomad and remote worker visa since April 2024, valid for up to 365 days.":
      "Italia tiene publicado desde abril de 2024 un visado de nómada digital y trabajador en remoto, válido hasta 365 días.",
    "This route is only for people who work remotely, either self-employed (digital nomad) or employed (remote worker).":
      "Esta vía es solo para quien trabaja en remoto, por cuenta propia (nómada digital) o por cuenta ajena (trabajador en remoto).",
    "Italy requires a highly qualified worker: a tertiary qualification of at least three years meets that test.":
      "Italia exige ser trabajador altamente cualificado: una titulación superior de al menos tres años cumple ese requisito.",
    "Italy requires a highly qualified worker: a three-year tertiary qualification, a regulated profession, or three to five years of comparable professional experience.":
      "Italia exige ser trabajador altamente cualificado: una titulación superior de tres años, una profesión regulada, o de tres a cinco años de experiencia profesional equiparable.",
    "You must show annual income of at least three times the health-care exemption threshold (three times EUR 8,500), health insurance valid in Italy, and registered accommodation.":
      "Tienes que acreditar una renta anual de al menos el triple del umbral de exención sanitaria (tres veces 8.500 €), un seguro médico válido en Italia y una vivienda registrada.",
    "You need at least six months of prior experience working as a digital nomad or remote worker.":
      "Necesitas al menos seis meses de experiencia previa trabajando como nómada digital o en remoto.",
    "After arriving you must apply for the residence permit at the Questura within eight working days.":
      "Al llegar tienes que pedir el permiso de residencia en la Questura en los ocho días hábiles siguientes.",
    "Always verify with the Italian Ministry of Foreign Affairs consular network (esteri.it).":
      "Confirma siempre en la red consular del Ministerio de Asuntos Exteriores italiano (esteri.it).",
    "Italy: no permit needed (EU/EEA freedom of movement)":
      "Italia: no necesitas permiso (libre circulación UE/EEE).",
    "Italy Digital Nomad / Remote Worker visa":
      "Visado italiano de nómada digital / trabajador en remoto",
    "Italy national study visa (type D) and study residence permit":
      "Visado nacional de estudios de Italia (tipo D) y permiso de residencia por estudios",
    "Italy work entry under the decreto flussi quota (lavoro subordinato)":
      "Entrada por trabajo en Italia dentro del cupo del «decreto flussi» (lavoro subordinato)",

    "Sweden grants the study residence permit only for full-time on-site studies: distance learning does not qualify.":
      "Suecia concede el permiso de residencia por estudios solo para estudios presenciales a tiempo completo: la enseñanza a distancia no vale.",
    "You count as finally admitted only once you have paid the tuition fee; your institution notifies the Migration Agency.":
      "No cuentas como admitido en firme hasta que hayas pagado la matrícula; tu centro se lo comunica a la Agencia de Migración.",
    "The maintenance requirement is at least SEK 10,656 per month for 2026 applications, plus SEK 4,440 for a partner and SEK 2,664 per child.":
      "El requisito de manutención es de al menos 10.656 SEK al mes para solicitudes de 2026, más 4.440 SEK por pareja y 2.664 SEK por cada hijo.",
    "You need comprehensive health insurance, or proof that you have applied for one.":
      "Necesitas un seguro médico integral, o justificante de haberlo solicitado.",
    "For studies of less than three months you should not apply for a residence permit at all.":
      "Para estudios de menos de tres meses no debes pedir permiso de residencia.",
    "Always verify with the Swedish Migration Agency (migrationsverket.se).":
      "Confirma siempre en la Agencia Sueca de Migración (migrationsverket.se).",
    "Sweden issues a work permit tied to a signed employment contract and to one single job: you cannot combine two jobs to meet the requirements.":
      "Suecia emite el permiso de trabajo ligado a un contrato firmado y a un solo empleo: no puedes sumar dos trabajos para llegar a los requisitos.",
    "Since 1 June 2026 the salary must be at least 90% of the Swedish median salary at the time of application, currently SEK 34,470 per month.":
      "Desde el 1 de junio de 2026 el salario tiene que ser al menos el 90 % del salario mediano sueco en el momento de solicitar, ahora mismo 34.470 SEK al mes.",
    "Pay and conditions must also match Swedish collective agreements or common practice in the profession.":
      "El sueldo y las condiciones tienen que estar además a la altura de los convenios colectivos suecos o de lo habitual en la profesión.",
    "Before you start, your employer must have taken out health, life, industrial injuries and occupational pension insurance for you.":
      "Antes de que empieces, tu empleador tiene que haberte contratado seguro médico, de vida, de accidentes laborales y de pensión ocupacional.",
    "The salary figure is recalculated by Statistics Sweden. Always verify with the Swedish Migration Agency (migrationsverket.se).":
      "La cifra del salario la recalcula Statistics Sweden. Confirma siempre en la Agencia Sueca de Migración (migrationsverket.se).",
    "Sweden residence permit for higher education studies":
      "Permiso de residencia de Suecia para estudios superiores",
    "Sweden work permit (arbetstillstand)":
      "Permiso de trabajo de Suecia (arbetstillstånd)",
    "Estonia issues a long-stay (D) visa valid for up to 12 months, allowing up to 365 days of stay in any 12 consecutive months.":
      "Estonia emite un visado de larga duración (D) válido hasta 12 meses, que permite hasta 365 días de estancia en 12 meses consecutivos.",
    "For studies the ministry requires proof of 880 euros per month, evidenced by your income over the three months before you apply.":
      "Para estudios, el ministerio exige acreditar 880 € al mes, demostrados con tus ingresos de los tres meses anteriores a la solicitud.",
    "The visa fee is 120 euros.":
      "La tasa del visado es de 120 €.",
    "Always verify with the Estonian Ministry of Foreign Affairs (vm.ee).":
      "Confirma siempre en el Ministerio de Asuntos Exteriores de Estonia (vm.ee).",
    "Estonia publishes a digital nomad visa for teleworking, issued as a long-stay (D) visa.":
      "Estonia tiene publicada una visa de nómada digital para trabajo en remoto, que se emite como visado de larga duración (D).",
    "This route is for people who work remotely, and your profile does not indicate remote work.":
      "Esta vía es para quien trabaja en remoto, y tu perfil no indica trabajo en remoto.",
    "The ministry requires 132 euros per day, that is 3,960 euros per month, proved with your income over the three months before you apply.":
      "El ministerio exige 132 € al día, es decir 3.960 € al mes, demostrados con tus ingresos de los tres meses anteriores a la solicitud.",
    "The visa fee is 120 euros and travel medical insurance is required for the whole period.":
      "La tasa del visado es de 120 € y hace falta seguro médico de viaje para todo el periodo.",
    "Wayfare has not captured the full eligibility conditions from an official page: check them before you rely on this route.":
      "Wayfare no ha capturado de una página oficial todas las condiciones de acceso: compruébalas antes de contar con esta vía.",
    "Estonia Digital Nomad Visa (teleworking, long-stay D)":
      "Visa estonia de nómada digital (trabajo en remoto, larga duración D)",
    "Estonia long-stay (D) visa for studies":
      "Visado estonio de larga duración (D) por estudios",
    "Estonia: no permit needed (EU/EEA freedom of movement)":
      "Estonia: no necesitas permiso (libre circulación UE/EEE).",

    "You have the right to live in any EU country where you work as an employee, a self-employed person or a posted worker.":
      "Tienes derecho a vivir en cualquier país de la UE en el que trabajes por cuenta ajena, por cuenta propia o como trabajador desplazado.",
    "After the first three months you should register your residence with the local authority; you will need your ID or passport and a certificate of employment or proof of self-employment, and nothing else.":
      "Pasados los tres primeros meses debes registrar tu residencia en la autoridad local; necesitas tu DNI o pasaporte y un certificado de empleo o justificante de ser autónomo, y nada más.",
    "Some EU countries also require you to report your presence shortly after arrival, and may fine you if you do not.":
      "Algunos países de la UE exigen además comunicar tu presencia poco después de llegar, y pueden multarte si no lo haces.",
    "If you lose your job you can still stay if you are temporarily unable to work, registered as involuntarily unemployed, or in vocational training.":
      "Si pierdes el empleo puedes seguir quedándote si estás temporalmente incapacitado para trabajar, inscrito como desempleado involuntario o en formación profesional.",
    "After five continuous years meeting the conditions you automatically acquire the right of permanent residence.":
      "A los cinco años seguidos cumpliendo las condiciones adquieres automáticamente el derecho de residencia permanente.",
    "Always verify with Your Europe, the official EU portal (europa.eu/youreurope).":
      "Confirma siempre en Tu Europa, el portal oficial de la UE (europa.eu/youreurope).",
    "You have the right to live in the EU country where you are studying for as long as your studies last, if you are enrolled in an approved establishment, have enough income from any source, and hold comprehensive health insurance.":
      "Tienes derecho a vivir en el país de la UE donde estudias mientras duren tus estudios, si estás matriculado en un centro reconocido, tienes ingresos suficientes de cualquier origen y un seguro médico integral.",
    "During your first three months the host country cannot require you to register your residence; after three months it may.":
      "Durante tus tres primeros meses el país de acogida no puede exigirte registrar tu residencia; a partir de los tres meses, sí.",
    "To register you need proof of enrolment, proof of comprehensive health insurance and a declaration of sufficient resources: no other documents can be demanded.":
      "Para registrarte necesitas justificante de matrícula, del seguro médico integral y una declaración de recursos suficientes: no pueden exigirte más documentos.",
    "National authorities may not require your income to be above the level that would qualify you for basic income support.":
      "Las autoridades nacionales no pueden exigirte ingresos por encima del nivel que te daría derecho a una renta básica de subsistencia.",
    "You could lose the right to stay if you finish your studies and cannot show you are working or have enough resources.":
      "Puedes perder el derecho a quedarte si acabas los estudios y no puedes demostrar que trabajas o que tienes recursos suficientes.",
    "Under the EU-Switzerland agreement, EU and Swiss nationals enjoy reciprocal rights of entry, residence, access to paid work and establishment on a self-employed basis.":
      "Por el Acuerdo CE-Suiza, los nacionales de la UE y de Suiza tienen derechos recíprocos de entrada, residencia, acceso al trabajo por cuenta ajena y establecimiento por cuenta propia.",
    "EU freedom of movement: no work permit needed":
      "Libre circulación en la UE: no necesitas permiso de trabajo",
    "EU freedom of movement: no student visa needed":
      "Libre circulación en la UE: no necesitas visado de estudios",
    /* v1.153.0 — faltaba la tercera hermana: la de nómada digital */
    /* v1.168.0 — estado de apertura de los cupos: explicación fija, dato aparte */
    "Applications for your nationality were open when Wayfare last checked with Immigration New Zealand.":
      "Cuando Wayfare lo comprobó, las solicitudes para tu nacionalidad estaban abiertas en Immigration New Zealand.",
    "Applications for your nationality were CLOSED when Wayfare last checked, and the places run out: set yourself a reminder before it opens.":
      "Cuando Wayfare lo comprobó, las solicitudes para tu nacionalidad estaban CERRADAS, y las plazas se agotan: ponte un recordatorio antes de que abra.",
    "Applications for your nationality were CLOSED when Wayfare last checked, and Immigration New Zealand does not publish when they reopen. There is no date to set a reminder for.":
      "Cuando Wayfare lo comprobó, las solicitudes para tu nacionalidad estaban CERRADAS, e Immigration New Zealand no publica cuándo vuelven a abrir. No hay fecha para la que ponerse un recordatorio.",
    "Careful with the hour: their page says NZST on a date when New Zealand is on NZDT, so treat the earlier of the two as the real one.":
      "Ojo con la hora: su página dice NZST en una fecha en la que Nueva Zelanda está en NZDT, así que da por buena la más temprana de las dos.",
    "Wayfare checked this with the official source on 2026-08-06; an opening or closing can change at any time.":
      "Wayfare lo comprobó en la fuente oficial el 6 de agosto de 2026; una apertura o un cierre pueden cambiar en cualquier momento.",
    "It opens on 2026-08-19 at 10:00, New Zealand time.":
      "Abre el 19 de agosto de 2026 a las 10:00, hora de Nueva Zelanda.",
    "It opens on 2026-09-24 at 10:00, New Zealand time.":
      "Abre el 24 de septiembre de 2026 a las 10:00, hora de Nueva Zelanda.",
    "It opens on 2026-10-01 at 10:00, New Zealand time.":
      "Abre el 1 de octubre de 2026 a las 10:00, hora de Nueva Zelanda.",
    "It opens on 2026-10-08 at 10:00, New Zealand time.":
      "Abre el 8 de octubre de 2026 a las 10:00, hora de Nueva Zelanda.",
    "It opens on 2026-10-15 at 10:00, New Zealand time.":
      "Abre el 15 de octubre de 2026 a las 10:00, hora de Nueva Zelanda.",
    "It opens on 2026-11-17 at 10:00, New Zealand time.":
      "Abre el 17 de noviembre de 2026 a las 10:00, hora de Nueva Zelanda.",
    /* v1.164.0 — Norte de Chipre: aviso oficial, no destino */
    "The Republic of Cyprus states that it does not exercise effective control in the northern part of the island, which has been under military occupation by Türkiye since 1974.":
      "La República de Chipre declara que no ejerce control efectivo en la parte norte de la isla, bajo ocupación militar de Turquía desde 1974.",
    "It also states that the legal points of entry to the Republic are the airports of Larnaca and Paphos and the ports of Larnaca, Limassol, Latsi and Paphos, and that entry through any airport or port in the occupied area is illegal.":
      "También declara que los puntos de entrada legales a la República son los aeropuertos de Lárnaca y Pafos y los puertos de Lárnaca, Limasol, Latsi y Pafos, y que entrar por cualquier aeropuerto o puerto del área ocupada es ilegal.",
    "Because it does not control the area, the Republic says it cannot guarantee the safety of visitors there, nor provide consular assistance.":
      "Al no controlar la zona, la República advierte de que no puede garantizar la seguridad de quien la visite ni prestarle asistencia consular.",
    "Wayfare does not assess eligibility here: there is no route to assess.":
      "Wayfare no evalúa elegibilidad aquí: no hay ninguna vía que evaluar.",
    "Be careful with study offers in the northern part of Cyprus. The Republic of Cyprus states that the institutions calling themselves universities there operate unlawfully, and are not accredited by its competent authorities.":
      "Cuidado con las ofertas de estudios en el norte de Chipre. La República de Chipre declara que las instituciones que allí se llaman universidades operan de forma ilegal y no están acreditadas por sus autoridades competentes.",
    "It warns that traffickers advertise this as an easy route of migration into the European Union, selling so-called student visas, and that this is not a legal way to enter Cyprus or the European Union.":
      "Advierte de que los traficantes lo anuncian como una vía fácil de migración a la Unión Europea, vendiendo supuestos visados de estudiante, y de que esa no es una forma legal de entrar en Chipre ni en la Unión Europea.",
    "It adds that people who take that route often end up stranded there, or become victims of human trafficking.":
      "Añade que muchas de las personas que toman ese camino acaban varadas allí, o víctimas de trata de personas.",
    "If someone is offering you a study place there as a way into Europe, check it with the Republic of Cyprus before paying anything.":
      "Si alguien te ofrece una plaza de estudios allí como puerta de entrada a Europa, compruébalo con la República de Chipre antes de pagar nada.",
    /* v1.160.0 — Rumanía: condiciones nacionales de estudios, con su antigüedad */
    "Romania grants the long stay visa for studies as a student, master student or doctoral candidate, at a public or private institution, on condition that it is accredited.":
      "Rumanía concede el visado de larga estancia por estudios como estudiante, alumno de máster o doctorando, en una institución pública o privada, a condición de que esté acreditada.",
    "You must show proof of acceptance issued by the Ministry of Education for a full-time course, and proof that you have paid the tuition fee for at least one year of study.":
      "Debes presentar la aceptación de estudios emitida por el Ministerio de Educación para un curso a tiempo completo, y el justificante de haber pagado la matrícula de al menos un año.",
    "Your means of support must be at least the minimum gross national salary, monthly, for the whole period written on the visa.":
      "Tus medios de vida deben ser de al menos el salario mínimo bruto nacional, mensual, durante todo el periodo que figure en el visado.",
    "You also need a criminal record certificate and travel medical insurance with minimum cover of 30,000 euros, valid across the Member States.":
      "También necesitas certificado de antecedentes penales y un seguro médico de viaje con cobertura mínima de 30.000 euros, válido en todos los Estados miembros.",
    "Careful with the date: Romania's immigration inspectorate has not updated its English pages since December 2022, so confirm these conditions before you rely on them.":
      "Ojo con la fecha: el Inspectorado de Inmigración de Rumanía no actualiza sus páginas en inglés desde diciembre de 2022, así que confirma estas condiciones antes de fiarte de ellas.",
    /* v1.159.0 — el 100%: Chipre fuera de Schengen, Irlanda citada, y las
       tarjetas de «no estás en la lista» / «aquí no existe» con su respaldo */
    "Cyprus participates in Schengen cooperation, but the Council has not yet abolished its internal border controls: its integration into the Schengen area is still underway.":
      "Chipre participa en la cooperación Schengen, pero el Consejo todavía no ha suprimido sus controles de frontera interior: su integración en el espacio Schengen sigue en curso.",
    "So the 90/180 Schengen clock does not run here, and a Schengen visa alone does not decide your entry: Cyprus applies its own rules.":
      "Así que aquí no corre el contador Schengen de 90/180, y una visa Schengen por sí sola no decide tu entrada: Chipre aplica sus propias normas.",
    "Always verify with the Republic of Cyprus before you travel.":
      "Verifica siempre con la República de Chipre antes de viajar.",
    "The Schengen Protocol exceptionally allows Ireland not to apply the Schengen rules, so it continues to enforce its own visa and border policies.":
      "El Protocolo de Schengen permite excepcionalmente a Irlanda no aplicar las normas Schengen, así que mantiene su propia política de visados y de fronteras.",
    "Australia's Working Holiday visa requires a passport from a country or jurisdiction on its eligible list.":
      "El visado de vacaciones y trabajo de Australia exige pasaporte de un país o jurisdicción de su lista de elegibles.",
    "and the Work and Holiday visa requires a passport from its own, separate eligible list.":
      "y el visado de trabajo y vacaciones exige pasaporte de su propia lista de elegibles, que es distinta.",
    "New Zealand runs its Working Holiday visa as a separate arrangement with each country, each with its own conditions.":
      "Nueva Zelanda gestiona su visado de vacaciones y trabajo como un acuerdo aparte con cada país, cada uno con sus propias condiciones.",
    "The work visa New Zealand does publish is tied to an accredited employer who has offered you at least 30 hours of work a week, which is the opposite of working remotely for someone abroad.":
      "El visado de trabajo que Nueva Zelanda sí publica está atado a un empleador acreditado que te haya ofrecido al menos 30 horas semanales, que es lo contrario de trabajar en remoto para alguien de fuera.",
    "Mexico's migration institute publishes its conditions of stay and none of them is a working holiday programme.":
      "El Instituto Nacional de Migración de México publica sus condiciones de estancia y ninguna de ellas es un programa de vacaciones y trabajo.",
    "Always verify with Mexico's Instituto Nacional de Migración (inm.gob.mx).":
      "Verifica siempre con el Instituto Nacional de Migración de México (inm.gob.mx).",
    /* v1.158.0 — Islandia recuperada: trabajo y estudios con fuente propia */
    "Iceland grants residence permits based on work to people who have received a job offer on the Icelandic labour market.":
      "Islandia concede permisos de residencia por trabajo a quien ha recibido una oferta de empleo en el mercado laboral islandés.",
    "There are three grounds: work requiring expert knowledge, a shortage of labour, or a collaboration or service contract.":
      "Hay tres supuestos: trabajo que exige conocimiento experto, escasez de mano de obra, o un contrato de colaboración o de servicios.",
    "Applications must be submitted in their original form on paper, by post or in the Directorate's drop box: there is no online route.":
      "Las solicitudes se presentan en papel y en su forma original, por correo ordinario o en el buzón de la Dirección de Inmigración: no hay vía en línea.",
    "You must pay the processing fee by bank transfer first, and submit the receipt with the application.":
      "Primero debes pagar la tasa de tramitación por transferencia bancaria, y adjuntar el recibo con la solicitud.",
    "Iceland grants student residence permits for full time studies at a university in Iceland, and for doctoral studies at a foreign university collaborating with an Icelandic one.":
      "Islandia concede permisos de residencia por estudios para cursar estudios universitarios a tiempo completo en Islandia, y para el doctorado en una universidad extranjera asociada a una islandesa.",
    "You must first gain admission to a study programme recognised as the basis for a student permit.":
      "Primero tienes que obtener plaza en un programa de estudios reconocido como base para el permiso de estudiante.",
    "The deadline is strict: your application and supporting documents must arrive by 1 May for the autumn semester, or by 1 October for the spring semester.":
      "El plazo es estricto: tu solicitud y la documentación de apoyo deben llegar antes del 1 de mayo para el semestre de otoño, o del 1 de octubre para el de primavera.",
    "Start early: gathering the documents takes time, and a criminal record certificate is one of them.":
      "Empieza pronto: reunir los documentos lleva tiempo, y uno de ellos es el certificado de antecedentes penales.",
    "Always verify with Iceland's Directorate of Immigration (island.is).":
      "Verifica siempre con la Dirección de Inmigración de Islandia (island.is).",
    "EU freedom of movement: no digital nomad visa needed":
      "Libre circulación en la UE: no necesitas visado de nómada digital",

    "The Skilled Worker visa lets you do an eligible job in the UK with an employer approved by the Home Office.":
      "La visa Skilled Worker te permite ocupar un puesto elegible en el Reino Unido con un empleador aprobado por el Ministerio del Interior.",
    "You need a confirmed job offer before you apply, and a certificate of sponsorship from that employer.":
      "Necesitas una oferta de trabajo confirmada antes de solicitarla, y un certificado de patrocinio de ese empleador.",
    "Your job must appear on the list of eligible occupations: if its occupation code is 'higher skilled' you can apply, and if it is 'medium skilled' only through the immigration salary list or the temporary shortage list.":
      "Tu puesto tiene que estar en la lista de ocupaciones elegibles: si su código es «higher skilled» puedes solicitarla, y si es «medium skilled» solo por la lista de salarios de inmigración o la de escasez temporal.",
    "You must be paid whichever is higher: 41,700 pounds a year, or the published going rate for your occupation code.":
      "Te tienen que pagar lo que sea más alto: 41.700 libras al año, o la tarifa publicada para tu código de ocupación.",
    "You must be able to speak, read, write and understand English, and you will usually have to prove it.":
      "Tienes que saber hablar, leer, escribir y entender inglés, y normalmente tendrás que demostrarlo.",
    "The visa lasts up to 5 years before you need to extend it, and after 5 years you may be able to apply for indefinite leave to remain.":
      "La visa dura hasta 5 años antes de tener que renovarla, y a los 5 años puedes llegar a pedir la residencia indefinida.",
    "Always verify with GOV.UK, the official UK government site (gov.uk).":
      "Confirma siempre en GOV.UK, el sitio oficial del Gobierno británico (gov.uk).",
    "GOV.UK lists 27 work routes, from Skilled Worker to Frontier Worker permit, and none of them is a digital nomad visa.":
      "GOV.UK enumera 27 vías de trabajo, de la Skilled Worker al permiso de Frontier Worker, y ninguna es una visa de nómada digital.",
    "As a Standard Visitor you can usually stay up to 6 months, and you cannot do paid or unpaid work for a UK company or as a self-employed person.":
      "Como visitante estándar puedes quedarte normalmente hasta 6 meses, y no puedes trabajar —cobrando o gratis— para una empresa británica ni por cuenta propia.",
    "You also cannot live in the UK for long periods through frequent or successive visits.":
      "Tampoco puedes vivir en el Reino Unido durante periodos largos a base de visitas frecuentes o seguidas.",
    "The UK visitor rules do not mention remote work for a foreign employer, so Wayfare does not claim it is allowed: check your situation before you rely on it.":
      "Las normas británicas de visitante no mencionan el trabajo en remoto para un empleador extranjero, así que Wayfare no afirma que esté permitido: comprueba tu caso antes de contar con ello.",
    "Canada has two kinds of work permit: employer-specific (closed), which is the most common and needs a job offer, and open, only for people who qualify for it.":
      "Canadá tiene dos tipos de permiso de trabajo: el ligado a un empleador (cerrado), que es el más común y exige oferta de trabajo, y el abierto, solo para quien cumple los requisitos.",
    "You cannot choose which type of work permit you need: it depends on your situation.":
      "No eliges tú qué tipo de permiso de trabajo necesitas: depende de tu situación.",
    "You must show you have enough money to support yourself and your family during your stay and to return home.":
      "Tienes que demostrar que tienes dinero suficiente para mantenerte a ti y a tu familia durante la estancia y para volver a casa.",
    "You must show that you will leave Canada before your work permit expires.":
      "Tienes que demostrar que saldrás de Canadá antes de que caduque tu permiso de trabajo.",
    "You must include every required document and give any other document the officer asks for.":
      "Tienes que incluir todos los documentos exigidos y entregar cualquier otro que te pida el funcionario.",
    "Always verify with Immigration, Refugees and Citizenship Canada (canada.ca).":
      "Confirma siempre en Inmigración, Refugiados y Ciudadanía de Canadá (canada.ca).",
    "The only work permits Canada publishes are the employer-specific one, which needs a job offer, and the open one, which is only for people who qualify for it.":
      "Los únicos permisos de trabajo que publica Canadá son el ligado a un empleador, que exige oferta, y el abierto, solo para quien cumple los requisitos.",
    "Japan's digital nomad status is limited to a closed list of countries and regions, and your nationality is not on it.":
      "El estatus japonés de nómada digital está limitado a una lista cerrada de países y regiones, y tu nacionalidad no está en ella.",
    "Your nationality is on Japan's closed list of countries and regions eligible for the digital nomad status.":
      "Tu nacionalidad está en la lista cerrada de países y regiones que Japón admite para el estatus de nómada digital.",
    "Japan's digital nomad status is for individuals wishing to work remotely in Japan, and your profile does not indicate remote work.":
      "El estatus japonés de nómada digital es para quien quiere trabajar en remoto desde Japón, y tu perfil no indica trabajo en remoto.",
    "The period of stay is 6 months and no extension will be granted.":
      "La estancia es de 6 meses y no se concede prórroga.",
    "You must prove an annual income of 10 million yen or more.":
      "Tienes que demostrar unos ingresos anuales de 10 millones de yenes o más.",
    "You must hold insurance covering death, injury or illness in Japan, with medical cover of 10 million yen or more.":
      "Tienes que tener un seguro que cubra fallecimiento, lesiones o enfermedad en Japón, con cobertura médica de 10 millones de yenes o más.",
    "A spouse or child may accompany you for the same period, under their own designated activities status.":
      "Tu cónyuge o tus hijos pueden acompañarte el mismo periodo, con su propio estatus de actividades designadas.",
    "Always verify with Japan's Ministry of Foreign Affairs (mofa.go.jp) and the Immigration Services Agency.":
      "Confirma siempre en el Ministerio de Asuntos Exteriores de Japón (mofa.go.jp) y en la Agencia de Servicios de Inmigración.",
    "Japanese work visas require employer sponsorship and a Certificate of Eligibility (COE), issued by a regional immigration bureau before the visa application.":
      "Las visas de trabajo japonesas exigen patrocinio de un empleador y un Certificado de Elegibilidad (COE), que emite una oficina regional de inmigración antes de solicitar el visado.",
    "A Certificate of Eligibility does not guarantee that the visa will be issued.":
      "Un Certificado de Elegibilidad no garantiza que te concedan el visado.",
    "United Kingdom Skilled Worker visa":
      "Visa británica Skilled Worker (trabajador cualificado)",
    "Canada work permit (employer-specific or open)":
      "Permiso de trabajo de Canadá (ligado a empleador o abierto)",
    "Canada: no digital nomad visa":
      "Canadá: no hay visa de nómada digital",
    "New Zealand: no digital nomad visa":
      "Nueva Zelanda: no hay visa de nómada digital",

    "The visitor visa covers business (B-1), tourism (B-2) or both (B-1/B-2).":
      "El visado de visitante cubre negocios (B-1), turismo (B-2) o ambas cosas (B-1/B-2).",
    "Your passport must be valid for at least six months beyond your period of stay, unless a country-specific agreement exempts you.":
      "Tu pasaporte tiene que ser válido al menos seis meses más allá de tu periodo de estancia, salvo que un acuerdo con tu país te exima.",
    "An interview is generally required, and a consular officer may require one of any applicant.":
      "Por lo general hace falta entrevista, y un funcionario consular puede exigírsela a cualquier solicitante.",
    "Travelling for the primary purpose of giving birth in the United States is not permissible on a visitor visa.":
      "Viajar con el propósito principal de dar a luz en Estados Unidos no está permitido con un visado de visitante.",
    "The visa application fee shown by the State Department is 185 dollars, and you may also need to show sufficient funds and strong ties to your home country.":
      "La tasa de solicitud que publica el Departamento de Estado es de 185 dólares, y puede que además tengas que demostrar fondos suficientes y arraigo en tu país.",
    "The State Department's directory of nonimmigrant visa categories has no working holiday category: the exchange visitor route is category J.":
      "El directorio de categorías de no inmigrante del Departamento de Estado no tiene categoría de working holiday: la vía de intercambio es la categoría J.",
    "The State Department's directory of nonimmigrant visa categories does not list any digital nomad category.":
      "El directorio de categorías de no inmigrante del Departamento de Estado no recoge ninguna categoría de nómada digital.",
    "That directory itself notes it lists almost all categories, so check travel.state.gov for your exact situation.":
      "El propio directorio advierte de que recoge «casi todas» las categorías, así que comprueba tu caso concreto en travel.state.gov.",
    "The main employer-sponsored route is the Skills in Demand visa (subclass 482), for a skilled position an employer cannot fill with an Australian worker.":
      "La vía principal con patrocinio de empleador es la visa Skills in Demand (subclase 482), para un puesto cualificado que un empleador no puede cubrir con un trabajador australiano.",
    "You must be nominated for a skilled position by an approved sponsor, have the right skills for the job and meet the English language requirements.":
      "Un patrocinador aprobado tiene que nominarte para un puesto cualificado, tienes que tener las aptitudes para el trabajo y cumplir los requisitos de inglés.",
    "Your occupation must appear on the Core Skills Occupation List.":
      "Tu ocupación tiene que estar en la Core Skills Occupation List.",
    "The subclass 482 lets you stay up to 4 years, or up to 5 for Hong Kong passport holders, and costs from AUD 4,015.":
      "La subclase 482 permite quedarse hasta 4 años, o hasta 5 con pasaporte de Hong Kong, y cuesta desde 4.015 dólares australianos.",
    "Skilled visa income thresholds are indexed each year to Average Weekly Ordinary Time Earnings.":
      "Los umbrales de renta de los visados cualificados se actualizan cada año según el salario semanal medio ordinario.",
    "Most Australian work visas require a job offer or employer sponsorship.":
      "La mayoría de los visados de trabajo australianos exigen una oferta de empleo o patrocinio de un empleador.",
    "The Department of Home Affairs publishes 118 visa subclasses and none of them is a digital nomad visa.":
      "El Departamento de Interior publica 118 subclases de visado y ninguna es de nómada digital.",
    "Always verify with the Department of Home Affairs (immi.homeaffairs.gov.au).":
      "Confirma siempre en el Departamento de Interior de Australia (immi.homeaffairs.gov.au).",
    "A study stay of up to 90 days needs no study visa at all: depending on your nationality you may need a Schengen short-stay visa instead.":
      "Una estancia por estudios de hasta 90 días no necesita visado de estudios: según tu nacionalidad puede que necesites un visado Schengen de corta duración.",
    "Below 180 days you are not asked for the criminal record certificate that longer stays require.":
      "Por debajo de 180 días no te piden el certificado de antecedentes penales que sí exigen las estancias más largas.",
    "University studies may be on-site or hybrid; other higher studies must be at least 50% on-site.":
      "Los estudios universitarios pueden ser presenciales o híbridos; el resto de estudios superiores tienen que ser al menos un 50 % presenciales.",
    "You need health insurance taken out with an insurer authorised to operate in Spain, with cover similar to the Spanish national health service.":
      "Necesitas un seguro de enfermedad contratado con una aseguradora autorizada a operar en España, con prestaciones similares a las del Sistema Nacional de Salud.",
    "The minimum financial means required is 100% of the IPREM index, plus an extra amount for each accompanying family member.":
      "Los medios económicos mínimos exigidos equivalen al 100 % del IPREM, más una cantidad adicional por cada familiar que te acompañe.",
    "Always verify with Spain's Ministry of Foreign Affairs (exteriores.gob.es).":
      "Confirma siempre en el Ministerio de Asuntos Exteriores de España (exteriores.gob.es).",
    "The temporary stay visa covers periods of over 3 months for study programmes in a certified institution, student exchange, unpaid internships or volunteer work.":
      "El visado de estancia temporal cubre periodos de más de 3 meses para programas de estudio en un centro certificado, intercambio de estudiantes, prácticas no remuneradas o voluntariado.",
    "Your passport must be valid for 3 months beyond the estimated date of return, and you must show a copy of your return transport title.":
      "Tu pasaporte tiene que ser válido 3 meses más allá de la fecha prevista de regreso, y tienes que presentar copia del billete de vuelta.",
    "You need travel insurance covering medical expenses, urgent assistance and possible repatriation.":
      "Necesitas un seguro de viaje que cubra gastos médicos, asistencia urgente y una posible repatriación.",
    "You must present a criminal record certificate from your country of nationality or from any country where you have lived for over a year, apostilled or legalised, unless you are under sixteen.":
      "Tienes que presentar un certificado de antecedentes penales de tu país de nacionalidad o de cualquier país donde hayas vivido más de un año, apostillado o legalizado, salvo que seas menor de dieciséis.",
    "You must show proof of financial resources as defined by government decree.":
      "Tienes que acreditar recursos económicos según lo que fija el decreto del Gobierno.",
    "Always verify with Portugal's official visa portal (vistos.mne.gov.pt).":
      "Confirma siempre en el portal oficial de visados de Portugal (vistos.mne.gov.pt).",
    "Australia Skills in Demand visa (subclass 482)":
      "Visa australiana Skills in Demand (subclase 482)",
    "Australia: no digital nomad visa":
      "Australia: no hay visa de nómada digital",

    "This visitor condition covers tourism, transit, business meetings, technical work under 180 days, medical treatment, fairs and conferences, and even studies of less than 180 days.":
      "Esta condición de visitante cubre turismo, tránsito, reuniones de negocios, trabajos técnicos de menos de 180 días, tratamientos médicos, ferias y congresos, e incluso estudios de menos de 180 días.",
    "You do not need this visa if you already hold a valid multiple-entry visa for the United States, Canada, Japan, the United Kingdom or any Schengen country.":
      "No necesitas esta visa si ya tienes una visa válida de entrada múltiple de Estados Unidos, Canadá, Japón, Reino Unido o cualquier país del espacio Schengen.",
    "You also do not need it if you hold permanent residence in those countries or in the Pacific Alliance members: Chile, Colombia and Peru.":
      "Tampoco la necesitas si tienes residencia permanente en esos países o en los miembros de la Alianza del Pacífico: Chile, Colombia y Perú.",
    "You must prove economic solvency or ties, through bank statements, employment or pension income over the last three months, or property and a stable job.":
      "Tienes que acreditar solvencia económica o arraigo, con extractos bancarios, nómina o pensión de los últimos tres meses, o bien propiedades y un empleo estable.",
    "The exact amounts are set by each consulate in its local currency, so check the one that covers your place of residence.":
      "Los importes exactos los fija cada consulado en su moneda local, así que consulta el que te corresponde por lugar de residencia.",
    "Always verify with Mexico's Ministry of Foreign Affairs consular network (sre.gob.mx).":
      "Confirma siempre en la red consular de la Secretaría de Relaciones Exteriores de México (sre.gob.mx).",

    "EU law sets minimum common rules for non-EU students: acceptance by a higher education institution, a valid travel document, proof of resources for subsistence and return travel, and health insurance.":
      "El derecho europeo fija reglas mínimas comunes para estudiantes extracomunitarios: admisión en un centro de educación superior, documento de viaje válido, prueba de recursos para mantenerte y para el regreso, y seguro médico.",
    "EU countries cannot restrict your working hours alongside your studies to under 15 hours a week.":
      "Los países de la UE no pueden limitarte a menos de 15 horas semanales de trabajo mientras estudias.",
    "After finishing your studies you have the right to stay at least 9 months to look for work or set up a business.":
      "Al acabar los estudios tienes derecho a quedarte al menos 9 meses para buscar trabajo o montar un negocio.",
    "The country must publish its entry and residence conditions, including the minimum amount of money required per month, and cannot charge disproportionate fees.":
      "El país tiene que publicar sus condiciones de entrada y residencia, incluida la cantidad mínima de dinero exigida al mes, y no puede cobrar tasas desproporcionadas.",
    "These are the EU minimums: each country adds its own conditions, which Wayfare has not captured for this destination yet.":
      "Estos son los mínimos europeos: cada país añade sus propias condiciones, que Wayfare todavía no ha capturado para este destino.",
    "EU law gives you a single permit covering both residence and work, applied for in one procedure.":
      "El derecho europeo te da un permiso único que cubre residencia y trabajo, y se pide en un solo trámite.",
    "The authority must decide within 90 days of a complete application, with up to 30 extra days for complex cases.":
      "La autoridad tiene que resolver en 90 días desde que la solicitud está completa, con hasta 30 días más en casos complejos.",
    "You may change employer while the permit is valid, under certain conditions.":
      "Puedes cambiar de empleador mientras el permiso esté vigente, con ciertas condiciones.",
    "If you lose your job you can stay at least three months, or at least six if you have held the permit for more than two years.":
      "Si pierdes el trabajo puedes quedarte al menos tres meses, o al menos seis si llevas más de dos años con el permiso.",
    "You are entitled to equal treatment with nationals on pay, working hours, leave, health and safety, and the right to strike.":
      "Tienes derecho a la misma igualdad de trato que los nacionales en sueldo, jornada, vacaciones, salud y seguridad, y derecho de huelga.",
    "A rejection must be explained in writing and must tell you where and by when you can appeal.":
      "Una denegación tiene que estar motivada por escrito y decirte ante quién y en qué plazo puedes recurrir.",
    "These are the EU minimums: you still need an employer and the national conditions, which Wayfare has not captured for this destination yet.":
      "Estos son los mínimos europeos: sigues necesitando un empleador y las condiciones nacionales, que Wayfare todavía no ha capturado para este destino.",
    "EU student permit (Directive 2016/801 minimums)":
      "Permiso europeo de estudios (mínimos de la Directiva 2016/801)",
    "EU single permit for residence and work":
      "Permiso único europeo de residencia y trabajo",

    "Croatia grants a temporary stay for digital nomads: third-country nationals who work through communication technology for a company that is not registered in Croatia.":
      "Croacia concede una estancia temporal para nómadas digitales: extracomunitarios que trabajan con tecnología de comunicación para una empresa que no está registrada en Croacia.",
    "The stay is granted for up to eighteen months.":
      "La estancia se concede por un máximo de dieciocho meses.",
    "Close family members can join you through family reunification.":
      "Tus familiares cercanos pueden acompañarte por reagrupación familiar.",
    "You cannot work for or provide services to employers in Croatia.":
      "No puedes trabajar ni prestar servicios para empleadores de Croacia.",
    "You must show at least 2.5 average monthly net salaries: currently a minimum of 3,622.50 euros a month, or 43,470 euros in the bank for a twelve-month stay.":
      "Tienes que acreditar al menos 2,5 salarios netos medios mensuales: ahora mismo un mínimo de 3.622,50 € al mes, o 43.470 € en el banco para una estancia de doce meses.",
    "That amount rises by 10% of the average net salary for each additional family member.":
      "Esa cantidad sube un 10 % del salario neto medio por cada familiar adicional.",
    "Once the stay expires you must wait six months before applying again.":
      "Cuando caduca la estancia tienes que esperar seis meses para volver a solicitarla.",
    "Always verify with Croatia's Ministry of the Interior (mup.gov.hr).":
      "Confirma siempre en el Ministerio del Interior de Croacia (mup.gov.hr).",
    "Malta issues a Nomad Residence Permit for third-country nationals who work remotely using telecommunications.":
      "Malta emite un Permiso de Residencia Nómada para extracomunitarios que trabajan en remoto usando telecomunicaciones.",
    "It covers employees of a foreign employer, partners or shareholders of a foreign company, and freelancers with foreign clients.":
      "Cubre a empleados de un empleador extranjero, socios o accionistas de una empresa extranjera, y autónomos con clientes en el extranjero.",
    "The permit is issued for one year and can be renewed at the agency's discretion.":
      "El permiso se emite por un año y puede renovarse a criterio de la agencia.",
    "You must have a minimum gross yearly income of 42,000 euros.":
      "Tienes que tener unos ingresos brutos anuales mínimos de 42.000 €.",
    "You need health insurance covering the European Union and the United Kingdom, a rental or purchase agreement, a police conduct certificate and a background check.":
      "Necesitas un seguro médico que cubra la Unión Europea y el Reino Unido, un contrato de alquiler o compra, un certificado de conducta policial y una verificación de antecedentes.",
    "If you are contracted by a foreign company but give services to its Maltese subsidiary you are not eligible.":
      "Si te contrata una empresa extranjera pero prestas servicios a su filial maltesa, no eres elegible.",
    "Always verify with Residency Malta (residencymalta.gov.mt).":
      "Confirma siempre en Residency Malta (residencymalta.gov.mt).",
    "Greece publishes a Digital Nomad Visa that lets non-European professionals obtain a residence permit.":
      "Grecia tiene publicado un visado de nómada digital que permite a profesionales no europeos obtener un permiso de residencia.",
    "Wayfare could not capture the income threshold or the detailed conditions from an official page: check them before you rely on this route.":
      "Wayfare no ha podido capturar de una página oficial el umbral de renta ni las condiciones detalladas: compruébalos antes de contar con esta vía.",
    "Always verify with Greece's Ministry of Foreign Affairs (mfa.gr).":
      "Confirma siempre en el Ministerio de Asuntos Exteriores de Grecia (mfa.gr).",
    "Croatia temporary stay of digital nomads":
      "Estancia temporal de nómadas digitales de Croacia",
    "Malta Nomad Residence Permit":
      "Permiso de Residencia Nómada de Malta",
    "Greece Digital Nomad Visa":
      "Visado de nómada digital de Grecia",

    "Uruguay's Residencia Temporaria is open to any nationality, for work or study, for a minimum of 6 months and a maximum of 2 years, extendable.":
      "La Residencia Temporaria de Uruguay está abierta a cualquier nacionalidad, por motivos de trabajo o estudio, por un mínimo de 6 meses y un máximo de 2 años, prorrogable.",
    "For work you need a letterhead letter from the employer stating your activity and contract period, with monthly pay equal to or above the Uruguayan national minimum wage.":
      "Para trabajar necesitas una carta membretada del empleador que especifique tu actividad y el plazo de contratación, con una remuneración mensual igual o superior al salario mínimo nacional uruguayo.",
    "That letter must come with a notarial certificate of the company's details, or a BPS employment history record.":
      "Esa carta tiene que ir acompañada de un certificado notarial con los datos de la empresa, o de la Historia Laboral Nominada del BPS.",
    "Foreign documents must be apostilled or legalised and translated by a Uruguayan public translator, except Brazilian ones; electronic documents that can be verified need neither.":
      "Los documentos extranjeros tienen que estar apostillados o legalizados y traducidos por Traductor Público Uruguayo, salvo los brasileños; los emitidos electrónicamente y verificables no necesitan ni lo uno ni lo otro.",
    "If you do not speak Spanish you must attend the appointment with an interpreter.":
      "Si no hablas español, tienes que acudir a la audiencia con un intérprete.",
    "Always verify with Uruguay's Dirección Nacional de Migración (gub.uy).":
      "Confirma siempre en la Dirección Nacional de Migración de Uruguay (gub.uy).",
    "For studies the residence is granted for up to a year, extendable for equal periods, without exceeding two years of the whole course.":
      "Para estudios, la residencia se concede hasta por un año, prorrogable por periodos iguales, sin exceder los dos años del total de la carrera.",
    "You must prove your student status with an official certificate from the institution, and show means of support sufficient to maintain yourself.":
      "Tienes que probar tu calidad de estudiante con un certificado oficial de la institución, y acreditar medios de vida suficientes para tu manutención.",
    "If you have no means of your own you can use a relative's, proving the relationship, or a notarial certificate of money received from abroad.":
      "Si no tienes medios de vida propios, puedes aportar los de un familiar acreditando el vínculo, o un certificado notarial del dinero que recibes del exterior.",
    "Uruguay grants a special residence permit for people who work on their own account or for companies abroad.":
      "Uruguay concede un permiso especial de residencia para quien trabaja por cuenta propia o para empresas en el extranjero.",
    "You enter Uruguay as an ordinary tourist and then apply online for six months as a digital nomad, with a signed sworn statement that you have the means to support yourself.":
      "Entras a Uruguay como turista regular y luego pides en línea seis meses como nómade digital, con una declaración jurada firmada de que dispones de medios económicos para mantenerte.",
    "To extend for a further six months, and complete the year, you must show you have no criminal record in any country where you lived more than six months in the last five years, plus a vaccination certificate issued in Uruguay.":
      "Para prorrogarlo otros seis meses y completar el año, tienes que demostrar que no tienes antecedentes penales en ningún país donde hayas vivido más de seis meses en los últimos cinco años, y presentar un certificado de vacunación expedido en Uruguay.",
    "Chile's Residencia Temporal is valid for up to 2 years.":
      "La Residencia Temporal de Chile es válida hasta 2 años.",
    "With an employer who has a domicile or branch office in Chile the permit lasts up to two years and can be extended for two more.":
      "Con un empleador domiciliado o con sucursal en Chile, el permiso dura hasta dos años y puede prorrogarse por dos más.",
    "The application must be made from OUTSIDE Chile, through the Portal de Trámites Digitales of the Servicio Nacional de Migraciones.":
      "La solicitud hay que presentarla desde FUERA de Chile, por el Portal de Trámites Digitales del Servicio Nacional de Migraciones.",
    "With a formal job offer instead of a contract you get 90 calendar days, and once inside you have 45 days to present the employment contract to earn a one-year extension.":
      "Con una oferta formal de empleo en vez de contrato te dan 90 días corridos, y una vez dentro tienes 45 días para presentar el contrato de trabajo y conseguir una prórroga de un año.",
    "The criminal record certificate must be no more than 60 days old, and the employment contract must be signed by the employer before a Chilean notary.":
      "El certificado de antecedentes no puede tener más de 60 días, y el contrato de trabajo tiene que firmarlo el empleador ante notario chileno.",
    "Always verify with Chile's Servicio Nacional de Migraciones (serviciomigraciones.cl).":
      "Confirma siempre en el Servicio Nacional de Migraciones de Chile (serviciomigraciones.cl).",
    "Chile's Permanencia Transitoria allows up to 90 days, extendable once for up to 90 more.":
      "La Permanencia Transitoria de Chile permite hasta 90 días, prorrogables una sola vez por hasta 90 más.",
    "You must prove you have sufficient financial means to support your stay.":
      "Tienes que acreditar medios económicos suficientes para mantener tu estancia.",
    "Holding a Permanencia Transitoria does NOT let you apply for a residence permit from inside Chile, except in the narrow cases of article 69 of Law 21.325, such as family ties with Chileans or permanent residents.":
      "Tener una Permanencia Transitoria NO te permite pedir residencia desde dentro de Chile, salvo en los casos tasados del artículo 69 de la Ley 21.325, como el vínculo familiar con chilenos o residentes permanentes.",
    "Uruguay Residencia Legal — Temporaria (trabajo)":
      "Residencia Legal de Uruguay — Temporaria (trabajo)",
    "Uruguay Residencia Legal — Temporaria (estudios)":
      "Residencia Legal de Uruguay — Temporaria (estudios)",
    "Uruguay digital nomad residence permit (hoja de identidad provisoria)":
      "Permiso de residencia de nómade digital de Uruguay (hoja de identidad provisoria)",
    "Chile Residencia Temporal (actividades remuneradas)":
      "Residencia Temporal de Chile (actividades remuneradas)",
    "Chile Permanencia Transitoria (tourism, up to 90 days)":
      "Permanencia Transitoria de Chile (turismo, hasta 90 días)",

    "Argentina's student temporary residence covers secondary, tertiary, university or recognised specialised studies as a regular student at an officially recognised institution.":
      "La residencia temporaria de estudiante de Argentina cubre estudios secundarios, terciarios, universitarios o especializados reconocidos, como alumno regular en un establecimiento reconocido oficialmente.",
    "You register as a regular student and present the electronic enrolment certificate (Constancia de Inscripción Electrónica).":
      "Te inscribes como alumno regular y presentas la Constancia de Inscripción Electrónica.",
    "You need a valid passport, proof of address and a regular entry into the country.":
      "Necesitas pasaporte válido y vigente, acreditación de domicilio e ingreso regular al país.",
    "The Argentine criminal record certificate is pulled automatically through the Radex system: you do not have to obtain it separately.":
      "El certificado de antecedentes penales argentinos se incorpora automáticamente por el sistema Radex: no tienes que tramitarlo por fuera.",
    "You also need a criminal record certificate from every country where you lived more than one year during the last three years, if you are over 16.":
      "También necesitas certificado de antecedentes de cada país donde hayas residido más de un año en los últimos tres, si tienes más de 16 años.",
    "Always verify with Argentina's Dirección Nacional de Migraciones (argentina.gob.ar).":
      "Confirma siempre en la Dirección Nacional de Migraciones de Argentina (argentina.gob.ar).",
    "Argentina's migrant worker temporary residence is for people hired for a lawful, paid activity under an employment relationship.":
      "La residencia temporaria de trabajador migrante de Argentina es para quien ha sido contratado para una actividad lícita y remunerada bajo relación de dependencia.",
    "You need a pre-contract signed by both parties stating the tasks, working hours, duration of the employment relationship, workplace address and pay, which must match the collective agreement for the activity.":
      "Necesitas un pre-contrato laboral firmado por ambas partes con las tareas, la jornada, la duración de la relación laboral, el domicilio de trabajo y la remuneración, que tiene que ajustarse al convenio colectivo de la actividad.",
    "The signatures must be certified by a notary or before an officer of the Dirección Nacional de Migraciones when you file.":
      "Las firmas tienen que estar certificadas por escribano público o ante un agente de la Dirección Nacional de Migraciones al iniciar la solicitud.",
    "The employer's CUIT tax number must appear in the pre-contract.":
      "El número de CUIT del empleador tiene que figurar en el pre-contrato.",
    "You must be OUTSIDE Peru to obtain this migration status.":
      "Tienes que estar FUERA del Perú para obtener esta calidad migratoria.",
    "Always verify with Peru's Superintendencia Nacional de Migraciones (gob.pe).":
      "Confirma siempre en la Superintendencia Nacional de Migraciones del Perú (gob.pe).",
    "Argentina residencia temporaria como estudiante (Ley 25.871, art. 23.j)":
      "Residencia temporaria de Argentina como estudiante (Ley 25.871, art. 23.j)",
    "Argentina residencia temporaria como trabajador migrante (Ley 25.871, art. 23.a)":
      "Residencia temporaria de Argentina como trabajador migrante (Ley 25.871, art. 23.a)",

    "Colombia issues studies through the Visitor visa (V), category Estudiante.":
      "Colombia tramita los estudios por la visa de Visitante (V), categoría Estudiante.",
    "Colombia handles tourism through the Visitor visa (V), category Turismo, for those nationalities that need a visa.":
      "Colombia tramita el turismo por la visa de Visitante (V), categoría Turismo, para las nacionalidades que necesitan visa.",
    "The Visitor visa is meant for a temporary activity, without the intention of settling in the country.":
      "La visa de Visitante es para una actividad temporal, sin ánimo de establecer domicilio en el país.",
    "Every visa application is filed through the Foreign Ministry's digital platform, not on paper.":
      "Toda solicitud de visa se presenta por la plataforma digital de la Cancillería, no en papel.",
    "For primary, secondary or undergraduate studies with the intention of settling there is a separate Migrant visa (M).":
      "Para estudios de primaria, secundaria o pregrado con ánimo de establecerse existe una visa de Migrante (M) aparte.",
    "Always verify with Colombia's Ministerio de Relaciones Exteriores (cancilleria.gov.co).":
      "Confirma siempre en el Ministerio de Relaciones Exteriores de Colombia (cancilleria.gov.co).",
    "Colombia's Migrant visa (M) is the one for settling, and includes the categories Trabajador, Profesional Independiente and Socio o Propietario.":
      "La visa de Migrante (M) de Colombia es la de establecerse, e incluye las categorías Trabajador, Profesional Independiente y Socio o Propietario.",
    "There is also a Migrante Andino category for nationals of the Andean Community.":
      "También existe la categoría Migrante Andino para nacionales de la Comunidad Andina.",
    "Time held as a Migrant (M) counts towards the Resident (R) visa by accumulated stay in Colombia.":
      "El tiempo como Migrante (M) cuenta para la visa de Residente (R) por tiempo acumulado de permanencia en Colombia.",
    "This visa does not let you work or carry out paid activity for any person or company domiciled in Colombia.":
      "Esta visa no permite trabajar ni desarrollar actividad remunerada con ninguna persona o empresa domiciliada en Colombia.",
    "If your passport does not need a short-stay visa, you can enter without any visa and stay up to 90 days, extendable to a maximum of 180 days per calendar year, as long as no Colombian company pays you.":
      "Si tu pasaporte no necesita visa de corta estancia, puedes entrar sin visa y quedarte hasta 90 días, prorrogables hasta un máximo de 180 días por año calendario, siempre que ninguna empresa colombiana te pague.",
    "Colombia Visa de Visitante (V) — Estudiante":
      "Visa de Visitante (V) de Colombia — Estudiante",
    "Colombia Visa de Visitante (V) — Turismo":
      "Visa de Visitante (V) de Colombia — Turismo",
    "Colombia Visa de Migrante (M) — Trabajador":
      "Visa de Migrante (M) de Colombia — Trabajador",

    "Ecuador's temporary residence has a category for work under an employment relationship, and separate ones for autonomous work, professional services and consultancy.":
      "La residencia temporal de Ecuador tiene una categoría de trabajo bajo relación de dependencia, y otras aparte para trabajo autónomo, servicios profesionales y consultoría.",
    "There are also categories for Rentista, Jubilado, Inversionista and MERCOSUR nationals.":
      "También hay categorías de Rentista, Jubilado, Inversionista y MERCOSUR.",
    "Ecuador has a dedicated Estudiante category within its temporary residence visa.":
      "Ecuador tiene una categoría propia de Estudiante dentro de su visa de residencia temporal.",
    "Ecuador publishes a digital nomad category: Rentista para trabajo remoto (Visa Nomada), within its temporary residence visa.":
      "Ecuador tiene publicada una categoría de nómada digital: «Rentista para trabajo remoto (Visa Nómada)», dentro de su residencia temporal.",
    "Wayfare has not captured the specific requirements for this category from an official page: check them before you rely on this route.":
      "Wayfare no ha capturado de una página oficial los requisitos concretos de esta categoría: compruébalos antes de contar con esta vía.",
    "Always verify with the Ecuadorian Ministry of Foreign Affairs (cancilleria.gob.ec).":
      "Confirma siempre en el Ministerio de Relaciones Exteriores del Ecuador (cancilleria.gob.ec).",
    "Ecuador temporary residence — Estudiante":
      "Residencia temporal de Ecuador — Estudiante",
    "Ecuador temporary residence — Rentista para trabajo remoto (Visa Nomada)":
      "Residencia temporal de Ecuador — Rentista para trabajo remoto (Visa Nómada)",

    "Bolivia sorts nationalities into three groups: Group I needs no tourist visa, Group II does, and Group III also needs a prior entry authorisation from the Dirección General de Migración (DIGEMIG).":
      "Bolivia clasifica las nacionalidades en tres grupos: el Grupo I no necesita visa de turismo, el Grupo II sí, y el Grupo III necesita además una resolución previa de autorización de ingreso de la Dirección General de Migración (DIGEMIG).",
    "Visas are issued by Bolivian consulates and embassies abroad.":
      "Las visas las emiten los consulados y embajadas de Bolivia en el exterior.",
    "Always verify with Bolivia's consular network (consulados.cancilleria.gob.bo).":
      "Confirma siempre en la red consular de Bolivia (consulados.cancilleria.gob.bo).",
    "Panama does not have a single work route: it splits work between non-resident visas and temporary residence permits for labour reasons.":
      "Panamá no tiene una vía única de trabajo: lo reparte entre visas de no residente y permisos de residente temporal por razones laborales.",
    "Among temporary residence for labour reasons there is a category for foreign staff paid from abroad without diplomatic status, and others for government contractors, Colon Free Zone executives, international press correspondents and sports professionals.":
      "Dentro de residente temporal por razones laborales hay una categoría de personal extranjero remunerado desde el exterior sin estatus diplomático, y otras para contratados por el Gobierno, ejecutivos de la Zona Libre de Colón, corresponsales de prensa internacional y profesionales del deporte.",
    "As a non-resident there are also visas for occasional workers and technicians (V-TET), domestic workers and touring or occasional artists.":
      "Como no residente hay además visas para trabajadores eventuales y técnicos (V-TET), trabajadores domésticos y artistas transeúntes o eventuales.",
    "Each category is tied to a specific situation, so the right one depends on who hires you and where the money comes from.":
      "Cada categoría está atada a un supuesto concreto, así que la que te toca depende de quién te contrata y de dónde sale el dinero.",
    "Always verify with Panama's Servicio Nacional de Migración (migracion.gob.pa).":
      "Confirma siempre en el Servicio Nacional de Migración de Panamá (migracion.gob.pa).",
    "Panama work permits (no residente and residente temporal por razones laborales)":
      "Permisos de trabajo de Panamá (no residente y residente temporal por razones laborales)",

    "Whether your nationality needs a visa for Costa Rica is set by a single document, the Directrices Generales de Visas de Ingreso y Permanencia para No Residentes, reissued periodically: the version in force is dated November 2025.":
      "Que tu nacionalidad necesite visa para Costa Rica lo fija un único documento, las Directrices Generales de Visas de Ingreso y Permanencia para No Residentes, que se reedita cada cierto tiempo: la versión vigente es de noviembre de 2025.",
    "To reside there you must apply for a migratory category that fits your situation: permanent residence, temporary residence or one of the special categories.":
      "Para residir allí tienes que solicitar una categoría migratoria que se ajuste a tu situación: residencia permanente, residencia temporal o alguna de las categorías especiales.",
    "Always verify with Costa Rica's Dirección General de Migración y Extranjería (migracion.go.cr).":
      "Confirma siempre en la Dirección General de Migración y Extranjería de Costa Rica (migracion.go.cr).",
    "Guatemalan residence is the ordinary migratory status, temporary or permanent, and the temporary one can be renewed.":
      "La residencia guatemalteca es el estatus migratorio ordinario, temporal o permanente, y la temporal se puede prorrogar.",
    "Students are the exception to the five-year ceiling: a temporary student residence can be renewed for as long as the studies last.":
      "Los estudiantes son la excepción al tope de cinco años: la residencia temporal de estudiante se puede prorrogar mientras duren los estudios.",
    "To stay as a resident beyond five years you must move to permanent residence under article 78 of the Migration Code.":
      "Para seguir de residente más allá de cinco años tienes que pasar a residencia permanente, según el artículo 78 del Código de Migración.",
    "The general requirements are the application form, a valid original passport with a fully legalised copy, a criminal and police record certificate with apostille, a certificate of your last entry movement, and a 25 US dollar fee.":
      "Los requisitos generales son el formulario de solicitud, el pasaporte original vigente con copia completa legalizada, la carencia de antecedentes penales y policiales con apostilla, la certificación del último movimiento migratorio y una tasa de 25 dólares.",
    "Being a temporary resident for five years or more is one of the routes to permanent residence; for people born elsewhere in Central America it is one year.":
      "Haber sido residente temporal cinco años o más es una de las vías a la residencia permanente; para los nacidos en otros países de Centroamérica basta un año.",
    "Always verify with the Instituto Guatemalteco de Migración (igm.gob.gt).":
      "Confirma siempre en el Instituto Guatemalteco de Migración (igm.gob.gt).",
    "El Salvador publishes studies as its own temporary residence with its own form: F10 Residencia Temporal Estudios.":
      "El Salvador publica los estudios como residencia temporal propia con su formulario: F10 Residencia Temporal Estudios.",
    "El Salvador publishes work as its own temporary residence with its own form: F3 Residencia Temporal con Autorización de Trabajar.":
      "El Salvador publica el trabajo como residencia temporal propia con su formulario: F3 Residencia Temporal con Autorización de Trabajar.",
    "Each temporary residence has its own numbered form, and there are separate ones for investors, business people, pensioners, rentiers, shareholders and accompanying family.":
      "Cada residencia temporal tiene su propio formulario numerado, y hay unos aparte para inversionistas, personas de negocios, pensionados, rentistas, accionistas y familiares acompañantes.",
    "Always verify with El Salvador's Dirección General de Migración y Extranjería (migracion.gob.sv).":
      "Confirma siempre en la Dirección General de Migración y Extranjería de El Salvador (migracion.gob.sv).",
    "Costa Rica entry for non-residents (Directrices Generales de Visas)":
      "Ingreso de no residentes en Costa Rica (Directrices Generales de Visas)",
    "Guatemala residencia temporal (estudiante)":
      "Residencia temporal de Guatemala (estudiante)",
    "Guatemala residencia temporal (trabajador migrante)":
      "Residencia temporal de Guatemala (trabajador migrante)",
    "El Salvador Residencia Temporal Estudios (F10)":
      "Residencia Temporal de Estudios de El Salvador (F10)",
    "El Salvador Residencia Temporal con Autorizacion de Trabajar (F3)":
      "Residencia Temporal con Autorización de Trabajar de El Salvador (F3)",

    "The Dominican student permit (E-1) is a non-resident permit for studying at an officially registered institution, valid one year and renewable annually up to six years.":
      "El permiso de estudiante dominicano (E-1) es un permiso de no residente para estudiar en un centro registrado oficialmente, válido un año y renovable anualmente hasta seis años.",
    "You need a passport valid at least six months, the student visa (E), an apostilled birth certificate and a criminal record certificate from your country or wherever you lived in the last five years.":
      "Necesitas pasaporte con vigencia mínima de seis meses, la visa de estudiante (E), un acta de nacimiento apostillada y un certificado de antecedentes penales de tu país o de donde hayas residido en los últimos cinco años.",
    "The published catalogue of permits and residences covers business (NG-1), short stay (PCP), seasonal workers, labour temporary residence (RT-3), investors, pensioners and rentiers, and none of them is a digital nomad category.":
      "El catálogo publicado de permisos y residencias incluye negocios (NG-1), corto plazo (PCP), trabajadores temporeros, residencia temporal laboral (RT-3), inversionistas, jubilados y rentistas, y ninguno es una categoría de nómada digital.",
    "Always verify with the Dirección General de Migración of the Dominican Republic (migracion.gob.do).":
      "Confirma siempre en la Dirección General de Migración de la República Dominicana (migracion.gob.do).",
    "Work Where You Vacation waives work permits for participants and student permits for their children, who can enrol in Belizean schools.":
      "«Work Where You Vacation» exime del permiso de trabajo a los participantes y del permiso de estudios a sus hijos, que pueden matricularse en escuelas beliceñas.",
    "You must show annual earnings of at least US$75,000, and more for a couple or family, plus health insurance covering at least US$50,000.":
      "Tienes que acreditar ingresos anuales de al menos 75.000 USD, y más si sois pareja o familia, además de un seguro médico con cobertura mínima de 50.000 USD.",
    "For couples and families the income threshold rises to 100,000 US dollars a year.":
      "Para parejas y familias el umbral de renta sube a 100.000 dólares al año.",
    "You also need a notarised banking reference and statement, a criminal record no more than six months old, a valid passport and travel insurance with at least 50,000 US dollars of cover.":
      "Necesitas además una referencia bancaria notariada con extracto, un certificado de antecedentes de menos de seis meses, pasaporte vigente y un seguro de viaje con al menos 50.000 dólares de cobertura.",
    "The fee is 500 Belize dollars per adult and 200 per child under 18, and it is paid at the airport.":
      "La tasa es de 500 dólares beliceños por adulto y 200 por cada menor de 18 años, y se paga en el aeropuerto.",
    "Always verify with Belize's Immigration Department (immigration.gov.bz).":
      "Confirma siempre en el Departamento de Inmigración de Belice (immigration.gov.bz).",

    "South Africa issues a Remote Work visitor's visa under section 11(1)(b)(iv), for stays exceeding three months and up to three years.":
      "Sudáfrica emite una visa de visitante por trabajo remoto al amparo del artículo 11(1)(b)(iv), para estancias de más de tres meses y hasta tres años.",
    "It is for people who stay in the country to work for a foreign employer under a contract.":
      "Es para quien se queda en el país a trabajar para un empleador extranjero con un contrato.",
    "You must prove a gross salary of no less than the equivalent of 650,796 rand a year, shown through three months of bank statements.":
      "Tienes que acreditar un salario bruto de al menos el equivalente a 650.796 rand al año, con extractos bancarios de tres meses.",
    "You need a contract of employment signed by both you and the foreign-based employer, and a return flight ticket or reservation.":
      "Necesitas un contrato de trabajo firmado por ti y por el empleador extranjero, y un billete de vuelta o su reserva.",
    "Your passport must expire no less than 30 days after your intended departure date.":
      "Tu pasaporte tiene que caducar como mínimo 30 días después de la fecha prevista de salida.",
    "Holding this visa does not entitle you to take up employment in South Africa, and you cannot apply to change your status from inside the country except in exceptional circumstances.":
      "Tener esta visa no te da derecho a emplearte en Sudáfrica, y no puedes pedir un cambio de estatus desde dentro del país salvo en circunstancias excepcionales.",
    "If you stay more than 183 days in any 12 months you must register with the South African Revenue Service; if your country has no double-taxation treaty with South Africa, you must register regardless.":
      "Si te quedas más de 183 días en 12 meses tienes que darte de alta en la agencia tributaria sudafricana; si tu país no tiene convenio de doble imposición con Sudáfrica, tienes que darte de alta igualmente.",
    "Always verify with South Africa's Department of Home Affairs (dha.gov.za).":
      "Confirma siempre en el Departamento del Interior de Sudáfrica (dha.gov.za).",
    "Georgia has published a programme called Remotely from Georgia, open to nationals of 95 countries.":
      "Georgia tiene publicado un programa llamado «Remotely from Georgia», abierto a nacionales de 95 países.",
    "As published, it asks for a bank statement showing monthly income of at least 2,000 US dollars and health insurance valid for at least six months.":
      "Tal y como está publicado, pide un extracto bancario que muestre ingresos mensuales de al menos 2.000 dólares y un seguro médico válido al menos seis meses.",
    "Careful: the only official page Wayfare could capture is dated June 2022 and still requires an 8-day quarantine and PCR testing, so it is out of date and cannot be taken as current.":
      "Ojo: la única página oficial que Wayfare ha podido capturar está fechada en junio de 2022 y todavía exige cuarentena de 8 días y prueba PCR, así que está desactualizada y no puede darse por vigente.",
    "For many nationalities the simpler route is Georgia's visa-free entry, which allows a long stay without any programme.":
      "Para muchas nacionalidades la vía más sencilla es la entrada sin visado de Georgia, que permite una estancia larga sin ningún programa.",
    "The visa-free list comes from Government Ordinance No 255 of 5 June 2015, whose consolidated current version the Georgian legal register only serves behind a paywall.":
      "La lista de exención de visado sale de la Ordenanza gubernamental n.º 255, de 5 de junio de 2015, cuya versión consolidada vigente el registro legal georgiano solo sirve previo pago.",
    "Always verify with Georgia's Ministry of Foreign Affairs (geoconsul.gov.ge).":
      "Confirma siempre en el Ministerio de Asuntos Exteriores de Georgia (geoconsul.gov.ge).",
    "South Africa Remote Work visitor's visa (section 11(1)(b)(iv))":
      "Visa sudafricana de visitante por trabajo remoto (art. 11(1)(b)(iv))",
    "Georgia: Remotely from Georgia (source not updated since 2022)":
      "Georgia: «Remotely from Georgia» (fuente sin actualizar desde 2022)",

    "Nicaragua grants studies through a temporary residence, applied for at the Dirección General de Migración y Extranjería.":
      "Nicaragua tramita los estudios por una residencia temporal, que se solicita en la Dirección General de Migración y Extranjería.",
    "You need a pre-enrolment certificate from the institution stating your details, level, course and study period.":
      "Necesitas una constancia de pre matrícula del centro con tus datos, el nivel de estudios, la carrera y el periodo.",
    "You must also present a notarised declaration of where the money to fund your studies comes from, or one from whoever will cover your costs in Nicaragua.":
      "Tienes que presentar además una declaración notariada de dónde vienen los ingresos con los que financias tus estudios, o una de quien asuma tus gastos en Nicaragua.",
    "Your degree or school certificate, or your transcripts, must be apostilled or authenticated.":
      "Tu título profesional o de bachiller, o tus certificados de notas, tienen que estar apostillados o autenticados.",
    "Common requirements include a passport valid at least six months, a criminal record certificate covering the last three years, and a health certificate.":
      "Entre los requisitos comunes están un pasaporte con vigencia mínima de seis meses, un certificado de antecedentes penales de los últimos tres años y un certificado de salud.",
    "Documents from abroad must be translated into Spanish by a translator authorised before a notary with more than ten years in practice.":
      "Los documentos que vienen del exterior tienen que traducirse al español por un traductor autorizado ante un notario con más de diez años de ejercicio.",
    "Every step of the procedure has to be done in person.":
      "Todos los trámites son personales.",
    "Always verify with Nicaragua's Dirección General de Migración y Extranjería (migob.gob.ni).":
      "Confirma siempre en la Dirección General de Migración y Extranjería de Nicaragua (migob.gob.ni).",
    "Nicaragua residencia temporal (estudiante)":
      "Residencia temporal de Nicaragua (estudiante)",

    "Indonesia issues the student visa for one, two or four years, all extendable.":
      "Indonesia emite el visado de estudios por uno, dos o cuatro años, todos prorrogables.",
    "It lets you bring eligible family members, and to enter and leave the country while the re-entry permit is valid.":
      "Te permite traer a los familiares que reúnan los requisitos, y entrar y salir del país mientras el permiso de reentrada siga vigente.",
    "If you meet the conditions you get the electronic limited stay permit (e-ITAS) and the re-entry permit on arrival, without going to an immigration office.":
      "Si cumples las condiciones, recibes el permiso electrónico de estancia limitada (e-ITAS) y el de reentrada al llegar, sin pasar por una oficina de inmigración.",
    "You are prohibited from doing work or employment, from selling goods or services, and from receiving any payment or wages from people or companies in Indonesia.":
      "Tienes prohibido trabajar o emplearte, vender bienes o servicios, y recibir cualquier pago o salario de personas o empresas de Indonesia.",
    "You need a passport valid at least six months, proof of living expenses of at least 2,000 US dollars, a CV, a travel itinerary, a guarantee letter from an Indonesian guarantor or from the institution, and a letter of acceptance stating how long you will be enrolled.":
      "Necesitas pasaporte con vigencia mínima de seis meses, prueba de fondos de al menos 2.000 dólares, currículum, itinerario de viaje, carta de garantía de un avalista indonesio o del centro, y carta de admisión que indique cuánto tiempo estarás matriculado.",
    "The visa costs 6,000,000 rupiah for up to one year, 8,500,000 for two and 12,000,000 for four, and must be used within 90 days of issue.":
      "El visado cuesta 6.000.000 de rupias para un año, 8.500.000 para dos y 12.000.000 para cuatro, y hay que usarlo en los 90 días siguientes a su emisión.",
    /* v1.156.0 — Indonesia: trabajo. Lo que su fuente oficial NO publica */
    "Indonesia's official visa list has a family of work visas: the general Work Visa (E23), company officer visas (E25), offshore and maritime crew (E26), religious worker (E27) and researcher (E29).":
      "La lista oficial de visados de Indonesia tiene toda una familia de visados de trabajo: el visado de trabajo general (E23), los de cargos de empresa (E25), el de tripulación marítima y offshore (E26), el de trabajador religioso (E27) y el de investigador (E29).",
    "Of that whole family, Indonesia's immigration department has published the requirements of only one: the researcher visa. Every other work visa, including the general E23, is listed on the official site as data not yet available.":
      "De toda esa familia, la Dirección General de Inmigración de Indonesia solo ha publicado los requisitos de uno: el de investigador. Todos los demás, incluido el visado de trabajo general E23, figuran en el sitio oficial como datos aún no disponibles.",
    "For the researcher visa, the limited stay is one year counted from your date of arrival, and it can be extended online through the immigration e-visa portal.":
      "En el visado de investigador, la estancia limitada es de un año contado desde tu fecha de llegada, y se puede prorrogar en línea por el portal de visados de Inmigración.",
    "You need a sponsor to apply, and your sponsor must already hold an account on that portal before applying on your behalf.":
      "Necesitas un patrocinador para solicitarlo, y ese patrocinador debe tener ya una cuenta en ese portal antes de pedirlo en tu nombre.",
    "The published fee for the researcher visa is 6,000,000 rupiah for a one-year stay, made up of the visa, the limited stay permit, the re-entry permit and a verification charge.":
      "La tasa publicada del visado de investigador es de 6.000.000 de rupias por una estancia de un año, repartida entre el visado, el permiso de estancia limitada, el permiso de reingreso y un cargo de verificación.",
    "Always verify with Indonesia's Directorate General of Immigration (imigrasi.go.id).":
      "Confirma siempre en la Dirección General de Inmigración de Indonesia (imigrasi.go.id).",
    "It is renewable, and you can sponsor your spouse and children under the approved terms.":
      "Es renovable, y puedes patrocinar a tu cónyuge y a tus hijos según las condiciones aprobadas.",
    "The skilled-worker route needs a valid UAE employment contract in skill levels 1 to 3 of the Ministry of Human Resources classification.":
      "La vía de trabajador cualificado exige un contrato laboral vigente en los EAU dentro de los niveles 1 a 3 de la clasificación del Ministerio de Recursos Humanos.",
    "There is a third route for investors and business partners, who prove an investment or partnership in a UAE project.":
      "Hay una tercera vía para inversores y socios de negocio, que acreditan una inversión o participación en un proyecto en los EAU.",
    "When the residence expires there are grace periods, which gives more room than the employer-tied visa.":
      "Cuando la residencia caduca hay periodos de gracia, lo que da más margen que el visado atado a un empleador.",
    "Always verify with the Federal Authority for Identity and Citizenship (icp.gov.ae).":
      "Confirma siempre en la Autoridad Federal de Identidad y Ciudadanía de los EAU (icp.gov.ae).",
    "The alternative is being sponsored by a parent who is already a UAE resident.":
      "La alternativa es que te patrocine un progenitor que ya sea residente en los EAU.",
    "Outstanding students can qualify for the Golden visa, a long-term residence.":
      "Los estudiantes destacados pueden optar a la Golden visa, una residencia de larga duración.",
    "Always verify with the official UAE government portal (u.ae).":
      "Confirma siempre en el portal oficial del Gobierno de los EAU (u.ae).",
    "Indonesia student visa (e-ITAS on arrival)":
      "Visado de estudios de Indonesia (e-ITAS al llegar)",

    "Everyone who wants to work and live in Qatar needs a Work Residence Permit, and for that a Qatari employer, whether a company or an individual.":
      "Todo el que quiera trabajar y vivir en Qatar necesita un permiso de residencia por trabajo, y para eso un empleador catarí, sea empresa o particular.",
    "The permit lets you personally sponsor your spouse and children to come and live with you.":
      "El permiso te deja patrocinar personalmente a tu cónyuge y a tus hijos para que vengan a vivir contigo.",
    "The employer normally handles all the paperwork: they arrange a temporary visa on arrival which is then converted into the work residence permit.":
      "Normalmente el empleador se ocupa de todo el papeleo: gestiona un visado temporal de llegada que después se convierte en el permiso de residencia por trabajo.",
    "That conversion usually takes two to four weeks and sometimes longer, and you may NOT leave the country while it is going on.":
      "Esa conversión suele tardar de dos a cuatro semanas, a veces más, y NO puedes salir del país mientras dura.",
    "The permit is renewed every year by your employer, not by you.":
      "El permiso lo renueva cada año tu empleador, no tú.",
    "Each family member, including infants, needs their own Family Residence Visa, bought for one to five years and stamped in their passport.":
      "Cada familiar, incluidos los bebés, necesita su propio visado de residencia familiar, que se contrata de uno a cinco años y se sella en su pasaporte.",
    "Always verify with Qatar's official government portal (hukoomi.gov.qa).":
      "Confirma siempre en el portal oficial del Gobierno de Qatar (hukoomi.gov.qa).",
    "Qatar organises long stays around the residence permit, which needs a sponsor in the country.":
      "Qatar organiza las estancias largas en torno al permiso de residencia, que necesita un patrocinador en el país.",
    "Wayfare has not captured the specific student conditions from an official page: check them before you rely on this route.":
      "Wayfare no ha capturado de una página oficial las condiciones concretas para estudiantes: compruébalas antes de contar con esta vía.",
    "Qatar Work Residence Permit (RP)":
      "Permiso de residencia por trabajo de Qatar (RP)",
    "Qatar residence permit (studies)":
      "Permiso de residencia de Qatar (estudios)",

    "Sri Lanka offers a Digital Nomad Visa for foreign professionals who live and work remotely while serving clients or companies outside the country.":
      "Sri Lanka ofrece una visa de nómada digital para profesionales extranjeros que viven y trabajan en remoto atendiendo a clientes o empresas de fuera del país.",
    "It lasts one year, renewable annually, and your spouse and dependants can come with you.":
      "Dura un año, renovable anualmente, y tu cónyuge y personas a tu cargo pueden acompañarte.",
    "Holders can open Sri Lankan bank accounts, sign rental or lease agreements and enrol dependent children in international or private schools.":
      "Sus titulares pueden abrir cuentas bancarias en Sri Lanka, firmar contratos de alquiler o arrendamiento y matricular a sus hijos en colegios internacionales o privados.",
    "You must be 18 or older and be in remote employment, freelancing, or own a business not registered in Sri Lanka that serves clients abroad.":
      "Tienes que tener 18 años o más y estar en empleo remoto, ser autónomo o tener una empresa no registrada en Sri Lanka que atienda a clientes del exterior.",
    "You must remit at least 2,000 US dollars a month, plus 500 more for each dependant beyond two.":
      "Tienes que remitir al menos 2.000 dólares al mes, más 500 por cada persona a tu cargo a partir de la segunda.",
    "You need a police clearance certificate no older than three months, a medical clearance report, international health insurance covering care in Sri Lanka, and a recommendation from the Ministry of Digital Economy.":
      "Necesitas un certificado de antecedentes policiales de menos de tres meses, un informe médico, un seguro internacional que cubra la asistencia en Sri Lanka y una recomendación del Ministerio de Economía Digital.",
    "The fee is 500 US dollars a year for the main applicant and 500 for each spouse or dependant.":
      "La tasa es de 500 dólares al año para el solicitante principal y otros 500 por cada cónyuge o persona a cargo.",
    "To renew you must show tax registration with the Inland Revenue Department.":
      "Para renovarla tienes que acreditar tu alta fiscal en la Agencia Tributaria.",
    "You are not permitted to take local employment in Sri Lanka: all your income must come from abroad.":
      "No puedes tomar un empleo local en Sri Lanka: todos tus ingresos tienen que venir del extranjero.",
    "Any change in employment, income or dependants must be notified within 30 days, and breaking the conditions can cancel the visa immediately.":
      "Cualquier cambio de empleo, ingresos o personas a cargo hay que comunicarlo en 30 días, y saltarse las condiciones puede anular la visa de inmediato.",
    "Always verify with Sri Lanka's Department of Immigration and Emigration (immigration.gov.lk).":
      "Confirma siempre en el Departamento de Inmigración y Emigración de Sri Lanka (immigration.gov.lk).",
    "The official catalogue of visas published by the Bureau of Immigration of India has no digital nomad or remote work category.":
      "El catálogo oficial de visados que publica el Bureau of Immigration de India no tiene ninguna categoría de nómada digital ni de trabajo remoto.",
    "The official catalogue of visas published by Fiji's Ministry of Immigration has no digital nomad or remote work category.":
      "El catálogo oficial de visados que publica el Ministerio de Inmigración de Fiyi no tiene ninguna categoría de nómada digital ni de trabajo remoto.",
    "Always verify with the official immigration source of this destination.":
      "Confirma siempre en la fuente oficial de inmigración de este destino.",
    "Sri Lanka Digital Nomad Visa (DNV)":
      "Visa de nómada digital de Sri Lanka (DNV)",

    "The tourist visa also covers MICE events supported by the Thailand Convention Exhibition Bureau, recreational training such as scuba diving, boxing, Thai massage or culinary courses, visiting family for under 60 days, medical treatment and football trials.":
      "El visado de turismo cubre además eventos MICE respaldados por la Thailand Convention Exhibition Bureau, formación recreativa como submarinismo, boxeo, masaje tailandés o cocina, visitas familiares de menos de 60 días, tratamiento médico y pruebas de fútbol.",
    "You can only apply for the e-Visa if you are currently outside Thailand.":
      "Solo puedes solicitar el e-Visa si en ese momento estás fuera de Tailandia.",
    "Applicants no longer submit passports and documents in person at the embassy or consulate.":
      "Ya no hay que entregar el pasaporte ni los documentos en persona en la embajada o el consulado.",
    "Always verify with the Thai e-Visa portal of the Ministry of Foreign Affairs (thaievisa.go.th).":
      "Confirma siempre en el portal de e-Visa del Ministerio de Asuntos Exteriores de Tailandia (thaievisa.go.th).",
    "Thailand's official e-Visa portal publishes eighteen visa categories, from tourist and business to SMART, LTR and DTV, and none of them is a working holiday.":
      "El portal oficial de e-Visa de Tailandia publica dieciocho categorías de visado, desde turismo y negocios hasta SMART, LTR y DTV, y ninguna es de working holiday.",
    "Thailand's studying visas cover eight different situations, from elementary and secondary school to a bachelor's degree or higher.":
      "Los visados de estudios de Tailandia cubren ocho supuestos distintos, desde primaria y secundaria hasta grado universitario o superior.",
    "They also cover short courses of Thai or English, Muaythai training, curricular internships and exchange students, and vocational or technical diplomas below bachelor level.":
      "Cubren también cursos cortos de tailandés o inglés, entrenamiento de muay thai, prácticas curriculares e intercambios, y titulaciones profesionales o técnicas por debajo del grado.",

    "Singapore's Employment Pass has a two-stage framework: first the qualifying salary, then the points-based COMPASS.":
      "El Employment Pass de Singapur tiene un marco de dos etapas: primero el salario mínimo exigido y después el sistema de puntos COMPASS.",
    "If you do not meet the salary stage you are not eligible, no matter how many COMPASS points you would have scored.":
      "Si no llegas a la etapa del salario no eres elegible, por muchos puntos que hubieras sacado en COMPASS.",
    "The qualifying salary is currently 5,600 dollars a month outside financial services and 6,200 inside it, and it rises with age up to 10,700 and 11,800 at 45 or over.":
      "El salario exigido es ahora de 5.600 dólares al mes fuera de servicios financieros y 6.200 dentro, y sube con la edad hasta 10.700 y 11.800 a partir de los 45.",
    "From 1 January 2027 those minimums go up to 6,000 and 6,600, and up to 11,500 and 12,700 at 45 or over.":
      "Desde el 1 de enero de 2027 esos mínimos suben a 6.000 y 6.600, y hasta 11.500 y 12.700 a partir de los 45.",
    "COMPASS needs 40 points, scored on salary, qualifications, diversity, support for local employment, a shortage-occupation bonus and a strategic-priorities bonus.":
      "COMPASS exige 40 puntos, que se reparten entre salario, titulación, diversidad, apoyo al empleo local, una bonificación por ocupación con escasez y otra por prioridades estratégicas.",
    "You are exempt from COMPASS with a fixed monthly salary of at least 22,500 dollars, as an overseas intra-corporate transferee, or for a role of one month or less.":
      "Quedas exento de COMPASS con un salario fijo mensual de al menos 22.500 dólares, como traslado dentro de la misma empresa desde el extranjero, o para un puesto de un mes o menos.",
    "Your employer must also meet the Fair Consideration Framework job advertising requirement before applying.":
      "Tu empleador tiene además que cumplir el requisito de publicar la oferta del Fair Consideration Framework antes de solicitarlo.",
    "Always verify with Singapore's Ministry of Manpower (mom.gov.sg).":
      "Confirma siempre en el Ministerio de Trabajo de Singapur (mom.gov.sg).",
    "Singapore Employment Pass (EP)":
      "Employment Pass de Singapur (EP)",

    "The Accredited Employer Work Visa lets you work for an accredited employer who offers you at least 30 hours a week, and stay up to 5 years depending on the job.":
      "La Accredited Employer Work Visa te permite trabajar para un empleador acreditado que te ofrezca al menos 30 horas semanales, y quedarte hasta 5 años según el puesto.",
    "It can lead to a resident visa, and you may be able to support a visitor or work visa for your partner and visas for your dependent children.":
      "Puede llevar a una visa de residencia, y puedes llegar a respaldar una visa de visitante o de trabajo para tu pareja y visas para tus hijos a cargo.",
    "You can also study for up to 3 months in any 12-month period, or do any study your job requires.":
      "También puedes estudiar hasta 3 meses en cualquier periodo de 12 meses, o cursar lo que exija tu trabajo.",
    "You cannot start the application yourself: the accredited employer must send you the unique link or job token.":
      "No puedes iniciar la solicitud tú: el empleador acreditado tiene que enviarte el enlace único o el «job token».",
    "You must show you can speak and understand English if your job is at skill level 3 to 5.":
      "Tienes que demostrar que hablas y entiendes inglés si tu puesto está en los niveles de cualificación 3 a 5.",
    "The visa ties you to that employer: changing employer, job or location means varying your conditions, applying for a Job Change, or applying for a new visa.":
      "La visa te ata a ese empleador: cambiar de empleador, de puesto o de localidad exige modificar tus condiciones, pedir un «Job Change» o solicitar una visa nueva.",
    "If you have already had one and stayed the maximum time, you must spend the required time outside New Zealand before applying again.":
      "Si ya tuviste una y agotaste el tiempo máximo, tienes que pasar fuera de Nueva Zelanda el periodo exigido antes de volver a solicitarla.",
    "It costs from 1,540 New Zealand dollars, and 80% of applications are decided within 7.5 weeks.":
      "Cuesta desde 1.540 dólares neozelandeses, y el 80 % de las solicitudes se resuelven en 7,5 semanas.",
    "Always verify with Immigration New Zealand (immigration.govt.nz).":
      "Confirma siempre en Immigration New Zealand (immigration.govt.nz).",
    "As a temporary resident student you can ask the Instituto Nacional de Migración for authorisation to carry out paid activities in Mexico.":
      "Como residente temporal estudiante puedes pedir al Instituto Nacional de Migración autorización para desempeñar actividades remuneradas en México.",
    "Your funds can be proved by you, by your parents or guardian if you are under twenty-five, by a scholarship letter from the institution, or by a bank or financial document showing the funding.":
      "La solvencia puedes acreditarla tú, tus padres o tu tutor si tienes menos de veinticinco años, con una carta de beca del centro educativo, o con un documento bancario o financiero que acredite la financiación.",
    "Once in Mexico you have 30 calendar days from entry to apply for the temporary resident student card.":
      "Una vez en México tienes 30 días naturales desde tu ingreso para tramitar la tarjeta de residente temporal estudiante.",
    "The visa fee is 54 US dollars, and the appointment is booked through the MiConsulado portal.":
      "La tasa de la visa es de 54 dólares, y la cita se pide por el portal MiConsulado.",
    "Holding the visa does not guarantee entry: it only lets you present yourself at the border, where officers may interview you about your trip.":
      "Tener la visa no garantiza la entrada: solo te permite presentarte en el punto de entrada, donde pueden entrevistarte sobre el motivo de tu viaje.",
    "New Zealand Accredited Employer Work Visa (AEWV)":
      "Accredited Employer Work Visa de Nueva Zelanda (AEWV)",

    "Japan's working visa covers eleven categories, from professor, researcher and instructor to business manager, medical and legal services, journalist, artist and nursing care.":
      "El visado de trabajo de Japón cubre once categorías, desde profesor, investigador e instructor hasta gerente de empresa, servicios médicos y jurídicos, periodista, artista y cuidados de enfermería.",
    "The period of stay is 5 years, 3 years, 1 year or 3 months, and for business manager there is also a 4-month option.":
      "El periodo de estancia es de 5 años, 3 años, 1 año o 3 meses, y para gerente de empresa hay además una opción de 4 meses.",
    "You can apply without a Certificate of Eligibility, but then you must submit a large amount of verification documents and it can take several months.":
      "Puedes solicitarlo sin Certificado de Elegibilidad, pero entonces tienes que aportar muchísima documentación acreditativa y puede tardar varios meses.",
    "A proxy in Japan can apply for the Certificate of Eligibility on your behalf.":
      "Un apoderado en Japón puede solicitar el Certificado de Elegibilidad en tu nombre.",
    "Nationals of Russia, CIS countries and Georgia must submit two application forms and two photographs instead of one.":
      "Los nacionales de Rusia, de los países de la CEI y de Georgia tienen que presentar dos formularios y dos fotografías en vez de uno.",

    "Hungary's White Card is for people with a verified employment relationship in another country, or a share in a company with verified profit abroad, who do the work from Hungary using digital technology.":
      "La White Card húngara es para quien tiene una relación laboral acreditada en otro país, o participación en una empresa con beneficios acreditados en el extranjero, y hace ese trabajo desde Hungría con tecnología digital.",
    "It is issued for a year and can be extended once for another year.":
      "Se emite por un año y puede prorrogarse una vez por otro año.",
    "It is granted only to people who pursue no gainful activity in Hungary and hold no share in a Hungarian company.":
      "Solo se concede a quien no ejerce ninguna actividad lucrativa en Hungría ni tiene participación en una empresa húngara.",
    "You must show a monthly legal income of at least 3,000 euros net for the six months before entry.":
      "Tienes que acreditar ingresos legales mensuales de al menos 3.000 € netos durante los seis meses previos a la entrada.",
    "It is not granted if you qualify for other Hungarian permits, nor to students, posted workers, intra-corporate transfers or highly qualified workers admitted as such.":
      "No se concede si cumples las condiciones de otros permisos húngaros, ni a estudiantes, trabajadores desplazados, traslados dentro de la empresa o trabajadores altamente cualificados admitidos como tales.",
    "Always verify with Hungary's Directorate-General for Aliens Policing (oif.gov.hu).":
      "Confirma siempre en la Dirección General de Extranjería de Hungría (oif.gov.hu).",
    "Czechia runs a government-approved Digital Nomad Program for highly skilled IT and marketing specialists working remotely for a foreign employer or as self-employed.":
      "Chequia tiene un Programa de Nómadas Digitales aprobado por el Gobierno para especialistas altamente cualificados de TI y marketing que trabajan en remoto para un empleador extranjero o por cuenta propia.",
    "Your spouse, registered partner and dependent children can apply for a residence permit together with you.":
      "Tu cónyuge, pareja registrada e hijos a cargo pueden solicitar el permiso de residencia junto contigo.",
    "The programme is limited to a closed list of twelve nationalities: Australia, Brazil, Israel, Japan, Canada, South Korea, Mexico, New Zealand, Singapore, the United Kingdom, the United States and Taiwan.":
      "El programa está limitado a una lista cerrada de doce nacionalidades: Australia, Brasil, Israel, Japón, Canadá, Corea del Sur, México, Nueva Zelanda, Singapur, Reino Unido, Estados Unidos y Taiwán.",
    "Czechia's Digital Nomad Program is limited to a closed list of twelve nationalities, and yours is not on it.":
      "El Programa de Nómadas Digitales de Chequia está limitado a una lista cerrada de doce nacionalidades, y la tuya no está en ella.",
    "The list covers Australia, Brazil, Israel, Japan, Canada, South Korea, Mexico, New Zealand, Singapore, the United Kingdom, the United States and Taiwan.":
      "La lista incluye Australia, Brasil, Israel, Japón, Canadá, Corea del Sur, México, Nueva Zelanda, Singapur, Reino Unido, Estados Unidos y Taiwán.",
    "You must not hold, and must not have held in the previous year, a Czech long-term visa or long-term residence permit.":
      "No puedes tener, ni haber tenido en el año anterior, un visado checo de larga duración ni un permiso de residencia de larga duración.",
    "As an employee, your foreign employer must have at least 50 employees worldwide and remote work must be written into your contract or certified by the employer.":
      "Como empleado, tu empleador extranjero tiene que tener al menos 50 trabajadores en el mundo y el trabajo en remoto tiene que constar en tu contrato o estar certificado por el empleador.",
    "You must prove income of at least 1.5 times the average gross annual salary published by the Ministry of Labour and Social Affairs.":
      "Tienes que acreditar ingresos de al menos 1,5 veces el salario bruto anual medio que publica el Ministerio de Trabajo y Asuntos Sociales.",
    "IT specialists need STEM higher education or three years of proven IT experience; marketing specialists need at least three years of higher education in marketing, advertising or a related field.":
      "Los especialistas de TI necesitan estudios superiores STEM o tres años de experiencia acreditada en TI; los de marketing, al menos tres años de estudios superiores en marketing, publicidad o disciplinas afines.",
    "Always verify with Czechia's Ministry of Industry and Trade (mpo.gov.cz).":
      "Confirma siempre en el Ministerio de Industria y Comercio de Chequia (mpo.gov.cz).",
    "Hungary White Card (residency for digital nomads)":
      "White Card de Hungría (residencia para nómadas digitales)",
    "Czechia Digital Nomad Program (long-stay visa)":
      "Programa de Nómadas Digitales de Chequia (visado de larga duración)",

    "Latvia issues a one-year long-stay visa for remote work to people employed by, or self-employed and registered in, an OECD member state, who can do their job from Latvia.":
      "Letonia emite un visado de larga duración de un año para trabajo en remoto a quien está empleado por —o es autónomo registrado en— un país miembro de la OCDE y puede hacer su trabajo desde Letonia.",
    "Your employer must certify at least six months of previous employment with them, and that you can work remotely.":
      "Tu empleador tiene que certificar al menos seis meses de empleo previo con él, y que puedes trabajar en remoto.",
    "The income must be at least 2.5 times the previous year's average monthly gross salary: 4,213 euros according to the figure published by the Central Statistical Office.":
      "Los ingresos tienen que ser al menos 2,5 veces el salario bruto mensual medio del año anterior: 4.213 € según la cifra que publica la Oficina Central de Estadística.",
    "You need health insurance valid in Latvia and the Schengen states.":
      "Necesitas un seguro médico válido en Letonia y en los Estados Schengen.",
    "Holders of this visa have NO right to employment in Latvia.":
      "Los titulares de este visado NO tienen derecho a emplearse en Letonia.",
    "Always verify with Latvia's Office of Citizenship and Migration Affairs (pmlp.gov.lv).":
      "Confirma siempre en la Oficina de Ciudadanía y Asuntos Migratorios de Letonia (pmlp.gov.lv).",
    "Latvia long-stay visa for remote work":
      "Visado letón de larga duración para trabajo en remoto",

    "Slovenia introduced a temporary residence permit for digital nomads on 21 November 2025.":
      "Eslovenia introdujo un permiso de residencia temporal para nómadas digitales el 21 de noviembre de 2025.",
    "It is for non-EU and non-EEA citizens who work remotely for a business based outside Slovenia, or as self-employed abroad.":
      "Es para ciudadanos de fuera de la UE y del EEE que trabajan en remoto para una empresa con sede fuera de Eslovenia, o como autónomos en el extranjero.",
    "Because you are not entering the Slovenian labour market, you do not need the work permit the Employment Service normally issues.":
      "Como no entras en el mercado laboral esloveno, no necesitas el permiso de trabajo que expide normalmente el Servicio de Empleo.",
    "Family reunification is more favourable here: you can bring your family immediately, with no waiting period tied to how long you have lived there.":
      "La reagrupación familiar es aquí más favorable: puedes traer a tu familia de inmediato, sin plazos de espera ligados al tiempo que lleves viviendo allí.",
    "It is issued for up to one year and cannot be extended.":
      "Se emite por un máximo de un año y no se puede prorrogar.",
    "You can reapply six months after the previous permit expires.":
      "Puedes volver a solicitarlo seis meses después de que caduque el anterior.",
    "If you decide to stay on — for example to take a job in Slovenia — you can apply at any time during its validity for a different type of permit.":
      "Si decides quedarte —por ejemplo para aceptar un trabajo en Eslovenia— puedes pedir en cualquier momento de su vigencia otro tipo de permiso.",
    "You must show monthly funds of at least twice the average monthly net salary in Slovenia.":
      "Tienes que acreditar fondos mensuales de al menos el doble del salario neto medio mensual de Eslovenia.",
    "You apply at a Slovenian embassy or consulate abroad, or at any administrative unit if you already live there legally.":
      "Se solicita en una embajada o consulado de Eslovenia en el exterior, o en cualquier unidad administrativa si ya resides allí legalmente.",
    "Always verify with Slovenia's government portal (gov.si).":
      "Confirma siempre en el portal oficial del Gobierno de Eslovenia (gov.si).",
    "Slovenia temporary residence permit for digital nomads":
      "Permiso de residencia temporal para nómadas digitales de Eslovenia",

  },
};

/* Country display names per language (data layer stays code-only). */
window.COUNTRY_NAMES = {
  es: {
    AU: "Australia", NZ: "Nueva Zelanda", CA: "Canadá", US: "Estados Unidos",
    GB: "Reino Unido", DE: "Alemania", ES: "España", PT: "Portugal",
    NL: "Países Bajos", FR: "Francia", IT: "Italia", IE: "Irlanda",
    SE: "Suecia", EE: "Estonia", JP: "Japón", KR: "Corea del Sur",
    SG: "Singapur", AE: "Emiratos Árabes Unidos", TH: "Tailandia",
    MX: "México", BR: "Brasil", AR: "Argentina", CL: "Chile",
    CR: "Costa Rica", ZA: "Sudáfrica", GE: "Georgia",
    TW: "Taiwán", HK: "Hong Kong", IL: "Israel", RO: "Rumanía",
    SK: "Eslovaquia", SI: "Eslovenia", MT: "Malta", AD: "Andorra",
    LI: "Liechtenstein", CH: "Suiza", NO: "Noruega", DK: "Dinamarca",
    FI: "Finlandia", GR: "Grecia", PL: "Polonia", CZ: "República Checa",
    HU: "Hungría", HR: "Croacia", BG: "Bulgaria", CY: "Chipre",
    LT: "Lituania", LV: "Letonia", LU: "Luxemburgo", BE: "Bélgica",
    AT: "Austria", IS: "Islandia", TR: "Turquía", RU: "Rusia",
    UA: "Ucrania", RS: "Serbia", CN: "China", GQ: "Guinea Ecuatorial",
    BO: "Bolivia", CO: "Colombia", CU: "Cuba", DO: "República Dominicana",
    EC: "Ecuador", GT: "Guatemala", HN: "Honduras", NI: "Nicaragua",
    PA: "Panamá", PY: "Paraguay", PE: "Perú", SV: "El Salvador",
    UY: "Uruguay", VE: "Venezuela", BZ: "Belice",
    ID: "Indonesia", VN: "Vietnam", QA: "Catar", IN: "India",
    LK: "Sri Lanka", FJ: "Fiyi",
  },
};