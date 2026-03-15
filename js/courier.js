import { db } from "./firebase.js";
import { collection, addDoc, doc, setDoc, onSnapshot, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// 1. Harita Kurulumu (Kurye Paneli)
const map = L.map('map').setView([39.92, 32.85], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let marker = L.marker([39.92, 32.85]).addTo(map);

// 2. Canlı Konum Takibi ve Admin Paneline Gönderim
navigator.geolocation.watchPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    marker.setLatLng([latitude, longitude]);
    map.panTo([latitude, longitude]);

    // Adminin görebilmesi için konumu Firebase'de güncelle
    await setDoc(doc(db, "activeLocations", "kurye_burak"), {
        lat: latitude,
        lng: longitude,
        name: "Burak (Kurye)",
        lastUpdate: new Date()
    });
}, (err) => console.error(err), { enableHighAccuracy: true });

// 3. Sipariş Havuzunu Dinle (Gerçek Zamanlı)
const q = query(collection(db, "orders"), where("status", "==", "bekliyor"));
onSnapshot(q, (snapshot) => {
    const pool = document.getElementById("orderPool");
    if(pool) {
        pool.innerHTML = ""; 
        snapshot.forEach((docSnap) => {
            const order = docSnap.data();
            pool.innerHTML += `
                <div style="background:#1e293b; padding:15px; border-radius:12px; margin-bottom:12px; border:1px solid #334155; text-align:left;">
                    <p style="color:#22d3ee; font-weight:bold; margin-bottom:5px;">📦 Yeni Sipariş</p>
                    <p style="font-size:14px;"><b>Müşteri:</b> ${order.customer}</p>
                    <p style="font-size:14px;"><b>Adres:</b> ${order.address}</p>
                    <button onclick="acceptOrder('${docSnap.id}')" style="background:#06b6d4; color:white; border:none; padding:10px; width:100%; border-radius:8px; margin-top:10px; font-weight:bold; cursor:pointer;">Siparişi Kabul Et</button>
                </div>`;
        });
    }
});

// 4. Siparişi Üzerine Alma
window.acceptOrder = async function(id) {
    await updateDoc(doc(db, "orders", id), { 
        status: "yolda", 
        courierName: "Burak" 
    });
    alert("Sipariş kabul edildi! Harita üzerinden hedefe yönelebilirsiniz.");
};

// Vardiya ve Raporlama
window.startShift = () => alert("Vardiya Başlatıldı! Admin sizi artık haritada görebilir.");
window.endShift = () => alert("Vardiya Bitirildi.");
window.saveDayEnd = async function() { 
    let p = document.getElementById("packages").value;
    let h = document.getElementById("hours").value;
    let k = document.getElementById("km").value;
    let r = document.getElementById("revenue").value;
    let earnings = (h * 215) + (k * 8);

    await addDoc(collection(db, "dayEndReports"), {
        packages: p, hours: h, km: k, revenue: r, earnings, date: new Date()
    });
    alert("Rapor kaydedildi. Kazancınız: ₺" + earnings);
};