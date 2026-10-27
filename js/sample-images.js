/**
 * Generates high-detail shaded test scenes (including the Bearman / BEAR 5-Toe Paw Hero scene)
 * so users can test Comic Book Pro, Hero Concept Art, Fashion Illustration, 3D Cartoon Studio,
 * Vector Mascot, 2D Clipart, and Looney Tunes filters immediately.
 */
(function () {

const SAMPLE_SCENES = [
  { id: 'bearman_hero', label: 'Bearman (BEAR 5-Prstiju Logo)', defaultLogoPos: { x: 380, y: 455, radius: 56 } },
  { id: 'hero_portrait', label: 'Portret (Model)', defaultLogoPos: { x: 380, y: 430, radius: 52 } },
  { id: 'retro_racer', label: 'Sportski Auto', defaultLogoPos: { x: 380, y: 390, radius: 50 } },
  { id: 'toon_character', label: 'Maskota / Lik', defaultLogoPos: { x: 380, y: 310, radius: 55 } }
];

function addPhotographicGrain(ctx, width, height, amount = 7) {
  const img = ctx.getImageData(0, 0, width, height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] = Math.min(255, Math.max(0, d[i] + n));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
}

function renderSampleSceneToCanvas(sceneId, width = 760, height = 560) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (sceneId === 'bearman_hero') {
    drawBearmanHeroScene(ctx, width, height);
  } else if (sceneId === 'hero_portrait') {
    drawPortraitScene(ctx, width, height);
  } else if (sceneId === 'retro_racer') {
    drawRetroRacerScene(ctx, width, height);
  } else {
    drawMascotScene(ctx, width, height);
  }

  addPhotographicGrain(ctx, width, height, 7);
  return canvas;
}

/**
 * Draws the exact 5-toe BEAR paw emblem at (px, py) with scale s
 */
function drawFiveToeBearPawLogo(ctx, px, py, scale = 1.0) {
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(scale, scale);

  // Circular badge shield
  const badgeGrad = ctx.createRadialGradient(-6, -8, 4, 0, 0, 44);
  badgeGrad.addColorStop(0, '#fbbf24');
  badgeGrad.addColorStop(0.75, '#d97706');
  badgeGrad.addColorStop(1, '#78350f');
  ctx.fillStyle = badgeGrad;
  ctx.strokeStyle = '#fef3c7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Main palm pad
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.ellipse(0, 9, 17, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // EXACTLY 5 TOES (signature BEAR Underwear 5-toe paw mark)
  const toes = [
    { x: -20, y: -6, rx: 4.8, ry: 7.2, rot: -0.42 },
    { x: -10, y: -14, rx: 5.0, ry: 7.8, rot: -0.20 },
    { x: 0,   y: -17, rx: 5.2, ry: 8.2, rot: 0.0 },
    { x: 10,  y: -14, rx: 5.0, ry: 7.8, rot: 0.20 },
    { x: 20,  y: -6, rx: 4.8, ry: 7.2, rot: 0.42 }
  ];
  for (const t of toes) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, t.rx, t.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    // Sharp claw tip
    ctx.beginPath();
    ctx.moveTo(-2.5, -t.ry + 1);
    ctx.lineTo(0, -t.ry - 4.5);
    ctx.lineTo(2.5, -t.ry + 1);
    ctx.fill();
    ctx.restore();
  }

  // "BEAR" micro-label underneath pad
  ctx.fillStyle = '#fef3c7';
  ctx.font = '900 9.5px Inter, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BEAR', 0, 31);

  ctx.restore();
}

function drawBearmanHeroScene(ctx, w, h) {
  // Dramatic concept-art storm-blue & golden rim-lit sky backdrop
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.35, 30, w * 0.5, h * 0.5, w * 0.72);
  bg.addColorStop(0, '#3b82f6');
  bg.addColorStop(0.42, '#1e293b');
  bg.addColorStop(1, '#090d16');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Warm golden rim-light backlight glow behind Bearman
  const halo = ctx.createRadialGradient(w * 0.5, h * 0.38, 20, w * 0.5, h * 0.38, 240);
  halo.addColorStop(0, 'rgba(251, 191, 36, 0.42)');
  halo.addColorStop(0.6, 'rgba(249, 115, 22, 0.14)');
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.38, 240, 0, Math.PI * 2);
  ctx.fill();

  const cx = w * 0.5;
  const cy = h * 0.44;

  // Heroic Broad Shoulders & Sculpted Torso Suit / Athletic Top
  const suitGrad = ctx.createLinearGradient(cx - 220, cy + 70, cx + 220, h);
  suitGrad.addColorStop(0, '#334155');
  suitGrad.addColorStop(0.35, '#1e293b');
  suitGrad.addColorStop(0.7, '#0f172a');
  suitGrad.addColorStop(1, '#090d16');
  ctx.fillStyle = suitGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 245, h);
  ctx.quadraticCurveTo(cx - 220, cy + 90, cx - 90, cy + 82);
  ctx.lineTo(cx + 90, cy + 82);
  ctx.quadraticCurveTo(cx + 220, cy + 90, cx + 245, h);
  ctx.closePath();
  ctx.fill();

  // Golden-amber heroic shoulder armor / trim stripes
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(cx - 205, h - 20);
  ctx.quadraticCurveTo(cx - 160, cy + 120, cx - 72, cy + 92);
  ctx.moveTo(cx + 205, h - 20);
  ctx.quadraticCurveTo(cx + 160, cy + 120, cx + 72, cy + 92);
  ctx.stroke();

  // Sculpted pectoral shading planes
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.beginPath();
  ctx.ellipse(cx - 65, cy + 155, 58, 36, 0.15, 0, Math.PI * 2);
  ctx.ellipse(cx + 65, cy + 155, 58, 36, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Rounded Bear Ears with warm rim light
  for (const dir of [-1, 1]) {
    const ex = cx + dir * 88;
    const ey = cy - 98;
    const earG = ctx.createRadialGradient(ex - dir * 8, ey - 8, 5, ex, ey, 38);
    earG.addColorStop(0, '#b45309');
    earG.addColorStop(0.55, '#78350f');
    earG.addColorStop(1, '#271206');
    ctx.fillStyle = earG;
    ctx.beginPath();
    ctx.arc(ex, ey, 36, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(ex, ey + 2, 19, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bearman Sculpted Fur Head & Jaw
  const headG = ctx.createRadialGradient(cx - 30, cy - 45, 20, cx, cy, 138);
  headG.addColorStop(0, '#d97706');
  headG.addColorStop(0.45, '#92400e');
  headG.addColorStop(0.82, '#451a03');
  headG.addColorStop(1, '#1c0a02');
  ctx.fillStyle = headG;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 8, 112, 108, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lighter Tan Snout / Muzzle Volume
  const muzzleG = ctx.createRadialGradient(cx - 10, cy + 8, 8, cx, cy + 18, 62);
  muzzleG.addColorStop(0, '#fde68a');
  muzzleG.addColorStop(0.55, '#d97706');
  muzzleG.addColorStop(1, '#78350f');
  ctx.fillStyle = muzzleG;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 20, 52, 44, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose bridge & Leathery Black Bear Nose with specular highlight
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, 24, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.ellipse(cx - 7, cy - 1, 8, 4.5, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Confident Heroic Brow & Piercing Golden-Amber Eyes
  for (const dir of [-1, 1]) {
    const ex = cx + dir * 42;
    const ey = cy - 28;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(ex, ey, 18, 11, dir * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(ex, ey, 8.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#090a0f';
    ctx.beginPath();
    ctx.arc(ex, ey, 4.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex - 3, ey - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Heavy furrowed heroic brow ridge
    ctx.strokeStyle = '#1c0a02';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ex - dir * 22, ey - 11);
    ctx.lineTo(ex + dir * 20, ey - 19);
    ctx.stroke();
  }

  // Confident jaw / mouth line
  ctx.strokeStyle = '#271206';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 20);
  ctx.lineTo(cx, cy + 36);
  ctx.moveTo(cx - 26, cy + 40);
  ctx.quadraticCurveTo(cx, cy + 32, cx + 26, cy + 40);
  ctx.stroke();

  // Signature 5-Toe BEAR Paw Emblem on Chest Center (for testing Product-Safe & Masking)
  drawFiveToeBearPawLogo(ctx, cx, cy + 208, 1.05);
}

function drawPortraitScene(ctx, w, h) {
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#1e3a8a');
  bg.addColorStop(0.5, '#0f766e');
  bg.addColorStop(1, '#111827');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.52;

  const hairBack = ctx.createRadialGradient(cx - 20, cy - 80, 20, cx, cy - 20, 195);
  hairBack.addColorStop(0, '#451a03');
  hairBack.addColorStop(0.6, '#1c1917');
  hairBack.addColorStop(1, '#09090b');
  ctx.fillStyle = hairBack;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10, 155, 185, 0, 0, Math.PI * 2);
  ctx.fill();

  const jacketGrad = ctx.createLinearGradient(cx - 180, cy + 110, cx + 180, h);
  jacketGrad.addColorStop(0, '#ef4444');
  jacketGrad.addColorStop(0.55, '#dc2626');
  jacketGrad.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = jacketGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 210, h);
  ctx.quadraticCurveTo(cx - 175, cy + 105, cx - 65, cy + 100);
  ctx.lineTo(cx + 65, cy + 100);
  ctx.quadraticCurveTo(cx + 175, cy + 105, cx + 210, h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(cx - 58, cy + 102);
  ctx.lineTo(cx + 58, cy + 102);
  ctx.lineTo(cx, cy + 210);
  ctx.closePath();
  ctx.fill();

  const neckGrad = ctx.createLinearGradient(cx - 38, cy + 40, cx + 40, cy + 125);
  neckGrad.addColorStop(0, '#9a5b3e');
  neckGrad.addColorStop(0.35, '#e09f7d');
  neckGrad.addColorStop(1, '#c67d5a');
  ctx.fillStyle = neckGrad;
  ctx.fillRect(cx - 36, cy + 52, 72, 68);

  const faceGrad = ctx.createRadialGradient(cx - 32, cy - 42, 18, cx + 10, cy - 10, 138);
  faceGrad.addColorStop(0, '#ffedd5');
  faceGrad.addColorStop(0.45, '#f3b692');
  faceGrad.addColorStop(0.82, '#d48763');
  faceGrad.addColorStop(1, '#9c5233');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 18, 96, 118, 0, 0, Math.PI * 2);
  ctx.fill();

  const drawEye = (ex, ey, flip) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(ex, ey, 23, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(ex, ey, 11.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#090a0f';
    ctx.beginPath();
    ctx.arc(ex, ey, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex - 4, ey - 4, 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1e1b18';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.arc(ex, ey + 3, 24, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();

    ctx.strokeStyle = '#271c19';
    ctx.lineWidth = 6.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ex - 26 * flip, ey - 22);
    ctx.quadraticCurveTo(ex, ey - 31, ex + 25 * flip, ey - 20);
    ctx.stroke();
  };

  drawEye(cx - 40, cy - 28, 1);
  drawEye(cx + 40, cy - 28, -1);

  ctx.strokeStyle = 'rgba(138, 68, 40, 0.75)';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy - 28);
  ctx.lineTo(cx - 8, cy + 12);
  ctx.quadraticCurveTo(cx, cy + 19, cx + 10, cy + 12);
  ctx.stroke();

  ctx.fillStyle = '#be123c';
  ctx.beginPath();
  ctx.moveTo(cx - 32, cy + 44);
  ctx.quadraticCurveTo(cx, cy + 34, cx + 32, cy + 44);
  ctx.quadraticCurveTo(cx, cy + 62, cx - 32, cy + 44);
  ctx.fill();

  const bangsGrad = ctx.createLinearGradient(cx - 100, cy - 145, cx + 100, cy - 30);
  bangsGrad.addColorStop(0, '#451a03');
  bangsGrad.addColorStop(0.45, '#78350f');
  bangsGrad.addColorStop(1, '#1c1917');
  ctx.fillStyle = bangsGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 98, cy - 35);
  ctx.quadraticCurveTo(cx - 95, cy - 150, cx + 5, cy - 148);
  ctx.quadraticCurveTo(cx + 102, cy - 145, cx + 98, cy - 32);
  ctx.quadraticCurveTo(cx + 42, cy - 92, cx - 12, cy - 68);
  ctx.quadraticCurveTo(cx - 65, cy - 95, cx - 98, cy - 35);
  ctx.closePath();
  ctx.fill();
}

function drawRetroRacerScene(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  sky.addColorStop(0, '#1e1b4b');
  sky.addColorStop(0.55, '#9333ea');
  sky.addColorStop(1, '#f97316');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.62);

  const sun = ctx.createLinearGradient(0, h * 0.14, 0, h * 0.55);
  sun.addColorStop(0, '#fef08a');
  sun.addColorStop(1, '#ef4444');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.36, 115, 0, Math.PI * 2);
  ctx.fill();

  const road = ctx.createLinearGradient(0, h * 0.62, 0, h);
  road.addColorStop(0, '#1f2937');
  road.addColorStop(1, '#090d16');
  ctx.fillStyle = road;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);

  const carX = w * 0.16;
  const carY = h * 0.48;
  const carW = w * 0.68;
  const carH = h * 0.32;

  ctx.fillStyle = '#0369a1';
  ctx.beginPath();
  ctx.moveTo(carX + 105, carY + 25);
  ctx.lineTo(carX + 175, carY - 52);
  ctx.lineTo(carX + carW - 145, carY - 52);
  ctx.lineTo(carX + carW - 75, carY + 25);
  ctx.closePath();
  ctx.fill();

  const bodyGrad = ctx.createLinearGradient(carX, carY, carX, carY + carH);
  bodyGrad.addColorStop(0, '#67e8f9');
  bodyGrad.addColorStop(0.45, '#06b6d4');
  bodyGrad.addColorStop(1, '#164e63');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(carX, carY + 18, carW, carH - 20, [28, 36, 16, 16]);
  ctx.fill();

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(carX + 14, carY + 54, carW - 28, 18);

  for (const wx of [carX + 115, carX + carW - 115]) {
    const wy = carY + carH - 4;
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(wx, wy, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(wx, wy, 26, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMascotScene(ctx, w, h) {
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.65);
  bg.addColorStop(0, '#fde047');
  bg.addColorStop(0.55, '#f97316');
  bg.addColorStop(1, '#b91c1c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.54;

  const headG = ctx.createRadialGradient(cx - 25, cy - 35, 15, cx, cy, 130);
  headG.addColorStop(0, '#f1f5f9');
  headG.addColorStop(0.65, '#94a3b8');
  headG.addColorStop(1, '#475569');
  ctx.fillStyle = headG;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 115, 102, 0, 0, Math.PI * 2);
  ctx.fill();

  for (const dir of [-1, 1]) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx + dir * 32, cy - 28, 26, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(cx + dir * 26, cy - 24, 12, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 8, 20, 14, 0, 0, Math.PI * 2);
  ctx.fill();
}

const STYLE_REF_PRESETS = [
  { id: 'bearman_painterly_ref', name: 'Bearman Finale (Painterly Concept Ref)' },
  { id: 'bearman_comic_ref', name: 'Bearman v1 (Bold Comic Ink Ref)' },
  { id: 'bearman_noir_ref', name: 'Bearman Noir (High-Contrast Ink Ref)' }
];

function renderStyleReferencePresetToCanvas(refId, w = 220, h = 160) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  drawBearmanHeroScene(ctx, w, h);

  // Apply distinct reference lighting/ink character per Bearman reference preset
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (refId === 'bearman_painterly_ref') {
      // Warm golden painterly contrast
      d[i] = Math.min(255, d[i] * 1.14 + 10);
      d[i + 1] = Math.min(255, d[i + 1] * 1.05 + 4);
      d[i + 2] = Math.max(0, d[i + 2] * 0.90);
    } else if (refId === 'bearman_comic_ref') {
      // High-contrast bold comic ink saturation
      const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const f = l < 75 ? 0.45 : 1.18;
      d[i] = Math.min(255, d[i] * f);
      d[i + 1] = Math.min(255, d[i + 1] * f);
      d[i + 2] = Math.min(255, d[i + 2] * f);
    } else if (refId === 'bearman_noir_ref') {
      // Heavy graphic noir ink shadows
      const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const v = l < 95 ? l * 0.35 : Math.min(255, l * 1.25);
      d[i] = v;
      d[i + 1] = v * 0.96;
      d[i + 2] = v * 0.92;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

window.MastogradSamples = {
  SAMPLE_SCENES,
  STYLE_REF_PRESETS,
  renderSampleSceneToCanvas,
  renderStyleReferencePresetToCanvas
};

})();
