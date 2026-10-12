/**
 * How to Value Time - Interactive Scripting & Clock Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initLiveClocks();
  initCalendarView();
  initWatchTabs();
  initStopwatch();
  initCountdown();
  initAlarms();
  initTodoList();
  initWatchHardwareButtons();
  initAudioChime();
});

/* ==========================================================================
   1. Theme Toggle (Dark / Light)
   ========================================================================== */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const icon = toggleBtn?.querySelector('.theme-icon');
  if (!toggleBtn) return;

  const savedTheme = localStorage.getItem('chrono-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('chrono-theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    if (icon) {
      icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }
}

/* ==========================================================================
   2. Live Network Clocks (Hero + Smartwatch Analog & Digital)
   ========================================================================== */
function initLiveClocks() {
  const heroClockEl = document.getElementById('live-hero-clock');
  const dayProgressPctEl = document.getElementById('day-progress-pct');
  const dayProgressBarEl = document.getElementById('day-progress-bar');

  // Watch elements
  const watchHoursEl = document.getElementById('watch-time-hours');
  const watchMinsEl = document.getElementById('watch-time-minutes');
  const watchSecsEl = document.getElementById('watch-time-seconds');
  const watchDateEl = document.getElementById('watch-date-full');
  const watchStatusTimeEl = document.getElementById('watch-status-time');

  // Analog hands
  const hourHand = document.getElementById('analog-hour');
  const minHand = document.getElementById('analog-min');
  const secHand = document.getElementById('analog-sec');

  function update() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    const pad = (n) => String(n).padStart(2, '0');

    // Hero Digital Clock
    if (heroClockEl) {
      heroClockEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    // Day Progress calculation (0 to 100% of 24h)
    const secondsPassedToday = (hours * 3600) + (minutes * 60) + seconds;
    const dayFraction = (secondsPassedToday / 86400) * 100;
    const formattedFraction = dayFraction.toFixed(1) + '%';
    if (dayProgressPctEl) dayProgressPctEl.textContent = formattedFraction;
    if (dayProgressBarEl) dayProgressBarEl.style.width = formattedFraction;

    // Smart Watch Digital Display
    if (watchHoursEl) watchHoursEl.textContent = pad(hours);
    if (watchMinsEl) watchMinsEl.textContent = pad(minutes);
    if (watchSecsEl) watchSecsEl.textContent = pad(seconds);
    if (watchStatusTimeEl) watchStatusTimeEl.textContent = `${pad(hours)}:${pad(minutes)}`;

    if (watchDateEl) {
      const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
      watchDateEl.textContent = now.toLocaleDateString('en-US', options);
    }

    // Smart Watch Analog Dial Hands (smooth rotations)
    if (secHand) {
      const secDegrees = (seconds + milliseconds / 1000) * 6; // 360 / 60
      secHand.style.transform = `rotate(${secDegrees}deg)`;
    }
    if (minHand) {
      const minDegrees = (minutes + seconds / 60) * 6;
      minHand.style.transform = `rotate(${minDegrees}deg)`;
    }
    if (hourHand) {
      const hourDegrees = ((hours % 12) + minutes / 60) * 30; // 360 / 12
      hourHand.style.transform = `rotate(${hourDegrees}deg)`;
    }
  }

  update();
  setInterval(update, 200); // 5 updates per second for smooth analog second hand
}

/* ==========================================================================
   3. Smart Watch Navigation & Hardware Interaction
   ========================================================================== */
function initWatchTabs() {
  const tabs = document.querySelectorAll('.watch-nav-btn');
  const views = document.querySelectorAll('.watch-view');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-watch-tab');
      activateWatchTab(target);
    });
  });
}

function activateWatchTab(targetId) {
  const tabs = document.querySelectorAll('.watch-nav-btn');
  const views = document.querySelectorAll('.watch-view');

  tabs.forEach(t => {
    if (t.getAttribute('data-watch-tab') === targetId) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  views.forEach(v => {
    if (v.id === `view-${targetId}`) {
      v.classList.add('active');
    } else {
      v.classList.remove('active');
    }
  });
}

function initWatchHardwareButtons() {
  const crown = document.getElementById('watch-crown');
  const sideBtn = document.getElementById('watch-side-btn');

  // Digital crown click returns to default Clock face
  if (crown) {
    crown.addEventListener('click', () => {
      activateWatchTab('clock');
      crown.style.transform = 'scale(0.95)';
      setTimeout(() => crown.style.transform = '', 150);
      playHapticTone(600, 0.05);
    });
  }

  // Side button cycles to next view
  if (sideBtn) {
    const tabNames = ['clock', 'calendar', 'stopwatch', 'countdown', 'alarm'];
    sideBtn.addEventListener('click', () => {
      const activeTab = document.querySelector('.watch-nav-btn.active');
      const current = activeTab ? activeTab.getAttribute('data-watch-tab') : 'clock';
      const currentIndex = tabNames.indexOf(current);
      const nextIndex = (currentIndex + 1) % tabNames.length;
      activateWatchTab(tabNames[nextIndex]);

      sideBtn.style.transform = 'scale(0.95)';
      setTimeout(() => sideBtn.style.transform = '', 150);
      playHapticTone(520, 0.04);
    });
  }
}

/* ==========================================================================
   4. Smart Watch Calendar View
   ========================================================================== */
function initCalendarView() {
  const monthNameEl = document.getElementById('cal-month-name');
  const gridEl = document.getElementById('mini-calendar-grid');
  if (!gridEl) return;

  const now = new Date();
  const currentMonth = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  if (monthNameEl) monthNameEl.textContent = currentMonth;

  gridEl.innerHTML = '';
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  dayNames.forEach(d => {
    const col = document.createElement('div');
    col.className = 'cal-day-cell day-name';
    col.textContent = d;
    gridEl.appendChild(col);
  });

  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const todayDate = now.getDate();

  // Blank filler days
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'cal-day-cell';
    gridEl.appendChild(emptyCell);
  }

  // Month days
  for (let day = 1; day <= totalDays; day++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'cal-day-cell';
    if (day === todayDate) {
      dayCell.classList.add('is-today');
    }
    dayCell.textContent = day;
    gridEl.appendChild(dayCell);
  }
}

/* ==========================================================================
   5. Smart Watch Stopwatch
   ========================================================================== */
function initStopwatch() {
  const display = document.getElementById('sw-time-display');
  const toggleBtn = document.getElementById('sw-toggle-btn');
  const lapBtn = document.getElementById('sw-lap-btn');
  const resetBtn = document.getElementById('sw-reset-btn');
  const lapsContainer = document.getElementById('sw-laps-list');

  let startTime = 0;
  let elapsedTime = 0;
  let timerInterval = null;
  let isRunning = false;
  let lapCount = 0;

  function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(m)}:${pad(s)}.${pad(hundredths)}`;
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (!isRunning) {
        // Start
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(() => {
          elapsedTime = Date.now() - startTime;
          display.textContent = formatTime(elapsedTime);
        }, 30);
        isRunning = true;
        toggleBtn.textContent = 'Pause';
        toggleBtn.style.background = '#f59e0b';
        lapBtn.disabled = false;
        resetBtn.disabled = false;
      } else {
        // Pause
        clearInterval(timerInterval);
        isRunning = false;
        toggleBtn.textContent = 'Resume';
        toggleBtn.style.background = '';
      }
    });
  }

  if (lapBtn) {
    lapBtn.addEventListener('click', () => {
      if (!isRunning) return;
      lapCount++;
      if (lapCount === 1) lapsContainer.innerHTML = '';

      const lapRow = document.createElement('div');
      lapRow.className = 'lap-row';
      lapRow.innerHTML = `<span>Lap ${lapCount}</span><span>${formatTime(elapsedTime)}</span>`;
      lapsContainer.prepend(lapRow);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clearInterval(timerInterval);
      isRunning = false;
      elapsedTime = 0;
      lapCount = 0;
      display.textContent = '00:00.00';
      toggleBtn.textContent = 'Start';
      toggleBtn.style.background = '';
      lapBtn.disabled = true;
      resetBtn.disabled = true;
      lapsContainer.innerHTML = '<div class="lap-placeholder">No laps recorded</div>';
    });
  }
}

/* ==========================================================================
   6. Smart Watch Countdown Timer
   ========================================================================== */
function initCountdown() {
  const display = document.getElementById('cd-time-display');
  const presets = document.querySelectorAll('.cd-preset');
  const toggleBtn = document.getElementById('cd-toggle-btn');
  const resetBtn = document.getElementById('cd-reset-btn');
  const statusMsg = document.getElementById('cd-status-msg');

  let targetDuration = 300; // default 5 minutes (300 sec)
  let remainingSeconds = 300;
  let countdownInterval = null;
  let isRunning = false;

  function render() {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (display) display.textContent = `${pad(m)}:${pad(s)}`;
  }

  presets.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isRunning) return;
      presets.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      targetDuration = parseInt(btn.getAttribute('data-cd'), 10);
      remainingSeconds = targetDuration;
      render();
      if (statusMsg) statusMsg.textContent = `Set to ${Math.floor(targetDuration / 60)} minutes`;
    });
  });

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (!isRunning) {
        if (remainingSeconds <= 0) remainingSeconds = targetDuration;
        isRunning = true;
        toggleBtn.textContent = 'Pause';
        toggleBtn.style.background = '#f59e0b';
        if (statusMsg) statusMsg.textContent = 'Countdown active...';

        countdownInterval = setInterval(() => {
          remainingSeconds--;
          render();
          if (remainingSeconds <= 0) {
            clearInterval(countdownInterval);
            isRunning = false;
            toggleBtn.textContent = 'Start';
            toggleBtn.style.background = '';
            if (statusMsg) statusMsg.textContent = '🔔 Time is up! Take action now!';
            playCelebrationChime();
          }
        }, 1000);
      } else {
        clearInterval(countdownInterval);
        isRunning = false;
        toggleBtn.textContent = 'Resume';
        toggleBtn.style.background = '';
        if (statusMsg) statusMsg.textContent = 'Countdown paused';
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clearInterval(countdownInterval);
      isRunning = false;
      remainingSeconds = targetDuration;
      render();
      toggleBtn.textContent = 'Start';
      toggleBtn.style.background = '';
      if (statusMsg) statusMsg.textContent = 'Countdown reset';
    });
  }
}

/* ==========================================================================
   7. Smart Watch Alarms
   ========================================================================== */
function initAlarms() {
  const addBtn = document.getElementById('add-alarm-btn');
  const input = document.getElementById('custom-alarm-input');
  const banner = document.getElementById('alarm-banner');

  if (addBtn && input && banner) {
    addBtn.addEventListener('click', () => {
      const timeVal = input.value;
      if (timeVal) {
        banner.textContent = `✓ Alarm set for ${timeVal}`;
        playHapticTone(680, 0.1);
        setTimeout(() => {
          banner.textContent = 'Alarms active & synced';
        }, 3000);
      }
    });
  }
}

/* ==========================================================================
   8. Section 2: Interactive To-Do List Widget
   ========================================================================== */
function initTodoList() {
  const listEl = document.getElementById('todo-list');
  const countEl = document.getElementById('todo-count');
  const formEl = document.getElementById('add-todo-form');
  const inputEl = document.getElementById('todo-input');

  function updateCount() {
    if (!listEl || !countEl) return;
    const all = listEl.querySelectorAll('.todo-item');
    const checked = listEl.querySelectorAll('.todo-item input:checked');
    countEl.textContent = `${checked.length}/${all.length} Done`;
  }

  if (listEl) {
    listEl.addEventListener('change', (e) => {
      if (e.target.matches('input[type="checkbox"]')) {
        const item = e.target.closest('.todo-item');
        if (item) {
          if (e.target.checked) {
            item.classList.add('done');
            playHapticTone(800, 0.05);
          } else {
            item.classList.remove('done');
          }
        }
        updateCount();
      }
    });
  }

  if (formEl && inputEl && listEl) {
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = inputEl.value.trim();
      if (!text) return;

      const newLabel = document.createElement('label');
      newLabel.className = 'todo-item';
      newLabel.innerHTML = `
        <input type="checkbox" data-task="${escapeHtml(text)}">
        <span class="custom-check"></span>
        <span class="task-text">${escapeHtml(text)}</span>
      `;
      listEl.appendChild(newLabel);
      inputEl.value = '';
      updateCount();
      playHapticTone(600, 0.05);
    });
  }

  updateCount();
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}



/* ==========================================================================
   11. Built-in Web Audio Chimes (No external audio file dependencies)
   ========================================================================== */
let audioCtx = null;

function initAudioChime() {
  // Lazily instantiated on first user gesture
  const unlockAudio = () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  };
  window.addEventListener('click', unlockAudio, { once: true });
}

function playHapticTone(frequency = 520, duration = 0.08) {
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (!audioCtx || audioCtx.state === 'suspended') {
      audioCtx?.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio might fail if not allowed, fallback silently
  }
}

function playCelebrationChime() {
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (!audioCtx || audioCtx.state === 'suspended') {
      audioCtx?.resume();
    }
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }, idx * 120);
    });
  } catch (e) {
    // Fallback gracefully
  }
}
