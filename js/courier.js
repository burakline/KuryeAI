import { db } from "./firebase.js";
import { collection, addDoc, doc, setDoc, onSnapshot, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// HARİTA KURULUMU
const map = L.map('map').setView([39.92, 32.85], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let marker = L.marker([39.92, 32.85]).addTo(map);

// 1. VARDİYA BAŞLAT FONKSİYONU
window.startShift = async function() {
    document.getElementById("statusBadge").innerText = "VARDİYA AÇIK";
    document.getElementById("statusBadge").classList.replace("bg-rose-500/20", "bg-emerald-500/20");
    document.getElementById("statusBadge").classList.replace("text-rose-400", "text-emerald-400");
    
    // Konum takibini başlat
    navigator.geolocation.watchPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        marker.setLatLng([latitude, longitude]);
        map.panTo([latitude, longitude]);

        await setDoc(doc(db, "activeLocations", "kurye_burak"), {
            lat: latitude, lng: longitude, name: "Burak (Kurye)", lastUpdate: new Date()
        });
    });
    alert("Vardiya başlatıldı ve konumunuz paylaşılıyor!");
};

// 2. VARDİYA BİTİR FONKSİYONU
window.endShift = function() {
    document.getElementById("statusBadge").innerText = "VARDİYA KAPALI";
    alert("Vardiya sona erdi.");
    location.reload(); // Takibi durdurmak için sayfayı yeniler
};

// 3. RAPOR KAYDET FONKSİYONU
window.saveDayEnd = async function() {
    const p = document.getElementById("packages").value;
    const h = document.getElementById("hours").value;
    const k = document.getElementById("km").value;
    const r = document.getElementById("revenue").value;

    if(!p || !h) return alert("Lütfen en az paket ve saat bilgisini girin!");

    await addDoc(collection(db, "reports"), {
        courier: "Burak",
        packages: p,
        hours: h,
        km: k,
        revenue: r,
        date: new Date()
    });
    alert("Rapor başarıyla kaydedildi!");
};

// 4. SİPARİŞ KABUL ET FONKSİYONU
window.acceptOrder = async function(id) {
    await updateDoc(doc(db, "orders", id), { status: "yolda", courierName: "Burak" });
    alert("Siparişi aldınız, bol kazançlar!");
};

// SİPARİŞ HAVUZUNU DİNLE
const q = query(collection(db, "orders"), where("status", "==", "bekliyor"));
onSnapshot(q, (snapshot) => {
    const pool = document.getElementById("orderPool");
    if(pool) {
        pool.innerHTML = ""; 
        snapshot.forEach((docSnap) => {
            const order = docSnap.data();
            pool.innerHTML += `
                <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <p class="text-cyan-400 font-bold">${order.customer}</p>
                    <p class="text-xs text-slate-400">${order.address}</p>
                    <button onclick="acceptOrder('${docSnap.id}')" class="mt-2 w-full bg-cyan-600 py-2 rounded-lg text-xs font-bold transition active:scale-95">Siparişi Kabul Et</button>
                </div>`;
        });
    }
});