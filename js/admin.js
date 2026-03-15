import { db } from "../firebase.js"; // Yolun doğruluğundan emin ol
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// Admin Harita Kurulumu
const adminMap = L.map('adminMap').setView([39.92, 32.85], 11);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(adminMap);

const markers = {};

// Aktif Kuryeleri Dinle
onSnapshot(collection(db, "activeLocations"), (snapshot) => {
    const list = document.getElementById("activeCouriersList");
    if(list) list.innerHTML = "";

    snapshot.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;

        // Haritada Marker Güncelle veya Ekle
        if (markers[id]) {
            markers[id].setLatLng([data.lat, data.lng]);
        } else {
            markers[id] = L.marker([data.lat, data.lng]).addTo(adminMap)
                .bindPopup(`${data.name} - Aktif`);
        }

        // Listeyi Güncelle
        if(list) {
            list.innerHTML += `
                <div class="p-3 bg-slate-800 rounded-lg border border-slate-700 mb-2">
                    <p class="text-cyan-400 font-bold text-sm">${data.name}</p>
                    <p class="text-[10px] text-slate-400">Son Güncelleme: ${new Date(data.lastUpdate.seconds * 1000).toLocaleTimeString()}</p>
                </div>`;
        }
    });
});