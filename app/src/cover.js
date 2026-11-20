// Vice Cover Studio — cover renderer (canvas 2D).
// Fresh implementation from the top-10 study: 7-panel comic grid, huge striped
// gradient title, neon script subtitle, role labels with sub-lines, location
// chip, starburst seal, palm strip, catalogue footer. No Rockstar assets.
(function (global) {
  "use strict";

  var NAVY = "#1a0b2e";
  var GOLD = "#f5c542";
  var CREAM = "#fff3d6";
  var PINK = "#ff2e88";
  var INK = "#12061f";

  // ---- layouts: panel rects as fractions of the panel zone, hero index ----
  var LAYOUTS = [
    {
      id: "vice-seven", name: "Vice Seven", hero: 0, slant: false, pop: false,
      panels: [
        [0, 0, 0.34, 0.66], [0.34, 0, 0.33, 0.33], [0.67, 0, 0.33, 0.33],
        [0.34, 0.33, 0.33, 0.33], [0.67, 0.33, 0.33, 0.33],
        [0, 0.66, 0.5, 0.34], [0.5, 0.66, 0.5, 0.34],
      ],
    },
    {
      id: "palm-six", name: "Palm Six", hero: 1, slant: false, pop: false,
      panels: [
        [0, 0, 0.333, 0.5], [0.333, 0, 0.334, 0.5], [0.667, 0, 0.333, 0.5],
        [0, 0.5, 0.333, 0.5], [0.333, 0.5, 0.334, 0.5], [0.667, 0.5, 0.333, 0.5],
      ],
    },
    {
      id: "heatwave-five", name: "Heatwave Five", hero: 0, slant: false, pop: false,
      panels: [
        [0, 0, 0.42, 1], [0.42, 0, 0.29, 0.5], [0.71, 0, 0.29, 0.5],
        [0.42, 0.5, 0.29, 0.5], [0.71, 0.5, 0.29, 0.5],
      ],
    },
    {
      id: "slant-seven", name: "Slant Seven", hero: 0, slant: true, pop: false,
      panels: [
        [0, 0, 0.34, 0.66], [0.34, 0, 0.33, 0.33], [0.67, 0, 0.33, 0.33],
        [0.34, 0.33, 0.33, 0.33], [0.67, 0.33, 0.33, 0.33],
        [0, 0.66, 0.5, 0.34], [0.5, 0.66, 0.5, 0.34],
      ],
    },
    {
      id: "hero-pop", name: "Hero Pop", hero: 0, slant: false, pop: true,
      panels: [
        [0.28, 0, 0.44, 0.66], [0, 0, 0.28, 0.33], [0.72, 0, 0.28, 0.33],
        [0, 0.33, 0.28, 0.33], [0.72, 0.33, 0.28, 0.33], [0, 0.66, 1, 0.34],
      ],
    },
    {
      id: "full-bleed", name: "Full Bleed", hero: 0, slant: false, pop: false,
      panels: [[0, 0, 1, 1]],
    },
    {
      id: "boardwalk-nine", name: "Boardwalk Nine", hero: 4, slant: false, pop: false,
      panels: [
        [0, 0, 0.333, 0.333], [0.333, 0, 0.334, 0.333], [0.667, 0, 0.333, 0.333],
        [0, 0.333, 0.333, 0.334], [0.333, 0.333, 0.334, 0.334], [0.667, 0.333, 0.333, 0.334],
        [0, 0.667, 0.333, 0.333], [0.333, 0.667, 0.334, 0.333], [0.667, 0.667, 0.333, 0.333],
      ],
    },
    {
      id: "duo-split", name: "Duo Split", hero: 0, slant: false, pop: false,
      panels: [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]],
    },
  ];

  // ---- colour grades ----
  var GRADES = [
    { id: "golden-hour", name: "Golden Hour", tint: "rgba(255,110,40,0.16)", filter: "saturate(1.3) contrast(1.06) sepia(0.18)",
      title: ["#fff6c9", "#ffd23e", "#ff8c42", "#ff2e88", "#b537f2"], script: "#ff5da2",
      band: ["#ff8c42", "#ff2e88", "#7b2ff7"] },
    { id: "neon-pink", name: "Neon Pink", tint: "rgba(255,46,136,0.20)", filter: "saturate(1.45) contrast(1.08)",
      title: ["#ffe3f1", "#ff7ac0", "#ff2e88", "#c026d3", "#7b2ff7"], script: "#ff7ac0",
      band: ["#ff2e88", "#c026d3", "#4c1d95"] },
    { id: "vice-purple", name: "Vice Purple", tint: "rgba(123,47,247,0.20)", filter: "saturate(1.35) contrast(1.05)",
      title: ["#fff6c9", "#ffd23e", "#ff8c42", "#ff2e88", "#7b2ff7"], script: "#e879f9",
      band: ["#7b2ff7", "#ff2e88", "#ff8c42"] },
    { id: "heatwave", name: "Heatwave", tint: "rgba(255,60,20,0.22)", filter: "saturate(1.4) contrast(1.1) sepia(0.25)",
      title: ["#fff3d6", "#ffd23e", "#ff7a1a", "#ff3b30", "#ff2e88"], script: "#ffb3d1",
      band: ["#ff3b30", "#ff8c42", "#ffd23e"] },
    { id: "teal-dusk", name: "Teal Dusk", tint: "rgba(20,180,180,0.16)", filter: "saturate(1.25) contrast(1.07)",
      title: ["#e6fffa", "#7ef0e0", "#2ec4b6", "#ffd23e", "#ff8c42"], script: "#7ef0e0",
      band: ["#0f766e", "#2ec4b6", "#ffd23e"] },
    { id: "noir", name: "Mono Noir", tint: "rgba(10,10,20,0.10)", filter: "saturate(0.25) contrast(1.15) brightness(1.02)",
      title: ["#ffffff", "#e8e8e8", "#c9c9c9", "#ffd23e", "#ff8c42"], script: "#ff5da2",
      band: ["#3f3f46", "#18181b", "#ff2e88"] },
  ];

  // ---- caption presets (title / script / tagline / quote / chip / burst / cat) ----
  var CAPTIONS = [
    { id: "palm-fever", name: "Palm Fever", title: "PALM FEVER", script: "one last summer",
      tagline: "FIVE FRIENDS · ONE COAST · NO WAY BACK",
      quote: "\u201CPURE GOLDEN-HOUR MAYHEM\u201D — THE HARBOR GAZETTE",
      location: "CORAL CAUSEWAY · 7:15 PM", burst: "HOT\nSUMMER '25",
      catalogue: "CAT. HW-0826", corner: "HW", vol: "VOL. 1" },
    { id: "heatwave", name: "Heatwave", title: "HEATWAVE", script: "Coastline Nights",
      tagline: "ONE COASTLINE · SIX STORIES · NO CURFEW",
      quote: "\u201CHOTTER THAN THE ASPHALT\u201D — THE PALM GAZETTE",
      location: "CORAL CAUSEWAY · 7:15 PM", burst: "HOT\nSUMMER '25",
      catalogue: "CAT. HW-0826", corner: "HW", vol: "VOL. 1" },
    { id: "high-tide", name: "High Tide Hustle", title: "HIGH TIDE HUSTLE", script: "After the Tide",
      tagline: "THE COAST IS NEVER CLEAR",
      quote: "\u201CA SUN-SOAKED THRILL RIDE.\u201D — THE BAYSIDE BUGLE",
      location: "BAY 13 · 8:40 PM", burst: "NOW\nSHOWING",
      catalogue: "CAT. HT-0913", corner: "HT", vol: "SEASON ONE" },
    { id: "neon-harbor", name: "Neon Harbor", title: "NEON HARBOR", script: "Salt & Sirens",
      tagline: "SEVEN LIVES · ONE HARBOR · NO WAY BACK",
      quote: "\u201CNEON THAT NEVER SLEEPS\u201D — THE HARBOR GAZETTE",
      location: "NEON GARAGE · 9:40 PM", burst: "ORIGINAL\nCOVER ART",
      catalogue: "CAT. NH-0741", corner: "NH", vol: "VOL. 1" },
    { id: "sunset-heist", name: "Sunset Heist", title: "SUNSET HEIST", script: "Ocean Avenue",
      tagline: "ONE LAST SUMMER JOB",
      quote: "\u201CTHE GETAWAY OF THE YEAR\u201D — THE PALM GAZETTE",
      location: "OCEAN AVE · 6:05 PM", burst: "ORIGINAL\nCOVER ART",
      catalogue: "CAT. SH-0622", corner: "SH", vol: "VOL. 1" },
    { id: "coral-heat", name: "Coral Heat", title: "CORAL HEAT", script: "salt, sun & sirens",
      tagline: "SIX LIVES · ONE SUNSET · NO TOMORROW",
      quote: "\u201CA FEVER DREAM IN NEON\u201D — THE BAYSIDE BUGLE",
      location: "CORAL CAUSEWAY · 7:15 PM", burst: "HOT\nSUMMER '25",
      catalogue: "CAT. CH-0819", corner: "CH", vol: "VOL. 1" },
  ];

  var ROLES = [
    { role: "THE CLOSER", sub: "CORAL CAUSEWAY · 7:15 PM · OWNS THE NIGHT" },
    { role: "THE INSIDER", sub: "NEON CLUB · 11:20 PM · KNOWS EVERYONE" },
    { role: "THE BOSS", sub: "MARINA DOCK · 6:00 PM · RUNS THE COAST" },
    { role: "THE DRIVER", sub: "OCEAN AVE · 6:05 PM · NEVER MISSES A TURN" },
    { role: "THE RIDER", sub: "NEON STRIP · 12:40 AM · CLOSES LATE" },
    { role: "THE COURIER", sub: "BACK ALLEY · 9:10 PM · ALWAYS DELIVERS" },
    { role: "THE FIXER", sub: "ROOFTOP BAR · 8:05 PM · OWNS THE SKYLINE" },
    { role: "THE CAPTAIN", sub: "OPEN WATER · 5:45 PM · STEERS THE CREW" },
    { role: "THE LOOKOUT", sub: "PIER 9 · 7:50 PM · SEES EVERYTHING" },
    { role: "THE MECHANIC", sub: "NEON GARAGE · 9:40 PM · FIXES ANYTHING" },
    { role: "THE ANGLER", sub: "QUIET PIER · 5:30 AM · WAITS FOR NOBODY" },
    { role: "THE WHEELMAN", sub: "COASTAL ROAD · 6:30 PM · DRIVES THE DAWN" },
  ];

  var SIZES = [
    { id: "square", name: "Square 1080 × 1080", w: 1080, h: 1080 },
    { id: "portrait", name: "Portrait 1080 × 1350", w: 1080, h: 1350 },
    { id: "wide", name: "Wide 1920 × 1080", w: 1920, h: 1080 },
    { id: "story", name: "Story 1080 × 1920", w: 1080, h: 1920 },
  ];

  // ---- image cache ----
  var imageCache = new Map();
  function loadImage(src) {
    if (imageCache.has(src)) return imageCache.get(src);
    var p = new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error("cannot load " + src)); };
      img.src = src;
    });
    imageCache.set(src, p);
    return p;
  }

  // ---- drawing helpers ----
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function star(ctx, cx, cy, rOuter, rInner, spikes) {
    ctx.beginPath();
    for (var i = 0; i < spikes * 2; i++) {
      var r = i % 2 === 0 ? rOuter : rInner;
      var a = (Math.PI * i) / spikes - Math.PI / 2;
      var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function fitFont(ctx, text, family, weight, maxW, startPx, minPx) {
    var px = startPx;
    while (px > (minPx || 8)) {
      ctx.font = weight + " " + px + "px " + family;
      if (ctx.measureText(text).width <= maxW) return px;
      px -= 1;
    }
    ctx.font = weight + " " + px + "px " + family;
    return px;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function drawPalm(ctx, x, y, s, color) {
    // Simple palm silhouette: curved trunk + 6 drooping fronds.
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(6, -28, 14, -52);
    ctx.stroke();
    for (var i = 0; i < 6; i++) {
      var a = -Math.PI * (0.08 + i * 0.16);
      var tx = 14 + Math.cos(a) * 34;
      var ty = -52 + (i % 2 ? 26 : 14);
      ctx.beginPath();
      ctx.moveTo(14, -52);
      ctx.quadraticCurveTo(14 + Math.cos(a) * 20, -52 - 12, tx, ty);
      ctx.stroke();
    }
    ctx.restore();
  }

  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  // ---- panel drawing ----
  function drawPhotoCover(ctx, img, x, y, w, h, zoom, px, py, filter) {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var scale = Math.max(w / iw, h / ih) * (zoom || 1);
    var dw = iw * scale, dh = ih * scale;
    var dx = x + (w - dw) / 2 + (px || 0) * w * 0.25;
    var dy = y + (h - dh) / 2 + (py || 0) * h * 0.25;
    var prev = ctx.filter;
    try { ctx.filter = filter || "none"; } catch (e) { /* older canvas */ }
    ctx.drawImage(img, dx, dy, dw, dh);
    try { ctx.filter = prev; } catch (e) { /* ignore */ }
  }

  function panelPath(ctx, x, y, w, h, slant, flip) {
    var s = slant ? Math.min(h * 0.12, 26) : 0;
    ctx.beginPath();
    if (!slant) { ctx.rect(x, y, w, h); return; }
    if (flip) {
      ctx.moveTo(x - s, y); ctx.lineTo(x + w - s, y); ctx.lineTo(x + w + s, y + h); ctx.lineTo(x + s, y + h);
    } else {
      ctx.moveTo(x + s, y); ctx.lineTo(x + w + s, y); ctx.lineTo(x + w - s, y + h); ctx.lineTo(x - s, y + h);
    }
    ctx.closePath();
  }

  function drawRoleLabel(ctx, x, y, w, h, role, sub, H) {
    // Black pill with pink side bar, plus a sub-line strip underneath.
    // Capped by frame height so wide short panels don't get giant labels.
    var fs = Math.max(10, Math.min(h * 0.16, w * 0.045, H * 0.022));
    ctx.font = "700 " + fs + "px Anton, sans-serif";
    var tw = ctx.measureText(role).width;
    var pw = Math.min(tw + fs * 2.1, w * 0.92);
    var ph = fs * 1.9;
    var lx = x + Math.max(4, w * 0.03);
    var ly = y + h - ph - Math.max(4, h * 0.05) - (sub ? fs * 1.5 : 0);
    ctx.save();
    rr(ctx, lx, ly, pw, ph, ph * 0.22);
    ctx.fillStyle = "rgba(8,4,16,0.92)";
    ctx.fill();
    ctx.fillStyle = PINK;
    ctx.fillRect(lx, ly, fs * 0.32, ph);
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(role, lx + fs * 0.75, ly + ph / 2 + 1);
    if (sub) {
      var sfs = Math.max(7, fs * 0.52);
      ctx.font = "700 " + sfs + "px 'Arial Narrow', Arial, sans-serif";
      var sw = Math.min(ctx.measureText(sub).width + sfs * 1.6, w * 0.94);
      var sy = ly + ph + 2;
      rr(ctx, lx, sy, sw, sfs * 1.7, 2);
      ctx.fillStyle = "rgba(8,4,16,0.75)";
      ctx.fill();
      ctx.fillStyle = "#ffd98a";
      ctx.fillText(sub, lx + sfs * 0.8, sy + sfs * 0.85 + 1);
    }
    ctx.restore();
  }

  function panelRect(zone, p, gap) {
    return {
      x: zone.x + p[0] * zone.w + gap / 2,
      y: zone.y + p[1] * zone.h + gap / 2,
      w: p[2] * zone.w - gap,
      h: p[3] * zone.h - gap,
    };
  }

  function drawPanels(ctx, state, zone, layout, images, H) {
    var gap = Math.max(3, zone.w * 0.006);
    layout.panels.forEach(function (p, i) {
      var pd = state.panels[i] || {};
      var r = panelRect(zone, p, gap);
      var x = r.x, y = r.y, w = r.w, h = r.h;
      var isHero = i === layout.hero;
      var pop = layout.pop && isHero;
      ctx.save();
      panelPath(ctx, x, y, w, h, layout.slant, i % 2 === 1);
      ctx.clip();
      var img = images[pd.photo];
      if (img) {
        var zoom = (pd.zoom || 1) * (pop ? 1.05 : 1);
        drawPhotoCover(ctx, img, x, y, w, h, zoom, pd.px || 0, pd.py || 0, state.grade.filter);
        ctx.fillStyle = state.grade.tint;
        ctx.fillRect(x, y, w, h);
      } else {
        var g = ctx.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, "#3b1d5e"); g.addColorStop(1, "#12061f");
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
      }
      // Inner shading at the bottom so labels stay readable.
      var sh = ctx.createLinearGradient(0, y + h * 0.55, 0, y + h);
      sh.addColorStop(0, "rgba(10,4,20,0)");
      sh.addColorStop(1, "rgba(10,4,20,0.55)");
      ctx.fillStyle = sh;
      ctx.fillRect(x, y + h * 0.55, w, h * 0.45);
      ctx.restore();
      // Gold frame; hero gets a thick white halo when popping.
      ctx.save();
      if (pop) {
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = Math.max(10, zone.w * 0.02);
        ctx.shadowOffsetY = Math.max(6, zone.w * 0.008);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(5, zone.w * 0.008);
      } else {
        ctx.strokeStyle = "rgba(245,197,66,0.9)";
        ctx.lineWidth = Math.max(2, zone.w * 0.003);
      }
      panelPath(ctx, x, y, w, h, layout.slant, i % 2 === 1);
      ctx.stroke();
      ctx.restore();
    });
  }

  // Role labels draw LAST (after the title) so every panel's label stays
  // fully readable even where the huge title overlaps a panel's corner.
  function drawPanelLabels(ctx, state, zone, layout, H) {
    var gap = Math.max(3, zone.w * 0.006);
    layout.panels.forEach(function (p, i) {
      var pd = state.panels[i] || {};
      var r = panelRect(zone, p, gap);
      var role = ROLES[i % ROLES.length];
      drawRoleLabel(ctx, r.x, r.y, r.w, r.h, pd.role || role.role, pd.sub || role.sub, H);
    });
  }

  // ---- chrome: top bar, chip, starburst ----
  function drawTopBar(ctx, state, W, H) {
    var barH = H * 0.055;
    ctx.fillStyle = NAVY;
    ctx.fillRect(0, 0, W, barH);
    var cy = barH / 2;
    // Five gold stars.
    var sx = W * 0.02;
    var sr = Math.min(barH * 0.32, W * 0.014);
    ctx.fillStyle = GOLD;
    for (var i = 0; i < 5; i++) {
      star(ctx, sx + sr + i * sr * 2.4, cy, sr, sr * 0.45, 5);
      ctx.fill();
    }
    // Press quote, centred.
    ctx.fillStyle = CREAM;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var qfs = fitFont(ctx, state.quote, "'Arial Narrow', Arial, sans-serif", "700", W * 0.56, Math.max(11, barH * 0.42), 9);
    ctx.fillText(state.quote, W * 0.5, cy + 1);
    // VOL badge, top right.
    ctx.font = "700 " + Math.max(11, barH * 0.44) + "px Anton, sans-serif";
    var vw = ctx.measureText(state.vol).width + barH * 0.7;
    ctx.save();
    ctx.translate(W - W * 0.015 - vw / 2, cy);
    ctx.rotate(0.02);
    rr(ctx, -vw / 2, -barH * 0.36, vw, barH * 0.72, 3);
    ctx.fillStyle = GOLD;
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.fillText(state.vol, 0, 1);
    ctx.restore();
    // Gold rule under the bar.
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, barH - 2, W, 2);
  }

  function drawLocationChip(ctx, state, W, H) {
    if (!state.location) return;
    var fs = Math.max(12, W * 0.016);
    ctx.font = "700 " + fs + "px 'Arial Narrow', Arial, sans-serif";
    var w = ctx.measureText(state.location).width + fs * 2.2;
    var h = fs * 2.1;
    var cx = W * 0.72, cy = H * 0.115;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.03);
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    rr(ctx, -w / 2, -h / 2, w, h, 4);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(state.location, 0, 1);
    ctx.restore();
  }

  function drawStarburst(ctx, state, W, H) {
    if (!state.burst) return;
    var r = Math.max(34, W * 0.052);
    var cx = W * 0.585, cy = H * 0.415;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.21);
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;
    star(ctx, 0, 0, r, r * 0.78, 14);
    ctx.fillStyle = "#ffd23e";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.lineWidth = Math.max(2, r * 0.04);
    ctx.strokeStyle = "#7a4d00";
    ctx.stroke();
    ctx.fillStyle = "#8a1c00";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var lines = state.burst.split("\n");
    var fs = fitFont(ctx, lines[0], "Anton, sans-serif", "400", r * 1.25, r * 0.34, 10);
    lines.forEach(function (ln, i) {
      ctx.font = "400 " + fs + "px Anton, sans-serif";
      ctx.fillText(ln, 0, (i - (lines.length - 1) / 2) * fs * 1.05 + 1);
    });
    ctx.restore();
  }

  // ---- title: striped gradient letters on an offscreen canvas ----
  // Tall condensed letters like the top entries: the text is drawn at a big
  // point size and squeezed horizontally (scaleX) so it fits 88% of the
  // width while staying ~30% of the frame tall.
  function drawTitle(ctx, state, W, H) {
    var title = (state.title || "PALM FEVER").toUpperCase();
    var maxW = W * 0.88;
    var px = Math.min(H * 0.28, W * 0.28);
    var probe = document.createElement("canvas").getContext("2d");
    probe.font = "400 " + px + "px Anton, sans-serif";
    var nw = probe.measureText(title).width;
    var scaleX = Math.min(1, maxW / nw);
    if (scaleX < 0.55) {
      px = Math.floor(px * (scaleX / 0.55));
      probe.font = "400 " + px + "px Anton, sans-serif";
      nw = probe.measureText(title).width;
      scaleX = 0.55;
    }
    var shear = -0.10;
    var pad = Math.ceil(px * 0.22);
    var offW = Math.ceil(nw * scaleX + Math.abs(shear) * px) + pad * 2;
    var offH = Math.ceil(px * 1.30) + pad * 2;
    var off = document.createElement("canvas");
    off.width = Math.max(2, offW);
    off.height = Math.max(2, offH);
    var o = off.getContext("2d");
    o.translate(pad + Math.abs(shear) * px, pad);
    o.transform(scaleX, 0, shear, 1, 0, 0);
    o.font = "400 " + px + "px Anton, sans-serif";
    o.textBaseline = "alphabetic";
    o.textAlign = "left";
    o.lineJoin = "round";
    o.lineWidth = Math.max(4, px * 0.085);
    o.strokeStyle = INK;
    o.strokeText(title, 0, px);
    var grad = o.createLinearGradient(0, 0, 0, px);
    var stops = state.grade.title;
    stops.forEach(function (c, i) { grad.addColorStop(i / (stops.length - 1), c); });
    o.fillStyle = grad;
    o.fillText(title, 0, px);
    // Retro horizontal stripes cut through the letters.
    o.globalCompositeOperation = "source-atop";
    var stripeH = Math.max(3, px * 0.055);
    for (var y = px * 0.16; y < px; y += stripeH * 2.6) {
      o.fillStyle = "rgba(26,11,46,0.34)";
      o.fillRect(0, y, nw, stripeH);
    }
    // White sparkle glints on the letters.
    o.fillStyle = "rgba(255,255,255,0.85)";
    var glints = [[0.12, 0.2], [0.46, 0.1], [0.78, 0.24], [0.3, 0.55]];
    glints.forEach(function (g2) {
      var gx = g2[0] * nw, gy = g2[1] * px, gr = Math.max(3, px * 0.045);
      star(o, gx, gy, gr, gr * 0.35, 4);
      o.fill();
    });
    o.globalCompositeOperation = "source-over";
    // Paste onto the cover: glyphs span ~ty+0.28px .. ty+px, baseline ty+px.
    // Kept high enough that the bottom-row role pills (~0.71H) stay clear.
    var ty = H * 0.42;
    ctx.save();
    ctx.shadowColor = "rgba(10,2,24,0.75)";
    ctx.shadowBlur = Math.max(12, W * 0.018);
    ctx.shadowOffsetY = Math.max(6, H * 0.008);
    ctx.drawImage(off, (W - offW) / 2, ty - pad, offW, offH);
    ctx.restore();
    return { top: ty - pad, height: offH, width: offW, baseline: ty + px, size: px };
  }

  function drawScript(ctx, state, W, H, titleBox) {
    if (!state.script) return;
    var fs = Math.max(22, W * 0.062);
    ctx.save();
    var cx = W * 0.56;
    // Sit right on the title's baseline so the script overlaps its bottom edge.
    var cy = titleBox.baseline - titleBox.size * 0.10;
    ctx.translate(cx, cy);
    ctx.rotate(-0.05);
    var fitted = fitFont(ctx, state.script, "Pacifico, cursive", "400", W * 0.62, fs, 14);
    ctx.font = fitted + "px Pacifico, cursive";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(2, fitted * 0.09);
    ctx.strokeStyle = "rgba(26,11,46,0.85)";
    ctx.shadowColor = state.grade.script;
    ctx.shadowBlur = Math.max(10, W * 0.014);
    ctx.fillStyle = state.grade.script;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(state.script, 0, 0);
    ctx.fillText(state.script, 0, 0);
    ctx.restore();
  }

  // ---- tagline band, palm strip, footer ----
  function drawTaglineBand(ctx, state, W, H) {
    var y = H * 0.80, h = H * 0.045;
    var g = ctx.createLinearGradient(0, y, W, y);
    state.grade.band.forEach(function (c, i) { g.addColorStop(i / (state.grade.band.length - 1), c); });
    ctx.fillStyle = g;
    ctx.fillRect(0, y, W, h);
    // Sun disc at the left.
    ctx.fillStyle = "#ffd23e";
    ctx.beginPath();
    ctx.arc(W * 0.045, y + h / 2, h * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = CREAM;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var fs = fitFont(ctx, state.tagline, "'Arial Narrow', Arial, sans-serif", "700", W * 0.86, Math.max(12, h * 0.52), 9);
    // Letter-spaced by drawing with wide spaces already in the string.
    ctx.fillText(state.tagline, W * 0.52, y + h / 2 + 1);
  }

  function drawPalmStrip(ctx, state, W, H) {
    var y = H * 0.845, h = H * 0.04;
    var g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, "#ff8c42");
    g.addColorStop(1, "#7b2ff7");
    ctx.fillStyle = g;
    ctx.fillRect(0, y, W, h);
    ctx.fillStyle = "rgba(26,11,46,0.9)";
    var s = h * 0.85;
    var n = Math.max(6, Math.floor(W / (s * 1.9)));
    for (var i = 0; i < n; i++) {
      var px = W * 0.03 + i * ((W * 0.94) / n) + (i % 2 ? s * 0.25 : 0);
      drawPalm(ctx, px, y + h * 0.98, s / 62, "rgba(26,11,46,0.9)");
    }
  }

  function drawBarcode(ctx, x, y, w, h, seedText) {
    var seed = hashStr(seedText || "HW-0826");
    var bx = x;
    ctx.fillStyle = "#111";
    while (bx < x + w) {
      seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
      var bw = 1 + (seed % 3);
      if (seed % 5 < 3) ctx.fillRect(bx, y, bw, h);
      bx += bw + 1 + (seed % 2);
    }
  }

  function drawFooter(ctx, state, W, H) {
    var y = H * 0.885, h = H * 0.115;
    ctx.fillStyle = "#0a0414";
    ctx.fillRect(0, y, W, h);
    var cy = y + h / 2;
    // COMING SOON, neon pink.
    ctx.save();
    ctx.font = "700 " + Math.max(12, W * 0.02) + "px Anton, sans-serif";
    ctx.shadowColor = PINK;
    ctx.shadowBlur = Math.max(8, W * 0.008);
    ctx.fillStyle = "#ff7ac0";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("COMING SOON", W * 0.02, cy - h * 0.18);
    ctx.restore();
    // Corner mark chip under it.
    ctx.fillStyle = GOLD;
    ctx.font = "700 " + Math.max(10, W * 0.013) + "px Anton, sans-serif";
    var cw = ctx.measureText(state.corner).width + 14;
    rr(ctx, W * 0.02, cy + h * 0.08, cw, h * 0.26, 3);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.fillText(state.corner, W * 0.02 + cw / 2, cy + h * 0.21);
    // Credits, centred, two lines.
    ctx.fillStyle = "rgba(255,243,214,0.85)";
    ctx.textAlign = "center";
    var cfs = Math.max(8, W * 0.0105);
    ctx.font = "700 " + cfs + "px 'Arial Narrow', Arial, sans-serif";
    ctx.fillText("A SUNSET PICTURES PRODUCTION · STARRING YOU · SHOT ON YOUR OWN CAMERA · GRADED BY HAND", W * 0.5, cy - h * 0.16);
    ctx.fillStyle = "rgba(255,243,214,0.6)";
    ctx.fillText("STARRING " + state.panels.slice(0, 6).map(function (p, i) { return (p.role || ROLES[i % ROLES.length].role); }).join(" · "), W * 0.5, cy + h * 0.18);
    // Catalogue + barcode, right.
    ctx.fillStyle = CREAM;
    ctx.textAlign = "right";
    ctx.font = "700 " + Math.max(9, W * 0.011) + "px 'Arial Narrow', Arial, sans-serif";
    ctx.fillText(state.catalogue, W * 0.985, cy - h * 0.22);
    drawBarcode(ctx, W * 0.885, cy + h * 0.02, W * 0.10, h * 0.34, state.catalogue);
    ctx.fillStyle = "rgba(255,243,214,0.7)";
    ctx.font = "400 " + Math.max(7, W * 0.008) + "px Arial, sans-serif";
    ctx.fillText("002113 122020", W * 0.985, cy + h * 0.44);
  }

  function grainAndVignette(ctx, W, H) {
    var v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, "rgba(10,4,20,0)");
    v.addColorStop(1, "rgba(10,4,20,0.28)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = 0.05;
    for (var i = 0; i < 900; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
      ctx.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4);
    }
    ctx.restore();
  }

  // ---- main render ----
  async function renderCover(canvas, state, size) {
    var W = size.w, H = size.h;
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d");
    var layout = LAYOUTS.find(function (l) { return l.id === state.layout; }) || LAYOUTS[0];
    var grade = GRADES.find(function (g) { return g.id === state.grade; }) || GRADES[0];
    var st = Object.assign({}, state, { grade: grade });
    // Load fonts + photos first.
    try {
      await Promise.all([
        document.fonts.load('400 100px Anton'),
        document.fonts.load('400 100px Pacifico'),
        document.fonts.load('700 20px "Arial Narrow"'),
      ]);
    } catch (e) { /* fonts fall back */ }
    var images = [];
    for (var i = 0; i < st.panels.length; i++) {
      var pd = st.panels[i] || {};
      var src = (st.photos[pd.photo] || {}).src;
      if (src) {
        try { images[i] = await loadImage(src); } catch (e) { images[i] = null; }
      }
    }
    ctx.fillStyle = NAVY;
    ctx.fillRect(0, 0, W, H);
    var zone = { x: W * 0.012, y: H * 0.055, w: W * 0.976, h: H * 0.745 };
    drawPanels(ctx, st, zone, layout, images, H);
    drawTopBar(ctx, st, W, H);
    drawLocationChip(ctx, st, W, H);
    drawStarburst(ctx, st, W, H);
    var titleBox = drawTitle(ctx, st, W, H);
    drawScript(ctx, st, W, H, titleBox);
    drawTaglineBand(ctx, st, W, H);
    drawPalmStrip(ctx, st, W, H);
    drawFooter(ctx, st, W, H);
    drawPanelLabels(ctx, st, zone, layout, H);
    grainAndVignette(ctx, W, H);
    return { layout: layout, grade: grade };
  }

  function applyCaptionPreset(state, presetId) {
    var p = CAPTIONS.find(function (c) { return c.id === presetId; }) || CAPTIONS[0];
    state.caption = p.id;
    state.title = p.title;
    state.script = p.script;
    state.tagline = p.tagline;
    state.quote = p.quote;
    state.location = p.location;
    state.burst = p.burst;
    state.catalogue = p.catalogue;
    state.corner = p.corner;
    state.vol = p.vol;
    return p;
  }

  function defaultPanels(layoutId) {
    var layout = LAYOUTS.find(function (l) { return l.id === layoutId; }) || LAYOUTS[0];
    return layout.panels.map(function (_, i) {
      var r = ROLES[i % ROLES.length];
      return { photo: i % 8, zoom: 1.15, px: 0, py: 0, role: r.role, sub: r.sub };
    });
  }

  global.ViceCover = {
    LAYOUTS: LAYOUTS,
    GRADES: GRADES,
    CAPTIONS: CAPTIONS,
    ROLES: ROLES,
    SIZES: SIZES,
    renderCover: renderCover,
    applyCaptionPreset: applyCaptionPreset,
    defaultPanels: defaultPanels,
  };
})(window);
