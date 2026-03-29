// ═══════════════════════════════════════════════════
// 명함 이미지 생성기 — Sharp + SVG
// 1024x600 PNG, 8종 프리미엄 템플릿
// ═══════════════════════════════════════════════════
const sharp = require('sharp');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'output');

function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 이니셜 추출
function initials(name) {
  const chars = (name || '').trim().split('');
  return chars.length > 0 ? chars[0] : '?';
}

const templates = {

  // ───────────────────────────────────────
  // 1. 미니멀 — 왼쪽 악센트 + 넓은 여백
  // ───────────────────────────────────────
  minimal(d) {
    return `<svg width="1024" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="600" fill="#FAFAFA"/>
      <rect width="6" height="600" fill="#2563EB"/>

      <text x="70" y="180" font-family="Noto Sans KR, Arial, sans-serif" font-size="56" font-weight="bold" fill="#111">${esc(d.name)}</text>
      <text x="72" y="220" font-family="Noto Sans KR, Arial, sans-serif" font-size="20" fill="#2563EB" letter-spacing="2">${esc(d.title)}</text>

      <line x1="72" y1="260" x2="220" y2="260" stroke="#DDD" stroke-width="1.5"/>

      <text x="72" y="310" font-family="Noto Sans KR, Arial, sans-serif" font-size="18" fill="#555">${esc(d.company)}</text>
      <text x="72" y="420" font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="#888">${esc(d.phone)}</text>
      <text x="72" y="452" font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="#888">${esc(d.email)}</text>

      <circle cx="900" cy="300" r="160" fill="none" stroke="#2563EB" stroke-width="1" opacity="0.12"/>
      <circle cx="900" cy="300" r="100" fill="none" stroke="#2563EB" stroke-width="1" opacity="0.08"/>
    </svg>`;
  },

  // ───────────────────────────────────────
  // 2. 코퍼레이트 — 상단 배너 + 구조적
  // ───────────────────────────────────────
  corporate(d) {
    return `<svg width="1024" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="corp" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0F3460"/>
          <stop offset="100%" stop-color="#16537E"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="600" fill="#F5F5F5"/>
      <rect width="1024" height="180" fill="url(#corp)"/>

      <!-- 회사 로고 이니셜 -->
      <circle cx="80" cy="90" r="40" fill="rgba(255,255,255,0.15)"/>
      <text x="80" y="102" font-family="Noto Sans KR, Arial, sans-serif" font-size="28" font-weight="bold" fill="#FFF" text-anchor="middle">${esc(initials(d.company))}</text>

      <text x="140" y="82" font-family="Noto Sans KR, Arial, sans-serif" font-size="28" font-weight="bold" fill="#FFF">${esc(d.company)}</text>
      <text x="140" y="112" font-family="Noto Sans KR, Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.6)" letter-spacing="3">${esc(d.title)}</text>

      <text x="60" y="260" font-family="Noto Sans KR, Arial, sans-serif" font-size="42" font-weight="bold" fill="#111">${esc(d.name)}</text>
      <rect x="60" y="280" width="60" height="3" fill="#0F3460"/>

      <!-- 연락처 아이콘 그리드 -->
      <rect x="60" y="340" width="28" height="28" rx="6" fill="#0F3460" opacity="0.1"/>
      <text x="74" y="360" font-family="Noto Sans KR, Arial, sans-serif" font-size="14" fill="#0F3460" text-anchor="middle">T</text>
      <text x="100" y="360" font-family="Noto Sans KR, Arial, sans-serif" font-size="17" fill="#444">${esc(d.phone)}</text>

      <rect x="60" y="384" width="28" height="28" rx="6" fill="#0F3460" opacity="0.1"/>
      <text x="74" y="404" font-family="Noto Sans KR, Arial, sans-serif" font-size="14" fill="#0F3460" text-anchor="middle">E</text>
      <text x="100" y="404" font-family="Noto Sans KR, Arial, sans-serif" font-size="17" fill="#444">${esc(d.email)}</text>

      <!-- 우하단 장식 -->
      <rect x="900" y="500" width="80" height="80" rx="10" fill="#0F3460" opacity="0.06"/>
      <rect x="920" y="520" width="40" height="40" rx="6" fill="#0F3460" opacity="0.06"/>
    </svg>`;
  },

  // ───────────────────────────────────────
  // 3. 크리에이티브 — 보라+핑크 그라디언트
  // ───────────────────────────────────────
  creative(d) {
    return `<svg width="1024" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cr" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#667EEA"/>
          <stop offset="50%" stop-color="#764BA2"/>
          <stop offset="100%" stop-color="#F093FB"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="600" fill="url(#cr)"/>

      <!-- 데코 원 -->
      <circle cx="920" cy="60" r="140" fill="rgba(255,255,255,0.06)"/>
      <circle cx="960" cy="520" r="100" fill="rgba(255,255,255,0.04)"/>
      <circle cx="100" cy="550" r="60" fill="rgba(255,255,255,0.03)"/>

      <!-- 상단 라인 -->
      <rect x="60" y="60" width="50" height="3" fill="rgba(255,255,255,0.5)"/>

      <text x="60" y="110" font-family="Noto Sans KR, Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.5)" letter-spacing="6">${esc(d.company)}</text>

      <text x="60" y="240" font-family="Noto Sans KR, Arial, sans-serif" font-size="72" font-weight="bold" fill="#FFF">${esc(d.name)}</text>
      <text x="64" y="280" font-family="Noto Sans KR, Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.75)">${esc(d.title)}</text>

      <rect x="60" y="320" width="80" height="2" fill="rgba(255,255,255,0.4)"/>

      <text x="60" y="410" font-family="Noto Sans KR, Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.65)">${esc(d.phone)}</text>
      <text x="60" y="445" font-family="Noto Sans KR, Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.65)">${esc(d.email)}</text>
    </svg>`;
  },

  // ───────────────────────────────────────
  // 4. 다크 — 네온 악센트
  // ───────────────────────────────────────
  dark(d) {
    return `<svg width="1024" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="600" fill="#0D0D1A"/>

      <!-- 그리드 패턴 -->
      <line x1="0" y1="150" x2="1024" y2="150" stroke="#1a1a30" stroke-width="0.5"/>
      <line x1="0" y1="300" x2="1024" y2="300" stroke="#1a1a30" stroke-width="0.5"/>
      <line x1="0" y1="450" x2="1024" y2="450" stroke="#1a1a30" stroke-width="0.5"/>
      <line x1="256" y1="0" x2="256" y2="600" stroke="#1a1a30" stroke-width="0.5"/>
      <line x1="512" y1="0" x2="512" y2="600" stroke="#1a1a30" stroke-width="0.5"/>
      <line x1="768" y1="0" x2="768" y2="600" stroke="#1a1a30" stroke-width="0.5"/>

      <!-- 네온 바 -->
      <rect x="0" y="0" width="4" height="600" fill="#00F5FF"/>
      <rect x="0" y="0" width="4" height="600" fill="#00F5FF" opacity="0.3" filter="url(#glow)"/>

      <text x="50" y="160" font-family="Noto Sans KR, Arial, sans-serif" font-size="14" fill="#00F5FF" letter-spacing="8" opacity="0.7">${esc(d.company)}</text>

      <text x="50" y="270" font-family="Noto Sans KR, Arial, sans-serif" font-size="58" font-weight="bold" fill="#FFFFFF">${esc(d.name)}</text>
      <text x="52" y="310" font-family="Noto Sans KR, Arial, sans-serif" font-size="20" fill="#00F5FF" opacity="0.8">${esc(d.title)}</text>

      <line x1="50" y1="345" x2="250" y2="345" stroke="#00F5FF" stroke-width="1" opacity="0.3"/>

      <text x="50" y="420" font-family="Noto Sans KR, monospace" font-size="16" fill="#666680">${esc(d.phone)}</text>
      <text x="50" y="455" font-family="Noto Sans KR, monospace" font-size="16" fill="#666680">${esc(d.email)}</text>

      <!-- 우하단 데코 -->
      <rect x="860" y="440" width="120" height="120" rx="4" fill="none" stroke="#00F5FF" stroke-width="0.5" opacity="0.15"/>
      <rect x="880" y="460" width="80" height="80" rx="4" fill="none" stroke="#00F5FF" stroke-width="0.5" opacity="0.1"/>
    </svg>`;
  },

  // ───────────────────────────────────────
  // 5. 선셋 — 따뜻한 오렌지 그라디언트
  // ───────────────────────────────────────
  sunset(d) {
    return `<svg width="1024" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ss" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF6B35"/>
          <stop offset="100%" stop-color="#F7931E"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="600" fill="#FFF8F0"/>

      <!-- 우측 컬러 블록 -->
      <rect x="680" y="0" width="344" height="600" fill="url(#ss)"/>

      <!-- 우측 데코 -->
      <circle cx="850" cy="300" r="180" fill="rgba(255,255,255,0.08)"/>
      <circle cx="900" cy="250" r="80" fill="rgba(255,255,255,0.06)"/>

      <!-- 우측 텍스트 -->
      <text x="850" y="280" font-family="Noto Sans KR, Arial, sans-serif" font-size="70" font-weight="bold" fill="#FFF" text-anchor="middle">${esc(initials(d.name))}</text>
      <text x="850" y="340" font-family="Noto Sans KR, Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.7)" text-anchor="middle" letter-spacing="4">${esc(d.company)}</text>

      <!-- 좌측 -->
      <text x="60" y="180" font-family="Noto Sans KR, Arial, sans-serif" font-size="50" font-weight="bold" fill="#222">${esc(d.name)}</text>
      <text x="62" y="218" font-family="Noto Sans KR, Arial, sans-serif" font-size="20" fill="#FF6B35">${esc(d.title)}</text>

      <rect x="62" y="250" width="40" height="3" fill="#FF6B35" opacity="0.5"/>

      <text x="62" y="360" font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="#777">${esc(d.phone)}</text>
      <text x="62" y="392" font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="#777">${esc(d.email)}</text>
    </svg>`;
  },

  // ───────────────────────────────────────
  // 6. 모노 — 흑백 타이포그래피
  // ───────────────────────────────────────
  mono(d) {
    return `<svg width="1024" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="600" fill="#FFFFFF"/>
      <rect width="1024" height="600" fill="#000" opacity="0.02"/>

      <!-- 대형 이니셜 배경 -->
      <text x="750" y="450" font-family="Noto Sans KR, Arial, sans-serif" font-size="400" font-weight="bold" fill="#000" opacity="0.03">${esc(initials(d.name))}</text>

      <text x="80" y="200" font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="#999" letter-spacing="8">${esc(d.company)}</text>
      <rect x="80" y="220" width="1024" height="1" fill="#EEE"/>

      <text x="80" y="310" font-family="Noto Sans KR, Arial, sans-serif" font-size="60" font-weight="bold" fill="#000">${esc(d.name)}</text>
      <text x="82" y="350" font-family="Noto Sans KR, Arial, sans-serif" font-size="20" fill="#666">${esc(d.title)}</text>

      <rect x="80" y="420" width="30" height="2" fill="#000"/>

      <text x="80" y="470" font-family="Noto Sans KR, Arial, sans-serif" font-size="15" fill="#999">${esc(d.phone)}  |  ${esc(d.email)}</text>
    </svg>`;
  },

  // ───────────────────────────────────────
  // 7. 네이처 — 민트+그린 자연 느낌
  // ───────────────────────────────────────
  nature(d) {
    return `<svg width="1024" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nat" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0B8457"/>
          <stop offset="100%" stop-color="#43B692"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="600" fill="#F0FAF5"/>

      <!-- 하단 웨이브 -->
      <path d="M0 420 Q256 360 512 420 Q768 480 1024 400 L1024 600 L0 600Z" fill="url(#nat)" opacity="0.9"/>
      <path d="M0 460 Q200 400 500 450 Q800 500 1024 440 L1024 600 L0 600Z" fill="url(#nat)" opacity="0.4"/>

      <!-- 상단 잎 데코 -->
      <circle cx="920" cy="60" r="40" fill="#43B692" opacity="0.08"/>
      <circle cx="960" cy="40" r="25" fill="#43B692" opacity="0.06"/>
      <circle cx="880" cy="30" r="15" fill="#43B692" opacity="0.05"/>

      <text x="60" y="140" font-family="Noto Sans KR, Arial, sans-serif" font-size="48" font-weight="bold" fill="#1A5E3A">${esc(d.name)}</text>
      <text x="62" y="175" font-family="Noto Sans KR, Arial, sans-serif" font-size="18" fill="#43B692">${esc(d.title)}  ·  ${esc(d.company)}</text>

      <rect x="62" y="200" width="50" height="2" fill="#43B692" opacity="0.4"/>

      <text x="62" y="280" font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="#5A8A72">${esc(d.phone)}</text>
      <text x="62" y="310" font-family="Noto Sans KR, Arial, sans-serif" font-size="16" fill="#5A8A72">${esc(d.email)}</text>

      <!-- 하단 웨이브 위 이름 -->
      <text x="80" y="530" font-family="Noto Sans KR, Arial, sans-serif" font-size="22" font-weight="bold" fill="#FFF" opacity="0.9">${esc(d.company)}</text>
    </svg>`;
  },

  // ───────────────────────────────────────
  // 8. 럭셔리 — 골드 + 블랙
  // ───────────────────────────────────────
  luxury(d) {
    return `<svg width="1024" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#BF953F"/>
          <stop offset="25%" stop-color="#FCF6BA"/>
          <stop offset="50%" stop-color="#B38728"/>
          <stop offset="75%" stop-color="#FBF5B7"/>
          <stop offset="100%" stop-color="#AA771C"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="600" fill="#0A0A0A"/>

      <!-- 골드 보더 -->
      <rect x="20" y="20" width="984" height="560" rx="2" fill="none" stroke="url(#gold)" stroke-width="1.5"/>
      <rect x="30" y="30" width="964" height="540" rx="2" fill="none" stroke="url(#gold)" stroke-width="0.5" opacity="0.4"/>

      <!-- 코너 장식 -->
      <rect x="20" y="20" width="30" height="2" fill="url(#gold)"/>
      <rect x="20" y="20" width="2" height="30" fill="url(#gold)"/>
      <rect x="974" y="20" width="30" height="2" fill="url(#gold)"/>
      <rect x="1002" y="20" width="2" height="30" fill="url(#gold)"/>
      <rect x="20" y="578" width="30" height="2" fill="url(#gold)"/>
      <rect x="20" y="550" width="2" height="30" fill="url(#gold)"/>
      <rect x="974" y="578" width="30" height="2" fill="url(#gold)"/>
      <rect x="1002" y="550" width="2" height="30" fill="url(#gold)"/>

      <text x="512" y="180" font-family="Noto Sans KR, Arial, sans-serif" font-size="14" fill="url(#gold)" text-anchor="middle" letter-spacing="10" opacity="0.7">${esc(d.company)}</text>

      <text x="512" y="290" font-family="Noto Sans KR, Georgia, serif" font-size="64" font-weight="bold" fill="url(#gold)" text-anchor="middle">${esc(d.name)}</text>

      <line x1="400" y1="320" x2="624" y2="320" stroke="url(#gold)" stroke-width="0.8" opacity="0.5"/>

      <text x="512" y="360" font-family="Noto Sans KR, Arial, sans-serif" font-size="18" fill="#888" text-anchor="middle" letter-spacing="4">${esc(d.title)}</text>

      <text x="512" y="460" font-family="Noto Sans KR, Arial, sans-serif" font-size="15" fill="#666" text-anchor="middle">${esc(d.phone)}  ·  ${esc(d.email)}</text>
    </svg>`;
  },
};

async function generateCard(data, templateName = 'minimal') {
  const tmpl = templates[templateName] || templates.minimal;
  const svg = tmpl(data);

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  const base64 = pngBuffer.toString('base64');
  const dataUrl = `data:image/png;base64,${base64}`;

  // 파일도 저장 (로컬 테스트용)
  const filename = `card_${templateName}_${Date.now()}.png`;
  const filepath = path.join(OUTPUT_DIR, filename);
  await sharp(pngBuffer).toFile(filepath).catch(() => {});

  console.log(`[Generator] ${templateName} 명함 생성`);
  return { filepath, filename, dataUrl, pngBuffer };
}

module.exports = { generateCard, templates: Object.keys(templates) };
