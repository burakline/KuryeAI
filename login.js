<script type="module">

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
getAuth,
signInWithEmailAndPassword,
onAuthStateChanged,
setPersistence,
browserLocalPersistence,
browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import {
getFirestore,
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

/* CONFIG */
const app = initializeApp({
apiKey:"AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
authDomain:"kuryeai.firebaseapp.com",
projectId:"kuryeai"
});

const auth = getAuth(app);
const db = getFirestore(app);

/* ELEMENTLER */
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

/* 🔐 AUTO LOGIN */
onAuthStateChanged(auth, async(user)=>{
if(user){
await redirect(user.uid);
}
});

/* 🚀 LOGIN */
loginBtn.onclick = async ()=>{

const email = emailInput.value.trim();
const password = passwordInput.value.trim();

if(!email || !password){
alert("Email ve şifre gir!");
return;
}

try{

// 🔥 SESSION (remember yoksa session)
await setPersistence(auth, browserLocalPersistence);

const userCred = await signInWithEmailAndPassword(auth, email, password);

await redirect(userCred.user.uid);

}catch(e){
alert("❌ "+e.message);
}

};

/* 🎯 ROLE YÖNLENDİRME */
async function redirect(uid){

const snap = await getDoc(doc(db,"users",uid));

if(!snap.exists()){
alert("Rol bulunamadı!");
return;
}

const role = snap.data().role;

switch(role){

case "admin":
location.href="admin.html";
break;

case "courier":
location.href="courier.html";
break;

case "restaurant":
location.href="restaurant.html";
break;

default:
location.href="index.html";

}

}

</script>