import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Calendar from './componentcalendar';

import './componentcalendarwithnavigation.css';

export default class CalendarWithNavigation extends Component {
  static propTypes = {
    allowModification: PropTypes.func,
    endDate: PropTypes.object, // moment
    format: PropTypes.string.isRequired,
    hoverHandler: PropTypes.func,
    index: PropTypes.number,
    month: PropTypes.shape({
      month: PropTypes.number.isRequired,
      weeks: PropTypes.array.isRequired,
    }).isRequired,
    monthSelection: PropTypes.shape({
      month: PropTypes.number.isRequired,
      year: PropTypes.number.isRequired,
    }).isRequired,
    monthSelectionHandler: PropTypes.func,
    selectionHandler: PropTypes.func,
    selectionStart: PropTypes.object, // moment
    selectionEnd: PropTypes.object, // moment
    startDate: PropTypes.object, // moment
    temporaryStart: PropTypes.object, // mom]ent
    temporaryEnd: PropTypes.object, // moment
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
                  {moment('1990-02-01 00+00:00')
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
