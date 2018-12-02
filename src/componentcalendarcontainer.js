import React, { Component } from 'react';
import moment from 'moment';
import propTypes from 'prop-types';
import CalendarWithNavigation from './componentcalendarwithnavigation';
import MonthProvider from './componentmonthprovider';
import './componentcalendarcontainer.css';


const CalendarWithMonth = MonthProvider(CalendarWithNavigation);

/**
 * mathematically correct modulo
 * @param { number } n dividend
 * @param { number } m divisor
 * @returns {number} remainder
 */
function mod(n, m) {
  return ((n % m) + m) % m;
}

/**
 *  calculates the distance of a month to another month
 * @param {{
 *   year: number,
 *   month: number
 * }} firstMonth identified by year and month
 * @param {{
 *   year: number,
 *   month: number
 * }} secondMonth identified by year and month
 * @returns {number} of months between the month with applied modification and its successor, 1 if adjacent months, 0 if same months
 */
export function calcDistance(firstMonth, secondMonth) {
  return Math.abs(moment.utc().year(firstMonth.year)
    .month(firstMonth.month)
    .utc()
    .diff(moment.utc()
      .year(secondMonth.year)
      .month(secondMonth.month), 'months', true));
}

/**
 * calculates which Months will be displayed, from a given time extent and the number of calendars
 * @param { number } numberOfCalendars
 * @param {[moment, moment] }timeExtent
 * @returns {Array}
 */
function calcDisplayedMonths(numberOfCalendars, timeExtent) {
  const [start, end] = timeExtent;
  const distance = calcDistance(
    { month: start.month(), year: start.year() },
    { month: end.month(), year: end.year() });
  const displayedMonths = [];

  if (numberOfCalendars === 1) {
    return [{ year: end.year(), month: end.month() }];
  }
  const distancePerCalendar = Math.round(distance / (numberOfCalendars - 1));

  for (let i = 0; i < numberOfCalendars; i++) {
    let month;
    if (distance <= numberOfCalendars) {
      month = end.month() - (numberOfCalendars - (i + 1));
    } else {
      month = (distancePerCalendar * i);
    }


    const carry = Math.floor(month / 12);
    month = mod(month, 12);

    displayedMonths.push({
      month: month,
      year: start.year() + carry,
    });
  }

  return displayedMonths;
}

export default class CalendarContainer extends Component {
  static propTypes = {
    endDate: propTypes.object, // moment
    format: propTypes.string,
    focus: propTypes.bool,
    numberOfCalendars: propTypes.number,
    reportFocus: propTypes.func,
    selectionStart: propTypes.object, // moment
    selectionEnd: propTypes.object, // moment
    startDate: propTypes.object, // moment
    temporaryStart: propTypes.object, // mom]ent
    temporaryEnd: propTypes.object, // moment
  };

  static defaultProps = {
    endDate: moment.utc('2000-06-18 00+00:00'),
    format: 'dd',
    numberOfCalendars: 2,
    startDate: moment.utc('1990-01-18 00+00:00'),
  };

  constructor(props) {
    super(props);
    this.state = {
      displayedMonths: this.determineFocus(),
    };
  }

  /**
   * determines which months will be displayed
   * @returns {[{
   * year: number,
   * month:number,
   * }]}
   */
  determineFocus() {
    const { numberOfCalendars, selectionStart, selectionEnd, startDate, endDate } = this.props;
    const displayedMonths = [];

    if (numberOfCalendars === 1 && (selectionStart !== undefined)) {
      displayedMonths.push({
        month: selectionStart.month(),
        year: selectionEnd.year(),
      });
      return displayedMonths;
    }

    if ((numberOfCalendars === 2) && (selectionStart !== undefined && selectionEnd !== undefined)) {
      const startMonth = selectionStart.month();
      const endMonth = selectionEnd.month();
      const startYear = selectionStart.year();
      const endYear = selectionEnd.year();
      const carry = Math.floor((endMonth - 1) / 12);
      displayedMonths.push({ year: (startYear === endYear)
        ? startYear + carry
        : startYear,
      month: (startMonth === endMonth) && (startYear === endYear)
        ? mod(endMonth - 1, 12)
        : startMonth });
      displayedMonths.push({ year: endYear,
        month: endMonth });
    } else {
      return calcDisplayedMonths(numberOfCalendars, [startDate, endDate]);
    }

    return displayedMonths;
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
    const momentNew = moment.utc().year(newYear).month(newMonth);

    if (compareTo !== undefined) {
      const momentCompareTo = moment.utc().year(compareTo.year).month(compareTo.month);
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
    const { endDate, startDate } = this.props;
    const displayedMonth = displayedMonths[index];

    const momentDisplayed = moment.utc()
      .year(displayedMonth.year)
      .month(displayedMonth.month);

    // for modifications forwards in time check the successor or the endDate of the range, when there is no successor
    if (modification.year > 0 || modification.month > 0) {
      if (index >= displayedMonths.length - 1) {
        return endDate.isAfter(momentDisplayed, 'month');
      }
      return calcDistance(displayedMonth, displayedMonths[index + 1]) > 1;
    }

    // for modifications backwards in time check the predecessor or the startDate of the range, when there is no predecessor
    if (index === 0) {
      return startDate.isBefore(momentDisplayed, 'month');
    }
    return calcDistance(displayedMonth, displayedMonths[index - 1]) > 1;
  }


  componentDidUpdate(prevProps) {
    const { focus, reportFocus } = this.props;

    if (focus) {
      this.setState({ displayedMonths: this.determineFocus() });
      reportFocus();
    }
  }

  render() {
    const {
      displayedMonths,
    } = this.state;

    const {
      endDate,
      format,
      hoverHandler,
      selectionStart,
      selectionEnd,
      selectionHandler,
      temporaryEnd,
      temporaryStart,
      startDate,
    } = this.props;

    return <div className="date-picker">
      {
        displayedMonths.map((selectedMonth, index) => <CalendarWithMonth
          allowModification={this.isModificationAllowed.bind(this)}
          endDate={endDate}
          format={format}
          hoverHandler={hoverHandler}
          index={index}
          key={index}
          monthSelection={selectedMonth}
          monthSelectionHandler={this.modifyCalendarMonth.bind(this)}
          selectionHandler={selectionHandler}
          selectionStart={selectionStart}
          selectionEnd={selectionEnd}
          startDate={startDate}
          temporaryStart={temporaryStart}
          temporaryEnd={temporaryEnd} />)
      }
    </div>;
  }
}
