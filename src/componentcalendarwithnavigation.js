import React, { Component } from 'react';
import propTypes from 'prop-types';
import moment from 'moment-mini';
import Calendar from './componentcalendar';

import './componentcalendarwithnavigation.css';

export default class CalendarWithNavigation extends Component {
  static propTypes = {
    allowModification: propTypes.func,
    endDate: propTypes.object, // moment
    format: propTypes.string.isRequired,
    hoverHandler: propTypes.func,
    index: propTypes.number,
    month: propTypes.shape({
      month: propTypes.number.isRequired,
      weeks: propTypes.array.isRequired,
    }).isRequired,
    monthSelection: propTypes.shape({
      month: propTypes.number.isRequired,
      year: propTypes.number.isRequired,
    }).isRequired,
    monthSelectionHandler: propTypes.func,
    selectionHandler: propTypes.func,
    selectionStart: propTypes.object, // moment
    selectionEnd: propTypes.object, // moment
    startDate: propTypes.object, // moment
    temporaryStart: propTypes.object, // mom]ent
    temporaryEnd: propTypes.object, // moment
  };

  // wrappers around the handlers passed in as prop to keep the this context, while still being able to bind the data to them later on
  /**
   * calls the passed in handler if it is defined
   * @param {{
   *   year: number,
   *   month: number
   * }} modification which should be applied
   */
  modifyCalendarMonth(modification) {
    const { index, monthSelectionHandler } = this.props;
    if (monthSelectionHandler !== undefined) {
      monthSelectionHandler(modification, index);
    }
  }

  /**
   * calls the passed in handler if it is defined to check if the navigations should be rendered
   * @param {{
   *   year: number,
   *   month: number
   * }} modification which should be applied
   * @returns {boolean} states if the month should be blocked
   */
  blockMonth(modification) {
    const { allowModification, index } = this.props;
    if (allowModification !== undefined) {
      return !allowModification(index, modification);
    }
    return false;
  }

  render() {
    const button = 'button';
    const { monthSelection } = this.props;
    const modifications = [[
      { month: 0, year: -1, text: '<<' },
      { month: undefined, year: undefined, text: monthSelection.year, format: 'YYYY' },
      { month: 0, year: 1, text: '>>' },
    ], [
      { month: -1, year: 0, text: '<' },
      { month: undefined, year: undefined, text: monthSelection.month + 1, format: 'MMM' },
      { month: 1, year: 0, text: '>' },
    ]];

    return <div className="calendar-container">
      <div className="month-selection">

        {modifications.map((x, index) =>
          <div className="modification-row"
            key={index}>
            {x.map(modification =>
              (modification.year === undefined
                ? <p key={modification.text}>
                  {moment.utc('1990-02-01 00+00:00')
                    .month(monthSelection.month)
                    .year(monthSelection.year)
                    .format(modification.format)}
                </p>
                : this.blockMonth(modification)
                  ? <a className={`${button} blocked`}
                    key={modification.text}>{modification.text}</a>
                  : <a className={button}
                    key={modification.text}
                    onClick={this.modifyCalendarMonth.bind(this, modification)}>{modification.text}</a>))}
          </div>)}
      </div>
      <Calendar {... this.props}/>
    </div>;
  }
}
