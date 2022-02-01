/* Magic Mirror
 * Module: MMM-Skolschema
 *
 * By Magnus Claesson https://github.com/Lavve
 * MIT Licensed.
 */

Module.register('MMM-Skolschema', {
  // Define module defaults
  defaults: {
    showNextDayAt: '0:00',
    showDayname: true,
    showEndTime: false,
    rowFormat: 'time:label',
    noScheduleText: '',
    showCurrentProgress: true,
    progressColor: '#fff',
    schedules: [],
  },

  getStyles: function () {
    return [this.name + '.css'];
  },

  start: function () {
    Log.info('Starting module: ' + this.name);
    this.currSchedule = {};
    this.currentDay = '';
    this.alarms = [];
    this.alarmTimer = null;
    this.currentAlarms = [];
    this.nextDayMinutes = this.time2Mins(this.config.showNextDayAt);
  },

  time2Mins: function (t) {
    if (!t) {
      const now = new Date();
      return now.getHours() * 60 + now.getMinutes();
    }

    if (config.timeFormat === 24) {
      return parseInt(t.split(':')[0], 10) * 60 + parseInt(t.split(':')[1], 10);
    } else {
      const [Hm, mod] = t.split(' ');
      let [h, m] = Hm.split(':');
      h = parseInt(h, 10);
      m = parseInt(m, 10);

      h = h === 12 ? 0 : h;
      h = mod.toLowerCase() === 'pm' ? h + 12 : h;

      return h * 60 + m;
    }
  },

  setAlarmNotice: function (alarm) {
    const nowTime = this.time2Mins();
    const alarmStart = nowTime > alarm.start ? nowTime : alarm.start;

    let alarmEnd = 0;
    if (alarm.hasOwnProperty('end') && alarm.end !== '') {
      alarmEnd = alarm.end;
    } else {
      alarmEnd = alarm.start + 120;
    }
    const timerMs = (alarmEnd - alarmStart) * 60 * 1000;

    if (nowTime >= alarmStart && nowTime < alarmEnd && timerMs > 0) {
      if (!this.currentAlarms.includes(alarm.message)) {
        this.currentAlarms.push(alarm.message);
        this.sendNotification(
          'SHOW_ALERT',
          { type: 'notification', timer: timerMs, message: alarm.message },
          alarm.message
        );
      }
    } else {
      this.currentAlarms = this.currentAlarms.filter(
        (i) => i !== alarm.message
      );
      this.sendNotification('HIDE_ALERT', alarm.message);
    }
  },

  setAlarms: function () {
    if (this.alarmTimer) {
      clearInterval(this.alarmTimer);
    }

    this.alarms.forEach((alarm) => {
      this.setAlarmNotice(alarm);
      this.alarmTimer = setInterval(() => {
        this.setAlarmNotice(alarm);
      }, this.config.alarmInterval);
    });
  },

  setProgress: function (progressEl, nowTime) {
    const start = progressEl.dataset.start;
    const end = progressEl.dataset.end;
    const percent = Math.round(100 - (100 * (nowTime - start)) / (end - start));

    progressEl.style.width = percent + '%';
  },

  setCurrent: function (rowEls) {
    const nowTime = this.time2Mins();

    rowEls.forEach((rowEl) => {
      const progressBar = rowEl.querySelector('.percent-bar');

      if (nowTime >= rowEl.dataset.start && nowTime < rowEl.dataset.end) {
        rowEl.classList.add('bright');

        if (this.config.showCurrentProgress) {
          if (progressBar) {
            progressBar.style.display = 'block';
          }
          this.setProgress(rowEl.querySelector('.percent-value'), nowTime);
        }
      } else {
        rowEl.classList.remove('bright');
        if (progressBar) {
          progressBar.style.display = 'none';
        }
      }
    });

    setTimeout(() => {
      this.setCurrent(rowEls);
    }, 60 * 1000);
  },

  formatAlarm: function (alarm) {
    const convert = {};
    convert.start = this.time2Mins(alarm.start);

    if (alarm.hasOwnProperty('end')) {
      convert.end = this.time2Mins(alarm.end);
    } else {
      convert.end =
        (parseInt(alarm.start.split(':')[0], 10) + 2) * 60 +
        parseInt(alarm.start.split(':')[1], 10);
    }
    convert.message = alarm.message;
    return convert;
  },

  getScheduleList: function () {
    const cellDiv = document.createElement('div');
    this.alarms = [];

    // console.log(this.currentDay, this.currSchedule);

    if (!this.currSchedule[this.currentDay].length) {
      cellDiv.classList.add('no-schedule');
      cellDiv.innerHTML = this.config.noScheduleText;
      return cellDiv;
    }

    rowEls = this.currSchedule[this.currentDay].map((row) => {
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('schedule-row');

      const timeEl = document.createElement('span');
      timeEl.classList.add('schedule-time', 'light');
      let timeContent = row.start;
      if (this.config.showEndTime) {
        timeContent += ` &ndash; ${row.end}`;
      }
      timeEl.innerHTML = timeContent;

      const labelEl = document.createElement('span');
      labelEl.classList.add('schedule-label');
      labelEl.innerHTML = row.label;

      if (this.config.rowFormat === 'label:time') {
        rowDiv.classList.add('mirror');
        rowDiv.appendChild(labelEl);
        rowDiv.appendChild(timeEl);
      } else {
        rowDiv.appendChild(timeEl);
        rowDiv.appendChild(labelEl);
      }

      const start = this.time2Mins(row.start);
      const end = this.time2Mins(row.end);

      rowDiv.dataset.start = start;
      rowDiv.dataset.end = end;

      // Prepare progress bar
      if (this.config.showCurrentProgress) {
        const percentDiv = document.createElement('div');
        percentDiv.classList.add('percent-bar');
        percentDiv.style.backgroundColor = this.config.progressColor;

        const percentDivValue = document.createElement('div');
        percentDivValue.classList.add('percent-value');
        percentDivValue.dataset.start = start;
        percentDivValue.dataset.end = end;
        percentDiv.appendChild(percentDivValue);
        rowDiv.appendChild(percentDiv);
      }

      if (row.hasOwnProperty('alarm')) {
        this.alarms.push(this.formatAlarm(row.alarm));
      }

      cellDiv.appendChild(rowDiv);
      return rowDiv;
    });

    this.setCurrent(rowEls);

    if (this.alarms.length) {
      this.setAlarms();
    }

    cellDiv.classList.add('schedule-rows');
    return cellDiv;
  },

  getCurrentSchedule: function () {
    const now = new Date();
    const nowMins = this.time2Mins();
    const currDayNum = now.getDay() - 1 < 0 ? 6 : now.getDay() - 1;
    const thisDayNum =
      nowMins >= this.nextDayMinutes
        ? currDayNum + 1 > 6
          ? 0
          : currDayNum + 1
        : currDayNum;

    const schedule = this.config.schedules.filter(
      (item) =>
        Object.keys(item)[0] ===
        Object.keys(this.config.schedules[thisDayNum])[0]
    )[0];

    return schedule;
  },

  generateSchedule: function () {
    const scheduleContent = document.createElement('div');

    this.currSchedule = this.getCurrentSchedule();
    this.currentDay = Object.keys(this.currSchedule)[0];
    let tempDay = this.currentDay;

    const dayEl = document.createElement('div');
    dayEl.classList.add('day', 'bright', 'thin');

    if (this.config.showDayname) {
      dayEl.innerHTML = this.currentDay;
      scheduleContent.appendChild(dayEl);
    }

    scheduleContent.appendChild(this.getScheduleList());

    // Check if new day
    setInterval(() => {
      this.currSchedule = this.getCurrentSchedule();
      this.currentDay = Object.keys(this.currSchedule)[0];

      if (tempDay !== this.currentDay) {
        // We have a new day
        tempDay = this.currentDay;

        scheduleContent.innerHTML = '';

        if (this.config.showDayname) {
          dayEl.innerHTML = this.currentDay;
          scheduleContent.appendChild(dayEl);
        }

        scheduleContent.appendChild(this.getScheduleList());
      }
    }, 60 * 1000);

    scheduleContent.classList.add('MMM-Skolschema__content');

    return scheduleContent;
  },

  getDom: function () {
    const w = document.createElement('div');
    w.appendChild(this.generateSchedule());
    return w;
  },
});
