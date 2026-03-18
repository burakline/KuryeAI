import { db } from "../firebase.js";

import {
collection,
addDoc,
doc,
setDoc,
onSnapshot,
query,
where,
updateDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

/* AUTH */
const auth = getAuth();

let currentUser = null;
let watchId = null;

/* MAP */
const map = L.map('map').setView([39.92, 32.85], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let marker = L.marker([39.92, 32.85]).addTo(map);

/* AUTH STATE */
onAuthStateChanged(auth, (user)=>{
if(!user){
location.href="login.html";
return;
}
currentUser = user;
});

/* 🚀 START SHIFT */
window.startShift = async function(){

if(!currentUser){
alert("Giriş yok");
return;
}

document.getElementById("statusBadge").innerText = "VARDİYA AÇIK";

watchId = navigator.geolocation.watchPosition(async (pos)=>{

const lat = pos.coords.latitude;
const lng = pos.coords.longitude;

marker.setLatLng([lat,lng]);
map.setView([lat,lng],15);

/* 🔥 SADECE COURIERS */
await setDoc(doc(db,"couriers",currentUser.uid),{
lat,
lng,
online:true,
email: currentUser.email,
updatedAt:new Date()
},{merge:true});

});

alert("Online oldun 🚀");
};

/* 🛑 STOP SHIFT */
window.endShift = async function(){

if(watchId){
navigator.geolocation.clearWatch(watchId);
}

document.getElementById("statusBadge").innerText = "VARDİYA KAPALI";

await updateDoc(doc(db,"couriers",currentUser.uid),{
online:false
});

};

/* 📊 RAPOR */
window.saveDayEnd = async function(){

const p = packages.value;
const h = hours.value;
const k = km.value;
const r = revenue.value;

if(!p || !h){
alert("Eksik veri");
return;
}

await addDoc(collection(db,"reports"),{
courierId: currentUser.uid,
packages:p,
hours:h,
km:k,
revenue:r,
date:new Date()
});

alert("Rapor kaydedildi");
};

/* 📦 ORDER ACCEPT */
window.acceptOrder = async function(id){

await updateDoc(doc(db,"orders",id),{
status:"accepted",
courierId: currentUser.uid,
courierEmail: currentUser.email
});

alert("Sipariş alındı 🚀");
};

/* 📦 ORDER POOL */
const q = query(
collection(db,"orders"),
where("status","==","pending")
);

onSnapshot(q,(snapshot)=>{

const pool = document.getElementById("orderPool");

if(!pool) return;

pool.innerHTML="";

snapshot.forEach(docSnap=>{
const o = docSnap.data();

pool.innerHTML += `
<div style="background:#0f172a;padding:12px;border-radius:10px;margin-bottom:10px">
<b>${o.product || "Sipariş"}</b><br>
${o.address || ""}<br>

<button onclick="acceptOrder('${docSnap.id}')"
style="margin-top:8px;padding:10px;background:#00d4ff;border:none;border-radius:8px;">
Kabul Et
</button>
</div>
`;
});

});