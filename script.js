/**
 * INWI Maroc 2026 — landing page (Digital Virgo guidelines)
 * WIFI flow : MSISDN → sendpin → PIN → verifypin → thankyou → service home
 * HE flow   : SOUSCRIRE (1st click) → CONFIRMER (2nd click) → subscribe → thankyou → service home
 * Price point: 6 MAD / jour
 */
(function () {
  "use strict";

  var CONFIG = {
    Play 365 Game_NAME: "Play 365 Game",
    Play 365 Game_DESC: "vous donne un accès illimité à tout le contenu premium du service.",
    PRICE: "6",
    CURRENCY: "MAD",
    SHORT_CODE: "XXXX",
    STOP_KEYWORD: "STOP",
    CUSCARE_EMAIL: "support@service.com",
    CUSCARE_PHONE: "",
    PORTAL_URL: "https://www.service-cm.com",

    // Leave API_BASE empty to run in demo mode (no network calls, any 4-digit PIN is accepted).
    API_BASE: "",
    ENDPOINTS: { sendpin: "sendpin", verifypin: "verifypin", subscribe: "subscribe" },
    // Optional: URL that returns {"msisdn":"2126XXXXXXXX"} when the user is on INWI mobile data.
    HE_CHECK_URL: "",
    PUB_ID_DEFAULT: "PUB_MA_INWI"
  };

  var COUNTRY = "212";
  var MSISDN_RE = /^[67][0-9]{8}$/;
  var PIN_LENGTH = 4;
  var DEMO = !CONFIG.API_BASE;

  var ERR = {
    empty: "Veuillez saisir votre numéro de téléphone.",
    invalid: "Numéro invalide. Veuillez saisir un numéro INWI valide (ex : 06 XX XX XX XX).",
    pin: "Veuillez saisir le code à 4 chiffres reçu par SMS.",
    pinFail: "Code incorrect. Veuillez vérifier le code reçu par SMS.",
    sendFail: "Impossible d’envoyer le code. Veuillez réessayer.",
    generic: "Une erreur est survenue. Veuillez réessayer."
  };

  /* —— helpers —— */
  function $(id) { return document.getElementById(id); }

  function persist(k, v) {
    if (v == null || v === "") return;
    try { sessionStorage.setItem(k, v); } catch (e) {}
    try { localStorage.setItem(k, v); } catch (e2) {}
  }

  function track(k) {
    try {
      var v = sessionStorage.getItem(k);
      if (v) return v;
    } catch (e) {}
    try { return localStorage.getItem(k) || ""; } catch (e2) { return ""; }
  }

  function isRealValue(v) {
    if (!v) return false;
    var s = String(v).trim();
    if (!s || s.indexOf("local_") === 0) return false;
    if (/^(clickid|subid|visitor_id)$/i.test(s)) return false;
    return s.indexOf("{") === -1 && s.indexOf("$") === -1 && s.indexOf("[[") === -1;
  }

  function normalizeLocal(raw) {
    var digits = String(raw || "").replace(/\D/g, "");
    if (digits.indexOf("00" + COUNTRY) === 0) digits = digits.slice(2 + COUNTRY.length);
    else if (digits.indexOf(COUNTRY) === 0 && digits.length > 9) digits = digits.slice(COUNTRY.length);
    if (digits.charAt(0) === "0") digits = digits.slice(1);
    return digits.slice(0, 9);
  }

  function fullMsisdn(local) { return COUNTRY + normalizeLocal(local); }

  function show(el, msg) {
    if (typeof el === "string") el = $(el);
    if (!el) return;
    el.textContent = msg || "";
    el.hidden = !msg;
  }

  function priceCta() { return CONFIG.PRICE + " " + CONFIG.CURRENCY + " / JOUR"; }
  function priceShort() { return CONFIG.PRICE + CONFIG.CURRENCY + "/J"; }

  function contactText() {
    var parts = [];
    if (CONFIG.CUSCARE_EMAIL) parts.push('<a href="mailto:' + CONFIG.CUSCARE_EMAIL + '">' + CONFIG.CUSCARE_EMAIL + "</a>");
    if (CONFIG.CUSCARE_PHONE) parts.push('<a href="tel:' + CONFIG.CUSCARE_PHONE.replace(/\s/g, "") + '">' + CONFIG.CUSCARE_PHONE + "</a>");
    return parts.join(" / ");
  }

  function offerText() {
    return "Abonnement quotidien à " + CONFIG.Play 365 Game_NAME + " : " + CONFIG.PRICE + " " + CONFIG.CURRENCY +
      "/jour TTC, renouvelé automatiquement chaque jour jusqu’à désabonnement. Abonnement sans engagement.";
  }

  function unsubText() {
    return "Désabonnement à tout moment : envoyez " + CONFIG.STOP_KEYWORD + " au " + CONFIG.SHORT_CODE +
      " (0 " + CONFIG.CURRENCY + "/SMS). Service client : " + contactText() + ".";
  }

  function tncHtml() {
    return [
      "<p><strong>" + CONFIG.Play 365 Game_NAME + "</strong> est un service d’abonnement proposé aux clients INWI au Maroc. " + CONFIG.Play 365 Game_NAME + " " + CONFIG.Play 365 Game_DESC + "</p>",
      "<p><strong>Tarif :</strong> " + CONFIG.PRICE + " " + CONFIG.CURRENCY + " par jour TTC, débité sur votre solde ou votre facture INWI. L’abonnement est renouvelé automatiquement chaque jour tant que vous ne vous êtes pas désabonné.</p>",
      "<p><strong>Souscription :</strong> en Wi-Fi, saisissez votre numéro puis le code PIN reçu par SMS. Sur le réseau mobile INWI, cliquez sur « Souscrire » puis confirmez en cliquant sur « Confirmer ». Un SMS de bienvenue contenant vos accès vous sera envoyé.</p>",
      "<p><strong>Désabonnement :</strong> envoyez " + CONFIG.STOP_KEYWORD + " au " + CONFIG.SHORT_CODE + " (SMS gratuit, 0 " + CONFIG.CURRENCY + "/SMS).</p>",
      "<p><strong>Service client :</strong> " + contactText() + ".</p>",
      "<p>Le service est réservé aux personnes âgées de plus de 18 ans ou disposant de l’autorisation du titulaire de la ligne. Les frais de connexion Internet mobile peuvent s’appliquer selon votre offre.</p>"
    ].join("");
  }

  function fillStatic() {
    document.title = CONFIG.Play 365 Game_NAME + " – INWI";
    document.querySelectorAll("[data-service-name]").forEach(function (el) { el.textContent = CONFIG.Play 365 Game_NAME; });
    document.querySelectorAll("[data-service-desc]").forEach(function (el) { el.textContent = CONFIG.Play 365 Game_DESC; });
    document.querySelectorAll("[data-price-cta]").forEach(function (el) { el.textContent = priceCta(); });
    document.querySelectorAll("[data-price-cta-caps]").forEach(function (el) { el.textContent = CONFIG.PRICE + CONFIG.CURRENCY + "/JOUR"; });
    document.querySelectorAll("[data-price-short]").forEach(function (el) { el.textContent = priceShort(); });
    document.querySelectorAll("[data-offer-text]").forEach(function (el) { el.textContent = offerText(); });
    document.querySelectorAll("[data-unsub-text]").forEach(function (el) { el.innerHTML = unsubText(); });
    var tnc = $("tnc-body");
    if (tnc) tnc.innerHTML = tncHtml();
  }

  /* —— tracking —— */
  function initTracking(params) {
    var clickId = params.get("clickid") || params.get("click_id") || params.get("subid") || params.get("gclid") || params.get("token");
    if (isRealValue(clickId)) persist("click_id", clickId);
    ["pub_id", "sub_pub_id", "sessionKey", "user_ip", "zoneid"].forEach(function (k) {
      var v = params.get(k);
      if (isRealValue(v)) persist(k, v);
    });
    if (!track("pub_id")) persist("pub_id", CONFIG.PUB_ID_DEFAULT);
    if (!track("sub_pub_id")) {
      var zone = params.get("zoneid") || params.get("zone_id") || params.get("campaignid");
      persist("sub_pub_id", isRealValue(zone) ? "ZONE" + zone : "0");
    }
  }

  function getClickId() {
    var existing = track("click_id");
    if (isRealValue(existing)) return existing;
    var fallback = track("local_click_id");
    if (!fallback) {
      fallback = "local_" + Date.now();
      persist("local_click_id", fallback);
    }
    return fallback;
  }

  function commonParams(extra) {
    var p = {
      msisdn: track("msisdn"),
      pub_id: track("pub_id") || CONFIG.PUB_ID_DEFAULT,
      sub_pub_id: track("sub_pub_id") || getClickId(),
      click_id: getClickId(),
      user_ip: track("user_ip") || "",
      ua: navigator.userAgent || ""
    };
    var sk = track("sessionKey");
    if (sk) p.sessionKey = sk;
    if (extra) Object.keys(extra).forEach(function (k) { p[k] = extra[k]; });
    return p;
  }

  /* —— API —— */
  function callApi(name, params) {
    params = params || {};
    params.timestamp = String(Date.now());

    if (DEMO) {
      console.info("[DEMO] " + name, params);
      return new Promise(function (resolve) {
        setTimeout(function () { resolve({ status: true, msg: "demo success" }); }, 700);
      });
    }

    var url = CONFIG.API_BASE.replace(/\/$/, "") + "/" + CONFIG.ENDPOINTS[name] + "?" + new URLSearchParams(params).toString();
    return fetch(url, { method: "GET", credentials: "omit", cache: "no-store" })
      .then(function (res) { return res.text(); })
      .then(function (text) {
        try { return JSON.parse(text); }
        catch (e) { throw { key: "generic", raw: text }; }
      });
  }

  function isOk(resp) {
    if (!resp) return false;
    if (resp.status === true || resp.status === "true" || resp.status === 1 || resp.status === "success") return true;
    return /success|active/i.test(String(resp.msg || resp.message || ""));
  }

  function busy(btn, loader, on) {
    if (loader) loader.hidden = !on;
    if (btn) btn.disabled = on;
  }

  function goThankYou() {
    persist("converted", "1");
    window.location.href = "thankyou.html";
  }

  /* —— steps —— */
  var STEPS = ["step-msisdn", "step-pin", "step-he1", "step-he2"];
  function goStep(id) {
    STEPS.forEach(function (s) {
      var el = $(s);
      if (el) el.hidden = s !== id;
    });
    window.scrollTo(0, 0);
  }

  function detectHeMsisdn(params) {
    var direct = params.get("msisdn") || params.get("MSISDN");
    if (isRealValue(direct) && MSISDN_RE.test(normalizeLocal(direct))) {
      return Promise.resolve(fullMsisdn(direct));
    }
    if (!CONFIG.HE_CHECK_URL) return Promise.resolve("");
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 2500);
    return fetch(CONFIG.HE_CHECK_URL, ctrl ? { signal: ctrl.signal, cache: "no-store" } : { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        clearTimeout(timer);
        var m = d && (d.msisdn || d.MSISDN);
        return m && MSISDN_RE.test(normalizeLocal(m)) ? fullMsisdn(m) : "";
      })
      .catch(function () { clearTimeout(timer); return ""; });
  }

  /* —— WIFI flow —— */
  function initWifi() {
    var input = $("msisdn");
    var btn = $("btn-subscribe");
    var loader = $("loader-msisdn");
    var pinInput = $("pin");
    var pinBtn = $("btn-confirm-pin");
    var pinLoader = $("loader-pin");

    function msisdnState() {
      var local = normalizeLocal(input.value);
      var ok = MSISDN_RE.test(local);
      btn.disabled = !ok;
      return { local: local, ok: ok };
    }

    input.addEventListener("input", function () {
      input.value = input.value.replace(/[^\d+\s]/g, "");
      show("err-msisdn", "");
      msisdnState();
    });

    function sendPin(onDone) {
      return callApi("sendpin", commonParams()).then(function (resp) {
        if (resp && resp.sessionKey) persist("sessionKey", resp.sessionKey);
        onDone(isOk(resp), resp);
      }).catch(function () { onDone(false); });
    }

    btn.addEventListener("click", function () {
      var st = msisdnState();
      if (!st.local) return show("err-msisdn", ERR.empty);
      if (!st.ok) return show("err-msisdn", ERR.invalid);
      show("err-msisdn", "");
      persist("msisdn", fullMsisdn(st.local));
      busy(btn, loader, true);
      sendPin(function (ok, resp) {
        busy(btn, loader, false);
        if (!ok) return show("err-msisdn", (resp && resp.msg) || ERR.sendFail);
        goStep("step-pin");
        pinInput.focus();
      });
    });

    function pinValue() {
      var v = String(pinInput.value || "").replace(/\D/g, "").slice(0, PIN_LENGTH);
      pinInput.value = v;
      pinBtn.disabled = v.length !== PIN_LENGTH;
      return v;
    }

    pinInput.addEventListener("input", function () {
      show("err-pin", "");
      pinValue();
    });

    pinBtn.addEventListener("click", function () {
      var otp = pinValue();
      if (otp.length !== PIN_LENGTH) return show("err-pin", ERR.pin);
      show("err-pin", "");
      busy(pinBtn, pinLoader, true);
      callApi("verifypin", commonParams({ otp: otp }))
        .then(function (resp) {
          if (!isOk(resp)) {
            busy(pinBtn, pinLoader, false);
            return show("err-pin", (resp && resp.msg) || ERR.pinFail);
          }
          goThankYou();
        })
        .catch(function () {
          busy(pinBtn, pinLoader, false);
          show("err-pin", ERR.generic);
        });
    });

    $("resend-pin").addEventListener("click", function (e) {
      e.preventDefault();
      show("err-pin", "");
      show("info-pin", "");
      sendPin(function (ok, resp) {
        if (ok) show("info-pin", "Un nouveau code vous a été envoyé par SMS.");
        else show("err-pin", (resp && resp.msg) || ERR.sendFail);
      });
    });

    $("change-number").addEventListener("click", function (e) {
      e.preventDefault();
      pinInput.value = "";
      pinValue();
      show("err-pin", "");
      show("info-pin", "");
      goStep("step-msisdn");
      input.focus();
    });

    goStep("step-msisdn");
  }

  /* —— HE flow (2-click) —— */
  function initHe(msisdn) {
    persist("msisdn", msisdn);
    var heParams = msisdn ? { msisdn: msisdn } : {};
    var btn1 = $("btn-he-subscribe");
    var btn2 = $("btn-he-confirm");
    var loader = $("loader-he");

    btn1.addEventListener("click", function () { goStep("step-he2"); });

    btn2.addEventListener("click", function () {
      show("err-he", "");
      busy(btn2, loader, true);
      callApi("subscribe", commonParams(heParams))
        .then(function (resp) {
          if (!isOk(resp)) {
            busy(btn2, loader, false);
            return show("err-he", (resp && resp.msg) || ERR.generic);
          }
          goThankYou();
        })
        .catch(function () {
          busy(btn2, loader, false);
          show("err-he", ERR.generic);
        });
    });

    goStep("step-he1");
  }

  /* —— T&C modal —— */
  function initTnc() {
    var open = $("tnc-open");
    var modal = $("tnc-modal");
    if (!open || !modal) return;
    open.addEventListener("click", function (e) { e.preventDefault(); modal.hidden = false; });
    $("tnc-close").addEventListener("click", function () { modal.hidden = true; });
    modal.addEventListener("click", function (e) { if (e.target === modal) modal.hidden = true; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") modal.hidden = true; });
  }

  /* —— thank you → service home —— */
  function initThankYou() {
    var portal = CONFIG.PORTAL_URL;
    var msisdn = track("msisdn");
    if (msisdn) portal += (portal.indexOf("?") === -1 ? "?" : "&") + "msisdn=" + encodeURIComponent(msisdn);
    var go = $("ty-go");
    if (go) go.href = portal;
    var n = 5;
    var el = $("ty-timer");
    var t = setInterval(function () {
      n -= 1;
      if (el) el.textContent = String(Math.max(n, 0));
      if (n <= 0) {
        clearInterval(t);
        window.location.href = portal;
      }
    }, 1000);
  }

  /* —— init —— */
  fillStatic();

  if (document.body.classList.contains("ty-page")) {
    initThankYou();
    return;
  }

  var params = new URLSearchParams(window.location.search);
  initTracking(params);
  getClickId();
  initTnc();

  var forced = (params.get("flow") || "").toLowerCase();
  if (forced === "wifi") {
    initWifi();
  } else if (forced === "he") {
    detectHeMsisdn(params).then(function (m) { initHe(m || track("msisdn")); });
  } else {
    detectHeMsisdn(params).then(function (m) {
      if (m) initHe(m);
      else initWifi();
    });
  }

  window.addEventListener("pageshow", function (e) { if (e.persisted) window.location.reload(); });
})();
