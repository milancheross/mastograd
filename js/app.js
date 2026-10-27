const { FILTER_PRESETS, SUBSTYLE_VARIATIONS, renderCartoonPipeline } = window.MastogradEngine;
const { SAMPLE_SCENES, renderSampleSceneToCanvas } = window.MastogradSamples;

class MastogradPicsArtStudio {
  constructor() {
    this.sourceCanvas = document.createElement('canvas');
    this.sourceCtx = this.sourceCanvas.getContext('2d');

    this.outputCanvas = document.getElementById('outputCanvas');
    this.outputCtx = this.outputCanvas.getContext('2d');

    this.originalCanvas = document.getElementById('originalCanvas');
    this.originalCtx = this.originalCanvas.getContext('2d');

    this.overlayCanvas = document.getElementById('overlayCanvas');
    this.overlayCtx = this.overlayCanvas.getContext('2d');

    this.state = {
      activePreset: 'comicbook',
      params: { ...FILTER_PRESETS.comicbook.params },
      adjustments: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        warmth: 0,
        fade: 0,
        vignette: 0
      },
      stickers: [],
      splitMode: false,
      splitPercent: 50,
      zoom: 1.0,
      exportFormat: 'image/png'
    };

    this.history = [];
    this.historyIndex = -1;
    this.renderQueued = false;
    this.draggingSticker = null;
    this.isDraggingSplit = false;

    this.initUI();
    this.loadSampleScene('hero_portrait');
  }

  initUI() {
    this.buildSampleChips();
    this.buildFilterCards();
    this.bindTabNavigation();
    this.bindFilterSliders();
    this.bindAdjustSliders();
    this.bindTopBarActions();
    this.bindSplitComparison();
    this.bindStickersInteraction();
    this.bindExportDialog();
  }

  buildSampleChips() {
    const container = document.getElementById('sampleChipGroup');
    container.innerHTML = '';
    SAMPLE_SCENES.forEach((scene, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `sample-chip ${idx === 0 ? 'active' : ''}`;
      btn.textContent = scene.label;
      btn.addEventListener('click', () => {
        container.querySelectorAll('.sample-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadSampleScene(scene.id);
      });
      container.appendChild(btn);
    });
  }

  buildFilterCards() {
    const grid = document.getElementById('filterCardsGrid');
    grid.innerHTML = '';

    Object.values(FILTER_PRESETS).forEach(preset => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `filter-card ${preset.id === this.state.activePreset ? 'active' : ''}`;
      card.dataset.presetId = preset.id;

      card.innerHTML = `
        <div class="filter-preview-box">
          <canvas class="filter-preview-canvas" width="128" height="96" data-preview-id="${preset.id}"></canvas>
          <span class="filter-tag">${preset.badge}</span>
        </div>
        <div class="filter-card-title">${preset.name}</div>
        <div class="filter-card-desc">${preset.desc}</div>
      `;

      card.addEventListener('click', () => {
        this.selectFilterPreset(preset.id);
      });

      grid.appendChild(card);
    });

    this.renderSubstylePills(this.state.activePreset);
  }

  renderSubstylePills(presetId) {
    const strip = document.getElementById('substyleStrip');
    const variations = SUBSTYLE_VARIATIONS[presetId];
    if (!variations || variations.length === 0) {
      strip.innerHTML = '';
      strip.style.display = 'none';
      return;
    }

    strip.style.display = 'flex';
    strip.innerHTML = '';
    variations.forEach((v, idx) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `substyle-pill ${idx === 0 ? 'active' : ''}`;
      pill.textContent = v.name;
      pill.addEventListener('click', () => {
        strip.querySelectorAll('.substyle-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        Object.assign(this.state.params, FILTER_PRESETS[presetId].params, v.overrides);
        this.syncSlidersFromState();
        this.pushHistory();
        this.requestRender();
      });
      strip.appendChild(pill);
    });
  }

  selectFilterPreset(presetId) {
    const preset = FILTER_PRESETS[presetId];
    if (!preset) return;

    this.state.activePreset = presetId;
    this.state.params = { ...preset.params };

    document.querySelectorAll('.filter-card').forEach(c => {
      c.classList.toggle('active', c.dataset.presetId === presetId);
    });

    this.renderSubstylePills(presetId);
    this.syncSlidersFromState();
    this.pushHistory();
    this.requestRender();
  }

  bindTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const panels = document.querySelectorAll('.tool-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.panel;
        tabs.forEach(t => t.classList.toggle('active', t === tab));
        panels.forEach(p => p.classList.toggle('active', p.id === target));
      });
    });
  }

  bindFilterSliders() {
    const paramSliders = [
      { id: 'sliderLineCleanliness', key: 'lineCleanliness', suffix: '%', isFloat: false },
      { id: 'sliderLineThickness', key: 'lineThickness', suffix: 'px', isFloat: true },
      { id: 'sliderLineThreshold', key: 'lineThreshold', suffix: '%', isFloat: false },
      { id: 'sliderLineStrength', key: 'lineStrength', suffix: '%', isFloat: false },
      { id: 'sliderSurfaceFlatness', key: 'surfaceFlatness', suffix: 'x', isFloat: false },
      { id: 'sliderCelLevels', key: 'celLevels', suffix: ' tonova', isFloat: false },
      { id: 'sliderColorPunch', key: 'colorPunch', suffix: '%', isFloat: false },
      { id: 'sliderHalftoneIntensity', key: 'halftoneIntensity', suffix: '%', isFloat: false },
      { id: 'sliderHalftoneSize', key: 'halftoneSize', suffix: 'px', isFloat: false },
      { id: 'sliderShadowInkPool', key: 'shadowInkPool', suffix: '%', isFloat: false },
      { id: 'sliderTechnicolorWarmth', key: 'technicolorWarmth', suffix: '%', isFloat: false }
    ];

    paramSliders.forEach(({ id, key, suffix, isFloat }) => {
      const input = document.getElementById(id);
      const valSpan = document.getElementById(`${id}Val`);
      if (!input) return;

      input.addEventListener('input', () => {
        const val = isFloat ? parseFloat(input.value) : parseInt(input.value, 10);
        this.state.params[key] = val;
        if (valSpan) valSpan.textContent = `${val}${suffix}`;
        this.requestRender();
      });

      input.addEventListener('change', () => {
        this.pushHistory();
      });
    });

    // Ink Color Swatches
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.state.params.inkColor = swatch.dataset.color;
        this.pushHistory();
        this.requestRender();
      });
    });

    // Toggle buttons (Sticker Border & Looney Tunes Rings)
    const toggleSticker = document.getElementById('toggleStickerBorder');
    if (toggleSticker) {
      toggleSticker.addEventListener('click', () => {
        this.state.params.stickerBorder = !this.state.params.stickerBorder;
        toggleSticker.classList.toggle('active', this.state.params.stickerBorder);
        this.pushHistory();
        this.requestRender();
      });
    }

    const toggleLooney = document.getElementById('toggleLooneyRings');
    if (toggleLooney) {
      toggleLooney.addEventListener('click', () => {
        this.state.params.looneyRings = !this.state.params.looneyRings;
        toggleLooney.classList.toggle('active', this.state.params.looneyRings);
        this.pushHistory();
        this.requestRender();
      });
    }
  }

  bindAdjustSliders() {
    const adjSliders = [
      { id: 'adjBrightness', key: 'brightness' },
      { id: 'adjContrast', key: 'contrast' },
      { id: 'adjSaturation', key: 'saturation' },
      { id: 'adjWarmth', key: 'warmth' },
      { id: 'adjFade', key: 'fade' },
      { id: 'adjVignette', key: 'vignette' }
    ];

    adjSliders.forEach(({ id, key }) => {
      const input = document.getElementById(id);
      const valSpan = document.getElementById(`${id}Val`);
      if (!input) return;

      input.addEventListener('input', () => {
        const v = parseInt(input.value, 10);
        this.state.adjustments[key] = v;
        if (valSpan) valSpan.textContent = v > 0 ? `+${v}` : `${v}`;
        this.requestRender();
      });

      input.addEventListener('change', () => {
        this.pushHistory();
      });
    });

    const resetAdjBtn = document.getElementById('resetAdjustBtn');
    if (resetAdjBtn) {
      resetAdjBtn.addEventListener('click', () => {
        this.state.adjustments = { brightness: 0, contrast: 0, saturation: 0, warmth: 0, fade: 0, vignette: 0 };
        this.syncSlidersFromState();
        this.pushHistory();
        this.requestRender();
      });
    }
  }

  syncSlidersFromState() {
    const p = this.state.params;
    const setSlider = (id, val, suffix) => {
      const el = document.getElementById(id);
      const span = document.getElementById(`${id}Val`);
      if (el && val !== undefined) el.value = val;
      if (span && val !== undefined) span.textContent = `${val}${suffix}`;
    };

    setSlider('sliderLineCleanliness', p.lineCleanliness, '%');
    setSlider('sliderLineThickness', p.lineThickness, 'px');
    setSlider('sliderLineThreshold', p.lineThreshold, '%');
    setSlider('sliderLineStrength', p.lineStrength, '%');
    setSlider('sliderSurfaceFlatness', p.surfaceFlatness, 'x');
    setSlider('sliderCelLevels', p.celLevels, ' tonova');
    setSlider('sliderColorPunch', p.colorPunch, '%');
    setSlider('sliderHalftoneIntensity', p.halftoneIntensity, '%');
    setSlider('sliderHalftoneSize', p.halftoneSize, 'px');
    setSlider('sliderShadowInkPool', p.shadowInkPool, '%');
    setSlider('sliderTechnicolorWarmth', p.technicolorWarmth, '%');

    document.querySelectorAll('.color-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.color === p.inkColor);
    });

    const toggleSticker = document.getElementById('toggleStickerBorder');
    if (toggleSticker) toggleSticker.classList.toggle('active', !!p.stickerBorder);

    const toggleLooney = document.getElementById('toggleLooneyRings');
    if (toggleLooney) toggleLooney.classList.toggle('active', !!p.looneyRings);

    const a = this.state.adjustments;
    const setAdj = (id, val) => {
      const el = document.getElementById(id);
      const span = document.getElementById(`${id}Val`);
      if (el) el.value = val;
      if (span) span.textContent = val > 0 ? `+${val}` : `${val}`;
    };
    setAdj('adjBrightness', a.brightness);
    setAdj('adjContrast', a.contrast);
    setAdj('adjSaturation', a.saturation);
    setAdj('adjWarmth', a.warmth);
    setAdj('adjFade', a.fade);
    setAdj('adjVignette', a.vignette);
  }

  bindTopBarActions() {
    // Photo Upload
    const fileInput = document.getElementById('photoUploadInput');
    const uploadBtn = document.getElementById('uploadPhotoBtn');

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) this.loadUserFile(file);
    });

    // Drag & Drop onto canvas stage
    const stage = document.getElementById('canvasStage');
    stage.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    stage.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) {
        this.loadUserFile(file);
      }
    });

    // Undo / Redo
    document.getElementById('undoBtn').addEventListener('click', () => this.undo());
    document.getElementById('redoBtn').addEventListener('click', () => this.redo());

    // Zoom Toggle
    const zoomBtn = document.getElementById('zoomToggleBtn');
    const viewport = document.getElementById('canvasViewport');
    zoomBtn.addEventListener('click', () => {
      this.state.zoom = this.state.zoom === 1.0 ? 1.85 : 1.0;
      viewport.style.transform = `scale(${this.state.zoom})`;
      zoomBtn.classList.toggle('active', this.state.zoom > 1.0);
      zoomBtn.textContent = this.state.zoom > 1.0 ? '185%' : '100%';
    });
  }

  bindSplitComparison() {
    const splitBtn = document.getElementById('compareSplitBtn');
    const splitLine = document.getElementById('splitSliderLine');
    const badgeBefore = document.getElementById('badgeBefore');
    const badgeAfter = document.getElementById('badgeAfter');
    const viewport = document.getElementById('canvasViewport');

    const updateSplitClip = (percent) => {
      this.state.splitPercent = Math.max(2, Math.min(98, percent));
      if (this.state.splitMode) {
        const rightInset = 100 - this.state.splitPercent;
        this.originalCanvas.style.clipPath = `inset(0 ${rightInset}% 0 0)`;
        splitLine.style.left = `${this.state.splitPercent}%`;
      } else {
        this.originalCanvas.style.clipPath = 'inset(0 100% 0 0)';
      }
    };

    splitBtn.addEventListener('click', () => {
      this.state.splitMode = !this.state.splitMode;
      splitBtn.classList.toggle('active', this.state.splitMode);
      splitLine.classList.toggle('visible', this.state.splitMode);
      badgeBefore.classList.toggle('visible', this.state.splitMode);
      badgeAfter.classList.toggle('visible', this.state.splitMode);
      updateSplitClip(this.state.splitPercent);
    });

    const handleMove = (clientX) => {
      if (!this.isDraggingSplit || !this.state.splitMode) return;
      const rect = viewport.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      updateSplitClip(pct);
    };

    splitLine.addEventListener('pointerdown', (e) => {
      this.isDraggingSplit = true;
      splitLine.setPointerCapture(e.pointerId);
    });
    splitLine.addEventListener('pointermove', (e) => handleMove(e.clientX));
    splitLine.addEventListener('pointerup', () => { this.isDraggingSplit = false; });
  }

  bindStickersInteraction() {
    document.querySelectorAll('.sticker-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.sticker;
        this.addSticker(type);
      });
    });

    const clearBtn = document.getElementById('clearStickersBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.state.stickers = [];
        this.renderStickersOverlay();
      });
    }

    // Dragging stickers on overlayCanvas
    this.overlayCanvas.addEventListener('pointerdown', (e) => {
      const pt = this.getCanvasCoords(e);
      for (let i = this.state.stickers.length - 1; i >= 0; i--) {
        const s = this.state.stickers[i];
        if (Math.hypot(pt.x - s.x, pt.y - s.y) < s.radius) {
          this.draggingSticker = s;
          this.overlayCanvas.setPointerCapture(e.pointerId);
          break;
        }
      }
    });

    this.overlayCanvas.addEventListener('pointermove', (e) => {
      if (!this.draggingSticker) return;
      const pt = this.getCanvasCoords(e);
      this.draggingSticker.x = pt.x;
      this.draggingSticker.y = pt.y;
      this.renderStickersOverlay();
    });

    this.overlayCanvas.addEventListener('pointerup', () => {
      this.draggingSticker = null;
    });
  }

  getCanvasCoords(e) {
    const rect = this.overlayCanvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * this.overlayCanvas.width,
      y: ((e.clientY - rect.top) / rect.height) * this.overlayCanvas.height
    };
  }

  addSticker(type) {
    const w = this.overlayCanvas.width;
    const h = this.overlayCanvas.height;
    this.state.stickers.push({
      type,
      x: w * (0.28 + Math.random() * 0.44),
      y: h * (0.22 + Math.random() * 0.35),
      radius: 68
    });
    this.renderStickersOverlay();
  }

  renderStickersOverlay(targetCtx = this.overlayCtx, clearFirst = true) {
    const w = this.overlayCanvas.width;
    const h = this.overlayCanvas.height;
    if (clearFirst) {
      targetCtx.clearRect(0, 0, w, h);
    }

    for (const s of this.state.stickers) {
      targetCtx.save();
      targetCtx.translate(s.x, s.y);

      if (s.type === 'pow' || s.type === 'bam' || s.type === 'wow') {
        // Jagged Comic Action Burst
        const spikes = 12;
        targetCtx.fillStyle = s.type === 'pow' ? '#facc15' : s.type === 'bam' ? '#ef4444' : '#38bdf8';
        targetCtx.strokeStyle = '#090a0f';
        targetCtx.lineWidth = 4;
        targetCtx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? 74 : 44;
          const a = (i * Math.PI) / spikes;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r * 0.78;
          if (i === 0) targetCtx.moveTo(px, py);
          else targetCtx.lineTo(px, py);
        }
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.stroke();

        targetCtx.fillStyle = s.type === 'bam' ? '#ffffff' : '#090a0f';
        targetCtx.font = '900 28px Impact, sans-serif';
        targetCtx.textAlign = 'center';
        targetCtx.textBaseline = 'middle';
        targetCtx.fillText(s.type.toUpperCase() + '!', 0, 2);
      } else if (s.type === 'speech') {
        // Classic Comic Speech Bubble
        targetCtx.fillStyle = '#ffffff';
        targetCtx.strokeStyle = '#090a0f';
        targetCtx.lineWidth = 4;
        targetCtx.beginPath();
        targetCtx.ellipse(0, 0, 78, 44, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();

        // Tail
        targetCtx.beginPath();
        targetCtx.moveTo(-20, 40);
        targetCtx.lineTo(-42, 72);
        targetCtx.lineTo(5, 42);
        targetCtx.fill();
        targetCtx.stroke();

        targetCtx.fillStyle = '#090a0f';
        targetCtx.font = '800 16px Inter, sans-serif';
        targetCtx.textAlign = 'center';
        targetCtx.textBaseline = 'middle';
        targetCtx.fillText('TO JE TO, LJUDI!', 0, 0);
      } else if (s.type === 'thatsall') {
        // Looney Tunes Script Banner
        targetCtx.fillStyle = '#fef08a';
        targetCtx.strokeStyle = '#1e120a';
        targetCtx.lineWidth = 5;
        targetCtx.font = 'italic 900 30px Georgia, serif';
        targetCtx.textAlign = 'center';
        targetCtx.textBaseline = 'middle';
        targetCtx.strokeText("That's all Folks!", 0, 0);
        targetCtx.fillText("That's all Folks!", 0, 0);
      } else if (s.type === 'stars') {
        for (const [ox, oy, sr] of [[-40, -15, 18], [0, -32, 24], [42, -10, 17]]) {
          targetCtx.fillStyle = '#fde047';
          targetCtx.strokeStyle = '#090a0f';
          targetCtx.lineWidth = 3;
          targetCtx.beginPath();
          for (let k = 0; k < 10; k++) {
            const rad = k % 2 === 0 ? sr : sr * 0.45;
            const ang = (k * Math.PI) / 5 - Math.PI / 2;
            const x = ox + Math.cos(ang) * rad;
            const y = oy + Math.sin(ang) * rad;
            if (k === 0) targetCtx.moveTo(x, y);
            else targetCtx.lineTo(x, y);
          }
          targetCtx.closePath();
          targetCtx.fill();
          targetCtx.stroke();
        }
      }

      targetCtx.restore();
    }
  }

  bindExportDialog() {
    const dialog = document.getElementById('exportModal');
    const openBtn = document.getElementById('openExportBtn');
    const closeBtn = document.getElementById('closeExportBtn');
    const downloadBtn = document.getElementById('confirmDownloadBtn');

    openBtn.addEventListener('click', () => dialog.showModal());
    closeBtn.addEventListener('click', () => dialog.close());

    document.querySelectorAll('.format-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.exportFormat = btn.dataset.mime;
      });
    });

    downloadBtn.addEventListener('click', () => {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = this.outputCanvas.width;
      exportCanvas.height = this.outputCanvas.height;
      const ctx = exportCanvas.getContext('2d');
      ctx.drawImage(this.outputCanvas, 0, 0);
      this.renderStickersOverlay(ctx, false);

      const ext = this.state.exportFormat === 'image/jpeg' ? 'jpg' : this.state.exportFormat === 'image/webp' ? 'webp' : 'png';
      const url = exportCanvas.toDataURL(this.state.exportFormat, 0.96);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mastograd-${this.state.activePreset}-10of10.${ext}`;
      a.click();
      dialog.close();
    });
  }

  loadSampleScene(sceneId) {
    const sampleCanvas = renderSampleSceneToCanvas(sceneId, 760, 560);
    this.setSourceImage(sampleCanvas);
  }

  loadUserFile(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        // Fit within 960px max dimension for responsive real-time 10/10 NPR filtering
        const maxDim = 920;
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > maxDim || h > maxDim) {
          const scale = maxDim / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        this.setSourceImage(c);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  setSourceImage(canvasEl) {
    const w = canvasEl.width;
    const h = canvasEl.height;

    this.sourceCanvas.width = w;
    this.sourceCanvas.height = h;
    this.sourceCtx.drawImage(canvasEl, 0, 0);

    this.outputCanvas.width = w;
    this.outputCanvas.height = h;

    this.originalCanvas.width = w;
    this.originalCanvas.height = h;
    this.originalCtx.drawImage(canvasEl, 0, 0);

    this.overlayCanvas.width = w;
    this.overlayCanvas.height = h;

    this.syncSlidersFromState();
    this.history = [];
    this.historyIndex = -1;
    this.pushHistory();
    this.requestRender();
    this.updateFilterCardThumbnails();
  }

  updateFilterCardThumbnails() {
    // Generate real miniature previews for all filter cards from the current image
    const thumbW = 128;
    const thumbH = 96;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = thumbW;
    tempCanvas.height = thumbH;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(this.sourceCanvas, 0, 0, thumbW, thumbH);
    const thumbSrcData = tempCtx.getImageData(0, 0, thumbW, thumbH);

    Object.values(FILTER_PRESETS).forEach(preset => {
      const previewCanvas = document.querySelector(`canvas[data-preview-id="${preset.id}"]`);
      if (!previewCanvas) return;
      const result = renderCartoonPipeline(thumbSrcData, preset.params, {
        brightness: 0, contrast: 0, saturation: 0, warmth: 0, fade: 0, vignette: 0
      });
      previewCanvas.getContext('2d').putImageData(result.imageData, 0, 0);
    });
  }

  pushHistory() {
    const snapshot = JSON.stringify({
      activePreset: this.state.activePreset,
      params: this.state.params,
      adjustments: this.state.adjustments
    });
    if (this.historyIndex >= 0 && this.history[this.historyIndex] === snapshot) return;
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(snapshot);
    this.historyIndex = this.history.length - 1;
    this.updateUndoRedoButtons();
  }

  undo() {
    if (this.historyIndex <= 0) return;
    this.historyIndex--;
    this.restoreSnapshot(this.history[this.historyIndex]);
  }

  redo() {
    if (this.historyIndex >= this.history.length - 1) return;
    this.historyIndex++;
    this.restoreSnapshot(this.history[this.historyIndex]);
  }

  restoreSnapshot(jsonStr) {
    const data = JSON.parse(jsonStr);
    this.state.activePreset = data.activePreset;
    this.state.params = { ...data.params };
    this.state.adjustments = { ...data.adjustments };

    document.querySelectorAll('.filter-card').forEach(c => {
      c.classList.toggle('active', c.dataset.presetId === this.state.activePreset);
    });

    this.syncSlidersFromState();
    this.updateUndoRedoButtons();
    this.requestRender();
  }

  updateUndoRedoButtons() {
    document.getElementById('undoBtn').disabled = this.historyIndex <= 0;
    document.getElementById('redoBtn').disabled = this.historyIndex >= this.history.length - 1;
  }

  requestRender() {
    if (this.renderQueued) return;
    this.renderQueued = true;
    const pill = document.getElementById('processingPill');
    if (pill) pill.classList.add('active');

    requestAnimationFrame(() => {
      setTimeout(() => {
        const srcData = this.sourceCtx.getImageData(0, 0, this.sourceCanvas.width, this.sourceCanvas.height);
        const { imageData, metrics } = renderCartoonPipeline(srcData, this.state.params, this.state.adjustments);
        this.outputCtx.putImageData(imageData, 0, 0);
        this.renderStickersOverlay();

        const scoreBadge = document.getElementById('qualityScoreBadge');
        const edgeText = document.getElementById('edgeClarityText');
        if (scoreBadge) scoreBadge.textContent = metrics.overallScore;
        if (edgeText) edgeText.textContent = `Čistoća linija: ${metrics.edgeClarity} • Površine: ${metrics.regionSmoothness}`;

        this.renderQueued = false;
        if (pill) pill.classList.remove('active');
      }, 10);
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.mastogradStudio = new MastogradPicsArtStudio();
});
