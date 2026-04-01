// ═══════════════════════════════════════════════════
// 명함 이미지 생성기 — Sharp + SVG + QR코드
// 1024x600 PNG, 8종 프리미엄 템플릿
// 컬러 커스터마이징 + 업종 표시 + QR코드 지원
// ═══════════════════════════════════════════════════
const sharp = require('sharp');
const path = require('path');
const QRCode = require('qrcode');

const OUTPUT_DIR = path.join(__dirname, 'output');

function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function initials(name) {
  const chars = (name || '').trim().split('');
  return chars.length > 0 ? chars[0] : '?';
}

// QR코드 → SVG 문자열 생성 (명함에 삽입용)
async function generateQrSvg(url, x, y, size, darkColor = '#000000') {
  if (!url) return '';
  try {
    const svgStr = await QRCode.toString(url, {
      type: 'svg',
      width: size,
      margin: 1,
      color: { dark: darkColor, light: '#00000000' },
    });
    // SVG 내부 컨텐츠만 추출해서 위치 지정
    const inner = svgStr
      .replace(/<\?xml[^?]*\?>/, '')
      .replace(/<svg[^>]*>/, '')
      .replace(/<\/svg>/, '');
    return `<g transform="translate(${x},${y})">${inner}</g>`;
  } catch {
    return '';
  }
}

// ═══ 업종별 추천 템플릿 매핑 ═══
const INDUSTRY_TEMPLATES = {
  'IT/테크':      ['minimal', 'dark', 'mono'],
  '디자인':       ['creative', 'mono', 'sunset'],
  '금융/보험':    ['corporate', 'luxury', 'minimal'],
  '교육':         ['nature', 'minimal', 'corporate'],
  '요식업':       ['sunset', 'nature', 'creative'],
  '의료/건강':    ['minimal', 'nature', 'corporate'],
  '부동산':       ['corporate', 'luxury', 'sunset'],
  '뷰티/패션':    ['creative', 'luxury', 'sunset'],
  '법률':         ['corporate', 'mono', 'luxury'],
  '건설':         ['corporate', 'dark', 'mono'],
  '마케팅/광고':  ['creative', 'sunset', 'dark'],
  '예술/문화':    ['creative', 'nature', 'mono'],
  '기타':         ['minimal', 'corporate', 'creative'],
};

function getRecommendedTemplates(industry) {
  return INDUSTRY_TEMPLATES[industry] || INDUSTRY_TEMPLATES['기타'];
}

// ═══ 컬러 헬퍼 ═══
// 메인컬러에서 투명도 적용 버전 생성
function withAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// 메인컬러를 어둡게
function darken(hex, amount = 0.3) {
  const r = Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * (1 - amount)));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ═══ 템플릿 (d.mainColor, d.subColor 사용) ═══
// d = { name, title, company, phone, email, industry, qrUrl, mainColor, subColor }

const templates = {

  // 1. 미니멀
  minimal(d) {
    const mc = d.mainColor || '#2563EB';
    const sc = d.subColor || '#FAFAFA';
    return `<svg width="1024" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="600" fill="${sc}"/>
      <rect width="6" height="600" fill="${mc}"/>

      <text x="70" y="180" font-family="Noto Sans KR, Arial, sans-serif" font-size="56" font-weight="bold" fill="#111">${esc(d.name)}</text>
      <text x="72" y="220" font-family="Noto Sans KR, Arial, sans-serif" font-size="20" fill="${mc}" letter-spacing="2">${esc(d.title)}</text>

      <line x1="72" y1="260" x2="220" y2="260" stroke="#DDD" stroke-width="1.5"/>

      <text x="72" y="310" font-family="Noto Sans KR, Arial, sans-serif" font-size="18" fill="#555">${esc(d.company)}</text>
      ${d.industry ? `<text x="72" y="338" font-family="Noto Sans KR, Arial, sans-serif" font-size="14" fill="${mc}" opacity="0.6">${esc(d.industry)}</text>` : ''}
      <text x="72" y="420" font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="#888">${esc(d.phone)}</text>
      <text x="72" y="452" font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="#888">${esc(d.email)}</text>

      <circle cx="900" cy="300" r="160" fill="none" stroke="${mc}" stroke-width="1" opacity="0.12"/>
      <circle cx="900" cy="300" r="100" fill="none" stroke="${mc}" stroke-width="1" opacity="0.08"/>
      {{QR}}
    </svg>`;
  },

  // 2. 코퍼레이트
  corporate(d) {
    const mc = d.mainColor || '#0F3460';
    const sc = d.subColor || '#F5F5F5';
    const mc2 = darken(mc, -0.3);
    return `<svg width="1024" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="corp" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${mc}"/>
          <stop offset="100%" stop-color="${mc2}"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="600" fill="${sc}"/>
      <rect width="1024" height="180" fill="url(#corp)"/>

      <circle cx="80" cy="90" r="40" fill="rgba(255,255,255,0.15)"/>
      <text x="80" y="102" font-family="Noto Sans KR, Arial, sans-serif" font-size="28" font-weight="bold" fill="#FFF" text-anchor="middle">${esc(initials(d.company))}</text>

      <text x="140" y="82" font-family="Noto Sans KR, Arial, sans-serif" font-size="28" font-weight="bold" fill="#FFF">${esc(d.company)}</text>
      <text x="140" y="112" font-family="Noto Sans KR, Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.6)" letter-spacing="3">${esc(d.title)}</text>
      ${d.industry ? `<text x="140" y="136" font-family="Noto Sans KR, Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.4)" letter-spacing="2">${esc(d.industry)}</text>` : ''}

      <text x="60" y="260" font-family="Noto Sans KR, Arial, sans-serif" font-size="42" font-weight="bold" fill="#111">${esc(d.name)}</text>
      <rect x="60" y="280" width="60" height="3" fill="${mc}"/>

      <rect x="60" y="340" width="28" height="28" rx="6" fill="${mc}" opacity="0.1"/>
      <text x="74" y="360" font-family="Noto Sans KR, Arial, sans-serif" font-size="14" fill="${mc}" text-anchor="middle">T</text>
      <text x="100" y="360" font-family="Noto Sans KR, Arial, sans-serif" font-size="17" fill="#444">${esc(d.phone)}</text>

      <rect x="60" y="384" width="28" height="28" rx="6" fill="${mc}" opacity="0.1"/>
      <text x="74" y="404" font-family="Noto Sans KR, Arial, sans-serif" font-size="14" fill="${mc}" text-anchor="middle">E</text>
      <text x="100" y="404" font-family="Noto Sans KR, Arial, sans-serif" font-size="17" fill="#444">${esc(d.email)}</text>

      <rect x="900" y="500" width="80" height="80" rx="10" fill="${mc}" opacity="0.06"/>
      {{QR}}
    </svg>`;
  },

  // 3. 크리에이티브
  creative(d) {
    const mc = d.mainColor || '#764BA2';
    const sc = d.subColor || '#667EEA';
    return `<svg width="1024" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cr" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${sc}"/>
          <stop offset="50%" stop-color="${mc}"/>
          <stop offset="100%" stop-color="#F093FB"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="600" fill="url(#cr)"/>

      <circle cx="920" cy="60" r="140" fill="rgba(255,255,255,0.06)"/>
      <circle cx="960" cy="520" r="100" fill="rgba(255,255,255,0.04)"/>

      <rect x="60" y="60" width="50" height="3" fill="rgba(255,255,255,0.5)"/>
      <text x="60" y="110" font-family="Noto Sans KR, Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.5)" letter-spacing="6">${esc(d.company)}</text>
      ${d.industry ? `<text x="60" y="135" font-family="Noto Sans KR, Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.35)" letter-spacing="3">${esc(d.industry)}</text>` : ''}

      <text x="60" y="240" font-family="Noto Sans KR, Arial, sans-serif" font-size="72" font-weight="bold" fill="#FFF">${esc(d.name)}</text>
      <text x="64" y="280" font-family="Noto Sans KR, Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.75)">${esc(d.title)}</text>

      <rect x="60" y="320" width="80" height="2" fill="rgba(255,255,255,0.4)"/>

      <text x="60" y="410" font-family="Noto Sans KR, Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.65)">${esc(d.phone)}</text>
      <text x="60" y="445" font-family="Noto Sans KR, Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.65)">${esc(d.email)}</text>
      {{QR}}
    </svg>`;
  },

  // 4. 다크
  dark(d) {
    const mc = d.mainColor || '#00F5FF';
    return `<svg width="1024" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="600" fill="#0D0D1A"/>

      <line x1="0" y1="150" x2="1024" y2="150" stroke="#1a1a30" stroke-width="0.5"/>
      <line x1="0" y1="300" x2="1024" y2="300" stroke="#1a1a30" stroke-width="0.5"/>
      <line x1="0" y1="450" x2="1024" y2="450" stroke="#1a1a30" stroke-width="0.5"/>
      <line x1="256" y1="0" x2="256" y2="600" stroke="#1a1a30" stroke-width="0.5"/>
      <line x1="512" y1="0" x2="512" y2="600" stroke="#1a1a30" stroke-width="0.5"/>
      <line x1="768" y1="0" x2="768" y2="600" stroke="#1a1a30" stroke-width="0.5"/>

      <rect x="0" y="0" width="4" height="600" fill="${mc}"/>

      <text x="50" y="160" font-family="Noto Sans KR, Arial, sans-serif" font-size="14" fill="${mc}" letter-spacing="8" opacity="0.7">${esc(d.company)}</text>
      ${d.industry ? `<text x="50" y="185" font-family="Noto Sans KR, Arial, sans-serif" font-size="12" fill="${mc}" letter-spacing="4" opacity="0.4">${esc(d.industry)}</text>` : ''}

      <text x="50" y="270" font-family="Noto Sans KR, Arial, sans-serif" font-size="58" font-weight="bold" fill="#FFFFFF">${esc(d.name)}</text>
      <text x="52" y="310" font-family="Noto Sans KR, Arial, sans-serif" font-size="20" fill="${mc}" opacity="0.8">${esc(d.title)}</text>

      <line x1="50" y1="345" x2="250" y2="345" stroke="${mc}" stroke-width="1" opacity="0.3"/>

      <text x="50" y="420" font-family="Noto Sans KR, monospace" font-size="16" fill="#666680">${esc(d.phone)}</text>
      <text x="50" y="455" font-family="Noto Sans KR, monospace" font-size="16" fill="#666680">${esc(d.email)}</text>

      <rect x="860" y="440" width="120" height="120" rx="4" fill="none" stroke="${mc}" stroke-width="0.5" opacity="0.15"/>
      {{QR}}
    </svg>`;
  },

  // 5. 선셋
  sunset(d) {
    const mc = d.mainColor || '#FF6B35';
    const sc = d.subColor || '#FFF8F0';
    return `<svg width="1024" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ss" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${mc}"/>
          <stop offset="100%" stop-color="#F7931E"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="600" fill="${sc}"/>

      <rect x="680" y="0" width="344" height="600" fill="url(#ss)"/>

      <circle cx="850" cy="300" r="180" fill="rgba(255,255,255,0.08)"/>

      <text x="850" y="280" font-family="Noto Sans KR, Arial, sans-serif" font-size="70" font-weight="bold" fill="#FFF" text-anchor="middle">${esc(initials(d.name))}</text>
      <text x="850" y="340" font-family="Noto Sans KR, Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.7)" text-anchor="middle" letter-spacing="4">${esc(d.company)}</text>

      <text x="60" y="180" font-family="Noto Sans KR, Arial, sans-serif" font-size="50" font-weight="bold" fill="#222">${esc(d.name)}</text>
      <text x="62" y="218" font-family="Noto Sans KR, Arial, sans-serif" font-size="20" fill="${mc}">${esc(d.title)}</text>
      ${d.industry ? `<text x="62" y="248" font-family="Noto Sans KR, Arial, sans-serif" font-size="14" fill="${mc}" opacity="0.5">${esc(d.industry)}</text>` : ''}

      <rect x="62" y="270" width="40" height="3" fill="${mc}" opacity="0.5"/>

      <text x="62" y="360" font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="#777">${esc(d.phone)}</text>
      <text x="62" y="392" font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="#777">${esc(d.email)}</text>
      {{QR}}
    </svg>`;
  },

  // 6. 모노
  mono(d) {
    const mc = d.mainColor || '#000000';
    return `<svg width="1024" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="600" fill="#FFFFFF"/>
      <rect width="1024" height="600" fill="${mc}" opacity="0.02"/>

      <text x="750" y="450" font-family="Noto Sans KR, Arial, sans-serif" font-size="400" font-weight="bold" fill="${mc}" opacity="0.03">${esc(initials(d.name))}</text>

      <text x="80" y="200" font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="#999" letter-spacing="8">${esc(d.company)}</text>
      ${d.industry ? `<text x="80" y="225" font-family="Noto Sans KR, Arial, sans-serif" font-size="12" fill="#BBB" letter-spacing="4">${esc(d.industry)}</text>` : ''}
      <rect x="80" y="240" width="1024" height="1" fill="#EEE"/>

      <text x="80" y="330" font-family="Noto Sans KR, Arial, sans-serif" font-size="60" font-weight="bold" fill="${mc}">${esc(d.name)}</text>
      <text x="82" y="370" font-family="Noto Sans KR, Arial, sans-serif" font-size="20" fill="#666">${esc(d.title)}</text>

      <rect x="80" y="430" width="30" height="2" fill="${mc}"/>

      <text x="80" y="475" font-family="Noto Sans KR, Arial, sans-serif" font-size="15" fill="#999">${esc(d.phone)}  |  ${esc(d.email)}</text>
      {{QR}}
    </svg>`;
  },

  // 7. 네이처
  nature(d) {
    const mc = d.mainColor || '#0B8457';
    const sc = d.subColor || '#43B692';
    return `<svg width="1024" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nat" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${mc}"/>
          <stop offset="100%" stop-color="${sc}"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="600" fill="#F0FAF5"/>

      <path d="M0 420 Q256 360 512 420 Q768 480 1024 400 L1024 600 L0 600Z" fill="url(#nat)" opacity="0.9"/>
      <path d="M0 460 Q200 400 500 450 Q800 500 1024 440 L1024 600 L0 600Z" fill="url(#nat)" opacity="0.4"/>

      <circle cx="920" cy="60" r="40" fill="${sc}" opacity="0.08"/>
      <circle cx="960" cy="40" r="25" fill="${sc}" opacity="0.06"/>

      <text x="60" y="140" font-family="Noto Sans KR, Arial, sans-serif" font-size="48" font-weight="bold" fill="${darken(mc, 0.2)}">${esc(d.name)}</text>
      <text x="62" y="175" font-family="Noto Sans KR, Arial, sans-serif" font-size="18" fill="${sc}">${esc(d.title)}  ·  ${esc(d.company)}</text>
      ${d.industry ? `<text x="62" y="200" font-family="Noto Sans KR, Arial, sans-serif" font-size="13" fill="${sc}" opacity="0.6">${esc(d.industry)}</text>` : ''}

      <rect x="62" y="220" width="50" height="2" fill="${sc}" opacity="0.4"/>

      <text x="62" y="290" font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="#5A8A72">${esc(d.phone)}</text>
      <text x="62" y="320" font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="#5A8A72">${esc(d.email)}</text>

      <text x="80" y="530" font-family="Noto Sans KR, Arial, sans-serif" font-size="22" font-weight="bold" fill="#FFF" opacity="0.9">${esc(d.company)}</text>
      {{QR}}
    </svg>`;
  },

  // 8. 럭셔리
  luxury(d) {
    const mc = d.mainColor || '#BF953F';
    return `<svg width="1024" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${mc}"/>
          <stop offset="25%" stop-color="#FCF6BA"/>
          <stop offset="50%" stop-color="${darken(mc, 0.1)}"/>
          <stop offset="75%" stop-color="#FBF5B7"/>
          <stop offset="100%" stop-color="${darken(mc, 0.2)}"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="600" fill="#0A0A0A"/>

      <rect x="20" y="20" width="984" height="560" rx="2" fill="none" stroke="url(#gold)" stroke-width="1.5"/>
      <rect x="30" y="30" width="964" height="540" rx="2" fill="none" stroke="url(#gold)" stroke-width="0.5" opacity="0.4"/>

      <rect x="20" y="20" width="30" height="2" fill="url(#gold)"/>
      <rect x="20" y="20" width="2" height="30" fill="url(#gold)"/>
      <rect x="974" y="20" width="30" height="2" fill="url(#gold)"/>
      <rect x="1002" y="20" width="2" height="30" fill="url(#gold)"/>
      <rect x="20" y="578" width="30" height="2" fill="url(#gold)"/>
      <rect x="20" y="550" width="2" height="30" fill="url(#gold)"/>
      <rect x="974" y="578" width="30" height="2" fill="url(#gold)"/>
      <rect x="1002" y="550" width="2" height="30" fill="url(#gold)"/>

      <text x="512" y="180" font-family="Noto Sans KR, Arial, sans-serif" font-size="14" fill="url(#gold)" text-anchor="middle" letter-spacing="10" opacity="0.7">${esc(d.company)}</text>
      ${d.industry ? `<text x="512" y="205" font-family="Noto Sans KR, Arial, sans-serif" font-size="11" fill="#666" text-anchor="middle" letter-spacing="6">${esc(d.industry)}</text>` : ''}

      <text x="512" y="290" font-family="Noto Sans KR, Georgia, serif" font-size="64" font-weight="bold" fill="url(#gold)" text-anchor="middle">${esc(d.name)}</text>

      <line x1="400" y1="320" x2="624" y2="320" stroke="url(#gold)" stroke-width="0.8" opacity="0.5"/>

      <text x="512" y="360" font-family="Noto Sans KR, Arial, sans-serif" font-size="18" fill="#888" text-anchor="middle" letter-spacing="4">${esc(d.title)}</text>

      <text x="512" y="460" font-family="Noto Sans KR, Arial, sans-serif" font-size="15" fill="#666" text-anchor="middle">${esc(d.phone)}  ·  ${esc(d.email)}</text>
      {{QR}}
    </svg>`;
  },
};

// QR코드 위치 (템플릿별)
const QR_POSITIONS = {
  minimal:    { x: 850, y: 440, size: 120 },
  corporate:  { x: 860, y: 420, size: 120 },
  creative:   { x: 860, y: 440, size: 120 },
  dark:       { x: 870, y: 450, size: 110 },
  sunset:     { x: 500, y: 440, size: 120 },
  mono:       { x: 860, y: 400, size: 130 },
  nature:     { x: 850, y: 200, size: 120 },
  luxury:     { x: 850, y: 420, size: 110 },
};

// QR코드 색상 (템플릿별 — 배경에 맞춰)
const QR_COLORS = {
  minimal: null,     // mainColor 사용
  corporate: null,
  creative: '#FFFFFF',
  dark: null,        // mainColor 사용
  sunset: '#555555',
  mono: null,
  nature: '#3A7A5A',
  luxury: '#BF953F',
};

async function generateCard(data, templateName = 'minimal') {
  const tmpl = templates[templateName] || templates.minimal;
  let svg = tmpl(data);

  // QR코드 삽입
  if (data.qrUrl) {
    const pos = QR_POSITIONS[templateName] || { x: 850, y: 440, size: 120 };
    const qrColor = QR_COLORS[templateName] || data.mainColor || '#333333';
    const qrSvg = await generateQrSvg(data.qrUrl, pos.x, pos.y, pos.size, qrColor);
    svg = svg.replace('{{QR}}', qrSvg);
  } else {
    svg = svg.replace('{{QR}}', '');
  }

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  const filename = `card_${templateName}_${Date.now()}.png`;
  const filepath = path.join(OUTPUT_DIR, filename);
  await sharp(pngBuffer).toFile(filepath).catch(() => {});

  console.log(`[Generator] ${templateName} 명함 생성 (QR: ${data.qrUrl ? 'Y' : 'N'})`);
  return { filepath, filename, pngBuffer };
}

module.exports = {
  generateCard,
  templates: Object.keys(templates),
  getRecommendedTemplates,
  INDUSTRY_TEMPLATES,
};
