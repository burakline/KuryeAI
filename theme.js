/* KuryeAI Theme Toggle */
(function () {
  var KEY = 'kuryeai-theme';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch(e) {}
    var btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  function inject() {
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

  // Apply saved theme (no FOUC — also applied inline in <head>)
  var saved = 'dark';
  try { saved = localStorage.getItem(KEY) || 'dark'; } catch(e) {}
  apply(saved);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
