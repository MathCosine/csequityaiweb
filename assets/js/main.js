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
    var mx = -100, my = -100, rx = -100, ry = -100, cursorRaf = 0;
    /* Runs only while the ring is still catching up, then sleeps until the
       mouse moves again. Centring is done by the trailing translate(-50%,-50%)
       rather than reading offsetWidth, which forced a layout every frame. */
    function cursorLoop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      cursorRaf = Math.abs(mx - rx) + Math.abs(my - ry) > 0.3 ? requestAnimationFrame(cursorLoop) : 0;
    }
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!cursorRaf) cursorRaf = requestAnimationFrame(cursorLoop);
    });
    cursorLoop();
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
    /* grey out an arrow once there is nothing further in that direction */
    var syncArrows = function () {
      var max = rail.scrollWidth - rail.clientWidth;
      /* the rail's 4px side padding + snapping means "the start" rests at ~4px */
      if (prev) prev.disabled = rail.scrollLeft <= 8;
      if (next) next.disabled = rail.scrollLeft >= max - 8;
    };
    rail.addEventListener("scroll", syncArrows, { passive: true });
    window.addEventListener("resize", syncArrows);
    syncArrows();
  }

  /* ---------- deadlines: mark the ones already behind us ---------- */
  document.querySelectorAll("[data-deadlines]").forEach(function (box) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var cells = box.querySelectorAll(".date-cell");
    var past = 0;
    cells.forEach(function (cell) {
      var t = cell.querySelector("time[datetime]");
      if (!t) return;
      var p = t.getAttribute("datetime").split("-");
      var d = new Date(+p[0], +p[1] - 1, +p[2]);        /* local midnight, no UTC shift */
      if (d < today) {
        cell.classList.add("is-past"); past++;
        var label = cell.querySelector(".label");
        if (label && !label.querySelector(".state")) {
          var s = document.createElement("span");
          s.className = "state"; s.textContent = "Passed";
          label.appendChild(s);
        }
      }
    });
    if (past && past === cells.length && !box.querySelector(".dates-closed")) {
      var note = document.createElement("p");
      note.className = "dates-closed";
      note.textContent = "This intake has closed.";
      box.appendChild(note);
    }
  });

  /* ---------- copy buttons (donation details) ---------- */
  var copyStatus = document.getElementById("copy-status");
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {       /* older browsers */
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      ok ? resolve() : reject();
    });
  }
  document.querySelectorAll(".copy[data-copy]").forEach(function (btn) {
    var label = btn.textContent, timer;
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      copyText(value).then(function () {
        btn.textContent = "Copied"; btn.classList.add("done");
        if (copyStatus) copyStatus.textContent = value + " copied to clipboard";
      }, function () {
        btn.textContent = "Copy failed";
      });
      clearTimeout(timer);
      timer = setTimeout(function () { btn.textContent = label; btn.classList.remove("done"); }, 1800);
    });
  });

  /* ---------- event rows: whole card is a hit target ---------- */
  /* The <a> stays the real link (keyboard, crawlers, middle-click); this only
     widens the click area. Ignores drags/selections and nested links. */
  document.querySelectorAll(".evt").forEach(function (card) {
    var links = card.querySelectorAll("a[href]");
    var target = null;
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute("href") || "";
      if (h && !/^(https?:|mailto:|#)/.test(h)) { target = links[i]; break; }
    }
    if (!target) return;
    card.classList.add("linked");
    var downX = 0, downY = 0;
    card.addEventListener("pointerdown", function (e) { downX = e.clientX; downY = e.clientY; });
    card.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) return;                    /* real link wins */
      if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 8) return;  /* a drag */
      if (window.getSelection && String(window.getSelection())) return;           /* selecting text */
      target.click();
    });
  });

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
    var LINES = 10, heroInView = true, heroRaf = 0;
    function frame() {
      heroRaf = 0;
      if (!heroInView || document.hidden) return;   /* nobody is looking: stop drawing */
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
      heroRaf = requestAnimationFrame(frame);
    }
    function wakeHero() { if (!heroRaf && heroInView && !document.hidden) heroRaf = requestAnimationFrame(frame); }
    /* the hero is one screen of a long page — don't redraw it while the
       visitor is reading the FAQ */
    new IntersectionObserver(function (entries) {
      heroInView = entries[0].isIntersecting; wakeHero();
    }).observe(canvas);
    document.addEventListener("visibilitychange", wakeHero);
    wakeHero();
  }
})();
