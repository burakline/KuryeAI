// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getMessaging, getToken, onMessage } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";
import { getDatabase, ref, set, get } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
  authDomain: "kuryeai.firebaseapp.com",
  databaseURL: "https://kuryeai-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kuryeai",
  storageBucket: "kuryeai.appspot.com",
  messagingSenderId: "655930514402",
  appId: "1:655930514402:web:379321cbb83f48daf077bb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const messaging = getMessaging(app);
const db = getDatabase(app);

// 🔔 SERVICE WORKER
async function registerSW() {
  return await navigator.serviceWorker.register("/firebase-messaging-sw.js");
}

// 🔔 TOKEN + DB KAYIT
async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Bildirim izni reddedildi ❌");
      return null;
    }

    const swReg = await registerSW();

    const token = await getToken(messaging, {
      vapidKey: "BCKhC2j7BvH_YGDC9vfHyJ2YfBO-beuRfEWhaQlQcM8e71p8_f6XKze7kkFGLH5oY3pKWhqbWys3FLbSaDVwATQ",
      serviceWorkerRegistration: swReg
    });

    console.log("🔥 TOKEN:", token);

    const user = auth.currentUser;

    if (user && token) {
      await set(ref(db, "tokens/" + user.uid), {
        token: token
      });
    }

    alert("🔥 TOKEN ALINDI");
    return token;

  } catch (e) {
    alert("Token hata: " + e.message);
    return null;
  }
}

// 🔔 FOREGROUND MESSAGE
onMessage(messaging, (payload) => {
  console.log("📩 Mesaj:", payload);
  alert("📦 Yeni sipariş!");
});

// 🔐 LOGIN (ROLE CHECK)
window.loginUser = async (email, password) => {
  try {

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const snapshot = await get(ref(db, "roles/" + uid));

    if (snapshot.exists() && snapshot.val().role === "admin") {
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