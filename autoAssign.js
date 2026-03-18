import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
getFirestore,
collection,
onSnapshot,
query,
where,
doc,
updateDoc,
getDocs,
getDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const app = initializeApp({
apiKey:"AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
authDomain:"kuryeai.firebaseapp.com",
projectId:"kuryeai"
});

const db = getFirestore(app);

/* 📏 MESAFE */
function dist(a,b,c,d){
return Math.sqrt((a-c)**2+(b-d)**2)*111;
}

/* ⚙️ AYAR */
let TIMEOUT = 10000;

onSnapshot(doc(db,"settings","config"), snap=>{
if(snap.exists()){
TIMEOUT = (snap.data().timeout || 10)*1000;
}
});

/* 🚀 SİPARİŞ DİNLE */
onSnapshot(
query(collection(db,"orders"), where("status","==","bekliyor")),
async snap=>{

snap.forEach(async orderDoc=>{

const o = orderDoc.data();
if(o.courierId) return;

/* 🚴 ONLINE */
const couriers = await getDocs(
query(collection(db,"couriers"), where("online","==",true))
);

let best=null, min=9999;

couriers.forEach(c=>{
const d = c.data();
if(!d.lat) return;

const m = dist(o.lat,o.lng,d.lat,d.lng);

if(m<min){
min=m;
best=c.id;
}
});

if(!best) return;

/* ATA */
await updateDoc(doc(db,"orders",orderDoc.id),{
status:"pending_accept",
courierId:best,
assignedAt:Date.now()
});

/* ⏱️ TIMEOUT */
setTimeout(async()=>{

const ref = doc(db,"orders",orderDoc.id);
const snap = await getDoc(ref);

if(!snap.exists()) return;

const data = snap.data();

if(data.status==="pending_accept"){
await updateDoc(ref,{
status:"bekliyor",
courierId:null
});
console.log("Timeout → yeniden havuz");
}

},TIMEOUT);

});

});