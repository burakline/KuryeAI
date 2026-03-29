/**
 * lang.js — KuryeAI Dil Desteği (TR/EN)
 * Tüm sayfalara dahil edilir. localStorage ile dil tercihi saklanır.
 * Kullanım: Çevrilecek elementlere data-tr="..." data-en="..." ekle.
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'kuryeai-lang';
  const DEFAULT_LANG = 'tr';

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
  }

  function applyLang(lang) {
    document.querySelectorAll('[data-tr][data-en]').forEach(el => {
      const text = el.getAttribute('data-' + lang);
      if (text !== null) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else if (el.tagName === 'OPTION') {
          el.textContent = text;
        } else {
          el.innerHTML = text;
        }
      }
    });

    // Handle placeholder translations (data-tr-ph / data-en-ph)
    document.querySelectorAll('[data-tr-ph][data-en-ph]').forEach(el => {
      const ph = el.getAttribute('data-' + lang + '-ph');
      if (ph !== null) el.placeholder = ph;
    });

    // Update toggle buttons
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.textContent = lang === 'tr' ? 'EN' : 'TR';
      btn.setAttribute('title', lang === 'tr' ? 'Switch to English' : 'Türkçe\'ye geç');
    });

    document.documentElement.setAttribute('lang', lang);
  }

  function toggleLang() {
    const current = getLang();
    setLang(current === 'tr' ? 'en' : 'tr');
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyLang(getLang()));
  } else {
    applyLang(getLang());
  }

  // Expose globally
  window.toggleLang = toggleLang;
  window.getLang = getLang;
})();
