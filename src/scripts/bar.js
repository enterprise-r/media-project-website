/* Wallpaper pages leave the title bar clear at the top of the picture.
   The first pixel of scroll fills it. The class is read by bar.css. */
(function () {
  var header = document.querySelector("body > header.r-bar");
  if (!header || document.querySelector(".showcase, main.login")) return;

  var paint = function () {
    header.classList.toggle("is-solid", window.scrollY > 0);
  };

  paint();
  window.addEventListener("scroll", paint, { passive: true });
  window.addEventListener("pageshow", paint);
})();
