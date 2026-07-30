const COMPANY = {
  name: "EHS 365",
  subtitle: "Project Compass",
  slogan: "하루 1% 성장해서 1년 뒤 새로운 커리어를 만든다.",
};

const CEO = {
  name: "제이미",
  title: "대표",
  department: "경영",
  joinDate: "2026년 7월 29일",
  employeeId: "EHS-20260729-001",
};

const LEVELS = [
  { level: 1, title: "Safety Trainee" },
  { level: 2, title: "Safety Associate" },
  { level: 3, title: "Safety Specialist" },
  { level: 4, title: "EHS Coordinator" },
  { level: 5, title: "EHS Professional" },
  { level: 6, title: "Senior EHS Professional" },
  { level: 7, title: "EHS Manager" },
  { level: 8, title: "Smart EHS Professional" },
];

const LEVEL_STORAGE_KEY = "ehs365-level";

function getUserLevel() {
  try {
    const stored = localStorage.getItem(LEVEL_STORAGE_KEY);
    const level = stored ? parseInt(stored, 10) : 1;
    if (Number.isNaN(level)) return 1;
    return Math.min(Math.max(level, 1), LEVELS.length);
  } catch {
    return 1;
  }
}

function getLevelInfo(level = getUserLevel()) {
  return LEVELS.find((item) => item.level === level) || LEVELS[0];
}

const TEAMS = [
  {
    id: "education",
    name: "교육팀",
    leader: "프로페서",
    role: "하루 30분 커리큘럼 · 실무 중심 강의",
    icon: "📚",
  },
  {
    id: "exam",
    name: "출제팀",
    leader: "퀴즈마스터",
    role: "매일 10문제 · 자동 채점 · 오답 분석",
    icon: "✏️",
  },
  {
    id: "analytics",
    name: "분석팀",
    leader: "인사이트",
    role: "주간·월간 성장 분석 · 시각화",
    icon: "📊",
  },
  {
    id: "hr",
    name: "인사팀",
    leader: "키퍼",
    role: "출석 · 공부시간 · 레벨 · 배지",
    icon: "👥",
  },
  {
    id: "career",
    name: "취업전략팀",
    leader: "커리어",
    role: "채용공고 분석 · 자소서 · 면접",
    icon: "🎯",
  },
  {
    id: "ai-dev",
    name: "AI개발팀",
    leader: "빌더",
    role: "AI 직원 관리 · Python · 자동화",
    icon: "🤖",
  },
];

function renderIdCard() {
  const card = document.getElementById("id-card");
  if (!card) return;

  const levelInfo = getLevelInfo();

  card.innerHTML = `
    <div class="id-card__header">
      <div class="id-card__brand">
        <span class="id-card__brand-name">${COMPANY.name}</span>
        <span class="id-card__brand-sub">${COMPANY.subtitle}</span>
      </div>
      <span class="id-card__type">EMPLOYEE ID</span>
    </div>
    <div class="id-card__body">
      <div class="id-card__photo">
        <span class="id-card__initials">${CEO.name.charAt(0)}</span>
        <span class="id-card__level-badge">Lv.${levelInfo.level}</span>
      </div>
      <div class="id-card__info">
        <p class="id-card__name">${CEO.name}</p>
        <p class="id-card__title">${CEO.title}</p>
        <p class="id-card__level-title">${levelInfo.title}</p>
        <dl class="id-card__details">
          <div class="id-card__detail">
            <dt>레벨</dt>
            <dd>Lv.${levelInfo.level} · ${levelInfo.title}</dd>
          </div>
          <div class="id-card__detail">
            <dt>부서</dt>
            <dd>${CEO.department}</dd>
          </div>
          <div class="id-card__detail">
            <dt>입사일</dt>
            <dd>${CEO.joinDate}</dd>
          </div>
          <div class="id-card__detail">
            <dt>사번</dt>
            <dd>${CEO.employeeId}</dd>
          </div>
        </dl>
      </div>
    </div>
    <div class="id-card__footer">
      <p class="id-card__slogan">${COMPANY.slogan}</p>
    </div>
  `;
}

function renderOrgChart() {
  const chart = document.getElementById("org-chart");
  if (!chart) return;

  const teamCards = TEAMS.map(
    (team) => `
    <div class="org-team">
      <span class="org-team__icon">${team.icon}</span>
      <p class="org-team__name">${team.name}</p>
      <p class="org-team__leader">${team.leader}</p>
      <p class="org-team__role">${team.role}</p>
    </div>
  `
  ).join("");

  chart.innerHTML = `
    <div class="org-tree">
      <div class="org-ceo">
        <div class="org-ceo__avatar">${CEO.name.charAt(0)}</div>
        <p class="org-ceo__name">${CEO.name}</p>
        <p class="org-ceo__title">${CEO.title}</p>
      </div>
      <div class="org-connector"></div>
      <div class="org-teams">${teamCards}</div>
    </div>
  `;
}

function initTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  const panels = document.querySelectorAll(".panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.panel;

      tabs.forEach((t) => t.classList.remove("nav-tab--active"));
      panels.forEach((p) => p.classList.remove("panel--active"));

      tab.classList.add("nav-tab--active");
      document.getElementById(target).classList.add("panel--active");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderIdCard();
  renderOrgChart();
  initTabs();
});
