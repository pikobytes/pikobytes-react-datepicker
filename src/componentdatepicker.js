import React from 'react';
import moment from 'moment';
import propTypes from 'prop-types';
import CalendarWithNavigation from './componentcalendarwithnavigation';
import './componentdatepicker.css';

/**
 * generates an array of size 7, representing a single week
 * @param {number} year - for which the week should be generated
 * @param {number} month - for which the week should be generated
 * @param {number} week - the concrete week which should be generated
 * @returns {moment.Moment[]} array of size 7, representing a week
 */
function generateDays(year, month, week) {
  return Array(7).fill(0).map((n, i) => moment()
    .year(year)
    .month(month)
    .week(week)
    .startOf('week')
    .clone()
    .add(n + (i + 1), 'day'));
}

/**
 * builds a calendar for the specified year
 * @param {number} year for which the calendar should be generated
 * @returns {Array} containing all months of a year
 */
function buildCalendar(year) {
  const months = [];
  for (let month = 0; month <= 11; month++) {
    const nextMonth = {
      month: month,
      weeks: {},
    };

    // subtract is needed for the shift from sunday to monday as first day of the week
    let startWeek = moment().year(year).month(month).startOf('month')
      .subtract(1, 'days')
      .startOf('week')
      .week();
    let endWeek = moment().year(year).month(month).endOf('month')
      .subtract(1, 'days')
      .startOf('week')
      .week();

    const weeks = [];

    // due to the shift from sunday to monday as first day of the week, as it is more common in europe,
    // the year might start with the 53th week. If that happens, we will just generate this week manually
    if (startWeek === 53) {
      startWeek = 1;
      weeks.push({ week: 53, days: generateDays(year - 1, 0, 53) });
    }
    // the week containing january the first is handled as the first week of the next year
    if (endWeek === 1) {
      endWeek = 53;
    }

    for (let week = startWeek; week <= endWeek; week++) {
      weeks.push({
        week: week,
        days: generateDays(year, month, week),
      });
    }
    nextMonth.weeks = weeks;
    months.push(nextMonth);
  }
  return months;
}


export default class DatePicker extends React.Component {
  static propTypes = {
    endDate: propTypes.object, // moment Object
    numberOfCalendars: propTypes.number,
    startDate: propTypes.object, // moment Object
  };

  static defaultProps = {
    endDate: moment('2018-01-31'),
    numberOfCalendars: 2,
    startDate: moment('1990-01-01'),
  };

  state = {
    calendar: [],
    displayError: false,
    displayedMonths: [],
    selectionStart: undefined,
    selectionEnd: undefined,
    selectionHandler: this.selectionStartHandler,
    temporaryEnd: undefined,
    temporaryStart: undefined,
  };

  /**
   * checks whether the month is valid, means if it is in the defined range (startDate - endDate)
   * @param {{
   *   year: number,
   *   month: number
   * }} displayedMonth, identified by year and month
   * @returns {boolean} states whether the month is valid
   */
  isValidDate(displayedMonth) {
    const { startDate, endDate } = this.props;
    const compareTo = moment().year(displayedMonth.year).month(displayedMonth.month).startOf('month');
    // checks if the month is in the range, so if the 01.01 is specified as endDate january should still be valid
    return compareTo.isBetween(startDate, endDate) || compareTo.isSame(startDate) || compareTo.isSame(endDate);
  }

  /**
   * modifies the currently displayed month
   * @param {{
   *   year: number,
   *   month: number
   * }} calendar currently selected month, identified by year and month
   * @param {{
   *   year: number,
   *   month: number
   * }} modification change which should be applied to the currently displayed month
   * @param {string} identifier meaning json key to which the calendar is identified in state
   */
  // TODO: rename parameters
  modifyCalendarMonth(modification, identifier) {
    const { displayedMonths } = this.state;

    const oldDisplayedMonth = displayedMonths[identifier];
    let newMonth = oldDisplayedMonth.month + modification.month;
    let newYear = oldDisplayedMonth.year + modification.year;

    if (newMonth < 0) {
      newMonth = 11;
      --newYear;
    }

    if (newMonth > 11) {
      newMonth = 0;
      ++newYear;
    }

    const newDisplayedMonth = {
      month: newMonth,
      year: newYear,
    };

    // just update the state if the month is defined, else display an error
    if (this.isValidDate(newDisplayedMonth)) {
      const newDisplayedMonths = displayedMonths.slice(0);
      newDisplayedMonths[identifier] = newDisplayedMonth;

      const newState = {
        displayedMonths: newDisplayedMonths,
        displayError: false,
      };

      this.setState(newState);
    } else {
      this.setState({ displayError: true });
    }
  }

  blockMonth(identifier, newDisplayedMonth) {
    const { displayedMonths } = this.state;


    if (identifier === 0) {
      // if first entry only check successor
      const successorDifference = moment().year(displayedMonths[identifier + 1].year)
        .month(displayedMonths[identifier + 1].month)
        .diff(moment().year(newDisplayedMonth.year).month(newDisplayedMonth.month), 'months');
      return successorDifference > 0;
    } else if (identifier === displayedMonths.length - 1) {
      const predecessorDifference = moment().year(newDisplayedMonth.year)
        .month(newDisplayedMonth.month)
        .diff(moment().year(displayedMonths[identifier - 1].year).month(displayedMonths[identifier - 1].month), 'months');
      // if last entry only check predecessor
      return predecessorDifference > 0;
    }
    // if there are more than 2 calendars check both

    const successorDifference = moment().year(displayedMonths[identifier + 1].year)
      .month(displayedMonths[identifier + 1].month)
      .diff(moment().year(newDisplayedMonth.year).month(newDisplayedMonth.month), 'months');
    const predecessorDifference = moment().year(newDisplayedMonth.year)
      .month(newDisplayedMonth.month)
      .diff(moment().year(displayedMonths[identifier - 1].year).month(displayedMonths[identifier - 1].month), 'months');
    return successorDifference > 0 && predecessorDifference > 0;
  }

  /**
   * generate the calendar associated with the specified range
   */
  componentDidMount() {
    const { startDate, numberOfCalendars, endDate } = this.props;
    const calendar = [];

    for (let year = startDate.year(); year <= endDate.year(); year++) {
      calendar.push({
        year: year,
        months: buildCalendar(year),
      });
    }
    const displayedMonths = [];
    for (let iterations = 0; iterations < numberOfCalendars; iterations++) {
      displayedMonths.push({
        year: startDate.year(),
        month: startDate.month(),
      });
    }

    this.setState({ calendar: calendar,
      displayedMonths: displayedMonths });
  }
  /**
   * sets the startDate of a selection and changes the selectionHandler to the selectionEndHandler
   * @param {moment} date which should be selected startDate
   */
  selectionStartHandler(date) {
    const newState = {
      selectionStart: date,
      selectionEnd: undefined,
      selectionHandler: this.selectionEndHandler,
    };

    if (this.state.selectionEnd === date) {
      newState.temporaryStart = date;
    }

    this.setState(newState);
  }

  /**
   * sets the endDate of a selection and changes the selectionHandler to the selectionStartHandler
   * @param {moment} date which should be selected as endDate
   */
  selectionEndHandler(date) {
    const { selectionStart } = this.state;

    const newState = {
      selectionHandler: this.selectionStartHandler,
      temporaryEnd: date,
      temporaryStart: date,
    };

    if (date.isBefore(selectionStart)) {
      newState.selectionStart = date;
      newState.selectionEnd = selectionStart;
    } else {
      newState.selectionEnd = date;
    }

    this.setState(newState);
  }

  /**
   * sets the temporary selection, selected through hovering over the calendar or setting a start point and hovering over an endDate
   * @param date which is currently hovered
   */
  hoverHandler(date) {
    const { selectionStart } = this.state;

    if (this.state.selectionHandler === this.selectionStartHandler) {
      this.setState({ temporaryStart: date, temporaryEnd: date });
    } else if (date.isBefore(selectionStart)) {
      this.setState({ temporaryStart: date, temporaryEnd: selectionStart });
    } else {
      this.setState({ temporaryStart: selectionStart, temporaryEnd: date });
    }
  }

  render() {
    const {
      calendar,
      displayError,
      displayedMonths,
      selectionStart,
      selectionEnd,
      selectionHandler,
      temporaryEnd,
      temporaryStart,
    } = this.state;

    return <div>
      {displayError && <p>The date you tried to select is not available.</p>}

      {calendar.length > 0
        ? displayedMonths.map((selectedMonth, index) =>
          <CalendarWithNavigation
            hoverHandler={this.hoverHandler.bind(this)}
            index={index}
            key={index}
            month={calendar
              .filter(x => x.year === selectedMonth.year)[0].months
              .filter(y => y.month === selectedMonth.month)[0]}
            monthSelection={selectedMonth}
            monthSelectionHandler={this.modifyCalendarMonth.bind(this)}
            selectionHandler={selectionHandler.bind(this)}
            selectionStart={selectionStart}
            selectionEnd={selectionEnd}
            temporaryStart={temporaryStart}
            temporaryEnd={temporaryEnd}/>)
        : 'no cal'}
    </div>;
  }
}
