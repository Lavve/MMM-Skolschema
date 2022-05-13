// Convert time to minutes
const t2m = (timeFormat, time) => {
  if (!time) {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  if (timeFormat === 12) {
    const hm = time.slice(0, -2).trim();
    const mod = time.slice(-2).trim();
    let [h, m] = hm.split(':');
    h = parseInt(h, 10);
    m = parseInt(m, 10);
    h = h === 12 ? 0 : h;
    h = mod.toLowerCase() === 'pm' ? h + 12 : h;

    return h * 60 + m;
  } else {
    return parseInt(time.split(':')[0], 10) * 60 + parseInt(time.split(':')[1], 10);
  }
};

// Set progress if activated
const setProgress = (rowEl, nowTime, config) => {
  const progressEl = rowEl.querySelector('.schedule-progress');
  const start = parseInt(progressEl.dataset.start, 10);
  const end = parseInt(progressEl.dataset.end, 10);
  let percent = 0;
  let deg = 0;

  if (config.progressType === 'bar') {
    const progressEl = rowEl.querySelector('.percent-value');
    percent = Math.round(100 - (100 * (nowTime - start)) / (end - start));
    progressEl.style.width = percent + '%';
  } else {
    percent = Math.round((100 * (nowTime - start)) / (end - start));
    let style = '';

    if (percent >= 50) {
      deg = Math.round(percent * 3.6) - 360 + 90;
      style = `linear-gradient(${deg}deg, ${config.progressColor} 50%, transparent 50%)`;
    } else {
      deg = Math.round(percent * 3.6) - 90;
      style = `linear-gradient(${deg}deg, var(--color-background) 50%, transparent 50%)`;
    }

    style += `,linear-gradient(-90deg, ${config.progressColor} 50%, transparent 50%)`;
    progressEl.style.backgroundImage = style;
  }
};

// Creates progress if activated
const createProgress = (config, start, end) => {
  const progressEl = document.createElement('div');
  progressEl.classList.add('schedule-progress');
  progressEl.dataset.start = start;
  progressEl.dataset.end = end;

  if (config.progressType === 'bar') {
    progressEl.classList.add('percent-bar');
    progressEl.style.backgroundColor = config.progressColor;

    const progresValue = document.createElement('div');
    progresValue.classList.add('percent-value');

    progressEl.appendChild(progresValue);
  } else {
    progressEl.classList.add('percent-pie');
  }

  return progressEl;
};

// Sync time to exact second
const sync = (that) => {
  const syncTimer = setInterval(() => {
    const now = new Date();
    if (now.getSeconds() === 0) {
      console.log(`${that.name} :: Time syncronized`);
      clearInterval(syncTimer);
      resetAllTimers(that);
      that.ready = true;
      that.updateDom();
    }
  }, 1000);
};

// Clear all running timers
const resetAllTimers = (that) => {
  if (that.currentTimer) {
    clearTimeout(that.currentTimer);
  }
  if (that.newDayTimer) {
    clearInterval(that.newDayTimer);
  }
};

if (typeof window === 'undefined' || navigator.userAgent.includes('jsdom')) {
  module.exports = { time2Mins, setProgress, getProgress, sync, resetAllTimers };
}