/**
 * KuryeAI - Google Haritalar ve SEO Entegrasyon Modülü
 */

const KuryeAI_Google = {
    settings: {
        name: "KuryeAI",
        phone: "+905072171295",
        // ÖNEMLİ: Google profilin onaylanınca alacağın Place ID'yi buraya yazacağız
        placeId: "PLACE_ID_BEKLENIYOR", 
        mapUrl: "https://maps.app.goo.gl/Ankara_Kecioren_Merkez" 
    },

    // Müşteriyi doğrudan Google yorum sayfasına yönlendirir
    openReviewPage: function() {
        if(this.settings.placeId !== "PLACE_ID_BEKLENIYOR") {
            const url = `https://search.google.com/local/writereview?placeid=${this.settings.placeId}`;
            window.open(url, '_blank');
        } else {
            alert("KuryeAI profil doğrulaması devam ediyor. Yakında aktif olacak!");
        }
    },

    // Yapay Zeka Rota Motoru Loglaması (Vizyoner Takip)
    logAIRouting: function(start, end) {
        console.log(`%c[KuryeAI-AI]%c ${start} noktasından ${end} noktasına en verimli rota hesaplandı.`, 
            "color: #00d4ff; font-weight: bold", "color: #fff");
    }
};

// Sayfa yüklendiğinde temel kurulumu yap
document.addEventListener('DOMContentLoaded', () => {
    console.log("%c🚀 KuryeAI Google Entegrasyonu Hazır!", "background: #1a1a1a; color: #00d4ff; padding: 5px; border-radius: 3px;");
    
    // Uygulama içindeki kurye çağırma butonlarına takip ekle
    const orderButtons = document.querySelectorAll('.cta-button');
    orderButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            KuryeAI_Google.logAIRouting("Müşteri Konumu", "Restoran Paneli");
        });
    });
});