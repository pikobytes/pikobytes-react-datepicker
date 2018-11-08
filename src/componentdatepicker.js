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
   * }} modification change which should be applied to the currently displayed month
   * @param {number} index meaning json key to which the calendar is identified in state
   */
  modifyCalendarMonth(modification, index) {
    const { displayedMonths } = this.state;

    const oldDisplayedMonth = displayedMonths[index];
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
      // clone the array, before inserting
      const newDisplayedMonths = displayedMonths.slice(0);
      newDisplayedMonths[index] = newDisplayedMonth;

      const newState = {
        displayedMonths: newDisplayedMonths,
        displayError: false,
      };

      this.setState(newState);
    } else {
      this.setState({ displayError: true });
    }
  }

  /**
   * calculates the distance of a month with applied modification to its predecessor in displayedMonths array
   * @param index of the month, which should be checked, in the displayedMonths array
   * @param {{
   *   year: number,
   *   month: number
   * }} modification which should be applied
   * @returns {number} of months between the month with applied modification and its predecessor
   */
  calcDistanceToPredecessor(index, modification) {
    const { displayedMonths } = this.state;
    const currentMonth = displayedMonths[index];
    const predecessor = displayedMonths[index - 1];

    return moment().year(currentMonth.year + modification.year)
      .month(currentMonth.month + modification.month)
      .diff(moment()
        .year(predecessor.year)
        .month(predecessor.month), 'months');
  }

  /**
   *  calculates the distance of a month with applied modification to its successor in displayedMonths array
   * @param index of the month, which should be checked, in the displayedMonths array
   * @param {{
   *   year: number,
   *   month: number
   * }} modification which should be applied
   * @returns {number} of months between the month with applied modification and its successor
   */
  calcDistanceToSuccessor(index, modification) {
    const { displayedMonths } = this.state;
    const currentMonth = displayedMonths[index];
    const successor = displayedMonths[index + 1];

    return moment().year(successor.year)
      .month(successor.month)
      .diff(moment()
        .year(currentMonth.year + modification.year)
        .month(currentMonth.month + modification.month), 'months');
  }

  /**
   * checks if the modification for a certain month should be blocked
   * @param index of the month, which should be checked, in the displayedMonths array
   * @param {{
   *   year: number,
   *   month: number
   * }} modification which should be applied
   * @returns {boolean} whether the modification is allowed or not
   */
  isModificationAllowed(index, modification) {
    const { displayedMonths } = this.state;

    if (index === 0) {
      // first element has no predecessor, so only check distance to successor
      return this.calcDistanceToSuccessor(index, modification) > 0;
    } else if (index >= displayedMonths.length - 1) {
      // last element has no successor, so only check distance to predecessor
      return this.calcDistanceToPredecessor(index, modification) > 0;
    }
    // for every other element check both distances
    return this.calcDistanceToPredecessor(index, modification) > 0
      && this.calcDistanceToSuccessor(index, modification) > 0;
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
        year: startDate.year() + iterations,
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
            blockMonth={this.isModificationAllowed.bind(this)}
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
