function renderDeptMenu() {
  const menu = document.getElementById("dept-menu");
  if (!menu) return;

  menu.innerHTML = `
    <h2 class="dept-menu__title">부서</h2>
    <p class="dept-menu__desc">업무를 진행할 부서를 선택하세요.</p>
    <div class="dept-menu__grid">
      ${TEAMS.map(
        (team) => `
        <button type="button" class="dept-menu__item" data-dept="${team.id}">
          <span class="dept-menu__icon">${team.icon}</span>
          <span class="dept-menu__name">${team.name}</span>
        </button>
      `
      ).join("")}
    </div>
  `;

  menu.querySelectorAll("[data-dept]").forEach((button) => {
    button.addEventListener("click", () => openDeptPage(button.dataset.dept));
  });
}

function openDeptPage(deptId) {
  const team = TEAMS.find((item) => item.id === deptId);
  if (!team) return;

  const menu = document.getElementById("dept-menu");
  const view = document.getElementById("dept-view");
  if (!menu || !view) return;

  menu.hidden = true;
  view.hidden = false;
  view.innerHTML = `
    <button type="button" class="dept-page__back" id="dept-back">← 부서 목록</button>
    <div class="dept-page">
      <span class="dept-page__icon">${team.icon}</span>
      <h2 class="dept-page__name">${team.name}</h2>
      <p class="dept-page__role">${team.role}</p>
    </div>
  `;

  document.getElementById("dept-back").addEventListener("click", showDeptMenu);
}

function showDeptMenu() {
  const menu = document.getElementById("dept-menu");
  const view = document.getElementById("dept-view");
  if (!menu || !view) return;

  menu.hidden = false;
  view.hidden = true;
  view.innerHTML = "";
}

function initDeptNavigation() {
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.dataset.panel !== "panel-home") {
        showDeptMenu();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderDeptMenu();
  initDeptNavigation();
});
