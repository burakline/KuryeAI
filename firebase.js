// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
  authDomain: "kuryeai.firebaseapp.com",
  projectId: "kuryeai",
  storageBucket: "kuryeai.appspot.com",
  messagingSenderId: "655930514402",
  appId: "1:655930514402:web:379321cbb83f48daf077bb"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const auth = getAuth(app);

// 🔔 SERVICE WORKER
async function registerSW() {
  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("✅ SW OK:", reg);
    return reg;
  } else {
    alert("Service worker yok ❌");
  }
}

// 🔔 TOKEN
async function requestNotificationPermission() {

  try {

    console.log("🔔 Bildirim izni isteniyor...");

    const permission = await Notification.requestPermission();

    console.log("İzin:", permission);

    if (permission !== "granted") {
      alert("İzin verilmedi ❌");
      return null;
    }

    const swReg = await registerSW();

    const token = await getToken(messaging, {
      vapidKey: "BCKhC2j7BvH_YGDC9vfHyJ2YfBO-beuRfEWhaQlQcM8e71p8_f6XKze7kkFGLH5oY3pKWhqbWys3FLbSaDVwATQ",
      serviceWorkerRegistration: swReg
    });

    console.log("🔥 TOKEN:", token);

    if (!token) {
      alert("Token boş ❌");
      return null;
    }

    alert("Token alındı ✅");

    return token;

  } catch (e) {
    console.error("TOKEN HATA:", e);
    alert("Token hatası: " + e.message);
    return null;
  }
}

// 🔔 FOREGROUND
onMessage(messaging, (payload) => {
  console.log("📩 Mesaj:", payload);
  alert("📦 Yeni sipariş!");
});

// 🔐 LOGIN
window.loginUser = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);

    if (email === "admin@kuryeai.com") {
      location.href = "/admin.html";
    } else {
      location.href = "/courier.html";
    }

  } catch (e) {
    alert("Login hata: " + e.message);
  }
};

// 📝 REGISTER
window.registerUser = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Kayıt başarılı ✅");
  } catch (e) {
    alert("Register hata: " + e.message);
  }
};

// GLOBAL
window.requestNotificationPermission = requestNotificationPermission;