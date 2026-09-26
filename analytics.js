/* Analytics loader for static GitHub Pages site.
   Yandex Metrika: 113093974
   Google Analytics is managed through GTM-PFM66NP6, not by direct gtag code.
   Tracking starts only after analytical-cookie consent.
*/
(() => {
  'use strict';

  const YM_ID = window.YM_COUNTER_ID;
  let initialized = false;
  let eventsBound = false;

  const readConsent = () => {
    try {
      const local = localStorage.getItem('olga_cookie_consent');
      if (local === 'all') return 'all';
    } catch (_) {}
    const match = document.cookie.match(/(?:^|; )olga_cookie_consent=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  const initYandex = () => {
    if (!YM_ID) return;
    if (window.ym && window.ym.__olgaInitialized) return;
    if (document.querySelector('script[src*="mc.yandex.ru/metrika/tag.js"]')) return;

    window.ym = window.ym || function(){
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym.l = Date.now();

    const s = document.createElement('script');
    s.src = 'https://mc.yandex.ru/metrika/tag.js?id=' + encodeURIComponent(YM_ID);
    s.async = true;
    s.onerror = () => console.warn('[analytics] Yandex Metrika failed to load');
    document.head.appendChild(s);

    window.ym(YM_ID, 'init', {
      ssr: true,
      webvisor: false,
      clickmap: true,
      ecommerce: 'dataLayer',
      referrer: document.referrer,
      url: location.href,
      accurateTrackBounce: true,
      trackLinks: true
    });

    window.ym.__olgaInitialized = true;
  };

  const track = (name, params = {}) => {
    if (!initialized) return;

    try {
      if (typeof window.ym === 'function' && YM_ID) {
        window.ym(YM_ID, 'reachGoal', name, params);
      }
    } catch (_) {}

    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({event: name}, params));
    } catch (_) {}
  };

  const bindEvents = () => {
    if (eventsBound) return;
    eventsBound = true;

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[data-booking]');
      if (link) {
        track('booking_click', {
          location: link.closest('section')?.id || 'unknown'
        });
      }

      const tg = event.target.closest('a[href*="t.me/olgastyleofmind"]');
      if (tg) {
        track('telegram_click', {
          location: tg.closest('section,footer')?.id || 'unknown'
        });
      }
    }, {passive:true});
  };

  const init = () => {
    if (initialized || readConsent() !== 'all') return;
    initialized = true;
    initYandex();
    bindEvents();
    track('analytics_ready');
  };

  window.trackEvent = track;

  window.addEventListener('olgaConsentChanged', init);
  document.addEventListener('DOMContentLoaded', init);
})();
