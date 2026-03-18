// firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

/* 🔥 FIREBASE CONFIG */
firebase.initializeApp({
  apiKey: "AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
  authDomain: "kuryeai.firebaseapp.com",
  projectId: "kuryeai",
  messagingSenderId: "562153733113",
  appId: "1:562153733113:web:61d9242d0af1da6a081b28"
});

/* 📩 MESSAGING */
const messaging = firebase.messaging();

/* 🔔 BACKGROUND NOTIFICATION */
messaging.onBackgroundMessage(function (payload) {

  console.log("📩 Background mesaj:", payload);

  const title = payload.notification?.title || "Yeni Bildirim";
  const options = {
    body: payload.notification?.body || "Detay yok",
    icon: "/logo.png",
    badge: "/logo.png"
  };

  self.registration.showNotification(title, options);

});

/* 🔥 NOTIFICATION CLICK */
self.addEventListener("notificationclick", function (event) {

  event.notification.close();

  event.waitUntil(
    clients.openWindow("/")
  );

});