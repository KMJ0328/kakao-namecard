// ═══════════════════════════════════════════════════
// 명함 이미지 생성기 — 배경 PNG + SVG 텍스트 합성
// ═══════════════════════════════════════════════════
const sharp = require('sharp');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'output');
const TMPL_DIR = path.join(__dirname, 'templates');

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 템플릿 정의: 배경 파일 + 텍스트 위치/색상
const TEMPLATES = {
  simple: {
    name: '심플',
    front: 't1_front.png',  // 다크 배경
    back: 't1_back.png',    // 화이트+라인
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

// 앞면: 회사명 중앙
function frontSvg(data, tmpl) {
  const c = tmpl.frontText.color;
  return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
    <text x="522" y="${tmpl.frontText.companyY}"
      font-family="Noto Sans KR, Arial, sans-serif" font-size="48" font-weight="bold"
      fill="${c}" text-anchor="middle">${esc(data.company)}</text>
  </svg>`;
}

// 뒷면: 이름, 직함, 연락처
function backSvg(data, tmpl) {
  const nc = tmpl.backText.nameColor;
  const c = tmpl.backText.color;
  return `<svg width="1044" height="590" xmlns="http://www.w3.org/2000/svg">
    <text x="80" y="140" font-family="Noto Sans KR, Arial, sans-serif" font-size="44" font-weight="bold" fill="${nc}" letter-spacing="8">${esc(data.name)}</text>
    <text x="84" y="185" font-family="Noto Sans KR, Arial, sans-serif" font-size="20" fill="${c}">${esc(data.title)}</text>

    <text x="560" y="320" font-family="Noto Sans KR, Arial, sans-serif" font-size="18" fill="${c}" text-anchor="start">${esc(data.phone)}</text>
    <text x="560" y="360" font-family="Noto Sans KR, Arial, sans-serif" font-size="18" fill="${c}" text-anchor="start">${esc(data.email)}</text>
    <text x="560" y="400" font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="${c}" text-anchor="start" font-weight="bold">${esc(data.company)}</text>
  </svg>`;
}

async function generateCard(data, templateName = 'simple') {
  const tmpl = TEMPLATES[templateName] || TEMPLATES.simple;

  // 앞면 생성
  const frontBg = path.join(TMPL_DIR, tmpl.front);
  const frontOverlay = Buffer.from(frontSvg(data, tmpl));
  const frontBuffer = await sharp(frontBg)
    .composite([{ input: frontOverlay, top: 0, left: 0 }])
    .png()
    .toBuffer();

  // 뒷면 생성
  const backBg = path.join(TMPL_DIR, tmpl.back);
  const backOverlay = Buffer.from(backSvg(data, tmpl));
  const backBuffer = await sharp(backBg)
    .composite([{ input: backOverlay, top: 0, left: 0 }])
    .png()
    .toBuffer();

  // 앞뒤 세로로 합치기 (1044 x 1190)
  const combined = await sharp({
    create: { width: 1044, height: 1200, channels: 4, background: { r: 240, g: 240, b: 240, alpha: 1 } }
  })
    .composite([
      { input: frontBuffer, top: 5, left: 0 },
      { input: backBuffer, top: 605, left: 0 },
    ])
    .png()
    .toBuffer();

  // 파일 저장 (로컬 테스트용)
  const filename = `card_${templateName}_${Date.now()}.png`;
  const filepath = path.join(OUTPUT_DIR, filename);
  await sharp(combined).toFile(filepath).catch(() => {});

  const dataUrl = `data:image/png;base64,${combined.toString('base64')}`;

  console.log(`[Generator] ${tmpl.name} 명함 생성`);
  return { filepath, filename, dataUrl, pngBuffer: combined };
}

module.exports = { generateCard, templates: Object.keys(TEMPLATES), TEMPLATES };
