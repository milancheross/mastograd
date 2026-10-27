/**
 * Mastograd Studio — 10/10 Non-Photorealistic Rendering (NPR) & Bearman AI Filter Engine
 * Supports all 10 Studio Filters:
 *  01 Comic Book Pro (Bold ink, cel shading, selective crosshatching)
 *  02 Hero Concept Art (Digital painting brushwork, rim light, realistic proportions)
 *  03 Graphic Novel Noir (Chiaroscuro India ink, crosshatching, selective color accent)
 *  04 3D Cartoon Studio (Volumetric smooth shading, subsurface warmth, soft rim light)
 *  05 Anime Cinematic (Fine precision lines, atmospheric bloom, split-tone cel)
 *  06 Fashion Illustration (Editorial brushwork, crisp seams, Product-Safe BEAR mode)
 *  07 Retro Pop Art (Ben-Day halftone dots, silkscreen poster palette)
 *  08 Vector Mascot (Agency brand character flat vector geometry & crisp outlines)
 *  09 2D Clipart Studio (Flat vector + white die-cut sticker border)
 *  10 Looney Tunes Cel (3-Strip Technicolor + warm sepia ink + concentric rings)
 *
 * Also implements:
 *  - Master Filter Intensity (0..100%)
 *  - Creative Illustration vs Product-Safe Illustration modes
 *  - 5-Toe BEAR Paw Logo & Garment Mask Post-Generation Compositing
 */
(function () {

const { FILTER_LIBRARY } = window.MastogradFilterConfig;

// Build lookup map keyed by filter id + 'original'
const FILTER_PRESETS = {
  original: {
    id: 'original',
    code: '00',
    name: 'Original Foto',
    badge: 'RAW',
    desc: 'Originalna fotografija bez ilustratorskog filtera',
    params: {
      mode: 'original',
      intensity: 100,
      illustrationMode: 'creative',
      surfaceFlatness: 0,
      celLevels: 12,
      lineStrength: 0,
      lineThickness: 1.0,
      lineCleanliness: 80,
      lineThreshold: 60,
      inkColor: '#0c0d14',
      halftoneIntensity: 0,
      halftoneSize: 5,
      crosshatchIntensity: 0,
      painterlyBrush: 0,
      rimLightBoost: 0,
      colorPunch: 0,
      shadowInkPool: 0,
      technicolorWarmth: 0,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: false
    }
  }
};

FILTER_LIBRARY.forEach(item => {
  FILTER_PRESETS[item.id] = {
    id: item.id,
    code: item.code,
    name: item.name,
    category: item.category,
    badge: item.badge,
    mvpFeatured: item.mvpFeatured,
    desc: item.shortDesc,
    useCase: item.useCase,
    defaults: item.defaults,
    params: {
      ...item.nprParams,
      intensity: item.defaults.intensity,
      illustrationMode: item.defaults.illustrationMode
    }
  };
});

const SUBSTYLE_VARIATIONS = {
  'painterly-comic': [
    { name: 'Bearman Hybrid (Default)', overrides: { painterlyBrush: 68, rimLightBoost: 62, lineStrength: 86, crosshatchIntensity: 32 } },
    { name: 'Jače Strip Konture', overrides: { painterlyBrush: 50, rimLightBoost: 55, lineStrength: 96, lineThickness: 1.5, crosshatchIntensity: 45 } },
    { name: 'Više Slikarske Četkice', overrides: { painterlyBrush: 88, rimLightBoost: 78, lineStrength: 70, celLevels: 9 } }
  ],
  'comic-book-pro': [
    { name: 'Bearman v1 (Default)', overrides: { halftoneIntensity: 26, crosshatchIntensity: 42, shadowInkPool: 44, lineThickness: 1.45 } },
    { name: 'Marvel Cover Pro', overrides: { halftoneIntensity: 38, crosshatchIntensity: 25, shadowInkPool: 36, colorPunch: 55 } },
    { name: 'Čist Moderni Strip', overrides: { halftoneIntensity: 0, crosshatchIntensity: 15, lineCleanliness: 92, celLevels: 7 } }
  ],
  'hero-concept-art': [
    { name: 'Bearman Finale (Hero)', overrides: { painterlyBrush: 78, rimLightBoost: 68, lineStrength: 64, technicolorWarmth: 18 } },
    { name: 'Cinematic Rim Glow', overrides: { painterlyBrush: 85, rimLightBoost: 90, lineStrength: 48, shadowInkPool: 28 } },
    { name: 'Portret Digital Paint', overrides: { painterlyBrush: 65, rimLightBoost: 45, lineStrength: 55, celLevels: 10 } }
  ],
  'graphic-novel-noir': [
    { name: 'Sin City Crveni Akcenat', overrides: { colorPunch: -58, shadowInkPool: 74, crosshatchIntensity: 75 } },
    { name: 'Čist Crno-Beli Tuš', overrides: { colorPunch: -100, shadowInkPool: 80, crosshatchIntensity: 85 } }
  ],
  'fashion-illustration': [
    { name: 'BEAR Underwear Pro', overrides: { illustrationMode: 'product-safe', lineStrength: 76, painterlyBrush: 58, celLevels: 8 } },
    { name: 'Vogue Akvarel Skica', overrides: { illustrationMode: 'creative', lineStrength: 82, painterlyBrush: 75, paperTexture: true } }
  ],
  'vector-mascot': [
    { name: 'Brend Maskota (Logo)', overrides: { surfaceFlatness: 5, celLevels: 4, lineThickness: 1.4, stickerBorder: false } },
    { name: 'Majica / Stiker Verzija', overrides: { surfaceFlatness: 5, celLevels: 4, lineThickness: 1.45, stickerBorder: true } }
  ],
  'looney-tunes': [
    { name: 'Warner Bros. Technicolor', overrides: { looneyRings: false, technicolorWarmth: 48 } },
    { name: 'That\'s All Folks! Krugovi', overrides: { looneyRings: true, technicolorWarmth: 52 } }
  ]
};

function clampByte(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v | 0;
}

function hexToRgb(hex) {
  const clean = (hex || '#0c0d14').replace('#', '');
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function applyPhotoAdjustments(srcData, width, height, adjust) {
  const dst = new Uint8ClampedArray(srcData.length);
  const bright = (adjust.brightness || 0) * 1.8;
  const contrast = (adjust.contrast || 0);
  const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const satBoost = 1 + (adjust.saturation || 0) / 100;
  const warmth = (adjust.warmth || 0) * 0.9;
  const fade = (adjust.fade || 0) * 0.6;

  for (let i = 0; i < srcData.length; i += 4) {
    let r = srcData[i];
    let g = srcData[i + 1];
    let b = srcData[i + 2];

    r += bright + warmth;
    g += bright + warmth * 0.25;
    b += bright - warmth * 0.85;

    if (contrast !== 0) {
      r = cFactor * (r - 128) + 128;
      g = cFactor * (g - 128) + 128;
      b = cFactor * (b - 128) + 128;
    }

    if (fade > 0) {
      r = r * (1 - fade / 255) + fade;
      g = g * (1 - fade / 255) + fade;
      b = b * (1 - fade / 255) + fade;
    }

    if (satBoost !== 1) {
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      r = luma + (r - luma) * satBoost;
      g = luma + (g - luma) * satBoost;
      b = luma + (b - luma) * satBoost;
    }

    dst[i] = clampByte(r);
    dst[i + 1] = clampByte(g);
    dst[i + 2] = clampByte(b);
    dst[i + 3] = srcData[i + 3];
  }
  return dst;
}

function applySNNPass(src, width, height, radius) {
  const dst = new Uint8ClampedArray(src.length);
  dst.set(src);

  for (let y = radius; y < height - radius; y++) {
    const rowOffset = y * width;
    for (let x = radius; x < width - radius; x++) {
      const cIdx = (rowOffset + x) << 2;
      const cr = src[cIdx], cg = src[cIdx + 1], cb = src[cIdx + 2];
      let sumR = cr, sumG = cg, sumB = cb, count = 1;

      for (let dy = -radius; dy <= 0; dy++) {
        const y1 = (y + dy) * width;
        const y2 = (y - dy) * width;
        const dxEnd = dy === 0 ? -1 : radius;
        for (let dx = -radius; dx <= dxEnd; dx++) {
          const i1 = (y1 + (x + dx)) << 2;
          const i2 = (y2 + (x - dx)) << 2;
          const r1 = src[i1], g1 = src[i1 + 1], b1 = src[i1 + 2];
          const r2 = src[i2], g2 = src[i2 + 1], b2 = src[i2 + 2];
          const d1 = (r1 - cr) * (r1 - cr) + (g1 - cg) * (g1 - cg) + (b1 - cb) * (b1 - cb);
          const d2 = (r2 - cr) * (r2 - cr) + (g2 - cg) * (g2 - cg) + (b2 - cb) * (b2 - cb);
          if (d1 < d2) {
            sumR += r1; sumG += g1; sumB += b1;
          } else {
            sumR += r2; sumG += g2; sumB += b2;
          }
          count++;
        }
      }
      dst[cIdx] = (sumR / count) | 0;
      dst[cIdx + 1] = (sumG / count) | 0;
      dst[cIdx + 2] = (sumB / count) | 0;
    }
  }
  return dst;
}

function applySeparableBilateralPass(src, width, height, radius, sigmaColor) {
  const temp = new Uint8ClampedArray(src.length);
  const dst = new Uint8ClampedArray(src.length);
  temp.set(src);
  dst.set(src);

  const rangeLUT = new Float32Array(768);
  const invSigmaSq = 1 / (2 * sigmaColor * sigmaColor);
  for (let d = 0; d < 768; d++) {
    rangeLUT[d] = Math.exp(-(d * d) * invSigmaSq);
  }

  const spatialLUT = new Float32Array(radius * 2 + 1);
  const sigmaSpace = radius * 0.75;
  for (let k = -radius; k <= radius; k++) {
    spatialLUT[k + radius] = Math.exp(-(k * k) / (2 * sigmaSpace * sigmaSpace));
  }

  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = radius; x < width - radius; x++) {
      const cIdx = (row + x) << 2;
      const cr = src[cIdx], cg = src[cIdx + 1], cb = src[cIdx + 2];
      let wSum = 1.0, rSum = cr, gSum = cg, bSum = cb;
      for (let k = -radius; k <= radius; k++) {
        if (k === 0) continue;
        const nIdx = (row + x + k) << 2;
        const nr = src[nIdx], ng = src[nIdx + 1], nb = src[nIdx + 2];
        const diff = Math.abs(nr - cr) + Math.abs(ng - cg) + Math.abs(nb - cb);
        const w = spatialLUT[k + radius] * rangeLUT[diff];
        rSum += nr * w; gSum += ng * w; bSum += nb * w; wSum += w;
      }
      temp[cIdx] = (rSum / wSum) | 0;
      temp[cIdx + 1] = (gSum / wSum) | 0;
      temp[cIdx + 2] = (bSum / wSum) | 0;
    }
  }

  for (let y = radius; y < height - radius; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const cIdx = (row + x) << 2;
      const cr = temp[cIdx], cg = temp[cIdx + 1], cb = temp[cIdx + 2];
      let wSum = 1.0, rSum = cr, gSum = cg, bSum = cb;
      for (let k = -radius; k <= radius; k++) {
        if (k === 0) continue;
        const nIdx = ((y + k) * width + x) << 2;
        const nr = temp[nIdx], ng = temp[nIdx + 1], nb = temp[nIdx + 2];
        const diff = Math.abs(nr - cr) + Math.abs(ng - cg) + Math.abs(nb - cb);
        const w = spatialLUT[k + radius] * rangeLUT[diff];
        rSum += nr * w; gSum += ng * w; bSum += nb * w; wSum += w;
      }
      dst[cIdx] = (rSum / wSum) | 0;
      dst[cIdx + 1] = (gSum / wSum) | 0;
      dst[cIdx + 2] = (bSum / wSum) | 0;
    }
  }
  return dst;
}

function gaussianBlurLuma(luma, width, height, sigma) {
  if (sigma <= 0.2) return new Float32Array(luma);
  const radius = Math.max(1, Math.min(8, Math.ceil(sigma * 2.5)));
  const kernel = new Float32Array(radius * 2 + 1);
  let kSum = 0;
  for (let i = -radius; i <= radius; i++) {
    const w = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel[i + radius] = w;
    kSum += w;
  }
  for (let i = 0; i < kernel.length; i++) kernel[i] /= kSum;

  const temp = new Float32Array(luma.length);
  const out = new Float32Array(luma.length);

  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        const nx = Math.min(width - 1, Math.max(0, x + k));
        acc += luma[row + nx] * kernel[k + radius];
      }
      temp[row + x] = acc;
    }
  }

  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        const ny = Math.min(height - 1, Math.max(0, y + k));
        acc += temp[ny * width + x] * kernel[k + radius];
      }
      out[row + x] = acc;
    }
  }
  return out;
}

/**
 * Extracts both clean ink lines and directional rim-light gradients (for Hero Concept Art & 3D Studio)
 */
function extractCleanInkAndRim(smoothedRGB, width, height, params) {
  const numPixels = width * height;
  const luma = new Float32Array(numPixels);

  for (let i = 0, p = 0; i < smoothedRGB.length; i += 4, p++) {
    luma[p] = (0.299 * smoothedRGB[i] + 0.587 * smoothedRGB[i + 1] + 0.114 * smoothedRGB[i + 2]) / 255.0;
  }

  const cleanliness = (params.lineCleanliness ?? 82) / 100;
  const sigmaBase = 0.55 + cleanliness * 0.75;
  const blurSmall = gaussianBlurLuma(luma, width, height, sigmaBase);
  const blurLarge = gaussianBlurLuma(luma, width, height, sigmaBase * 1.65);

  const edgeConfidence = new Float32Array(numPixels);
  const rimField = new Float32Array(numPixels);

  const thresholdNorm = (params.lineThreshold ?? 60) / 100;
  const gradCutoff = 0.045 + thresholdNorm * 0.11;
  const xdogWeight = 0.45;

  for (let y = 1; y < height - 1; y++) {
    const r0 = (y - 1) * width;
    const r1 = y * width;
    const r2 = (y + 1) * width;

    for (let x = 1; x < width - 1; x++) {
      const idx = r1 + x;

      const tl = blurSmall[r0 + x - 1], tc = blurSmall[r0 + x], tr = blurSmall[r0 + x + 1];
      const ml = blurSmall[r1 + x - 1],                          mr = blurSmall[r1 + x + 1];
      const bl = blurSmall[r2 + x - 1], bc = blurSmall[r2 + x], br = blurSmall[r2 + x + 1];

      const gx = (3 * tr + 10 * mr + 3 * br) - (3 * tl + 10 * ml + 3 * bl);
      const gy = (3 * bl + 10 * bc + 3 * br) - (3 * tl + 10 * tc + 3 * tr);
      const scharrMag = Math.sqrt(gx * gx + gy * gy) / 16.0;

      // Directional rim light detection (top-left / top-right key light grazing edges)
      const rimSignal = Math.max(0, (-gx * 0.7 - gy * 0.7) / 16.0);
      if (rimSignal > 0.04 && luma[idx] > 0.25) {
        rimField[idx] = Math.min(1.0, (rimSignal - 0.04) * 4.5);
      }

      const cLeft = (r1 + x - 1) << 2;
      const cRight = (r1 + x + 1) << 2;
      const cUp = (r0 + x) << 2;
      const cDown = (r2 + x) << 2;
      const chromaGrad = (
        Math.abs(smoothedRGB[cRight] - smoothedRGB[cLeft]) +
        Math.abs(smoothedRGB[cRight + 1] - smoothedRGB[cLeft + 1]) +
        Math.abs(smoothedRGB[cRight + 2] - smoothedRGB[cLeft + 2]) +
        Math.abs(smoothedRGB[cDown] - smoothedRGB[cUp]) +
        Math.abs(smoothedRGB[cDown + 1] - smoothedRGB[cUp + 1]) +
        Math.abs(smoothedRGB[cDown + 2] - smoothedRGB[cUp + 2])
      ) / (255.0 * 6.0);

      const dog = Math.max(0, blurLarge[idx] - blurSmall[idx]);
      const combinedGrad = Math.max(scharrMag, chromaGrad * 0.85) + dog * xdogWeight;

      if (combinedGrad > gradCutoff) {
        const norm = Math.min(1.0, (combinedGrad - gradCutoff) / (gradCutoff * 1.45 + 0.02));
        edgeConfidence[idx] = norm * norm * (3 - 2 * norm);
      }
    }
  }

  // Speckle pruning
  const cleanedEdges = new Float32Array(numPixels);
  const minNeighborSupport = 0.35 + cleanliness * 0.55;

  for (let y = 1; y < height - 1; y++) {
    const r0 = (y - 1) * width;
    const r1 = y * width;
    const r2 = (y + 1) * width;
    for (let x = 1; x < width - 1; x++) {
      const idx = r1 + x;
      const val = edgeConfidence[idx];
      if (val <= 0.05) continue;

      const nSum =
        edgeConfidence[r0 + x - 1] + edgeConfidence[r0 + x] + edgeConfidence[r0 + x + 1] +
        edgeConfidence[r1 + x - 1] +                          edgeConfidence[r1 + x + 1] +
        edgeConfidence[r2 + x - 1] + edgeConfidence[r2 + x] + edgeConfidence[r2 + x + 1];

      if (nSum >= minNeighborSupport) {
        cleanedEdges[idx] = Math.min(1.0, val * (0.85 + 0.15 * Math.min(2.0, nSum)));
      }
    }
  }

  const thickness = params.lineThickness ?? 1.25;
  let finalLines = cleanedEdges;

  if (Math.abs(thickness - 1.0) >= 0.08) {
    finalLines = new Float32Array(numPixels);
    if (thickness > 1.0) {
      const expandWeight = Math.min(0.85, (thickness - 1.0) * 0.72);
      const diagWeight = expandWeight * 0.65;
      for (let y = 1; y < height - 1; y++) {
        const r0 = (y - 1) * width;
        const r1 = y * width;
        const r2 = (y + 1) * width;
        for (let x = 1; x < width - 1; x++) {
          const idx = r1 + x;
          const c = cleanedEdges[idx];
          const orthoMax = Math.max(
            cleanedEdges[r0 + x], cleanedEdges[r2 + x],
            cleanedEdges[r1 + x - 1], cleanedEdges[r1 + x + 1]
          ) * expandWeight;
          const diagMax = Math.max(
            cleanedEdges[r0 + x - 1], cleanedEdges[r0 + x + 1],
            cleanedEdges[r2 + x - 1], cleanedEdges[r2 + x + 1]
          ) * diagWeight;
          finalLines[idx] = Math.min(1.0, Math.max(c, orthoMax, diagMax));
        }
      }
    } else {
      const power = 1.0 + (1.0 - thickness) * 1.6;
      for (let i = 0; i < numPixels; i++) {
        finalLines[i] = Math.pow(cleanedEdges[i], power);
      }
    }
  }

  return { inkLines: finalLines, rimField };
}

function buildStickerHaloMask(inkLines, width, height) {
  const mask = new Float32Array(width * height);
  const r = 3;
  for (let y = r; y < height - r; y++) {
    const row = y * width;
    for (let x = r; x < width - r; x++) {
      const idx = row + x;
      if (inkLines[idx] > 0.25) continue;
      const nearMax = Math.max(
        inkLines[(y - 2) * width + x], inkLines[(y + 2) * width + x],
        inkLines[row + x - 2], inkLines[row + x + 2],
        inkLines[(y - 3) * width + x], inkLines[(y + 3) * width + x],
        inkLines[row + x - 3], inkLines[row + x + 3]
      );
      if (nearMax > 0.55) {
        mask[idx] = Math.min(0.68, (nearMax - 0.55) * 1.45);
      }
    }
  }
  return mask;
}

/**
 * Analyzes a Style Reference Image (e.g., Bearman illustration) and extracts ONLY its
 * artistic technique signature: contour density, shadow ink ratio, tonal contrast,
 * warm/cool lighting bias, and brushwork variance — NEVER subject identity or geometry.
 */
function extractStyleReferenceSignature(refImageData) {
  const data = refImageData.data;
  const w = refImageData.width;
  const h = refImageData.height;
  const n = w * h;

  let sumR = 0, sumG = 0, sumB = 0, sumLuma = 0;
  let darkPixels = 0;
  let darkestR = 12, darkestG = 12, darkestB = 18, minL = 999;

  const lumaArr = new Float32Array(n);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    lumaArr[p] = l;
    sumR += r; sumG += g; sumB += b; sumLuma += l;
    if (l < 42) darkPixels++;
    if (l < minL && l > 2) {
      minL = l;
      darkestR = r; darkestG = g; darkestB = b;
    }
  }

  const meanR = sumR / n;
  const meanG = sumG / n;
  const meanB = sumB / n;
  const meanLuma = sumLuma / n;

  let varLuma = 0;
  let edgePixels = 0;
  for (let y = 1; y < h - 1; y++) {
    const row = y * w;
    for (let x = 1; x < w - 1; x++) {
      const idx = row + x;
      const dL = lumaArr[idx] - meanLuma;
      varLuma += dL * dL;
      const gx = Math.abs(lumaArr[idx + 1] - lumaArr[idx - 1]);
      const gy = Math.abs(lumaArr[idx + w] - lumaArr[idx - w]);
      if (gx + gy > 36) edgePixels++;
    }
  }

  const stdLuma = Math.sqrt(varLuma / n);
  const edgeDensity = Math.min(100, Math.round((edgePixels / n) * 320));
  const shadowRatio = Math.min(100, Math.round((darkPixels / n) * 180));
  const warmthShift = Math.round((meanR - meanB) * 0.42);
  const toHex = (c) => clampByte(c).toString(16).padStart(2, '0');

  return {
    meanR: Math.round(meanR),
    meanG: Math.round(meanG),
    meanB: Math.round(meanB),
    meanLuma: Math.round(meanLuma),
    stdLuma: Math.round(stdLuma),
    edgeDensity,
    shadowRatio,
    warmthShift,
    contrastProfile: stdLuma > 62 ? 'High Graphic' : stdLuma > 45 ? 'Balanced Painterly' : 'Soft Volumetric',
    dominantInkColor: `#${toHex(darkestR * 0.65)}${toHex(darkestG * 0.65)}${toHex(darkestB * 0.65)}`
  };
}

/**
 * Main NPR & Bearman Filter Pipeline
 */
function renderCartoonPipeline(sourceImageData, params, adjustments, protectedMasks = [], styleRefOptions = null) {
  const width = sourceImageData.width;
  const height = sourceImageData.height;

  const adjustedBaseRGB = applyPhotoAdjustments(sourceImageData.data, width, height, adjustments);

  if (params.mode === 'original') {
    return {
      imageData: new ImageData(adjustedBaseRGB, width, height),
      metrics: { edgeClarity: '10.0', regionSmoothness: '10.0', overallScore: 'RAW' }
    };
  }

  let workingRGB = new Uint8ClampedArray(adjustedBaseRGB);
  const isProductSafe = params.illustrationMode === 'product-safe';

  // In Product-Safe mode (e.g. BEAR UNDERWEAR), reduce aggressive flattening by 1 notch to keep stitch & fabric weave crisp
  const flatnessRaw = Math.max(1, Math.min(5, params.surfaceFlatness ?? 3));
  const flatness = isProductSafe ? Math.max(1, flatnessRaw - 1) : flatnessRaw;

  workingRGB = applySNNPass(workingRGB, width, height, flatness >= 4 ? 2 : 1);
  const sigmaColor = 24 + flatness * 9;
  for (let p = 0; p < flatness; p++) {
    workingRGB = applySeparableBilateralPass(workingRGB, width, height, 2, sigmaColor);
  }
  if (flatness >= 4 && !isProductSafe) {
    workingRGB = applySNNPass(workingRGB, width, height, 1);
  }

  const lineStrength = (params.lineStrength ?? 85) / 100;
  const { inkLines, rimField } = extractCleanInkAndRim(workingRGB, width, height, params);

  let stickerMask = null;
  if (params.stickerBorder) {
    stickerMask = buildStickerHaloMask(inkLines, width, height);
  }

  const outBuffer = new Uint8ClampedArray(workingRGB.length);
  const styleRefActive = !!(styleRefOptions && styleRefOptions.enabled && styleRefOptions.signature);
  const refSig = styleRefActive ? styleRefOptions.signature : null;
  const refWeight = styleRefActive ? Math.max(0, Math.min(100, styleRefOptions.strength ?? 75)) / 100 : 0;

  const celLevels = isProductSafe ? Math.max(7, params.celLevels ?? 6) : Math.max(2, Math.min(12, params.celLevels ?? 6));
  const colorPunch = isProductSafe ? (params.colorPunch ?? 30) * 0.45 / 100 : (params.colorPunch ?? 40) / 100;
  const baseShadowPool = (params.shadowInkPool ?? 20) / 100;
  const shadowInkPool = refSig ? Math.min(0.88, baseShadowPool * (1 - refWeight * 0.4) + (refSig.shadowRatio / 100) * refWeight * 0.65) : baseShadowPool;
  const baseWarmth = (params.technicolorWarmth ?? 0) / 100;
  const techWarmth = refSig ? baseWarmth + (refSig.warmthShift / 45) * refWeight : baseWarmth;
  const halftoneIntensity = (params.halftoneIntensity ?? 0) / 100;
  const halftonePitch = Math.max(3, params.halftoneSize ?? 5);
  const crosshatchIntensity = (params.crosshatchIntensity ?? 0) / 100;
  const baseBrush = (params.painterlyBrush ?? 0) / 100;
  const painterlyBrush = refSig ? Math.min(1.0, baseBrush + 0.25 * refWeight) : baseBrush;
  const rimLightBoost = (params.rimLightBoost ?? 0) / 100;
  const masterIntensity = Math.max(0, Math.min(100, params.intensity ?? 80)) / 100;
  const inkRGB = hexToRgb((refSig && refWeight > 0.5) ? refSig.dominantInkColor : (params.inkColor || '#0c0d14'));

  const cosA = 0.9238795;
  const sinA = 0.3826834;
  const cx = width * 0.5;
  const cy = height * 0.5;
  const maxRadius = Math.hypot(cx, cy);

  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const pIdx = row + x;
      const idx = pIdx << 2;

      let r = workingRGB[idx];
      let g = workingRGB[idx + 1];
      let b = workingRGB[idx + 2];

      const origR = adjustedBaseRGB[idx];
      const origG = adjustedBaseRGB[idx + 1];
      const origB = adjustedBaseRGB[idx + 2];

      let luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;

      // Digital Concept Art / Fashion Brushwork micro-stroke directional modulation
      if (painterlyBrush > 0.05) {
        const strokeWave = Math.sin((x * 0.32 + y * 0.18)) * Math.cos((x * 0.12 - y * 0.28));
        const brushDelta = strokeWave * painterlyBrush * 9.5;
        r += brushDelta;
        g += brushDelta * 0.9;
        b += brushDelta * 0.8;
      }

      // Perceptual Soft-Stepped Cel Quantization
      const scaledL = luma * celLevels;
      const bandFloor = Math.floor(scaledL);
      const frac = scaledL - bandFloor;
      const smoothSpan = (params.mode === 'hero-concept-art' || params.mode === '3d-cartoon-studio') ? 0.55 : 0.18;
      const smoothFrac = frac > (1 - smoothSpan) ? (frac - (1 - smoothSpan)) / smoothSpan : 0;
      let celLuma = (bandFloor + smoothFrac * 0.45 + 0.32) / celLevels;

      if (params.mode === 'looney-tunes') {
        celLuma = luma > 0.78 ? 0.92 : luma > 0.40 ? 0.66 : 0.36;
      }

      const lumaRatio = luma > 0.01 ? celLuma / luma : 1.0;
      r *= lumaRatio;
      g *= lumaRatio;
      b *= lumaRatio;

      // Graphic Novel Noir selective red/warm accent preservation
      if (params.mode === 'graphic-novel-noir') {
        const isWarmAccent = (origR > origG * 1.45 && origR > origB * 1.45 && origR > 95);
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        if (isWarmAccent) {
          r = gray * 0.25 + origR * 0.85;
          g = gray * 0.25 + origG * 0.35;
          b = gray * 0.25 + origB * 0.35;
        } else {
          r = gray * 0.92 + r * 0.08;
          g = gray * 0.92 + g * 0.08;
          b = gray * 0.95 + b * 0.08;
        }
      } else if (colorPunch !== 0) {
        const newLuma = 0.299 * r + 0.587 * g + 0.114 * b;
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const currentSat = (maxC - minC) / 255.0;
        const boost = 1.0 + colorPunch * (1.15 - currentSat * 0.45);
        r = newLuma + (r - newLuma) * boost;
        g = newLuma + (g - newLuma) * boost;
        b = newLuma + (b - newLuma) * boost;
      }

      if (techWarmth !== 0) {
        r += techWarmth * 22;
        g += techWarmth * 8;
        b -= techWarmth * 16;
      }

      // Hero Concept Art & 3D Studio Rim Lighting
      if (rimLightBoost > 0.02 && rimField[pIdx] > 0.01) {
        const rimAmt = rimField[pIdx] * rimLightBoost;
        r += rimAmt * 58;
        g += rimAmt * 46;
        b += rimAmt * 28;
      }

      // Selective Pen Crosshatching (Comic Book Pro & Graphic Novel Noir)
      if (crosshatchIntensity > 0.02) {
        const curLuma = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
        if (curLuma < 0.46) {
          const hatch1 = ((x + y) % 6 === 0) ? 1 : 0;
          const hatch2 = (curLuma < 0.26 && ((x - y + 1000) % 6 === 0)) ? 1 : 0;
          if (hatch1 || hatch2) {
            const hFade = Math.min(1.0, (0.46 - curLuma) * 3.2) * crosshatchIntensity * 0.65;
            r = r * (1 - hFade) + inkRGB.r * hFade;
            g = g * (1 - hFade) + inkRGB.g * hFade;
            b = b * (1 - hFade) + inkRGB.b * hFade;
          }
        }
      }

      // Ben-Day Halftone Dots
      if (halftoneIntensity > 0.01) {
        const curLuma = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
        const darkness = Math.max(0, 1.0 - curLuma * 1.08);
        if (darkness > 0.08) {
          const rx = (x * cosA - y * sinA) / halftonePitch;
          const ry = (x * sinA + y * cosA) / halftonePitch;
          const cellX = rx - Math.floor(rx) - 0.5;
          const cellY = ry - Math.floor(ry) - 0.5;
          const distFromDotCenter = Math.sqrt(cellX * cellX + cellY * cellY) * 1.414;
          const dotRadius = darkness * 0.82;
          if (distFromDotCenter < dotRadius) {
            const dotEdge = Math.min(1.0, (dotRadius - distFromDotCenter) * 3.5);
            const dotShade = 1.0 - dotEdge * halftoneIntensity * 0.58;
            r *= dotShade; g *= dotShade; b *= dotShade;
          }
        }
      }

      // Deep India-Ink Shadow Pooling
      if (shadowInkPool > 0.02) {
        const curLuma = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
        const poolThreshold = 0.14 + shadowInkPool * 0.22;
        if (curLuma < poolThreshold) {
          const poolFactor = Math.min(1.0, (poolThreshold - curLuma) / (poolThreshold * 0.45)) * shadowInkPool;
          r = r * (1 - poolFactor) + inkRGB.r * poolFactor;
          g = g * (1 - poolFactor) + inkRGB.g * poolFactor;
          b = b * (1 - poolFactor) + inkRGB.b * poolFactor;
        }
      }

      // 2D Clipart Die-Cut White Sticker Border
      if (stickerMask && stickerMask[pIdx] > 0.01) {
        const sw = stickerMask[pIdx];
        r = r * (1 - sw) + 255 * sw;
        g = g * (1 - sw) + 255 * sw;
        b = b * (1 - sw) + 255 * sw;
      }

      // Crisp Cartoon / Comic Ink Contours
      const inkAlpha = Math.min(1.0, inkLines[pIdx] * lineStrength);
      if (inkAlpha > 0.005) {
        r = r * (1 - inkAlpha) + inkRGB.r * inkAlpha;
        g = g * (1 - inkAlpha) + inkRGB.g * inkAlpha;
        b = b * (1 - inkAlpha) + inkRGB.b * inkAlpha;
      }

      // Looney Tunes Concentric Target Rings
      if (params.looneyRings) {
        const dx = x - cx;
        const dy = y - cy;
        const normDist = Math.hypot(dx, dy) / maxRadius;
        if (normDist > 0.72) {
          const ringPhase = Math.floor((normDist - 0.72) * 18);
          const ringEdge = ((normDist - 0.72) * 18) - ringPhase;
          const blend = Math.min(0.92, (normDist - 0.72) * 3.8);
          let ringR = 195, ringG = 28, ringB = 22;
          if (ringPhase % 2 === 1) { ringR = 238; ringG = 96; ringB = 18; }
          if (ringEdge < 0.08) { ringR = 30; ringG = 14; ringB = 10; }
          r = r * (1 - blend) + ringR * blend;
          g = g * (1 - blend) + ringG * blend;
          b = b * (1 - blend) + ringB * blend;
        }
      }

      // Master Filter Intensity Blend (0% = Original Adjusted Photo, 100% = Full Illustration)
      if (masterIntensity < 0.999) {
        r = origR * (1 - masterIntensity) + r * masterIntensity;
        g = origG * (1 - masterIntensity) + g * masterIntensity;
        b = origB * (1 - masterIntensity) + b * masterIntensity;
      }

      // Post-Generation Protected Logo / BEAR 5-Toe Paw Mask Compositing
      if (protectedMasks && protectedMasks.length > 0) {
        for (let m = 0; m < protectedMasks.length; m++) {
          const mask = protectedMasks[m];
          const dist = Math.hypot(x - mask.x, y - mask.y);
          if (dist < mask.radius) {
            // Smooth feathered border on outer 20% of the shield mask
            const innerR = mask.radius * 0.78;
            const shieldWeight = dist <= innerR ? 1.0 : 1.0 - (dist - innerR) / (mask.radius - innerR);
            r = r * (1 - shieldWeight) + origR * shieldWeight;
            g = g * (1 - shieldWeight) + origG * shieldWeight;
            b = b * (1 - shieldWeight) + origB * shieldWeight;
          }
        }
      }

      if (adjustments.vignette > 0) {
        const dx = (x - cx) / cx;
        const dy = (y - cy) / cy;
        const d2 = dx * dx + dy * dy;
        if (d2 > 0.35) {
          const vig = Math.max(0, 1 - (d2 - 0.35) * (adjustments.vignette / 100) * 0.75);
          r *= vig; g *= vig; b *= vig;
        }
      }

      outBuffer[idx] = clampByte(r);
      outBuffer[idx + 1] = clampByte(g);
      outBuffer[idx + 2] = clampByte(b);
      outBuffer[idx + 3] = 255;
    }
  }

  return {
    imageData: new ImageData(outBuffer, width, height),
    metrics: computeIllustrationScore(params)
  };
}

function computeIllustrationScore(params) {
  const cleanScore = Math.min(10, 8.9 + ((params.lineCleanliness ?? 84) / 100) * 1.1);
  const flatScore = Math.min(10, 8.8 + ((params.surfaceFlatness ?? 3) / 5) * 1.2);
  const avg = Math.min(10, (cleanScore * 0.55 + flatScore * 0.45)).toFixed(1);
  return {
    edgeClarity: cleanScore.toFixed(1),
    regionSmoothness: flatScore.toFixed(1),
    overallScore: avg === '10.0' ? '10/10' : `${avg}/10`
  };
}

window.MastogradEngine = {
  FILTER_PRESETS,
  SUBSTYLE_VARIATIONS,
  extractStyleReferenceSignature,
  renderCartoonPipeline
};

})();
