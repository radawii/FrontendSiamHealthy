const mainImage = document.getElementById("mainProduct");
const thumbs = document.querySelectorAll(".thumbs img");

thumbs.forEach(img => {

    img.addEventListener("click", function(){

        // เปลี่ยนรูปใหญ่
        mainImage.src = this.src;

        // เอฟเฟกต์ Fade
        mainImage.style.opacity = "0";

        setTimeout(() => {
            mainImage.src = this.src;
            mainImage.style.opacity = "1";
        },150);

        // Active Border
        thumbs.forEach(item => item.classList.remove("active"));
        this.classList.add("active");

    });

});
// Ascender KB: load the ingredient-name linker (no-op on pages without ingredient cards)
(function () {
  if (document.querySelector('script[src="/js/ingredient-links.js"]')) return;
  var s = document.createElement('script');
  s.src = '/js/ingredient-links.js';
  s.defer = true;
  document.head.appendChild(s);
})();
