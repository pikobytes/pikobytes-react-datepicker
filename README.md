This is a datepicker developed for the special use cases of [Pikobytes](https://pikobytes.de/).  
Currently it is used in [Opensensorweb](https://opensensorweb.de/#/search), an product developed by Pikobytes.  

Basic Usage:
```JSX
<DateRangePicker
      startDate={startDate} // expected as moment.js moment
      endDate={endDate} // expected as moment.js moment
      id={id} // expects a number, but its not required
      selectionStart={selectionStart} // optional, expected as moment.js
      selectionEnd={selectionEnd} // optional, expected as moment.js
      reportChanges={this.reportChange.bind(this)} // function expected/>
```
This will render a dateRangePicker with 2 Calendars. Upon a selection the "reportChanges" function will be called.  
The function will be called with a selection, represented by an array, consisting of two values.   
The id is basically a way to determine, whether you want to focus the selection you pass in as prop. When you always want to focus the passed in Selection, just pass in an increasing number or alternate a number between 1 and 0.

```JSX
[selectionStart, selectionEnd] // both will be momentjs objects
```

There are two other options which can be modified:
```JSX
    format: propTypes.string // read more in moment.js docs format
    numberOfCalendars: propTypes.number // specifies the number of calendars
 ```
 
 There might be a special use case where you want to have 12 months displayed. This can be accomplished by the numberOfCalendars setting. The Calendar tries to evenly space the gaps between the months, if the specified range is large enough.
 
 Additionally there is the DatePicker: 
```JSX
<DatePicker/>
``` 
which has the same API as the DateRangePicker, without the numberOfCalendars. It displays a single calendar and allows to select single days. The reportChanges function will be called with a single moment.js object.
