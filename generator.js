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

// SVG 아이콘 (크게, 검정 기본)
function icon(type, x, y, color = '#111', scale = 1.3) {
  const s = scale;
  const icons = {
    phone: `<g transform="translate(${x},${y - 20 * s}) scale(${s})"><path d="M6.6 10.8c1.4 1.4 3 2.6 4.8 3.4l1.6-1.6c.2-.2.5-.3.7-.2 1 .3 2 .5 3 .5.4 0 .7.3.7.7V17c0 .4-.3.7-.7.7C8.5 17.7 2.3 11.5 2.3 4c0-.4.3-.7.7-.7h3.4c.4 0 .7.3.7.7 0 1 .2 2 .5 3 .1.3 0 .5-.2.7L6.6 10.8z" fill="${color}"/></g>`,
    email: `<g transform="translate(${x},${y - 20 * s}) scale(${s})"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="${color}"/></g>`,
    web:   `<g transform="translate(${x},${y - 20 * s}) scale(${s})"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1 17.9c-3.9-.5-7-3.9-7-7.9 0-.6.1-1.2.2-1.8L9 15v1c0 1.1.9 2 2 2v1.9zm6.9-2.5c-.3-.8-1-1.4-1.9-1.4h-1v-3c0-.6-.4-1-1-1H8v-2h2c.6 0 1-.4 1-1V7h2c1.1 0 2-.9 2-2v-.4c2.9 1.2 5 4.1 5 7.4 0 2.1-.8 4-2.1 5.4z" fill="${color}"/></g>`,
    loc:   `<g transform="translate(${x},${y - 20 * s}) scale(${s})"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z" fill="${color}"/></g>`,
  };
  return icons[type] || '';
}

// 이름 + 직함 한 줄 (원본 패턴: "홍 길 동  대표")
function nameTitle(d, x, y, nameSize = 52, titleSize = 22, nameColor = '#111', titleColor = '#666') {
  // 한글 글자당 약 (nameSize + letter-spacing) 폭, letter-spacing=10
  const charWidth = nameSize + 10;
  const titleX = x + d.name.length * charWidth + 20;
  return `<text x="${x}" y="${y}" font-family="${F}" font-size="${nameSize}" font-weight="bold" fill="${nameColor}" letter-spacing="10">${esc(d.name)}</text>
    <text x="${titleX}" y="${y - 2}" font-family="${F}" font-size="${titleSize}" fill="${titleColor}">${esc(d.title)}</text>`;
}

// 연락처 블록 (아이콘 + 텍스트, 세로 나열)
function contactBlock(d, startX, startY, iconColor = '#111', textColor = '#333') {
  const gap = 48;
  let svg = '';
  let y = startY;
  if (d.phone) { svg += `${icon('phone', startX, y, iconColor)} <text x="${startX + 40}" y="${y}" font-family="${F}" font-size="20" fill="${textColor}">${esc(d.phone)}</text>`; y += gap; }
  if (d.email) { svg += `${icon('email', startX, y, iconColor)} <text x="${startX + 40}" y="${y}" font-family="${F}" font-size="20" fill="${textColor}">${esc(d.email)}</text>`; y += gap; }
  if (d.website) { svg += `${icon('web', startX, y, iconColor)} <text x="${startX + 40}" y="${y}" font-family="${F}" font-size="20" fill="${textColor}">${esc(d.website)}</text>`; y += gap; }
  if (d.address) { svg += `${icon('loc', startX, y, iconColor)} <text x="${startX + 40}" y="${y}" font-family="${F}" font-size="20" fill="${textColor}">${esc(d.address)}</text>`; }
  return svg;
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

// ═══ 뒷면: 원본 디자인 충실 재현 ═══
const backLayouts = {

  // 1. 심플: 이름+직함 좌상단 한줄, BRAND 우상단, QR 좌하단, 연락처 우측
  async simple(d) {
    const q = await qr(d.qrUrl, 70, 320, 190);
    return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
      ${nameTitle(d, 80, 110)}
      <text x="964" y="100" font-family="${F}" font-size="34" font-weight="bold" fill="#111" text-anchor="end">${esc(d.company)}</text>
      ${contactBlock(d, 580, 300)}
      ${q}
    </svg>`;
  },

  // 2. 모던: QR 좌측 대형, 직함+이름 우상단 한줄, 연락처 우측, 아이콘 맨우측
  async modern(d) {
    const q = await qr(d.qrUrl, 60, 80, 260);
    return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
      ${q}
      <text x="520" y="120" font-family="${F}" font-size="22" fill="#666">${esc(d.title)}</text>
      <text x="600" y="120" font-family="${F}" font-size="52" font-weight="bold" fill="#111" letter-spacing="10">${esc(d.name)}</text>
      ${contactBlock(d, 560, 240)}
    </svg>`;
  },

  // 3. 서클: 이름+직함 좌상단 한줄, BRAND 우상단, 연락처 좌하단, QR 우상단
  async circle(d) {
    const q = await qr(d.qrUrl, 750, 120, 200);
    return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
      <text x="964" y="80" font-family="${F}" font-size="32" font-weight="bold" fill="#111" text-anchor="end">${esc(d.company)}</text>
      ${nameTitle(d, 80, 200)}
      ${contactBlock(d, 80, 290)}
      ${q}
    </svg>`;
  },

  // 4. 앵글: QR 좌상단, 이름+직함 우상단 한줄, 연락처 우측, BRAND 좌하단(다크영역)
  async angle(d) {
    const q = await qr(d.qrUrl, 140, 80, 180);
    return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
      ${q}
      ${nameTitle(d, 560, 110)}
      ${contactBlock(d, 560, 220)}
      <text x="80" y="500" font-family="${F}" font-size="28" font-weight="bold" fill="#FFF">${esc(d.company)}</text>
    </svg>`;
  },

  // 5. 카드: BRAND+직함+이름 상단(다크영역), QR 좌하단, 연락처 우하단
  async card(d) {
    const q = await qr(d.qrUrl, 160, 330, 180);
    const titleX = 480;
    return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
      <text x="120" y="160" font-family="${F}" font-size="32" font-weight="bold" fill="#FFF" letter-spacing="3">${esc(d.company)}</text>
      <text x="${titleX}" y="155" font-family="${F}" font-size="18" fill="rgba(255,255,255,0.6)">${esc(d.title)}</text>
      <text x="${titleX + 80}" y="160" font-family="${F}" font-size="52" font-weight="bold" fill="#FFF" letter-spacing="10">${esc(d.name)}</text>
      ${contactBlock(d, 530, 370, '#333', '#333')}
      ${q}
    </svg>`;
  },

  // 6. 라인아트: BRAND 우상단, 이름+직함 좌측 한줄, 연락처 아래 좌측, QR 우하단
  async line(d) {
    const q = await qr(d.qrUrl, 770, 280, 190);
    return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
      <text x="964" y="90" font-family="${F}" font-size="34" font-weight="bold" fill="#111" text-anchor="end">${esc(d.company)}</text>
      ${nameTitle(d, 100, 200)}
      ${contactBlock(d, 60, 290)}
      ${q}
    </svg>`;
  },
};

async function generateCard(data, templateName = 'simple') {
  const tmpl = TEMPLATES[templateName] || TEMPLATES.simple;

  const frontBg = path.join(TMPL_DIR, tmpl.front);
  const frontOverlay = Buffer.from(frontSvg(data, tmpl));
  const frontBuffer = await sharp(frontBg)
    .composite([{ input: frontOverlay, top: 0, left: 0 }])
    .png().toBuffer();

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
