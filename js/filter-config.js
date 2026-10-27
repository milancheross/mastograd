/**
 * Mastograd AI & NPR Filter Configuration Library (v2 — 7-Phase Master Architecture + Style Reference Image)
 * Implements:
 *  1. 7-Phase Commercial Illustrator Master System Prompt (Phases 1 to 7 + Final Directive)
 *  2. Style Reference Image Protocol (Strict separation: Input Photo = Identity/Pose/Costume, Style Reference = Brushwork/Contours/Shading/Texture ONLY)
 *  3. Premium Filter Library including Painterly Comic, Comic Book Pro, Hero Concept Art, etc.
 *  4. Creative Illustration vs Product-Safe Illustration (BEAR 5-Toe Paw Protection)
 */
(function () {

const MASTER_7_PHASE_SYSTEM_PROMPT = `ROLE AND OBJECTIVE
You are a world-class commercial illustrator, character concept artist, visual development specialist, and art director. Transform the provided input photograph into a premium, professionally illustrated artwork, using the selected artistic style.

Treat the input photograph as the authoritative visual reference. This is a source-guided image transformation, not an opportunity to invent a different subject.

PHASE 1 — VISUAL SOURCE ANALYSIS
Before applying any style, internally identify:
- The primary subject and all secondary subjects.
- Distinctive facial features, expression, hairstyle, age appearance and identifiable characteristics.
- Body anatomy, pose, gesture, silhouette and perspective.
- Clothing construction, fabric textures, prints, colors, seams, accessories and logos.
- Composition, camera angle, framing, negative space and depth.
- Lighting direction, existing shadows and focal hierarchy.
- Background elements that contribute to the original scene.

PHASE 2 — IDENTITY AND STRUCTURE LOCK
Preserve the main subject's recognizable identity, facial structure, hairstyle, pose, body proportions, camera perspective and composition.
Keep clothing construction and product details faithful to the source.
Never invent extra fingers, limbs, objects, logos, garments or accessories.
Never redesign existing text or brand marks.
Simplify detail artistically without losing defining features.
Respect natural human anatomy and consistent three-dimensional form.

PHASE 3 — PROFESSIONAL ILLUSTRATION CONVERSION
Reconstruct the visual appearance as an authentic artist-created illustration rather than merely applying a photographic filter.
Establish a coherent shape language and a deliberate visual hierarchy.
Translate realistic light and shadow into stylized yet spatially believable illustrated value groups.
Use consistent edge treatment, refined contours, purposeful line-weight variation, intelligent color grouping, and controlled simplification.
Maintain convincing material differentiation between fabric, skin, hair, metal and other surfaces.
Focus the finest details on the face, main product and focal areas.
Use progressively simpler marks and reduced visual complexity in secondary areas.
Favor visual clarity, sophisticated craftsmanship and professional commercial finish.

PHASE 4 — ARTISTIC STYLE
Apply the selected STYLE MODULE consistently to subject, clothing, objects and environment.
Use the style's specific medium, brush treatment, linework, shading language, texture and color design.
Do not combine unrelated illustration styles unless explicitly instructed.

PHASE 5 — LIGHTING AND COLOR DIRECTION
Honor the original direction of lighting unless the style specifically changes it.
Construct intentional key light, ambient fill, form shadows and contact shadows.
Maintain balanced contrast, readable silhouettes and refined tonal hierarchy.
Avoid artificial glow, excessive saturation, clipped highlights and muddy blacks.
Preserve original product colors when product fidelity is enabled.

PHASE 6 — EDITORIAL QUALITY STANDARD
The finished artwork should resemble a premium commissioned illustration created for a high-end advertising campaign, illustrated magazine cover, character art portfolio, or professional fashion editorial.
Use deliberate artistic decisions, refined finishing and a unified visual language.
No generic mobile cartoon filter aesthetic.
No accidental photographic residues, random brush textures or unfinished regions.
Avoid cheap vector presets, inconsistent outlines and excessive artificial sharpening.

PHASE 7 — QUALITY VALIDATION
Before finalizing, visually verify:
1. The primary subject is recognizable.
2. Face, pose and silhouette remain coherent.
3. Hands, fingers and anatomy are correct.
4. Clothing and product details remain consistent.
5. Illustration style is unified across the image.
6. Shadows and highlights describe believable form.
7. No additional objects or invented branding appear.
8. The finished image looks intentionally illustrated rather than automatically filtered.

FINAL DIRECTIVE
Produce a single, highly polished, commercial-grade illustration faithful to the provided photograph.
Prioritize craftsmanship, structural accuracy, source fidelity, and visual sophistication over decorative effects.`;

const STYLE_REFERENCE_PROTOCOL_PROMPT = `STYLE REFERENCE IMAGE DIRECTIVE (STRICT CONTENT vs. TECHNIQUE SEPARATION)
A secondary Style Reference Image (e.g., Bearman reference artwork) has been provided alongside the primary Input Photograph:
- IMAGE 1 (INPUT PHOTOGRAPH) is the ONLY source for subject identity, facial features, anatomy, pose, camera framing, clothing, logos, and scene objects.
- IMAGE 2 (STYLE REFERENCE IMAGE) is used EXCLUSIVELY as a visual guide for artistic execution: extract ONLY its painting technique, brushwork texture, contour line weight and taper, cel/painterly shading transitions, shadow ink density, and lighting mood.
- STRICT PROHIBITION: Do NOT transfer the subject identity, animal/bear anatomy, facial features, pose, costume, props, background elements, or emblems from the Style Reference Image onto the Input Photograph.`;

const STYLE_PROMPTS = {
  'painterly-comic': `Transform the input photograph into a flagship Painterly Comic illustration (Bearman hybrid style). Combine confident, tapered black ink contours and graphic shadow shapes with rich digital concept-art brushwork, volumetric tonal gradients, sculpted anatomy, and warm-cool directional rim lighting. Maintain razor-sharp clarity on facial features and garment seams while giving surfaces a hand-painted graphic novel cover finish.`,

  'comic-book-pro': `Transform the input photograph into a premium contemporary comic-book illustration. Use confident, bold yet controlled black ink contours, professional cel shading, sculpted anatomy, simplified color masses, dramatic directional shadows, refined highlights and crisp graphic edges. Introduce subtle hand-inked details and selective crosshatching only where visually appropriate. Maintain believable proportions and exact subject recognition. Avoid excessive outlines, flat posterization and cheap cartoon-filter aesthetics. The result should resemble polished, professionally illustrated superhero comic cover art.`,

  'hero-concept-art': `Transform the input photograph into a flagship digital concept-art illustration with rich painterly brushwork, cinematic rim lighting, sculpted three-dimensional volume, and realistic heroic proportions. Blend refined hand-painted surface textures with crisp focal edges around the eyes, face, and key garment details. Use sophisticated warm-cool color harmony, atmospheric depth, and dramatic key lighting while keeping the subject unmistakably illustrated by a senior concept artist.`,

  'graphic-novel-noir': `Reinterpret the input photograph as a dark, atmospheric graphic-novel noir illustration. Use heavy India-ink shadow pooling, high-contrast chiaroscuro lighting, razor-sharp graphic silhouettes, selective pen crosshatching, and a restrained, moody cinematic palette with deep blacks and selective accent tones. Preserve facial likeness, anatomy, and garment structure while evoking a mature, dramatic graphic novel aesthetic.`,

  '3d-cartoon-studio': `Transform the input photograph into a high-end 3D animated feature-film studio render aesthetic. Use soft global illumination, subtle subsurface scattering on skin, clean appealing stylized volume, smooth tactile fabric and hair shading, and expressive studio rim lighting. Maintain exact identity, pose, facial expression, and wardrobe details while giving surfaces a polished, volumetric 3D animation finish.`,

  'anime-cinematic': `Transform the input photograph into a high-budget theatrical anime feature illustration. Use ultra-clean, delicate precision linework, luminous multi-layered cel shading, atmospheric light bloom, expressive eye catchlights, and cinematic color grading with cool shadow tones and warm sunlit highlights. Keep original facial proportions, identity, clothing cuts, and pose faithful to the source photograph.`,

  'fashion-illustration': `Reinterpret the input photograph as a luxury editorial fashion illustration. Use confident, fluid brushwork, crisp tailored garment seams, accurate fabric drape and weave texture, sophisticated skin rendering, and refined contemporary color harmony. Pay exceptional attention to waistband construction, stitching, garment fit, and brand emblems—ideal for high-end apparel and BEAR UNDERWEAR campaign visuals.`,

  'retro-pop-art': `Transform the input photograph into an authentic vintage silkscreen and Ben-Day halftone Pop Art poster illustration. Combine bold graphic ink contours, vibrant retro primary and secondary color plates, structured halftone dot gradients in midtones, and subtle print-ink paper grain while strictly preserving the subject's likeness, pose, and recognizable apparel details.`,

  'vector-mascot': `Reinterpret the photographed subject as a sophisticated contemporary flat-vector mascot illustration. Use precisely constructed curves, clean geometric simplification, confident silhouettes, controlled line weights, carefully chosen flat color areas and minimal hard-edge shadow shapes. Preserve the subject's defining features, pose, wardrobe and visual identity. Design it to look like professional agency-quality brand character artwork with clean production-friendly details and no unnecessary decorative effects. Avoid generic clip art, childish simplification and accidental changes to existing brand symbols.`,

  '2d-clipart': `Transform the input photograph into a crisp, ultra-clean 2D digital clipart illustration with smooth noise-free vector color fills, uniform anti-aliased dark ink outlines, simplified 4-band cel shading, and optional die-cut sticker contour separation. Keep all facial features, clothing shapes, and subject proportions clean and immediately recognizable.`,

  'looney-tunes': `Reinterpret the input photograph in the classic Golden-Age 3-Strip Technicolor hand-inked acetate cel animation aesthetic. Use warm dark-sepia animator ink lines, vibrant theatrical color saturation, clean 2-tone cel shadow planes, and classic cartoon warmth while preserving the subject's recognizable pose, expression, and wardrobe.`
};

const NEGATIVE_CONSTRAINTS = {
  universal: [
    'Do not alter facial identity, eye direction, or expression.',
    'Do not add or remove fingers, limbs, or anatomical structures.',
    'Do not hallucinate random text, gibberish typography, or extra accessories.',
    'Avoid noisy Sobel edge speckles, muddy posterization, or halo artifacts.',
    'Do not distort or redesign the 5-toe BEAR paw logo or brand typography.'
  ],
  styleRefExtra: [
    'STYLE REFERENCE LOCK: Never copy the face, animal/bear head, body shape, pose, clothing, or objects from the Style Reference Image. Transfer ONLY brushwork, contour line quality, shading, and texture.'
  ],
  productSafeExtra: [
    'STRICT PRODUCT LOCK: Do not modify garment cut, seam placement, waistband height, fabric pattern, or product color accuracy.',
    'Preserve exact 5-toe BEAR paw emblem geometry; masked logo regions must remain 100% faithful to source.'
  ]
};

const FILTER_LIBRARY = [
  {
    id: 'painterly-comic',
    code: '00★',
    name: 'Painterly Comic',
    category: 'Bearman Hybrid',
    badge: 'BEARMAN REF',
    mvpFeatured: true,
    shortDesc: 'Hibrid jakih strip kontura i digitalnog slikarstva — idealan uz Bearman Style Reference sliku.',
    useCase: 'Hero ilustracije sa Bearman referentnim stilom (konture + slikarska četkica)',
    stylePromptKey: 'painterly-comic',
    defaults: {
      intensity: 82,
      illustrationMode: 'creative',
      identityPreservation: 'strict',
      backgroundMode: 'preserve',
      detailLevel: 'ultra'
    },
    capabilities: {
      supportsPortraits: true,
      supportsProductPhotos: true,
      supportsFullBody: true,
      supportsStyleReference: true
    },
    nprParams: {
      mode: 'painterly-comic',
      surfaceFlatness: 3,
      celLevels: 7,
      lineStrength: 86,
      lineThickness: 1.32,
      lineCleanliness: 88,
      lineThreshold: 58,
      inkColor: '#0e0c12',
      halftoneIntensity: 8,
      halftoneSize: 4,
      crosshatchIntensity: 32,
      painterlyBrush: 68,
      rimLightBoost: 62,
      colorPunch: 44,
      shadowInkPool: 36,
      technicolorWarmth: 16,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: true
    }
  },
  {
    id: 'comic-book-pro',
    code: '01',
    name: 'Comic Book Pro',
    category: 'Illustration',
    badge: '01 • MVP',
    mvpFeatured: true,
    shortDesc: 'Debele kontrolisane konture, dinamične senke, crosshatching i cel shading (Bearman v1).',
    useCase: 'Maskote, portreti, akcione ilustracije i reklame',
    stylePromptKey: 'comic-book-pro',
    defaults: {
      intensity: 78,
      illustrationMode: 'creative',
      identityPreservation: 'strict',
      backgroundMode: 'preserve',
      detailLevel: 'high'
    },
    capabilities: {
      supportsPortraits: true,
      supportsProductPhotos: true,
      supportsFullBody: true,
      supportsStyleReference: true
    },
    nprParams: {
      mode: 'comic-book-pro',
      surfaceFlatness: 3,
      celLevels: 6,
      lineStrength: 94,
      lineThickness: 1.45,
      lineCleanliness: 84,
      lineThreshold: 56,
      inkColor: '#08090f',
      halftoneIntensity: 26,
      halftoneSize: 5,
      crosshatchIntensity: 42,
      painterlyBrush: 15,
      rimLightBoost: 25,
      colorPunch: 45,
      shadowInkPool: 44,
      technicolorWarmth: 8,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: false
    }
  },
  {
    id: 'hero-concept-art',
    code: '02',
    name: 'Hero Concept Art',
    category: 'Premium Digital Paint',
    badge: '02 • PREMIUM',
    mvpFeatured: true,
    shortDesc: 'Digitalno slikarstvo, sofisticirano osvetljenje, tekstura četkice i realistične proporcije (Bearman Finale).',
    useCase: 'Flagship Bearman vizuali, hero kampanje i premium portreti',
    stylePromptKey: 'hero-concept-art',
    defaults: {
      intensity: 82,
      illustrationMode: 'creative',
      identityPreservation: 'strict',
      backgroundMode: 'preserve',
      detailLevel: 'ultra'
    },
    capabilities: {
      supportsPortraits: true,
      supportsProductPhotos: true,
      supportsFullBody: true,
      supportsStyleReference: true
    },
    nprParams: {
      mode: 'hero-concept-art',
      surfaceFlatness: 3,
      celLevels: 9,
      lineStrength: 64,
      lineThickness: 1.05,
      lineCleanliness: 88,
      lineThreshold: 64,
      inkColor: '#161210',
      halftoneIntensity: 0,
      halftoneSize: 4,
      crosshatchIntensity: 18,
      painterlyBrush: 78,
      rimLightBoost: 68,
      colorPunch: 38,
      shadowInkPool: 22,
      technicolorWarmth: 18,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: true
    }
  },
  {
    id: 'graphic-novel-noir',
    code: '03',
    name: 'Graphic Novel Noir',
    category: 'Cinematic Ink',
    badge: '03 • NOIR',
    mvpFeatured: false,
    shortDesc: 'Crne India-ink površine, dramatične senke, šrafura i ograničena filmska paleta.',
    useCase: 'Ozbiljni, filmski i misteriozni vizuali',
    stylePromptKey: 'graphic-novel-noir',
    defaults: {
      intensity: 85,
      illustrationMode: 'creative',
      identityPreservation: 'strict',
      backgroundMode: 'preserve',
      detailLevel: 'high'
    },
    capabilities: {
      supportsPortraits: true,
      supportsProductPhotos: false,
      supportsFullBody: true,
      supportsStyleReference: true
    },
    nprParams: {
      mode: 'graphic-novel-noir',
      surfaceFlatness: 3,
      celLevels: 4,
      lineStrength: 98,
      lineThickness: 1.6,
      lineCleanliness: 82,
      lineThreshold: 52,
      inkColor: '#050508',
      halftoneIntensity: 18,
      halftoneSize: 4,
      crosshatchIntensity: 75,
      painterlyBrush: 10,
      rimLightBoost: 35,
      colorPunch: -58,
      shadowInkPool: 74,
      technicolorWarmth: -12,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: true
    }
  },
  {
    id: '3d-cartoon-studio',
    code: '04',
    name: '3D Cartoon Studio',
    category: '3D Animation',
    badge: '04 • MVP',
    mvpFeatured: true,
    shortDesc: 'Profesionalna 3D animirana estetika, meko osvetljenje, volumen i stilizovane forme.',
    useCase: 'Prijateljske maskote i zabavne kampanje',
    stylePromptKey: '3d-cartoon-studio',
    defaults: {
      intensity: 75,
      illustrationMode: 'creative',
      identityPreservation: 'strict',
      backgroundMode: 'preserve',
      detailLevel: 'high'
    },
    capabilities: {
      supportsPortraits: true,
      supportsProductPhotos: true,
      supportsFullBody: true,
      supportsStyleReference: true
    },
    nprParams: {
      mode: '3d-cartoon-studio',
      surfaceFlatness: 5,
      celLevels: 10,
      lineStrength: 38,
      lineThickness: 0.85,
      lineCleanliness: 94,
      lineThreshold: 72,
      inkColor: '#23192d',
      halftoneIntensity: 0,
      halftoneSize: 4,
      crosshatchIntensity: 0,
      painterlyBrush: 45,
      rimLightBoost: 72,
      colorPunch: 52,
      shadowInkPool: 6,
      technicolorWarmth: 14,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: false
    }
  },
  {
    id: 'anime-cinematic',
    code: '05',
    name: 'Anime Cinematic',
    category: 'Anime',
    badge: '05 • ANIME',
    mvpFeatured: false,
    shortDesc: 'Precizne fine linije, anime cel senčenje, snažna kompozicija i filmska atmosfera.',
    useCase: 'Portreti, lifestyle i kreativne kampanje',
    stylePromptKey: 'anime-cinematic',
    defaults: {
      intensity: 76,
      illustrationMode: 'creative',
      identityPreservation: 'strict',
      backgroundMode: 'preserve',
      detailLevel: 'high'
    },
    capabilities: {
      supportsPortraits: true,
      supportsProductPhotos: true,
      supportsFullBody: true,
      supportsStyleReference: true
    },
    nprParams: {
      mode: 'anime-cinematic',
      surfaceFlatness: 4,
      celLevels: 5,
      lineStrength: 84,
      lineThickness: 0.95,
      lineCleanliness: 88,
      lineThreshold: 66,
      inkColor: '#1b162a',
      halftoneIntensity: 0,
      halftoneSize: 4,
      crosshatchIntensity: 0,
      painterlyBrush: 20,
      rimLightBoost: 55,
      colorPunch: 40,
      shadowInkPool: 8,
      technicolorWarmth: -8,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: false
    }
  },
  {
    id: 'fashion-illustration',
    code: '06',
    name: 'Fashion Illustration',
    category: 'Editorial & Product',
    badge: '06 • BEAR MVP',
    mvpFeatured: true,
    shortDesc: 'Premium modna ilustracija, elegantni potezi četkice i uredni detalji odeće (BEAR UNDERWEAR).',
    useCase: 'BEAR UNDERWEAR marketing, e-commerce i modni editorijali',
    stylePromptKey: 'fashion-illustration',
    defaults: {
      intensity: 68,
      illustrationMode: 'product-safe',
      identityPreservation: 'strict',
      backgroundMode: 'preserve',
      detailLevel: 'ultra'
    },
    capabilities: {
      supportsPortraits: true,
      supportsProductPhotos: true,
      supportsFullBody: true,
      supportsStyleReference: true
    },
    nprParams: {
      mode: 'fashion-illustration',
      surfaceFlatness: 3,
      celLevels: 8,
      lineStrength: 76,
      lineThickness: 1.0,
      lineCleanliness: 90,
      lineThreshold: 62,
      inkColor: '#1c1614',
      halftoneIntensity: 0,
      halftoneSize: 4,
      crosshatchIntensity: 14,
      painterlyBrush: 58,
      rimLightBoost: 38,
      colorPunch: 24,
      shadowInkPool: 12,
      technicolorWarmth: 10,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: true
    }
  },
  {
    id: 'retro-pop-art',
    code: '07',
    name: 'Retro Pop Art',
    category: 'Pop & Poster',
    badge: '07 • POP ART',
    mvpFeatured: false,
    shortDesc: 'Raster Ben-Day tačkice, štamparska tekstura, vintage paleta i upečatljive grafičke površine.',
    useCase: 'Zabavne kampanje, posteri i društvene mreže',
    stylePromptKey: 'retro-pop-art',
    defaults: {
      intensity: 84,
      illustrationMode: 'creative',
      identityPreservation: 'strict',
      backgroundMode: 'preserve',
      detailLevel: 'high'
    },
    capabilities: {
      supportsPortraits: true,
      supportsProductPhotos: true,
      supportsFullBody: true,
      supportsStyleReference: true
    },
    nprParams: {
      mode: 'retro-pop-art',
      surfaceFlatness: 4,
      celLevels: 3,
      lineStrength: 96,
      lineThickness: 1.65,
      lineCleanliness: 86,
      lineThreshold: 55,
      inkColor: '#05060a',
      halftoneIntensity: 64,
      halftoneSize: 6,
      crosshatchIntensity: 0,
      painterlyBrush: 0,
      rimLightBoost: 15,
      colorPunch: 72,
      shadowInkPool: 46,
      technicolorWarmth: 22,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: true
    }
  },
  {
    id: 'vector-mascot',
    code: '08',
    name: 'Vector Mascot',
    category: 'Brand Identity',
    badge: '08 • BREND',
    mvpFeatured: false,
    shortDesc: 'Čiste forme, glatke konture, ravne boje i profesionalna estetika brend maskote.',
    useCase: 'Nalepnice, majice, štampa i identitet brenda',
    stylePromptKey: 'vector-mascot',
    defaults: {
      intensity: 86,
      illustrationMode: 'creative',
      identityPreservation: 'strict',
      backgroundMode: 'preserve',
      detailLevel: 'clean-vector'
    },
    capabilities: {
      supportsPortraits: true,
      supportsProductPhotos: true,
      supportsFullBody: true,
      supportsStyleReference: true
    },
    nprParams: {
      mode: 'vector-mascot',
      surfaceFlatness: 5,
      celLevels: 4,
      lineStrength: 92,
      lineThickness: 1.38,
      lineCleanliness: 95,
      lineThreshold: 64,
      inkColor: '#0f121c',
      halftoneIntensity: 0,
      halftoneSize: 4,
      crosshatchIntensity: 0,
      painterlyBrush: 0,
      rimLightBoost: 28,
      colorPunch: 56,
      shadowInkPool: 18,
      technicolorWarmth: 6,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: false
    }
  },
  {
    id: '2d-clipart',
    code: '09',
    name: '2D Clipart Studio',
    category: 'Sticker & Vector',
    badge: '09 • STIKER',
    mvpFeatured: false,
    shortDesc: 'Ravna 2D clipart ilustracija sa čistim konturama i belom die-cut stiker ivicom.',
    useCase: 'Stikeri, bedževi i brze 2D ilustracije',
    stylePromptKey: '2d-clipart',
    defaults: {
      intensity: 85,
      illustrationMode: 'creative',
      identityPreservation: 'strict',
      backgroundMode: 'preserve',
      detailLevel: 'clean-vector'
    },
    capabilities: {
      supportsPortraits: true,
      supportsProductPhotos: true,
      supportsFullBody: true,
      supportsStyleReference: true
    },
    nprParams: {
      mode: '2d-clipart',
      surfaceFlatness: 5,
      celLevels: 4,
      lineStrength: 90,
      lineThickness: 1.28,
      lineCleanliness: 93,
      lineThreshold: 64,
      inkColor: '#11131c',
      halftoneIntensity: 0,
      halftoneSize: 4,
      crosshatchIntensity: 0,
      painterlyBrush: 0,
      rimLightBoost: 15,
      colorPunch: 52,
      shadowInkPool: 12,
      technicolorWarmth: 4,
      stickerBorder: true,
      looneyRings: false,
      paperTexture: false
    }
  },
  {
    id: 'looney-tunes',
    code: '10',
    name: 'Looney Tunes Cel',
    category: 'Classic Animation',
    badge: '10 • TOON',
    mvpFeatured: false,
    shortDesc: 'Klasična Technicolor cel-animacija sa toplim sepia linijama i kružnim okvirom.',
    useCase: 'Klasični crtani film izgled i animirane čestitke',
    stylePromptKey: 'looney-tunes',
    defaults: {
      intensity: 84,
      illustrationMode: 'creative',
      identityPreservation: 'strict',
      backgroundMode: 'preserve',
      detailLevel: 'high'
    },
    capabilities: {
      supportsPortraits: true,
      supportsProductPhotos: false,
      supportsFullBody: true,
      supportsStyleReference: true
    },
    nprParams: {
      mode: 'looney-tunes',
      surfaceFlatness: 4,
      celLevels: 4,
      lineStrength: 88,
      lineThickness: 1.32,
      lineCleanliness: 89,
      lineThreshold: 62,
      inkColor: '#1e120a',
      halftoneIntensity: 0,
      halftoneSize: 4,
      crosshatchIntensity: 0,
      painterlyBrush: 10,
      rimLightBoost: 20,
      colorPunch: 58,
      shadowInkPool: 14,
      technicolorWarmth: 48,
      stickerBorder: false,
      looneyRings: false,
      paperTexture: false
    }
  }
];

function compileFilterPromptPayload(filterId, options = {}) {
  const filter = FILTER_LIBRARY.find(f => f.id === filterId) || FILTER_LIBRARY[0];
  const intensity = options.intensity ?? filter.defaults.intensity;
  const illustrationMode = options.illustrationMode ?? filter.defaults.illustrationMode;
  const identityPreservation = options.identityPreservation ?? filter.defaults.identityPreservation;
  const backgroundMode = options.backgroundMode ?? filter.defaults.backgroundMode;
  const detailLevel = options.detailLevel ?? filter.defaults.detailLevel;
  const protectBearLogo = options.protectBearLogo ?? (illustrationMode === 'product-safe');
  const styleRefActive = !!options.styleRefActive;
  const styleRefName = options.styleRefName || 'Bearman Reference Illustration';
  const styleRefStrength = options.styleRefStrength ?? 75;
  const styleRefSignature = options.styleRefSignature || null;

  const stylePrompt = STYLE_PROMPTS[filter.stylePromptKey] || STYLE_PROMPTS['painterly-comic'];

  const intensityInstruction = intensity >= 80
    ? `Apply strong artistic reinterpretation (${intensity}% intensity) with confident professional illustration techniques, while preserving essential source details.`
    : intensity >= 55
      ? `Apply balanced, refined artistic stylization (${intensity}% intensity) harmonizing expressive illustration brushwork with realistic source structure.`
      : `Apply subtle, controlled illustrative enhancement (${intensity}% intensity) keeping natural photographic textures closely aligned with the original.`;

  const modeInstruction = illustrationMode === 'product-safe'
    ? `MODE: PRODUCT-SAFE ILLUSTRATION (BEAR UNDERWEAR / E-COMMERCE GRADE).\nPreserve identity, anatomy, clothing cut, stitch lines, fabric pattern, garment colors, and all product details with maximum fidelity.\nDo not alter logo geometry: the 5-toe BEAR paw emblem is protected via post-generation mask compositing.`
    : `MODE: CREATIVE ILLUSTRATION.\nAllow expressive artistic lighting, heroic volume, and dynamic surface stylization while strictly maintaining subject identity and pose.`;

  const negatives = [
    ...NEGATIVE_CONSTRAINTS.universal,
    ...(styleRefActive ? NEGATIVE_CONSTRAINTS.styleRefExtra : []),
    ...(illustrationMode === 'product-safe' || protectBearLogo ? NEGATIVE_CONSTRAINTS.productSafeExtra : [])
  ];

  const sections = [
    MASTER_7_PHASE_SYSTEM_PROMPT,
    ``,
    `=== SELECTED STYLE MODULE: ${filter.code} — ${filter.name.toUpperCase()} ===`,
    stylePrompt
  ];

  if (styleRefActive) {
    let refMetricsLine = `Reference Source: "${styleRefName}" (Style Transfer Weight: ${styleRefStrength}%)`;
    if (styleRefSignature) {
      refMetricsLine += `\nExtracted Reference Signature: Contrast=${styleRefSignature.contrastProfile}, InkDensity=${styleRefSignature.edgeDensity}%, WarmthBias=${styleRefSignature.warmthShift > 0 ? '+' : ''}${styleRefSignature.warmthShift}`;
    }
    sections.push(
      ``,
      `=== STYLE REFERENCE IMAGE MODULE (ACTIVE) ===`,
      refMetricsLine,
      STYLE_REFERENCE_PROTOCOL_PROMPT
    );
  }

  sections.push(
    ``,
    `=== EXECUTION PARAMETERS (${intensity}% INTENSITY) ===`,
    intensityInstruction,
    modeInstruction,
    `Retain the original background composition (${backgroundMode}). Render ${detailLevel} detail level.`,
    ``,
    `=== NEGATIVE CONSTRAINTS (STRICT) ===`,
    ...negatives.map(n => `- ${n}`)
  );

  const compiledFullPrompt = sections.join('\n');

  const apiConfigJson = {
    id: filter.id,
    name: filter.name,
    category: filter.category,
    stylePromptKey: filter.stylePromptKey,
    inputs: {
      primaryContentImage: 'uploaded_photograph (Authoritative Identity, Pose, Wardrobe & Logos)',
      styleReferenceImage: styleRefActive
        ? {
            enabled: true,
            referenceName: styleRefName,
            styleTransferWeight: styleRefStrength,
            transferScope: ['brushwork', 'contours', 'shading', 'surface_texture', 'tonal_palette'],
            forbiddenTransferScope: ['subject_identity', 'face', 'pose', 'costume', 'objects', 'logos'],
            extractedSignature: styleRefSignature
          }
        : { enabled: false }
    },
    parameters: {
      intensity,
      illustrationMode,
      identityPreservation,
      backgroundMode,
      detailLevel,
      bearPawLogoMaskComposite: protectBearLogo
    },
    capabilities: filter.capabilities,
    compiledPrompt: compiledFullPrompt
  };

  return {
    filter,
    compiledFullPrompt,
    apiConfigJson
  };
}

window.MastogradFilterConfig = {
  MASTER_7_PHASE_SYSTEM_PROMPT,
  STYLE_REFERENCE_PROTOCOL_PROMPT,
  STYLE_PROMPTS,
  NEGATIVE_CONSTRAINTS,
  FILTER_LIBRARY,
  compileFilterPromptPayload
};

})();
