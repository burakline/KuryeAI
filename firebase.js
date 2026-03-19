// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getDatabase,
  ref,
  get,
  set,
  update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  getMessaging,
  getToken,
  onMessage
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

// CONFIG
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
const db = getDatabase(app);
const messaging = getMessaging(app);

// 🔔 SERVICE WORKER
async function registerSW() {
  return await navigator.serviceWorker.register("/firebase-messaging-sw.js");
}

// 🔔 TOKEN AL + DB KAYDET
async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const sw = await registerSW();

    const token = await getToken(messaging, {
      vapidKey: "BCKhC2j7BvH_YGDC9vfHyJ2YfBO-beuRfEWhaQlQcM8e71p8_f6XKze7kkFGLH5oY3pKWhqbWys3FLbSaDVwATQ",
      serviceWorkerRegistration: sw
    });

    const user = auth.currentUser;

    if (user && token) {
      await set(ref(db, "tokens/" + user.uid), {
        token
      });
    }

    return token;

  } catch (e) {
    alert(e.message);
    return null;
  }
}

// 🔔 FOREGROUND
onMessage(messaging, (payload) => {
  alert(payload.notification?.title || "Yeni sipariş");
});

// LOGIN
window.loginUser = async (email, password) => {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const uid = userCred.user.uid;

  const roleSnap = await get(ref(db, "roles/" + uid));
  if (!roleSnap.exists()) return alert("Rol yok");

  const role = roleSnap.val().role;

  if (role === "admin") location.href = "/admin.html";
  if (role === "courier") location.href = "/courier.html";
  if (role === "restaurant") location.href = "/restaurant.html";
};

// REGISTER
window.registerUser = async (email, password) => {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCred.user.uid;

  await set(ref(db, "roles/" + uid), { role: "courier" });
};

// LOGOUT
window.logout = async () => {
  await signOut(auth);
  location.href = "/login.html";
};

// SESSION
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const uid = user.uid;
  const roleSnap = await get(ref(db, "roles/" + uid));

  if (!roleSnap.exists()) return;

  const role = roleSnap.val().role;

  if (location.pathname.includes("login")) {
    if (role === "admin") location.href = "/admin.html";
    if (role === "courier") location.href = "/courier.html";
  }
});

window.requestNotificationPermission = requestNotificationPermission;