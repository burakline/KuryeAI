/**
 * KuryeAI Blog — Ortak Firebase modülü
 * Auth (email/password) + Yorumlar + Beğeniler + Paylaşım
 */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js';
import {
  getAuth, onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile, signOut
} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js';
import {
  getFirestore, collection, doc, addDoc, setDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, onSnapshot,
  serverTimestamp, increment, updateDoc
} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';

const FB_CONFIG = {
  apiKey: 'AIzaSyDhXZ4RoT6DDJlNZBYArC6Zvy-MZ5fFC9Y',
  authDomain: 'kuryeai-99bf9.firebaseapp.com',
  projectId: 'kuryeai-99bf9',
  storageBucket: 'kuryeai-99bf9.firebasestorage.app',
  messagingSenderId: '1012295004135',
  appId: '1:1012295004135:web:0cceac0476175e19395742'
};

const app = getApps().find(a => a.name === 'blog') || initializeApp(FB_CONFIG, 'blog');
const auth = getAuth(app);
const db   = getFirestore(app);

/* ── POST SLUG ─────────────────────────────────────────────── */
const POST_SLUG = document.documentElement.dataset.postSlug || location.pathname.replace(/\//g, '_').replace(/^_|_$/g, '');

/* ── AUTH STATE ─────────────────────────────────────────────── */
let currentUser = null;
onAuthStateChanged(auth, user => {
  currentUser = user;
  renderAuthUI();
  if (user) { loadLike(); loadComments(); }
});

function renderAuthUI() {
  const bar = document.getElementById('blog-auth-bar');
  if (!bar) return;
  if (currentUser) {
    bar.innerHTML = `<span style="font-size:.78rem;color:#aaa">👤 ${currentUser.displayName || currentUser.email}</span>
      <button onclick="blogSignOut()" style="font-size:.72rem;background:transparent;border:.5px solid rgba(255,255,255,.15);color:#aaa;padding:.28rem .7rem;border-radius:6px;cursor:pointer;margin-left:.6rem">Çıkış</button>`;
  } else {
    bar.innerHTML = `<button onclick="openAuthModal('login')" style="font-size:.78rem;background:transparent;border:.5px solid rgba(0,200,215,.3);color:#00c8d7;padding:.32rem .85rem;border-radius:8px;cursor:pointer">Giriş Yap</button>
      <button onclick="openAuthModal('register')" style="font-size:.78rem;background:rgba(0,200,215,.12);border:.5px solid rgba(0,200,215,.3);color:#00c8d7;padding:.32rem .85rem;border-radius:8px;cursor:pointer;margin-left:.5rem">Kayıt Ol</button>`;
  }
}

/* ── MODAL ──────────────────────────────────────────────────── */
window.openAuthModal = function(tab = 'login') {
  document.getElementById('auth-modal').style.display = 'flex';
  // Varsayılan olarak giriş tabını göster — mevcut hesap sahipleri direkt girebilir
  switchTab(tab);
};
window.closeAuthModal = function() {
  document.getElementById('auth-modal').style.display = 'none';
  clearAuthMsg();
};
window.switchTab = function(tab) {
  document.getElementById('tab-login').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('tab-register').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('auth-tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('auth-tab-reg').classList.toggle('active', tab === 'register');
  // Giriş tabında: KuryeAI hesabı zaten varsa direkt kullanabilirsin notu
  const hint = document.getElementById('auth-hint');
  if (hint) {
    hint.textContent = tab === 'login'
      ? 'KuryeAI hesabın varsa aynı e-posta ve şifreyle giriş yapabilirsin.'
      : 'Hesabın yoksa buradan oluştur. Tüm KuryeAI hizmetlerinde geçerli.';
  }
  clearAuthMsg();
};

function clearAuthMsg() {
  const el = document.getElementById('auth-msg');
  if (el) { el.textContent = ''; el.style.color = '#ef4444'; }
}
function setAuthMsg(msg, ok = false) {
  const el = document.getElementById('auth-msg');
  if (el) { el.textContent = msg; el.style.color = ok ? '#22c55e' : '#ef4444'; }
}

window.doLogin = async function() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  if (!email || !pass) { setAuthMsg('E-posta ve şifre gerekli.'); return; }
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    closeAuthModal();
  } catch (e) {
    setAuthMsg(e.code === 'auth/invalid-credential' ? 'E-posta veya şifre hatalı.' : e.message);
  }
};

window.doRegister = async function() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  if (!name || !email || !pass) { setAuthMsg('Tüm alanları doldurun.'); return; }
  if (pass.length < 6) { setAuthMsg('Şifre en az 6 karakter olmalı.'); return; }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    closeAuthModal();
  } catch (e) {
    setAuthMsg(e.code === 'auth/email-already-in-use' ? 'Bu e-posta zaten kayıtlı.' : e.message);
  }
};

window.blogSignOut = async function() {
  await signOut(auth);
};

/* ── LIKES ──────────────────────────────────────────────────── */
async function loadLike() {
  if (!currentUser) return;
  const likeRef = doc(db, 'blog_likes', `${POST_SLUG}_${currentUser.uid}`);
  const snap = await getDoc(likeRef);
  setLikeBtn(snap.exists());
}

async function loadLikeCount() {
  const postRef = doc(db, 'blog_posts', POST_SLUG);
  const snap = await getDoc(postRef);
  const count = snap.exists() ? (snap.data().likeCount || 0) : 0;
  const el = document.getElementById('like-count');
  if (el) el.textContent = count;
}

function setLikeBtn(liked) {
  const btn = document.getElementById('like-btn');
  if (!btn) return;
  btn.classList.toggle('liked', liked);
  btn.title = liked ? 'Beğeniyi Kaldır' : 'Beğen';
}

window.toggleLike = async function() {
  if (!currentUser) { openAuthModal('login'); return; }
  const likeRef = doc(db, 'blog_likes', `${POST_SLUG}_${currentUser.uid}`);
  const postRef = doc(db, 'blog_posts', POST_SLUG);
  const snap = await getDoc(likeRef);
  if (snap.exists()) {
    await deleteDoc(likeRef);
    await setDoc(postRef, { likeCount: increment(-1) }, { merge: true });
    setLikeBtn(false);
  } else {
    await setDoc(likeRef, { postSlug: POST_SLUG, uid: currentUser.uid, createdAt: serverTimestamp() });
    await setDoc(postRef, { likeCount: increment(1) }, { merge: true });
    setLikeBtn(true);
  }
  loadLikeCount();
};

/* ── COMMENTS ───────────────────────────────────────────────── */
function loadComments() {
  const container = document.getElementById('comments-list');
  if (!container) return;
  const q = query(
    collection(db, 'blog_comments'),
    where('postSlug', '==', POST_SLUG),
    orderBy('createdAt', 'desc')
  );
  onSnapshot(q, snap => {
    if (snap.empty) {
      container.innerHTML = '<p style="font-size:.82rem;color:#666;text-align:center;padding:1.5rem 0">Henüz yorum yok. İlk yorumu sen yaz!</p>';
      return;
    }
    container.innerHTML = snap.docs.map(d => {
      const c = d.data();
      const date = c.createdAt?.toDate?.()?.toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' }) || '';
      return `<div style="padding:1rem 0;border-bottom:.5px solid rgba(255,255,255,.06)">
        <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.4rem">
          <span style="width:30px;height:30px;border-radius:50%;background:rgba(0,200,215,.15);display:inline-flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:#00c8d7">${(c.userName||'?')[0].toUpperCase()}</span>
          <span style="font-size:.82rem;font-weight:700;color:#e0e0e0">${escHtml(c.userName||'Anonim')}</span>
          <span style="font-size:.7rem;color:#666;margin-left:auto">${date}</span>
        </div>
        <p style="font-size:.85rem;color:#aaa;line-height:1.6;margin:0 0 0 36px">${escHtml(c.text)}</p>
      </div>`;
    }).join('');
  });
}

window.submitComment = async function() {
  if (!currentUser) { openAuthModal('login'); return; }
  const input = document.getElementById('comment-input');
  const text = input.value.trim();
  if (!text) return;
  const btn = document.getElementById('comment-submit-btn');
  btn.disabled = true;
  try {
    await addDoc(collection(db, 'blog_comments'), {
      postSlug: POST_SLUG,
      uid: currentUser.uid,
      userName: currentUser.displayName || currentUser.email.split('@')[0],
      text,
      createdAt: serverTimestamp()
    });
    input.value = '';
  } catch (e) { console.error(e); }
  btn.disabled = false;
};

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── SHARE ──────────────────────────────────────────────────── */
window.shareWA  = () => window.open(`https://wa.me/?text=${encodeURIComponent(document.title + ' ' + location.href)}`, '_blank');
window.shareX   = () => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(document.title)}&url=${encodeURIComponent(location.href)}`, '_blank');
window.copyLink = () => {
  navigator.clipboard.writeText(location.href);
  const btn = document.getElementById('copy-link-btn');
  if (btn) { btn.textContent = '✓ Kopyalandı'; setTimeout(() => btn.textContent = '🔗 Linki Kopyala', 2000); }
};

/* ── INIT ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadLikeCount();
  loadComments();
  renderAuthUI();
});
