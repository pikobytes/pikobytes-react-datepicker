import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Calendar from './componentcalendar';

import './componentcalendarwithnavigation.css';

export default class CalendarWithNavigation extends Component {
  static propTypes = {
    allowModification: PropTypes.func,
    hoverHandler: PropTypes.func,
    endDate: PropTypes.object, // moment
    index: PropTypes.number,
    month: PropTypes.shape({
      month: PropTypes.number,
      weeks: PropTypes.array,
    }),
    monthSelection: PropTypes.shape({
      month: PropTypes.number,
      year: PropTypes.number,
    }),
    monthSelectionHandler: PropTypes.func,
    selectionHandler: PropTypes.func,
    selectionStart: PropTypes.object, // moment
    selectionEnd: PropTypes.object, // moment
    startDate: PropTypes.object, // moment
    temporaryStart: PropTypes.object, // mom]ent
    temporaryEnd: PropTypes.object, // moment
  };

  // wrappers around the handlers passed in as prop to keep the this context, while still being able to bind the data to them later on
  modifyCalendarMonth(modification) {
    const { index } = this.props;

    this.props.monthSelectionHandler(modification, index);
  }

  blockMonth(modification) {
    const { allowModification, index } = this.props;

    return !allowModification(index, modification);
  }

  render() {
    const button = 'button';
    const { monthSelection } = this.props;
    const modifications = [[
      { month: 0, year: -1, text: '<<' },
      { month: undefined, year: undefined, text: monthSelection.year },
      { month: 0, year: 1, text: '>>' },
    ], [
      { month: -1, year: 0, text: '<' },
      { month: undefined, year: undefined, text: monthSelection.month + 1 },
      { month: 1, year: 0, text: '>' },
    ]];

    return <div className="calendar-container">
      <div className="month-selection">
        {moment()
          .year(monthSelection.year)
          .month(monthSelection.month)
          .format('MMM YYYY')}
        {modifications.map(x =>
          <div className="modification-row">


            {x.map(modification =>
              (typeof modification.year === 'undefined'
                ? <p key={modification.text}>{modification.text}</p>
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
