// login.js

import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

export async function login(email, password) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const user = res.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      alert("Kullanıcı rolü bulunamadı!");
      return;
    }

    const role = userDoc.data().role;

    if (role === "admin") {
      window.location.href = "/admin.html";
    } else if (role === "restaurant") {
      window.location.href = "/restaurant.html";
    } else if (role === "courier") {
      window.location.href = "/courier.html";
    } else {
      alert("Geçersiz rol!");
    }

  } catch (err) {
    alert("Giriş hatası: " + err.message);
  }
}