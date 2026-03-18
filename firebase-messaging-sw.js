// firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/12.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.10.0/firebase-messaging-compat.js");

/* 🔥 FIREBASE CONFIG */
firebase.initializeApp({
  apiKey: "AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
  authDomain: "kuryeai.firebaseapp.com",
  projectId: "kuryeai",
  storageBucket: "kuryeai.appspot.com",
  messagingSenderId: "562153733113",
  appId: "1:562153733113:web:61d9242d0af1da6a081b28"
});

/* 📩 MESSAGING */
const messaging = firebase.messaging();

/* 🔔 BACKGROUND */
messaging.onBackgroundMessage((payload) => {

  console.log("📩 Background mesaj:", payload);

  const title = payload.notification?.title || "📦 Yeni Sipariş";
  const options = {
    body: payload.notification?.body || "Yeni sipariş geldi 🚀",
    icon: "/logo.png",
    badge: "/logo.png"
  };

  self.registration.showNotification(title, options);
});

/* 🔥 CLICK */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow("/");
    })
  );
});