// ═══════════════════════════════════════════════════
// 명함 이미지 생성기 — 배경 PNG + SVG 텍스트 합성
// 컬러 커스텀 + QR코드 지원
// ═══════════════════════════════════════════════════
const sharp = require('sharp');
const path = require('path');
const QRCode = require('qrcode');

const OUTPUT_DIR = path.join(__dirname, 'output');
const TMPL_DIR = path.join(__dirname, 'templates');

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// QR코드 → SVG 삽입용
async function generateQrSvg(url, x, y, size) {
  if (!url) return '';
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: size - 20,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' },
    });
    const pad = 10;
    return `<g>
      <rect x="${x - pad}" y="${y - pad}" width="${size}" height="${size}" rx="10" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="1"/>
      <image x="${x}" y="${y}" width="${size - pad * 2}" height="${size - pad * 2}" href="${dataUrl}"/>
    </g>`;
  } catch {
    return '';
  }
}

// 템플릿: 배경 파일 + 텍스트 위치/색상
const TEMPLATES = {
  simple: {
    name: '심플',
    front: 't1_front.png',
    back: 't1_back.png',
    frontText: { color: '#FFFFFF', companyY: 300 },
    backText: { color: '#333333', nameColor: '#111111' },
  },
  modern: {
    name: '모던',
    front: 't2_front.png',
    back: 't2_back.png',
    frontText: { color: '#FFFFFF', companyY: 300 },
    backText: { color: '#333333', nameColor: '#111111' },
  },
  circle: {
    name: '서클',
    front: 't3_front.png',
    back: 't3_back.png',
    frontText: { color: '#FFFFFF', companyY: 300 },
    backText: { color: '#333333', nameColor: '#111111' },
  },
  angle: {
    name: '앵글',
    front: 't4_front.png',
    back: 't4_back.png',
    frontText: { color: '#FFFFFF', companyY: 300 },
    backText: { color: '#333333', nameColor: '#111111' },
  },
  card: {
    name: '카드',
    front: 't5_front.png',
    back: 't5_back.png',
    frontText: { color: '#333333', companyY: 280 },
    backText: { color: '#333333', nameColor: '#111111' },
  },
  line: {
    name: '라인아트',
    front: 't6_front.png',
    back: 't6_back.png',
    frontText: { color: '#333333', companyY: 300 },
    backText: { color: '#333333', nameColor: '#111111' },
  },
};

// 앞면 SVG: 회사명 + 업종
function frontSvg(data, tmpl) {
  const c = data.mainColor || tmpl.frontText.color;
  const industry = data.industry ? `<text x="522" y="${tmpl.frontText.companyY + 40}" font-family="Noto Sans KR, Arial, sans-serif" font-size="18" fill="${c}" text-anchor="middle" opacity="0.7">${esc(data.industry)}</text>` : '';
  return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
    <text x="522" y="${tmpl.frontText.companyY}"
      font-family="Noto Sans KR, Arial, sans-serif" font-size="48" font-weight="bold"
      fill="${c}" text-anchor="middle">${esc(data.company)}</text>
    ${industry}
  </svg>`;
}

// 뒷면 SVG: 이름, 직함, 연락처, QR
async function backSvg(data, tmpl) {
  const nc = data.mainColor || tmpl.backText.nameColor;
  const c = tmpl.backText.color;
  const qr = await generateQrSvg(data.qrUrl, 90, 320, 140);

  return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
    <text x="80" y="140" font-family="Noto Sans KR, Arial, sans-serif" font-size="44" font-weight="bold" fill="${nc}" letter-spacing="8">${esc(data.name)}</text>
    <text x="84" y="185" font-family="Noto Sans KR, Arial, sans-serif" font-size="20" fill="${c}">${esc(data.title)}</text>

    <text x="560" y="320" font-family="Noto Sans KR, Arial, sans-serif" font-size="18" fill="${c}">${esc(data.phone)}</text>
    <text x="560" y="360" font-family="Noto Sans KR, Arial, sans-serif" font-size="18" fill="${c}">${esc(data.email)}</text>
    <text x="560" y="400" font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="${c}" font-weight="bold">${esc(data.company)}</text>
    ${qr}
  </svg>`;
}

async function generateCard(data, templateName = 'simple') {
  const tmpl = TEMPLATES[templateName] || TEMPLATES.simple;

  // 앞면
  const frontBg = path.join(TMPL_DIR, tmpl.front);
  const frontOverlay = Buffer.from(frontSvg(data, tmpl));
  const frontBuffer = await sharp(frontBg)
    .composite([{ input: frontOverlay, top: 0, left: 0 }])
    .png()
    .toBuffer();

  // 뒷면
  const backBg = path.join(TMPL_DIR, tmpl.back);
  const backOverlay = Buffer.from(await backSvg(data, tmpl));
  const backBuffer = await sharp(backBg)
    .composite([{ input: backOverlay, top: 0, left: 0 }])
    .png()
    .toBuffer();

  // 앞뒤 합치기
  const combined = await sharp({
    create: { width: 1044, height: 1200, channels: 4, background: { r: 240, g: 240, b: 240, alpha: 1 } }
  })
    .composite([
      { input: frontBuffer, top: 5, left: 0 },
      { input: backBuffer, top: 605, left: 0 },
    ])
    .png()
    .toBuffer();

  const filename = `card_${templateName}_${Date.now()}.png`;
  const filepath = path.join(OUTPUT_DIR, filename);
  await sharp(combined).toFile(filepath).catch(() => {});

  console.log(`[Generator] ${tmpl.name} 명함 생성`);
  return { filepath, filename, pngBuffer: combined };
}

module.exports = { generateCard, TEMPLATES };
