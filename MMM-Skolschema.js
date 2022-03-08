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
    alarmBackground: '#fff',
    alarmTextColor: '#000',
    alarmBorderColor: '#999',
    defaultAlarmIcon: 'fa-bell',
    rowFormat: 'time:label',
    noScheduleText: '',
    showCurrentProgress: true,
    progressType: 'bar',
    progressColor: '#fff',
    dividerColor: '',
    schedules: [],
    useTTS: false,
  },

  getStyles: function () {
    return [this.name + '.css'];
  },

  getScripts: function () {
    return ['helpers.js'];
  },

  start: function () {
    Log.info('Starting module: ' + this.name);

    this.alarmBlock = document.createElement('div');
    this.alarmBlock.classList.add('MMM-Skolschema__alarms');
    document.body.appendChild(this.alarmBlock);
    this.ready = !1;
    H.sync(this);
  },

  setAlarmNotice: function (alarm, i) {
    const nowTime = H.time2Mins(this.config.timeFormat);
    const alarmStart = nowTime > alarm.start ? nowTime : alarm.start;
    const alarmEnd =
      alarm.hasOwnProperty('end') && alarm.end !== ''
        ? alarm.end
        : alarm.start + this.config.defaultAlarmEnd;

    if (nowTime >= alarmStart && nowTime < alarmEnd) {
      this.a[i] = document.querySelector('#schedule_alarm-' + i);

      if (!this.a[i]) {
        this.a[i] = document.createElement('div');
        this.a[i].id = 'schedule_alarm-' + i;
        this.a[i].classList.add('MMM-Skolschema-alarm', 'ns-box');
        this.a[i].style.backgroundColor = this.config.alarmBackground;
        this.a[i].style.borderColor = this.config.alarmBorderColor;
        this.a[i].style.color = this.config.alarmTextColor;

        const alarmContent = document.createElement('div');
        alarmContent.classList.add('schedule_alarm-content', 'small');
        alarmContent.innerHTML = alarm.message;

        const icon = document.createElement('span');

        if (alarm.alarmIcon !== '') {
          icon.classList.add('fa', alarm.alarmIcon);
        }

        if (this.config.useTTS) {
          this.sendNotification('TTS_SAY', alarm.message);
        }

        alarmContent.prepend(icon);
        this.a[i].appendChild(alarmContent);
        this.alarmBlock.appendChild(this.a[i]);
      }
    } else {
      this.a = this.a.filter((c) => c.id !== 'schedule_alarm-' + i);
      const alarmEl = document.querySelector('#schedule_alarm-' + i);
      if (alarmEl) {
        alarmEl.remove();
      }
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
      }, 60 * 1000);
    });
  },

  setCurrent: function () {
    const nowTime = H.time2Mins(this.config.timeFormat);

    this.scheduleRows.forEach((rowEl) => {
      const start = parseInt(rowEl.dataset.start, 10);
      const end = parseInt(rowEl.dataset.end, 10);
      const progressEl = rowEl.querySelector('.schedule-progress');
      const alarmEl = rowEl.querySelector('.far');

      if (start <= nowTime && nowTime < end) {
        rowEl.classList.add('bright');

        if (this.config.showCurrentProgress) {
          if (progressEl) {
            progressEl.style.display = 'block';
          }
          H.setProgress(rowEl, nowTime, this);
        }
      } else if (nowTime >= end && alarmEl) {
        alarmEl.classList.remove('fa-bell');
        alarmEl.classList.add('fa-bell-slash');
        rowEl.classList.remove('bright');
        if (progressEl) {
          progressEl.style.display = 'none';
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

    this.scheduleRows = this.currSchedule[this.scheduleDay].schedule.map((row, i) => {
      const rowEl = document.createElement('div');
      rowEl.classList.add('schedule-row');

      const timeEl = document.createElement('span');
      timeEl.classList.add('schedule-time', 'thin', 'xsmall');

      if (!row.hasOwnProperty('end') || row.end === '') {
        row.end =
          i !== rowLength - 1 ? this.currSchedule[this.scheduleDay].schedule[i + 1].start : '23:59';
      }

      let timeContent = row.start;
      if (this.config.showEndTime) {
        timeContent += ` &ndash; ${row.end}`;
      }
      timeEl.innerHTML = timeContent;
      const alarmEl = document.createElement('span');
      timeEl.appendChild(alarmEl);

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
      if (this.config.showCurrentProgress && this.active) {
        rowEl.appendChild(H.getProgress(this.config, start, end));
      }

      if (row.hasOwnProperty('alarm') && row.alarm !== '') {
        if (H.time2Mins(this.config.timeFormat) <= end) {
          alarmEl.classList.add('far', 'fa-bell');
        } else {
          alarmEl.classList.add('far', 'fa-bell-slash');
        }

        this.alarms.push(
          H.formatAlarm({ start: row.start, end: row.end, message: row.alarm }, this.config)
        );
      }

      cellDiv.appendChild(rowEl);
      return rowEl;
    });

    if (this.config.showCurrent && this.active) {
      this.setCurrent();
    }

    cellDiv.classList.add('schedule-rows');
    return cellDiv;
  },

  getSchedule: function () {
    const nowMins = H.time2Mins(this.config.timeFormat);

    // Fix to get mon - sun
    const now = new Date();
    const currDayNum = now.getDay() - 1 < 0 ? 6 : now.getDay() - 1;
    this.currentDay = Object.keys(this.config.schedules[currDayNum])[0];

    const thisDayNum =
      nowMins >= this.nextDayMinutes ? (currDayNum + 1 > 6 ? 0 : currDayNum + 1) : currDayNum;

    const schedule = this.config.schedules.filter(
      (item) => Object.keys(item)[0] === Object.keys(this.config.schedules[thisDayNum])[0]
    )[0];

    if (nowMins === 1) {
      this.alarmBlock.innerHTML = '';
      this.updateDom(0);
    }

    return schedule;
  },

  generateSchedule: function () {
    this.a = [];
    this.currSchedule = {};
    this.scheduleRows = [];
    this.scheduleDay = '';
    this.currentDay = '';
    this.active = false;
    this.alarms = [];
    this.alarmTimer = null;
    this.nextDayMinutes = H.time2Mins(this.config.timeFormat, this.config.showNextDayAt);
    H.resetTimers(this);

    const scheduleContent = document.createElement('div');
    scheduleContent.classList.add('MMM-Skolschema__content');

    this.currSchedule = this.getSchedule();
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
      this.currSchedule = this.getSchedule();
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

    w.appendChild(this.generateSchedule());
    return w;
  },
});
