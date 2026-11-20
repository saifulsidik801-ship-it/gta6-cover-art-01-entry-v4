// Vice Cover Studio — editor wiring. State, controls, drag-to-pan, export.
(function () {
  "use strict";

  var VC = window.ViceCover;
  var SAMPLES = [
    "samples/sample-01.jpg", "samples/sample-02.jpg", "samples/sample-03.jpg",
    "samples/sample-04.jpg", "samples/sample-05.jpg", "samples/sample-06.jpg",
    "samples/sample-07.jpg", "samples/sample-08.jpg",
  ];
  var SAMPLE_NAMES = ["Hero sunset", "Neon night", "The Boss", "Red coupe", "Speedboat", "Night rider", "Chopper", "Boardwalk"];

  var state = {
    layout: "vice-seven",
    grade: "golden-hour",
    caption: "palm-fever",
    title: "PALM FEVER",
    script: "one last summer",
    tagline: "FIVE FRIENDS · ONE COAST · NO WAY BACK",
    quote: "\u201CPURE GOLDEN-HOUR MAYHEM\u201D — THE HARBOR GAZETTE",
    location: "CORAL CAUSEWAY · 7:15 PM",
    burst: "HOT\nSUMMER '25",
    catalogue: "CAT. HW-0826",
    corner: "HW",
    vol: "VOL. 1",
    photos: SAMPLES.map(function (src, i) { return { src: src, name: SAMPLE_NAMES[i] }; }),
    panels: VC.defaultPanels("vice-seven"),
    size: "square",
    selected: 0,
  };

  var preview = document.getElementById("preview");
  var hint = document.getElementById("previewHint");
  var renderQueued = false;
  var renderToken = 0;

  function sizeObj() {
    return VC.SIZES.find(function (s) { return s.id === state.size; }) || VC.SIZES[0];
  }

  function scheduleRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(function () {
      renderQueued = false;
      var token = ++renderToken;
      VC.renderCover(preview, state, sizeObj()).then(function () {
        if (token !== renderToken) return;
      }).catch(function (err) {
        if (hint) hint.textContent = "Render hiccup: " + (err && err.message ? err.message : err);
        console.error(err);
      });
    });
  }

  function chip(container, label, sub, active, onClick) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (active ? " active" : "");
    b.textContent = label;
    if (sub) {
      var s = document.createElement("small");
      s.textContent = sub;
      b.appendChild(s);
    }
    b.addEventListener("click", onClick);
    container.appendChild(b);
  }

  function buildChips() {
    var lc = document.getElementById("layoutChips");
    lc.innerHTML = "";
    VC.LAYOUTS.forEach(function (l) {
      chip(lc, l.name, l.panels.length + " panels", state.layout === l.id, function () {
        state.layout = l.id;
        state.panels = VC.defaultPanels(l.id);
        state.selected = 0;
        buildChips();
        buildPanelList();
        scheduleRender();
      });
    });
    var gc = document.getElementById("gradeChips");
    gc.innerHTML = "";
    VC.GRADES.forEach(function (g) {
      chip(gc, g.name, "", state.grade === g.id, function () {
        state.grade = g.id;
        buildChips();
        scheduleRender();
      });
    });
    var cc = document.getElementById("captionChips");
    cc.innerHTML = "";
    VC.CAPTIONS.forEach(function (c) {
      chip(cc, c.name, c.title, state.caption === c.id, function () {
        VC.applyCaptionPreset(state, c.id);
        syncCaptionInputs();
        buildChips();
        scheduleRender();
      });
    });
    var sc = document.getElementById("sizeRow");
    sc.innerHTML = "";
    VC.SIZES.forEach(function (s) {
      chip(sc, s.name, "", state.size === s.id, function () {
        state.size = s.id;
        buildChips();
        scheduleRender();
      });
    });
  }

  function syncCaptionInputs() {
    document.getElementById("titleInput").value = state.title;
    document.getElementById("scriptInput").value = state.script;
    document.getElementById("taglineInput").value = state.tagline;
    document.getElementById("quoteInput").value = state.quote;
    document.getElementById("locationInput").value = state.location;
  }

  function bindCaptionInputs() {
    var map = [
      ["titleInput", "title"], ["scriptInput", "script"], ["taglineInput", "tagline"],
      ["quoteInput", "quote"], ["locationInput", "location"],
    ];
    map.forEach(function (pair) {
      document.getElementById(pair[0]).addEventListener("input", function (e) {
        state[pair[1]] = e.target.value;
        scheduleRender();
      });
    });
  }

  function buildPhotoStrip() {
    var strip = document.getElementById("photoStrip");
    strip.innerHTML = "";
    state.photos.forEach(function (p, i) {
      var img = document.createElement("img");
      img.src = p.src;
      img.alt = p.name;
      img.title = p.name + " — click to put it in the selected panel";
      img.addEventListener("click", function () {
        state.panels[state.selected].photo = i;
        buildPhotoStrip();
        buildPanelList();
        scheduleRender();
      });
      strip.appendChild(img);
    });
  }

  function buildPanelList() {
    var list = document.getElementById("panelList");
    list.innerHTML = "";
    document.getElementById("panelCount").textContent = "· " + state.panels.length + " panels";
    state.panels.forEach(function (pd, i) {
      var row = document.createElement("div");
      row.className = "panel-row" + (state.selected === i ? " active" : "");
      var head = document.createElement("div");
      head.className = "panel-head";
      var t = document.createElement("span");
      t.textContent = "PANEL " + (i + 1);
      var r = document.createElement("span");
      r.textContent = pd.role || "";
      head.appendChild(t);
      head.appendChild(r);
      row.appendChild(head);

      var grid = document.createElement("div");
      grid.className = "row-grid";
      // Photo picker.
      var lp = document.createElement("label");
      lp.className = "field";
      lp.textContent = "Photo";
      var sel = document.createElement("select");
      state.photos.forEach(function (p, pi) {
        var o = document.createElement("option");
        o.value = String(pi);
        o.textContent = (pi + 1) + " · " + p.name;
        sel.appendChild(o);
      });
      sel.value = String(pd.photo || 0);
      sel.addEventListener("change", function () {
        pd.photo = Number(sel.value);
        scheduleRender();
      });
      lp.appendChild(sel);
      grid.appendChild(lp);
      // Role.
      var lr = document.createElement("label");
      lr.className = "field";
      lr.textContent = "Role label";
      var ri = document.createElement("input");
      ri.type = "text";
      ri.maxLength = 20;
      ri.value = pd.role || "";
      ri.addEventListener("input", function () {
        pd.role = ri.value.toUpperCase();
        r.textContent = pd.role;
        scheduleRender();
      });
      lr.appendChild(ri);
      grid.appendChild(lr);
      // Sub-line.
      var ls = document.createElement("label");
      ls.className = "field";
      ls.textContent = "Sub-line";
      var si = document.createElement("input");
      si.type = "text";
      si.maxLength = 48;
      si.value = pd.sub || "";
      si.addEventListener("input", function () {
        pd.sub = si.value.toUpperCase();
        scheduleRender();
      });
      ls.appendChild(si);
      grid.appendChild(ls);
      // Zoom.
      var lz = document.createElement("label");
      lz.className = "field";
      lz.textContent = "Zoom " + (pd.zoom || 1).toFixed(2) + "×";
      var zi = document.createElement("input");
      zi.type = "range";
      zi.min = "1";
      zi.max = "2.5";
      zi.step = "0.05";
      zi.value = String(pd.zoom || 1);
      zi.addEventListener("input", function () {
        pd.zoom = Number(zi.value);
        lz.firstChild.textContent = "Zoom " + pd.zoom.toFixed(2) + "×";
        scheduleRender();
      });
      lz.appendChild(zi);
      grid.appendChild(lz);
      row.appendChild(grid);
      row.addEventListener("click", function (e) {
        if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
        state.selected = i;
        buildPanelList();
        scheduleRender();
      });
      list.appendChild(row);
    });
  }

  // ---- drag to pan the photo inside its panel ----
  function panelAt(clientX, clientY) {
    var rect = preview.getBoundingClientRect();
    var W = preview.width, H = preview.height;
    var x = (clientX - rect.left) * (W / rect.width);
    var y = (clientY - rect.top) * (H / rect.height);
    var zone = { x: W * 0.012, y: H * 0.055, w: W * 0.976, h: H * 0.745 };
    if (x < zone.x || x > zone.x + zone.w || y < zone.y || y > zone.y + zone.h) return null;
    var layout = VC.LAYOUTS.find(function (l) { return l.id === state.layout; }) || VC.LAYOUTS[0];
    for (var i = layout.panels.length - 1; i >= 0; i--) {
      var p = layout.panels[i];
      var px = zone.x + p[0] * zone.w, py = zone.y + p[1] * zone.h;
      var pw = p[2] * zone.w, ph = p[3] * zone.h;
      if (x >= px && x <= px + pw && y >= py && y <= py + ph) {
        return { index: i, x: px, y: py, w: pw, h: ph };
      }
    }
    return null;
  }

  var drag = null;
  preview.addEventListener("pointerdown", function (e) {
    var hit = panelAt(e.clientX, e.clientY);
    if (!hit) return;
    state.selected = hit.index;
    buildPanelList();
    drag = { panel: state.panels[hit.index], startX: e.clientX, startY: e.clientY, px: state.panels[hit.index].px || 0, py: state.panels[hit.index].py || 0, w: hit.w, h: hit.h };
    preview.setPointerCapture(e.pointerId);
  });
  preview.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var rect = preview.getBoundingClientRect();
    var scaleX = preview.width / rect.width, scaleY = preview.height / rect.height;
    var dx = (e.clientX - drag.startX) * scaleX;
    var dy = (e.clientY - drag.startY) * scaleY;
    drag.panel.px = Math.max(-1.6, Math.min(1.6, drag.px + dx / (drag.w * 0.25)));
    drag.panel.py = Math.max(-1.6, Math.min(1.6, drag.py + dy / (drag.h * 0.25)));
    scheduleRender();
  });
  function endDrag() { drag = null; }
  preview.addEventListener("pointerup", endDrag);
  preview.addEventListener("pointercancel", endDrag);

  // ---- upload ----
  document.getElementById("uploadInput").addEventListener("change", function (e) {
    var files = Array.prototype.slice.call(e.target.files || []);
    if (!files.length) return;
    var pending = files.length;
    files.forEach(function (f) {
      var rd = new FileReader();
      rd.onload = function () {
        state.photos.push({ src: String(rd.result), name: f.name.replace(/\.[^.]+$/, "").slice(0, 24) || "Upload" });
        if (--pending === 0) {
          state.panels[state.selected].photo = state.photos.length - 1;
          buildPhotoStrip();
          buildPanelList();
          scheduleRender();
        }
      };
      rd.readAsDataURL(f);
    });
    e.target.value = "";
  });

  // ---- shuffle ----
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  document.getElementById("shuffleBtn").addEventListener("click", function () {
    state.layout = pick(VC.LAYOUTS).id;
    state.grade = pick(VC.GRADES).id;
    VC.applyCaptionPreset(state, pick(VC.CAPTIONS).id);
    state.panels = VC.defaultPanels(state.layout);
    state.panels.forEach(function (pd) {
      pd.photo = Math.floor(Math.random() * state.photos.length);
      pd.zoom = 1.05 + Math.random() * 0.5;
      pd.px = (Math.random() - 0.5) * 0.6;
      pd.py = (Math.random() - 0.5) * 0.6;
    });
    state.selected = 0;
    syncCaptionInputs();
    buildChips();
    buildPanelList();
    scheduleRender();
  });

  // ---- export ----
  document.getElementById("exportBtn").addEventListener("click", function () {
    var size = sizeObj();
    var off = document.createElement("canvas");
    var btn = document.getElementById("exportBtn");
    btn.textContent = "Rendering…";
    btn.disabled = true;
    VC.renderCover(off, state, size).then(function () {
      off.toBlob(function (blob) {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "vice-cover-" + size.id + "-" + size.w + "x" + size.h + ".png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
        btn.textContent = "⬇ Export PNG";
        btn.disabled = false;
      }, "image/png");
    }).catch(function (err) {
      console.error(err);
      btn.textContent = "⬇ Export PNG";
      btn.disabled = false;
    });
  });

  buildChips();
  bindCaptionInputs();
  buildPhotoStrip();
  buildPanelList();
  scheduleRender();

  // Test hook for screenshot automation (not part of the UI).
  window.ViceApp = {
    state: state,
    render: scheduleRender,
    setLayout: function (id) { state.layout = id; state.panels = VC.defaultPanels(id); state.selected = 0; buildChips(); buildPanelList(); scheduleRender(); },
    setGrade: function (id) { state.grade = id; buildChips(); scheduleRender(); },
    setCaption: function (id) { VC.applyCaptionPreset(state, id); syncCaptionInputs(); buildChips(); scheduleRender(); },
    setSize: function (id) { state.size = id; buildChips(); scheduleRender(); },
  };
})();
