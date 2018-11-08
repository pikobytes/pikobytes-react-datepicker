import React from 'react';
import PropTypes from 'prop-types';

export default class Calendar extends React.Component {
  static propTypes = {
    hoverHandler: PropTypes.func,
    month: PropTypes.shape({
      month: PropTypes.number,
      weeks: PropTypes.array,
    }),
    selectionHandler: PropTypes.func,
    selectionStart: PropTypes.object, // moment
    selectionEnd: PropTypes.object, // moment
    temporaryStart: PropTypes.object, // moment
    temporaryEnd: PropTypes.object, // moment
  };

  // wrappers around the handlers passed in as props to keep the this contexts, while still being able to bind the dates to them later on
  selectionHandler(date) {
    this.props.selectionHandler(date);
  }
  hoverHandler(date) {
    this.props.hoverHandler(date);
  }

  /**
   * determines whether a single date is selected
   * @param date which should be checked for selection
   * @param end date of the selection
   * @param start date of the selection
   * @returns {boolean} states if the date is in the range and therefor selected
   */
  static determineSelection(date, end, start) {
    if (date.isSame(start)) {
      return true;
    }

    if (typeof end === 'undefined') {
      return false;
    }

    return date.isSame(end) || date.isBetween(start, end);
  }

  renderDay(day) {
    const { month } = this.props;

    return day.month() === month.month
      ? <td key={`${day.year()}.${day.month()}.${day.date()}`}
        className={`${Calendar.determineSelection(day, this.props.selectionEnd, this.props.selectionStart)
          ? 'is-selected'
          : ''}  ${Calendar.determineSelection(day, this.props.temporaryEnd, this.props.temporaryStart)
          ? 'will-be-selected'
          : ''}`}

        onClick={this.selectionHandler.bind(this, day)}
        onMouseOver={this.hoverHandler.bind(this, day)}>
        {day.date() === 1 ? day.format('D. MMM') : day.format('D')}
      </td>
      : <td key={`${day.year()}.${day.month()}.${day.date()}`}
        className="inactive">
        {day.date() === 1 ? day.format('D. MMM') : day.format('D')}
      </td>;
  }


  render() {
    const { month } = this.props;

    return <table className='table'>
      <thead>
        <tr>
          <th>monday</th>
          <th>tuesday</th>
          <th>wednesday</th>
          <th>thursday</th>
          <th>friday</th>
          <th>saturday</th>
          <th>sunday</th>
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
