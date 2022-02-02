const helpers = {
  time2Mins: function (timeFormat, time, add = 0) {
    if (!time) {
      const now = new Date();
      return (now.getHours() + add) * 60 + now.getMinutes();
    }

    if (timeFormat === 12) {
      const hm = time.slice(0, -2).trim();
      const mod = time.slice(-2).trim();
      let [h, m] = hm.split(':');
      h = parseInt(h, 10);
      m = parseInt(m, 10);
      h = h === 12 ? 0 : h;
      h = mod.toLowerCase() === 'pm' ? h + 12 + add : h + add;

      return h * 60 + m;
    } else {
      return (
        (parseInt(time.split(':')[0], 10) + add) * 60 +
        parseInt(time.split(':')[1], 10)
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

  formatAlarm: function (alarm, format) {
    const convert = {};
    convert.start = helpers.time2Mins(format, alarm.start);

    if (alarm.hasOwnProperty('end')) {
      convert.end = helpers.time2Mins(format, alarm.end);
    } else {
      convert.end = helpers.time2Mins(format, alarm.start, 2);
    }
    convert.message = alarm.message;
    return convert;
  },
};
