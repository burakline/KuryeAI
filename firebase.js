import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

import {
  getMessaging,
  getToken,
  onMessage
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-messaging.js";


// 🔥 CONFIG (FULL DOĞRU)
const firebaseConfig = {
  apiKey: "AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
  authDomain: "kuryeai.firebaseapp.com",
  projectId: "kuryeai",
  storageBucket: "kuryeai.appspot.com",
  messagingSenderId: "562153733113",
  appId: "1:562153733113:web:61d9242d0af1da6a081b28"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);


// 🔄 AUTO LOGIN
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  redirect(snap.data().role);
});


// 🚀 LOGIN
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
      alert("Kullanıcı rolü bulunamadı!");
      return;
    }

    redirect(snap.data().role);

  } catch (e) {
    alert("❌ Giriş başarısız: " + e.message);
  }
};


// 🔒 REGISTER
window.registerUser = async function (email, password) {

  try {

    email = email.trim().toLowerCase();

    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    await setDoc(doc(db, "users", uid), {
      email,
      role: "courier",
      createdAt: new Date()
    });

    alert("✅ Kayıt başarılı!");

  } catch (e) {
    alert("❌ Kayıt hatası: " + e.message);
  }
};


// 🔔 NOTIFICATION INIT (EN KRİTİK)
window.initNotifications = async function (userId) {

  try {

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("❌ Bildirim izni verilmedi");
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: "BCKhC2j7BvH_YGDC9vfHyJ2YfBO-beuRfEWhaQlQcM8e71p8_f6XKze7kkFGLH5oY3pKWhqbWys3FLbSaDVwATQ"
    });

    console.log("🔥 TOKEN:", token);

    await updateDoc(doc(db, "couriers", userId), {
      fcmToken: token
    });

    alert("✅ Bildirim aktif!");

  } catch (err) {
    console.error(err);
    alert("❌ HATA: " + err.message);
  }
};


// 🔔 FOREGROUND MESSAGE
onMessage(messaging, (payload) => {
  alert("📦 Yeni sipariş var!");
});


// 🔀 REDIRECT
function redirect(role) {

  if (role === "admin") {
    window.location.href = "admin.html";
  }
  else if (role === "restaurant") {
    window.location.href = "restaurant.html";
  }
  else {
    window.location.href = "courier.html";
  }

}