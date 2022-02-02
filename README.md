# MMM-Skolschema

A highly customizable schedule module for [MagicMirror²](https://github.com/MichMich/MagicMirror) that shows the schedule for the current day, with a built in alarm functionality.

- [Installation](#installation)
- [Configuration](#configuration)
    - [Schedule](#schedule)
    - [Alarms](#alarms)
- [Example](#example)
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
| `showNextDayAt` | str | `'0:00'` | At what time the next day's schedule will show up |
| `showEndTime` | bool | `false` | Choose if end time will be shown on each row or not |
| `showCurrent` | bool | `true` | Decides if the current row will be highlighted |
| `timeFormat` | int | `[config.timeFormat]` | Uses the time format stated in config.js as default, but can be overridden here if needed. Possible values are `12` or `24` |
| `rowFormat` | str | `'time:label'` | Place time to the left or right och the label. `'time:label'` or `'label:time'` are the valid values |
| `noScheduleText` | str | `''` | Text shown when schedule for the current day is empty |
| `showCurrentProgress` | bool | `true` | Show a progressbar below current row in the schedule |
| `progressColor` | str | `'#fff'` | Color of the progress bar |
| `dividerColor` | str | `'#666'` | Color of the divider |
| `schedule` | array | `[]` | List of schedules for all day's of the week |

### Schedule

Configuration for the schedule. Must include _all days_ in a week, Monday to Sunday (_in that order_), in preferable language. If a day has a schedule it must include `'start'`, `'end'` and `'label'`. If a day don't have a schedule, an empty array (`[]`) must be set.

| Node | Type | Example | Optional | Description |
| --- | --- | --- | --- | --- |
| `start` | str | `'18:15'` |  | Start time of current schedule row |
| `end` | str | `'19:25'` |  | End time of current schedule row |
| `label` | str | `'Tennis'` |  | Label of the current schedule row |
| `divider` | str | `'after'` | ✓ | Show a divider before, after or both of the row. Valid values are `'before'`, `'after'` or `'both'` |
| `alarm` | str | `''` | ✓ | Enter a alarm message that is shown in time for the current schedule |

### Alarms

If you want an alarm that isn't attached to the schedule, add an array named `'alarms'` to the daily schedule that holds the following information

| Node | Type | Example | Optional | Description |
| --- | --- | --- | --- | --- |
| `start` | str | `'7:30 AM'` |  | Start time when alarm is visible |
| `end` | str | `'8:00 AM'` | ✓ | End time when alarm is hidden. If leaving empty or is excluded the alarm will be hidden after two (2) hours |
| `message` | str | `'Ta med fiskespöt! 🎣'` |  | Text that is shown in the alarm notification |

## Example

```js
{
  module: 'MMM-Skolschema',
  showDayname: true,
  showNextDayAt: '20:00',
  showEndTime: true,
  rowFormat: 'time:label',
  noScheduleText: 'Inget att göra idag',
  progressColor: 'lime',
  dividerColor: '#4b0082',
  schedules: [{
    'Måndag': [
      { start: '8:00', end: '8:40', label: 'Musik' },
      { start: '8:40', end: '9:15', label: 'Mattematik', divider: 'below' },
      { start: '9:30', end: '11:00', label: 'Svenska' },
      { start: '11:00', end: '12:00', label: 'Lunch', devider: 'both' },
      { start: '12:00', end: '13:30', label: 'Idrott', alarm: 'Kom ihåg att duscha 🚿' },
      { start: '13:30', end: '14:30', label: 'Engelska' },
      { start: '16:30', end: '17:30', label: 'Simning' },
      { alarms: [
        { start: '19:00', end: '20:30', message: 'Tvättstuga 🧺' },
      ]},
    ],
    'Tisdag': [],
    'Onsdag': [],
    'Torsdag': [
      { alarms: [
        { start: '10:00', end: '11:30', message: 'Mata katten 🐈' },
        { start: '17:00', end: '17:30', message: 'Rasta hunden 🐕' },
      ]},
    ],
    'Fredag': [],
    'Lördag': [
      { 
        start: '10:00',
        end: '11:30',
        label: 'Tennis',
        alarm: {
          start: '9:30',
          end: '10:00',
          message: 'Kom ihåg att ta med racket 🎾',
        },
      },
    ],
    'Söndag': [],
  }],
}
```

## Screenshots
Screenshots will be provided at a later time

## TODO
- [ ] Add own alarm notification template
- [ ] Adjust time to exact second to match schedule and alarm times
- [ ] Bug fix for cases when if next day is shown, that schedule's progress is shown
- [x] Add possibility to add optional alarms for each day, not only on schedule rows
- [x] Add optional divider on schedule row
- [x] Make it work with either 12h or 24h time format
- [x] Make choise for label-time or time-label templates
- [x] Make choise for showing end time for each row

## Collaborate

Pull requests, translations and suggestions for improvements are more than welcome.

## Donations

[🍻 Buy me a beer](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=SM9XRXUPPJM84&item_name=%40lavve+MagicMiror+Modules) if you like my modules! ❤
