// FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getDatabase,
  ref,
  get,
  set,
  update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
  authDomain: "kuryeai.firebaseapp.com",
  databaseURL: "https://kuryeai-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kuryeai",
  storageBucket: "kuryeai.firebasestorage.app",
  messagingSenderId: "655930514402",
  appId: "1:655930514402:web:379321cbb83f48daf077bb",
  measurementId: "G-JYQP30LJG3"
};

// INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// LOGIN
window.loginUser = async (email, password) => {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    const roleSnap = await get(ref(db, "roles/" + uid));

    if (roleSnap.exists()) {
      const role = roleSnap.val().role;

      if (role === "admin") {
        window.location.href = "/admin.html";
      } else if (role === "courier") {
        window.location.href = "/courier.html";
      } else if (role === "restaurant") {
        window.location.href = "/restaurant.html";
      } else {
        alert("Rol tanımsız");
      }
    } else {
      alert("Rol bulunamadı");
    }

  } catch (err) {
    alert("Giriş hatası: " + err.message);
  }
};

// REGISTER
window.registerUser = async (email, password) => {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    await set(ref(db, "roles/" + uid), {
      role: "courier"
    });

    alert("Kayıt başarılı");
  } catch (err) {
    alert(err.message);
  }
};

// SESSION CHECK
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const roleSnap = await get(ref(db, "roles/" + uid));

    if (roleSnap.exists()) {
      const role = roleSnap.val().role;

      if (role === "admin") {
        window.location.href = "/admin.html";
      } else if (role === "courier") {
        window.location.href = "/courier.html";
      }
    }
  }
});