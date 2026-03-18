import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

/* 🔥 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
  authDomain: "kuryeai.firebaseapp.com",
  projectId: "kuryeai",
  storageBucket: "kuryeai.firebasestorage.app",
  messagingSenderId: "655930514402",
  appId: "1:655930514402:web:379321cbb83f48daf077bb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* 🔐 LOGIN */
window.loginUser = async function(email, password, remember = true) {
  try {

    // 💾 Beni hatırla
    await setPersistence(
      auth,
      remember ? browserLocalPersistence : browserSessionPersistence
    );

    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("Kullanıcı sistemde tanımlı değil!");
      return;
    }

    const data = userSnap.data();

    // 🔥 UID + ROLE sakla
    localStorage.setItem("uid", uid);
    localStorage.setItem("role", data.role);

    // 🚀 yönlendirme
    if (data.role === "admin") location.href = "admin.html";
    else if (data.role === "courier") location.href = "courier.html";
    else if (data.role === "restaurant") location.href = "restaurant.html";

  } catch (error) {
    alert("Giriş hatası: " + error.message);
  }
};

/* 🔐 REGISTER (opsiyonel ama hazır) */
window.registerUser = async function(email, password, role = "courier") {
  try {

    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    await setDoc(doc(db, "users", uid), {
      email,
      role
    });

    alert("Kayıt başarılı!");

  } catch (error) {
    alert("Kayıt hatası: " + error.message);
  }
};

/* 🔁 AUTO LOGIN */
onAuthStateChanged(auth, async (user) => {
  if (user) {

    const uid = user.uid;
    const userSnap = await getDoc(doc(db, "users", uid));

    if (!userSnap.exists()) return;

    const role = userSnap.data().role;

    // zaten login sayfasındaysa yönlendir
    if (location.pathname.includes("login.html")) {

      if (role === "admin") location.href = "admin.html";
      else if (role === "courier") location.href = "courier.html";
      else if (role === "restaurant") location.href = "restaurant.html";

    }
  }
});

/* 🔁 ŞİFRE RESET */
window.resetPassword = async function(email) {
  if (!email) {
    alert("Email gir!");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Şifre sıfırlama maili gönderildi!");
  } catch (e) {
    alert("Hata: " + e.message);
  }
};

/* 🚪 LOGOUT */
window.logoutUser = async function() {
  await auth.signOut();
  localStorage.clear();
  location.href = "login.html";
};