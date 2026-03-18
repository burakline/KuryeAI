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
/* 🔄 AUTO LOGIN (SADECE INDEX) */
/* ========================= */
onAuthStateChanged(auth, async (user) => {

  if (!window.location.pathname.includes("index")) return;

  if (!user) return;

  try {
    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) return;

    redirect(snap.data().role);

  } catch (err) {
    console.error(err);
  }

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
  try {

    await addDoc(collection(db, "orders"), {
      ...data,
      status: "pending",
      createdAt: Date.now()
    });

  } catch (e) {
    console.error(e);
  }
};

/* ========================= */
/* 📡 ORDER LISTENER */
/* ========================= */
window.listenOrders = function (callback) {

  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {

    const orders = [];

    snapshot.forEach((docSnap) => {
      orders.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    callback(orders);

  });

};

/* ========================= */
/* 🚀 ACCEPT */
/* ========================= */
window.acceptOrder = async function (orderId, courierId) {
  await updateDoc(doc(db, "orders", orderId), {
    status: "accepted",
    courierId
  });
};

/* ========================= */
/* 📦 COMPLETE */
/* ========================= */
window.completeOrder = async function (orderId) {
  await updateDoc(doc(db, "orders", orderId), {
    status: "delivered"
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
/* 🔔 NOTIFICATION INIT */
/* ========================= */
window.initNotifications = async function () {

  try {

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Bildirim izni verilmedi ❌");
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: "BNWTY3G-gaXdthi2kzQIsUSBnLvMHh0YkjBcCkqsv6fpiiYSfb_WvTwqO_lQSCxFhJ4pdNYRYGuxUhIdO-oCieA"
    });

    console.log("🔔 TOKEN:", token);

    return token;

  } catch (err) {
    console.error("Notification error:", err);
  }

};

/* ========================= */
/* 🔔 FOREGROUND NOTIF */
/* ========================= */
onMessage(messaging, () => {
  alert("📦 Yeni sipariş geldi!");
});

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

/* EXPORT */
export { db, auth };