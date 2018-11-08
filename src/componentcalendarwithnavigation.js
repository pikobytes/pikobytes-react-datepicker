import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Calendar from './componentcalendar';

export default class CalendarWithNavigation extends React.Component {
  // TODO: rename props
  static propTypes = {
    hoverHandler: PropTypes.func,
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
    temporaryStart: PropTypes.object, // mom]ent
    temporaryEnd: PropTypes.object, // moment
  };

  // wrapper around the handler passed in as prop to keep the this context, while still being able to bind the data to them later on
  modifyCalendarMonth(modification) {
    const { index } = this.props;

    this.props.monthSelectionHandler(modification, index);
  }

  blockMonth(modification) {
    const { index, blockMonth } = this.props;

    return !blockMonth(index, modification);
  }

  render() {
    const button = 'button';
    const { monthSelection } = this.props;
    const modifications = [
      { month: 0, year: 1, text: 'incYear' },
      { month: 0, year: -1, text: 'decYear' },
      { month: 1, year: 0, text: 'incMonth' },
      { month: -1, year: 0, text: 'decMonth' },
    ];

    return <div>
      <div className="month-selection">
        {moment().year(monthSelection.year).month(monthSelection.month).format('DD MMM YYYY')}
        {modifications.map(modification =>
          (this.blockMonth(modification)
            ? <a className={`${button} blocked`}
              key={modification.text}>{modification.text}</a>
            : <a className={button}
              key={modification.text}
              onClick={this.modifyCalendarMonth.bind(this, modification)}>{modification.text}</a>))}
      </div>
      <Calendar {... this.props}/>
    </div>;
  }
}
