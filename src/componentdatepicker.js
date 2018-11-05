import React from 'react';
import moment from 'moment';
import propTypes from 'prop-types';
import Calendar from './componentcalendar';
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
      weeks.push({ week: 53, days: generateDays(year, 0, 53) });
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
    startDate: propTypes.object, // moment Object
  };

  state = {
    calendar: [],
    displayError: false,
    firstCalendar: {
      month: 0,
      year: 1990,
    },
    selectionStart: undefined,
    selectionEnd: undefined,
    selectionHandler: this.selectionStartHandler,
    temporaryEnd: undefined,
    temporaryStart: undefined,
  };

  /**
   * checks whether the month is valid, means if it is in the defined range (startDate - endDate)
   * @param {number} month which should be checked
   * @param {number} year which should be checked
   * @returns {boolean} states whether the month is valid
   */
  isValidDate(month, year) {
    const { startDate, endDate } = this.props;
    const compareTo = moment().year(year).month(month).startOf('month');
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
  modifyCalendarMonth(calendar, modification, identifier) {
    const newState = { displayError: false };
    let newMonth = calendar.month + modification.month;
    let newYear = calendar.year + modification.year;

    if (newMonth < 0) {
      newMonth = 11;
      --newYear;
    }

    if (newMonth > 11) {
      newMonth = 0;
      ++newYear;
    }

    // just update the state if the month is defined, else display an error
    if (this.isValidDate(newMonth, newYear)) {
      newState[identifier] = {
        month: newMonth,
        year: newYear,
      };

      this.setState(newState);
    } else {
      this.setState({ displayError: true });
    }
  }

  /**
   * generate the calendar associated with the specified range
   */
  componentDidMount() {
    const { startDate, endDate } = this.props;
    const calendar = [];

    for (let year = startDate.year(); year <= endDate.year(); year++) {
      calendar.push({
        year: year,
        months: buildCalendar(year),
      });
    }

    this.setState({ calendar: calendar });
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
      firstCalendar,
      selectionStart,
      selectionEnd,
      selectionHandler,
      temporaryEnd,
      temporaryStart,
    } = this.state;

    const button = 'button';

    return <div>
      {displayError && <p>The date you tried to select is not available.</p>}
      <a className={button}
        onClick={this.modifyCalendarMonth.bind(this, firstCalendar, { month: 0, year: 1 }, 'firstCalendar')}> inc year</a>
      <p>{firstCalendar.year}</p>
      <a className={button}
        onClick={this.modifyCalendarMonth.bind(this, firstCalendar, { month: 0, year: -1 }, 'firstCalendar')}> dec year</a>
      <br/>
      <a className={button}
        onClick={this.modifyCalendarMonth.bind(this, firstCalendar, { month: 1, year: 0 }, 'firstCalendar')}> inc month</a>
      <p>{firstCalendar.month + 1}</p>
      <a className={button}
        onClick={this.modifyCalendarMonth.bind(this, firstCalendar, { month: -1, year: 0 }, 'firstCalendar')}> dec month</a>

      {calendar.length > 0
        ? <React.Fragment>
          <Calendar month={calendar
            .filter(x => x.year === firstCalendar.year)[0].months
            .filter(y => y.month === firstCalendar.month)[0]}
          selectionHandler={selectionHandler.bind(this)}
          hoverHandler={this.hoverHandler.bind(this)}
          selectionStart={selectionStart}
          selectionEnd={selectionEnd}
          temporaryStart={temporaryStart}
          temporaryEnd={temporaryEnd}/>

          <Calendar month={calendar
            .filter(x => x.year === firstCalendar.year)[0].months
            .filter(y => y.month === firstCalendar.month)[0]}
          selectionHandler={selectionHandler.bind(this)}
          hoverHandler={this.hoverHandler.bind(this)}
          selectionStart={selectionStart}
          selectionEnd={selectionEnd}
          temporaryStart={temporaryStart}
          temporaryEnd={temporaryEnd}/>
        </React.Fragment>
        : 'no cal'}
    </div>;
  }
}
