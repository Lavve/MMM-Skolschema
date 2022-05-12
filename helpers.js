const H = {
  time2Mins: function (timeFormat, time, addMins = 0) {
    if (!time) {
      const now = new Date();
      return now.getHours() * 60 + now.getMinutes() + addMins;
    }

    if (timeFormat === 12) {
      const hm = time.slice(0, -2).trim();
      const mod = time.slice(-2).trim();
      let [h, m] = hm.split(':');
      h = parseInt(h, 10);
      m = parseInt(m, 10);
      h = h === 12 ? 0 : h;
      h = mod.toLowerCase() === 'pm' ? h + 12 : h;

      return h * 60 + m + addMins;
    } else {
      return parseInt(time.split(':')[0], 10) * 60 + parseInt(time.split(':')[1], 10) + addMins;
    }
  },

  setProgress: function (rowEl, nowTime, that) {
    const progressEl = rowEl.querySelector('.schedule-progress');
    const start = progressEl.dataset.start;
    const end = progressEl.dataset.end;
    let percent = 0;
    let deg = 0;

    if (that.config.progressType === 'bar') {
      const progressVal = rowEl.querySelector('.percent-value');
      percent = Math.round(100 - (100 * (nowTime - start)) / (end - start));
      progressVal.style.width = percent + '%';
    } else {
      percent = Math.round((100 * (nowTime - start)) / (end - start));
      let style = '';

      if (percent >= 50) {
        deg = Math.round(percent * 3.6) - 360 + 90;
        style = `linear-gradient(${deg}deg, ${that.config.progressColor} 50%, transparent 50%)`;
      } else {
        deg = Math.round(percent * 3.6) - 90;
        style = `linear-gradient(${deg}deg, var(--color-background) 50%, transparent 50%)`;
      }

      style += `,linear-gradient(-90deg, ${that.config.progressColor} 50%, transparent 50%)`;
      progressEl.style.backgroundImage = style;
    }
  },

  getProgress: function (config, start, end) {
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
  },

  sync: function (that) {
    const syncTimer = setInterval(() => {
      const now = new Date();
      if (now.getSeconds() === 0) {
        console.log(`${that.name} :: Time syncronized`);
        clearInterval(syncTimer);
        this.resetTimers(that);
        that.ready = true;
        that.updateDom();
      }
    }, 1000);
  },

  resetTimers: function (that) {
    if (that.currentTimer) {
      clearTimeout(that.currentTimer);
    }

    if (that.newDayTimer) {
      clearInterval(that.newDayTimer);
    }
  },
};
