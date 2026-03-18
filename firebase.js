import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

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

// LOGIN
window.loginUser = async function(email, password) {
    try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;

        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            alert("Kullanıcı rolü bulunamadı!");
            return;
        }

        const role = docSnap.data().role;

        if (role === "admin") window.location.href = "admin.html";
        else if (role === "restaurant") window.location.href = "restaurant.html";
        else if (role === "courier") window.location.href = "courier.html";

    } catch (error) {
        alert("Giriş hatası: " + error.message);
    }
};

// REGISTER
window.registerUser = async function(email, password, role) {
    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;

        await setDoc(doc(db, "users", uid), {
            role: role
        });

        alert("Kayıt başarılı!");
        window.location.reload();

    } catch (error) {
        alert("Kayıt hatası: " + error.message);
    }
};