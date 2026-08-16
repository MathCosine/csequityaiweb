/* CS Equity AI — site behavior: scroll dynamics, kinetic type, cursor */
(function () {
  "use strict";
  window.__cseq = true; /* tells the inline head failsafe that this file ran */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- nav: mobile menu + hide-on-scroll ---------- */
  var nav = document.querySelector(".nav");
  var burger = document.querySelector(".nav-burger");
  var links = document.querySelector(".nav-links");
  if (burger && links) {
    var setMenu = function (open) {
      links.classList.toggle("open", open);
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    };
    burger.addEventListener("click", function (e) {
      e.stopPropagation();
      setMenu(!links.classList.contains("open"));
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    /* tap/click anywhere outside the menu closes it */
    document.addEventListener("click", function (e) {
      if (!links.classList.contains("open")) return;
      if (e.target.closest(".nav-links") || e.target.closest(".nav-burger")) return;
      setMenu(false);
    });
    /* Escape closes it and hands focus back to the button */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) {
        setMenu(false);
        burger.focus();
      }
    });
    /* leaving mobile width with the menu open would leave stale state behind */
    window.matchMedia("(max-width: 960px)").addEventListener("change", function (m) {
      if (!m.matches) setMenu(false);
    });
  }
  var lastY = 0;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    if (nav) {
      if (y > 140 && y > lastY && !(links && links.classList.contains("open"))) {
        nav.classList.add("hidden");
      } else {
        nav.classList.remove("hidden");
      }
    }
    lastY = y;
  }, { passive: true });

  /* ---------- scroll progress bar ---------- */
  var progress = document.createElement("div");
  progress.className = "progress";
  document.body.appendChild(progress);
  function paintProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
  }
  window.addEventListener("scroll", paintProgress, { passive: true });
  paintProgress();

  /* ---------- custom cursor ---------- */
  if (finePointer && !reduceMotion) {
    var dot = document.createElement("div"); dot.className = "cursor-dot";
    var ring = document.createElement("div"); ring.className = "cursor-ring";
    document.body.appendChild(dot); document.body.appendChild(ring);
    var mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; });
    (function cursorLoop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      dot.style.transform = "translate(" + (mx - 3) + "px," + (my - 3) + "px)";
      ring.style.transform = "translate(" + (rx - ring.offsetWidth / 2) + "px," + (ry - ring.offsetHeight / 2) + "px)";
      requestAnimationFrame(cursorLoop);
    })();
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest("a, button")) ring.classList.add("hovering");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest("a, button")) ring.classList.remove("hovering");
    });
  }

  /* ---------- kinetic type: split headlines into words ---------- */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    el.textContent = "";
    el.classList.add("kin");
    function wrapWords(text, parent) {
      text.split(/(\s+)/).forEach(function (piece) {
        if (!piece) return;
        if (/^\s+$/.test(piece)) { parent.appendChild(document.createTextNode(" ")); return; }
        var w = document.createElement("span"); w.className = "w";
        var wi = document.createElement("span"); wi.className = "wi";
        wi.textContent = piece;
        w.appendChild(wi); parent.appendChild(w);
      });
    }
    nodes.forEach(function (node) {
      if (node.nodeType === 3) { wrapWords(node.textContent, el); }
      else if (node.nodeType === 1) {
        var clone = node.cloneNode(false);
        clone.textContent = "";
        wrapWords(node.textContent, clone);
        el.appendChild(clone);
      }
    });
    var words = el.querySelectorAll(".wi");
    words.forEach(function (wi, i) { wi.style.transitionDelay = Math.min(i * 45, 650) + "ms"; });
    if (reduceMotion) { el.classList.add("go"); return; }
    new IntersectionObserver(function (entries, o) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("go"); o.unobserve(e.target); }
      });
    }, { threshold: 0.35 }).observe(el);
  });

  /* ---------- reveals + stagger ---------- */
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal, .reveal-blur, .stagger").forEach(function (el) {
    if (el.classList.contains("stagger")) {
      Array.prototype.forEach.call(el.children, function (child, i) {
        child.style.transitionDelay = (i * 90) + "ms";
      });
    }
    obs.observe(el);
  });

  /* ---------- counters ---------- */
  function animateCount(el) {
    var raw = el.getAttribute("data-count");
    var target = parseFloat(raw);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = prefix + raw + suffix; return; }
    var start = null, dur = 1500;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var cObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { animateCount(e.target); cObs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll("[data-count]").forEach(function (el) { cObs.observe(el); });

  /* ---------- FAQ ---------- */
  var faqItems = [];
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    faqItems.push({ item: item, q: q, a: a });
    q.setAttribute("aria-expanded", "false");
    q.addEventListener("click", function () {
      var open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", open ? "true" : "false");
      a.style.maxHeight = open ? a.scrollHeight + "px" : "0";
    });
  });
  /* an open answer's max-height is pinned in px, so it clips when the text
     reflows (rotation, window resize, late-loading webfont) — recompute it */
  function resyncFaq() {
    faqItems.forEach(function (f) {
      if (f.item.classList.contains("open")) f.a.style.maxHeight = f.a.scrollHeight + "px";
    });
  }
  if (faqItems.length) {
    window.addEventListener("resize", resyncFaq);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resyncFaq);
  }

  /* ---------- pinned path: highlight active level ---------- */
  var pathSteps = document.querySelectorAll(".path-step");
  var bigNums = document.querySelectorAll(".path-sticky .big span");
  var names = document.querySelectorAll(".path-sticky .names div");
  if (pathSteps.length && bigNums.length) {
    var stepObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var idx = Array.prototype.indexOf.call(pathSteps, e.target);
        bigNums.forEach(function (n, i) { n.classList.toggle("on", i === idx); });
        names.forEach(function (n, i) { n.classList.toggle("on", i === idx); });
        pathSteps.forEach(function (s, i) { s.classList.toggle("active", i === idx); });
      });
    }, { rootMargin: "-40% 0px -50% 0px" });
    pathSteps.forEach(function (s) { stepObs.observe(s); });
  }

  /* ---------- works rail: drag to scroll + arrows ---------- */
  var rail = document.querySelector(".works-rail");
  if (rail) {
    var isDown = false, startX = 0, scrollStart = 0;
    rail.addEventListener("pointerdown", function (e) {
      isDown = true; startX = e.clientX; scrollStart = rail.scrollLeft;
      rail.classList.add("dragging");
    });
    window.addEventListener("pointermove", function (e) {
      if (!isDown) return;
      rail.scrollLeft = scrollStart - (e.clientX - startX);
    });
    window.addEventListener("pointerup", function () {
      isDown = false; rail.classList.remove("dragging");
    });
    var prev = document.querySelector(".rail-nav .prev");
    var next = document.querySelector(".rail-nav .next");
    var cardW = function () { return rail.firstElementChild ? rail.firstElementChild.offsetWidth + 18 : 320; };
    if (prev) prev.addEventListener("click", function () { rail.scrollBy({ left: -cardW(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { rail.scrollBy({ left: cardW(), behavior: "smooth" }); });
  }

  /* ---------- parallax ---------- */
  var pll = document.querySelectorAll("[data-parallax]");
  if (pll.length && !reduceMotion) {
    var ticking = false;
    function parallax() {
      pll.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
        var rect = el.getBoundingClientRect();
        var mid = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.transform = "translateY(" + (-mid * speed).toFixed(1) + "px)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
    parallax();
  }

  /* ---------- tilt on team photos ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".member .photo").forEach(function (ph) {
      ph.addEventListener("mousemove", function (e) {
        var r = ph.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        ph.style.transform = "rotateY(" + (x * 7) + "deg) rotateX(" + (-y * 7) + "deg)";
      });
      ph.addEventListener("mouseleave", function () { ph.style.transform = ""; });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + x * 0.18 + "px," + y * 0.3 + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- hero canvas: drifting contour lines ---------- */
  var canvas = document.getElementById("hero-canvas");
  if (canvas && !reduceMotion) {
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
    var LINES = 10;
    (function frame() {
      t += 0.0032;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < LINES; i++) {
        var yBase = (H / (LINES + 1)) * (i + 1);
        var phase = t * (0.6 + i * 0.07) + i * 1.7;
        var amp = 16 + i * 4;
        ctx.beginPath();
        for (var x = -10; x <= W + 10; x += 8) {
          var y = yBase
            + Math.sin(x * 0.0028 + phase) * amp
            + Math.sin(x * 0.0011 - phase * 0.7) * amp * 0.6;
          if (x === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        var col = i % 2 === 0 ? "18, 138, 98" : "14, 111, 184";
        ctx.strokeStyle = "rgba(" + col + ", " + (0.05 + i * 0.009).toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      requestAnimationFrame(frame);
    })();
  }
})();
