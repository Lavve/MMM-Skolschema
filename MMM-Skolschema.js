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
    showCurrent: true,
    timeFormat: config.timeFormat,
    defaultAlarmEnd: 2 * 60,
    rowFormat: 'time:label',
    noScheduleText: '',
    showCurrentProgress: true,
    progressType: 'bar',
    progressColor: '#fff',
    dividerColor: '',
    schedules: [],
  },

  getStyles: function () {
    return [this.name + '.css'];
  },

  getScripts: function () {
    return ['helpers.js'];
  },

  getTranslations: function () {
    return {
      en: 'translations/en.json',
      sv: 'translations/sv.json',
    };
  },

  start: function () {
    Log.info('Starting module: ' + this.name);
    this.ready = false;
    this.currentAlarms = [];
    H.sync2Sec(this);
  },

  setAlarmNotice: function (alarm, i) {
    const nowTime = H.time2Mins(this.config.timeFormat);
    const alarmStart = nowTime > alarm.start ? nowTime : alarm.start;

    let alarmEnd = 0;
    if (alarm.hasOwnProperty('end') && alarm.end !== '') {
      alarmEnd = alarm.end;
    } else {
      alarmEnd = alarm.start + 120;
    }
    const timerMs = (alarmEnd - alarmStart) * 60 * 1000;

    if (nowTime >= alarmStart && nowTime < alarmEnd && timerMs > 0) {
      if (!this.currentAlarms.includes('alarm-' + i)) {
        this.currentAlarms.push('alarm-' + i);
        this.sendNotification(
          'SHOW_ALERT',
          { type: 'notification', timer: timerMs, message: alarm.message },
          'alarm-' + i
        );
      }
    } else {
      this.currentAlarms = this.currentAlarms.filter((c) => c !== 'alarm-' + i);
      this.sendNotification('HIDE_ALERT', 'alarm-' + i);
    }
  },

  setAlarms: function () {
    if (this.alarmTimer) {
      clearInterval(this.alarmTimer);
    }

    this.alarms.forEach((alarm, i) => {
      this.setAlarmNotice(alarm, i);
      this.alarmTimer = setInterval(() => {
        this.setAlarmNotice(alarm, i);
      }, this.config.alarmInterval);
    });
  },

  setCurrent: function () {
    const nowTime = H.time2Mins(this.config.timeFormat);

    this.scheduleRows.forEach((rowEl) => {
      const progressEl = rowEl.querySelector('.schedule-progress');

      if (nowTime >= rowEl.dataset.start && nowTime < rowEl.dataset.end) {
        rowEl.classList.add('bright');

        if (this.config.showCurrentProgress) {
          if (progressEl) {
            progressEl.style.display = 'block';
          }
          H.setProgress(rowEl, nowTime, this);
        }
      } else {
        rowEl.classList.remove('bright');
        if (progressEl) {
          progressEl.style.display = 'none';
        }
      }
    });

    this.currentTimer = setTimeout(() => {
      this.setCurrent();
    }, 60 * 1000);
  },

  getAlarmList: function () {
    this.alarms = [];

    if (
      this.currSchedule[this.scheduleDay].hasOwnProperty('alarms') &&
      this.currSchedule[this.scheduleDay].alarms.length
    ) {
      this.currSchedule[this.scheduleDay].alarms.forEach((a) => {
        if (
          a.hasOwnProperty('start') &&
          a.start !== '' &&
          a.hasOwnProperty('message') &&
          a.message !== ''
        ) {
          this.alarms.push(H.formatAlarm(a, this.config));
        }
      });
    }

    if (this.alarms.length && this.active) {
      this.setAlarms();
    }
  },

  getProgress: function (start, end) {
    const progressEl = document.createElement('div');
    progressEl.classList.add('schedule-progress');
    progressEl.dataset.start = start;
    progressEl.dataset.end = end;

    if (this.config.progressType === 'bar') {
      progressEl.classList.add('percent-bar');
      progressEl.style.backgroundColor = this.config.progressColor;

      const progresValue = document.createElement('div');
      progresValue.classList.add('percent-value');

      progressEl.appendChild(progresValue);
    } else {
      progressEl.classList.add('percent-pie');
      // progressEl.style.borderColor = this.config.progressColor;
    }

    return progressEl;
  },

  getScheduleList: function () {
    const cellDiv = document.createElement('div');

    if (
      !this.currSchedule[this.scheduleDay].hasOwnProperty('schedule') ||
      !this.currSchedule[this.scheduleDay].schedule.length
    ) {
      cellDiv.classList.add('no-schedule');
      cellDiv.innerHTML = this.config.noScheduleText;
      return cellDiv;
    }

    const rowLength = this.currSchedule[this.scheduleDay].schedule.length;

    this.scheduleRows = this.currSchedule[this.scheduleDay].schedule.map(
      (row, i) => {
        const rowEl = document.createElement('div');
        rowEl.classList.add('schedule-row');

        const timeEl = document.createElement('span');
        timeEl.classList.add('schedule-time', 'thin', 'xsmall');
        let timeContent = row.start;

        if (!row.hasOwnProperty('end') || row.end === '') {
          row.end =
            i !== rowLength - 1
              ? this.currSchedule[this.scheduleDay].schedule[i + 1].start
              : '23:59';
        }

        if (this.config.showEndTime) {
          timeContent += ` &ndash; ${row.end}`;
        }
        timeEl.innerHTML = timeContent;

        const labelEl = document.createElement('span');
        labelEl.classList.add('schedule-label');
        labelEl.innerHTML = row.label;

        if (this.config.rowFormat === 'label:time') {
          rowEl.classList.add('mirror');
          rowEl.appendChild(labelEl);
          rowEl.appendChild(timeEl);
        } else {
          rowEl.appendChild(timeEl);
          rowEl.appendChild(labelEl);
        }

        const start = H.time2Mins(this.config.timeFormat, row.start);
        const end = H.time2Mins(this.config.timeFormat, row.end);

        rowEl.dataset.start = start;
        rowEl.dataset.end = end;

        if (row.hasOwnProperty('divider') && row.divider !== '') {
          rowEl.classList.add(`divider-${row.divider}`);
          if (this.config.dividerColor !== '') {
            rowEl.style.borderColor = this.config.dividerColor;
          }
        }

        // Prepare progress bar
        if (this.config.showCurrentProgress) {
          rowEl.appendChild(this.getProgress(start, end));
        }

        if (row.hasOwnProperty('alarm') && row.alarm !== '') {
          this.alarms.push(
            this.formatAlarm(
              { start: row.start, end: row.end, message: row.alarm },
              this.config
            )
          );
        }

        cellDiv.appendChild(rowEl);
        return rowEl;
      }
    );

    if (this.config.showCurrent && this.active) {
      this.setCurrent();
    }

    cellDiv.classList.add('schedule-rows');
    return cellDiv;
  },

  getCurrentSchedule: function () {
    const now = new Date();
    const nowMins = H.time2Mins(this.config.timeFormat);

    // Fix to get mon - sun
    const currDayNum = now.getDay() - 1 < 0 ? 6 : now.getDay() - 1;
    this.currentDay = Object.keys(this.config.schedules[currDayNum])[0];

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

    if (nowMins === 1) {
      this.scheduleDay = Object.keys(this.config.schedules[thisDayNum])[0];

      this.getAlarmList();
      H.resetTimers(this);
    }

    return schedule;
  },

  generateSchedule: function () {
    this.currSchedule = {};
    this.scheduleRows = [];
    this.scheduleDay = '';
    this.currentDay = '';
    this.active = false;
    this.alarms = [];
    this.alarmTimer = null;
    this.nextDayMinutes = H.time2Mins(
      this.config.timeFormat,
      this.config.showNextDayAt
    );
    H.resetTimers(this);

    const scheduleContent = document.createElement('div');
    scheduleContent.classList.add('MMM-Skolschema__content');

    this.currSchedule = this.getCurrentSchedule();
    this.scheduleDay = Object.keys(this.currSchedule)[0];
    let tempDay = this.scheduleDay;
    this.active = this.currentDay === this.scheduleDay;

    const dayEl = document.createElement('div');
    dayEl.classList.add('day', 'bright', 'thin');

    if (this.config.showDayname) {
      dayEl.innerHTML = this.scheduleDay;
      scheduleContent.appendChild(dayEl);
    }

    scheduleContent.appendChild(this.getScheduleList());
    this.getAlarmList();

    this.newDayTimer = setInterval(() => {
      this.currSchedule = this.getCurrentSchedule();
      this.scheduleDay = Object.keys(this.currSchedule)[0];
      this.active = this.currentDay === this.scheduleDay;

      if (tempDay !== this.scheduleDay) {
        // Let's show the next day
        tempDay = this.scheduleDay;
        scheduleContent.innerHTML = '';

        if (this.config.showDayname) {
          dayEl.innerHTML = this.scheduleDay;
        }

        scheduleContent.appendChild(this.getScheduleList());
      }
    }, 60 * 1000);

    return scheduleContent;
  },

  getDom: function () {
    const w = document.createElement('div');

    if (!this.ready) {
      w.classList.add('dimmed');
      w.innerHTML = this.translate('loading');
      return w;
    }

    w.appendChild(this.generateSchedule());
    return w;
  },
});
