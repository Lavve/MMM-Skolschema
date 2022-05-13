# MMM-Skolschema

A highly customizable schedule module for [MagicMirror²](https://github.com/MichMich/MagicMirror) that shows the schedule for the current day, with a built in alarm functionality.

- [Installation](#installation)
- [Configuration](#configuration)
    - [Schedules](#schedules)
      + [Schedule list](#schedule-list)
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
| `highlightCurrent` | bool | `true` | Decides if the current row will be highlighted |
| `showCurrentProgress` | bool | `true` | Show a progressbar below current row in the schedule |
| `dimFinished` | bool | `true` | Dim rows that has passed current time |
| `showUpcomming` | bool | `true` | Show arrow at upcomming row if previous end time has passed and next isn't yet started |
| `timeFormat` | int | `[config.timeFormat]` | Uses the time format stated in config.js as default, but can be overridden here if needed. Possible values are `12` or `24` |
| `rowFormat` | str | `'time:label'` | Place time to the left or right of the label. `'time:label'` or `'label:time'` are the valid values here |
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

### Schedule list

The schedule array have the following coptions

| Node | Type | Example | Optional | Description |
| --- | --- | --- | --- | --- |
| `start` | str | `'18:15'` |  | Start time of current schedule row |
| `label` | str | `'Tennis'` |  | Label of the current schedule row |
| `end` | str | `'19:25'` | ✓ | End time of current schedule row. If leaving empty string or is excluded, the start time of next row is used. If it's the last row, `'23:59'` or `'11:59 pm'` is used |
| `divider` | str | `'after'` | ✓ | Show a divider before, after or both of the row. Valid values are `'before'`, `'after'` or `'both'` |


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
      schedule: [
        { start: '8:00', end: '8:40', label: 'Musik' },
        { start: '8:40', end: '9:15', label: 'Mattematik', divider: 'below' },
        { start: '9:30', end: '11:00', label: 'Svenska' },
        { start: '11:00', end: '12:00', label: 'Lunch', devider: 'both' },
        { start: '12:00', end: '13:30', label: 'Idrott' },
        { start: '13:30', end: '14:30', label: 'Engelska' },
        { start: '16:30', end: '17:30', label: 'Simning' },
      ],
    },
    'Tisdag': { schedule: [] },
    'Onsdag': { schedule: [] },
    'Torsdag': { },
    'Fredag': { schedule: [] },
    'Lördag': {
      schedule: [
        { start: '10:00', end: '11:30', label: 'Ishockey' },
       ]
    },
    'Söndag': { schedule: [] },
  }],
}
```

### Template

Here's a template for the configuration with English day names. Copy this and change it to your language, if preferable.

```js
schedules: [
  Monday: { schedule: [] },
  Tuesday: { schedule: [] },
  Wednesday: { schedule: [] },
  Thursday: { schedule: [] },
  Friday: { schedule: [] },
  Saturday: { schedule: [] },
  Sunday: { schedule: [] },
]
```


## Screenshots

Screenshots will be provided at a later time

## TODO

- [x] Add choice for dimming finished schedule row
- [x] Add choice for showing upcomming schedule row
- [x] Refactor helper functions
- [x] Bug fix for cases when if next day is shown, that schedule's progress and current is shown
- [x] Adjust time to exact second to match schedule
- [x] Add choice for how progress is shown, `'bar'` or `'pie'`
- [x] Add optional divider on schedule rows
- [x] Make it work with either 12h or 24h time format
- [x] Add choice for label-time or time-label templates
- [x] Add choice for showing end time for each row

## Collaborate

Pull requests, translations and suggestions for improvements are more than welcome.

## Donations

[🍻 Buy me a beer](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=SM9XRXUPPJM84&item_name=%40lavve+MagicMiror+Modules) if you like [my mm² modules](https://github.com/search?q=user%3ALavve+MMM-)! ❤
