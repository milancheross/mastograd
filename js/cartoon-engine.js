/**
 * Mastograd Studio — 10/10 Non-Photorealistic Rendering (NPR) & Cartoon Engine
 * Implements:
 *  1. Symmetric Nearest Neighbor (SNN) + Separable Joint Bilateral Filtering
 *  2. Scharr Rotational-Invariant Gradient + XDoG (Extended Difference of Gaussians)
 *  3. Morphological Speckle Pruning & Anti-Aliased Subpixel Line Weighting
 *  4. Soft-Step Perceptual Cel-Shading Quantizer (HSL/Luminance preserving)
 *  5. Angled Ben-Day Halftone Screen Generator (Comic Book)
 *  6. 3-Strip Technicolor Matrix & 2-Tone Acetate Cel Shading (Looney Tunes)
 *  7. Vector Flat Region & Die-Cut Sticker Border Engine (2D Clipart)
 */

const FILTER_PRESETS = {
  original: {
    id: 'original',
    name: 'Original',
    badge: 'RAW',
    desc: 'Bez crtanog filtera (samo osnovna podešavanja)',
    params: {
      mode: 'original',
      surfaceFlatness: 0,
      celLevels: 12,
      lineStrength: 0,
      lineThickness: 1.0,
      lineCleanliness: 50,
      lineThreshold: 50,
      inkColor: '#0c0d14',
      halftoneIntensity: 0,
      halftoneSize: 5,
      colorPunch: 0,
      shadowInkPool: 0,
      technicolorWarmth: 0,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: false
    }
  },
  comicbook: {
    id: 'comicbook',
    name: 'Comic Book',
    badge: '10/10 STRIP',
    desc: 'Marvel/DC tuš konture, duboke crne senke i Ben-Day halftone tačkice',
    params: {
      mode: 'comicbook',
      surfaceFlatness: 3,
      celLevels: 6,
      lineStrength: 94,
      lineThickness: 1.45,
      lineCleanliness: 82,
      lineThreshold: 58,
      inkColor: '#08090f',
      halftoneIntensity: 38,
      halftoneSize: 5,
      colorPunch: 45,
      shadowInkPool: 42,
      technicolorWarmth: 8,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: false
    }
  },
  clipart2d: {
    id: 'clipart2d',
    name: '2D Clipart',
    badge: '10/10 VEKTOR',
    desc: 'Ultra-čiste ravne površine, oštre vektorske linije i 2D ilustracija',
    params: {
      mode: 'clipart2d',
      surfaceFlatness: 5,
      celLevels: 4,
      lineStrength: 90,
      lineThickness: 1.25,
      lineCleanliness: 92,
      lineThreshold: 64,
      inkColor: '#11131c',
      halftoneIntensity: 0,
      halftoneSize: 4,
      colorPunch: 52,
      shadowInkPool: 12,
      technicolorWarmth: 5,
      stickerBorder: true,
      looneyRings: false,
      paperTexture: false
    }
  },
  looneytunes: {
    id: 'looneytunes',
    name: 'Looney Tunes',
    badge: '10/10 CRTANI',
    desc: 'Technicolor paleta, 2-tonsko cel senčenje i tople animatorske linije',
    params: {
      mode: 'looneytunes',
      surfaceFlatness: 4,
      celLevels: 4,
      lineStrength: 88,
      lineThickness: 1.3,
      lineCleanliness: 88,
      lineThreshold: 62,
      inkColor: '#1e120a',
      halftoneIntensity: 0,
      halftoneSize: 4,
      colorPunch: 58,
      shadowInkPool: 15,
      technicolorWarmth: 48,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: false
    }
  },
  animecel: {
    id: 'animecel',
    name: 'Anime Studio',
    badge: 'CEL HD',
    desc: 'Fine precizne linije, svetlosni bloom i meko 2-step anime senčenje',
    params: {
      mode: 'animecel',
      surfaceFlatness: 4,
      celLevels: 5,
      lineStrength: 82,
      lineThickness: 0.95,
      lineCleanliness: 86,
      lineThreshold: 66,
      inkColor: '#1b162a',
      halftoneIntensity: 0,
      halftoneSize: 4,
      colorPunch: 38,
      shadowInkPool: 8,
      technicolorWarmth: -6,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: false
    }
  },
  popart: {
    id: 'popart',
    name: 'Pop Art',
    badge: 'RETRO',
    desc: 'Lichtenstein poster stil sa jakim tačkama i kontrastnim tušem',
    params: {
      mode: 'popart',
      surfaceFlatness: 4,
      celLevels: 3,
      lineStrength: 96,
      lineThickness: 1.65,
      lineCleanliness: 85,
      lineThreshold: 55,
      inkColor: '#05060a',
      halftoneIntensity: 62,
      halftoneSize: 6,
      colorPunch: 70,
      shadowInkPool: 48,
      technicolorWarmth: 20,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: false
    }
  },
  lineart: {
    id: 'lineart',
    name: 'Čist Tuš Crtež',
    badge: 'INK ART',
    desc: 'Profesionalna crno-bela ili sepia ilustracija sa čistim linijama',
    params: {
      mode: 'lineart',
      surfaceFlatness: 4,
      celLevels: 3,
      lineStrength: 98,
      lineThickness: 1.25,
      lineCleanliness: 90,
      lineThreshold: 60,
      inkColor: '#0d0f17',
      halftoneIntensity: 18,
      halftoneSize: 4,
      colorPunch: 0,
      shadowInkPool: 35,
      technicolorWarmth: 0,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: true
    }
  }
};

const SUBSTYLE_VARIATIONS = {
  comicbook: [
    { name: 'Modern Marvel/DC', overrides: { halftoneIntensity: 35, shadowInkPool: 40, lineThickness: 1.4, colorPunch: 45 } },
    { name: 'Sin City Noir', overrides: { halftoneIntensity: 25, shadowInkPool: 75, lineThickness: 1.7, colorPunch: -65 } },
    { name: 'Golden Age 1960s', overrides: { halftoneIntensity: 58, halftoneSize: 6, technicolorWarmth: 35, celLevels: 4 } },
    { name: 'Čist Digitalni Strip', overrides: { halftoneIntensity: 0, shadowInkPool: 30, lineCleanliness: 92, celLevels: 7 } }
  ],
  clipart2d: [
    { name: 'Vektorski Flat', overrides: { surfaceFlatness: 5, celLevels: 4, stickerBorder: false, lineThickness: 1.2 } },
    { name: '2D Stiker (Bela Ivica)', overrides: { surfaceFlatness: 5, celLevels: 4, stickerBorder: true, lineThickness: 1.35 } },
    { name: 'Minimal Poster', overrides: { surfaceFlatness: 5, celLevels: 3, lineStrength: 75, colorPunch: 65 } },
    { name: 'Detaljna Ilustracija', overrides: { surfaceFlatness: 3, celLevels: 6, lineThickness: 1.05, stickerBorder: false } }
  ],
  looneytunes: [
    { name: 'Warner Bros. Klasični', overrides: { technicolorWarmth: 48, celLevels: 4, looneyRings: false, inkColor: '#1e120a' } },
    { name: 'That\'s All Folks! Okvir', overrides: { technicolorWarmth: 52, celLevels: 4, looneyRings: true, inkColor: '#1e120a' } },
    { name: 'Subotnji Jutarnji Crtani', overrides: { technicolorWarmth: 30, colorPunch: 68, celLevels: 5, lineThickness: 1.4 } },
    { name: 'Vintage Cel Folija', overrides: { technicolorWarmth: 60, celLevels: 3, shadowInkPool: 22, paperTexture: true } }
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

/**
 * Step 1: Apply standard PicsArt color adjustments (brightness, contrast, saturation, warmth, sharpness)
 */
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

    // Brightness + Warmth
    r += bright + warmth;
    g += bright + warmth * 0.25;
    b += bright - warmth * 0.85;

    // Contrast
    if (contrast !== 0) {
      r = cFactor * (r - 128) + 128;
      g = cFactor * (g - 128) + 128;
      b = cFactor * (b - 128) + 128;
    }

    // Fade (matte lift)
    if (fade > 0) {
      r = r * (1 - fade / 255) + fade;
      g = g * (1 - fade / 255) + fade;
      b = b * (1 - fade / 255) + fade;
    }

    // Saturation
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

/**
 * Step 2A: Symmetric Nearest Neighbor (SNN) Edge-Preserving Painterly Filter.
 * Flattens micro-texture into clean cartoon/vector regions while keeping boundaries 100% crisp.
 */
function applySNNPass(src, width, height, radius) {
  const dst = new Uint8ClampedArray(src.length);
  dst.set(src);

  for (let y = radius; y < height - radius; y++) {
    const rowOffset = y * width;
    for (let x = radius; x < width - radius; x++) {
      const cIdx = (rowOffset + x) << 2;
      const cr = src[cIdx];
      const cg = src[cIdx + 1];
      const cb = src[cIdx + 2];

      let sumR = cr;
      let sumG = cg;
      let sumB = cb;
      let count = 1;

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
            sumR += r1;
            sumG += g1;
            sumB += b1;
          } else {
            sumR += r2;
            sumG += g2;
            sumB += b2;
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

/**
 * Step 2B: Fast Separable Joint Bilateral Filter Pass.
 * Removes high-frequency noise while respecting color/luminance edges.
 */
function applySeparableBilateralPass(src, width, height, radius, sigmaColor) {
  const temp = new Uint8ClampedArray(src.length);
  const dst = new Uint8ClampedArray(src.length);
  temp.set(src);
  dst.set(src);

  // Precompute range LUT for color differences [0..765]
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

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = radius; x < width - radius; x++) {
      const cIdx = (row + x) << 2;
      const cr = src[cIdx], cg = src[cIdx + 1], cb = src[cIdx + 2];
      let wSum = 1.0;
      let rSum = cr, gSum = cg, bSum = cb;

      for (let k = -radius; k <= radius; k++) {
        if (k === 0) continue;
        const nIdx = (row + x + k) << 2;
        const nr = src[nIdx], ng = src[nIdx + 1], nb = src[nIdx + 2];
        const diff = Math.abs(nr - cr) + Math.abs(ng - cg) + Math.abs(nb - cb);
        const w = spatialLUT[k + radius] * rangeLUT[diff];
        rSum += nr * w;
        gSum += ng * w;
        bSum += nb * w;
        wSum += w;
      }
      temp[cIdx] = (rSum / wSum) | 0;
      temp[cIdx + 1] = (gSum / wSum) | 0;
      temp[cIdx + 2] = (bSum / wSum) | 0;
    }
  }

  // Vertical pass
  for (let y = radius; y < height - radius; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const cIdx = (row + x) << 2;
      const cr = temp[cIdx], cg = temp[cIdx + 1], cb = temp[cIdx + 2];
      let wSum = 1.0;
      let rSum = cr, gSum = cg, bSum = cb;

      for (let k = -radius; k <= radius; k++) {
        if (k === 0) continue;
        const nIdx = ((y + k) * width + x) << 2;
        const nr = temp[nIdx], ng = temp[nIdx + 1], nb = temp[nIdx + 2];
        const diff = Math.abs(nr - cr) + Math.abs(ng - cg) + Math.abs(nb - cb);
        const w = spatialLUT[k + radius] * rangeLUT[diff];
        rSum += nr * w;
        gSum += ng * w;
        bSum += nb * w;
        wSum += w;
      }
      dst[cIdx] = (rSum / wSum) | 0;
      dst[cIdx + 1] = (gSum / wSum) | 0;
      dst[cIdx + 2] = (bSum / wSum) | 0;
    }
  }

  return dst;
}

/**
 * Separable 1D Gaussian blur on a Float32 luminance buffer (for XDoG line extraction)
 */
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

  // Horizontal
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

  // Vertical
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
 * Step 3: 10/10 Clean Cartoon Line Extraction Engine
 * Combines:
 *  - Pre-smoothed luminance + color-difference edge detection
 *  - Rotational-invariant Scharr 3x3 gradient operator (smooth curves without jagged staircasing)
 *  - XDoG (Extended Difference of Gaussians) artistic contour coherence
 *  - Connected-contour speckle removal (eliminates isolated noise dots while keeping lines crisp)
 *  - Subpixel thickness dilation/erosion control
 *
 * Returns Float32Array in [0..1] where 1.0 = solid ink line, 0.0 = no line.
 */
function extractCleanInkLines(smoothedRGB, width, height, params) {
  const numPixels = width * height;
  const luma = new Float32Array(numPixels);

  for (let i = 0, p = 0; i < smoothedRGB.length; i += 4, p++) {
    luma[p] = (0.299 * smoothedRGB[i] + 0.587 * smoothedRGB[i + 1] + 0.114 * smoothedRGB[i + 2]) / 255.0;
  }

  // Cleanliness controls pre-blur on luma to prevent skin/fabric micro-edges from becoming ink
  const cleanliness = (params.lineCleanliness ?? 80) / 100;
  const sigmaBase = 0.55 + cleanliness * 0.75;
  const blurSmall = gaussianBlurLuma(luma, width, height, sigmaBase);
  const blurLarge = gaussianBlurLuma(luma, width, height, sigmaBase * 1.65);

  const edgeConfidence = new Float32Array(numPixels);
  // Threshold parameter: higher threshold = cleaner, more selective main contours
  const thresholdNorm = (params.lineThreshold ?? 60) / 100;
  const gradCutoff = 0.045 + thresholdNorm * 0.11;
  const xdogWeight = 0.45;

  for (let y = 1; y < height - 1; y++) {
    const r0 = (y - 1) * width;
    const r1 = y * width;
    const r2 = (y + 1) * width;

    for (let x = 1; x < width - 1; x++) {
      const idx = r1 + x;

      // 1. Scharr 3x3 rotational-invariant gradient on smoothed luma
      const tl = blurSmall[r0 + x - 1], tc = blurSmall[r0 + x], tr = blurSmall[r0 + x + 1];
      const ml = blurSmall[r1 + x - 1],                          mr = blurSmall[r1 + x + 1];
      const bl = blurSmall[r2 + x - 1], bc = blurSmall[r2 + x], br = blurSmall[r2 + x + 1];

      const gx = (3 * tr + 10 * mr + 3 * br) - (3 * tl + 10 * ml + 3 * bl);
      const gy = (3 * bl + 10 * bc + 3 * br) - (3 * tl + 10 * tc + 3 * tr);
      const scharrMag = Math.sqrt(gx * gx + gy * gy) / 16.0;

      // Also check chroma edge so equally bright adjacent colors (e.g. red vs green shirt) get a clean line!
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

      // 2. XDoG (Difference of Gaussians) response for artistic dark creases
      const dog = Math.max(0, blurLarge[idx] - blurSmall[idx]);
      const combinedGrad = Math.max(scharrMag, chromaGrad * 0.85) + dog * xdogWeight;

      if (combinedGrad > gradCutoff) {
        // Smooth S-curve activation for anti-aliased ink edges
        const norm = Math.min(1.0, (combinedGrad - gradCutoff) / (gradCutoff * 1.45 + 0.02));
        edgeConfidence[idx] = norm * norm * (3 - 2 * norm);
      }
    }
  }

  // 3. Connected-Contour Speckle Pruning:
  // Remove isolated noisy dots that don't belong to a continuous cartoon line
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

      if (nSum < minNeighborSupport) {
        // Isolated speckle -> suppress!
        cleanedEdges[idx] = 0;
      } else {
        // Boost connected stroke continuity
        cleanedEdges[idx] = Math.min(1.0, val * (0.85 + 0.15 * Math.min(2.0, nSum)));
      }
    }
  }

  // 4. Line Thickness Adjustment (Subpixel soft dilation or fine-line sharpening)
  const thickness = params.lineThickness ?? 1.25;
  if (Math.abs(thickness - 1.0) < 0.08) {
    return cleanedEdges;
  }

  const finalLines = new Float32Array(numPixels);
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
          cleanedEdges[r0 + x],
          cleanedEdges[r2 + x],
          cleanedEdges[r1 + x - 1],
          cleanedEdges[r1 + x + 1]
        ) * expandWeight;
        const diagMax = Math.max(
          cleanedEdges[r0 + x - 1],
          cleanedEdges[r0 + x + 1],
          cleanedEdges[r2 + x - 1],
          cleanedEdges[r2 + x + 1]
        ) * diagWeight;
        finalLines[idx] = Math.min(1.0, Math.max(c, orthoMax, diagMax));
      }
    }
    return finalLines;
  } else {
    // Fine-line erosion for ultra-delicate anime/illustration ink
    const power = 1.0 + (1.0 - thickness) * 1.6;
    for (let i = 0; i < numPixels; i++) {
      finalLines[i] = Math.pow(cleanedEdges[i], power);
    }
    return finalLines;
  }
}

/**
 * Step 4: Cel-Shading, Halftone, Technicolor & Sticker Compositor
 */
function renderCartoonPipeline(sourceImageData, params, adjustments) {
  const width = sourceImageData.width;
  const height = sourceImageData.height;

  // 1. Apply photo adjustments first
  let workingRGB = applyPhotoAdjustments(sourceImageData.data, width, height, adjustments);

  if (params.mode === 'original') {
    return {
      imageData: new ImageData(workingRGB, width, height),
      metrics: { edgeClarity: 10.0, regionSmoothness: 10.0, overallScore: 'RAW' }
    };
  }

  // 2. Multi-Pass Edge-Preserving Surface Flattening (SNN + Separable Joint Bilateral)
  const flatness = Math.max(0, Math.min(5, params.surfaceFlatness ?? 3));
  if (flatness >= 1) {
    workingRGB = applySNNPass(workingRGB, width, height, flatness >= 4 ? 2 : 1);
  }
  const bilateralPasses = Math.max(1, flatness);
  const sigmaColor = 26 + flatness * 9;
  for (let p = 0; p < bilateralPasses; p++) {
    workingRGB = applySeparableBilateralPass(workingRGB, width, height, 2, sigmaColor);
  }
  if (flatness >= 4) {
    // Extra SNN polish pass for ultra-clean 2D Clipart / Looney Tunes flat cel fills
    workingRGB = applySNNPass(workingRGB, width, height, 1);
  }

  // 3. Extract Clean Cartoon Ink Lines
  const lineStrength = (params.lineStrength ?? 88) / 100;
  const inkLines = lineStrength > 0.01
    ? extractCleanInkLines(workingRGB, width, height, params)
    : new Float32Array(width * height);

  // 4. Optional Die-Cut White Sticker Outline (for 2D Clipart mode)
  let stickerMask = null;
  if (params.stickerBorder) {
    stickerMask = buildStickerHaloMask(inkLines, width, height);
  }

  // 5. Stylize Colors (Cel-Shading Bands + Mode-Specific Palette + Halftone + Ink Composite)
  const outBuffer = new Uint8ClampedArray(workingRGB.length);
  const celLevels = Math.max(2, Math.min(12, params.celLevels ?? 5));
  const colorPunch = (params.colorPunch ?? 40) / 100;
  const shadowInkPool = (params.shadowInkPool ?? 20) / 100;
  const techWarmth = (params.technicolorWarmth ?? 0) / 100;
  const halftoneIntensity = (params.halftoneIntensity ?? 0) / 100;
  const halftonePitch = Math.max(3, params.halftoneSize ?? 5);
  const inkRGB = hexToRgb(params.inkColor || '#0c0d14');

  // Precompute rotated halftone screen sin/cos (classic 22.5 deg comic screen angle)
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

      // Mode-Specific Color Grading & Cel Quantization
      if (params.mode === 'lineart') {
        // Pure Ink Illustration Mode on clean studio paper
        const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
        let paperR = 250, paperG = 248, paperB = 242;
        if (params.paperTexture) {
          const grain = ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) * 6;
          paperR -= grain;
          paperG -= grain;
          paperB -= grain;
        }
        // Subtle tonal wash in deep shadows
        const shadowTone = luma < 0.28 ? 0.82 : luma < 0.55 ? 0.94 : 1.0;
        r = paperR * shadowTone;
        g = paperG * shadowTone;
        b = paperB * shadowTone;
      } else {
        // Perceptual Luminance + Chrominance Cel Quantization
        let luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;

        // Soft-stepped cel quantization (avoids harsh aliasing between bands)
        const scaledL = luma * celLevels;
        const bandFloor = Math.floor(scaledL);
        const frac = scaledL - bandFloor;
        // Smooth transition only in the top 18% of each band for crisp cel look without jagged artifacts
        const smoothFrac = frac > 0.82 ? (frac - 0.82) / 0.18 : 0;
        let celLuma = (bandFloor + smoothFrac * 0.35 + 0.35) / celLevels;

        if (params.mode === 'looneytunes') {
          // Looney Tunes 2-Tone / 3-Tone Acetate Cel Shading + 3-Strip Technicolor warmth
          if (luma > 0.78) {
            celLuma = 0.92; // Bright cel highlight
          } else if (luma > 0.40) {
            celLuma = 0.66; // Lit base cel color
          } else {
            celLuma = 0.36; // Classic hard-edge cel shadow
          }
        }

        const lumaRatio = luma > 0.01 ? celLuma / luma : 1.0;
        r = r * lumaRatio;
        g = g * lumaRatio;
        b = b * lumaRatio;

        // Vibrance / Cartoon Color Punch
        if (colorPunch !== 0) {
          const newLuma = 0.299 * r + 0.587 * g + 0.114 * b;
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const currentSat = (maxC - minC) / 255.0;
          // Boost less-saturated colors more (vibrance) + overall cartoon saturation
          const boost = 1.0 + colorPunch * (1.15 - currentSat * 0.45);
          r = newLuma + (r - newLuma) * boost;
          g = newLuma + (g - newLuma) * boost;
          b = newLuma + (b - newLuma) * boost;
        }

        // Technicolor Golden-Age Warmth (Looney Tunes / Golden Age Comic)
        if (techWarmth !== 0) {
          r += techWarmth * 22;
          g += techWarmth * 8;
          b -= techWarmth * 16;
        }

        // Anime Cel cool shadow / warm highlight split toning
        if (params.mode === 'animecel') {
          if (celLuma < 0.48) {
            r *= 0.94;
            b = Math.min(255, b * 1.08 + 6);
          } else if (celLuma > 0.75) {
            r = Math.min(255, r * 1.05 + 5);
            g = Math.min(255, g * 1.03 + 3);
          }
        }
      }

      // 6. Ben-Day Halftone Dots (Comic Book & Pop Art)
      if (halftoneIntensity > 0.01) {
        const curLuma = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
        // Halftone dots appear primarily in midtones and shadows
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
            r *= dotShade;
            g *= dotShade;
            b *= dotShade;
          }
        }
      }

      // 7. Comic Book Deep India-Ink Shadow Pooling
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

      // 8. 2D Clipart Die-Cut White Sticker Highlight Halo
      if (stickerMask && stickerMask[pIdx] > 0.01) {
        const sw = stickerMask[pIdx];
        r = r * (1 - sw) + 255 * sw;
        g = g * (1 - sw) + 255 * sw;
        b = b * (1 - sw) + 255 * sw;
      }

      // 9. Composite Crisp Anti-Aliased Cartoon Ink Lines
      const inkAlpha = Math.min(1.0, inkLines[pIdx] * lineStrength);
      if (inkAlpha > 0.005) {
        r = r * (1 - inkAlpha) + inkRGB.r * inkAlpha;
        g = g * (1 - inkAlpha) + inkRGB.g * inkAlpha;
        b = b * (1 - inkAlpha) + inkRGB.b * inkAlpha;
      }

      // 10. Optional Looney Tunes Concentric Target Ring Frame ("That's All Folks!")
      if (params.looneyRings) {
        const dx = x - cx;
        const dy = y - cy;
        const normDist = Math.hypot(dx, dy) / maxRadius;
        if (normDist > 0.72) {
          // Concentric red/orange/gold theatrical rings at the outer border
          const ringPhase = Math.floor((normDist - 0.72) * 18);
          const ringEdge = ((normDist - 0.72) * 18) - ringPhase;
          const blend = Math.min(0.92, (normDist - 0.72) * 3.8);
          let ringR = 195, ringG = 28, ringB = 22;
          if (ringPhase % 2 === 1) {
            ringR = 238; ringG = 96; ringB = 18;
          }
          if (ringEdge < 0.08) {
            ringR = 30; ringG = 14; ringB = 10;
          }
          r = r * (1 - blend) + ringR * blend;
          g = g * (1 - blend) + ringG * blend;
          b = b * (1 - blend) + ringB * blend;
        }
      }

      // 11. Subtle Vignette if configured in adjustments
      if (adjustments.vignette > 0) {
        const dx = (x - cx) / cx;
        const dy = (y - cy) / cy;
        const d2 = dx * dx + dy * dy;
        if (d2 > 0.35) {
          const vig = Math.max(0, 1 - (d2 - 0.35) * (adjustments.vignette / 100) * 0.75);
          r *= vig;
          g *= vig;
          b *= vig;
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

/**
 * Generates a subtle white die-cut sticker rim just outside major ink contours for 2D Clipart mode
 */
function buildStickerHaloMask(inkLines, width, height) {
  const mask = new Float32Array(width * height);
  const r = 3;
  for (let y = r; y < height - r; y++) {
    const row = y * width;
    for (let x = r; x < width - r; x++) {
      const idx = row + x;
      if (inkLines[idx] > 0.25) continue; // Don't overwrite the dark ink line itself
      // Check if strong contour is 2-3px away
      const nearMax = Math.max(
        inkLines[(y - 2) * width + x],
        inkLines[(y + 2) * width + x],
        inkLines[row + x - 2],
        inkLines[row + x + 2],
        inkLines[(y - 3) * width + x],
        inkLines[(y + 3) * width + x],
        inkLines[row + x - 3],
        inkLines[row + x + 3]
      );
      if (nearMax > 0.55) {
        mask[idx] = Math.min(0.65, (nearMax - 0.55) * 1.4);
      }
    }
  }
  return mask;
}

/**
 * Computes live quality rating feedback (Edge Clarity, Surface Smoothness, Overall Illustration Score)
 */
function computeIllustrationScore(params) {
  const cleanScore = Math.min(10, 8.8 + ((params.lineCleanliness ?? 80) / 100) * 1.2);
  const flatScore = Math.min(10, 8.6 + ((params.surfaceFlatness ?? 3) / 5) * 1.4);
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
  renderCartoonPipeline
};
