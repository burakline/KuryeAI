import "./firebase.js";

import {
  getDatabase,
  ref,
  onValue,
  set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* ================= INIT ================= */

const db = getDatabase();

let map = L.map('map').setView([39.92, 32.85], 11);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
.addTo(map);

let markers = {};
let couriers = {};

/* ================= KURYELER ================= */

onValue(ref(db, "couriers"), (snap) => {

  document.getElementById("courierList").innerHTML = "";

  snap.forEach(c => {

    const id = c.key;
    const data = c.val();

    couriers[id] = data;

    if (!data.lat) return;

    const color = data.online ? "green" : "red";

    if (markers[id]) {
      markers[id].setLatLng([data.lat, data.lng]);
    } else {
      markers[id] = L.circleMarker([data.lat, data.lng], {
        radius:8,
        color
      }).addTo(map)
      .bindPopup(id);
    }

    document.getElementById("courierList").innerHTML += `
      <div class="card">
        ${id}<br>
        ${data.online ? "🟢 Online" : "🔴 Offline"}
      </div>
    `;
  });

});

/* ================= MESAFE ================= */

function distance(a,b,c,d){
  return Math.sqrt((a-c)**2 + (b-d)**2);
}

/* ================= SİPARİŞ OLUŞTUR ================= */

window.createOrder = () => {

  const id = "ORD-" + Date.now();

  const order = {
    id,
    customer: document.getElementById("customer").value,
    address: document.getElementById("address").value,
    lat: parseFloat(document.getElementById("lat").value),
    lng: parseFloat(document.getElementById("lng").value),
    status:"waiting"
  };

  set(ref(db,"orders/"+id),order);

  assign(order);
};

/* ================= OTOMATİK ATAMA ================= */

function assign(order){

  let best = null;
  let min = 999;

  for (let id in couriers){

    let c = couriers[id];
    if (!c.lat) continue;

    let d = distance(order.lat,order.lng,c.lat,c.lng);

    if (d < min){
      min = d;
      best = id;
    }
  }

  if (!best) return;

  set(ref(db,"orders/"+order.id+"/courierId"),best);
  set(ref(db,"orders/"+order.id+"/status"),"assigned");
}

/* ================= SİPARİŞ LİSTESİ ================= */

onValue(ref(db,"orders"),(snap)=>{

  document.getElementById("orderList").innerHTML="";

  snap.forEach(o=>{

    let d=o.val();

    document.getElementById("orderList").innerHTML+=`
    <div class="card">
      <b>${d.customer}</b><br>
      ${d.address}<br>
      📍 ${d.lat}, ${d.lng}<br>
      🚀 ${d.status}<br>
      👤 ${d.courierId || "-"}
    </div>
    `;
  });

});