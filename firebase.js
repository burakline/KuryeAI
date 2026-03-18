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
getDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

/* 🔥 CONFIG */
const app = initializeApp({
apiKey:"AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
authDomain:"kuryeai.firebaseapp.com",
projectId:"kuryeai"
});

const auth = getAuth(app);
const db = getFirestore(app);

/* 🔄 AUTO LOGIN CHECK */
onAuthStateChanged(auth, async(user)=>{

if(!user) return;

const snap = await getDoc(doc(db,"users",user.uid));

if(!snap.exists()) return;

const role = snap.data().role;

redirect(role);

});

/* 🚀 LOGIN */
window.loginUser = async function(email, password, remember=false){

try{

email = email.trim().toLowerCase();

/* 🔐 PERSISTENCE */
await setPersistence(
auth,
remember ? browserLocalPersistence : browserSessionPersistence
);

const userCred = await signInWithEmailAndPassword(auth, email, password);
const uid = userCred.user.uid;

/* 🔍 ROLE */
const snap = await getDoc(doc(db,"users",uid));

if(!snap.exists()){
alert("Kullanıcı rolü bulunamadı!");
return;
}

redirect(snap.data().role);

}catch(e){
alert("❌ Giriş başarısız: " + e.message);
}

};

/* 🔒 REGISTER (KISITLI) */
window.registerUser = async function(email, password){

try{

email = email.trim().toLowerCase();

/* ❌ ROLE DIŞARIDAN ALMA */
const userCred = await createUserWithEmailAndPassword(auth,email,password);
const uid = userCred.user.uid;

/* default role */
await setDoc(doc(db,"users",uid),{
email,
role:"courier",
createdAt:new Date()
});

alert("✅ Kayıt başarılı!");

}catch(e){
alert("❌ Kayıt hatası: "+e.message);
}

};

/* 🔀 REDIRECT */
function redirect(role){

if(role === "admin"){
window.location.href = "admin.html";
}
else if(role === "restaurant"){
window.location.href = "restaurant.html";
}
else{
window.location.href = "courier.html";
}

}