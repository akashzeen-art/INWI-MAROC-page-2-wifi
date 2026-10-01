(function () {

  var TRANSLATIONS = {
    ar: {
      /* he-step1 */
      'heading-he1-line1': 'استمتع الآن',
      'heading-he1-span':  'الآن !',
      'desc-he1':          'انقر على الزر أدناه للبدء؛\nاشتراك بدون التزام',
      'btn-sub-line1':     'اشتراك',
      'btn-sub-line2':     '7.5 درهم/يوم',
      /* he-step2 */
      'heading-he2-line1': 'استمتع الآن',
      'heading-he2-span':  'الآن !',
      'desc-he2':          'انقر على الزر أدناه للبدء؛\nاشتراك بدون التزام',
      'btn-confirm':       'تأكيد',
      /* wifi-step1 */
      'heading-w1-line1':  'للاشتراك في',
      'heading-w1-span':   'Play 365 Game',
      'instruction-w1':    'أدخل رقم هاتفك',
      'placeholder-w1':    '07 00 00 00 00',
      'btn-w1-line1':      'اشتراك',
      'btn-w1-line2':      '7.5 درهم/يوم',
      /* wifi-step2 */
      'heading-w2-line1':  'تم إرسال',
      'heading-w2-line2':  'رمز التفعيل',
      'heading-w2-span':   'بنجاح !',
      'instruction-w2':    'أدخل الرمز المستلم عبر SMS',
      'btn-w2-confirm':    'تأكيد',
      'sub-info-w2':       'اشتراك بدون التزام',
      'resend-w2':         '↺ إعادة إرسال الرمز',
      /* shared */
      'tnc-link':  'الشروط والأحكام',
      'tnc-title': 'الشروط والأحكام',
      'tnc-1': 'Play365Game هو بوابة ألعاب HTML5 تقدم مجموعة واسعة من الألعاب الممتعة والسريعة، يمكن الوصول إليها فوراً على أي جهاز.',
      'tnc-2': 'سعر هذه الخدمة 7.5 درهم في اليوم. يتجدد الاشتراك تلقائياً ما لم يتم إلغاؤه.',
      'tnc-3': 'لإلغاء الاشتراك، يجب على المستخدم إرسال STOP إلى 7012.',
      'tnc-4': 'لاستخدام هذه الخدمة، يجب أن يكون عمرك أكثر من 18 عاماً أو الحصول على إذن من والديك أو الشخص المخوّل بدفع فاتورة هاتفك.',
    },
    fr: {
      /* he-step1 */
      'heading-he1-line1': 'Profitez en',
      'heading-he1-span':  'maintenant !',
      'desc-he1':          'Cliquez sur le bouton ci-dessous\npour commencer;\nAbonnement sans engagement',
      'btn-sub-line1':     'SOUSCRIRE',
      'btn-sub-line2':     '7.5MAD/JOUR',
      /* he-step2 */
      'heading-he2-line1': 'Profitez en',
      'heading-he2-span':  'maintenant !',
      'desc-he2':          'Cliquez sur le bouton ci-dessous\npour commencer;\nAbonnement sans engagement',
      'btn-confirm':       'CONFIRMER',
      /* wifi-step1 */
      'heading-w1-line1':  'Pour souscrire au',
      'heading-w1-span':   'Play 365 Game',
      'instruction-w1':    'Saisissez votre numéro\nde téléphone',
      'placeholder-w1':    '07 00 00 00 00',
      'btn-w1-line1':      'Souscrire',
      'btn-w1-line2':      '7.5 MAD / JOUR',
      /* wifi-step2 */
      'heading-w2-line1':  'Votre code',
      'heading-w2-line2':  "d'activation a été",
      'heading-w2-span':   'envoyé !',
      'instruction-w2':    'Saisissez votre code reçu\npar SMS',
      'btn-w2-confirm':    'CONFIRMER',
      'sub-info-w2':       'Abonnement sans engagement',
      'resend-w2':         '↺ Renvoyer le code',
      /* shared */
      'tnc-link':  'Termes & Conditions',
      'tnc-title': 'Termes & Conditions',
      'tnc-1': 'Play365Game est un portail de jeux HTML5 proposant une large variété de jeux amusants et engageants, accessibles instantanément sur tout appareil.',
      'tnc-2': "Le prix de ce service est de 7.5 MAD par jour. L'abonnement se renouvelle automatiquement sauf résiliation.",
      'tnc-3': "Pour se désabonner, l'utilisateur doit envoyer STOP au 7012.",
      'tnc-4': "Pour utiliser ce service, vous devez avoir plus de 18 ans ou avoir l'autorisation de vos parents ou de la personne habilitée à payer votre facture mobile.",
    }
  };

  var STORAGE_KEY = 'p365Lang';

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || 'ar';
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
  }

  function applyLang(lang) {
    var t = TRANSLATIONS[lang];
    if (!t) return;

    var html = document.documentElement;
    html.lang = lang;
    html.dir  = lang === 'ar' ? 'rtl' : 'ltr';

    /* update all [data-i18n] elements */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        if (el.tagName === 'INPUT') {
          el.placeholder = t[key];
        } else {
          /* preserve line breaks written as \n */
          el.innerHTML = t[key].replace(/\n/g, '<br>');
        }
      }
    });

    /* update dropdown button label */
    var btn = document.getElementById('langDropBtn');
    if (btn) btn.textContent = lang === 'ar' ? 'AR ▾' : 'FR ▾';

    /* mark active option */
    document.querySelectorAll('.lang-option').forEach(function (opt) {
      opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
    });
  }

  function initDropdown() {
    var btn   = document.getElementById('langDropBtn');
    var menu  = document.getElementById('langMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('open');
    });

    document.addEventListener('click', function () {
      menu.classList.remove('open');
    });

    document.querySelectorAll('.lang-option').forEach(function (opt) {
      opt.addEventListener('click', function (e) {
        e.stopPropagation();
        var lang = opt.getAttribute('data-lang');
        setLang(lang);
        applyLang(lang);
        menu.classList.remove('open');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDropdown();
    applyLang(getLang());
  });

})();
