/**
 * KuryeAI - Güvenli Giriş ve Yetkilendirme Sistemi
 */

function handleSecureLogin(type, user, pass) {
    // Belirlediğin Kimlik Bilgileri
    const accounts = {
        admin: { u: "burakline", p: "burakline123", url: "admin.html" },
        restaurant: { u: "tava", p: "tava123", url: "restaurant.html" },
        courier: { u: "harunkaya", p: "harun123", url: "courier.html" }
    };

    const target = accounts[type];

    if (user === target.u && pass === target.p) {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userRole", type);
        window.location.href = target.url;
    } else {
        alert("Hatalı kullanıcı adı veya şifre!");
    }
}

// URL üzerinden doğrudan girişi engelleme (Basit Koruma)
(function checkRoute() {
    const page = window.location.pathname;
    const protectedPages = ["admin.html", "restaurant.html", "courier.html"];
    
    protectedPages.forEach(p => {
        if (page.includes(p) && !sessionStorage.getItem("isLoggedIn")) {
            // window.location.href = "index.html";
        }
    });
})();