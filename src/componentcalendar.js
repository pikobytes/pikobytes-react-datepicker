import React from 'react';
import PropTypes from 'prop-types';

export default class Calendar extends React.Component {
  static propTypes = {
    month: PropTypes.shape({
      month: PropTypes.number,
      weeks: PropTypes.array,
    }),
  };

  state = {
    selectionStart: undefined,
    selectionEnd: undefined,
    selectionHandler: this.selectionStartHandler,
    temporaryEnd: undefined,
  };

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
        datacell for every day. */}
        {month.weeks.map(week =>
          <tr key={week.week}>{week.days.map(day =>
            <td key={`${day.year()}.${day.month()}.${day.date()}`}
              className={`${Calendar.determineSelection(day, this.state.selectionEnd, this.state.selectionStart)
                ? 'is-selected'
                : ''}  ${Calendar.determineSelection(day, this.state.temporaryEnd, this.state.temporaryStart)
                ? 'will-be-selected'
                : ''}`}

              onClick={this.state.selectionHandler.bind(this, day)}
              onMouseOver={this.hoverHandler.bind(this, day)}>
              {day.date() === 1 ? day.format('D. MMM') : day.format('D')}
            </td>)}</tr>)}
      </tbody>
    </table>;
  }
}
