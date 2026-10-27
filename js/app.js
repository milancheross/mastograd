(function () {
const { FILTER_PRESETS, SUBSTYLE_VARIATIONS, extractStyleReferenceSignature, renderCartoonPipeline } = window.MastogradEngine;
const { SAMPLE_SCENES, STYLE_REF_PRESETS, renderSampleSceneToCanvas, renderStyleReferencePresetToCanvas } = window.MastogradSamples;
const { compileFilterPromptPayload } = window.MastogradFilterConfig;

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

    this.styleRefPresetIndex = 0;

    this.state = {
      activePreset: 'painterly-comic',
      mvpOnlyView: false,
      params: { ...FILTER_PRESETS['painterly-comic'].params },
      adjustments: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        warmth: 0,
        fade: 0,
        vignette: 0
      },
      styleRef: {
        enabled: true,
        name: 'Bearman Finale (Painterly Concept Ref)',
        strength: 75,
        signature: null
      },
      protectBearLogo: true,
      bearLogoMask: { x: 380, y: 455, radius: 56 },
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
    this.draggingLogoMask = false;
    this.isDraggingSplit = false;

    this.initUI();
    this.loadBuiltInStyleReference(0);
    this.loadSampleScene('bearman_hero');
  }

  initUI() {
    this.buildSampleChips();
    this.buildFilterCards();
    this.bindTabNavigation();
    this.bindModeAndShieldControls();
    this.bindStyleReferenceControls();
    this.bindFilterSliders();
    this.bindAdjustSliders();
    this.bindPromptActions();
    this.bindTopBarActions();
    this.bindSplitComparison();
    this.bindStickersAndShieldInteraction();
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
      if (this.state.mvpOnlyView && preset.id !== 'original' && !preset.mvpFeatured) {
        return;
      }

      const card = document.createElement('button');
      card.type = 'button';
      card.className = `filter-card ${preset.id === this.state.activePreset ? 'active' : ''}`;
      card.dataset.presetId = preset.id;

      card.innerHTML = `
        <div class="filter-preview-box">
          <canvas class="filter-preview-canvas" width="128" height="96" data-preview-id="${preset.id}"></canvas>
          <span class="filter-tag">${preset.badge}</span>
        </div>
        <div class="filter-card-title">${preset.code !== '00' ? preset.code + ' — ' : ''}${preset.name}</div>
        <div class="filter-card-desc">${preset.desc}</div>
      `;

      card.addEventListener('click', () => {
        this.selectFilterPreset(preset.id);
      });

      grid.appendChild(card);
    });

    this.renderSubstylePills(this.state.activePreset);
  }

  bindModeAndShieldControls() {
    const creativeBtn = document.getElementById('modeCreativeBtn');
    const productBtn = document.getElementById('modeProductSafeBtn');
    const shieldToggle = document.getElementById('toggleBearLogoShield');
    const allBtn = document.getElementById('filterViewAllBtn');
    const mvpBtn = document.getElementById('filterViewMvpBtn');

    const updateModeUI = (mode) => {
      this.state.params.illustrationMode = mode;
      creativeBtn.classList.toggle('active', mode === 'creative');
      productBtn.classList.toggle('active', mode === 'product-safe');

      if (mode === 'product-safe') {
        this.state.protectBearLogo = true;
        shieldToggle.classList.add('active');
      }
      this.updateCompiledPromptBox();
      this.requestRender();
    };

    creativeBtn.addEventListener('click', () => updateModeUI('creative'));
    productBtn.addEventListener('click', () => updateModeUI('product-safe'));

    shieldToggle.classList.toggle('active', this.state.protectBearLogo);
    shieldToggle.addEventListener('click', () => {
      this.state.protectBearLogo = !this.state.protectBearLogo;
      shieldToggle.classList.toggle('active', this.state.protectBearLogo);
      this.updateCompiledPromptBox();
      this.requestRender();
    });

    allBtn.addEventListener('click', () => {
      this.state.mvpOnlyView = false;
      allBtn.classList.add('active');
      mvpBtn.classList.remove('active');
      this.buildFilterCards();
      this.updateFilterCardThumbnails();
    });

    mvpBtn.addEventListener('click', () => {
      this.state.mvpOnlyView = true;
      mvpBtn.classList.add('active');
      allBtn.classList.remove('active');
      this.buildFilterCards();
      this.updateFilterCardThumbnails();
    });
  }

  bindStyleReferenceControls() {
    const toggleBtn = document.getElementById('toggleStyleRefBtn');
    const uploadBtn = document.getElementById('uploadStyleRefBtn');
    const fileInput = document.getElementById('styleRefUploadInput');
    const cycleBtn = document.getElementById('cycleStyleRefPresetBtn');
    const strengthSlider = document.getElementById('sliderStyleRefStrength');
    const strengthVal = document.getElementById('sliderStyleRefStrengthVal');

    toggleBtn?.addEventListener('click', () => {
      this.state.styleRef.enabled = !this.state.styleRef.enabled;
      toggleBtn.classList.toggle('active', this.state.styleRef.enabled);
      this.updateStyleRefBadgeText();
      this.updateCompiledPromptBox();
      this.requestRender();
    });

    uploadBtn?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const thumbCanvas = document.getElementById('styleRefThumbCanvas');
          const ctx = thumbCanvas.getContext('2d');
          ctx.clearRect(0, 0, thumbCanvas.width, thumbCanvas.height);
          ctx.drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height);
          const imgData = ctx.getImageData(0, 0, thumbCanvas.width, thumbCanvas.height);
          this.state.styleRef.enabled = true;
          this.state.styleRef.name = file.name.replace(/\.[^.]+$/, '');
          this.state.styleRef.signature = extractStyleReferenceSignature(imgData);
          toggleBtn?.classList.add('active');
          this.updateStyleRefBadgeText();
          this.updateCompiledPromptBox();
          this.requestRender();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    cycleBtn?.addEventListener('click', () => {
      this.styleRefPresetIndex = (this.styleRefPresetIndex + 1) % STYLE_REF_PRESETS.length;
      this.loadBuiltInStyleReference(this.styleRefPresetIndex);
      this.requestRender();
    });

    strengthSlider?.addEventListener('input', () => {
      const v = parseInt(strengthSlider.value, 10);
      this.state.styleRef.strength = v;
      if (strengthVal) strengthVal.textContent = `${v}%`;
      this.updateCompiledPromptBox();
      this.requestRender();
    });
  }

  loadBuiltInStyleReference(index) {
    const preset = STYLE_REF_PRESETS[index] || STYLE_REF_PRESETS[0];
    const thumbCanvas = document.getElementById('styleRefThumbCanvas');
    if (!thumbCanvas) return;
    const srcCanvas = renderStyleReferencePresetToCanvas(preset.id, thumbCanvas.width, thumbCanvas.height);
    const ctx = thumbCanvas.getContext('2d');
    ctx.drawImage(srcCanvas, 0, 0);
    const imgData = ctx.getImageData(0, 0, thumbCanvas.width, thumbCanvas.height);
    this.state.styleRef.name = preset.name;
    this.state.styleRef.signature = extractStyleReferenceSignature(imgData);
    this.updateStyleRefBadgeText();
    this.updateCompiledPromptBox();
  }

  updateStyleRefBadgeText() {
    const badge = document.getElementById('styleRefSignatureText');
    if (!badge) return;
    if (!this.state.styleRef.enabled) {
      badge.textContent = 'Style Reference: Isključeno (koristi se samo tekstualni opis stila)';
      return;
    }
    const sig = this.state.styleRef.signature;
    if (sig) {
      badge.textContent = `${this.state.styleRef.name} • ${sig.contrastProfile} • Tuš: ${sig.edgeDensity}%`;
    }
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
        this.updateCompiledPromptBox();
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

    const isProd = this.state.params.illustrationMode === 'product-safe';
    document.getElementById('modeCreativeBtn')?.classList.toggle('active', !isProd);
    document.getElementById('modeProductSafeBtn')?.classList.toggle('active', isProd);
    if (isProd) {
      this.state.protectBearLogo = true;
      document.getElementById('toggleBearLogoShield')?.classList.add('active');
    }

    this.renderSubstylePills(presetId);
    this.syncSlidersFromState();
    this.updateCompiledPromptBox();
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
      { id: 'sliderMasterIntensity', key: 'intensity', suffix: '%', isFloat: false },
      { id: 'sliderLineCleanliness', key: 'lineCleanliness', suffix: '%', isFloat: false },
      { id: 'sliderLineThickness', key: 'lineThickness', suffix: 'px', isFloat: true },
      { id: 'sliderLineThreshold', key: 'lineThreshold', suffix: '%', isFloat: false },
      { id: 'sliderLineStrength', key: 'lineStrength', suffix: '%', isFloat: false },
      { id: 'sliderCrosshatch', key: 'crosshatchIntensity', suffix: '%', isFloat: false },
      { id: 'sliderPainterlyBrush', key: 'painterlyBrush', suffix: '%', isFloat: false },
      { id: 'sliderRimLightBoost', key: 'rimLightBoost', suffix: '%', isFloat: false },
      { id: 'sliderSurfaceFlatness', key: 'surfaceFlatness', suffix: 'x', isFloat: false },
      { id: 'sliderCelLevels', key: 'celLevels', suffix: ' tonova', isFloat: false },
      { id: 'sliderColorPunch', key: 'colorPunch', suffix: '%', isFloat: false },
      { id: 'sliderHalftoneIntensity', key: 'halftoneIntensity', suffix: '%', isFloat: false },
      { id: 'sliderShadowInkPool', key: 'shadowInkPool', suffix: '%', isFloat: false }
    ];

    paramSliders.forEach(({ id, key, suffix, isFloat }) => {
      const input = document.getElementById(id);
      const valSpan = document.getElementById(`${id}Val`);
      if (!input) return;

      input.addEventListener('input', () => {
        const val = isFloat ? parseFloat(input.value) : parseInt(input.value, 10);
        this.state.params[key] = val;
        if (valSpan) valSpan.textContent = `${val}${suffix}`;
        this.updateCompiledPromptBox();
        this.requestRender();
      });

      input.addEventListener('change', () => {
        this.pushHistory();
      });
    });

    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.state.params.inkColor = swatch.dataset.color;
        this.pushHistory();
        this.requestRender();
      });
    });

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
      { id: 'adjWarmth', key: 'warmth' }
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

  bindPromptActions() {
    const copyPromptBtn = document.getElementById('copyFullPromptBtn');
    const copyJsonBtn = document.getElementById('copyConfigJsonBtn');

    const getPayload = () => compileFilterPromptPayload(this.state.activePreset, {
      intensity: this.state.params.intensity,
      illustrationMode: this.state.params.illustrationMode,
      protectBearLogo: this.state.protectBearLogo,
      styleRefActive: this.state.styleRef.enabled,
      styleRefName: this.state.styleRef.name,
      styleRefStrength: this.state.styleRef.strength,
      styleRefSignature: this.state.styleRef.signature
    });

    copyPromptBtn?.addEventListener('click', () => {
      const payload = getPayload();
      navigator.clipboard?.writeText(payload.compiledFullPrompt);
      copyPromptBtn.textContent = '✓ AI Prompt Kopiran!';
      setTimeout(() => { copyPromptBtn.textContent = '📋 Kopiraj AI Prompt'; }, 1800);
    });

    copyJsonBtn?.addEventListener('click', () => {
      const payload = getPayload();
      navigator.clipboard?.writeText(JSON.stringify(payload.apiConfigJson, null, 2));
      copyJsonBtn.textContent = '✓ JSON Kopiran!';
      setTimeout(() => { copyJsonBtn.textContent = '{ } Kopiraj JSON Konfig'; }, 1800);
    });
  }

  updateCompiledPromptBox() {
    const box = document.getElementById('compiledPromptPreview');
    if (!box) return;
    const payload = compileFilterPromptPayload(this.state.activePreset, {
      intensity: this.state.params.intensity,
      illustrationMode: this.state.params.illustrationMode,
      protectBearLogo: this.state.protectBearLogo,
      styleRefActive: this.state.styleRef.enabled,
      styleRefName: this.state.styleRef.name,
      styleRefStrength: this.state.styleRef.strength,
      styleRefSignature: this.state.styleRef.signature
    });
    box.textContent = payload.compiledFullPrompt;
  }

  syncSlidersFromState() {
    const p = this.state.params;
    const setSlider = (id, val, suffix) => {
      const el = document.getElementById(id);
      const span = document.getElementById(`${id}Val`);
      if (el && val !== undefined) el.value = val;
      if (span && val !== undefined) span.textContent = `${val}${suffix}`;
    };

    setSlider('sliderMasterIntensity', p.intensity ?? 80, '%');
    setSlider('sliderLineCleanliness', p.lineCleanliness, '%');
    setSlider('sliderLineThickness', p.lineThickness, 'px');
    setSlider('sliderLineThreshold', p.lineThreshold, '%');
    setSlider('sliderLineStrength', p.lineStrength, '%');
    setSlider('sliderCrosshatch', p.crosshatchIntensity ?? 0, '%');
    setSlider('sliderPainterlyBrush', p.painterlyBrush ?? 0, '%');
    setSlider('sliderRimLightBoost', p.rimLightBoost ?? 0, '%');
    setSlider('sliderSurfaceFlatness', p.surfaceFlatness, 'x');
    setSlider('sliderCelLevels', p.celLevels, ' tonova');
    setSlider('sliderColorPunch', p.colorPunch, '%');
    setSlider('sliderHalftoneIntensity', p.halftoneIntensity, '%');
    setSlider('sliderShadowInkPool', p.shadowInkPool, '%');

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
  }

  bindTopBarActions() {
    const fileInput = document.getElementById('photoUploadInput');
    const uploadBtn = document.getElementById('uploadPhotoBtn');

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) this.loadUserFile(file);
    });

    const stage = document.getElementById('canvasStage');
    stage.addEventListener('dragover', (e) => e.preventDefault());
    stage.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) {
        this.loadUserFile(file);
      }
    });

    document.getElementById('undoBtn').addEventListener('click', () => this.undo());
    document.getElementById('redoBtn').addEventListener('click', () => this.redo());

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

  bindStickersAndShieldInteraction() {
    document.querySelectorAll('.sticker-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.addSticker(btn.dataset.sticker);
      });
    });

    document.getElementById('clearStickersBtn')?.addEventListener('click', () => {
      this.state.stickers = [];
      this.renderStickersOverlay();
    });

    this.overlayCanvas.addEventListener('pointerdown', (e) => {
      const pt = this.getCanvasCoords(e);

      // Check stickers first
      for (let i = this.state.stickers.length - 1; i >= 0; i--) {
        const s = this.state.stickers[i];
        if (Math.hypot(pt.x - s.x, pt.y - s.y) < s.radius) {
          this.draggingSticker = s;
          this.overlayCanvas.setPointerCapture(e.pointerId);
          return;
        }
      }

      // Check BEAR 5-toe logo shield mask
      if (this.state.protectBearLogo && this.state.bearLogoMask) {
        const m = this.state.bearLogoMask;
        if (Math.hypot(pt.x - m.x, pt.y - m.y) <= m.radius + 12) {
          this.draggingLogoMask = true;
          this.overlayCanvas.setPointerCapture(e.pointerId);
        }
      }
    });

    this.overlayCanvas.addEventListener('pointermove', (e) => {
      const pt = this.getCanvasCoords(e);
      if (this.draggingSticker) {
        this.draggingSticker.x = pt.x;
        this.draggingSticker.y = pt.y;
        this.renderStickersOverlay();
      } else if (this.draggingLogoMask) {
        this.state.bearLogoMask.x = Math.round(pt.x);
        this.state.bearLogoMask.y = Math.round(pt.y);
        this.renderStickersOverlay();
      }
    });

    this.overlayCanvas.addEventListener('pointerup', () => {
      if (this.draggingLogoMask) {
        this.draggingLogoMask = false;
        this.requestRender();
      }
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

  renderStickersOverlay(targetCtx = this.overlayCtx, clearFirst = true, isExport = false) {
    const w = this.overlayCanvas.width;
    const h = this.overlayCanvas.height;
    if (clearFirst) {
      targetCtx.clearRect(0, 0, w, h);
    }

    // Draw interactive dashed indicator for the 5-toe BEAR logo shield (only on studio UI, not in exported image!)
    if (!isExport && this.state.protectBearLogo && this.state.bearLogoMask) {
      const m = this.state.bearLogoMask;
      targetCtx.save();
      targetCtx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
      targetCtx.lineWidth = 2;
      targetCtx.setLineDash([6, 4]);
      targetCtx.beginPath();
      targetCtx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      targetCtx.stroke();

      targetCtx.setLineDash([]);
      targetCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      targetCtx.fillRect(m.x - 54, m.y - m.radius - 22, 108, 18);
      targetCtx.fillStyle = '#fde68a';
      targetCtx.font = '700 10px Inter, sans-serif';
      targetCtx.textAlign = 'center';
      targetCtx.fillText('🐾 BEAR ŠTIT (5 PRSTIJU)', m.x, m.y - m.radius - 10);
      targetCtx.restore();
    }

    for (const s of this.state.stickers) {
      targetCtx.save();
      targetCtx.translate(s.x, s.y);

      if (s.type === 'pow' || s.type === 'bam') {
        const spikes = 12;
        targetCtx.fillStyle = s.type === 'pow' ? '#facc15' : '#ef4444';
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
        targetCtx.fillStyle = '#ffffff';
        targetCtx.strokeStyle = '#090a0f';
        targetCtx.lineWidth = 4;
        targetCtx.beginPath();
        targetCtx.ellipse(0, 0, 78, 44, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();

        targetCtx.fillStyle = '#090a0f';
        targetCtx.font = '800 15px Inter, sans-serif';
        targetCtx.textAlign = 'center';
        targetCtx.textBaseline = 'middle';
        targetCtx.fillText('BEARMAN PRO!', 0, 0);
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
      this.renderStickersOverlay(ctx, false, true);

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
    const sceneMeta = SAMPLE_SCENES.find(s => s.id === sceneId);
    if (sceneMeta && sceneMeta.defaultLogoPos) {
      this.state.bearLogoMask = { ...sceneMeta.defaultLogoPos };
    }
    const sampleCanvas = renderSampleSceneToCanvas(sceneId, 760, 560);
    this.setSourceImage(sampleCanvas);
  }

  loadUserFile(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
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
        this.state.bearLogoMask = { x: Math.round(w * 0.5), y: Math.round(h * 0.75), radius: 56 };
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
    this.updateCompiledPromptBox();
    this.history = [];
    this.historyIndex = -1;
    this.pushHistory();
    this.requestRender();
    this.updateFilterCardThumbnails();
  }

  updateFilterCardThumbnails() {
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
      }, []);
      previewCanvas.getContext('2d').putImageData(result.imageData, 0, 0);
    });
  }

  pushHistory() {
    const snapshot = JSON.stringify({
      activePreset: this.state.activePreset,
      params: this.state.params,
      adjustments: this.state.adjustments,
      protectBearLogo: this.state.protectBearLogo
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
    this.state.protectBearLogo = data.protectBearLogo;

    document.querySelectorAll('.filter-card').forEach(c => {
      c.classList.toggle('active', c.dataset.presetId === this.state.activePreset);
    });

    this.syncSlidersFromState();
    this.updateCompiledPromptBox();
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
        const activeMasks = (this.state.protectBearLogo && this.state.bearLogoMask)
          ? [this.state.bearLogoMask]
          : [];
        const { imageData, metrics } = renderCartoonPipeline(
          srcData,
          this.state.params,
          this.state.adjustments,
          activeMasks,
          this.state.styleRef
        );
        this.outputCtx.putImageData(imageData, 0, 0);
        this.renderStickersOverlay();

        const scoreBadge = document.getElementById('qualityScoreBadge');
        const edgeText = document.getElementById('edgeClarityText');
        if (scoreBadge) scoreBadge.textContent = metrics.overallScore;
        if (edgeText) {
          const modeLabel = this.state.params.illustrationMode === 'product-safe' ? 'Product-Safe (BEAR)' : 'Creative';
          edgeText.textContent = `Linije: ${metrics.edgeClarity} • Režim: ${modeLabel}`;
        }

        this.renderQueued = false;
        if (pill) pill.classList.remove('active');
      }, 10);
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.mastogradStudio = new MastogradPicsArtStudio();
});
})();
