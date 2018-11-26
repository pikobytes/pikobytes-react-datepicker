import React, { Component } from 'react';
import moment from 'moment';
import propTypes from 'prop-types';
import CalendarWithNavigation from './componentcalendarwithnavigation';
import MonthProvider from './componentmonthprovider';
import './componentdatepicker.css';

const INITDATE = '1990-02-01 00+00:00';

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
  return Math.abs(moment.utc(INITDATE).year(firstMonth.year)
    .month(firstMonth.month)
    .utc()
    .diff(moment.utc(INITDATE)
      .year(secondMonth.year)
      .month(secondMonth.month), 'months', true));
}

function calcDisplayedMonths(numberOfCalendars, timeExtent) {
  const [start, end] = timeExtent;
  const distance = calcDistance(
    { month: start.month(), year: start.year() },
    { month: end.month(), year: end.year() });
  const displayedMonths = [];

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

export default class DatePicker extends Component {
  static propTypes = {
    endDate: propTypes.object, // moment
    format: propTypes.string,
    numberOfCalendars: propTypes.number,
    reportChanges: propTypes.func.isRequired,
    selectionStart: propTypes.object, // moment
    selectionEnd: propTypes.object, // moment
    startDate: propTypes.object, // moment
  };

  static defaultProps = {
    endDate: moment.utc('2000-06-18 00+00:00'),
    format: 'dd',
    numberOfCalendars: 2,
    selectionStart: undefined,
    selectionEnd: undefined,
    startDate: moment.utc('1990-01-18 00+00:00'),
  };

  constructor(props) {
    super(props);
    this.state = {
      drawFromState: (props.selectionStart === undefined &&
      props.selectionEnd === undefined),
      displayedMonths: this.determineFocus(),
      selectionStart: props.selectionStart,
      selectionEnd: props.selectionEnd,
      selectionHandler: this.selectionStartHandler,
      temporaryEnd: undefined,
      temporaryStart: undefined,
    };
  }

  determineFocus() {
    const { numberOfCalendars, selectionStart, selectionEnd, startDate, endDate } = this.props;
    const displayedMonths = [];
    if ((numberOfCalendars === 2) && (selectionStart !== undefined && selectionEnd !== undefined)) {
      const startMonth = selectionStart.month();
      const endMonth = selectionEnd.month();
      const startYear = selectionStart.year();
      const endYear = selectionEnd.year();


      displayedMonths.push({ year: startYear,
        month: (startMonth === endMonth) && (startYear === endYear)
          ? endMonth - 1
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
    const momentNew = moment.utc(INITDATE).year(newYear).month(newMonth);

    if (compareTo !== undefined) {
      const momentCompareTo = moment.utc(INITDATE).year(compareTo.year).month(compareTo.month);
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

    const momentDisplayed = moment.utc(INITDATE)
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
    const { selectionStart, selectionEnd } = this.props;
    // check whether a new selection is passed in as prop, if that is the case do not draw the selection stored in state
    // and reset the state
    if (selectionStart === undefined &&
      selectionEnd === undefined &&
      prevProps.selectionStart === undefined &&
      prevProps.selectionEnd === undefined) {
      return;
    }

    if ((prevProps.selectionStart === undefined && selectionStart !== undefined)
      || (prevProps.selectionEnd === undefined && selectionEnd !== undefined)
      || (!prevProps.selectionStart.isSame(selectionStart) && !prevProps.selectionEnd.isSame(selectionEnd))) {
      this.setState({
        displayedMonths: this.determineFocus(),
        drawFromState: false,
        selectionHandler: this.selectionStartHandler,
        selectionStart: undefined,
        selectionEnd: undefined });
    }
  }

  /**
   * sets the startDate of a selection and changes the selectionHandler to the selectionEndHandler
   * @param {moment} date which should be selected startDate
   */
  selectionStartHandler(date) {
    const newState = {
      drawFromState: true,
      selectionStart: date,
      selectionEnd: undefined,
      selectionHandler: this.selectionEndHandler,
    };

    const { reportChanges } = this.props;

    this.setState(
      this.state.selectionEnd === date
        ? Object.assign(newState, { temporaryStart: date })
        : newState,
    );

    reportChanges([newState.selectionStart, undefined]);
  }

  /**
   * sets the endDate of a selection and changes the selectionHandler to the selectionStartHandler
   * @param {moment} date which should be selected as endDate
   */
  selectionEndHandler(date) {
    const { selectionStart } = this.state;

    const { reportChanges } = this.props;

    const newState = {
      hasUnreportedChanges: true,
      selectionHandler: this.selectionStartHandler,
      temporaryEnd: undefined,
      temporaryStart: undefined,
    };

    if (date.isBefore(selectionStart)) {
      newState.selectionStart = date;
      newState.selectionEnd = selectionStart;
    } else {
      newState.selectionStart = selectionStart;
      newState.selectionEnd = date;
    }

    this.setState(newState);
    reportChanges([newState.selectionStart, newState.selectionEnd]);
  }

  /**
   * sets the temporary selection, selected through hovering over the calendar or setting a start point and hovering over an endDate
   * @param date which is currently hovered
   */
  hoverHandler(date) {
    const { selectionStart } = this.state;

    if (date.isBefore(selectionStart)) {
      this.setState({ temporaryStart: date, temporaryEnd: selectionStart });
    } else {
      this.setState({ temporaryStart: selectionStart, temporaryEnd: date });
    }
  }

  render() {
    const {
      drawFromState,
      displayedMonths,
      selectionStart,
      selectionEnd,
      selectionHandler,
      temporaryEnd,
      temporaryStart,
    } = this.state;


    const { startDate, endDate, format } = this.props;
    return <div className="date-picker">
      {
        displayedMonths.map((selectedMonth, index) => {
          const CalendarWithMonth = MonthProvider(CalendarWithNavigation);
          return <CalendarWithMonth
            allowModification={this.isModificationAllowed.bind(this)}
            endDate={endDate}
            format={format}
            hoverHandler={this.hoverHandler.bind(this)}
            index={index}
            key={index}
            monthSelection={selectedMonth}
            monthSelectionHandler={this.modifyCalendarMonth.bind(this)}
            selectionHandler={selectionHandler.bind(this)}
            selectionStart={drawFromState ? selectionStart : this.props.selectionStart}
            selectionEnd={drawFromState ? selectionEnd : this.props.selectionEnd}
            startDate={startDate}
            temporaryStart={temporaryStart}
            temporaryEnd={temporaryEnd} />;
        })
      }
    </div>;
  }
}
