importScripts("https://www.gstatic.com/firebasejs/12.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.10.0/firebase-messaging-compat.js");

/* 🔥 FIREBASE */
firebase.initializeApp({
apiKey:"AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
authDomain:"kuryeai.firebaseapp.com",
projectId:"kuryeai",
messagingSenderId:"655930514402",
appId:"1:655930514402:web:379321cbb83f48daf077bb"
});

const messaging = firebase.messaging();

/* 🔥 CACHE */
const CACHE_NAME = "kuryeai-v2";

/* INSTALL */
self.addEventListener("install", event=>{
event.waitUntil(
caches.open(CACHE_NAME).then(cache=>{
return cache.addAll([
"/index.html",
"/courier.html",
"/restaurant.html",
"/admin.html"
]);
})
);
self.skipWaiting();
});

/* ACTIVATE */
self.addEventListener("activate", event=>{
event.waitUntil(
caches.keys().then(keys=>{
return Promise.all(
keys.map(key=>{
if(key !== CACHE_NAME){
return caches.delete(key);
}
})
);
})
);
self.clients.claim();
});

/* FETCH */
self.addEventListener("fetch", event=>{

// sadece GET cache
if(event.request.method !== "GET") return;

event.respondWith(
caches.match(event.request).then(res=>{
return res || fetch(event.request);
})
);

});

/* 🔔 PUSH */
messaging.onBackgroundMessage((payload)=>{

self.registration.showNotification(
payload.notification?.title || "KuryeAI",
{
body: payload.notification?.body || "Yeni bildirim",
icon: "/logo.png",
actions:[
{action:"open", title:"Aç"},
{action:"accept", title:"Kabul Et"}
]
}
);

});

/* 🔔 CLICK */
self.addEventListener("notificationclick", event=>{

event.notification.close();

if(event.action === "accept"){
event.waitUntil(clients.openWindow("/courier.html"));
}else{
event.waitUntil(clients.openWindow("/"));
}

});