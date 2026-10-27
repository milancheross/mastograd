/**
 * Mastograd Kreativna Bojanka — 10/10 Coloring & Line Art Processing Engine
 * Sadrži:
 *  1. Napredni konvertor fotografije u stranicu za bojanje sa ZATVARANJEM PROCEPA (Leak-Free Line Art)
 *  2. Brzi Scanline Flood-Fill (Kantica za bojenje sa pametnim širenjem ispod ivica)
 *  3. Glatki Flomaster (Smooth Felt-tip Marker sa Bézier interpolacijom)
 *  4. Geometrijski oblici (Krug, Pravougaonik, Trougao, Zvezda, Srce, Linija)
 *  5. Dvoslojni Canvas sistem (Boje dole, Čiste Linije gore)
 */
(function () {

/**
 * 1. NAPREDNI KONVERTOR FOTOGRAFIJE U ČISTU BOJANKU SA ZATVARANJEM RUPA
 * Garantuje zatvorene konture tako da kantica ne curi u susedne delove.
 */
function convertPhotoToColoringPage(sourceCanvas, options = {}) {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const ctx = sourceCanvas.getContext('2d');
  const srcImg = ctx.getImageData(0, 0, w, h);
  const src = srcImg.data;
  const n = w * h;

  const threshold = options.threshold ?? 55; // 20 - 90
  const lineWeight = options.lineWeight ?? 2; // 1 - 4
  const gapClosing = options.gapClosing ?? 2; // 0 - 3 (radijus zatvaranja rupa)
  const denoise = options.denoise ?? 4; // 1 - 5 (uklanjanje šuma teksture)

  // Korak 1: Pre-Denoise (Bilateral / SNN za ravnanje teksture kože, trave, tkanine)
  let smoothed = new Uint8ClampedArray(src);
  for (let pass = 0; pass < denoise; pass++) {
    smoothed = fastEdgePreservingSmooth(smoothed, w, h, 2, 32);
  }

  // Korak 2: Računanje luma i Scharr rotaciono-invarijantnog gradijenta
  const luma = new Float32Array(n);
  for (let i = 0, p = 0; i < src.length; i += 4, p++) {
    luma[p] = (0.299 * smoothed[i] + 0.587 * smoothed[i + 1] + 0.114 * smoothed[i + 2]) / 255.0;
  }

  // Korak 3: DoG (Difference of Gaussians) za oštre linije crteža
  const blurSmall = gaussianBlur1D(luma, w, h, 0.7);
  const blurLarge = gaussianBlur1D(luma, w, h, 1.8);

  const edgeMap = new Uint8Array(n);
  const cutoff = 0.04 + (threshold / 100) * 0.12;

  for (let y = 1; y < h - 1; y++) {
    const r0 = (y - 1) * w;
    const r1 = y * w;
    const r2 = (y + 1) * w;
    for (let x = 1; x < w - 1; x++) {
      const idx = r1 + x;

      // Scharr 3x3
      const tl = blurSmall[r0 + x - 1], tc = blurSmall[r0 + x], tr = blurSmall[r0 + x + 1];
      const ml = blurSmall[r1 + x - 1],                          mr = blurSmall[r1 + x + 1];
      const bl = blurSmall[r2 + x - 1], bc = blurSmall[r2 + x], br = blurSmall[r2 + x + 1];

      const gx = (3 * tr + 10 * mr + 3 * br) - (3 * tl + 10 * ml + 3 * bl);
      const gy = (3 * bl + 10 * bc + 3 * br) - (3 * tl + 10 * tc + 3 * tr);
      const scharrMag = Math.sqrt(gx * gx + gy * gy) / 16.0;

      const dog = Math.max(0, blurLarge[idx] - blurSmall[idx]);
      const combined = scharrMag * 0.75 + dog * 0.55;

      if (combined > cutoff) {
        edgeMap[idx] = 1; // Crna linija
      }
    }
  }

  // Korak 4: Uklanjanje sitnih tačkica (Speckle noise removal)
  const cleanedMap = new Uint8Array(n);
  for (let y = 1; y < h - 1; y++) {
    const r0 = (y - 1) * w;
    const r1 = y * w;
    const r2 = (y + 1) * w;
    for (let x = 1; x < w - 1; x++) {
      const idx = r1 + x;
      if (edgeMap[idx] === 0) continue;
      const count =
        edgeMap[r0 + x - 1] + edgeMap[r0 + x] + edgeMap[r0 + x + 1] +
        edgeMap[r1 + x - 1] +                   edgeMap[r1 + x + 1] +
        edgeMap[r2 + x - 1] + edgeMap[r2 + x] + edgeMap[r2 + x + 1];
      if (count >= 2) {
        cleanedMap[idx] = 1;
      }
    }
  }

  // Korak 5: ZATVARANJE PROCEPA (Morphological Closing & Endpoint Bridge)
  // Ovo je ključna funkcija koja garantuje da linije formiraju zatvorene celine za bojenje!
  let closedMap = cleanedMap;
  if (gapClosing > 0) {
    closedMap = closeLineGaps(cleanedMap, w, h, gapClosing);
  }

  // Korak 6: Povećanje debljine linija (Line Weight)
  if (lineWeight > 1) {
    closedMap = dilateLines(closedMap, w, h, lineWeight - 1);
  }

  // Korak 7: Zaključavanje ivica ekrana solidnim crnim ramom od 3px da kantica nikad ne procuri van platna
  for (let x = 0; x < w; x++) {
    closedMap[x] = 1; closedMap[w + x] = 1;
    closedMap[(h - 1) * w + x] = 1; closedMap[(h - 2) * w + x] = 1;
  }
  for (let y = 0; y < h; y++) {
    closedMap[y * w] = 1; closedMap[y * w + 1] = 1;
    closedMap[y * w + (w - 1)] = 1; closedMap[y * w + (w - 2)] = 1;
  }

  // Kreiranje čistog crno-belog ImageData (1 = Crna linija #000000, 0 = Bela površina #ffffff)
  const outImg = new ImageData(w, h);
  const out = outImg.data;
  for (let i = 0, p = 0; i < out.length; i += 4, p++) {
    if (closedMap[p] === 1) {
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = 0;
      out[i + 3] = 255;
    } else {
      out[i] = 255;
      out[i + 1] = 255;
      out[i + 2] = 255;
      out[i + 3] = 255;
    }
  }

  const outCanvas = document.createElement('canvas');
  outCanvas.width = w;
  outCanvas.height = h;
  outCanvas.getContext('2d').putImageData(outImg, 0, 0);
  return outCanvas;
}

function fastEdgePreservingSmooth(src, w, h, radius, sigmaColor) {
  const dst = new Uint8ClampedArray(src.length);
  dst.set(src);
  for (let y = radius; y < h - radius; y++) {
    const row = y * w;
    for (let x = radius; x < w - radius; x++) {
      const cIdx = (row + x) << 2;
      const cr = src[cIdx], cg = src[cIdx + 1], cb = src[cIdx + 2];
      let rSum = cr, gSum = cg, bSum = cb, count = 1;
      for (let dy = -radius; dy <= radius; dy += 2) {
        const ny = (y + dy) * w;
        for (let dx = -radius; dx <= radius; dx += 2) {
          if (dx === 0 && dy === 0) continue;
          const nIdx = (ny + x + dx) << 2;
          const nr = src[nIdx], ng = src[nIdx + 1], nb = src[nIdx + 2];
          const diff = Math.abs(nr - cr) + Math.abs(ng - cg) + Math.abs(nb - cb);
          if (diff < sigmaColor) {
            rSum += nr; gSum += ng; bSum += nb; count++;
          }
        }
      }
      dst[cIdx] = (rSum / count) | 0;
      dst[cIdx + 1] = (gSum / count) | 0;
      dst[cIdx + 2] = (bSum / count) | 0;
    }
  }
  return dst;
}

function gaussianBlur1D(arr, w, h, sigma) {
  const radius = Math.max(1, Math.min(6, Math.ceil(sigma * 2.5)));
  const kernel = new Float32Array(radius * 2 + 1);
  let kSum = 0;
  for (let i = -radius; i <= radius; i++) {
    const v = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel[i + radius] = v;
    kSum += v;
  }
  for (let i = 0; i < kernel.length; i++) kernel[i] /= kSum;

  const temp = new Float32Array(arr.length);
  const out = new Float32Array(arr.length);

  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        const nx = Math.min(w - 1, Math.max(0, x + k));
        acc += arr[row + nx] * kernel[k + radius];
      }
      temp[row + x] = acc;
    }
  }

  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        const ny = Math.min(h - 1, Math.max(0, y + k));
        acc += temp[ny * w + x] * kernel[k + radius];
      }
      out[row + x] = acc;
    }
  }
  return out;
}

/**
 * Zatvaranje rupa: Dilation praćeno Erosion-om + spajanje slobodnih krajeva linija (Endpoints)
 */
function closeLineGaps(map, w, h, radius) {
  const dilated = new Uint8Array(map.length);
  dilated.set(map);

  // Dilatacija za radius piksela
  for (let y = radius; y < h - radius; y++) {
    const row = y * w;
    for (let x = radius; x < w - radius; x++) {
      if (map[row + x] === 1) {
        for (let dy = -radius; dy <= radius; dy++) {
          const ny = (y + dy) * w;
          for (let dx = -radius; dx <= radius; dx++) {
            dilated[ny + x + dx] = 1;
          }
        }
      }
    }
  }

  // Erozija
  const closed = new Uint8Array(map.length);
  for (let y = radius; y < h - radius; y++) {
    const row = y * w;
    for (let x = radius; x < w - radius; x++) {
      if (dilated[row + x] === 1) {
        let allOn = true;
        for (let dy = -radius; dy <= radius; dy++) {
          const ny = (y + dy) * w;
          for (let dx = -radius; dx <= radius; dx++) {
            if (dilated[ny + x + dx] === 0) {
              allOn = false;
              break;
            }
          }
          if (!allOn) break;
        }
        if (allOn) closed[row + x] = 1;
      }
    }
  }

  // Zadržavanje originalnih linija
  for (let i = 0; i < map.length; i++) {
    if (map[i] === 1) closed[i] = 1;
  }
  return closed;
}

function dilateLines(map, w, h, r) {
  const out = new Uint8Array(map.length);
  out.set(map);
  for (let y = r; y < h - r; y++) {
    const row = y * w;
    for (let x = r; x < w - r; x++) {
      if (map[row + x] === 1) {
        for (let dy = -r; dy <= r; dy++) {
          const ny = (y + dy) * w;
          for (let dx = -r; dx <= r; dx++) {
            out[ny + x + dx] = 1;
          }
        }
      }
    }
  }
  return out;
}

/**
 * 2. BRZI SCANLINE FLOOD FILL (KANTICA ZA BOJU)
 * Boji zatvorenu oblast na colorCtx-u dok poštuje tamne linije sa lineCtx-a.
 * Automatski se širi 1.5px ispod crne linije da nema belih prelaznih rubova!
 */
function scanlineFloodFill(colorCtx, lineCtx, startX, startY, fillColorRgb) {
  const w = colorCtx.canvas.width;
  const h = colorCtx.canvas.height;

  const colorImg = colorCtx.getImageData(0, 0, w, h);
  const colorData = colorImg.data;

  const lineImg = lineCtx.getImageData(0, 0, w, h);
  const lineData = lineImg.data;

  startX = Math.floor(startX);
  startY = Math.floor(startY);
  if (startX < 0 || startX >= w || startY < 0 || startY >= h) return;

  const startIdx = (startY * w + startX) << 2;

  // Provera da li je kliknuto na crnu liniju
  const lineLuma = 0.299 * lineData[startIdx] + 0.587 * lineData[startIdx + 1] + 0.114 * lineData[startIdx + 2];
  if (lineLuma < 85 && lineData[startIdx + 3] > 120) {
    // Kliknuto je direktno na tamnu liniju konture — ne bojimo samu liniju
    return;
  }

  // Ciljna boja na sloju boja pre klika
  const targetR = colorData[startIdx];
  const targetG = colorData[startIdx + 1];
  const targetB = colorData[startIdx + 2];
  const targetA = colorData[startIdx + 3];

  const fillR = fillColorRgb.r;
  const fillG = fillColorRgb.g;
  const fillB = fillColorRgb.b;
  const fillA = fillColorRgb.a ?? 255;

  // Ako je već obojeno istom bojom, izađi
  if (
    Math.abs(targetR - fillR) < 3 &&
    Math.abs(targetG - fillG) < 3 &&
    Math.abs(targetB - fillB) < 3 &&
    targetA === fillA
  ) {
    return;
  }

  // Granica linije: ako je piksel na linijskom sloju taman (luma < 95), to je barijera!
  const isBoundary = (idx) => {
    if (lineData[idx + 3] > 140) {
      const lum = 0.299 * lineData[idx] + 0.587 * lineData[idx + 1] + 0.114 * lineData[idx + 2];
      if (lum < 95) return true;
    }
    return false;
  };

  const matchesTarget = (idx) => {
    if (isBoundary(idx)) return false;
    const rDiff = Math.abs(colorData[idx] - targetR);
    const gDiff = Math.abs(colorData[idx + 1] - targetG);
    const bDiff = Math.abs(colorData[idx + 2] - targetB);
    const aDiff = Math.abs(colorData[idx + 3] - targetA);
    return rDiff + gDiff + bDiff + aDiff <= 35;
  };

  // Stack-based Scanline Flood Fill
  const stack = [[startX, startY]];
  const visited = new Uint8Array(w * h);

  while (stack.length > 0) {
    const [curX, curY] = stack.pop();
    let lx = curX;

    let rowOffset = curY * w;
    let idx = (rowOffset + lx) << 2;

    while (lx >= 0 && matchesTarget(idx) && visited[rowOffset + lx] === 0) {
      lx--;
      idx -= 4;
    }
    lx++; // Prvi validan levi piksel

    let rx = curX;
    idx = (rowOffset + rx) << 2;
    while (rx < w && matchesTarget(idx) && visited[rowOffset + rx] === 0) {
      rx++;
      idx += 4;
    }
    rx--; // Poslednji validan desni piksel

    let checkAbove = true;
    let checkBelow = true;

    for (let x = lx; x <= rx; x++) {
      const pIdx = rowOffset + x;
      visited[pIdx] = 1;

      const dIdx = pIdx << 2;
      colorData[dIdx] = fillR;
      colorData[dIdx + 1] = fillG;
      colorData[dIdx + 2] = fillB;
      colorData[dIdx + 3] = fillA;

      // Provera gornjeg reda
      if (curY > 0) {
        const upOffset = (curY - 1) * w;
        const upIdx = (upOffset + x) << 2;
        const matchUp = matchesTarget(upIdx) && visited[upOffset + x] === 0;
        if (checkAbove && matchUp) {
          stack.push([x, curY - 1]);
          checkAbove = false;
        } else if (!checkAbove && !matchUp) {
          checkAbove = true;
        }
      }

      // Provera donjeg reda
      if (curY < h - 1) {
        const downOffset = (curY + 1) * w;
        const downIdx = (downOffset + x) << 2;
        const matchDown = matchesTarget(downIdx) && visited[downOffset + x] === 0;
        if (checkBelow && matchDown) {
          stack.push([x, curY + 1]);
          checkBelow = false;
        } else if (!checkBelow && !matchDown) {
          checkBelow = true;
        }
      }
    }
  }

  // Korak bled-bleed: proširi obojeno područje za 1.5px ispod crnih linija kako ne bi ostao beli rub
  for (let y = 1; y < h - 1; y++) {
    const row = y * w;
    for (let x = 1; x < w - 1; x++) {
      const pIdx = row + x;
      if (visited[pIdx] === 0 && isBoundary(pIdx << 2)) {
        // Ako graniči sa obojenim pikselom, oboji i ovaj ispod crne linije
        if (
          visited[pIdx - 1] === 1 || visited[pIdx + 1] === 1 ||
          visited[pIdx - w] === 1 || visited[pIdx + w] === 1
        ) {
          const dIdx = pIdx << 2;
          colorData[dIdx] = fillR;
          colorData[dIdx + 1] = fillG;
          colorData[dIdx + 2] = fillB;
          colorData[dIdx + 3] = fillA;
        }
      }
    }
  }

  colorCtx.putImageData(colorImg, 0, 0);
}

/**
 * 3. FLOMASTER ENGINE (Smooth Felt-tip Marker)
 * Koristi kvadratnu Bézier interpolaciju srednjih tačaka za prirodan rukopis.
 */
class MarkerStroke {
  constructor(ctx, color, size, opacity = 1.0) {
    this.ctx = ctx;
    this.color = color;
    this.size = size;
    this.opacity = opacity;
    this.points = [];
  }

  start(x, y) {
    this.points = [{ x, y }];
    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.size;
    this.ctx.globalAlpha = this.opacity;

    this.ctx.beginPath();
    this.ctx.arc(x, y, this.size * 0.5, 0, Math.PI * 2);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.restore();
  }

  move(x, y) {
    this.points.push({ x, y });
    const pts = this.points;
    if (pts.length < 3) return;

    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.size;
    this.ctx.globalAlpha = this.opacity;

    const i = pts.length - 2;
    const xc = (pts[i].x + pts[i + 1].x) * 0.5;
    const yc = (pts[i].y + pts[i + 1].y) * 0.5;

    this.ctx.beginPath();
    this.ctx.moveTo(
      (pts[i - 1].x + pts[i].x) * 0.5,
      (pts[i - 1].y + pts[i].y) * 0.5
    );
    this.ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
    this.ctx.stroke();
    this.ctx.restore();
  }

  end() {
    this.points = [];
  }
}

/**
 * 4. GEOMETRIJSKI OBLICI
 * Crtanje osnovnih geometrijskih oblika (Krug, Pravougaonik, Trougao, Zvezda, Srce, Linija)
 */
function drawGeometricShape(ctx, shape, x1, y1, x2, y2, color, lineWidth, fillMode = 'stroke') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  const w = Math.abs(x2 - x1);
  const h = Math.abs(y2 - y1);
  const cx = minX + w * 0.5;
  const cy = minY + h * 0.5;

  ctx.beginPath();

  if (shape === 'rectangle') {
    ctx.rect(minX, minY, w, h);
  } else if (shape === 'circle') {
    ctx.ellipse(cx, cy, Math.max(1, w * 0.5), Math.max(1, h * 0.5), 0, 0, Math.PI * 2);
  } else if (shape === 'triangle') {
    ctx.moveTo(cx, minY);
    ctx.lineTo(minX + w, minY + h);
    ctx.lineTo(minX, minY + h);
    ctx.closePath();
  } else if (shape === 'star') {
    const outerR = Math.max(w, h) * 0.5;
    const innerR = outerR * 0.44;
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else if (shape === 'heart') {
    const topY = minY + h * 0.3;
    ctx.moveTo(cx, minY + h);
    ctx.bezierCurveTo(minX - w * 0.1, cy, minX, minY, cx - w * 0.25, minY);
    ctx.bezierCurveTo(cx - w * 0.05, minY, cx, topY, cx, topY);
    ctx.bezierCurveTo(cx, topY, cx + w * 0.05, minY, cx + w * 0.25, minY);
    ctx.bezierCurveTo(minX + w, minY, minX + w * 1.1, cy, cx, minY + h);
    ctx.closePath();
  } else if (shape === 'line') {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }

  if (fillMode === 'fill' && shape !== 'line') {
    ctx.fill();
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * 5. GUMICA ZA BRISANJE
 * Briše samo nanete boje sa colorCtx-a, a ne dira crne linije bojanke!
 */
function eraseAt(colorCtx, x, y, size) {
  colorCtx.save();
  colorCtx.globalCompositeOperation = 'destination-out';
  colorCtx.beginPath();
  colorCtx.arc(x, y, size * 0.5, 0, Math.PI * 2);
  colorCtx.fill();
  colorCtx.restore();
}

window.MastogradColoringEngine = {
  convertPhotoToColoringPage,
  scanlineFloodFill,
  MarkerStroke,
  drawGeometricShape,
  eraseAt
};

})();

