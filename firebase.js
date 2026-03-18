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

/* 🔥 CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
  authDomain: "kuryeai.firebaseapp.com",
  projectId: "kuryeai",
  storageBucket: "kuryeai.appspot.com",
  messagingSenderId: "000000000000", // opsiyonel
  appId: "1:000000000000:web:xxxxxx" // opsiyonel
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* 🔄 AUTO LOGIN CHECK */
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) return;

    const role = snap.data().role;

    redirect(role);

  } catch (err) {
    console.error("Auth check error:", err);
  }
});

/* 🚀 LOGIN */
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

/* 🔒 REGISTER */
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

    alert("✅ Kayıt başarılı!");

  } catch (e) {
    alert("❌ Kayıt hatası: " + e.message);
  }
};

/* 📦 SİPARİŞ OLUŞTUR */
window.createOrder = async function (address, price = 0) {
  try {
    await addDoc(collection(db, "orders"), {
      address,
      price,
      status: "pending",
      createdAt: Date.now()
    });

    alert("🚀 Sipariş oluşturuldu");

  } catch (e) {
    alert("Sipariş hatası: " + e.message);
  }
};

/* 🛵 SİPARİŞLERİ DİNLE */
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

/* ✅ KABUL */
window.acceptOrder = async function (orderId, courierId = "kurye-1") {
  await updateDoc(doc(db, "orders", orderId), {
    status: "accepted",
    courierId
  });
};

/* 📦 TESLİM */
window.completeOrder = async function (orderId) {
  await updateDoc(doc(db, "orders", orderId), {
    status: "delivered"
  });
};

/* 🚪 LOGOUT */
window.logoutUser = async function () {
  await signOut(auth);
  window.location.href = "index.html";
};

/* 🔀 REDIRECT */
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