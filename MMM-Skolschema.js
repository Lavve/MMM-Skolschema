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
    this.nextDayMinutes =
      parseInt(this.config.showNextDayAt.split(':')[0], 10) * 60 +
      parseInt(this.config.showNextDayAt.split(':')[1], 10);
  },

  setAlarmNotice: function (alarm) {
    const now = new Date();
    const nowTime = now.getHours() * 60 + now.getMinutes();

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
    const now = new Date();
    const nowTime = now.getHours() * 60 + now.getMinutes();

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

    convert.start =
      parseInt(alarm.start.split(':')[0], 10) * 60 +
      parseInt(alarm.start.split(':')[1], 10);

    if (alarm.hasOwnProperty('end')) {
      convert.end =
        parseInt(alarm.end.split(':')[0], 10) * 60 +
        parseInt(alarm.end.split(':')[1], 10);
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

    console.log(this.currentDay, this.currSchedule);

    if (!this.currSchedule[this.currentDay].length) {
      cellDiv.classList.add('no-schedule');
      cellDiv.innerHTML = this.config.noScheduleText;
      return cellDiv;
    }

    rowEls = this.currSchedule[this.currentDay].map((row) => {
      // console.log(row);
      const rowDiv = document.createElement('div');
      rowDiv.innerHTML = `${row.start} - <span class="bold">${row.label}</span>`;

      const start =
        parseInt(row.start.split(':')[0], 10) * 60 +
        parseInt(row.start.split(':')[1], 10);
      const end =
        parseInt(row.end.split(':')[0], 10) * 60 +
        parseInt(row.end.split(':')[1], 10);
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

    cellDiv.classList.add('schedule-block');
    return cellDiv;
  },

  getCurrentSchedule: function () {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
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

  generateTable: function () {
    const table = document.createElement('table');

    this.currSchedule = this.getCurrentSchedule();
    this.currentDay = Object.keys(this.currSchedule)[0];
    let tempDay = this.currentDay;

    const dayCell = document.createElement('td');
    dayCell.classList.add('day', 'bright', 'medium', 'thin');
    dayCell.innerHTML = this.currentDay;

    const dayRow = document.createElement('tr');
    if (this.config.showDayname) {
      dayRow.appendChild(dayCell);
    }

    const scheduleCell = document.createElement('td');
    scheduleCell.appendChild(this.getScheduleList());

    // Check if new day
    setInterval(() => {
      this.currSchedule = this.getCurrentSchedule();
      this.currentDay = Object.keys(this.currSchedule)[0];

      if (tempDay !== this.currentDay) {
        // We have a new day
        tempDay = this.currentDay;
        dayCell.innerHTML = this.currentDay;
        scheduleCell.innerHTML = '';

        scheduleCell.appendChild(this.getScheduleList());
      }
    }, 60 * 1000);

    const scheduleRow = document.createElement('tr');
    scheduleRow.classList.add('row');
    scheduleRow.appendChild(scheduleCell);

    table.classList.add('MMM-Skolschema-table');
    table.appendChild(dayRow);
    table.appendChild(scheduleRow);

    return table;
  },

  getDom: function () {
    const w = document.createElement('div');
    w.appendChild(this.generateTable());
    return w;
  },
});
