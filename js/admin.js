// admin.js

import { db } from "../firebase.js";
import { startAutoAssign } from "../autoAssign.js";

import {
collection,
onSnapshot,
doc,
getDoc,
setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* AUTO ASSIGN BAŞLAT */
startAutoAssign();

/* ========================= */
/* 📦 SİPARİŞ PANELİ */
/* ========================= */

const ordersDiv = document.getElementById("orders");
const totalDiv = document.getElementById("total");
const activeDiv = document.getElementById("active");

if (ordersDiv) {

onSnapshot(collection(db, "orders"), (snap) => {

  ordersDiv.innerHTML = "";

  let total = 0;
  let active = 0;

  snap.forEach(docSnap => {

    const o = docSnap.data();
    total++;

    if (o.status === "accepted") active++;

    ordersDiv.innerHTML += `
      <div class="order">
        <b>${o.customer || "Müşteri"}</b><br>
        ${o.address}<br>

        <span class="${o.status}">
          ${o.status}
        </span>

        <br>💰 ${o.price}₺
      </div>
    `;

  });

  if (totalDiv) totalDiv.innerText = total;
  if (activeDiv) activeDiv.innerText = active;

});

}

/* ========================= */
/* ⚙️ AYAR PANELİ */
/* ========================= */

async function loadSettings() {

  const snap = await getDoc(doc(db, "settings", "config"));

  if (snap.exists()) {
    const data = snap.data();

    const autoAssignEl = document.getElementById("autoAssign");
    const maxDistanceEl = document.getElementById("maxDistance");

    if (autoAssignEl) autoAssignEl.value = data.autoAssign;
    if (maxDistanceEl) maxDistanceEl.value = data.maxDistance;
  }

}

loadSettings();

/* SAVE */
window.saveSettings = async function () {

  const autoAssign =
    document.getElementById("autoAssign").value === "true";

  const maxDistance =
    parseFloat(document.getElementById("maxDistance").value);

  await setDoc(doc(db, "settings", "config"), {
    autoAssign,
    maxDistance
  });

  alert("✅ Ayarlar kaydedildi");

};

/* ========================= */
/* 🗺️ CANLI HARİTA */
/* ========================= */

const mapEl = document.getElementById("adminMap");

if (mapEl) {

  const adminMap = L.map('adminMap').setView([39.92, 32.85], 11);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
  .addTo(adminMap);

  const markers = {};

  onSnapshot(collection(db, "couriers"), (snapshot) => {

    const list = document.getElementById("activeCouriersList");
    if (list) list.innerHTML = "";

    const currentIds = [];
    snapshot.forEach(doc => currentIds.push(doc.id));

    /* SİLİNEN MARKERLAR */
    Object.keys(markers).forEach(id => {
      if (!currentIds.includes(id)) {
        adminMap.removeLayer(markers[id]);
        delete markers[id];
      }
    });

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();
      const id = docSnap.id;

      if (!data.lat) return;

      const icon = L.divIcon({
        html: data.online
          ? '<div style="background:#00C2A8;width:26px;height:26px;border-radius:50%;border:2px solid white;box-shadow:0 0 10px #00C2A8;"></div>'
          : '<div style="background:#ef4444;width:26px;height:26px;border-radius:50%;border:2px solid white;"></div>',
        iconSize:[26,26],
        iconAnchor:[13,13]
      });

      if (markers[id]) {
        markers[id].setLatLng([data.lat, data.lng]);
        markers[id].setIcon(icon);
      } else {
        markers[id] = L.marker([data.lat, data.lng], {icon})
          .addTo(adminMap)
          .bindPopup(`${data.name || "Kurye"}<br>${data.online ? "🟢 Online":"🔴 Offline"}`);
      }

      /* LİSTE */
      if (list) {

        let timeText = "Bilinmiyor";

        if (data.updatedAt?.seconds) {
          timeText = new Date(data.updatedAt.seconds * 1000).toLocaleTimeString();
        }

        list.innerHTML += `
        <div style="
        padding:10px;
        background:rgba(255,255,255,0.05);
        border-radius:10px;
        margin-bottom:8px;
        ">
        <b style="color:#00C2A8">${data.name || "Kurye"}</b><br>
        <span>${data.online ? "🟢 Online":"🔴 Offline"}</span><br>
        <small>${timeText}</small>
        </div>
        `;

      }

    });

  });

}