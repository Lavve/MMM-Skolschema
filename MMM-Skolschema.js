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
    showNextDayAtEnd: false,
    showDayname: true,
    showEndTime: false,
    highlightCurrent: true,
    showUpcomming: true,
    dimFinished: true,
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
    return [this.file(`${this.name}.css`)];
  },

  getScripts: function () {
    return [this.file(`${this.name}_helpers.js`)];
  },

  start: function () {
    Log.info(`Starting module :: ${this.name}`);
    sync(this);
  },

  setCurrent: function () {
    const nowTime = t2m(this.config.timeFormat);

    this.scheduleRows.forEach((rowEl, i) => {
      const start = parseInt(rowEl.dataset.start, 10);
      const end = parseInt(rowEl.dataset.end, 10);
      const progressEl = rowEl.querySelector('.schedule-progress');

      if (start <= nowTime && nowTime < end) {
        rowEl.classList.add('bright');
        rowEl.classList.remove('upcomming');

        if (this.config.showCurrentProgress) {
          if (progressEl) {
            progressEl.style.display = 'block';
          }
          setProgress(rowEl, nowTime, this.config);
        }
      } else {
        rowEl.classList.remove('bright', 'upcomming');
        if (progressEl) {
          progressEl.style.display = 'none';
        }

        if (nowTime >= end && this.config.dimFinished) {
          rowEl.classList.add('dimmed');
        }

        if ((this.scheduleRows[i - 1] !== undefined
            && parseInt(this.scheduleRows[i - 1].dataset.end, 10) <= nowTime
            && start > nowTime
            && this.config.showUpcomming)
            || (i === 0 && nowTime < start && this.config.showUpcomming)) {
          rowEl.classList.add('upcomming');
        }
      }
    });

    this.currentTimer = setTimeout(() => {
      this.setCurrent();
    }, 60 * 1000);
  },

  getScheduleRows: function () {
    const rowLength = this.currSchedule[this.scheduleDay].schedule.length;

    return this.currSchedule[this.scheduleDay].schedule.map((row, i) => {
      const rowEl = document.createElement('div');
      rowEl.classList.add('schedule-row');

      const timeEl = document.createElement('div');
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

      const labelEl = document.createElement('div');
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

      const start = t2m(this.config.timeFormat, row.start);
      const end = t2m(this.config.timeFormat, row.end);

      rowEl.dataset.start = start;
      rowEl.dataset.end = end;

      if (row.hasOwnProperty('divider') && row.divider.trim() !== '') {
        rowEl.classList.add(`divider-${row.divider}`);

        if (this.config.dividerColor !== '#666') {
          rowEl.style.borderColor = this.config.dividerColor;
        }
      }

      // Prepare progress bar
      if (this.config.showCurrentProgress && this.isToday) {
        rowEl.appendChild(createProgress(this.config, start, end));
      }

      return rowEl;
    });
  },

  getScheduleList: function () {
    const rowsEl = document.createElement('div');

    if (
      !this.currSchedule[this.scheduleDay].hasOwnProperty('schedule') ||
      !this.currSchedule[this.scheduleDay].schedule.length
    ) {
      rowsEl.classList.add('no-schedule');
      rowsEl.innerHTML = this.config.noScheduleText;
      return rowsEl;
    }

    this.scheduleRows = this.getScheduleRows();
    this.scheduleRows.forEach((el) => {
      rowsEl.appendChild(el);
    });

    if (this.config.highlightCurrent && this.isToday) {
      this.setCurrent();
    }

    rowsEl.classList.add('schedule-rows');
    return rowsEl;
  },

  getSchedule: function () {
    const nowMins = t2m(this.config.timeFormat);

    // Fix to get mon - sun
    const now = new Date();
    const currDayNum = now.getDay() === 0 ? 6 : now.getDay() - 1;

    this.currentDay = Object.keys(this.config.schedules[currDayNum])[0];
    const thisDayNum = nowMins >= this.nextDayMinutes ? (currDayNum + 1 > 6 ? 0 : currDayNum + 1) : currDayNum;

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
    this.isToday = false;
    this.nextDayMinutes = t2m(this.config.timeFormat, this.config.showNextDayAt);
    resetAllTimers(this);

    const scheduleContent = document.createElement('div');
    scheduleContent.classList.add(`${this.name}__wrapper`);

    this.currSchedule = this.getSchedule();
    this.scheduleDay = Object.keys(this.currSchedule)[0];
    let tempDay = this.scheduleDay;
    this.isToday = this.currentDay === this.scheduleDay;

    const dayEl = document.createElement('div');
    dayEl.classList.add('day', 'bright', 'thin', 'center');

    if (this.config.showDayname) {
      dayEl.innerHTML = this.scheduleDay;
      scheduleContent.appendChild(dayEl);
    }

    scheduleContent.appendChild(this.getScheduleList());

    this.newDayTimer = setInterval(() => {
      this.currSchedule = this.getSchedule();
      this.scheduleDay = Object.keys(this.currSchedule)[0];
      this.isToday = this.currentDay === this.scheduleDay;

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
