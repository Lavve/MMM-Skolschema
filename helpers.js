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
      return (
        parseInt(time.split(':')[0], 10) * 60 +
        parseInt(time.split(':')[1], 10) +
        addMins
      );
    }
  },

  setProgress: function (rowEl, nowTime) {
    const progressEl = rowEl.querySelector('.percent-value');
    const start = progressEl.dataset.start;
    const end = progressEl.dataset.end;
    const percent = Math.round(100 - (100 * (nowTime - start)) / (end - start));

    progressEl.style.width = percent + '%';
  },

  formatAlarm: function (alarm, config) {
    const convert = {};
    convert.start = this.time2Mins(config.timeFormat, alarm.start);

    if (alarm.hasOwnProperty('end')) {
      convert.end = this.time2Mins(config.timeFormat, alarm.end);
    } else {
      convert.end = this.time2Mins(
        config.timeFormat,
        alarm.start,
        config.defaultAlarmEnd
      );
    }
    convert.message = alarm.message;
    return convert;
  },

  sync2Sec: function (that) {
    const syncTimer = setInterval(() => {
      const now = new Date();
      if (now.getSeconds() === 0) {
        console.log(`${that.name} :: Time is synced`);
        clearInterval(syncTimer);
        this.resetTimers(that);
        that.updateDom();
      }
    }, 1000);
  },

  resetTimers: function (that) {
    if (that.currentTimer) {
      clearTimeout(that.currentTimer);
    }

    if (that.alarmTimer) {
      clearInterval(that.alarmTimer);
    }

    if (that.newDayTimer) {
      clearInterval(that.newDayTimer);
    }
  },
};
