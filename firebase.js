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

// 🔥 INIT
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const auth = getAuth(app);

// 🔔 SERVICE WORKER
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    return await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  }
}

// 🔔 TOKEN
async function requestNotificationPermission() {
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
    return token;

  } catch (err) {
    console.error("TOKEN HATA:", err);
  }
}

// 🔔 FOREGROUND MESSAGE
onMessage(messaging, (payload) => {
  alert(
    (payload.notification?.title || "Bildirim") +
    "\n" +
    (payload.notification?.body || "")
  );
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
    alert("Giriş hatası: " + e.message);
  }
};

// 📝 REGISTER
window.registerUser = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Kayıt başarılı ✅");
  } catch (e) {
    alert("Kayıt hatası: " + e.message);
  }
};

// GLOBAL
window.requestNotificationPermission = requestNotificationPermission;