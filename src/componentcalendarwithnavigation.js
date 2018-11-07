import React from 'react';
import PropTypes from 'prop-types';
import Calendar from './componentcalendar';

export default class CalendarWithNavigation extends React.Component {
  static propTypes = {
    hoverHandler: PropTypes.func,
    identifier: PropTypes.string,
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
    temporaryStart: PropTypes.object, // mom]ent
    temporaryEnd: PropTypes.object, // moment
  };

  // wrapper around the handler passed in as prop to keep the this context, while still being able to bind the data to them later on
  modifyCalendarMonth(calendar, modification, identifier) {
    this.props.monthSelectionHandler(calendar, modification, identifier);
  }

  render() {
    const button = 'button';
    const { monthSelection, identifier } = this.props;
    return <div>
      <div className="month-selection"><a className={button}
        onClick={this.modifyCalendarMonth.bind(this, monthSelection, { month: 0, year: 1 }, identifier)}> inc year</a>
      <p>{monthSelection.year}</p>
      <a className={button}
        onClick={this.modifyCalendarMonth.bind(this, monthSelection, { month: 0, year: -1 }, identifier)}> dec year</a>
      <br/>
      <a className={button}
        onClick={this.modifyCalendarMonth.bind(this, monthSelection, { month: 1, year: 0 }, identifier)}> inc month</a>
      <p>{monthSelection.month + 1}</p>
      <a className={button}
        onClick={this.modifyCalendarMonth.bind(this, monthSelection, { month: -1, year: 0 }, identifier)}> dec month</a>
      </div>
      <Calendar {... this.props}/>
    </div>;
  }
}
