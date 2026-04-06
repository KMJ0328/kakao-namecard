// ═══════════════════════════════════════════════════
// 명함 이미지 생성기 — 배경 PNG + SVG 텍스트 합성
// 컬러 커스텀 + QR코드 + 템플릿별 레이아웃
// ═══════════════════════════════════════════════════
const sharp = require('sharp');
const path = require('path');
const QRCode = require('qrcode');

const TMPL_DIR = path.join(__dirname, 'templates');
const F = 'Noto Sans KR, Arial, sans-serif';

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function qr(url, x, y, size) {
  if (!url) return '';
  try {
    const du = await QRCode.toDataURL(url, { width: size - 20, margin: 1, color: { dark: '#000000', light: '#FFFFFF' } });
    return `<rect x="${x-10}" y="${y-10}" width="${size}" height="${size}" rx="8" fill="#FFF" stroke="#E0E0E0" stroke-width="1"/>
      <image x="${x}" y="${y}" width="${size-20}" height="${size-20}" href="${du}"/>`;
  } catch { return ''; }
}

// 아이콘 (전화, 이메일, 웹, 위치)
function icon(type, x, y, color = '#333') {
  const icons = {
    phone: `<text x="${x}" y="${y}" font-size="18" fill="${color}">📞</text>`,
    email: `<text x="${x}" y="${y}" font-size="18" fill="${color}">✉️</text>`,
    web:   `<text x="${x}" y="${y}" font-size="18" fill="${color}">🌐</text>`,
    loc:   `<text x="${x}" y="${y}" font-size="18" fill="${color}">📍</text>`,
  };
  return icons[type] || '';
}

const TEMPLATES = {
  simple: { name: '심플', front: 't1_front.png', back: 't1_back.png', frontColor: '#FFFFFF', frontY: 300 },
  modern: { name: '모던', front: 't2_front.png', back: 't2_back.png', frontColor: '#FFFFFF', frontY: 300 },
  circle: { name: '서클', front: 't3_front.png', back: 't3_back.png', frontColor: '#FFFFFF', frontY: 300 },
  angle:  { name: '앵글', front: 't4_front.png', back: 't4_back.png', frontColor: '#FFFFFF', frontY: 300 },
  card:   { name: '카드', front: 't5_front.png', back: 't5_back.png', frontColor: '#333333', frontY: 280 },
  line:   { name: '라인아트', front: 't6_front.png', back: 't6_back.png', frontColor: '#333333', frontY: 300 },
};

// ═══ 앞면: 회사명 중앙 + 업종 ═══
function frontSvg(d, tmpl) {
  const c = d.mainColor || tmpl.frontColor;
  const ind = d.industry ? `<text x="522" y="${tmpl.frontY + 40}" font-family="${F}" font-size="18" fill="${c}" text-anchor="middle" opacity="0.7">${esc(d.industry)}</text>` : '';
  return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
    <text x="522" y="${tmpl.frontY}" font-family="${F}" font-size="48" font-weight="bold" fill="${c}" text-anchor="middle">${esc(d.company)}</text>
    ${ind}
  </svg>`;
}

// ═══ 뒷면: 템플릿별 개별 레이아웃 ═══
const backLayouts = {

  // 1. 심플: 이름+직함 좌상단, BRAND 우상단, QR 좌하단, 연락처 우하단(아이콘)
  async simple(d) {
    const mc = d.mainColor || '#111';
    const q = await qr(d.qrUrl, 70, 340, 160);
    return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
      <text x="80" y="110" font-family="${F}" font-size="44" font-weight="bold" fill="${mc}" letter-spacing="8">${esc(d.name)}</text>
      <text x="380" y="105" font-family="${F}" font-size="20" fill="#666">${esc(d.title)}</text>
      <text x="750" y="90" font-family="${F}" font-size="28" font-weight="bold" fill="#111" text-anchor="start">${esc(d.company)}</text>
      ${icon('phone', 600, 310, mc)} <text x="640" y="310" font-family="${F}" font-size="18" fill="#333">${esc(d.phone)}</text>
      ${icon('email', 600, 355, mc)} <text x="640" y="355" font-family="${F}" font-size="18" fill="#333">${esc(d.email)}</text>
      ${q}
    </svg>`;
  },

  // 2. 모던: QR 좌측 대형, 직함+이름 우상단, 연락처 우측, 아이콘 맨우측
  async modern(d) {
    const mc = d.mainColor || '#111';
    const q = await qr(d.qrUrl, 70, 100, 220);
    return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
      ${q}
      <text x="560" y="110" font-family="${F}" font-size="18" fill="#666">${esc(d.title)}</text>
      <text x="620" y="160" font-family="${F}" font-size="44" font-weight="bold" fill="${mc}" letter-spacing="8">${esc(d.name)}</text>
      <text x="620" y="300" font-family="${F}" font-size="18" fill="#333" text-anchor="start">${esc(d.phone)}</text>
      <text x="620" y="340" font-family="${F}" font-size="18" fill="#333" text-anchor="start">${esc(d.email)}</text>
      <text x="620" y="380" font-family="${F}" font-size="16" fill="#333" text-anchor="start">${esc(d.company)}</text>
    </svg>`;
  },

  // 3. 서클: 이름+직함 좌상단, 연락처 좌하단(아이콘), QR 우상단
  async circle(d) {
    const mc = d.mainColor || '#111';
    const q = await qr(d.qrUrl, 780, 100, 180);
    return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
      <text x="80" y="120" font-family="${F}" font-size="44" font-weight="bold" fill="${mc}" letter-spacing="8">${esc(d.name)}</text>
      <text x="380" y="115" font-family="${F}" font-size="20" fill="#666">${esc(d.title)}</text>
      <text x="750" y="80" font-family="${F}" font-size="24" font-weight="bold" fill="#111">${esc(d.company)}</text>
      ${icon('phone', 80, 310, mc)} <text x="120" y="310" font-family="${F}" font-size="18" fill="#333">${esc(d.phone)}</text>
      ${icon('email', 80, 355, mc)} <text x="120" y="355" font-family="${F}" font-size="18" fill="#333">${esc(d.email)}</text>
      ${q}
    </svg>`;
  },

  // 4. 앵글: QR 좌상단, 이름+직함 우상단, 연락처 우측(아이콘), BRAND 좌하단
  async angle(d) {
    const mc = d.mainColor || '#111';
    const q = await qr(d.qrUrl, 70, 80, 180);
    return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
      ${q}
      <text x="560" y="130" font-family="${F}" font-size="44" font-weight="bold" fill="${mc}" letter-spacing="8">${esc(d.name)}</text>
      <text x="860" y="125" font-family="${F}" font-size="20" fill="#666">${esc(d.title)}</text>
      ${icon('phone', 560, 280, mc)} <text x="600" y="280" font-family="${F}" font-size="18" fill="#333">${esc(d.phone)}</text>
      ${icon('email', 560, 325, mc)} <text x="600" y="325" font-family="${F}" font-size="18" fill="#333">${esc(d.email)}</text>
      <text x="80" y="500" font-family="${F}" font-size="24" font-weight="bold" fill="#FFF">${esc(d.company)}</text>
    </svg>`;
  },

  // 5. 카드: BRAND+직함+이름 상단(다크영역), QR 좌하단, 연락처 우하단(아이콘)
  async card(d) {
    const mc = d.mainColor || '#FFF';
    const q = await qr(d.qrUrl, 160, 340, 160);
    return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
      <text x="120" y="160" font-family="${F}" font-size="28" font-weight="bold" fill="#FFF" letter-spacing="2">${esc(d.company)}</text>
      <text x="470" y="155" font-family="${F}" font-size="16" fill="rgba(255,255,255,0.6)">${esc(d.title)}</text>
      <text x="560" y="160" font-family="${F}" font-size="44" font-weight="bold" fill="#FFF" letter-spacing="8">${esc(d.name)}</text>
      ${icon('phone', 560, 380, '#333')} <text x="600" y="380" font-family="${F}" font-size="18" fill="#333">${esc(d.phone)}</text>
      ${icon('email', 560, 425, '#333')} <text x="600" y="425" font-family="${F}" font-size="18" fill="#333">${esc(d.email)}</text>
      ${q}
    </svg>`;
  },

  // 6. 라인아트: BRAND 우상단, 이름+직함 좌측, 연락처 좌측(아이콘), QR 우하단
  async line(d) {
    const mc = d.mainColor || '#111';
    const q = await qr(d.qrUrl, 790, 310, 160);
    return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
      <text x="900" y="90" font-family="${F}" font-size="28" font-weight="bold" fill="#111" text-anchor="end">${esc(d.company)}</text>
      <text x="80" y="220" font-family="${F}" font-size="44" font-weight="bold" fill="${mc}" letter-spacing="8">${esc(d.name)}</text>
      <text x="380" y="215" font-family="${F}" font-size="20" fill="#666">${esc(d.title)}</text>
      ${icon('phone', 80, 340, mc)} <text x="120" y="340" font-family="${F}" font-size="18" fill="#333">${esc(d.phone)}</text>
      ${icon('email', 80, 385, mc)} <text x="120" y="385" font-family="${F}" font-size="18" fill="#333">${esc(d.email)}</text>
      ${q}
    </svg>`;
  },
};

async function generateCard(data, templateName = 'simple') {
  const tmpl = TEMPLATES[templateName] || TEMPLATES.simple;

  // 앞면
  const frontBg = path.join(TMPL_DIR, tmpl.front);
  const frontOverlay = Buffer.from(frontSvg(data, tmpl));
  const frontBuffer = await sharp(frontBg)
    .composite([{ input: frontOverlay, top: 0, left: 0 }])
    .png().toBuffer();

  // 뒷면 (템플릿별 레이아웃)
  const backBg = path.join(TMPL_DIR, tmpl.back);
  const layoutFn = backLayouts[templateName] || backLayouts.simple;
  const backOverlay = Buffer.from(await layoutFn(data));
  const backBuffer = await sharp(backBg)
    .composite([{ input: backOverlay, top: 0, left: 0 }])
    .png().toBuffer();

  console.log(`[Generator] ${tmpl.name} 명함 생성`);
  return { frontBuffer, backBuffer };
}

module.exports = { generateCard, TEMPLATES };
