// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// 🔥 FIREBASE CONFIG (DÜZELTİLDİ)
const firebaseConfig = {
  apiKey: "AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
  authDomain: "kuryeai.firebaseapp.com",
  projectId: "kuryeai",
  storageBucket: "kuryeai.appspot.com", // ✅ DÜZELTİLDİ
  messagingSenderId: "655930514402",
  appId: "1:655930514402:web:379321cbb83f48daf077bb"
};

// 🔥 INIT
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 🔔 SERVICE WORKER REGISTER
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    return registration;
  } else {
    console.warn("Service Worker desteklenmiyor ❌");
  }
}

// 🔥 TOKEN AL
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Bildirim izni reddedildi ❌");
      return;
    }

    const registration = await registerServiceWorker();

    const token = await getToken(messaging, {
      vapidKey: "BCKhC2j7BvH_YGDC9vfHyJ2YfBO-beuRfEWhaQlQcM8e71p8_f6XKze7kkFGLH5oY3pKWhqbWys3FLbSaDVwATQ",
      serviceWorkerRegistration: registration
    });

    console.log("🔥 TOKEN:", token);
    alert("Bildirim aktif ✅");

    return token;

  } catch (error) {
    console.error("❌ TOKEN HATA:", error);
    alert("Bildirim hatası: " + error.message);
  }
}

// 🔔 FOREGROUND MESAJ
onMessage(messaging, (payload) => {
  console.log("📩 Ön planda mesaj:", payload);

  const title = payload.notification?.title || "Yeni Bildirim";
  const body = payload.notification?.body || "";

  alert(title + "\n" + body);
});