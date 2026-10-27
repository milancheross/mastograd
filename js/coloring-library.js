/**
 * Mastograd Kreativna Bojanka — Otvorena Biblioteka Slika za Bojanje
 * Sadrži čiste vektorske šablone sa zatvorenim linijama optimizovanim za kanticu (flood fill).
 */
(function () {

const COLORING_CATEGORIES = [
  { id: 'all', label: '🌟 Sve Slike' },
  { id: 'user', label: '⭐ Moje Slike' },
  { id: 'animals', label: '🦁 Životinje' },
  { id: 'cartoons', label: '🦸 Crtani & Heroji' },
  { id: 'vehicles', label: '🚗 Vozila' },
  { id: 'fairytale', label: '🦄 Bajke & Magija' },
  { id: 'nature', label: '🌸 Priroda & Mandala' }
];

const STORAGE_KEY = 'mastograd_user_coloring_templates';

function getUserTemplates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Greška pri učitavanju korisničkih slika iz biblioteke:', err);
    return [];
  }
}

function saveUserTemplates(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Greška pri čuvanju slika u biblioteku:', err);
  }
}

function addUserTemplate(tpl) {
  const current = getUserTemplates();
  const newTpl = {
    id: tpl.id || ('user_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
    category: 'user',
    title: tpl.title || 'Moja Bojanka',
    desc: tpl.desc || 'Učitana slika u biblioteci',
    dataUrl: tpl.dataUrl,
    thumbUrl: tpl.thumbUrl || tpl.dataUrl,
    isUserUploaded: true,
    createdAt: Date.now()
  };
  current.unshift(newTpl);
  saveUserTemplates(current);
  return newTpl;
}

function removeUserTemplate(id) {
  let current = getUserTemplates();
  current = current.filter(t => t.id !== id);
  saveUserTemplates(current);
  return current;
}

function getAllTemplates() {
  const userList = getUserTemplates();
  return [...userList, ...COLORING_TEMPLATES];
}

const COLORING_TEMPLATES = [
  {
    id: 'bearman_coloring',
    category: 'cartoons',
    title: 'Bearman Junak (5 Prstiju)',
    desc: 'Hrabri Bearman sa amblemom šape sa 5 prstiju',
    draw: function (ctx, w, h) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const cx = w * 0.5;
      const cy = h * 0.44;

      // Ears
      ctx.beginPath();
      ctx.arc(cx - 85, cy - 85, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - 85, cy - 85, 20, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + 85, cy - 85, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 85, cy - 85, 20, 0, Math.PI * 2);
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.ellipse(cx, cy, 110, 105, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Snout
      ctx.beginPath();
      ctx.ellipse(cx, cy + 25, 52, 42, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Nose
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, 22, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.stroke();

      // Mouth
      ctx.beginPath();
      ctx.moveTo(cx, cy + 24);
      ctx.lineTo(cx, cy + 40);
      ctx.moveTo(cx - 24, cy + 42);
      ctx.quadraticCurveTo(cx, cy + 54, cx + 24, cy + 42);
      ctx.stroke();

      // Eyes
      const drawEye = (ex, ey) => {
        ctx.beginPath();
        ctx.ellipse(ex, ey, 16, 12, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ex, ey, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
      };
      drawEye(cx - 40, cy - 25);
      drawEye(cx + 40, cy - 25);

      // Hero Mask / Eyebrows
      ctx.beginPath();
      ctx.moveTo(cx - 65, cy - 42);
      ctx.quadraticCurveTo(cx - 40, cy - 48, cx - 15, cy - 38);
      ctx.moveTo(cx + 15, cy - 38);
      ctx.quadraticCurveTo(cx + 40, cy - 48, cx + 65, cy - 42);
      ctx.stroke();

      // Shoulders & Body
      ctx.beginPath();
      ctx.moveTo(cx - 180, h - 20);
      ctx.quadraticCurveTo(cx - 140, cy + 90, cx - 75, cy + 85);
      ctx.lineTo(cx + 75, cy + 85);
      ctx.quadraticCurveTo(cx + 140, cy + 90, cx + 180, h - 20);
      ctx.lineTo(cx - 180, h - 20);
      ctx.stroke();

      // Hero Belt / Chest Emblem Circle
      ctx.beginPath();
      ctx.arc(cx, cy + 180, 42, 0, Math.PI * 2);
      ctx.stroke();

      // 5-Toe Paw inside emblem
      ctx.beginPath();
      ctx.ellipse(cx, cy + 188, 16, 11, 0, 0, Math.PI * 2);
      ctx.stroke();
      const toes = [-18, -9, 0, 9, 18];
      toes.forEach((tx, idx) => {
        ctx.beginPath();
        ctx.ellipse(cx + tx, cy + 168 + Math.abs(idx - 2) * 2, 4, 6, (idx - 2) * 0.18, 0, Math.PI * 2);
        ctx.stroke();
      });
    }
  },
  {
    id: 'cute_lion',
    category: 'animals',
    title: 'Veseli Lavić',
    desc: 'Kralj životinja sa bujnom grivom za šareno bojenje',
    draw: function (ctx, w, h) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const cx = w * 0.5;
      const cy = h * 0.46;

      // Mane Petals
      const petals = 14;
      ctx.beginPath();
      for (let i = 0; i < petals; i++) {
        const a = (i * 2 * Math.PI) / petals;
        const mx = cx + Math.cos(a) * 155;
        const my = cy + Math.sin(a) * 155;
        const r = 44;
        ctx.moveTo(mx + r, my);
        ctx.arc(mx, my, r, 0, Math.PI * 2);
      }
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.stroke();

      // Ears
      ctx.beginPath();
      ctx.arc(cx - 75, cy - 85, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - 75, cy - 85, 16, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + 75, cy - 85, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 75, cy - 85, 16, 0, Math.PI * 2);
      ctx.stroke();

      // Big Eyes
      const drawEye = (ex, ey) => {
        ctx.beginPath();
        ctx.ellipse(ex, ey, 22, 28, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ex, ey + 2, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex - 4, ey - 4, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      };
      drawEye(cx - 42, cy - 20);
      drawEye(cx + 42, cy - 20);

      // Nose
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy + 18);
      ctx.lineTo(cx + 18, cy + 18);
      ctx.lineTo(cx, cy + 36);
      ctx.closePath();
      ctx.fillStyle = '#000000';
      ctx.fill();

      // Cheeks & Mouth
      ctx.beginPath();
      ctx.arc(cx - 20, cy + 46, 20, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 20, cy + 46, 20, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // Whiskers
      ctx.beginPath();
      ctx.moveTo(cx - 55, cy + 35); ctx.lineTo(cx - 95, cy + 25);
      ctx.moveTo(cx - 55, cy + 45); ctx.lineTo(cx - 98, cy + 48);
      ctx.moveTo(cx + 55, cy + 35); ctx.lineTo(cx + 95, cy + 25);
      ctx.moveTo(cx + 55, cy + 45); ctx.lineTo(cx + 98, cy + 48);
      ctx.stroke();

      // Paws below
      ctx.beginPath();
      ctx.ellipse(cx - 65, h - 35, 45, 30, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 65, h - 35, 45, 30, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  },
  {
    id: 'sports_car',
    category: 'vehicles',
    title: 'Sportski Trkački Auto',
    desc: 'Brzi sportski automobil sa trkačkim trakama',
    draw: function (ctx, w, h) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const x = w * 0.12;
      const y = h * 0.38;
      const cw = w * 0.76;
      const ch = h * 0.32;

      // Cabin / Roof
      ctx.beginPath();
      ctx.moveTo(x + cw * 0.22, y + ch * 0.35);
      ctx.quadraticCurveTo(x + cw * 0.32, y - 45, x + cw * 0.52, y - 45);
      ctx.lineTo(x + cw * 0.72, y - 45);
      ctx.quadraticCurveTo(x + cw * 0.82, y - 35, x + cw * 0.90, y + ch * 0.35);
      ctx.closePath();
      ctx.stroke();

      // Windows
      ctx.beginPath();
      ctx.moveTo(x + cw * 0.26, y + ch * 0.3);
      ctx.lineTo(x + cw * 0.36, y - 32);
      ctx.lineTo(x + cw * 0.54, y - 32);
      ctx.lineTo(x + cw * 0.54, y + ch * 0.3);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + cw * 0.58, y + ch * 0.3);
      ctx.lineTo(x + cw * 0.58, y - 32);
      ctx.lineTo(x + cw * 0.72, y - 32);
      ctx.lineTo(x + cw * 0.84, y + ch * 0.3);
      ctx.closePath();
      ctx.stroke();

      // Main Body
      ctx.beginPath();
      ctx.moveTo(x, y + ch * 0.45);
      ctx.quadraticCurveTo(x + 20, y + ch * 0.15, x + cw * 0.20, y + ch * 0.35);
      ctx.lineTo(x + cw * 0.92, y + ch * 0.35);
      ctx.quadraticCurveTo(x + cw, y + ch * 0.4, x + cw, y + ch * 0.75);
      ctx.lineTo(x + cw * 0.85, y + ch * 0.75);
      // Rear wheel arch
      ctx.arc(x + cw * 0.76, y + ch * 0.75, 52, 0, Math.PI, true);
      ctx.lineTo(x + cw * 0.35, y + ch * 0.75);
      // Front wheel arch
      ctx.arc(x + cw * 0.24, y + ch * 0.75, 52, 0, Math.PI, true);
      ctx.lineTo(x, y + ch * 0.75);
      ctx.closePath();
      ctx.stroke();

      // Racing Stripes
      ctx.beginPath();
      ctx.rect(x + cw * 0.15, y + ch * 0.44, cw * 0.7, 18);
      ctx.stroke();

      // Headlight & Taillight
      ctx.beginPath();
      ctx.arc(x + 18, y + ch * 0.48, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.rect(x + cw - 18, y + ch * 0.44, 14, 22);
      ctx.stroke();

      // Wheels
      const drawWheel = (wx, wy) => {
        ctx.beginPath();
        ctx.arc(wx, wy, 44, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(wx, wy, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(wx, wy, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        // Rim Spokes
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
          ctx.beginPath();
          ctx.moveTo(wx + Math.cos(a) * 8, wy + Math.sin(a) * 8);
          ctx.lineTo(wx + Math.cos(a) * 24, wy + Math.sin(a) * 24);
          ctx.stroke();
        }
      };

      drawWheel(x + cw * 0.24, y + ch * 0.75);
      drawWheel(x + cw * 0.76, y + ch * 0.75);

      // Road
      ctx.beginPath();
      ctx.moveTo(0, y + ch * 0.85);
      ctx.lineTo(w, y + ch * 0.85);
      ctx.stroke();
    }
  },
  {
    id: 'magic_unicorn',
    category: 'fairytale',
    title: 'Magični Jednorog',
    desc: 'Bajkoviti jednorog sa zvezdicama i duginom grivom',
    draw: function (ctx, w, h) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const cx = w * 0.48;
      const cy = h * 0.48;

      // Horn with ridges
      ctx.beginPath();
      ctx.moveTo(cx + 10, cy - 145);
      ctx.lineTo(cx + 65, cy - 80);
      ctx.lineTo(cx + 35, cy - 65);
      ctx.closePath();
      ctx.stroke();
      for (let i = 1; i < 5; i++) {
        const t = i / 5;
        ctx.beginPath();
        ctx.moveTo((cx + 10) * (1 - t) + (cx + 35) * t, (cy - 145) * (1 - t) + (cy - 65) * t);
        ctx.lineTo((cx + 10) * (1 - t) + (cx + 65) * t, (cy - 145) * (1 - t) + (cy - 80) * t);
        ctx.stroke();
      }

      // Ears
      ctx.beginPath();
      ctx.ellipse(cx - 35, cy - 80, 18, 38, -0.25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx - 35, cy - 80, 9, 22, -0.25, 0, Math.PI * 2);
      ctx.stroke();

      // Head & Snout
      ctx.beginPath();
      ctx.moveTo(cx + 35, cy - 65);
      ctx.quadraticCurveTo(cx + 95, cy - 10, cx + 115, cy + 45);
      ctx.quadraticCurveTo(cx + 85, cy + 75, cx + 45, cy + 65);
      ctx.quadraticCurveTo(cx - 10, cy + 40, cx - 25, cy + 10);
      ctx.lineTo(cx - 65, cy + 110);
      ctx.quadraticCurveTo(cx - 35, h - 30, cx - 110, h - 20);
      ctx.lineTo(cx - 145, cy - 20);
      ctx.quadraticCurveTo(cx - 100, cy - 65, cx - 35, cy - 65);
      ctx.closePath();
      ctx.stroke();

      // Muzzle
      ctx.beginPath();
      ctx.arc(cx + 90, cy + 45, 14, 0, Math.PI * 2);
      ctx.stroke();
      // Nostril
      ctx.beginPath();
      ctx.arc(cx + 92, cy + 45, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // Smiling Eye with Lashes
      ctx.beginPath();
      ctx.arc(cx + 25, cy - 10, 16, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      for (let a = 0.2; a <= 0.8; a += 0.2) {
        const lx = cx + 25 + Math.cos(a * Math.PI) * 16;
        const ly = cy - 10 + Math.sin(a * Math.PI) * 16;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + Math.cos(a * Math.PI) * 10, ly + Math.sin(a * Math.PI) * 10 + 4);
        ctx.stroke();
      }

      // Wavy Mane Waves
      const maneWaves = [
        [cx - 40, cy - 40, cx - 110, cy - 50, cx - 135, cy + 20],
        [cx - 45, cy - 10, cx - 120, cy - 10, cx - 145, cy + 65],
        [cx - 50, cy + 25, cx - 125, cy + 35, cx - 150, cy + 115]
      ];
      for (const [x1, y1, x2, y2, x3, y3] of maneWaves) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(x2, y2, x2, y2 + 40, x3, y3);
        ctx.stroke();
      }

      // Decorative Stars
      const drawStar = (sx, sy, r) => {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const rad = i % 2 === 0 ? r : r * 0.45;
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          const px = sx + Math.cos(a) * rad;
          const py = sy + Math.sin(a) * rad;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      };
      drawStar(w * 0.18, h * 0.22, 22);
      drawStar(w * 0.82, h * 0.20, 26);
      drawStar(w * 0.85, h * 0.65, 18);
    }
  },
  {
    id: 'flower_mandala',
    category: 'nature',
    title: 'Cvetna Mandala',
    desc: 'Simetrična mandala sa laticama za opuštajuće bojenje',
    draw: function (ctx, w, h) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const cx = w * 0.5;
      const cy = h * 0.5;

      // Center Core
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Ring 1 Petals (8)
      const r1 = 64;
      for (let i = 0; i < 8; i++) {
        const a = (i * 2 * Math.PI) / 8;
        const px = cx + Math.cos(a) * r1;
        const py = cy + Math.sin(a) * r1;
        ctx.beginPath();
        ctx.arc(px, py, 26, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Ring 2 Big Petals (16)
      const r2 = 125;
      for (let i = 0; i < 16; i++) {
        const a = (i * 2 * Math.PI) / 16;
        const px = cx + Math.cos(a) * r2;
        const py = cy + Math.sin(a) * r2;
        ctx.beginPath();
        ctx.ellipse(px, py, 22, 42, a, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Outer Scallop Border
      const r3 = 188;
      for (let i = 0; i < 24; i++) {
        const a = (i * 2 * Math.PI) / 24;
        const px = cx + Math.cos(a) * r3;
        const py = cy + Math.sin(a) * r3;
        ctx.beginPath();
        ctx.arc(px, py, 20, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 215, 0, Math.PI * 2);
      ctx.stroke();
    }
  },
  {
    id: 'cute_dino',
    category: 'animals',
    title: 'Mali Smešni Dinosaur',
    desc: 'Simpatični tiranosaurus sa krupnim očima i bodljama',
    draw: function (ctx, w, h) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const cx = w * 0.46;
      const cy = h * 0.46;

      // Spikes on back & tail
      const spikes = [
        [cx - 50, cy - 90], [cx - 75, cy - 50], [cx - 95, cy - 5],
        [cx - 120, cy + 45], [cx - 150, cy + 95], [cx - 185, cy + 135]
      ];
      spikes.forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - 24, sy - 18);
        ctx.lineTo(sx - 10, sy + 16);
        ctx.closePath();
        ctx.stroke();
      });

      // Body & Tail
      ctx.beginPath();
      ctx.moveTo(cx + 80, cy - 65);
      ctx.quadraticCurveTo(cx + 120, cy - 35, cx + 115, cy + 25);
      ctx.quadraticCurveTo(cx + 85, cy + 45, cx + 65, cy + 35);
      // Chest & Belly
      ctx.quadraticCurveTo(cx + 80, cy + 110, cx + 45, cy + 165);
      ctx.lineTo(cx + 25, h - 35);
      // Foot Front
      ctx.arc(cx + 20, h - 35, 20, 0, Math.PI, false);
      ctx.lineTo(cx - 35, h - 35);
      // Foot Back
      ctx.arc(cx - 45, h - 35, 22, 0, Math.PI, false);
      // Tail curving up
      ctx.quadraticCurveTo(cx - 90, cy + 155, cx - 195, cy + 135);
      ctx.quadraticCurveTo(cx - 135, cy + 85, cx - 85, cy + 45);
      // Back
      ctx.quadraticCurveTo(cx - 45, cy - 85, cx + 15, cy - 95);
      ctx.closePath();
      ctx.stroke();

      // Big Cute Eye
      ctx.beginPath();
      ctx.arc(cx + 42, cy - 40, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 46, cy - 38, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 42, cy - 44, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Big Grin + Teeth
      ctx.beginPath();
      ctx.moveTo(cx + 65, cy + 8);
      ctx.quadraticCurveTo(cx + 88, cy + 12, cx + 105, cy + 5);
      ctx.stroke();
      // Triangle Teeth
      ctx.beginPath();
      ctx.moveTo(cx + 72, cy + 9); ctx.lineTo(cx + 77, cy + 18); ctx.lineTo(cx + 82, cy + 10);
      ctx.moveTo(cx + 86, cy + 11); ctx.lineTo(cx + 91, cy + 20); ctx.lineTo(cx + 96, cy + 9);
      ctx.stroke();

      // Little T-Rex Arm
      ctx.beginPath();
      ctx.moveTo(cx + 35, cy + 50);
      ctx.quadraticCurveTo(cx + 68, cy + 60, cx + 70, cy + 75);
      ctx.lineTo(cx + 55, cy + 78);
      ctx.lineTo(cx + 32, cy + 68);
      ctx.closePath();
      ctx.stroke();

      // Belly Line for dual coloring
      ctx.beginPath();
      ctx.moveTo(cx + 38, cy + 52);
      ctx.quadraticCurveTo(cx + 52, cy + 105, cx + 15, cy + 165);
      ctx.stroke();
    }
  }
];

window.MastogradColoringLibrary = {
  COLORING_CATEGORIES,
  COLORING_TEMPLATES,
  getUserTemplates,
  addUserTemplate,
  removeUserTemplate,
  getAllTemplates
};

})();

