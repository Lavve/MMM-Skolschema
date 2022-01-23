/* Skolschema */

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
    noScheduleText: '',
    schedule: [],
    scheduleInterval: 60 * 1000,
    alarms: [],
    alarmInterval: 60 * 1000,
  },

  getStyles: function () {
    return [this.name + '.css'];
  },

  start: function () {
    Log.info('Starting module: ' + this.name);
    this.currSchedule = {};
    this.currentDay = '';
    this.updateMins =
      parseInt(this.config.showNextDayAt.split(':')[0], 10) * 60 +
      parseInt(this.config.showNextDayAt.split(':')[1], 10);
  },

  currentAlarms: [],

  setAlarmNotice: function (alarm) {
    const now = new Date();
    const nowTime = now.getHours() * 60 + now.getMinutes();

    const [aH, aM] = alarm.start.split(':');
    const alarmStart = parseInt(aH, 10) * 60 + parseInt(aM, 10);
    const [eH, eM] = alarm.end.split(':');
    const alarmEnd = parseInt(eH, 10) * 60 + parseInt(eM, 10);
    const timerMs = alarmEnd - alarmStart * 60 * 1000;

    const hasAlarm = this.currentAlarms.includes(alarm.label);

    if (nowTime >= alarmStart && nowTime < alarmEnd) {
      if (!hasAlarm) {
        this.currentAlarms.push(alarm.label);
        this.sendNotification(
          'SHOW_ALERT',
          {
            type: 'notification',
            timer: timerMs,
            message: alarm.message,
          },
          alarm.label
        );
      }
    } else {
      this.currentAlarms = this.currentAlarms.filter((i) => i !== alarm.label);
      this.sendNotification('HIDE_ALERT', alarm.label);
    }
  },

  checkForAlarms: function () {
    for (var schedule in this.currSchedule[this.currentDay]) {
      const schedRow = this.currSchedule[this.currentDay][schedule];

      this.config.alarms.forEach((alarm) => {
        const [aH, aM] = alarm.time.split(':');
        const alarmTime = parseInt(aH, 10) * 60 + parseInt(aM, 10);

        if (
          alarm.label.toLowerCase() === schedRow.label.toLowerCase() &&
          alarm.hasOwnProperty('time') &&
          alarm.time !== ''
        ) {
          console.log(`We have an alarm at ${alarm.time}`);
          // We have alarm
          this.setAlarmNotice(alarm);
          this.alarmTimer = setInterval(() => {
            this.setAlarmNotice(alarm);
          }, this.config.alarmInterval);
        }
      });
    }
  },

  generateScheduleList: function (schedules) {
    const cellDiv = document.createElement('div');

    if (!schedules.length) {
      cellDiv.classList.add('no-schedule');
      cellDiv.innerHTML = this.config.noScheduleText;
      return cellDiv;
    }

    const now = new Date();
    const nowTime = now.getHours() * 60 + now.getMinutes();

    schedules.map((schedule) => {
      const rowDiv = document.createElement('div');
      const schedRow = schedules[schedule];

      const start = schedule['start'];
      const [sH, sM] = start.split(':');
      const startTime = parseInt(sH, 10) * 60 + parseInt(sM, 10);

      const [eH, eM] = schedule['end'].split(':');
      const endTime = parseInt(eH, 10) * 60 + parseInt(eM, 10);

      rowDiv.innerHTML = start + ' - ' + schedule.label;

      if (startTime <= nowTime && nowTime < endTime) {
        const percentDiv = document.createElement('div');
        percentDiv.classList.add('percent');
        const percentDivValue = document.createElement('div');
        percentDivValue.classList.add('percent-value');

        const percent = Math.round(
          (100 * (nowTime - startTime)) / (endTime - startTime)
        );

        percentDivValue.style.width = percent + '%';
        percentDiv.appendChild(percentDivValue);
        rowDiv.classList.add('current');
        rowDiv.appendChild(percentDiv);
      }

      cellDiv.appendChild(rowDiv);
    });

    cellDiv.classList.add('schedule-block');
    return cellDiv;
  },

  getCurrentSchedule: function () {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const currDayNum = now.getDay() - 1 < 0 ? 6 : now.getDay() - 1;
    const thisDayNum =
      nowMins >= this.updateMins
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

  appendSchedule: function (cell) {
    cell.innerHTML = '';
    cell.appendChild(
      this.generateScheduleList(this.currSchedule[this.currentDay])
    );
  },

  generateTable: function () {
    const table = document.createElement('table');

    const dayRow = document.createElement('tr');
    const scheduleRow = document.createElement('tr');

    const dayCell = document.createElement('td');
    const scheduleCell = document.createElement('td');

    this.currSchedule = this.getCurrentSchedule();
    this.currentDay = Object.keys(this.currSchedule)[0];
    console.log(this.currentDay, this.currSchedule);
    let tempDay = this.currentDay;

    this.appendSchedule(scheduleCell);
    this.timer = setInterval(() => {
      this.appendSchedule(scheduleCell);
    }, this.config.updateInterval);

    dayCell.classList.add('day');
    dayCell.innerHTML = this.currentDay;
    dayRow.appendChild(dayCell);

    this.checkForAlarms();

    setInterval(() => {
      this.currSchedule = this.getCurrentSchedule();
      this.currentDay = Object.keys(this.currSchedule)[0];

      if (tempDay !== this.currentDay) {
        tempDay = this.currentDay;
        dayCell.innerHTML = this.currentDay;
        console.log(this.currentDay, this.currSchedule[this.currentDay]);

        if (this.timer) {
          clearInterval(this.timer);
        }
        if (this.alarmTimer) {
          clearInterval(this.alarmTimer);
        }

        this.checkForAlarms();

        this.appendSchedule(scheduleCell);
        this.timer = setInterval(() => {
          this.appendSchedule(scheduleCell);
        }, this.config.updateInterval);
      }
    }, 60 * 1000);

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
