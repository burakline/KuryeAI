/* KuryeAI Theme Toggle */
(function () {
  var KEY = 'kuryeai-theme';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch(e) {}
    // Eski floating emoji buton (diğer sayfalar için)
    var oldBtn = document.getElementById('theme-toggle-btn');
    if (oldBtn && oldBtn.classList.contains('theme-toggle')) {
      oldBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  function injectFallback() {
    // Eğer sayfada nav'a gömülü buton yoksa floating buton ekle (diğer sayfalar)
    if (document.getElementById('theme-toggle-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'theme-toggle-btn';
    btn.className = 'theme-toggle';
    btn.title = 'Temayı değiştir';
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    btn.textContent = current === 'dark' ? '☀️' : '🌙';
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
    });
    document.body.appendChild(btn);
  }

  function wireNavBtn() {
    var btn = document.getElementById('theme-toggle-btn');
    if (!btn || btn.classList.contains('theme-toggle')) return; // floating buton, zaten wired
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
    });
  }

  function init() {
    var hasNavBtn = !!document.getElementById('theme-toggle-btn');
    if (hasNavBtn) {
      wireNavBtn();
    } else {
      injectFallback();
    }
  }

  // Apply saved theme immediately (no FOUC)
  var saved = 'dark';
  try { saved = localStorage.getItem(KEY) || 'dark'; } catch(e) {}
  apply(saved);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
