/* CS Equity AI — site behavior */
(function () {
  "use strict";

  /* nav */
  var burger = document.querySelector(".nav-burger");
  var links = document.querySelector(".nav-links");
  if (burger && links) {
    burger.addEventListener("click", function () { links.classList.toggle("open"); });
  }

  /* reveal on scroll */
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach(function (el) { obs.observe(el); });

  /* FAQ */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var open = item.classList.toggle("open");
      a.style.maxHeight = open ? a.scrollHeight + "px" : "0";
    });
  });

  /* hero canvas — quiet field of drifting contour lines */
  var canvas = document.getElementById("hero-canvas");
  if (canvas && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    var ctx = canvas.getContext("2d");
    var W, H, dpr, t = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // layered sine "contour" lines drifting slowly across the hero,
    // drawn very faint so the type stays dominant.
    var LINES = 9;
    function frame() {
      t += 0.0035;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < LINES; i++) {
        var yBase = (H / (LINES + 1)) * (i + 1);
        var phase = t * (0.6 + i * 0.07) + i * 1.7;
        var amp = 14 + i * 4;
        ctx.beginPath();
        for (var x = -10; x <= W + 10; x += 8) {
          var y = yBase
            + Math.sin(x * 0.0028 + phase) * amp
            + Math.sin(x * 0.0011 - phase * 0.7) * amp * 0.6;
          if (x === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        var g = i % 2 === 0 ? "18, 138, 98" : "14, 111, 184";
        ctx.strokeStyle = "rgba(" + g + ", " + (0.05 + i * 0.008).toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();
