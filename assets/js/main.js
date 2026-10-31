/* CS Equity AI — site behavior: nav, reveals, tabs, carousel, deadlines */
(function () {
  "use strict";
  window.__cseq = true; /* tells the inline head failsafe that this file ran */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* ---------- reveals + stagger ---------- */
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal, .reveal-blur, .stagger").forEach(function (el) {
    if (el.classList.contains("stagger")) {
      Array.prototype.forEach.call(el.children, function (child, i) {
        child.style.transitionDelay = (i * 60) + "ms";
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
  /* the HTML carries the real figure (for no-JS visitors, link previews and
     crawlers); only zero it out when we are actually going to count up */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    if (!reduceMotion) el.textContent = (el.getAttribute("data-prefix") || "") + "0" + (el.getAttribute("data-suffix") || "");
    cObs.observe(el);
  });

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

  /* ---------- path: level tabs (one level shown at a time) ---------- */
  var pathTabs = document.querySelectorAll('.path-sticky [role="tab"]');
  var pathSteps = document.querySelectorAll(".path-step");
  var bigNums = document.querySelectorAll(".path-sticky .big span");
  if (pathTabs.length && pathSteps.length) {
    var showLevel = function (idx, focus) {
      pathTabs.forEach(function (t, i) {
        var on = i === idx;
        t.classList.toggle("on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      bigNums.forEach(function (n, i) { n.classList.toggle("on", i === idx); });
      pathSteps.forEach(function (s, i) { s.classList.toggle("active", i === idx); });
    };
    pathTabs.forEach(function (t, i) {
      t.addEventListener("click", function () { showLevel(i, false); });
      t.addEventListener("keydown", function (e) {
        var n = pathTabs.length, j = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") j = (i + 1) % n;
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") j = (i - 1 + n) % n;
        else if (e.key === "Home") j = 0;
        else if (e.key === "End") j = n - 1;
        if (j === null) return;
        e.preventDefault();
        showLevel(j, true);
      });
    });
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
    /* a fully closed intake folds into one line instead of three "Passed" cards */
    if (past && past === cells.length && !box.querySelector(".dates-closed")) {
      var last = cells[cells.length - 1].querySelector("time[datetime]").getAttribute("datetime").split("-");
      var when = new Date(+last[0], +last[1] - 1, +last[2]).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      var note = document.createElement("p");
      note.className = "dates-closed";
      note.textContent = "The last intake closed in " + when + ". Dates for the next one will appear here.";
      box.appendChild(note);
      box.classList.add("all-past");
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
