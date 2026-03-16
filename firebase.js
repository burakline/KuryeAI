/**
 * KuryeAI - Güvenli Giriş Sistemi
 */
function handleSecureLogin(type, user, pass) {
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