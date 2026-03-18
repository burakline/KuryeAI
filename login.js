import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import { 
  getFirestore, 
  doc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

/* FIREBASE */
const app = initializeApp({
  apiKey: "AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
  authDomain: "kuryeai.firebaseapp.com",
  projectId: "kuryeai"
});

const auth = getAuth(app);
const db = getFirestore(app);

/* ELEMENTLER */
const emailInput = document.querySelector("input[type='email'], input[placeholder*='mail']");
const passwordInput = document.querySelector("input[type='password']");
const loginBtn = document.querySelector(".btn, button");
const eyeBtn = document.querySelector(".eye");

/* ŞİFRE GÖSTER */
if (eyeBtn && passwordInput) {
  eyeBtn.addEventListener("click", () => {
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
  });
}

/* LOGIN */
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      alert("Email ve şifre gir!");
      return;
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const userDoc = await getDoc(doc(db, "users", uid));

      if (!userDoc.exists()) {
        alert("Kullanıcı rolü bulunamadı!");
        return;
      }

      const role = userDoc.data().role;

      if (role === "admin") {
        window.location.href = "admin.html";
      } else if (role === "restaurant") {
        window.location.href = "restaurant.html";
      } else if (role === "courier") {
        window.location.href = "courier.html";
      } else {
        alert("Rol tanımsız!");
      }

    } catch (err) {
      alert("Hata: " + err.message);
    }
  });
}