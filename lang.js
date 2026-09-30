(function () {
  'use strict';

  var T = {
    fr: {
      /* hero */
      'headline-he1':   'JOUEZ, GAGNEZ,<br>RECOMMENCEZ !',
      'headline-he2':   'CONFIRMEZ<br>VOTRE ABONNEMENT',
      'headline-wifi1': 'JOUEZ, GAGNEZ,<br>RECOMMENCEZ !',
      'headline-wifi2': "CODE D'ACTIVATION<br>ENVOYÉ !",
      'subheadline':    'DES JEUX ILLIMITÉS, CHAQUE JOUR',
      'subheadline-wifi2': 'Saisissez le code reçu par SMS',
      'pricing':        '7.5 MAD / jour',
      /* buttons / labels */
      'btn-subscribe':  'SOUSCRIRE',
      'btn-subscribe-price': 'SOUSCRIRE · 7.5 MAD/J',
      'btn-confirm':    'CONFIRMER',
      'input-label-msisdn': 'Entrez votre numéro',
      'input-label-pin':    'Entrez votre code PIN',
      'small-note-he2': 'Abonnement sans engagement · <strong>7.5 MAD/J</strong>',
      'small-note-wifi2': 'Abonnement sans engagement · <strong>7.5 MAD/J</strong><br><a href="../wifi-step1/index.html" class="change-link">Changer de numéro</a>&nbsp;·&nbsp;<a href="#" id="resend-pin" class="change-link">Renvoyer le code</a>',
      /* legal */
      'tnc-title': 'Terms &amp; Conditions',
      'tnc-1': 'Play365Game est un portail de jeux HTML5 proposant une grande variété de jeux amusants et engageants, accessibles instantanément sur tout appareil.',
      'tnc-2': 'Le prix de ce service est de 7,5 MAD par jour. L\'abonnement se renouvelle automatiquement sauf résiliation.',
      'tnc-3': 'Pour se désabonner, l\'utilisateur doit envoyer STOP au 7012.',
      'tnc-4': 'Pour utiliser ce service, vous devez avoir plus de 18 ans ou avoir l\'autorisation de vos parents ou de la personne habilitée à payer votre facture mobile.'
    },
    ar: {
      /* hero */
      'headline-he1':   'العب، اربح،<br>كرر !',
      'headline-he2':   'أكّد<br>اشتراكك',
      'headline-wifi1': 'العب، اربح،<br>كرر !',
      'headline-wifi2': 'تم إرسال<br>رمز التفعيل !',
      'subheadline':    'ألعاب بلا حدود، كل يوم',
      'subheadline-wifi2': 'أدخل الرمز المستلم عبر SMS',
      'pricing':        '7.5 درهم / يوم',
      /* buttons / labels */
      'btn-subscribe':  'اشترك',
      'btn-subscribe-price': 'اشترك · 7.5 درهم/يوم',
      'btn-confirm':    'تأكيد',
      'input-label-msisdn': 'أدخل رقمك',
      'input-label-pin':    'أدخل رمز PIN',
      'small-note-he2': 'اشتراك بدون التزام · <strong>7.5 درهم/يوم</strong>',
      'small-note-wifi2': 'اشتراك بدون التزام · <strong>7.5 درهم/يوم</strong><br><a href="../wifi-step1/index.html" class="change-link">تغيير الرقم</a>&nbsp;·&nbsp;<a href="#" id="resend-pin" class="change-link">إعادة إرسال الرمز</a>',
      /* legal */
      'tnc-title': 'الشروط والأحكام',
      'tnc-1': 'Play365Game هو بوابة ألعاب HTML5 تقدم مجموعة واسعة من الألعاب الممتعة والسريعة، يمكن تشغيلها فوراً على أي جهاز.',
      'tnc-2': 'سعر هذه الخدمة هو 7.5 درهم في اليوم. يتجدد الاشتراك تلقائياً ما لم يتم إلغاؤه.',
      'tnc-3': 'لإلغاء الاشتراك، يجب على المستخدم إرسال STOP إلى 7012.',
      'tnc-4': 'لاستخدام هذه الخدمة، يجب أن يكون عمرك أكثر من 18 عاماً أو الحصول على إذن من والديك أو الشخص المخوّل بدفع فاتورة هاتفك.'
    }
  };

  function getLang() {
    return localStorage.getItem('p365Lang') || 'fr';
  }

  function setLang(lang) {
    localStorage.setItem('p365Lang', lang);
  }

  function applyLang(lang) {
    var isAr = lang === 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr';

    /* update all [data-i18n] elements */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (T[lang] && T[lang][key] !== undefined) {
        el.innerHTML = T[lang][key];
        /* re-bind resend-pin after innerHTML swap */
        if (key === 'small-note-wifi2') {
          var resend = document.getElementById('resend-pin');
          if (resend) {
            resend.addEventListener('click', function (e) {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('inwi:resendpin'));
            });
          }
        }
      }
    });

    /* update switcher button label */
    var btn = document.getElementById('langSwitchBtn');
    if (btn) btn.textContent = isAr ? 'FR' : 'AR';
  }

  function init() {
    var lang = getLang();
    applyLang(lang);

    var btn = document.getElementById('langSwitchBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = getLang() === 'fr' ? 'ar' : 'fr';
      setLang(next);
      applyLang(next);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
