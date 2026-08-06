/* =============================================================================
   Wayfare — aperturas de cupo con fecha oficial publicada
   -----------------------------------------------------------------------------
   POR QUÉ EXISTE ESTE FICHERO. Hasta v1.166.0 estas fechas vivían escritas a
   mano dentro de seo/calendario-aperturas.html: eran afirmaciones publicadas
   —con fecha Y HORA— que quedaban fuera de todo el aparato de verificación del
   proyecto. Ninguna guardia las miraba.

   Ahora son datos con su cita literal, y de aquí salen las tres cosas: la tabla
   de la página, los recordatorios de calendario (.ics) y la comprobación
   automática. Una sola fuente de verdad.

   ── LA REGLA DE ORO DE LOS HUSOS ────────────────────────────────────────────
   Nueva Zelanda alterna NZST (UTC+12) y NZDT (UTC+13, horario de verano, del
   último domingo de septiembre al primer domingo de abril).

   Al capturar las fuentes el 5-ago-2026 apareció que la página oficial de
   URUGUAY dice «10:00 17 November 2026 (NZST)» — y el 17 de noviembre Nueva
   Zelanda está en NZDT. Las otras cuatro páginas sí concuerdan, así que es una
   errata suya, no nuestra.

   Para un cupo que se agota en horas, esa hora decide. Así que cuando el huso
   declarado NO concuerda con el que rige ese día, se toma el instante MÁS
   TEMPRANO de los dos posibles:

       llegar una hora antes no cuesta nada · llegar una hora tarde cuesta un año

   Y se dice en el recordatorio, para que quien lo lea sepa por qué.
   ========================================================================== */
(function () {
  "use strict";

  /* Horario de verano neozelandés: último domingo de septiembre → primer
     domingo de abril. Calculado, no escrito a mano, para que no caduque. */
  function domingoUltimo(anio, mes) {          // mes 0-11
    var d = new Date(Date.UTC(anio, mes + 1, 0));
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    return d;
  }
  function domingoPrimero(anio, mes) {
    var d = new Date(Date.UTC(anio, mes, 1));
    d.setUTCDate(d.getUTCDate() + ((7 - d.getUTCDay()) % 7));
    return d;
  }
  function husoRealNZ(fechaUTC) {
    var a = fechaUTC.getUTCFullYear();
    var iniActual = domingoUltimo(a, 8);        // septiembre
    var finActual = domingoPrimero(a, 3);       // abril
    var enVerano = (fechaUTC >= iniActual) || (fechaUTC < finActual);
    return enVerano ? "NZDT" : "NZST";
  }
  var OFFSET = { NZST: 12, NZDT: 13 };

  /* Cada entrada guarda lo que la fuente dice LITERALMENTE, y por separado lo
     que nosotros deducimos. Nunca se mezclan. */
  /* ── ESTADO DE CADA VÍA, comprobado en la fuente el 6-ago-2026 ────────────
     «abierta» y «cerrada» son estados VIVOS: cambian solos. Por eso va la fecha
     de comprobación al lado y la app la enseña. Un «cerrada» caducado engaña
     exactamente igual que un «abierta» caducado.

     De las 33 vías de working holiday de Nueva Zelanda: 25 abiertas, 8 cerradas
     — y de esas 8, dos (China y México) NO publican cuándo abren. Ahí no hay
     alarma posible, y la tarjeta lo dice en vez de callarlo. */
  var COMPROBADO = "2026-08-06";

  var ABIERTAS_NZ = ["AT", "BE", "CA", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GB", "HR", "HU", "IE", "IT", "JP", "LU", "LV", "NL", "NO", "PL", "PT", "SE", "TR", "US"];

  var APERTURAS = [
    { iso: "LT", pais: "Lituania", visa: "Working Holiday NZ", estado: "cerrada",
      fecha: "2026-08-19", hora: "10:00", husoDeclarado: "NZST",
      cita: "This visa will open at 10:00 on 19 August 2026 (NZST).",
      fuente: "https://www.immigration.govt.nz/visas/lithuania-working-holiday-visa/" },
    { iso: "AR", pais: "Argentina", visa: "Working Holiday NZ", estado: "cerrada",
      fecha: "2026-09-24", hora: "10:00", husoDeclarado: "NZST",
      cita: "This visa will open at 10:00 24 September 2026 (NZST).",
      fuente: "https://www.immigration.govt.nz/visas/argentina-working-holiday-visa/" },
    { iso: "PE", pais: "Perú", visa: "Working Holiday NZ", estado: "cerrada",
      fecha: "2026-10-01", hora: "10:00", husoDeclarado: "NZDT",
      cita: "This visa will open at 10:00 1 October 2026 (NZDT).",
      fuente: "https://www.immigration.govt.nz/visas/peru-working-holiday-visa/" },
    { iso: "BR", pais: "Brasil", visa: "Working Holiday NZ", estado: "cerrada",
      fecha: "2026-10-08", hora: "10:00", husoDeclarado: "NZDT",
      cita: "This visa will open at 10:00 8 October 2026 (NZDT).",
      fuente: "https://www.immigration.govt.nz/visas/brazil-working-holiday-visa/" },
    { iso: "CL", pais: "Chile", visa: "Working Holiday NZ", estado: "cerrada",
      fecha: "2026-10-15", hora: "10:00", husoDeclarado: "NZDT",
      cita: "This visa will open at 10:00 15 October 2026 (NZDT).",
      fuente: "https://www.immigration.govt.nz/visas/chile-working-holiday-visa/" },
    { iso: "UY", pais: "Uruguay", visa: "Working Holiday NZ", estado: "cerrada",
      fecha: "2026-11-17", hora: "10:00", husoDeclarado: "NZST",
      cita: "This visa will open at 10:00 17 November 2026 (NZST).",
      fuente: "https://www.immigration.govt.nz/visas/uruguay-working-holiday-visa/" },
    { iso: "CN", pais: "China", visa: "Working Holiday NZ", estado: "cerrada",
      fecha: null, hora: null, husoDeclarado: null,
      cita: null,   /* la fuente la marca CERRADA y no publica cuándo abre */
      fuente: "https://www.immigration.govt.nz/visas/china-working-holiday-visa/" },
    { iso: "MX", pais: "México", visa: "Working Holiday NZ", estado: "cerrada",
      fecha: null, hora: null, husoDeclarado: null,
      cita: null,   /* la fuente la marca CERRADA y no publica cuándo abre */
      fuente: "https://www.immigration.govt.nz/visas/mexico-working-holiday-visa/" },
  ];

  /* Resuelve cada apertura a un instante UTC, aplicando la regla de oro. */
  APERTURAS.forEach(function (a) {
    a.comprobado = COMPROBADO;
    if (!a.fecha) { a.instanteUTC = null; a.husoDiscrepa = false; return; }  /* cerrada sin fecha */
    var p = a.fecha.split("-").map(Number);
    var h = a.hora.split(":").map(Number);
    var mediodiaUTC = new Date(Date.UTC(p[0], p[1] - 1, p[2], 12));
    a.husoReal = husoRealNZ(mediodiaUTC);
    a.husoDiscrepa = a.husoReal !== a.husoDeclarado;

    /* offset MAYOR = instante más temprano en UTC. Ante duda, el más temprano. */
    var offset = a.husoDiscrepa
      ? Math.max(OFFSET[a.husoDeclarado], OFFSET[a.husoReal])
      : OFFSET[a.husoDeclarado];
    a.offsetUsado = offset;
    a.instanteUTC = new Date(Date.UTC(p[0], p[1] - 1, p[2], h[0] - offset, h[1]));
  });

  var API = {
    todas: function () { return APERTURAS.slice(); },
    comprobado: function () { return COMPROBADO; },
    /* solo las que se pueden convertir en recordatorio */
    conFecha: function () { return APERTURAS.filter(function (a) { return !!a.instanteUTC; }); },
    /* estado de una nacionalidad: null si no la conocemos */
    estadoDe: function (iso) {
      var c = APERTURAS.filter(function (a) { return a.iso === iso; })[0];
      if (c) return c;
      if (ABIERTAS_NZ.indexOf(iso) !== -1)
        return { iso: iso, visa: "Working Holiday NZ", estado: "abierta", comprobado: COMPROBADO };
      return null;
    },
    futuras: function (ahora) {
      var t = ahora || new Date();
      return APERTURAS.filter(function (a) { return a.instanteUTC > t; });
    },
    porIso: function (iso) {
      return APERTURAS.filter(function (a) { return a.iso === iso; });
    },
  };

  if (typeof window !== "undefined") window.APERTURAS = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})();
