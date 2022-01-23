# MMM-Skolschema

A module for [MagicMirror²](https://github.com/MichMich/MagicMirror) that shows today's schedule.

## Installation

1. Clone this repository into `MagicMirror/modules/` inside your MagicMirror² folder.

```
cd ~/MagicMirror/modules
git clone https://github.com/Lavve/MMM-Skolschema
```

2. Add the module to your MagicMirror² `~/MagicMirror/config/config.js`

```javascript
{
  module: "MMM-Skolschema",
  header: "Dagens schema",
  position: "bottom_center",
  config: {
    showNextDayAt: '0:00',
    noScheduleText: '',
    schedules: [],
    scheduleInterval: '60 * 1000',
    alarms: [],
    alarmInterval: '60 * 1000',
  },
},
```

## Configuration

Theese nodes are available:
| Configuration | Default | Type | Description |
| --- | --- | --- | --- |
| showNextDayAt | `"0:00"` | string | At what time should the next day come up |
| noScheduleText | `""` | string | Text that is shown when the schedule is empty |
| schedule | `[]` | array | List of schedules for all day's of the week. [See below](#schedule-example) |
| scheduleInterval | `60 * 1000` | int | Frequency of updates of schedule (in ms) |
| alarms | `[]` | array | List of alarms. [See below](#alarm-example) |
| alarmInterval | `60 * 1000` | int | Check for alarms frequency (in ms) |

### Schedule example

Configuration example for the schedule part above. Must include all days in a week. If a day has a schedule then `start`, `end` and `label` must be set, otherwise just put an empty array. Start and end time in *24h format* only.

```javascript
schedule: [{
  'Måndag': [
    { start: '8:00', end: '8:40', label: 'Musik' },
    { start: '8:40', end: '9:15', label: 'Mattematik' },
    { start: '9:30', end: '11:00', label: 'Svenska' },
    { start: '11:00', end: '12:00', label: 'Lunch' },
    { start: '12:00', end: '13:30', label: 'Idrott' },
    { start: '13:45', end: '14:30', label: 'Engelska' },
  ],
  'Tisdag': [],
  'Onsdag': [],
  'Torsdag': [],
  'Fredag': [],
  'Lördag': [
    { start: '10:00', end: '11:30', label: 'Fotboll' },
  ],
  'Söndag': [],
}],
```

### Alarm example

Configuration example for the alarm part above. Must include `label` that has to be *exact* what is set in the [schedule above](#schedule-example) and a `message` that is shown between the `start` and `end` time. Start and end time in *24h format* only.

```javascript
alarms: [
  {
    label: 'Idrott',
    message: "Glöm inte gympapåsen!",
    start: '6:30',
    end: '7:30',
  },
  {
    label: 'Fotboll',
    message: "Glöm inte fotbollsskorna! ⚽",
    start: '9:30',
    end: '10:00',
  },
],
```

## Collaborate

Pull requests, translations and suggestions for improvements are more than welcome.

## Donations

[Buy me a beer](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=SM9XRXUPPJM84&item_name=%40lavve+MagicMiror+Modules) if you like my modules! ❤️
