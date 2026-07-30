const STORAGE_KEY = "ehs365-attendance";

const STATUS = {
  IDLE: "idle",
  WORKING: "working",
  AWAY: "away",
  FINISHED: "finished",
};

const STATUS_LABELS = {
  [STATUS.IDLE]: "출근 전",
  [STATUS.WORKING]: "근무 중",
  [STATUS.AWAY]: "외출 중",
  [STATUS.FINISHED]: "퇴근 완료",
};

const ACTION_LABELS = {
  clockIn: "출근",
  goOut: "외출",
  return: "복귀",
  clockOut: "퇴근",
};

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(date) {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatDate(date) {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function formatDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function createEmptyState(date = todayKey()) {
  return {
    date,
    status: STATUS.IDLE,
    logs: [],
  };
}

function migrateLegacyData(raw) {
  if (raw.records) return raw;
  if (raw.date && Array.isArray(raw.logs)) {
    return { records: { [raw.date]: { status: raw.status, logs: raw.logs } } };
  }
  return { records: {} };
}

function loadStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { records: {} };
    return migrateLegacyData(JSON.parse(raw));
  } catch {
    return { records: {} };
  }
}

function saveStorage(storage) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

function loadState() {
  const storage = loadStorage();
  const today = todayKey();

  if (!storage.records[today]) {
    storage.records[today] = createEmptyState(today);
    saveStorage(storage);
  }

  return {
    storage,
    state: {
      date: today,
      status: storage.records[today].status,
      logs: storage.records[today].logs,
    },
  };
}

function saveState(storage, state) {
  storage.records[state.date] = {
    status: state.status,
    logs: state.logs,
  };
  saveStorage(storage);
}

function addLog(state, action) {
  state.logs.push({
    action,
    time: new Date().toISOString(),
  });
}

function renderLogItems(logs) {
  return logs
    .map(
      (log) => `
      <li class="log__item">
        <span class="log__item-label">${ACTION_LABELS[log.action]}</span>
        <span class="log__item-time">${formatTime(new Date(log.time))}</span>
      </li>
    `
    )
    .join("");
}

function getDaySummary(logs) {
  const clockIn = logs.find((log) => log.action === "clockIn");
  const clockOut = logs.find((log) => log.action === "clockOut");

  const parts = [];
  if (clockIn) parts.push(`출근 ${formatTime(new Date(clockIn.time))}`);
  if (clockOut) parts.push(`퇴근 ${formatTime(new Date(clockOut.time))}`);

  return parts.length > 0 ? parts.join(" · ") : `${logs.length}건`;
}

const elements = {
  todayDate: document.getElementById("today-date"),
  statusBadge: document.getElementById("status-badge"),
  statusTime: document.getElementById("status-time"),
  logList: document.getElementById("log-list"),
  historyList: document.getElementById("history-list"),
  btnClockIn: document.getElementById("btn-clock-in"),
  btnGoOut: document.getElementById("btn-go-out"),
  btnReturn: document.getElementById("btn-return"),
  btnClockOut: document.getElementById("btn-clock-out"),
};

let { storage, state } = loadState();
let clockTimer = null;

function getLatestTime() {
  if (state.logs.length === 0) return null;
  return new Date(state.logs[state.logs.length - 1].time);
}

function updateClock() {
  const latest = getLatestTime();
  elements.statusTime.textContent = latest ? formatTime(latest) : "—";
}

function renderLogs() {
  if (state.logs.length === 0) {
    elements.logList.innerHTML =
      '<li class="log__empty">아직 기록이 없습니다.</li>';
    return;
  }

  elements.logList.innerHTML = renderLogItems(state.logs);
}

function renderHistory() {
  const today = todayKey();
  const pastDates = Object.keys(storage.records)
    .filter((date) => date !== today && storage.records[date].logs.length > 0)
    .sort((a, b) => b.localeCompare(a));

  if (pastDates.length === 0) {
    elements.historyList.innerHTML =
      '<p class="log__empty">이전 기록이 없습니다.</p>';
    return;
  }

  elements.historyList.innerHTML = pastDates
    .map((date) => {
      const { logs } = storage.records[date];
      return `
        <details class="history-day">
          <summary class="history-day__summary">
            <span class="history-day__date">${formatDateKey(date)}</span>
            <span class="history-day__meta">${getDaySummary(logs)}</span>
          </summary>
          <ul class="log__list">${renderLogItems(logs)}</ul>
        </details>
      `;
    })
    .join("");
}

function updateButtons() {
  const { status } = state;

  elements.btnClockIn.disabled = status !== STATUS.IDLE;
  elements.btnGoOut.disabled = status !== STATUS.WORKING;
  elements.btnReturn.disabled = status !== STATUS.AWAY;
  elements.btnClockOut.disabled = status !== STATUS.WORKING;
}

function render() {
  elements.statusBadge.textContent = STATUS_LABELS[state.status];
  updateButtons();
  updateClock();
  renderLogs();
  renderHistory();
}

function handleAction(action, nextStatus) {
  addLog(state, action);
  state.status = nextStatus;
  saveState(storage, state);
  render();
}

elements.btnClockIn.addEventListener("click", () => {
  handleAction("clockIn", STATUS.WORKING);
});

elements.btnGoOut.addEventListener("click", () => {
  handleAction("goOut", STATUS.AWAY);
});

elements.btnReturn.addEventListener("click", () => {
  handleAction("return", STATUS.WORKING);
});

elements.btnClockOut.addEventListener("click", () => {
  if (!confirm("퇴근하시겠습니까?")) return;
  handleAction("clockOut", STATUS.FINISHED);
});

elements.todayDate.textContent = formatDate(new Date());
render();

clockTimer = setInterval(updateClock, 1000);
