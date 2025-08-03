document.querySelector(".menu-toggle").addEventListener("click", function () {
    document.querySelector(".nav-links").classList.toggle("active");
});

const userInfo = document.querySelector(".user-info");
if (window.innerWidth <= 768 && userInfo) {
    document.querySelector(".user-avatar").addEventListener("click", function (e) {
        e.preventDefault();
        userInfo.classList.toggle("active");
    });
}

window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    if (window.scrollY > 50) {
        header.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
    } else {
        header.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
    }
});