import { db } from "../firebase.js";
import {
collection,
onSnapshot
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

/* MAP VAR MI KONTROL */
const mapEl = document.getElementById("adminMap");

if(!mapEl){
console.warn("adminMap yok");
}else{

/* MAP */
const adminMap = L.map('adminMap').setView([39.92, 32.85], 11);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
.addTo(adminMap);

/* MARKERS */
const markers = {};

/* REALTIME */
onSnapshot(collection(db, "couriers"), (snapshot) => {

const list = document.getElementById("activeCouriersList");
if(list) list.innerHTML = "";

/* silinenleri temizle */
const currentIds = [];
snapshot.forEach(doc => currentIds.push(doc.id));

Object.keys(markers).forEach(id=>{
if(!currentIds.includes(id)){
adminMap.removeLayer(markers[id]);
delete markers[id];
}
});

/* verileri çiz */
snapshot.forEach((docSnap) => {

const data = docSnap.data();
const id = docSnap.id;

/* lat yoksa skip */
if(!data.lat) return;

/* ICON (online/offline) */
const icon = L.divIcon({
html: data.online
? '<div style="background:#22c55e;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px #22c55e;"></div>'
: '<div style="background:#ef4444;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px #ef4444;"></div>',
iconSize:[28,28],
iconAnchor:[14,14]
});

/* marker update */
if (markers[id]) {
markers[id].setLatLng([data.lat, data.lng]);
markers[id].setIcon(icon);
} else {
markers[id] = L.marker([data.lat, data.lng], {icon})
.addTo(adminMap)
.bindPopup(`${data.name || "Kurye"}<br>${data.online ? "🟢 Online":"🔴 Offline"}`);
}

/* LIST */
if(list){

let timeText = "Bilinmiyor";

if(data.updatedAt?.seconds){
timeText = new Date(data.updatedAt.seconds * 1000).toLocaleTimeString();
}

list.innerHTML += `
<div style="
padding:10px;
background:#0f172a;
border-radius:10px;
margin-bottom:8px;
">
<b style="color:#00d4ff">${data.name || "Kurye"}</b><br>
<span>${data.online ? "🟢 Online":"🔴 Offline"}</span><br>
<small>${timeText}</small>
</div>
`;

}

});

});

}