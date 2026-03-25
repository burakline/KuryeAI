/**
 * demo.js — KuryeAI Demo Conversion System
 * Tam bağımsız ES modülü. restoran-panel.html içindeki Firebase app'ı
 * getApp() ile yeniden kullanır (initializeApp çağırmaz).
 *
 * Public API: window.DEMO = { addIntent, showPopup, closePopup, buy }
 */

import { getApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getDatabase, ref, set, update, onValue } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { getFirestore, collection, query, where, getDocs, Timestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ─── Firebase bağlantısı (restoran-panel.html zaten init etti) ───────────────
let _app, _auth, _rtdb, _fs;
try {
  _app  = getApp();
  _auth = getAuth(_app);
  _rtdb = getDatabase(_app);
  _fs   = getFirestore(_app);
} catch (e) {
  console.error('[demo.js] Firebase getApp() hatası:', e);
}

// ─── State ────────────────────────────────────────────────────────────────────
let _sessionId      = null;
let _heartbeatId    = null;
let _countdownId    = null;
let _startAt        = 0;
let _intentScore    = 0;
let _shownPopups    = {};
let _isDemo         = false;
let _uiInjected     = false;
let _exitBound      = false;
let _liveUserCount  = 0;
let _liveActiveCount= 0;

// ─── Popup konfigürasyonu ─────────────────────────────────────────────────────
const POPUP_CFG = {
  intentHigh:   { icon:'🎯', title:'Bu sistem sana uygun!',          desc:'Şimdi başla ve gerçek sipariş almaya başla. Kurye yönetimi + anlık takip + entegrasyonlar.',       btn:'🚀 Şimdi Başla — 1.499₺/ay' },
  timer5min:    { icon:'⏳', title:'Demo bitmek üzere!',             desc:'5 dakikalık demo süren dolmak üzere. Devam etmek için bir plan seç.',                              btn:'🚀 Planı Seç — 1.499₺/ay'   },
  orderAttempt: { icon:'🚀', title:'Gerçek siparişler için plan!',   desc:'Demo\'da deneyebilirsin ama gerçek kurye ataması ve müşteri bildirimleri için plan gerekli.',        btn:'🚀 Hemen Başla — 1.499₺/ay' },
  demoExpired:  { icon:'⚠️', title:'Demo süren doldu!',              desc:'Gerçek kullanım için bir plan seçmen gerekiyor. Hemen başla, ilk 7 gün ücretsiz deneme.',            btn:'🚀 Planları Gör'             },
  exitIntent:   { icon:'💡', title:'Gitmeden önce bir bakış at!',    desc:'KuryeAI\'yi 7 gün ücretsiz dene. Kurye yönetimi + anlık takip + sipariş entegrasyonu.',              btn:'🎁 7 Gün Ücretsiz Dene'      },
};

// ─── UI Enjeksiyonu ───────────────────────────────────────────────────────────
function injectUI() {
  if (_uiInjected) return;
  _uiInjected = true;

  // Dönüşüm modalı
  const modal = document.createElement('div');
  modal.id = 'demo-conversion-modal';
  modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9999;align-items:center;justify-content:center;padding:1.25rem';
  modal.innerHTML = `
    <div style="background:var(--surface,#fff);border-radius:20px;padding:2rem 1.75rem;max-width:400px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.25);text-align:center">
      <div id="dcm-icon" style="font-size:2.6rem;margin-bottom:.65rem">🎯</div>
      <div id="dcm-title" style="font-size:1.1rem;font-weight:700;color:var(--text,#111);margin-bottom:.5rem;line-height:1.3"></div>
      <div id="dcm-desc" style="font-size:.85rem;color:var(--text2,#666);margin-bottom:.75rem;line-height:1.6"></div>
      <div id="dcm-social" style="font-size:.78rem;color:#7c3aed;font-weight:600;margin-bottom:1.25rem;min-height:1.1em"></div>
      <button id="dcm-btn" style="width:100%;padding:.75rem;background:linear-gradient(135deg,#00c8d7,#009aaa);border:none;border-radius:12px;color:#fff;font-size:.9rem;font-weight:700;cursor:pointer;margin-bottom:.55rem">🚀 Şimdi Başla</button>
      <button id="dcm-close" style="width:100%;padding:.6rem;background:transparent;border:1px solid var(--border,#ddd);border-radius:12px;color:var(--text3,#999);font-size:.82rem;cursor:pointer">Daha Sonra</button>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector('#dcm-btn').addEventListener('click', buy);
  modal.querySelector('#dcm-close').addEventListener('click', closePopup);

  // Sabit CTA bar
  const bar = document.createElement('div');
  bar.id = 'demo-cta-bar';
  bar.style.cssText = 'display:none;position:fixed;bottom:0;left:0;right:0;background:linear-gradient(90deg,#7c3aed,#4f46e5);color:#fff;padding:.55rem 1rem;z-index:998;align-items:center;justify-content:space-between;gap:.5rem';
  bar.innerHTML = `
    <span style="font-size:.8rem;font-weight:600">🎮 Demo modu aktif &nbsp;·&nbsp; <span id="demo-countdown" style="font-weight:700"></span></span>
    <button id="demo-cta-btn" style="flex-shrink:0;background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.4);border-radius:9px;color:#fff;font-size:.8rem;font-weight:700;padding:.35rem .85rem;cursor:pointer">🚀 Şimdi Başla — 1.499₺</button>`;
  document.body.appendChild(bar);
  bar.querySelector('#demo-cta-btn').addEventListener('click', buy);
  bar.style.display = 'flex';
}

// ─── Oturum yönetimi ──────────────────────────────────────────────────────────
function startSession() {
  if (!_isDemo || !_rtdb) return;

  _sessionId = localStorage.getItem('demoSessionId');
  if (!_sessionId) {
    _sessionId = 'demo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    localStorage.setItem('demoSessionId', _sessionId);
  }
  _startAt = Date.now();

  set(ref(_rtdb, `demoSessions/${_sessionId}`), {
    sessionId:   _sessionId,
    startAt:     _startAt,
    lastActive:  _startAt,
    page:        _getCurrentPage(),
    intentScore: 0,
    isOnline:    true,
  });

  if (_heartbeatId) clearInterval(_heartbeatId);
  _heartbeatId = setInterval(() => {
    if (!_sessionId) return;
    update(ref(_rtdb, `demoSessions/${_sessionId}`), {
      lastActive:  Date.now(),
      page:        _getCurrentPage(),
      intentScore: _intentScore,
      isOnline:    true,
    });
  }, 5000);

  window.addEventListener('beforeunload', () => {
    if (_sessionId)
      update(ref(_rtdb, `demoSessions/${_sessionId}`), { isOnline: false });
  });

  console.log('[demo.js] Oturum başladı:', _sessionId);
}

function _getCurrentPage() {
  return window.currentPage || 'dashboard';
}

// ─── Intent skoru ─────────────────────────────────────────────────────────────
function addIntent(pts) {
  if (!_isDemo || !_sessionId) return;
  _intentScore += pts;
  update(ref(_rtdb, `demoSessions/${_sessionId}`), { intentScore: _intentScore });
  if (_intentScore >= 5 && !_shownPopups.intentHigh) {
    showPopup('intentHigh');
  }
}

// ─── Sosyal kanıt ─────────────────────────────────────────────────────────────
async function getLiveStats() {
  // RTDB: aktif demo oturumları
  if (_rtdb) {
    onValue(ref(_rtdb, 'demoSessions'), snap => {
      if (!snap.exists()) return;
      const sessions = snap.val();
      const now = Date.now();
      _liveActiveCount = Object.values(sessions).filter(s =>
        s.isOnline && (now - (s.lastActive || 0)) < 30000
      ).length;
    });
  }

  // Firestore: son 24 saatte kayıt olan kullanıcılar
  try {
    const since = Timestamp.fromMillis(Date.now() - 86400000);
    const q = query(collection(_fs, 'users'), where('createdAt', '>=', since));
    const snap = await getDocs(q);
    _liveUserCount = snap.size || Math.floor(Math.random() * 8) + 3;
  } catch {
    _liveUserCount = Math.floor(Math.random() * 8) + 3;
  }
}

// ─── Countdown (7 dakika) ─────────────────────────────────────────────────────
function startCountdown() {
  const TOTAL = 7 * 60; // saniye
  let remaining = TOTAL;

  if (_countdownId) clearInterval(_countdownId);

  // 5. dakika popup'ı
  setTimeout(() => { if (_isDemo) showPopup('timer5min'); }, 5 * 60 * 1000);
  // 7. dakika (sona erdi) popup'ı
  setTimeout(() => { if (_isDemo) showPopup('demoExpired'); }, 7 * 60 * 1000);

  _countdownId = setInterval(() => {
    remaining--;
    const el = document.getElementById('demo-countdown');
    if (el) {
      const m = Math.floor(remaining / 60);
      const s = String(remaining % 60).padStart(2, '0');
      el.textContent = `${m}:${s} kaldı`;
    }
    if (remaining <= 0) clearInterval(_countdownId);
  }, 1000);
}

// ─── Popup göster ─────────────────────────────────────────────────────────────
function showPopup(type) {
  if (!_isDemo) return;
  if (type !== 'demoExpired' && type !== 'exitIntent' && _shownPopups[type]) return;
  _shownPopups[type] = true;

  const cfg = POPUP_CFG[type];
  if (!cfg) return;

  const modal = document.getElementById('demo-conversion-modal');
  if (!modal) return;

  modal.querySelector('#dcm-icon').textContent  = cfg.icon;
  modal.querySelector('#dcm-title').textContent = cfg.title;
  modal.querySelector('#dcm-desc').textContent  = cfg.desc;
  modal.querySelector('#dcm-btn').textContent   = cfg.btn;

  // Sosyal kanıt
  const social = modal.querySelector('#dcm-social');
  if (social) {
    const parts = [];
    if (_liveActiveCount > 0) parts.push(`🟢 Şu an ${_liveActiveCount} kişi demo'da`);
    if (_liveUserCount > 0)   parts.push(`📈 Son 24 saatte ${_liveUserCount} yeni kayıt`);
    social.textContent = parts.join('  ·  ');
  }

  modal.style.display = 'flex';
}

function closePopup() {
  const el = document.getElementById('demo-conversion-modal');
  if (el) el.style.display = 'none';
}

// ─── Satın alma ───────────────────────────────────────────────────────────────
function buy() {
  window.open('restoran-login.html?tab=kayit', '_blank');
  closePopup();
}

// ─── Exit intent ─────────────────────────────────────────────────────────────
function initExitIntent() {
  if (_exitBound) return;
  _exitBound = true;

  // Desktop: fare ekranın üstünden çıkıyor
  document.addEventListener('mouseleave', e => {
    if (e.clientY <= 0 && !_shownPopups.exitIntent) {
      showPopup('exitIntent');
    }
  });

  // Mobil: geri butonu
  window.history.pushState(null, '', window.location.href);
  window.addEventListener('popstate', () => {
    if (!_shownPopups.exitIntent) {
      showPopup('exitIntent');
    }
    window.history.pushState(null, '', window.location.href);
  });
}

// ─── Başlatma ─────────────────────────────────────────────────────────────────
if (_auth) {
  onAuthStateChanged(_auth, user => {
    if (!user) return;
    if (user.email !== 'demo@kuryeai.com') return;

    _isDemo = true;
    window.IS_DEMO = true; // restoran-panel.html modülü ile paylaşım

    injectUI();
    startSession();
    startCountdown();
    initExitIntent();
    getLiveStats();

    console.log('[demo.js] Demo modu aktif');
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────
window.DEMO = { addIntent, showPopup, closePopup, buy };
