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
    rowFormat: 'time:label',
    noScheduleText: '',
    showCurrentProgress: true,
    progressType: 'bar',
    progressColor: '#fff',
    dividerColor: '#666',
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

    this.ready = !1;
    H.sync(this);
  },

  setCurrent: function () {
    const nowTime = H.time2Mins(this.config.timeFormat);

    this.scheduleRows.forEach((rowEl) => {
      const start = parseInt(rowEl.dataset.start, 10);
      const end = parseInt(rowEl.dataset.end, 10);
      const progressEl = rowEl.querySelector('.schedule-progress');

      if (start <= nowTime && nowTime < end) {
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
          i !== rowLength - 1
            ? this.currSchedule[this.scheduleDay].schedule[i + 1].start
            : '23:59';
      }

      let timeContent = row.start;
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

      if (row.hasOwnProperty('divider') && row.divider.trim() !== '') {
        rowEl.classList.add(`divider-${row.divider}`);

        if (this.config.dividerColor !== '') {
          rowEl.style.borderColor = this.config.dividerColor;
        }
      }

      // Prepare progress bar
      if (this.config.showCurrentProgress && this.active) {
        rowEl.appendChild(H.getProgress(this.config, start, end));
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
      this.updateDom(0);
    }

    return schedule;
  },

  generateSchedule: function () {
    this.currSchedule = {};
    this.scheduleRows = [];
    this.scheduleDay = '';
    this.currentDay = '';
    this.active = false;
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
