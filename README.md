# MMM-Skolschema

A module for [MagicMirror²](https://github.com/MichMich/MagicMirror) that shows today's schedule.

## Installation

1. Clone this repository into `MagicMirror/modules/`.

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
    ...
  },
},
```

## Configuration

Theese nodes are available to make your magic schedule:
| Configuration | Default | Type | Description |
| --- | --- | --- | --- |
| showDayname | `'true'` | bool | Show current day name above schedule |
| showNextDayAt | `'0:00'` | str | At what time should the next day come up. _24h format only_ |
| noScheduleText | `''` | str | Text shown when schedule for the current day is empty |
| showCurrentProgress | `true` | bool| Show a progressbar below current row in the schedule |
| progressColor | `'#fff'` | str | Color of the progress bar |
| schedule | `[]` | array | List of schedules for all day's of the week. [See below](#schedule) |

### Schedule

Configuration for the schedule. Must include _all days_ in a week, Monday to Sunday (in that order), in preferable language. If a day has a schedule it must include `start`, `end` and `label`. If a day don't have a schedule an empty array must be set.

| Node | Optional | Type | Example | Description |
| --- | --- | --- | --- | --- |
| `start` |  | str | `'8:15'` | Start time of current schedule row. _24h format only_ |
| `end` |  | str | `'9:25'` | End time of current schedule row. _24h format only_ |
| `label` |  | str | `'Svenska'` | Label of the current schedule row |
| `alarm` | ✓ | obj | null | Settings for alarms. [See below](#alarm) |

### Alarm

If you want an alarm notification, the following configuration must be set.

| Node | Optional | Type | Example | Description |
| --- | --- | --- | --- | --- |
| `start` |  | str | `'7:30'` | Start time when alarm is visible. _24h format only_ |
| `end` | ✓ | str | `'8:00'` | End time when alarm is hidden. _24h format only_ |
| `message` |  | str | ´'Ta med fotbollsskorna! ⚽'´ | Text that is shown in the alarm notification |

## Example

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
    { 
      start: '10:00',
      end: '11:30',
      label: 'Tennis',
      alarm: {
        start: '9:30',
        end: '10:00',
        message: 'Kom ihåg att ta med racket! 🎾',
      },
    },
  ],
  'Söndag': [],
}],
```


## Collaborate

Pull requests, translations and suggestions for improvements are more than welcome.

## Donations

[Buy me a beer](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=SM9XRXUPPJM84&item_name=%40lavve+MagicMiror+Modules) if you like my modules! ❤️
