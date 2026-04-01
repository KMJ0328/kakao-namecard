// ═══════════════════════════════════════════════════
// 카카오톡 챗봇 명함 서비스 — 스킬 서버
// ═══════════════════════════════════════════════════
process.env.FONTCONFIG_FILE = process.env.FONTCONFIG_FILE || require('path').join(__dirname, 'fonts', 'fonts.conf');
process.env.PANGOCAIRO_BACKEND = 'fontconfig';

const express = require('express');
const path = require('path');
const { generateCard, getRecommendedTemplates, INDUSTRY_TEMPLATES } = require('./generator');

const app = express();
app.use(express.json());
app.use('/cards', express.static(path.join(__dirname, 'output')));

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

const imageCache = new Map();

// ═══ 카카오 스킬 응답 헬퍼 ═══
function simpleText(text) {
  return { version: '2.0', template: { outputs: [{ simpleText: { text } }] } };
}

function quickReplies(text, replies) {
  return {
    version: '2.0',
    template: {
      outputs: [{ simpleText: { text } }],
      quickReplies: replies.map(r => ({ label: r.label, action: 'message', messageText: r.message || r.label })),
    },
  };
}

// ═══ 업종 목록 ═══
const INDUSTRIES = Object.keys(INDUSTRY_TEMPLATES);
const INDUSTRY_REPLIES_1 = [
  { label: 'IT/테크', message: '업종:IT/테크' },
  { label: '디자인', message: '업종:디자인' },
  { label: '금융/보험', message: '업종:금융/보험' },
  { label: '교육', message: '업종:교육' },
  { label: '요식업', message: '업종:요식업' },
  { label: '더보기', message: '업종더보기' },
];

const INDUSTRY_REPLIES_2 = [
  { label: '의료/건강', message: '업종:의료/건강' },
  { label: '부동산', message: '업종:부동산' },
  { label: '뷰티/패션', message: '업종:뷰티/패션' },
  { label: '법률', message: '업종:법률' },
  { label: '건설', message: '업종:건설' },
  { label: '더보기2', message: '업종더보기2' },
];

const INDUSTRY_REPLIES_3 = [
  { label: '마케팅/광고', message: '업종:마케팅/광고' },
  { label: '예술/문화', message: '업종:예술/문화' },
  { label: '기타', message: '업종:기타' },
  { label: '건너뛰기', message: '업종:건너뛰기' },
];

// ═══ 컬러 프리셋 ═══
const COLOR_PRESETS = {
  '블루':   { main: '#2563EB', sub: '#EFF6FF' },
  '레드':   { main: '#DC2626', sub: '#FEF2F2' },
  '그린':   { main: '#16A34A', sub: '#F0FDF4' },
  '퍼플':   { main: '#7C3AED', sub: '#F5F3FF' },
  '오렌지': { main: '#EA580C', sub: '#FFF7ED' },
  '핑크':   { main: '#DB2777', sub: '#FDF2F8' },
  '다크':   { main: '#00F5FF', sub: '#0D0D1A' },
  '골드':   { main: '#BF953F', sub: '#0A0A0A' },
  '블랙':   { main: '#111111', sub: '#FFFFFF' },
  '네이비': { main: '#0F3460', sub: '#F5F5F5' },
};

const COLOR_REPLIES_1 = [
  { label: '블루', message: '컬러:블루' },
  { label: '레드', message: '컬러:레드' },
  { label: '그린', message: '컬러:그린' },
  { label: '퍼플', message: '컬러:퍼플' },
  { label: '더보기', message: '컬러더보기' },
];

const COLOR_REPLIES_2 = [
  { label: '오렌지', message: '컬러:오렌지' },
  { label: '핑크', message: '컬러:핑크' },
  { label: '다크', message: '컬러:다크' },
  { label: '골드', message: '컬러:골드' },
  { label: '블랙', message: '컬러:블랙' },
  { label: '네이비', message: '컬러:네이비' },
];

// ═══ 템플릿 한글 매핑 ═══
const TEMPLATE_MAP = {
  '미니멀': 'minimal', '코퍼레이트': 'corporate', '크리에이티브': 'creative',
  '다크': 'dark', '선셋': 'sunset', '모노': 'mono', '네이처': 'nature', '럭셔리': 'luxury',
};
const TEMPLATE_NAME_KR = Object.fromEntries(Object.entries(TEMPLATE_MAP).map(([k, v]) => [v, k]));

// ═══ 세션 ═══
// step: init → input → industry → color → qr → template → done
const sessions = new Map();
function getSession(userId) {
  if (!sessions.has(userId)) sessions.set(userId, { step: 'init', data: {} });
  return sessions.get(userId);
}

// ═══ 입력 파싱: "이름/직함/회사/연락처/이메일" ═══
function parseInput(text) {
  const parts = text.split('/').map(s => s.trim());
  if (parts.length >= 4) {
    return {
      name: parts[0],
      title: parts[1],
      company: parts[2],
      phone: parts[3],
      email: parts[4] || '',
    };
  }
  return null;
}

// 업종별 추천 템플릿으로 quick replies 생성
function templateRepliesFromIndustry(industry) {
  const recommended = getRecommendedTemplates(industry);
  const replies = recommended.map(t => ({
    label: `${TEMPLATE_NAME_KR[t]} (추천)`,
    message: TEMPLATE_NAME_KR[t],
  }));
  replies.push({ label: '전체보기', message: '전체보기' });
  return replies;
}

const ALL_TEMPLATE_REPLIES_1 = [
  { label: '미니멀', message: '미니멀' },
  { label: '다크', message: '다크' },
  { label: '럭셔리', message: '럭셔리' },
  { label: '코퍼레이트', message: '코퍼레이트' },
  { label: '더보기', message: '템플릿더보기' },
];

const ALL_TEMPLATE_REPLIES_2 = [
  { label: '크리에이티브', message: '크리에이티브' },
  { label: '선셋', message: '선셋' },
  { label: '모노', message: '모노' },
  { label: '네이처', message: '네이처' },
];

// ═══ 스킬 엔드포인트 ═══
app.post('/skill/start', (req, res) => {
  const userId = req.body.userRequest?.user?.id || 'unknown';
  sessions.set(userId, { step: 'input', data: {} });
  res.json(simpleText(
    '안녕하세요! 나만의 명함을 만들어 드릴게요.\n\n' +
    '아래 형식으로 한 번에 입력해주세요:\n\n' +
    '이름 / 직함 / 회사 / 연락처 / 이메일\n\n' +
    '예) 김민재 / 디렉터 / Nexus Studio / 010-1234-5678 / minjae@nexus.kr'
  ));
});

app.post('/skill/input', async (req, res) => {
  const userId = req.body.userRequest?.user?.id || 'unknown';
  const utterance = (req.body.userRequest?.utterance || '').trim();
  const session = getSession(userId);

  try {
    // ─── 명함 만들기 / 다시 만들기 ───
    if (utterance === '명함 만들기' || utterance === '다시 만들기') {
      sessions.set(userId, { step: 'input', data: {} });
      return res.json(simpleText(
        '명함 정보를 입력해주세요:\n\n' +
        '이름 / 직함 / 회사 / 연락처 / 이메일\n\n' +
        '예) 김민재 / 디렉터 / Nexus Studio / 010-1234-5678 / minjae@nexus.kr'
      ));
    }

    // ─── 디자인 변경 ───
    if ((utterance === '디자인 변경' || utterance === '다른 디자인') && session.data.name) {
      session.step = 'template';
      if (session.data.industry) {
        return res.json(quickReplies('다른 디자인을 선택해주세요.', templateRepliesFromIndustry(session.data.industry)));
      }
      return res.json(quickReplies('디자인을 선택해주세요.', ALL_TEMPLATE_REPLIES_1));
    }

    // ─── 업종 선택 ───
    if (utterance === '업종더보기') {
      return res.json(quickReplies('업종을 선택해주세요.', INDUSTRY_REPLIES_2));
    }
    if (utterance === '업종더보기2') {
      return res.json(quickReplies('업종을 선택해주세요.', INDUSTRY_REPLIES_3));
    }
    if (utterance.startsWith('업종:') && session.step === 'industry') {
      const industry = utterance.replace('업종:', '');
      if (industry !== '건너뛰기') {
        session.data.industry = industry;
      }
      session.step = 'color';
      return res.json(quickReplies(
        `${session.data.industry ? `업종: ${session.data.industry}\n\n` : ''}` +
        '명함 컬러를 선택해주세요.\n메인컬러가 아이콘과 포인트 색상에 적용됩니다.',
        COLOR_REPLIES_1
      ));
    }

    // ─── 컬러 선택 ───
    if (utterance === '컬러더보기') {
      return res.json(quickReplies('컬러를 선택해주세요.', COLOR_REPLIES_2));
    }
    if (utterance.startsWith('컬러:') && session.step === 'color') {
      const colorName = utterance.replace('컬러:', '');
      const preset = COLOR_PRESETS[colorName];
      if (preset) {
        session.data.mainColor = preset.main;
        session.data.subColor = preset.sub;
      }
      session.step = 'qr';
      return res.json(quickReplies(
        `컬러: ${colorName}\n\n` +
        'QR코드를 명함에 넣으시겠어요?\n홈페이지, 인스타그램 등 URL을 입력하면 QR코드가 생성됩니다.',
        [
          { label: 'QR 넣기', message: 'QR입력' },
          { label: '건너뛰기', message: 'QR건너뛰기' },
        ]
      ));
    }

    // ─── QR코드 입력 ───
    if (utterance === 'QR입력' && session.step === 'qr') {
      session.step = 'qr_url';
      return res.json(simpleText(
        'QR코드에 넣을 URL을 입력해주세요.\n\n' +
        '예)\nhttps://instagram.com/myshop\nhttps://mycompany.com'
      ));
    }
    if (utterance === 'QR건너뛰기' && session.step === 'qr') {
      session.step = 'template';
      if (session.data.industry) {
        return res.json(quickReplies(
          `${session.data.name} | ${session.data.title}\n업종별 추천 디자인입니다.`,
          templateRepliesFromIndustry(session.data.industry)
        ));
      }
      return res.json(quickReplies(
        `${session.data.name} | ${session.data.title}\n디자인을 선택해주세요.`,
        ALL_TEMPLATE_REPLIES_1
      ));
    }
    if (session.step === 'qr_url') {
      // URL 형태인지 간단 체크
      if (utterance.startsWith('http://') || utterance.startsWith('https://')) {
        session.data.qrUrl = utterance;
        session.step = 'template';
        if (session.data.industry) {
          return res.json(quickReplies(
            `QR코드 URL 등록 완료!\n\n${session.data.name} | ${session.data.title}\n업종별 추천 디자인입니다.`,
            templateRepliesFromIndustry(session.data.industry)
          ));
        }
        return res.json(quickReplies(
          `QR코드 URL 등록 완료!\n\n${session.data.name} | ${session.data.title}\n디자인을 선택해주세요.`,
          ALL_TEMPLATE_REPLIES_1
        ));
      }
      return res.json(simpleText('URL 형식이 아닙니다. http:// 또는 https://로 시작하는 주소를 입력해주세요.'));
    }

    // ─── 전체보기 / 템플릿 더보기 ───
    if (utterance === '전체보기' || utterance === '템플릿더보기') {
      if (utterance === '전체보기') {
        return res.json(quickReplies('전체 디자인 목록입니다.', ALL_TEMPLATE_REPLIES_1));
      }
      return res.json(quickReplies('디자인을 선택해주세요.', ALL_TEMPLATE_REPLIES_2));
    }

    // ─── 템플릿 선택 → 명함 생성 ───
    if (session.step === 'template' && TEMPLATE_MAP[utterance]) {
      const templateName = TEMPLATE_MAP[utterance];
      const { pngBuffer } = await generateCard(session.data, templateName);
      const imgId = `img_${Date.now()}`;
      imageCache.set(imgId, pngBuffer);
      session.step = 'done';
      const imgUrl = `${BASE_URL}/image/${imgId}`;

      const desc = [
        `${session.data.company} | ${session.data.title}`,
        session.data.industry ? `업종: ${session.data.industry}` : '',
        session.data.qrUrl ? 'QR코드 포함' : '',
      ].filter(Boolean).join('\n');

      return res.json({
        version: '2.0',
        template: {
          outputs: [{
            basicCard: {
              title: `${session.data.name}의 명함 — ${utterance}`,
              description: desc,
              thumbnail: { imageUrl: imgUrl },
              buttons: [
                { label: '이미지 저장', action: 'webLink', webLinkUrl: `${BASE_URL}/download/${imgId}` },
                { label: '다른 디자인', action: 'message', messageText: '디자인 변경' },
                { label: '새로 만들기', action: 'message', messageText: '다시 만들기' },
              ],
            },
          }],
        },
      });
    }

    // ─── 한 줄 입력 파싱 ───
    const parsed = parseInput(utterance);
    if (parsed) {
      session.data = { ...session.data, ...parsed };
      session.step = 'industry';
      return res.json(quickReplies(
        `${parsed.name} | ${parsed.title} | ${parsed.company}\n\n업종을 선택해주세요.\n업종에 맞는 디자인을 추천해드립니다.`,
        INDUSTRY_REPLIES_1
      ));
    }

    // ─── 형식 안내 ───
    return res.json(simpleText(
      '이름/직함/회사/연락처/이메일\n예) 홍길동/CEO/회사/010-0000-0000/a@b.com'
    ));

  } catch (err) {
    console.error('[Server] 에러:', err);
    return res.json(simpleText('오류가 발생했습니다. 다시 시도해주세요.'));
  }
});

app.post('/skill/help', (req, res) => {
  res.json(simpleText(
    '사용법\n\n' +
    '1. 정보를 슬래시(/)로 구분해서 입력\n' +
    '   이름 / 직함 / 회사 / 연락처 / 이메일\n\n' +
    '2. 업종 선택 → 컬러 선택 → QR코드(선택)\n' +
    '3. 추천 디자인 중 선택\n' +
    '4. 명함 이미지 생성 & 저장!\n\n' +
    '무료로 무제한 생성 가능합니다.'
  ));
});

// ═══ 이미지 보기 (썸네일용) ═══
app.get('/image/:id', (req, res) => {
  const buf = imageCache.get(req.params.id);
  if (!buf) return res.status(404).send('이미지가 만료되었습니다.');
  res.set({ 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' });
  res.send(buf);
});

// ═══ 이미지 다운로드 ═══
app.get('/download/:id', (req, res) => {
  const buf = imageCache.get(req.params.id);
  if (!buf) return res.status(404).send('이미지가 만료되었습니다. 다시 생성해주세요.');
  res.set({ 'Content-Type': 'image/png', 'Content-Disposition': 'attachment; filename="namecard.png"' });
  res.send(buf);
});

// ═══ 테스트 UI ═══
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>명함 챗봇 테스트</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',sans-serif; background:#1a1a2e; display:flex; justify-content:center; align-items:flex-start; padding:30px; gap:24px; min-height:100vh; }

    .chat { width:420px; background:#fff; border-radius:20px; box-shadow:0 8px 40px rgba(0,0,0,0.3); overflow:hidden; }
    .header { background:linear-gradient(135deg,#3B1E54,#5B2C8E); color:#fff; padding:18px 20px; font-weight:bold; font-size:16px; }
    .header small { display:block; font-size:11px; opacity:0.6; margin-top:2px; font-weight:normal; }
    .messages { height:520px; overflow-y:auto; padding:16px; background:#FAFAFA; }
    .msg { margin:8px 0; max-width:82%; padding:11px 15px; border-radius:14px; font-size:13.5px; line-height:1.6; white-space:pre-wrap; word-break:break-word; }
    .bot { background:#fff; color:#333; border:1px solid #eee; border-bottom-left-radius:4px; }
    .user { background:#FEE500; color:#333; margin-left:auto; border-bottom-right-radius:4px; }
    .card-img { max-width:100%; border-radius:8px; margin-top:8px; cursor:pointer; transition:transform 0.2s; }
    .card-img:hover { transform:scale(1.02); }
    .quick { display:flex; gap:6px; flex-wrap:wrap; padding:10px 16px; background:#fff; border-top:1px solid #f0f0f0; }
    .quick button { background:#FEE500; border:none; padding:8px 14px; border-radius:20px; font-size:12px; cursor:pointer; font-weight:600; transition:all 0.15s; }
    .quick button:hover { background:#FAD800; transform:scale(1.05); }
    .input-area { display:flex; border-top:1px solid #eee; background:#fff; }
    .input-area input { flex:1; border:none; padding:15px; font-size:13.5px; outline:none; }
    .input-area button { background:#FEE500; border:none; padding:15px 22px; font-weight:bold; cursor:pointer; font-size:14px; }

    .form-panel { width:320px; background:#fff; border-radius:20px; box-shadow:0 8px 40px rgba(0,0,0,0.3); overflow:hidden; }
    .form-panel .fheader { background:linear-gradient(135deg,#0F3460,#16537E); color:#fff; padding:18px 20px; font-weight:bold; }
    .form-panel .fheader small { display:block; font-size:11px; opacity:0.6; margin-top:2px; font-weight:normal; }
    .form-body { padding:20px; }
    .form-body label { display:block; font-size:11px; color:#888; margin-bottom:4px; margin-top:14px; letter-spacing:1px; }
    .form-body label:first-child { margin-top:0; }
    .form-body input { width:100%; padding:10px 12px; border:1.5px solid #e0e0e0; border-radius:8px; font-size:13px; outline:none; transition:border 0.2s; }
    .form-body input:focus { border-color:#3B1E54; }
    .form-btn { width:100%; margin-top:20px; padding:13px; background:linear-gradient(135deg,#3B1E54,#5B2C8E); color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:bold; cursor:pointer; transition:opacity 0.2s; }
    .form-btn:hover { opacity:0.9; }
  </style>
</head>
<body>
  <div class="chat">
    <div class="header">
      명함 만들기 챗봇
      <small>카카오톡 시뮬레이터</small>
    </div>
    <div class="messages" id="msgs"></div>
    <div class="quick" id="quick"></div>
    <div class="input-area">
      <input id="input" placeholder="이름 / 직함 / 회사 / 연락처 / 이메일" onkeydown="if(event.key==='Enter')send()">
      <button onclick="send()">전송</button>
    </div>
  </div>

  <div class="form-panel">
    <div class="fheader">
      빠른 입력
      <small>폼으로 한 번에 입력</small>
    </div>
    <div class="form-body">
      <label>이름</label>
      <input id="f_name" value="김민재" placeholder="홍길동">
      <label>직함</label>
      <input id="f_title" value="디렉터" placeholder="CEO, 개발자 등">
      <label>회사</label>
      <input id="f_company" value="Nexus Studio" placeholder="회사명 또는 소속">
      <label>연락처</label>
      <input id="f_phone" value="010-1234-5678" placeholder="010-0000-0000">
      <label>이메일</label>
      <input id="f_email" value="minjae@nexus.kr" placeholder="you@email.com">
      <button class="form-btn" onclick="quickFill()">챗봇에 전송</button>
    </div>
  </div>

  <script>
    let userId = 'test_' + Date.now();

    function addMsg(text, isUser, imageUrl) {
      const div = document.createElement('div');
      div.className = 'msg ' + (isUser ? 'user' : 'bot');
      div.textContent = text;
      if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'card-img';
        img.onclick = () => {
          const a = document.createElement('a');
          a.href = imageUrl;
          a.download = 'namecard.png';
          a.click();
        };
        div.appendChild(img);
      }
      document.getElementById('msgs').appendChild(div);
      document.getElementById('msgs').scrollTop = 999999;
    }

    function setQuickReplies(replies) {
      const qr = document.getElementById('quick');
      qr.innerHTML = '';
      (replies || []).forEach(r => {
        const btn = document.createElement('button');
        btn.textContent = r.label;
        btn.onclick = () => sendText(r.messageText || r.label);
        qr.appendChild(btn);
      });
    }

    async function sendText(text) {
      addMsg(text, true);
      document.getElementById('quick').innerHTML = '';
      const res = await fetch('/skill/input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRequest: { user: { id: userId }, utterance: text } }),
      });
      const data = await res.json();
      handleResponse(data);
    }

    function send() {
      const input = document.getElementById('input');
      if (!input.value.trim()) return;
      sendText(input.value.trim());
      input.value = '';
    }

    function quickFill() {
      const name = document.getElementById('f_name').value.trim();
      const title = document.getElementById('f_title').value.trim();
      const company = document.getElementById('f_company').value.trim();
      const phone = document.getElementById('f_phone').value.trim();
      const email = document.getElementById('f_email').value.trim();
      if (!name) return alert('이름을 입력하세요');
      sendText(name + ' / ' + title + ' / ' + company + ' / ' + phone + ' / ' + email);
    }

    function handleResponse(data) {
      const tmpl = data.template;
      if (!tmpl) return;
      tmpl.outputs?.forEach(o => {
        if (o.simpleText) addMsg(o.simpleText.text, false);
        if (o.basicCard) {
          const c = o.basicCard;
          addMsg(c.title + '\\n' + (c.description || ''), false, c.thumbnail?.imageUrl);
          if (c.buttons) {
            setQuickReplies(c.buttons.filter(b => b.action === 'message').map(b => ({
              label: b.label, messageText: b.messageText || b.label,
            })));
          }
        }
      });
      if (tmpl.quickReplies) setQuickReplies(tmpl.quickReplies);
    }

    fetch('/skill/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userRequest: { user: { id: userId } } }),
    }).then(r => r.json()).then(handleResponse);
  </script>
</body>
</html>`);
});

// ═══ 헬스체크 ═══
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n  명함 챗봇 서버: http://localhost:${PORT}`);
  console.log(`  카카오 스킬 URL: http://localhost:${PORT}/skill/input\n`);

  // Render 무료 플랜 슬립 방지 — 13분마다 self-ping
  if (process.env.BASE_URL) {
    const ping = () => fetch(`${process.env.BASE_URL}/health`).catch(() => {});
    ping();
    setInterval(ping, 13 * 60 * 1000);
    console.log('  keep-alive ping 활성화됨\n');
  } else {
    console.log('  ⚠ BASE_URL 미설정 — keep-alive 비활성\n');
  }
});
