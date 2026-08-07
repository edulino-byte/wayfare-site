/* =============================================================================
   Wayfare — avisos por correo: configuración
   -----------------------------------------------------------------------------
   QUÉ ES ESTO. El sitio de Wayfare es estático: no hay servidor propio, y esa es
   una de sus mejores propiedades (nada que se caiga, coste cero, y el
   cuestionario nunca sale del navegador). Recoger correos NO rompe eso: se envían
   directamente al servicio de boletines, que es quien los guarda.

   POR QUÉ UN SERVICIO Y NO UN FORMULARIO CUALQUIERA. Lo caro de una lista de
   correo no es recogerla: es cumplir con ella. Un servicio de boletines resuelve
   de fábrica las tres cosas que exige la ley y que dan todo el trabajo:

     · DOBLE CONFIRMACIÓN — se envía un correo pidiendo confirmar. Sin eso,
       cualquiera puede apuntar el correo de otro, y no hay prueba de nada.
     · BAJA EN UN CLIC — obligatoria en todos los envíos (RGPD y LSSI art. 21).
     · REGISTRO DEL CONSENTIMIENTO — quién dijo que sí, cuándo y a qué. Es lo
       primero que se pide si alguien reclama.

   ── CÓMO ENCENDERLO ────────────────────────────────────────────────────────
   1. Abre una cuenta en un servicio de boletines. Conviene uno con los datos en
      la UE y doble confirmación incluida (Brevo, MailerLite y Buttondown la
      tienen; los dos primeros son europeos).
   2. Crea una lista y un formulario. Activa la DOBLE CONFIRMACIÓN.
   3. Copia la URL a la que ese formulario envía y pégala en ENDPOINT.
   4. Ajusta CAMPO_CORREO y CAMPO_TEMA al nombre que use tu servicio.

   ⚠️ NUNCA pegues aquí una clave de API. Este fichero se sirve al navegador y lo
   puede leer cualquiera. Los servicios dan una URL de formulario PÚBLICA
   justamente para esto: úsala, no la clave.

   MIENTRAS ENDPOINT SEA null, la app NO enseña el formulario. Nada a medias
   llega al usuario: o funciona de verdad, o no existe.
   ========================================================================== */
(function () {
  "use strict";

  var CONFIG = {
    /* Pega aquí la URL del formulario de tu servicio. Ejemplos de forma:
         Brevo       https://xxxxx.brevosend.com/...
         MailerLite  https://assets.mailerlite.com/jsonp/xxxxx/forms/xxxxx/subscribe
         Buttondown  https://buttondown.email/api/emails/embed-subscribe/TU_USUARIO  */
    ENDPOINT: null,

    /* Nombre del campo del correo, tal y como lo espera tu servicio.
       Suele ser "email"; MailerLite usa "fields[email]". */
    CAMPO_CORREO: "email",

    /* Campo opcional donde mandamos SOBRE QUÉ se suscribe (por ejemplo "AU").
       Sirve para no enviarle a alguien cambios de países que no le importan.
       Si tu servicio no admite campos extra, déjalo en null. */
    CAMPO_TEMA: null,

    /* ── VISTA PREVIA (v1.177.0) ──────────────────────────────────────────
       Con VISTA_PREVIA en true, el formulario SE PINTA pero no se puede
       rellenar: campos desactivados y un rótulo que dice que todavía no
       funciona. Es para que los amigos que están probando la beta vean cómo va
       a ser el producto y puedan opinar.

       El campo desactivado no es un detalle: si se dejara escribible, alguien
       pondría su correo de verdad creyendo que se suscribe, y no pasaría nada.
       Eso sería lo primero que Wayfare promete y no cumple — y por muy amigos
       que sean, es exactamente la confianza que este proyecto no gasta.

       Al pegar un ENDPOINT real, poner esto en false. */
    VISTA_PREVIA: true,

    /* Algunos servicios responden con CORS cerrado. Con "no-cors" el envío se
       hace igualmente pero el navegador no deja leer la respuesta: por eso la
       app dice «revisa tu correo» en vez de «suscrito», que además es lo cierto
       —hasta que no confirme, no está suscrito—. */
    MODO: "no-cors",
  };

  var API = {
    activo: function () { return typeof CONFIG.ENDPOINT === "string" && CONFIG.ENDPOINT.indexOf("http") === 0; },
    /* ¿hay que pintar el formulario? Sí si funciona de verdad, o si estamos
       enseñándolo como vista previa a quien prueba la beta. */
    visible: function () { return API.activo() || CONFIG.VISTA_PREVIA === true; },
    esVistaPrevia: function () { return !API.activo() && CONFIG.VISTA_PREVIA === true; },
    config: function () { return CONFIG; },

    /* Envía el alta. Devuelve una promesa que resuelve a true si el envío salió
       (que NO es lo mismo que estar suscrito: falta que confirme por correo). */
    suscribir: function (correo, tema) {
      if (!API.activo()) return Promise.reject(new Error("boletin sin configurar"));
      var datos = new FormData();
      datos.append(CONFIG.CAMPO_CORREO, correo);
      if (CONFIG.CAMPO_TEMA && tema) datos.append(CONFIG.CAMPO_TEMA, tema);
      return fetch(CONFIG.ENDPOINT, {
        method: "POST",
        mode: CONFIG.MODO,
        body: datos,
      }).then(function () { return true; });
    },
  };

  if (typeof window !== "undefined") window.BOLETIN = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})();
