window.addEventListener("load", () => {
    document.getElementById("toggle-theme").onclick = () => {
        const _tema = localStorage.getItem("tema");
        if (_tema) {
            localStorage.removeItem("tema");
        } else {
            localStorage.setItem("tema", "dark");
        }
        document.body.classList.toggle("dark");
    }
});