# MMM-Skolschema

A highly customizable schedule module for [MagicMirror²](https://github.com/MichMich/MagicMirror) that shows the schedule for the current day, with a built in alarm functionality.

- [Installation](#installation)
- [Configuration](#configuration)
    - [Schedules](#schedules)
      + [Schedule array](#schedule-array)
      + [Alarm array](#alarm-array)
- [Example](#example)
  - [Template](#template)
- [Screenshots](#screenshots)
- [TODO](#todo)
- [Collaborate](#collaborate)
- [Donations](#donations)

## Installation

1. Clone this repository into your modules folder

```
cd ~/MagicMirror/modules
git clone https://github.com/Lavve/MMM-Skolschema
```

2. Add the module to your MagicMirror² config.js file

```js
{
  module: "MMM-Skolschema",
  header: "Dagens schema",
  position: "top_center",
  config: {
    ...
  },
},
```

## Configuration

Theese are the nodes that are available to make your magic schedule.

| Configuration | Type | Default | Description |
| --- | --- | --- | --- |
| `showDayname` | bool | `true` | Show current day name above schedule |
| `showEndTime` | bool | `false` | Choose if end time will be shown on each row or not |
| `showCurrent` | bool | `true` | Decides if the current row will be highlighted |
| `showCurrentProgress` | bool | `true` | Show a progressbar below current row in the schedule |
| `timeFormat` | int | `[config.timeFormat]` | Uses the time format stated in config.js as default, but can be overridden here if needed. Possible values are `12` or `24` |
| `rowFormat` | str | `'time:label'` | Place time to the left or right of the label. `'time:label'` or `'label:time'` are the valid values |
| `defaultAlarmEnd` | int | `2 * 60` | Time in minutes for when an alarm notification is hidden if leaving end time out. Default is set to two (2) hours |
| `showNextDayAt` | str | `'0:00'` | At what time the next day's schedule will show up |
| `noScheduleText` | str | `''` | Text shown when schedule for the current day is empty |
| `progressColor` | str | `'#fff'` | Color of the progress bar |
| `progressType` | str | `'bar'` | Choose between `'bar'` line below current row, or `'pie'` chart to the right |
| `dividerColor` | str | `'#666'` | Color of the divider |
| `schedules` | array | `[]` | List of schedules for all day's of the week, see below |

### Schedules

This one is the most importent part. Configuration for the schedules must include _all days_ in a week, Monday to Sunday (_in that order_), in preferable language. If a day don't have a schedule, an empty array (`[]`) must be set.

Each day has two nodes, one optonal for alarms and one mandatory for the schedule

| Node | Type | Example | Optional | Description |
| --- | --- | --- | --- | --- |
| `schedule` | arr | `[]` |  | Array of today's schedule, see below |
| `alarms` | arr | `[]` | ✓ | Array of today's alarms, see below |

### Schedule array

The schedule array have the following coptions

| Node | Type | Example | Optional | Description |
| --- | --- | --- | --- | --- |
| `start` | str | `'18:15'` |  | Start time of current schedule row |
| `end` | str | `'19:25'` | ✓ | End time of current schedule row. If leaving empty string or is excluded, the start time of next row is used. If it's the last row, `'23:59'` or `'11:59 pm'` is used |
| `label` | str | `'Tennis'` |  | Label of the current schedule row |
| `divider` | str | `'after'` | ✓ | Show a divider before, after or both of the row. Valid values are `'before'`, `'after'` or `'both'` |
| `alarm` | str | `''` | ✓ | Enter a alarm message that is shown in time for the current schedule. Uses current row's start and end time |

### Alarm array

The optional alarm array have the following options

| Node | Type | Example | Optional | Description |
| --- | --- | --- | --- | --- |
| `start` | str | `'7:30 AM'` |  | Time when alarm shows up |
| `end` | str | `'8:00 AM'` | ✓ | Time when alarm is hidden. If leaving empty string or is excluded, the alarm will be hidden after what is set in `defaultAlarmEnd` setting above |
| `message` | str | `'Ta med fiskespöt! 🎣'` |  | Text that is shown in the alarm notification |

## Example

```js
{
  module: 'MMM-Skolschema',
  showDayname: true,
  timeFormat: 24,
  defaultAlarmEnd: 60,
  showNextDayAt: '20:00',
  showEndTime: true,
  rowFormat: 'label:time',
  noScheduleText: 'Inget på schemat',
  progressColor: 'lime',
  progressType: 'pie',
  dividerColor: '#4b0082',
  schedules: [{
    'Måndag': {
      alarms: [
        { start: '19:00', end: '20:30', message: 'Tvättstuga 🧺' },
      ],
      schedule: [
        { start: '8:00', end: '8:40', label: 'Musik' },
        { start: '8:40', end: '9:15', label: 'Mattematik', divider: 'below' },
        { start: '9:30', end: '11:00', label: 'Svenska' },
        { start: '11:00', end: '12:00', label: 'Lunch', devider: 'both' },
        { start: '12:00', end: '13:30', label: 'Idrott', alarm: 'Kom ihåg att duscha 🚿' },
        { start: '13:30', end: '14:30', label: 'Engelska' },
        { start: '16:30', end: '17:30', label: 'Simning' },
      ]
    },
    'Tisdag': [],
    'Onsdag': [],
    'Torsdag': {
      alarms: [
        { start: '10:00', end: '11:30', message: 'Mata katten 🐈' },
        { start: '17:00', end: '17:30', message: 'Rasta hunden 🐕' },
      ],
    },
    'Fredag': [],
    'Lördag': {
      schedule: [
        { start: '10:00', end: '11:30', label: 'Tennis' },
       ],
       alarms: [
         { start: '9:30', end: '10:00', message: 'Kom ihåg att ta med racket 🎾', },
       ],
    },
    'Söndag': [],
  }],
}
```

### Template

Here's a simple template for the configuration with English day names. Copy this and change it to your language, if preferable.

```js
schedules: [
  Monday: { alarms: [], schedule: [] },
  Tuesday: { alarms: [], schedule: [] },
  Wednesday: { alarms: [], schedule: [] },
  Thursday: { alarms: [], schedule: [] },
  Friday: { alarms: [], schedule: [] },
  Saturday: { alarms: [], schedule: [] },
  Sunday: { alarms: [], schedule: [] },
]
```


## Screenshots
Screenshots will be provided at a later time

## TODO
- [ ] Add own alarm notification template
- [ ] Bug fix for cases when if next day is shown, that schedule's progress and current is shown
- [x] Adjust time to exact second to match schedule and alarm times
- [x] Add choise for how progress is shown, `bar` or `pie`
- [x] Add custom alarm timeout setting
- [x] Add possibility to add optional alarms for each day, not only on schedule rows
- [x] Add optional divider on schedule row
- [x] Make it work with either 12h or 24h time format
- [x] Make choise for label-time or time-label templates
- [x] Make choise for showing end time for each row

## Collaborate

Pull requests, translations and suggestions for improvements are more than welcome.

## Donations

[🍻 Buy me a beer](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=SM9XRXUPPJM84&item_name=%40lavve+MagicMiror+Modules) if you like [my mm² modules](https://github.com/search?q=user%3ALavve+MMM-)! ❤
