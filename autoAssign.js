// autoAssign.js

import { db } from "./firebase.js";
import {
collection,
onSnapshot,
doc,
updateDoc,
getDocs,
getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* MESAFE */
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/* AUTO ASSIGN */
export function startAutoAssign() {

  onSnapshot(collection(db, "orders"), async (snapshot) => {

    // CONFIG OKU
    const configSnap = await getDoc(doc(db, "settings", "config"));
    const config = configSnap.exists() ? configSnap.data() : {};

    if (!config.autoAssign) {
      console.log("⛔ Otomatik atama kapalı");
      return;
    }

    const maxDistance = config.maxDistance || 10;

    for (const change of snapshot.docChanges()) {

      if (change.type !== "added") continue;

      const order = change.doc.data();
      const orderId = change.doc.id;

      if (order.status !== "pending") continue;

      const couriersSnap = await getDocs(collection(db, "couriers"));

      let bestCourier = null;
      let bestDistance = 9999;

      couriersSnap.forEach(c => {

        const courier = c.data();

        if (!courier.online) return;
        if (!courier.lat || !order.lat) return;

        const dist = getDistance(
          courier.lat,
          courier.lng,
          order.lat,
          order.lng
        );

        if (dist < bestDistance && dist <= maxDistance) {
          bestDistance = dist;
          bestCourier = { id: c.id, ...courier };
        }

      });

      if (bestCourier) {

        await updateDoc(doc(db, "orders", orderId), {
          status: "accepted",
          courierId: bestCourier.id,
          autoAssigned: true
        });

        console.log("🤖 Otomatik atandı:", bestCourier.id);

      } else {
        console.log("❌ Uygun kurye yok (mesafe filtresi)");
      }

    }

  });

}