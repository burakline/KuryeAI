// js/admin.js

import { db } from "../firebase.js";
import {
  collection,
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ================= MAP ================= */

const mapEl = document.getElementById("adminMap");

let adminMap;
let markers = {};
let couriers = {};

if (mapEl) {

  adminMap = L.map('adminMap').setView([39.92, 32.85], 11);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(adminMap);

  // 🔴🟢 ICONS
  const onlineIcon = L.divIcon({
    html: '<div style="background:#22c55e;width:28px;height:28px;border-radius:50%;border:3px solid white;"></div>',
    iconSize:[28,28],
    iconAnchor:[14,14]
  });

  const offlineIcon = L.divIcon({
    html: '<div style="background:#ef4444;width:28px;height:28px;border-radius:50%;border:3px solid white;"></div>',
    iconSize:[28,28],
    iconAnchor:[14,14]
  });

  /* ================= REALTIME KURYELER ================= */

  onSnapshot(collection(db, "couriers"), (snapshot) => {

    const list = document.getElementById("activeCouriersList");
    if (list) list.innerHTML = "";

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();
      const id = docSnap.id;

      couriers[id] = data;

      if (!data.lat) return;

      const icon = data.online ? onlineIcon : offlineIcon;

      if (markers[id]) {
        markers[id].setLatLng([data.lat, data.lng]);
        markers[id].setIcon(icon);
      } else {
        markers[id] = L.marker([data.lat, data.lng], { icon })
          .addTo(adminMap)
          .bindPopup(
            `${data.name || "Kurye"}<br>
            ${data.online ? "🟢 Online" : "🔴 Offline"}`
          );
      }

      if (list) {
        list.innerHTML += `
        <div style="padding:10px;background:#0f172a;border-radius:10px;margin-bottom:8px;">
          <b style="color:#00d4ff">${data.name || "Kurye"}</b><br>
          ${data.online ? "🟢 Online" : "🔴 Offline"}
        </div>`;
      }

    });

  });

}

/* ================= MESAFE ================= */

function getDistance(lat1, lng1, lat2, lng2) {

  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI/180;
  const dLng = (lng2 - lng1) * Math.PI/180;

  const a =
    Math.sin(dLat/2) ** 2 +
    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *
    Math.sin(dLng/2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

/* ================= SİPARİŞ OLUŞTUR ================= */

window.createOrder = async () => {

  const customer = document.getElementById("customer")?.value || "Müşteri";
  const address = document.getElementById("address")?.value || "Adres";

  const lat = parseFloat(document.getElementById("lat")?.value || 39.92);
  const lng = parseFloat(document.getElementById("lng")?.value || 32.85);

  const orderRef = await addDoc(collection(db, "orders"), {
    customer,
    address,
    lat,
    lng,
    status: "waiting",
    createdAt: new Date()
  });

  assignNearest(orderRef.id, lat, lng);
};

/* ================= EN YAKIN KURYE ================= */

async function assignNearest(orderId, lat, lng) {

  let best = null;
  let min = 999;

  for (const uid in couriers) {

    const c = couriers[uid];
    if (!c.lat) continue;

    const dist = getDistance(lat, lng, c.lat, c.lng);

    if (dist < min) {
      min = dist;
      best = uid;
    }
  }

  if (!best) return alert("Kurye yok");

  await updateDoc(doc(db, "orders", orderId), {
    courierId: best,
    status: "assigned"
  });

  sendNotification(best);
}

/* ================= PUSH BİLDİRİM ================= */

async function sendNotification(uid) {

  const tokens = await getDocs(collection(db, "tokens"));

  tokens.forEach(async (t) => {

    if (t.id === uid) {

      const token = t.data().token;

      await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "key=SERVER_KEY_BURAYA"
        },
        body: JSON.stringify({
          to: token,
          notification: {
            title: "🚀 Yeni Sipariş",
            body: "Yeni sipariş sana atandı"
          }
        })
      });

    }

  });

}