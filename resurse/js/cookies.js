function setCookie(nume, val, timpExpirare, path = "/") {
    let d = new Date();
    d.setTime(d.getTime() + timpExpirare);
    document.cookie = `${nume}=${val}; expires=${d.toUTCString()}; path=${path}`;
}

function getCookie(nume) {
    const vectCookies = document.cookie.split(";");
    for (let cookie of vectCookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(nume + "=")) {
            return cookie.substring(nume.length + 1);
        }
    }
}

function deleteCookie(nume) {
    setCookie(nume, "", 0);
}

function checkBanner() {
    if (getCookie("acceptat_banner")) {
        document.getElementById("banner").style.display = "none";
    } else {
        document.getElementById("banner").style.display = "block";
        document.getElementById("ok_cookies").onclick = () => {
            console.log("here!");
            document.getElementById("banner").style.display = "none";
            setCookie("acceptat_banner", "1", 5000);
        }
    }
}

function deleteAllCookies() {
    const vectCookies = document.cookie.split(";");
    for (let cookie of vectCookies) {
        cookie_name = cookie.trim().split(";")[0];
        setCookie(cookie_name, "", 0);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    checkBanner();
});