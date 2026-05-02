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
const generationError = document.getElementById('generation-error');
const toastEl = document.getElementById('toast');
const btnResetDemo = document.getElementById('btn-reset-demo');
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialize
function init() {
  loadData();
  renderSubjects();
  setupEventListeners();
  
  // Set min date for deadline to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('input-deadline').min = today;
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

// Form & Validation
function checkTotalTime() {
  const total = subjects.reduce((sum, s) => sum + s.time, 0);
  statTotalTime.textContent = total;
  
  if (total > 1680) {
    statTotalTime.style.color = 'var(--text-error)';
    btnGenerate.disabled = true;
    generationError.classList.remove('hidden');
  } else {
    statTotalTime.style.color = 'inherit';
    btnGenerate.disabled = subjects.length === 0;
    generationError.classList.add('hidden');
  }
}

function validateForm() {
  let isValid = true;
  
  const nameInput = document.getElementById('input-name');
  if (nameInput.value.trim().length < 3) {
    nameInput.parentElement.classList.add('invalid');
    isValid = false;
  } else {
    nameInput.parentElement.classList.remove('invalid');
  }
  
  const timeInput = document.getElementById('input-time');
  const timeVal = parseInt(timeInput.value, 10);
  if (isNaN(timeVal) || timeVal < 15 || timeVal > 1200) {
    timeInput.parentElement.classList.add('invalid');
    isValid = false;
  } else {
    timeInput.parentElement.classList.remove('invalid');
  }
  
  const deadlineInput = document.getElementById('input-deadline');
  const dVal = new Date(deadlineInput.value);
  const now = new Date();
  now.setHours(0,0,0,0);
  if (!deadlineInput.value || dVal < now) {
    deadlineInput.parentElement.classList.add('invalid');
    isValid = false;
  } else {
    deadlineInput.parentElement.classList.remove('invalid');
  }

  const btnSubmit = document.getElementById('btn-submit');
  btnSubmit.disabled = !isValid;
  return isValid;
}

// Event Listeners
function setupEventListeners() {
  document.getElementById('input-name').addEventListener('input', validateForm);
  document.getElementById('input-time').addEventListener('input', validateForm);
  document.getElementById('input-deadline').addEventListener('input', validateForm);
  
  formSubject.addEventListener('submit', handleFormSubmit);
  
  document.getElementById('btn-cancel-edit').addEventListener('click', cancelEdit);
  
  btnResetDemo.addEventListener('click', loadDemoData);
  
  btnGenerate.addEventListener('click', generateSchedule);
  
  btnBack.addEventListener('click', () => switchView('setup'));
  
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
  const newSubj = {
    id,
    name: document.getElementById('input-name').value.trim(),
    time: parseInt(document.getElementById('input-time').value, 10),
    deadline: document.getElementById('input-deadline').value,
    difficulty: document.getElementById('input-difficulty').value
  };

  if (editId) {
    const idx = subjects.findIndex(s => s.id === editId);
    if (idx > -1) subjects[idx] = newSubj;
    showToast('Предмет оновлено');
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
  document.getElementById('form-title').textContent = 'Додати предмет';
  document.getElementById('btn-submit').textContent = 'Додати предмет';
  document.getElementById('btn-cancel-edit').classList.add('hidden');
  document.getElementById('btn-submit').disabled = true;
  document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
}

function editSubject(id) {
  const subj = subjects.find(s => s.id === id);
  if (!subj) return;
  
  editId = id;
  document.getElementById('input-name').value = subj.name;
  document.getElementById('input-time').value = subj.time;
  document.getElementById('input-deadline').value = subj.deadline;
  document.getElementById('input-difficulty').value = subj.difficulty;
  
  document.getElementById('form-title').textContent = 'Редагувати предмет';
  document.getElementById('btn-submit').textContent = 'Зберегти зміни';
  document.getElementById('btn-cancel-edit').classList.remove('hidden');
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
    return;
  }

  subjectListEl.innerHTML = subjects.map(s => `
    <div class="subject-item">
      <div class="subject-info">
        <h3>${s.name}</h3>
        <div class="subject-meta">
          <span>⏳ ${s.time} хв</span>
          <span>📅 ${s.deadline}</span>
          <span class="badge ${s.difficulty}">${s.difficulty}</span>
        </div>
      </div>
      <div class="subject-actions">
        <button onclick="window.editSubject('${s.id}')" title="Редагувати">✏️</button>
        <button class="btn-delete" onclick="window.deleteSubject('${s.id}')" title="Видалити">🗑️</button>
      </div>
    </div>
  `).join('');
}

// Generation Logic
function generateSchedule() {
  const total = subjects.reduce((sum, s) => sum + s.time, 0);
  if (total > 1680) {
    alert("Перевищено ліміт часу на тиждень (макс 1680 хв). Зменште навантаження.");
    return;
  }

  // Sort subjects by Deadline, then by Difficulty (Складно > Середньо > Легко)
  const difficultyWeight = { 'Складно': 3, 'Середньо': 2, 'Легко': 1 };
  
  const sorted = [...subjects].sort((a, b) => {
    const dateA = new Date(a.deadline).getTime();
    const dateB = new Date(b.deadline).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return difficultyWeight[b.difficulty] - difficultyWeight[a.difficulty];
  });

  schedule = [];
  const MAX_PER_DAY = 240;
  const MAX_PER_SESSION = 120;
  
  // Array of 7 days (0: Monday ... 6: Sunday)
  const dayLoads = [0, 0, 0, 0, 0, 0, 0];
  const dayNames = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота', 'Неділя'];
  
  let dayIndex = 0;

  for (const subj of sorted) {
    let timeRemaining = subj.time;
    let sIdx = 0;

    while (timeRemaining > 0) {
      if (dayIndex > 6) {
        // Technically shouldn't happen due to total time check, but safeguard
        break; 
      }

      const availableInDay = MAX_PER_DAY - dayLoads[dayIndex];
      
      if (availableInDay <= 0) {
        dayIndex++;
        continue;
      }

      // Max we can schedule in this chunk is min(timeRemaining, availableInDay, MAX_PER_SESSION)
      const chunk = Math.min(timeRemaining, availableInDay, MAX_PER_SESSION);
      
      schedule.push({
        id: `sess-${subj.id}-${sIdx++}`,
        subjectId: subj.id,
        name: subj.name,
        day: dayIndex,
        dayName: dayNames[dayIndex],
        duration: chunk,
        status: 'Pending'
      });

      dayLoads[dayIndex] += chunk;
      timeRemaining -= chunk;
      
      // If day is full, move to next day
      if (dayLoads[dayIndex] >= MAX_PER_DAY) {
        dayIndex++;
      }
    }
  }

  saveSchedule();
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
      grouped[s.day] = { name: s.dayName, sessions: [], total: 0 };
    }
    grouped[s.day].sessions.push(s);
    grouped[s.day].total += s.duration;
  });

  if (Object.keys(grouped).length === 0) {
    scheduleGridEl.innerHTML = `<div class="empty-state" style="grid-column: 1/-1">Немає сесій для цього фільтра.</div>`;
    return;
  }

  scheduleGridEl.innerHTML = Object.keys(grouped).sort().map(dKey => {
    const day = grouped[dKey];
    return `
      <div class="day-column">
        <div class="day-header">
          <span>${day.name}</span>
          <span class="day-stats">${day.total} хв</span>
        </div>
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

// Expose to window for inline handlers
window.editSubject = editSubject;
window.deleteSubject = deleteSubject;
window.updateStatus = updateStatus;

// Boot
document.addEventListener('DOMContentLoaded', init);
