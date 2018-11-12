import React, { Component } from 'react';
import moment from 'moment';
import propTypes from 'prop-types';
import CalendarWithNavigation from './componentcalendarwithnavigation';
import './componentdatepicker.css';

const INITDATE = '1990-02-01 00+00:00';

/**
 * generates an array of size 7, representing a single week
 * @param {number} year - for which the week should be generated
 * @param {number} month - for which the week should be generated
 * @param {number} week - the concrete week which should be generated
 * @returns {moment.Moment[]} array of size 7, representing a week
 */
export function generateDays(year, month, week) {
  return Array(7).fill(0).map((n, i) => moment(INITDATE)
    .year(year)
    .month(month)
    .week(week)
    .utc()
    .startOf('week')
    .clone()
    .add(n + (i + 1), 'day'));
}

/**
 * builds a calendar for the specified year
 * @param {number} year for which the calendar should be generated
 * @returns {Array} containing all months of a year
 */
export function buildCalendarYear(year) {
  const months = [];
  for (let month = 0; month <= 11; month++) {
    const nextMonth = {
      month: month,
      weeks: {},
    };

    // subtract is needed for the shift from sunday to monday as first day of the week
    let startWeek = moment(INITDATE).year(year).month(month)
      .startOf('month')
      .startOf('week')
      .week();
    let endWeek = moment().year(year).month(month).utc()
      .endOf('month')
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

/**
 * generates a whole calendar, with every year and month between start and end Date
 * @param startDate of the generated calendar
 * @param endDate of the generated calendar
 * @returns {Array} of year-objects
 */
export function generateCalendar(startDate, endDate) {
  const calendar = [];

  for (let year = startDate.year(); year <= endDate.year(); year++) {
    calendar.push({
      year: year,
      months: buildCalendarYear(year),
    });
  }
  return calendar;
}

export default class DatePicker extends Component {
  static propTypes = {
    endDate: propTypes.object, // moment
    format: propTypes.string,
    numberOfCalendars: propTypes.number,
    selectionStart: propTypes.object, // moment
    selectionEnd: propTypes.object, // moment
    startDate: propTypes.object, // moment
  };

  static defaultProps = {
    endDate: moment('2000-06-18 00+00:00'),
    format: 'dd',
    numberOfCalendars: 2,
    selectionStart: undefined,
    selectionEnd: undefined,
    startDate: moment('1990-01-18 00+00:00'),
  };

  constructor(props) {
    super(props);
    this.state = {
      calendar: [],
      displayError: false,
      displayedMonths: [],
      selectionStart: props.selectionStart,
      selectionEnd: props.selectionEnd,
      selectionHandler: this.selectionStartHandler,
      temporaryEnd: undefined,
      temporaryStart: undefined,
    };
  }

  /**
   * modifies the currently displayed month
   * @param {{
   *   year: number,
   *   month: number,
   * }} modification change which should be applied to the currently displayed month
   * @param {number} index meaning json key to which the calendar is identified in state
   */
  modifyCalendarMonth(modification, index) {
    const { displayedMonths } = this.state;
    const { startDate, endDate } = this.props;
    const oldDisplayedMonth = displayedMonths[index];
    let newMonth = oldDisplayedMonth.month + modification.month;
    let newYear = oldDisplayedMonth.year + modification.year;

    const compareTo = displayedMonths[index + modification.year];
    const momentNew = moment(INITDATE).year(newYear).month(newMonth);

    if (compareTo !== undefined) {
      const momentCompareTo = moment(INITDATE).year(compareTo.year).month(compareTo.month);
      if (modification.year === 1) {
        if (momentCompareTo.isSameOrBefore(momentNew)) {
          newYear = compareTo.year;
          newMonth = compareTo.month - 1;
        }
      }
      if (modification.year === -1) {
        if (momentCompareTo.isSameOrAfter(momentNew)) {
          newYear = compareTo.year;
          newMonth = compareTo.month + 1;
        }
      }
    } else {
      if (momentNew.isBefore(startDate, 'month')) {
        newMonth = startDate.month();
        newYear = startDate.year();
      }

      if (momentNew.isAfter(endDate, 'month')) {
        newMonth = endDate.month();
        newYear = endDate.year();
      }
    }


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


    // clone the array, before inserting
    const newDisplayedMonths = displayedMonths.slice(0);
    newDisplayedMonths[index] = newDisplayedMonth;
    this.setState({
      displayedMonths: newDisplayedMonths,
    });
  }

  /**
   * calculates the distance of a month with applied modification to its predecessor in displayedMonths array
   * @param index of the month, which should be checked, in the displayedMonths array
   * @param {{
   *   year: number,
   *   month: number,
   * }} modification which should be applied
   * @returns {number} of months between the month with applied modification and its predecessor
   */
  calcDistanceToPredecessor(index, modification) {
    const { displayedMonths } = this.state;
    const currentMonth = displayedMonths[index];
    const predecessor = displayedMonths[index - 1];

    return moment(INITDATE).year(currentMonth.year + modification.year)
      .month(currentMonth.month + modification.month)
      .utc()
      .diff(moment(INITDATE)
        .year(predecessor.year)
        .month(predecessor.month), 'months', true);
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

    return moment(INITDATE).year(successor.year)
      .month(successor.month)
      .utc()
      .diff(moment(INITDATE)
        .year(currentMonth.year + modification.year)
        .month(currentMonth.month + modification.month), 'months', true);
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
  // TODO: REWORK THE MESS
  isModificationAllowed(index, modification) {
    const { displayedMonths } = this.state;
    const { endDate, startDate } = this.props;
    const displayedMonth = displayedMonths[index];

    const momentDisplayed = moment(INITDATE).year(displayedMonth.year).month(displayedMonth.month);

    if ((momentDisplayed.isSame(startDate, 'month') && (modification.year < 0 || modification.month < 0))
      || (momentDisplayed.isSame(endDate, 'month') && (modification.year > 0 || modification.month > 0))) {
      return false;
    }


    //  -11 is due to the months in a year, if its more than a year difference
    if (index === 0) {
      // first element has no predecessor only check distance to successor
      if (modification.year > 0) {
        return this.calcDistanceToSuccessor(index, modification) > -11;
      }
      return this.calcDistanceToSuccessor(index, modification) > 0;
    } else if (index >= displayedMonths.length - 1) {
      // last element has no successor only check distance to predecessor
      if (modification.year >= 0) {
        return this.calcDistanceToPredecessor(index, modification) > 0;
      }
      return this.calcDistanceToPredecessor(index, modification) > -11;
    }
    // for every other element check both distances
    if (modification.year > 0) {
      return this.calcDistanceToPredecessor(index, modification) > 0
      && this.calcDistanceToSuccessor(index, modification) > -11;
    } else if (modification.year === 0) {
      return this.calcDistanceToPredecessor(index, modification) > 0
        && this.calcDistanceToSuccessor(index, modification) > 0;
    }
    return this.calcDistanceToPredecessor(index, modification) > -11
        && this.calcDistanceToSuccessor(index, modification) > 0;
  }

  /**
   * generate the calendar associated with the specified range
   */
  componentDidMount() {
    const { startDate, numberOfCalendars, endDate } = this.props;
    const calendar = generateCalendar(startDate, endDate);
    const displayedMonths = [];
    for (let iterations = 0; iterations < numberOfCalendars; iterations++) {
      displayedMonths.push({
        year: startDate.year() + iterations,
        month: startDate.month(),
      });
    }

    this.setState({
      calendar: calendar,
      displayedMonths: displayedMonths,
    });
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

    this.setState(
      this.state.selectionEnd === date
        ? Object.assign(newState, { temporaryStart: date })
        : newState,
    );
  }

  /**
   * sets the endDate of a selection and changes the selectionHandler to the selectionStartHandler
   * @param {moment} date which should be selected as endDate
   */
  selectionEndHandler(date) {
    const { selectionStart } = this.state;

    const newState = {
      selectionHandler: this.selectionStartHandler,
      temporaryEnd: undefined,
      temporaryStart: undefined,
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
      displayedMonths,
      selectionStart,
      selectionEnd,
      selectionHandler,
      temporaryEnd,
      temporaryStart,
    } = this.state;


    const { startDate, endDate, format } = this.props;

    return <div className="date-picker">
      {calendar.length > 0
        ? displayedMonths.map((selectedMonth, index) =>
          <CalendarWithNavigation
            allowModification={this.isModificationAllowed.bind(this)}
            endDate={endDate}
            format={format}
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
            startDate={startDate}
            temporaryStart={temporaryStart}
            temporaryEnd={temporaryEnd}/>)
        : 'no cal'}
    </div>;
  }
}
