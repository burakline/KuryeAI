/* 🔥 IMPORTS */
importScripts("https://www.gstatic.com/firebasejs/12.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.10.0/firebase-messaging-compat.js");

/* 🔥 FIREBASE INIT */
firebase.initializeApp({
apiKey:"AIzaSyAAupWOvjL9ZlW8855_lD52_vkc8BCqGtw",
authDomain:"kuryeai.firebaseapp.com",
projectId:"kuryeai",
messagingSenderId:"655930514402",
appId:"1:655930514402:web:379321cbb83f48daf077bb"
});

const messaging = firebase.messaging();

/* 🔥 CACHE */
const CACHE_NAME = "kuryeai-v1";

/* INSTALL */
self.addEventListener("install", e=>{
e.waitUntil(
caches.open(CACHE_NAME).then(cache=>{
return cache.addAll([
"/",
"/index.html",
"/courier.html",
"/restaurant.html"
]);
})
);
self.skipWaiting();
});

/* ACTIVATE (AUTO UPDATE) */
self.addEventListener("activate", e=>{
self.clients.claim();
});

/* 🔥 FETCH (SMART CACHE) */
self.addEventListener("fetch", e=>{

// 🔐 BASIC TOKEN CHECK (example)
if(e.request.headers.get("Authorization") === "invalid"){
return;
}

// HARİTA TILE CACHE
if(e.request.url.includes("tile")){
e.respondWith(
caches.match(e.request).then(res=>{
return res || fetch(e.request);
})
);
return;
}

// GENEL CACHE
e.respondWith(
caches.match(e.request).then(res=>{
return res || fetch(e.request);
})
);

});

/* 🔥 BACKGROUND SYNC */
self.addEventListener("sync", e=>{
if(e.tag === "sync-data"){
e.waitUntil(
fetch("/sync-endpoint")
);
}
});

/* 🔔 PUSH (ADVANCED) */
messaging.onBackgroundMessage(function(payload){

self.registration.showNotification(payload.notification.title, {
body: payload.notification.body,
icon: "/logo.png",
actions:[
{action:"accept", title:"Kabul Et"},
{action:"open", title:"Aç"}
]
});

});

/* 🔥 NOTIFICATION CLICK */
self.addEventListener("notificationclick", function(e){

e.notification.close();

if(e.action === "accept"){
e.waitUntil(
clients.openWindow("/courier.html")
);
}

if(e.action === "open"){
e.waitUntil(
clients.openWindow("/")
);
}

});

/* 🔥 BACKGROUND GPS (LIMITED WEB SUPPORT) */
self.addEventListener("message", e=>{
if(e.data.type === "LOCATION"){
// backend’e gönderilebilir
fetch("/location-update",{
method:"POST",
body:JSON.stringify(e.data)
});
}
});