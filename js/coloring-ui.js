/**
 * Mastograd Kreativna Bojanka — Glavni UI Kontroler
 * Omogućava:
 *  - Izbor alata: Kantica, Flomaster, Geometrijski oblici, Gumica
 *  - Veliki izbor boja (Duga, Pastel, Neon, Priroda + Custom Picker)
 *  - Otvorenu biblioteku slika po kategorijama
 *  - Napredno pravljenje bojanke od bilo koje fotografije uz podešavanje zatvaranja linija
 *  - Undo / Redo, Čuvanje, Štampanje
 *  - Responzivnost za Desktop i Mobile touch ekrane
 */
(function () {

const {
  COLORING_CATEGORIES,
  COLORING_TEMPLATES,
  getUserTemplates,
  addUserTemplate,
  removeUserTemplate,
  getAllTemplates
} = window.MastogradColoringLibrary;
const { convertPhotoToColoringPage, scanlineFloodFill, MarkerStroke, drawGeometricShape, eraseAt } = window.MastogradColoringEngine;

const PALETTES = {
  rainbow: [
    '#e11d48', '#f43f5e', '#fb7185', '#ea580c',
    '#f97316', '#f59e0b', '#eab308', '#facc15',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0284c7', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#000000', '#475569', '#94a3b8', '#ffffff'
  ],
  pastel: [
    '#ffe4e6', '#fecdd3', '#fed7aa', '#ffedd5',
    '#fef08a', '#fef9c3', '#d9f99d', '#bbf7d0',
    '#a7f3d0', '#99f6e4', '#bae6fd', '#bfdbfe',
    '#c7d2fe', '#ddd6fe', '#e9d5ff', '#f5d0fe'
  ],
  neon: [
    '#ff0055', '#ff3300', '#ff9900', '#ffff00',
    '#76ff03', '#00e676', '#00e5ff', '#2979ff',
    '#651fff', '#d500f9', '#f50057', '#00ffcc'
  ],
  nature: [
    '#271c19', '#451a03', '#78350f', '#92400e',
    '#b45309', '#d97706', '#9a5b3e', '#c67d5a',
    '#e09f7d', '#ffedd5', '#14532d', '#15803d',
    '#166534', '#1e3a8a', '#0369a1', '#e2e8f0'
  ]
};

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  if (clean.length === 6) {
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 255 };
  }
  return { r: 0, g: 0, b: 0, a: 255 };
}

class MastogradColoringStudio {
  constructor() {
    this.container = document.getElementById('coloringStudioSection');
    if (!this.container) return;

    this.colorCanvas = document.getElementById('cbColorCanvas');
    this.colorCtx = this.colorCanvas.getContext('2d', { willReadFrequently: true });

    this.linesCanvas = document.getElementById('cbLinesCanvas');
    this.linesCtx = this.linesCanvas.getContext('2d', { willReadFrequently: true });

    this.draftCanvas = document.getElementById('cbDraftCanvas');
    this.draftCtx = this.draftCanvas.getContext('2d');

    this.state = {
      tool: 'bucket', // 'bucket', 'marker', 'shape', 'eraser'
      currentColor: '#f43f5e',
      palette: 'rainbow',
      markerSize: 14,
      shape: 'star', // 'rectangle', 'circle', 'triangle', 'star', 'heart', 'line'
      shapeMode: 'fill', // 'fill', 'stroke'
      currentTemplateId: 'bearman_coloring'
    };

    this.history = [];
    this.historyIndex = -1;
    this.isDrawing = false;
    this.markerStroke = null;
    this.shapeStart = null;

    // Converter Modal State
    this.converterTempCanvas = document.createElement('canvas');
    this.converterOptions = { threshold: 55, lineWeight: 2, gapClosing: 2, denoise: 4 };

    this.initUI();
    this.loadTemplate('bearman_coloring');
  }

  initUI() {
    this.initToolButtons();
    this.initPaletteButtons();
    this.initShapeSelector();
    this.initCanvasPointerEvents();
    this.initLibraryModal();
    this.initConverterModal();
    this.initActions();
  }

  initToolButtons() {
    const tools = document.querySelectorAll('.cb-tool-btn');
    tools.forEach(btn => {
      btn.addEventListener('click', () => {
        tools.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.tool = btn.dataset.tool;

        // Prikaz/sakrivanje specifičnih opcija za oblik ili flomaster
        document.getElementById('cbShapeOptions')?.classList.toggle('visible', this.state.tool === 'shape');
        document.getElementById('cbMarkerOptions')?.classList.toggle('visible', this.state.tool === 'marker' || this.state.tool === 'eraser');
      });
    });

    // Marker size pills
    document.querySelectorAll('.cb-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cb-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.markerSize = parseInt(btn.dataset.size, 10);
      });
    });
  }

  initPaletteButtons() {
    // Tabs for palettes
    document.querySelectorAll('.cb-palette-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.cb-palette-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.state.palette = tab.dataset.palette;
        this.renderSwatches();
      });
    });

    // Custom color picker
    const picker = document.getElementById('cbCustomColorPicker');
    picker?.addEventListener('input', (e) => {
      this.setColor(e.target.value);
    });

    this.renderSwatches();
  }

  renderSwatches() {
    const container = document.getElementById('cbSwatchesList');
    if (!container) return;
    container.innerHTML = '';

    const colors = PALETTES[this.state.palette] || PALETTES.rainbow;
    colors.forEach(hex => {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = `cb-swatch ${hex.toLowerCase() === this.state.currentColor.toLowerCase() ? 'active' : ''}`;
      swatch.style.backgroundColor = hex;
      swatch.setAttribute('aria-label', hex);
      swatch.addEventListener('click', () => {
        this.setColor(hex);
      });
      container.appendChild(swatch);
    });
  }

  setColor(hex) {
    this.state.currentColor = hex;
    const badge = document.getElementById('cbActiveColorIndicator');
    if (badge) badge.style.backgroundColor = hex;

    document.querySelectorAll('.cb-swatch').forEach(s => {
      const bg = s.style.backgroundColor;
      s.classList.toggle('active', s.getAttribute('aria-label').toLowerCase() === hex.toLowerCase());
    });
  }

  initShapeSelector() {
    document.querySelectorAll('.cb-shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cb-shape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.shape = btn.dataset.shape;
      });
    });

    const fillToggle = document.getElementById('cbShapeFillToggle');
    fillToggle?.addEventListener('click', () => {
      this.state.shapeMode = this.state.shapeMode === 'fill' ? 'stroke' : 'fill';
      fillToggle.textContent = this.state.shapeMode === 'fill' ? 'Ispunjeno ◼' : 'Samo linija ◻';
      fillToggle.classList.toggle('active', this.state.shapeMode === 'fill');
    });
  }

  getPointerCoords(e) {
    const rect = this.draftCanvas.getBoundingClientRect();
    const scaleX = this.draftCanvas.width / rect.width;
    const scaleY = this.draftCanvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  initCanvasPointerEvents() {
    const target = this.draftCanvas;

    target.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      target.setPointerCapture(e.pointerId);
      const pt = this.getPointerCoords(e);
      this.isDrawing = true;

      if (this.state.tool === 'bucket') {
        const rgb = hexToRgb(this.state.currentColor);
        scanlineFloodFill(this.colorCtx, this.linesCtx, pt.x, pt.y, rgb);
        this.pushHistory();
      } else if (this.state.tool === 'marker') {
        this.markerStroke = new MarkerStroke(this.colorCtx, this.state.currentColor, this.state.markerSize, 0.92);
        this.markerStroke.start(pt.x, pt.y);
      } else if (this.state.tool === 'eraser') {
        eraseAt(this.colorCtx, pt.x, pt.y, this.state.markerSize * 1.5);
      } else if (this.state.tool === 'shape') {
        this.shapeStart = pt;
      }
    });

    target.addEventListener('pointermove', (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pt = this.getPointerCoords(e);

      if (this.state.tool === 'marker' && this.markerStroke) {
        this.markerStroke.move(pt.x, pt.y);
      } else if (this.state.tool === 'eraser') {
        eraseAt(this.colorCtx, pt.x, pt.y, this.state.markerSize * 1.5);
      } else if (this.state.tool === 'shape' && this.shapeStart) {
        // Rubberband preview na draft sloju
        this.draftCtx.clearRect(0, 0, this.draftCanvas.width, this.draftCanvas.height);
        drawGeometricShape(
          this.draftCtx,
          this.state.shape,
          this.shapeStart.x,
          this.shapeStart.y,
          pt.x,
          pt.y,
          this.state.currentColor,
          Math.max(3, this.state.markerSize * 0.4),
          this.state.shapeMode
        );
      }
    });

    const finishPointer = (e) => {
      if (!this.isDrawing) return;
      this.isDrawing = false;

      if (this.state.tool === 'marker' && this.markerStroke) {
        this.markerStroke.end();
        this.markerStroke = null;
        this.pushHistory();
      } else if (this.state.tool === 'eraser') {
        this.pushHistory();
      } else if (this.state.tool === 'shape' && this.shapeStart) {
        const pt = this.getPointerCoords(e);
        this.draftCtx.clearRect(0, 0, this.draftCanvas.width, this.draftCanvas.height);
        // Crtanje gotovog oblika na colorCtx
        drawGeometricShape(
          this.colorCtx,
          this.state.shape,
          this.shapeStart.x,
          this.shapeStart.y,
          pt.x,
          pt.y,
          this.state.currentColor,
          Math.max(3, this.state.markerSize * 0.4),
          this.state.shapeMode
        );
        this.shapeStart = null;
        this.pushHistory();
      }
    };

    target.addEventListener('pointerup', finishPointer);
    target.addEventListener('pointercancel', finishPointer);
  }

  loadTemplate(tplId) {
    const all = getAllTemplates();
    const tpl = all.find(t => t.id === tplId) || all[0];
    this.state.currentTemplateId = tpl.id;

    const w = 780;
    const h = 580;

    this.colorCanvas.width = w;
    this.colorCanvas.height = h;
    this.colorCtx.fillStyle = '#ffffff';
    this.colorCtx.fillRect(0, 0, w, h);

    this.linesCanvas.width = w;
    this.linesCanvas.height = h;

    this.draftCanvas.width = w;
    this.draftCanvas.height = h;

    if (tpl.dataUrl) {
      const img = new Image();
      img.onload = () => {
        this.linesCtx.fillStyle = '#ffffff';
        this.linesCtx.fillRect(0, 0, w, h);
        const hRatio = w / img.naturalWidth;
        const vRatio = h / img.naturalHeight;
        const ratio = Math.min(hRatio, vRatio);
        const nw = Math.round(img.naturalWidth * ratio);
        const nh = Math.round(img.naturalHeight * ratio);
        const cx = Math.round((w - nw) / 2);
        const cy = Math.round((h - nh) / 2);
        this.linesCtx.drawImage(img, cx, cy, nw, nh);

        this.history = [];
        this.historyIndex = -1;
        this.pushHistory();
        this.updateTitleBadge(tpl.title);
      };
      img.src = tpl.dataUrl;
    } else if (typeof tpl.draw === 'function') {
      tpl.draw(this.linesCtx, w, h);
      this.history = [];
      this.historyIndex = -1;
      this.pushHistory();
      this.updateTitleBadge(tpl.title);
    }
  }

  saveLinesToUserLibrary(canvasWithLines, title = 'Moja Bojanka', desc = 'Učitano u biblioteku') {
    const dataUrl = canvasWithLines.toDataURL('image/png');
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 160;
    thumbCanvas.height = 120;
    const tCtx = thumbCanvas.getContext('2d');
    tCtx.fillStyle = '#ffffff';
    tCtx.fillRect(0, 0, 160, 120);

    const hRatio = 160 / canvasWithLines.width;
    const vRatio = 120 / canvasWithLines.height;
    const ratio = Math.min(hRatio, vRatio);
    const nw = Math.round(canvasWithLines.width * ratio);
    const nh = Math.round(canvasWithLines.height * ratio);
    tCtx.drawImage(canvasWithLines, (160 - nw) / 2, (120 - nh) / 2, nw, nh);

    return addUserTemplate({
      title,
      desc,
      dataUrl,
      thumbUrl: thumbCanvas.toDataURL('image/png')
    });
  }

  setCustomLines(canvasWithLines, title = 'Prilagođena Bojanka') {
    const w = canvasWithLines.width;
    const h = canvasWithLines.height;

    this.colorCanvas.width = w;
    this.colorCanvas.height = h;
    this.colorCtx.fillStyle = '#ffffff';
    this.colorCtx.fillRect(0, 0, w, h);

    this.linesCanvas.width = w;
    this.linesCanvas.height = h;
    this.linesCtx.drawImage(canvasWithLines, 0, 0);

    this.draftCanvas.width = w;
    this.draftCanvas.height = h;

    this.history = [];
    this.historyIndex = -1;
    this.pushHistory();
    this.updateTitleBadge(title);
  }

  updateTitleBadge(title) {
    const el = document.getElementById('cbTemplateTitle');
    if (el) el.textContent = title;
  }

  pushHistory() {
    const snapshot = this.colorCtx.getImageData(0, 0, this.colorCanvas.width, this.colorCanvas.height);
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(snapshot);
    if (this.history.length > 20) this.history.shift();
    this.historyIndex = this.history.length - 1;
    this.updateUndoRedoUI();
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.colorCtx.putImageData(this.history[this.historyIndex], 0, 0);
      this.updateUndoRedoUI();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.colorCtx.putImageData(this.history[this.historyIndex], 0, 0);
      this.updateUndoRedoUI();
    }
  }

  updateUndoRedoUI() {
    const uBtn = document.getElementById('cbUndoBtn');
    const rBtn = document.getElementById('cbRedoBtn');
    if (uBtn) uBtn.disabled = this.historyIndex <= 0;
    if (rBtn) rBtn.disabled = this.historyIndex >= this.history.length - 1;
  }

  clearColors() {
    this.colorCtx.fillStyle = '#ffffff';
    this.colorCtx.fillRect(0, 0, this.colorCanvas.width, this.colorCanvas.height);
    this.pushHistory();
  }

  initLibraryModal() {
    const dialog = document.getElementById('cbLibraryModal');
    const openBtn = document.getElementById('cbOpenLibraryBtn');
    const topOpenBtn = document.getElementById('topOpenLibraryBtn');
    const closeBtn = document.getElementById('cbCloseLibraryBtn');

    // Veliko Upload dugme u biblioteci
    const bigUploadBtn = document.getElementById('cbBigUploadBtn');
    const bigUploadInput = document.getElementById('cbBigUploadInput');

    const openModalWithTab = (cat = 'all') => {
      dialog?.showModal();
      this.renderLibraryTabs(cat);
      this.renderLibraryGrid(cat);
    };

    openBtn?.addEventListener('click', () => openModalWithTab('all'));
    topOpenBtn?.addEventListener('click', () => openModalWithTab('all'));
    closeBtn?.addEventListener('click', () => dialog?.close());

    // Klik na veliko dugme UPLOAD
    bigUploadBtn?.addEventListener('click', () => bigUploadInput?.click());
    bigUploadInput?.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length) {
        this.processDirectUploadFiles(files);
        bigUploadInput.value = '';
        dialog?.close();
      }
    });
  }

  processDirectUploadFiles(files) {
    let lastLoadedTplId = null;
    let pending = files.length;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          // Standardizuj veličinu platna za čisto bojenje
          const canvas = document.createElement('canvas');
          canvas.width = 780;
          canvas.height = 580;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 780, 580);

          const hRatio = 780 / img.naturalWidth;
          const vRatio = 580 / img.naturalHeight;
          const ratio = Math.min(hRatio, vRatio);
          const nw = Math.round(img.naturalWidth * ratio);
          const nh = Math.round(img.naturalHeight * ratio);
          ctx.drawImage(img, (780 - nw) / 2, (580 - nh) / 2, nw, nh);

          // Čišćenje pozadine i osiguravanje jasnih linija za bojenje kanticom
          const imgData = ctx.getImageData(0, 0, 780, 580);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
            if (d[i + 3] < 80) {
              // Transparentna pozadina postaje čisto bela
              d[i] = 255; d[i + 1] = 255; d[i + 2] = 255; d[i + 3] = 255;
            } else {
              const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
              if (lum > 200) {
                // Prljavo bela pozadina postaje savršeno bela
                d[i] = 255; d[i + 1] = 255; d[i + 2] = 255; d[i + 3] = 255;
              } else if (lum < 110) {
                // Tamne linije konture postaju čisto crne za precizno zatvaranje
                d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = 255;
              }
            }
          }
          ctx.putImageData(imgData, 0, 0);

          const rawName = file.name.replace(/\.[^/.]+$/, '').trim();
          const cleanTitle = rawName ? rawName.slice(0, 24) : `Učitana Bojanka ${getUserTemplates().length + 1}`;
          const newTpl = this.saveLinesToUserLibrary(canvas, cleanTitle, 'Spremno za bojenje');
          lastLoadedTplId = newTpl.id;

          pending--;
          if (pending === 0 && lastLoadedTplId) {
            // Automatski učitaj dodatu sliku za bojenje na glavnom platnu
            this.loadTemplate(lastLoadedTplId);
          }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  renderLibraryTabs(activeCatId) {
    const tabsContainer = document.getElementById('cbLibraryTabs');
    if (!tabsContainer) return;
    tabsContainer.innerHTML = '';

    COLORING_CATEGORIES.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `cb-cat-pill ${cat.id === activeCatId ? 'active' : ''}`;
      btn.textContent = cat.label;

      btn.addEventListener('click', () => {
        tabsContainer.querySelectorAll('.cb-cat-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderLibraryGrid(cat.id);
      });
      tabsContainer.appendChild(btn);
    });
  }

  renderLibraryGrid(catId) {
    const grid = document.getElementById('cbLibraryGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const all = getAllTemplates();
    const list = catId === 'all'
      ? all
      : COLORING_TEMPLATES.filter(t => t.category === catId);

    list.forEach(tpl => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'cb-lib-card';

      const isUser = !!tpl.isUserUploaded;

      card.innerHTML = `
        <div class="cb-lib-thumb">
          <canvas width="160" height="120" data-tpl-thumb="${tpl.id}"></canvas>
        </div>
        ${isUser ? `<span class="cb-lib-card-badge">Moja Slika</span><button type="button" class="cb-lib-del-btn" title="Obriši ovu sliku iz biblioteke">🗑️</button>` : ''}
        <div class="cb-lib-info">
          <strong>${tpl.title}</strong>
          <span>${tpl.desc}</span>
        </div>
      `;

      // Render miniature preview
      setTimeout(() => {
        const cvs = card.querySelector(`canvas[data-tpl-thumb="${tpl.id}"]`);
        if (cvs) {
          const ctx = cvs.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 160, 120);

          if (tpl.thumbUrl || tpl.dataUrl) {
            const img = new Image();
            img.onload = () => {
              const hRatio = 160 / img.naturalWidth;
              const vRatio = 120 / img.naturalHeight;
              const ratio = Math.min(hRatio, vRatio);
              const nw = Math.round(img.naturalWidth * ratio);
              const nh = Math.round(img.naturalHeight * ratio);
              ctx.drawImage(img, (160 - nw) / 2, (120 - nh) / 2, nw, nh);
            };
            img.src = tpl.thumbUrl || tpl.dataUrl;
          } else if (typeof tpl.draw === 'function') {
            tpl.draw(ctx, 160, 120);
          }
        }
      }, 0);

      // Dugme za brisanje sopstvene slike
      if (isUser) {
        const delBtn = card.querySelector('.cb-lib-del-btn');
        delBtn?.addEventListener('click', (ev) => {
          ev.stopPropagation();
          if (confirm(`Da li želiš da obrišeš sliku "${tpl.title}" iz biblioteke?`)) {
            removeUserTemplate(tpl.id);
            this.renderLibraryGrid(catId);
          }
        });
      }

      card.addEventListener('click', () => {
        this.loadTemplate(tpl.id);
        document.getElementById('cbLibraryModal')?.close();
      });

      grid.appendChild(card);
    });
  }

  loadFileIntoConverter(file) {
    const dialog = document.getElementById('cbConverterModal');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 840;
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > maxDim || h > maxDim) {
          const s = maxDim / Math.max(w, h);
          w = Math.round(w * s);
          h = Math.round(h * s);
        }
        this.converterTempCanvas.width = w;
        this.converterTempCanvas.height = h;
        this.converterTempCanvas.getContext('2d').drawImage(img, 0, 0, w, h);
        dialog?.showModal();
        this.renderConverterPreview();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  initConverterModal() {
    const dialog = document.getElementById('cbConverterModal');
    const closeBtn = document.getElementById('cbCloseConverterBtn');
    const uploadInput = document.getElementById('cbConverterFileInput');
    const uploadBtn = document.getElementById('cbConverterUploadBtn');
    const applyBtn = document.getElementById('cbApplyConverterBtn');

    uploadBtn?.addEventListener('click', () => uploadInput?.click());
    document.getElementById('topConverterUploadBtn')?.addEventListener('click', () => uploadInput?.click());
    uploadInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        this.loadFileIntoConverter(file);
        uploadInput.value = '';
      }
    });

    closeBtn?.addEventListener('click', () => dialog?.close());

    // Converter Sliders
    const bindSlider = (id, key) => {
      const input = document.getElementById(id);
      const valSpan = document.getElementById(`${id}Val`);
      input?.addEventListener('input', () => {
        this.converterOptions[key] = parseInt(input.value, 10);
        if (valSpan) valSpan.textContent = input.value;
        this.renderConverterPreview();
      });
    };
    bindSlider('cbConvThreshold', 'threshold');
    bindSlider('cbConvWeight', 'lineWeight');
    bindSlider('cbConvGapClosing', 'gapClosing');
    bindSlider('cbConvDenoise', 'denoise');

    applyBtn?.addEventListener('click', () => {
      const linesCanvas = convertPhotoToColoringPage(this.converterTempCanvas, this.converterOptions);
      const title = `Bojanka iz Foto ${getUserTemplates().length + 1}`;
      // Automatski sačuvaj i u trajnu korisničku biblioteku
      const newTpl = this.saveLinesToUserLibrary(linesCanvas, title, 'Automatski kreirano iz fotografije');
      this.loadTemplate(newTpl.id);
      dialog?.close();
    });

    const directBtn = document.getElementById('cbDirectLoadBtn');
    directBtn?.addEventListener('click', () => {
      const title = `Učitana Bojanka ${getUserTemplates().length + 1}`;
      const newTpl = this.saveLinesToUserLibrary(this.converterTempCanvas, title, 'Učitana gotova bojanka');
      this.loadTemplate(newTpl.id);
      dialog?.close();
    });

    // Drag & Drop slika direktno na platno studija (odmah spremno za bojenje!)
    const stageViewport = document.getElementById('cbCanvasViewport');
    stageViewport?.addEventListener('dragover', (e) => e.preventDefault());
    stageViewport?.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) {
        this.processDirectUploadFiles([file]);
      }
    });
  }

  openConverterWithCanvas(canvas) {
    this.converterTempCanvas.width = canvas.width;
    this.converterTempCanvas.height = canvas.height;
    this.converterTempCanvas.getContext('2d').drawImage(canvas, 0, 0);
    const dialog = document.getElementById('cbConverterModal');
    dialog?.showModal();
    this.renderConverterPreview();
  }

  renderConverterPreview() {
    const previewCanvas = document.getElementById('cbConverterPreviewCanvas');
    if (!previewCanvas || !this.converterTempCanvas.width) return;
    const lines = convertPhotoToColoringPage(this.converterTempCanvas, this.converterOptions);
    previewCanvas.width = lines.width;
    previewCanvas.height = lines.height;
    previewCanvas.getContext('2d').drawImage(lines, 0, 0);
  }

  initActions() {
    // 1. Direktno učitavanje gotove bojanke (Top Bar i Stage Bar)
    const directFileInput = document.getElementById('cbDirectFileInput');
    document.getElementById('topDirectUploadBtn')?.addEventListener('click', () => directFileInput?.click());
    document.getElementById('stageDirectUploadBtn')?.addEventListener('click', () => directFileInput?.click());
    directFileInput?.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length) {
        this.processDirectUploadFiles(files);
        directFileInput.value = '';
      }
    });

    document.getElementById('cbUndoBtn')?.addEventListener('click', () => this.undo());
    document.getElementById('cbRedoBtn')?.addEventListener('click', () => this.redo());
    document.getElementById('cbClearBtn')?.addEventListener('click', () => this.clearColors());

    // Preuzmi / Download obojenu sliku
    document.getElementById('cbDownloadBtn')?.addEventListener('click', () => {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = this.colorCanvas.width;
      exportCanvas.height = this.colorCanvas.height;
      const ctx = exportCanvas.getContext('2d');
      // Prvo boje
      ctx.drawImage(this.colorCanvas, 0, 0);
      // Preko njih crne linije u multiply režimu
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(this.linesCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';

      const a = document.createElement('a');
      a.download = `mastograd-bojanka-${Date.now()}.png`;
      a.href = exportCanvas.toDataURL('image/png');
      a.click();
    });

    // Štampanje (Print) - štampa čistu crno-belu liniju za pravo bojenje drvenim bojicama!
    document.getElementById('cbPrintBtn')?.addEventListener('click', () => {
      const printWin = window.open('', '_blank');
      if (!printWin) return;
      const imgDataUrl = this.linesCanvas.toDataURL('image/png');
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Mastograd Dečija Bojanka — Za Štampu</title>
          <style>
            body { margin:0; display:flex; align-items:center; justify-content:center; height:100vh; }
            img { max-width:95vw; max-height:95vh; object-fit:contain; }
            @media print { img { width:100%; height:auto; } }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <img src="${imgDataUrl}" />
        </body>
        </html>
      `);
      printWin.document.close();
    });
  }

  resizeToFit() {
    // automatski prilagođava prikaz prozoru
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.mastogradColoring = new MastogradColoringStudio();
});

})();

