/**
 * KuryeAI - Google + SEO + Tracking PRO
 */

const KuryeAI_Google = {

settings: {
name: "KuryeAI",
phone: "+905072171295",
placeId: "PLACE_ID_BURAYA",
mapUrl: "https://www.google.com/maps"
},

/* ⭐ YORUM SAYFASI */
openReviewPage(){
if(this.settings.placeId === "PLACE_ID_BURAYA"){
alert("Google profil henüz hazır değil");
return;
}

window.open(
`https://search.google.com/local/writereview?placeid=${this.settings.placeId}`,
"_blank"
);
},

/* 🧠 EVENT TRACK */
track(event, data={}){
console.log("📊 EVENT:", event, data);

/* İleride Firebase Analytics bağlanır */
},

/* 🤖 AI ROUTE LOG */
logAIRouting(start,end){
this.track("ai_route", {start,end});
},

/* 📍 HARİTA AÇ */
openMap(lat,lng){
window.open(`https://www.google.com/maps?q=${lat},${lng}`);
}

};

/* 🚀 INIT */
document.addEventListener("DOMContentLoaded",()=>{

console.log("🚀 KuryeAI SEO Modül Aktif");

/* CTA TRACK */
document.querySelectorAll(".cta-button").forEach(btn=>{
btn.addEventListener("click",()=>{
KuryeAI_Google.track("cta_click");
});
});

/* 📦 ORDER TRACK */
document.querySelectorAll(".order-btn").forEach(btn=>{
btn.addEventListener("click",()=>{
KuryeAI_Google.track("order_create");
});
});

});

/* 🌍 GLOBAL */
window.KuryeAI_Google = KuryeAI_Google;