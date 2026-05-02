const STORAGE_SUBJECTS_KEY = 'ssg_subjects';
const STORAGE_SCHEDULE_KEY = 'ssg_schedule';

// State
let subjects = [];
let schedule = [];
let editId = null;

// DOM Elements
const viewSetup = document.getElementById('view-setup');
const viewSchedule = document.getElementById('view-schedule');
const formSubject = document.getElementById('form-subject');
const subjectListEl = document.getElementById('subject-list');
const scheduleGridEl = document.getElementById('schedule-grid');
const statTotalTime = document.getElementById('stat-total-time');
const btnGenerate = document.getElementById('btn-generate');
const btnBack = document.getElementById('btn-back');
const toastEl = document.getElementById('toast');
const btnResetDemo = document.getElementById('btn-reset-demo');
const filterBtns = document.querySelectorAll('.filter-btn');

// Form elements cache
const btnSubmit = document.getElementById('btn-submit');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const formTitle = document.getElementById('form-title');
const inputName = document.getElementById('input-name');
const inputTime = document.getElementById('input-time');
const inputPriority = document.getElementById('input-priority');
const inputDlDay = document.getElementById('input-dl-day');
const inputDlMonth = document.getElementById('input-dl-month');
const inputDlYear = document.getElementById('input-dl-year');

// Helper: lock or unlock all form fields
function setFormLocked(locked) {
  btnSubmit.disabled = locked;
  inputName.disabled = locked;
  inputTime.disabled = locked;
  inputPriority.disabled = locked;
  inputDlDay.disabled = locked;
  inputDlMonth.disabled = locked;
  inputDlYear.disabled = locked;
}

// Initialize
function init() {
  loadData();
  renderSubjects();
  setupEventListeners();

  const todayObj = new Date();
  const year = todayObj.getFullYear();
  const month = todayObj.getMonth() + 1;
  const day = todayObj.getDate();

  const monthNames = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];

  for (let i = 1; i <= 31; i++) inputDlDay.add(new Option(i, i));
  inputDlDay.value = day;

  for (let i = 1; i <= 12; i++) inputDlMonth.add(new Option(monthNames[i - 1], i));
  inputDlMonth.value = month;

  for (let i = year; i <= year + 5; i++) inputDlYear.add(new Option(i, i));
  inputDlYear.value = year;

  checkTotalTime();
}

// Data Management
function loadData() {
  const sData = localStorage.getItem(STORAGE_SUBJECTS_KEY);
  if (sData) subjects = JSON.parse(sData);
  const schData = localStorage.getItem(STORAGE_SCHEDULE_KEY);
  if (schData) schedule = JSON.parse(schData);
}

function saveData() {
  localStorage.setItem(STORAGE_SUBJECTS_KEY, JSON.stringify(subjects));
}

function saveSchedule() {
  localStorage.setItem(STORAGE_SCHEDULE_KEY, JSON.stringify(schedule));
}

async function loadDemoData() {
  try {
    const res = await fetch('./data/demo-data.json');
    if (res.ok) {
      subjects = await res.json();
      saveData();
      schedule = [];
      saveSchedule();
      renderSubjects();
      checkTotalTime();
      showToast('Демо-дані успішно відновлено');
      switchView('setup');
    }
  } catch (e) {
    console.error('Failed to load demo data', e);
  }
}

// UI Helpers
function switchView(view) {
  if (view === 'setup') {
    viewSetup.classList.remove('hidden');
    viewSetup.classList.add('active');
    viewSchedule.classList.add('hidden');
    viewSchedule.classList.remove('active');
  } else {
    viewSetup.classList.add('hidden');
    viewSetup.classList.remove('active');
    viewSchedule.classList.remove('hidden');
    viewSchedule.classList.add('active');
  }
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 3000);
}

// Date Formatting Helpers
function getFriendlyDateFromOffset(dayIndex) {
  if (dayIndex === 0) return 'Сьогодні';
  if (dayIndex === 1) return 'Завтра';
  if (dayIndex === 2) return 'Післязавтра';
  if (dayIndex < 0) return 'В минулому';

  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayIndex);

  const dayNames = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота'];
  const monthNamesGen = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];

  const wDay = dayNames[d.getDay()];
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = monthNamesGen[d.getMonth()];

  return `${wDay}, ${dd} ${mm}`;
}

function getFriendlyDateFromStr(dateStr) {
  if (!dateStr) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split('-');
  const dVal = new Date(y, m - 1, d);
  const dayIndex = Math.floor((dVal - today) / (1000 * 60 * 60 * 24));
  return getFriendlyDateFromOffset(dayIndex);
}

// Form & Validation
function checkTotalTime() {
  const total = subjects.reduce((sum, s) => sum + s.time, 0);
  statTotalTime.textContent = total;
  btnGenerate.disabled = subjects.length === 0 || schedule.length > 0;
}

function validateForm() {
  let isValid = true;

  if (inputName.value.trim().length < 3) {
    inputName.parentElement.classList.add('invalid');
    isValid = false;
  } else {
    inputName.parentElement.classList.remove('invalid');
  }

  const timeVal = parseInt(inputTime.value, 10);
  if (isNaN(timeVal) || timeVal < 30 || timeVal > 600) {
    inputTime.parentElement.classList.add('invalid');
    isValid = false;
  } else {
    inputTime.parentElement.classList.remove('invalid');
  }

  const daySel = parseInt(inputDlDay.value, 10);
  const monthSel = parseInt(inputDlMonth.value, 10);
  const yearSel = parseInt(inputDlYear.value, 10);

  const dVal = new Date(yearSel, monthSel - 1, daySel);
  const isDateValid = dVal.getFullYear() === yearSel && dVal.getMonth() === monthSel - 1 && dVal.getDate() === daySel;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const errorDeadline = document.getElementById('error-deadline');
  if (!isDateValid || dVal < now) {
    errorDeadline.parentElement.classList.add('invalid');
    isValid = false;
  } else {
    errorDeadline.parentElement.classList.remove('invalid');
  }

  btnSubmit.disabled = !isValid;
  return isValid;
}

// Event Listeners
function setupEventListeners() {
  inputName.addEventListener('input', validateForm);
  inputTime.addEventListener('input', validateForm);
  inputDlDay.addEventListener('change', validateForm);
  inputDlMonth.addEventListener('change', validateForm);
  inputDlYear.addEventListener('change', validateForm);

  formSubject.addEventListener('submit', handleFormSubmit);

  btnCancelEdit.addEventListener('click', cancelEdit);

  btnResetDemo.addEventListener('click', loadDemoData);

  btnGenerate.addEventListener('click', generateSchedule);

  btnBack.addEventListener('click', () => {
    switchView('setup');
    renderSubjects();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderSchedule(e.target.dataset.filter);
    });
  });
}

function handleFormSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const id = editId || 'subj-' + Date.now();
  const deadlineStr = `${inputDlYear.value}-${String(inputDlMonth.value).padStart(2, '0')}-${String(inputDlDay.value).padStart(2, '0')}`;

  const newSubj = {
    id,
    name: inputName.value.trim(),
    time: parseInt(inputTime.value, 10),
    deadline: deadlineStr,
    priority: inputPriority.value
  };

  if (editId) {
    const idx = subjects.findIndex(s => s.id === editId);
    if (idx > -1) {
      subjects[idx] = newSubj;
      showToast('Предмет оновлено');
    }
  } else {
    subjects.push(newSubj);
    showToast('Предмет додано');
  }

  saveData();
  renderSubjects();
  checkTotalTime();
  cancelEdit();
}

function cancelEdit() {
  editId = null;
  formSubject.reset();
  formTitle.textContent = 'Додати предмет';
  btnSubmit.textContent = 'Додати предмет';
  btnCancelEdit.classList.add('hidden');
  btnSubmit.disabled = true;
  document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
}

function editSubject(id) {
  const subj = subjects.find(s => s.id === id);
  if (!subj) return;

  editId = id;
  inputName.value = subj.name;
  inputTime.value = subj.time;
  const [y, m, d] = subj.deadline.split('-');
  inputDlYear.value = parseInt(y, 10);
  inputDlMonth.value = parseInt(m, 10);
  inputDlDay.value = parseInt(d, 10);
  inputPriority.value = subj.priority;

  formTitle.textContent = 'Редагувати предмет';
  btnSubmit.textContent = 'Зберегти зміни';
  btnCancelEdit.classList.remove('hidden');
  validateForm();
}

function deleteSubject(id) {
  subjects = subjects.filter(s => s.id !== id);
  saveData();
  renderSubjects();
  checkTotalTime();
  showToast('Предмет видалено');
}

// Rendering Subjects
function renderSubjects() {
  if (subjects.length === 0) {
    subjectListEl.innerHTML = `
      <div class="empty-state">
        <p>Список порожній. Додайте свій перший предмет.</p>
      </div>`;
    setFormLocked(false);
    return;
  }

  const isGenerated = schedule.length > 0;

  subjectListEl.innerHTML = subjects.map(s => `
    <div class="subject-item">
      <div class="subject-info">
        <h3>${s.name}</h3>
        <div class="subject-meta">
          <span>⏳ ${s.time} хв</span>
          <span title="${s.deadline}">📅 ${getFriendlyDateFromStr(s.deadline)}</span>
          <span class="badge ${s.priority}">${s.priority}</span>
        </div>
      </div>
      <div class="subject-actions">
        <button onclick="window.editSubject('${s.id}')" title="Редагувати" ${isGenerated ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>✏️</button>
        <button class="btn-delete" onclick="window.deleteSubject('${s.id}')" title="Видалити" ${isGenerated ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>🗑️</button>
      </div>
    </div>
  `).join('');

  // Також блокуємо всю форму додавання нових предметів
  setFormLocked(isGenerated);
}

// Generation Logic
function generateSchedule() {
  const priorityWeight = { 'Високий': 3, 'Середній': 2, 'Низький': 1 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Classify all subjects into Cat V, B, A
  let catV = [];
  let catB = [];
  let catA = [];

  for (const subj of subjects) {
    let dVal = new Date(0);
    if (subj.deadline) {
      const [y, m, d] = subj.deadline.split('-');
      dVal = new Date(y, m - 1, d);
    }
    const daysUntilDeadline = Math.floor((dVal - today) / (1000 * 60 * 60 * 24));
    const daysAvailable = Math.max(1, daysUntilDeadline + 1);

    const minReq = Math.ceil(subj.time / daysAvailable);
    const s = { ...subj, daysAvailable };

    if (minReq > 240) {
      catV.push(s);
    } else if (minReq > 120) {
      catB.push(s);
    } else {
      catA.push(s);
    }
  }

  // Sort function
  const sortFn = (a, b) => {
    const dateA = new Date(a.deadline).getTime();
    const dateB = new Date(b.deadline).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  };

  catV.sort(sortFn);
  catB.sort(sortFn);
  catA.sort(sortFn);

  schedule = [];
  const MAX_PER_DAY = 240;
  const dayLoads = new Array(2000).fill(0); // Arbitrarily large array for schedule days
  let sIdx = 0;

  // Helper to schedule a task trying to avoid loaded days
  function scheduleTask(subj, chunkLimit) {
    let remaining = subj.time;
    let days = [];
    for (let i = 0; i < subj.daysAvailable; i++) days.push(i);

    // Pass 1: Try to fit respecting chunkLimit and MAX_PER_DAY
    // Iterate chronologically to pack days to 240 and finish as early as possible
    for (let d of days) {
      if (remaining <= 0) break;
      let avail = MAX_PER_DAY - dayLoads[d];
      if (avail > 0) {
        let chunk = Math.min(remaining, avail, chunkLimit);

        // Не створювати сесії менше 30 хвилин
        if (chunk < 30) continue;

        // Уникати залишків менше 30 хвилин
        if (remaining - chunk > 0 && remaining - chunk < 30) {
          chunk = remaining - 30;
          if (chunk < 30) continue;
        }

        // Не розбивати малі завдання (<120 хв) на шматки, щоб заповнити дрібні "вікна"
        if (remaining <= 120 && chunk < remaining) {
          continue;
        }

        const absDate = new Date(today);
        absDate.setDate(today.getDate() + d);
        const dayDate = `${absDate.getFullYear()}-${String(absDate.getMonth() + 1).padStart(2, '0')}-${String(absDate.getDate()).padStart(2, '0')}`;

        schedule.push({
          id: `sess-${subj.id}-${sIdx++}`,
          subjectId: subj.id,
          name: subj.name,
          day: d,
          dayDate,
          duration: chunk,
          status: 'Pending'
        });
        dayLoads[d] += chunk;
        remaining -= chunk;
      }
    }

    // Pass 2: If remaining > 0, MUST squeeze it into daysAvailable
    if (remaining > 0) {
      let squeezeChunkLimit = 120; // Try to use 120 min chunks for squeezing to keep sessions manageable
      while (remaining > 0) {
        let sortedDays = [...days].sort((a, b) => dayLoads[a] - dayLoads[b]);
        let d = sortedDays[0];

        // Якщо залишок менше 30 хв, шукаємо існуючу сесію в БУДЬ-ЯКИЙ день, щоб не створювати нову мікро-сесію
        if (remaining < 30) {
          let anyExisting = schedule.find(s => s.subjectId === subj.id);
          if (anyExisting) {
            anyExisting.duration += remaining;
            dayLoads[anyExisting.day] += remaining;
            remaining = 0;
            break; // Завершуємо розподіл цього предмета
          }
        }

        let chunk = Math.min(remaining, squeezeChunkLimit);

        // Уникати залишків менше 30 хвилин при "втисканні"
        if (remaining - chunk > 0 && remaining - chunk < 30) {
          chunk = remaining; // Забираємо весь залишок, щоб не залишати хвости < 30 хв
        }

        let existing = schedule.find(s => s.subjectId === subj.id && s.day === d);
        if (existing) {
          existing.duration += chunk;
        } else {
          const absDate2 = new Date(today);
          absDate2.setDate(today.getDate() + d);
          const dayDate2 = `${absDate2.getFullYear()}-${String(absDate2.getMonth() + 1).padStart(2, '0')}-${String(absDate2.getDate()).padStart(2, '0')}`;

          schedule.push({
            id: `sess-${subj.id}-${sIdx++}`,
            subjectId: subj.id,
            name: subj.name,
            day: d,
            dayDate: dayDate2,
            duration: chunk,
            status: 'Pending'
          });
        }
        dayLoads[d] += chunk;
        remaining -= chunk;
      }
    }
  }

  // 1. Process Category V
  for (const subj of catV) {
    scheduleTask(subj, 240);
  }

  // 2. Process Category B
  for (const subj of catB) {
    scheduleTask(subj, 240);
  }

  // 3. Process Category A
  for (const subj of catA) {
    scheduleTask(subj, 240);
  }

  saveSchedule();
  renderSubjects(); // Оновити список: заблокувати форму та кнопки після генерації
  // Скинути фільтр на «Всі»
  filterBtns.forEach(b => b.classList.remove('active'));
  document.querySelector('[data-filter="All"]').classList.add('active');
  showToast('Розклад успішно згенеровано!');
  switchView('schedule');
  renderSchedule('All');
}

// Render Schedule
function renderSchedule(filter = 'All') {
  if (schedule.length === 0) {
    scheduleGridEl.innerHTML = `<div class="empty-state" style="grid-column: 1/-1">Розклад порожній.</div>`;
    return;
  }

  // Group by day
  const grouped = {};
  schedule.forEach(s => {
    if (filter !== 'All' && s.status !== filter) return;

    if (!grouped[s.day]) {
      grouped[s.day] = { name: getFriendlyDateFromStr(s.dayDate), sessions: [], total: 0 };
    }
    grouped[s.day].sessions.push(s);
    grouped[s.day].total += s.duration;
  });

  if (Object.keys(grouped).length === 0) {
    scheduleGridEl.innerHTML = `<div class="empty-state" style="grid-column: 1/-1">Немає сесій для цього фільтра.</div>`;
    return;
  }

  scheduleGridEl.innerHTML = Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).map(dKey => {
    const day = grouped[dKey];
    return `
      <div class="day-column">
        <div class="day-header">
          <span>${day.name}</span>
          <span class="day-stats">${day.total} хв</span>
        </div>
        ${day.total > 240 ? '<span class="warning-critical" style="margin-bottom: 0.5rem;">⚠️ Потрібно краще розподіляти свій час!</span>' : ''}
        ${day.total >= 210 && day.total <= 240 ? '<span class="warning-heavy-load" style="margin-bottom: 0.5rem;">💡 Настанова: не забувайте робити перерви!</span>' : ''}
        <div class="session-list">
          ${day.sessions.map(sess => `
            <div class="session-card status-${sess.status}">
              <div class="session-header">
                <h4>${sess.name}</h4>
                <span class="session-duration">${sess.duration} хв</span>
              </div>
              <div class="session-controls">
                <button class="session-btn mark-pending ${sess.status === 'Pending' ? 'active-Pending' : ''}" onclick="window.updateStatus('${sess.id}', 'Pending')">Очікує</button>
                <button class="session-btn mark-completed ${sess.status === 'Completed' ? 'active-Completed' : ''}" onclick="window.updateStatus('${sess.id}', 'Completed')">Готово</button>
                <button class="session-btn mark-missed ${sess.status === 'Missed' ? 'active-Missed' : ''}" onclick="window.updateStatus('${sess.id}', 'Missed')">Пропуск</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function updateStatus(sessionId, newStatus) {
  const sess = schedule.find(s => s.id === sessionId);
  if (sess) {
    sess.status = newStatus;
    saveSchedule();
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    renderSchedule(activeFilter);
  }
}

// Global scope bindings
window.editSubject = editSubject;
window.deleteSubject = deleteSubject;
window.updateStatus = updateStatus;

// Start app
init();
