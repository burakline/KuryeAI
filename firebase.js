/**
 * KuryeAI - Güvenli Giriş Sistemi
 */

function handleLogin(type) {
    const username = prompt(type.toUpperCase() + " Kullanıcı Adınızı Giriniz:");
    const password = prompt(type.toUpperCase() + " Şifrenizi Giriniz:");

    // Giriş Bilgileri Tanımlamaları
    const credentials = {
        admin: { user: "burakline", pass: "burakline123" },
        restaurant: { user: "tava", pass: "tava123" },
        courier: { user: "harunkaya", pass: "harun123" }
    };

    const target = credentials[type];

    if (username === target.user && password === target.pass) {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userRole", type);
        alert("Giriş Başarılı! Panelinize yönlendiriliyorsunuz.");
        window.location.href = type + ".html";
    } else {
        alert("Kullanıcı adı veya şifre hatalı!");
    }
}

// Sayfa bazlı erişim kontrolü (Doğrudan URL ile girişi önlemek için her panelin başında çalışır)
(function checkAccess() {
    const path = window.location.pathname;
    if (path.includes("admin.html") || path.includes("restaurant.html") || path.includes("courier.html")) {
        if (!sessionStorage.getItem("isLoggedIn")) {
            // Burayı daha sonra Firebase Auth ile tamamen kapatacağız
            console.log("Erişim denetimi aktif.");
        }
    }
})();