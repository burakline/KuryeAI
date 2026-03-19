importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
  authDomain: "kuryeai.firebaseapp.com",
  projectId: "kuryeai",
  messagingSenderId: "655930514402",
  appId: "1:655930514402:web:379321cbb83f48daf077bb"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  self.registration.showNotification(
    payload.notification?.title || "Bildirim",
    {
      body: payload.notification?.body || "",
      icon: "/logo.png"
    }
  );
});