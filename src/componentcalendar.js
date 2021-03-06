import React, { Component } from 'react';
import propTypes from 'prop-types';

export default class Calendar extends Component {
  static propTypes = {
    endDate: propTypes.object, // moment
    format: propTypes.string,
    hoverHandler: propTypes.func,
    month: propTypes.shape({
      month: propTypes.number.isRequired,
      weeks: propTypes.array.isRequired,
    }).isRequired,
    selectionHandler: propTypes.func,
    selectionStart: propTypes.object, // moment
    selectionEnd: propTypes.object, // moment
    startDate: propTypes.object, // moment
    temporaryStart: propTypes.object, // moment
    temporaryEnd: propTypes.object, // moment
  };

  // wrappers around the handlers passed in as props to keep the this contexts, while still being able to bind the dates to them later on
  /**
   * if passed in, calls selectionHandler prop
   * @param {moment} date which should be selected
   */
  selectionHandler(date) {
    const { selectionHandler } = this.props;
    if (selectionHandler !== undefined) {
      selectionHandler(date);
    }
  }

  /**
   * if passed in, calls hoverHandler prop
   * @param {moment} date which should be selected
   */
  hoverHandler(date) {
    const { hoverHandler } = this.props;
    if (hoverHandler !== undefined) {
      hoverHandler(date);
    }
  }

  /**
   * determines whether a single date is selected
   * @param {moment} date which should be checked for selection
   * @param {moment} end date of the selection
   * @param {moment} start date of the selection
   * @returns {boolean} states if the date is in the range and therefor selected
   */
  static determineSelection(date, end, start) {
    if (date.isSame(start)) {
      return true;
    }

    if (end === undefined) {
      return false;
    }

    return date.isSame(end) || date.isBetween(start, end);
  }

  /**
   * renders a day with handlers
   * @param {moment} day which should be rendered
   * @returns {*}
   */
  renderDayWithHandlers(day) {
    const { selectionEnd, selectionStart, temporaryEnd, temporaryStart } = this.props;
    // if no selection is in progress, do not render an onMouseOver handler, because it is not needed
    return selectionStart === undefined || selectionEnd !== undefined
      ? <td key={`${day.year()}.${day.month()}.${day.date()}`}
        className={`day ${Calendar.determineSelection(day, selectionEnd, selectionStart)
          ? 'is-selected'
          : ''
        } ${Calendar.determineSelection(day, temporaryEnd, temporaryStart)
          ? 'will-be-selected'
          : ''} ${(day.isSame(selectionEnd, 'day') || day.isSame(selectionStart, 'day'))
          ? 'is-selected-border'
          : ''}`}
        onClick={this.selectionHandler.bind(this, day)}>
        {day.format('D')}
      </td>
      : <td key={`${day.year()}.${day.month()}.${day.date()}`}
        className={`day ${Calendar.determineSelection(day, temporaryEnd, temporaryStart)
          ? 'will-be-selected'
          : ''} ${((temporaryEnd !== undefined && day.isSame(temporaryEnd, 'day'))
          || day.isSame(temporaryStart, 'day'))
          || day.isSame(selectionStart, 'day')
          ? 'is-selected-border'
          : ''}`}
        onClick={this.selectionHandler.bind(this, day)}
        onMouseOver={(day.isSame(temporaryStart, 'day') || day.isSame(temporaryEnd, 'day'))
          ? undefined
          : this.hoverHandler.bind(this, day) }>
        {day.format('D')}
      </td>;
  }

  /**
   * renders a single day (moment)
   * @param {moment} day to be rendered
   * */
  renderDay(day) {
    const { endDate, month, startDate } = this.props;
    // check whether the day actually belongs to this month
    return (day.isSameOrAfter(startDate) && day.isSameOrBefore(endDate)) && day.month() === month.month
      ? this.renderDayWithHandlers(day)
      : <td key={`${day.year()}.${day.month()}.${day.date()}`}
        className="inactive">
        {day.format('D')}
      </td>;
  }


  render() {
    const { format, month } = this.props;

    return <table className='table'>
      <thead>
        <tr>
          {month.weeks[0].days.map(day =>
            <th key={day.format(format)}>{day.format(format)}</th>)}
        </tr>
      </thead>
      <tbody>
        { /* Iterate over the weeks of a monthObject. Generate for each week a row. Then iterate over the days of a week and generate a
        cell for every day. */}
        {month.weeks.map(week =>
          <tr key={week.week}>{week.days.map(this.renderDay.bind(this))}</tr>)}
      </tbody>
    </table>;
  }
}
