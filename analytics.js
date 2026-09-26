/* Analytics loader for static GitHub Pages site.
   Add real IDs in index.html:
   window.YM_COUNTER_ID = 113093974;
   window.GA_ID = null; // Google Analytics is managed through GTM.
   Tracking starts only after analytical-cookie consent.
*/
(() => {
  'use strict';

  const YM_ID = window.YM_COUNTER_ID;
  const GA_ID = window.GA_ID;
  let initialized = false;

  const readConsent = () => {
    try {
      const local = localStorage.getItem('olga_cookie_consent');
      if (local === 'all') return 'all';
    } catch (_) {}
    const match = document.cookie.match(/(?:^|; )olga_cookie_consent=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  const loadScript = (src) => new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="' + src + '"]');
    if (existing) {
      existing.addEventListener('load', resolve, {once:true});
      existing.addEventListener('error', reject, {once:true});
      if (existing.dataset.loaded === 'true') resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => { s.dataset.loaded = 'true'; resolve(); };
    s.onerror = reject;
    document.head.appendChild(s);
  });

  const initYandex = async () => {
    if (!YM_ID || window.ym) return;
    window.ym = window.ym || function(){ (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    const s = document.createElement('script');
    s.src = 'https://mc.yandex.ru/metrika/tag.js?id=' + encodeURIComponent(YM_ID);
    s.async = true;
    document.head.appendChild(s);
    window.ym(YM_ID, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: 'dataLayer',
      referrer: document.referrer,
      url: location.href,
      accurateTrackBounce: true,
      trackLinks: true
    });
  };

  const initGA = async () => {
    if (!GA_ID || window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {anonymize_ip: true});
    await loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID));
  };

  const track = (name, params = {}) => {
    if (!initialized) return;
    try {
      if (typeof window.ym === 'function' && YM_ID) {
        window.ym(YM_ID, 'reachGoal', name, params);
      }
    } catch (_) {}
    try {
      if (typeof window.gtag === 'function' && GA_ID) {
        window.gtag('event', name, params);
      }
    } catch (_) {}
  };

  const bindEvents = () => {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[data-booking]');
      if (link) track('booking_click', {location: link.closest('section')?.id || 'unknown'});
      const tg = event.target.closest('a[href*="t.me/olgastyleofmind"]');
      if (tg) track('telegram_click', {location: tg.closest('section,footer')?.id || 'unknown'});
    }, {passive:true});
  };

  const init = async () => {
    if (initialized || readConsent() !== 'all') return;
    initialized = true;
    await Promise.allSettled([initYandex(), initGA()]);
    bindEvents();
    track('analytics_ready');
  };

  window.addEventListener('olgaConsentChanged', init);
  document.addEventListener('DOMContentLoaded', init);
})();
