<script type="module">

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const app = initializeApp({
apiKey:"AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
authDomain:"kuryeai.firebaseapp.com",
projectId:"kuryeai"
});

const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("loginBtn").onclick = async () => {

const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value.trim();

try{

const userCred = await signInWithEmailAndPassword(auth, email, password);
const uid = userCred.user.uid;

// 🔥 ROLE ÇEK
const snap = await getDoc(doc(db, "users", uid));

if(!snap.exists()){
alert("Rol bulunamadı!");
return;
}

const role = snap.data().role;

// 🚀 YÖNLENDİRME
if(role === "admin"){
location.href = "admin.html";
}
else if(role === "courier"){
location.href = "courier.html";
}
else{
location.href = "index.html";
}

}catch(e){
alert("Hata: " + e.message);
}

}

</script>