import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";

import {
getFirestore,
collection,
onSnapshot,
query,
where,
doc,
updateDoc,
getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

/* 🔥 CONFIG */
const app = initializeApp({
apiKey:"AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
authDomain:"kuryeai.firebaseapp.com",
projectId:"kuryeai"
});

const db = getFirestore(app);

/* 📏 MESAFE */
function getDistanceKm(lat1,lng1,lat2,lng2){
const R = 6371;
const dLat = (lat2-lat1)*Math.PI/180;
const dLng = (lng2-lng1)*Math.PI/180;

const a =
Math.sin(dLat/2)**2 +
Math.cos(lat1*Math.PI/180)*
Math.cos(lat2*Math.PI/180)*
Math.sin(dLng/2)**2;

return R * (2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
}

/* 🚀 SİPARİŞ DİNLE */
onSnapshot(
query(collection(db,"orders"), where("status","==","bekliyor")),
async (snap)=>{

snap.forEach(async(orderDoc)=>{

const order = orderDoc.data();

/* 🔒 ZATEN ATANDI MI */
if(order.courierId) return;

/* 🚴 ONLINE KURYELER */
const couriersSnap = await getDocs(
query(collection(db,"couriers"), where("online","==",true))
);

let bestCourier = null;
let minDist = 9999;

couriersSnap.forEach(cDoc=>{

const c = cDoc.data();

if(!c.lat || !c.lng) return;

const dist = getDistanceKm(
order.lat, order.lng,
c.lat, c.lng
);

if(dist < minDist){
minDist = dist;
bestCourier = cDoc.id;
}

});

/* 🎯 ATA */
if(bestCourier){

await updateDoc(doc(db,"orders",orderDoc.id),{
status:"assigned",
courierId:bestCourier
});

console.log("AI atadı:",bestCourier);

}

});

});