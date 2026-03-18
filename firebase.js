// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getMessaging,
  getToken,
  onMessage
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

/* 🔥 CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
  authDomain: "kuryeai.firebaseapp.com",
  projectId: "kuryeai",
  storageBucket: "kuryeai.appspot.com",
  messagingSenderId: "562153733113",
  appId: "1:562153733113:web:61d9242d0af1da6a081b28"
};

/* INIT */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

/* ========================= */
/* 🔔 NOTIFICATION INIT (DEBUG) */
/* ========================= */
window.initNotifications = async function () {

  try {

    alert("🔔 Bildirim başlatılıyor...");

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("❌ Bildirim izni verilmedi");
      return;
    }

    alert("✅ İzin verildi");

    const token = await getToken(messaging, {
      vapidKey: "BNWTY3G-gaXdthi2kzQIsUSBnLvMHh0YkjBcCkqsv6fpiiYSfb_WvTwqO_lQSCxFhJ4pdNYRYGuxUhIdO-oCieA"
    });

    if (!token) {
      alert("❌ Token alınamadı!");
      return;
    }

    alert("🔥 TOKEN ALINDI:\n\n" + token);

    return token;

  } catch (err) {
    alert("❌ HATA:\n" + err.message);
    console.error(err);
  }

};

/* 🔔 FOREGROUND */
onMessage(messaging, () => {
  alert("📦 Yeni sipariş geldi!");
});

/* ========================= */
/* 🔐 LOGIN */
/* ========================= */
window.loginUser = async function (email, password, remember = false) {
  try {

    email = email.trim().toLowerCase();

    await setPersistence(
      auth,
      remember ? browserLocalPersistence : browserSessionPersistence
    );

    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    const snap = await getDoc(doc(db, "users", uid));

    if (!snap.exists()) {
      alert("Kullanıcı rolü yok");
      return;
    }

    redirect(snap.data().role);

  } catch (e) {
    alert("❌ " + e.message);
  }
};

/* ========================= */
/* 🆕 REGISTER */
/* ========================= */
window.registerUser = async function (email, password, role = "courier") {
  try {

    email = email.trim().toLowerCase();

    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    await setDoc(doc(db, "users", uid), {
      email,
      role,
      createdAt: Date.now()
    });

    alert("✅ Kayıt başarılı");

  } catch (e) {
    alert("❌ " + e.message);
  }
};

/* ========================= */
/* 📦 ORDER CREATE */
/* ========================= */
window.createOrder = async function (data) {
  await addDoc(collection(db, "orders"), {
    ...data,
    status: "pending",
    createdAt: Date.now()
  });
};

/* ========================= */
/* 🚪 LOGOUT */
/* ========================= */
window.logoutUser = async function () {
  await signOut(auth);
  window.location.href = "index.html";
};

/* ========================= */
/* 🔀 REDIRECT */
/* ========================= */
function redirect(role) {

  if (window.location.pathname.includes(role)) return;

  if (role === "admin") {
    window.location.href = "admin.html";
  } else if (role === "restaurant") {
    window.location.href = "restaurant.html";
  } else {
    window.location.href = "courier.html";
  }

}

export { db, auth };