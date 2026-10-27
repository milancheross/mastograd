/**
 * Generates high-detail shaded test scenes (with realistic gradients, soft shadows,
 * specular highlights, and subtle surface grain) so users can test Comic Book,
 * 2D Clipart, and Looney Tunes filters immediately or upload their own photos.
 */

const SAMPLE_SCENES = [
  { id: 'hero_portrait', label: 'Portret (Hero)' },
  { id: 'retro_racer', label: 'Sportski Auto' },
  { id: 'toon_character', label: 'Maskota / Lik' },
  { id: 'sunset_city', label: 'Grad & Pejzaž' }
];

function addPhotographicGrain(ctx, width, height, amount = 9) {
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

  if (sceneId === 'hero_portrait') {
    drawPortraitScene(ctx, width, height);
  } else if (sceneId === 'retro_racer') {
    drawRetroRacerScene(ctx, width, height);
  } else if (sceneId === 'toon_character') {
    drawMascotScene(ctx, width, height);
  } else {
    drawSunsetCityScene(ctx, width, height);
  }

  // Add subtle natural camera sensor grain so the Bilateral + SNN smoothing & XDoG line cleaner prove their worth
  addPhotographicGrain(ctx, width, height, 8);
  return canvas;
}

function drawPortraitScene(ctx, w, h) {
  // Cinematic gradient backdrop
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#1e3a8a');
  bg.addColorStop(0.5, '#0f766e');
  bg.addColorStop(1, '#111827');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Soft bokeh lights in background
  const bokehs = [
    { x: w * 0.18, y: h * 0.24, r: 58, c: 'rgba(251, 191, 36, 0.28)' },
    { x: w * 0.82, y: h * 0.20, r: 72, c: 'rgba(244, 63, 94, 0.25)' },
    { x: w * 0.76, y: h * 0.65, r: 64, c: 'rgba(56, 189, 248, 0.25)' }
  ];
  for (const b of bokehs) {
    const g = ctx.createRadialGradient(b.x, b.y, 4, b.x, b.y, b.r);
    g.addColorStop(0, b.c);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }

  const cx = w * 0.5;
  const cy = h * 0.52;

  // Back hair volume
  const hairBack = ctx.createRadialGradient(cx - 20, cy - 80, 20, cx, cy - 20, 195);
  hairBack.addColorStop(0, '#451a03');
  hairBack.addColorStop(0.6, '#1c1917');
  hairBack.addColorStop(1, '#09090b');
  ctx.fillStyle = hairBack;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10, 155, 185, 0, 0, Math.PI * 2);
  ctx.fill();

  // Jacket / Shoulders (Vibrant Red-Orange Streetwear Jacket with shaded folds)
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

  // Jacket collar & inner shirt
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(cx - 58, cy + 102);
  ctx.lineTo(cx + 58, cy + 102);
  ctx.lineTo(cx, cy + 210);
  ctx.closePath();
  ctx.fill();

  // Jacket lapels
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.moveTo(cx - 65, cy + 100);
  ctx.lineTo(cx - 115, cy + 195);
  ctx.lineTo(cx - 25, cy + 185);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + 65, cy + 100);
  ctx.lineTo(cx + 115, cy + 195);
  ctx.lineTo(cx + 25, cy + 185);
  ctx.closePath();
  ctx.fill();

  // Neck with natural shadow under chin
  const neckGrad = ctx.createLinearGradient(cx - 38, cy + 40, cx + 40, cy + 125);
  neckGrad.addColorStop(0, '#9a5b3e');
  neckGrad.addColorStop(0.35, '#e09f7d');
  neckGrad.addColorStop(1, '#c67d5a');
  ctx.fillStyle = neckGrad;
  ctx.fillRect(cx - 36, cy + 52, 72, 68);

  // Face 3D shaded oval
  const faceGrad = ctx.createRadialGradient(cx - 32, cy - 42, 18, cx + 10, cy - 10, 138);
  faceGrad.addColorStop(0, '#ffedd5');
  faceGrad.addColorStop(0.45, '#f3b692');
  faceGrad.addColorStop(0.82, '#d48763');
  faceGrad.addColorStop(1, '#9c5233');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 18, 96, 118, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cheek warm blush
  const cheekL = ctx.createRadialGradient(cx - 52, cy + 4, 4, cx - 52, cy + 4, 34);
  cheekL.addColorStop(0, 'rgba(244, 63, 94, 0.32)');
  cheekL.addColorStop(1, 'rgba(244, 63, 94, 0)');
  ctx.fillStyle = cheekL;
  ctx.beginPath();
  ctx.arc(cx - 52, cy + 4, 34, 0, Math.PI * 2);
  ctx.fill();

  const cheekR = ctx.createRadialGradient(cx + 52, cy + 4, 4, cx + 52, cy + 4, 34);
  cheekR.addColorStop(0, 'rgba(244, 63, 94, 0.28)');
  cheekR.addColorStop(1, 'rgba(244, 63, 94, 0)');
  ctx.fillStyle = cheekR;
  ctx.beginPath();
  ctx.arc(cx + 52, cy + 4, 34, 0, Math.PI * 2);
  ctx.fill();

  // Expressive Eyes
  const drawEye = (ex, ey, flip) => {
    // Sclera
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(ex, ey, 23, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris (emerald-amber gradient)
    const iris = ctx.createRadialGradient(ex, ey, 2, ex, ey, 12);
    iris.addColorStop(0, '#065f46');
    iris.addColorStop(0.6, '#10b981');
    iris.addColorStop(1, '#064e3b');
    ctx.fillStyle = iris;
    ctx.beginPath();
    ctx.arc(ex, ey, 11.5, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#090a0f';
    ctx.beginPath();
    ctx.arc(ex, ey, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Specular catchlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex - 4, ey - 4, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Upper eyelid lash crease
    ctx.strokeStyle = '#1e1b18';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.arc(ex, ey + 3, 24, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();

    // Eyebrow
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

  // Nose bridge & shaded tip
  ctx.strokeStyle = 'rgba(138, 68, 40, 0.75)';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy - 28);
  ctx.lineTo(cx - 8, cy + 12);
  ctx.quadraticCurveTo(cx, cy + 19, cx + 10, cy + 12);
  ctx.stroke();

  // Lips (shaded upper & lower lip)
  ctx.fillStyle = '#be123c';
  ctx.beginPath();
  ctx.moveTo(cx - 32, cy + 44);
  ctx.quadraticCurveTo(cx - 12, cy + 34, cx, cy + 40);
  ctx.quadraticCurveTo(cx + 12, cy + 34, cx + 32, cy + 44);
  ctx.quadraticCurveTo(cx, cy + 48, cx - 32, cy + 44);
  ctx.fill();

  const lowerLip = ctx.createLinearGradient(cx, cy + 42, cx, cy + 62);
  lowerLip.addColorStop(0, '#fb7185');
  lowerLip.addColorStop(1, '#9f1239');
  ctx.fillStyle = lowerLip;
  ctx.beginPath();
  ctx.moveTo(cx - 31, cy + 44);
  ctx.quadraticCurveTo(cx, cy + 66, cx + 31, cy + 44);
  ctx.quadraticCurveTo(cx, cy + 48, cx - 31, cy + 44);
  ctx.fill();

  // Stylish Swept Front Hair Bangs with specular sheen
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

  // Cool yellow-tinted aviator sunglasses resting on forehead/head
  ctx.fillStyle = 'rgba(250, 204, 21, 0.78)';
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(cx - 76, cy - 115, 64, 38, 12);
  ctx.roundRect(cx + 12, cy - 115, 64, 38, 12);
  ctx.fill();
  ctx.stroke();
}

function drawRetroRacerScene(ctx, w, h) {
  // Neon sunset sky
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  sky.addColorStop(0, '#1e1b4b');
  sky.addColorStop(0.55, '#9333ea');
  sky.addColorStop(1, '#f97316');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.62);

  // Giant glowing sun
  const sun = ctx.createLinearGradient(0, h * 0.14, 0, h * 0.55);
  sun.addColorStop(0, '#fef08a');
  sun.addColorStop(1, '#ef4444');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.36, 115, 0, Math.PI * 2);
  ctx.fill();

  // Distant mountain silhouette
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.62);
  ctx.lineTo(w * 0.18, h * 0.43);
  ctx.lineTo(w * 0.35, h * 0.55);
  ctx.lineTo(w * 0.56, h * 0.39);
  ctx.lineTo(w * 0.78, h * 0.53);
  ctx.lineTo(w * 0.92, h * 0.45);
  ctx.lineTo(w, h * 0.62);
  ctx.closePath();
  ctx.fill();

  // Asphalt highway
  const road = ctx.createLinearGradient(0, h * 0.62, 0, h);
  road.addColorStop(0, '#1f2937');
  road.addColorStop(1, '#090d16');
  ctx.fillStyle = road;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);

  // Muscle Car Body (Metallic Cyan-Blue with shaded curves)
  const carX = w * 0.16;
  const carY = h * 0.48;
  const carW = w * 0.68;
  const carH = h * 0.32;

  // Drop shadow on asphalt
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, carY + carH + 8, carW * 0.52, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cabin roof & windshield
  const cabinGrad = ctx.createLinearGradient(carX + 90, carY - 55, carX + carW - 90, carY + 20);
  cabinGrad.addColorStop(0, '#38bdf8');
  cabinGrad.addColorStop(1, '#0369a1');
  ctx.fillStyle = cabinGrad;
  ctx.beginPath();
  ctx.moveTo(carX + 105, carY + 25);
  ctx.lineTo(carX + 175, carY - 52);
  ctx.lineTo(carX + carW - 145, carY - 52);
  ctx.lineTo(carX + carW - 75, carY + 25);
  ctx.closePath();
  ctx.fill();

  // Windshield glass reflection
  const glass = ctx.createLinearGradient(carX + 140, carY - 45, carX + 260, carY + 20);
  glass.addColorStop(0, '#e0f2fe');
  glass.addColorStop(0.5, '#0284c7');
  glass.addColorStop(1, '#0f172a');
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.moveTo(carX + 122, carY + 22);
  ctx.lineTo(carX + 182, carY - 42);
  ctx.lineTo(carX + carW - 155, carY - 42);
  ctx.lineTo(carX + carW - 95, carY + 22);
  ctx.closePath();
  ctx.fill();

  // Main chassis
  const bodyGrad = ctx.createLinearGradient(carX, carY, carX, carY + carH);
  bodyGrad.addColorStop(0, '#67e8f9');
  bodyGrad.addColorStop(0.35, '#06b6d4');
  bodyGrad.addColorStop(0.8, '#0e7490');
  bodyGrad.addColorStop(1, '#164e63');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(carX, carY + 18, carW, carH - 20, [28, 36, 16, 16]);
  ctx.fill();

  // Racing stripe (vibrant orange-gold)
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(carX + 14, carY + 54, carW - 28, 18);

  // Headlights (glowing warm yellow)
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(carX + carW - 18, carY + 52, 16, 0, Math.PI * 2);
  ctx.fill();

  // Wheels with chrome rims
  const drawWheel = (wx, wy) => {
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(wx, wy, 48, 0, Math.PI * 2);
    ctx.fill();

    const rim = ctx.createRadialGradient(wx - 6, wy - 6, 4, wx, wy, 30);
    rim.addColorStop(0, '#f8fafc');
    rim.addColorStop(0.6, '#94a3b8');
    rim.addColorStop(1, '#334155');
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(wx, wy, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(wx, wy, 9, 0, Math.PI * 2);
    ctx.fill();
  };

  drawWheel(carX + 115, carY + carH - 4);
  drawWheel(carX + carW - 115, carY + carH - 4);
}

function drawMascotScene(ctx, w, h) {
  // Theatrical radial background
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.65);
  bg.addColorStop(0, '#fde047');
  bg.addColorStop(0.55, '#f97316');
  bg.addColorStop(1, '#b91c1c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.54;

  // Long expressive rabbit/toon ears
  const drawEar = (angle, offsetX) => {
    ctx.save();
    ctx.translate(cx + offsetX, cy - 110);
    ctx.rotate(angle);
    const earG = ctx.createLinearGradient(-28, -140, 28, 0);
    earG.addColorStop(0, '#94a3b8');
    earG.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = earG;
    ctx.beginPath();
    ctx.ellipse(0, -70, 30, 88, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.ellipse(0, -65, 16, 66, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawEar(-0.22, -42);
  drawEar(0.22, 42);

  // Head
  const headG = ctx.createRadialGradient(cx - 25, cy - 35, 15, cx, cy, 130);
  headG.addColorStop(0, '#f1f5f9');
  headG.addColorStop(0.65, '#94a3b8');
  headG.addColorStop(1, '#475569');
  ctx.fillStyle = headG;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 115, 102, 0, 0, Math.PI * 2);
  ctx.fill();

  // White muzzle cheeks
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx - 48, cy + 28, 56, 42, -0.1, 0, Math.PI * 2);
  ctx.ellipse(cx + 48, cy + 28, 56, 42, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Big cartoon eyes
  for (const dir of [-1, 1]) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx + dir * 32, cy - 28, 26, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(cx + dir * 26, cy - 24, 12, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx + dir * 22, cy - 32, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pink triangular nose
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 8, 20, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Big cheerful grin + buck teeth
  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.arc(cx, cy + 32, 44, 0.08 * Math.PI, 0.92 * Math.PI);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 19, cy + 35, 17, 24);
  ctx.fillRect(cx + 2, cy + 35, 17, 24);
}

function drawSunsetCityScene(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#0284c7');
  sky.addColorStop(0.45, '#38bdf8');
  sky.addColorStop(0.75, '#fde047');
  sky.addColorStop(1, '#f97316');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Fluffy cumulus clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  const clouds = [
    [w * 0.22, h * 0.22, 46],
    [w * 0.28, h * 0.20, 58],
    [w * 0.35, h * 0.23, 42],
    [w * 0.68, h * 0.18, 52],
    [w * 0.75, h * 0.16, 62],
    [w * 0.82, h * 0.20, 44]
  ];
  ctx.beginPath();
  for (const [cx, cy, r] of clouds) {
    ctx.moveTo(cx + r, cy);
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }
  ctx.fill();

  // Rolling green hills
  const hill1 = ctx.createLinearGradient(0, h * 0.55, 0, h);
  hill1.addColorStop(0, '#22c55e');
  hill1.addColorStop(1, '#15803d');
  ctx.fillStyle = hill1;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.64);
  ctx.quadraticCurveTo(w * 0.3, h * 0.48, w * 0.62, h * 0.66);
  ctx.quadraticCurveTo(w * 0.85, h * 0.75, w, h * 0.58);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Colorful Mediterranean-style buildings in foreground
  const houses = [
    { x: w * 0.12, y: h * 0.54, bw: 95, bh: 140, color: '#f97316', roof: '#b91c1c' },
    { x: w * 0.26, y: h * 0.48, bw: 110, bh: 165, color: '#eab308', roof: '#991b1b' },
    { x: w * 0.43, y: h * 0.56, bw: 100, bh: 135, color: '#ec4899', roof: '#881337' },
    { x: w * 0.60, y: h * 0.50, bw: 115, bh: 160, color: '#06b6d4', roof: '#1e3a8a' }
  ];

  for (const b of houses) {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.bw, b.bh);

    // Pitched roof
    ctx.fillStyle = b.roof;
    ctx.beginPath();
    ctx.moveTo(b.x - 10, b.y);
    ctx.lineTo(b.x + b.bw * 0.5, b.y - 42);
    ctx.lineTo(b.x + b.bw + 10, b.y);
    ctx.closePath();
    ctx.fill();

    // Lit windows
    ctx.fillStyle = '#fef08a';
    for (let wy = b.y + 22; wy < b.y + b.bh - 30; wy += 38) {
      ctx.fillRect(b.x + 18, wy, 22, 26);
      ctx.fillRect(b.x + b.bw - 40, wy, 22, 26);
    }
  }
}

window.MastogradSamples = {
  SAMPLE_SCENES,
  renderSampleSceneToCanvas
};
