import React, { Component } from 'react';
import moment from 'moment';
import propTypes from 'prop-types';

import CalendarContainer from './componentcalendarcontainer';

export class DateRangePicker extends Component {
  static propTypes = {
    endDate: propTypes.object, // moment
    format: propTypes.string,
    id: propTypes.number,
    numberOfCalendars: propTypes.number,
    reportChanges: propTypes.func.isRequired,
    selectionStart: propTypes.object, // moment
    selectionEnd: propTypes.object, // moment
    startDate: propTypes.object, // moment
  };

  static defaultProps = {
    endDate: moment.utc('2000-06-18 00+00:00'),
    id: 0,
    selectionStart: undefined,
    selectionEnd: undefined,
    startDate: moment.utc('1990-01-18 00+00:00'),
  };

  constructor(props) {
    super(props);
    this.state = {
      drawFromState: (props.selectionStart === undefined &&
        props.selectionEnd === undefined),
      selectionStart: props.selectionStart,
      selectionEnd: props.selectionEnd,
      selectionHandler: this.selectionStartHandler,
      temporaryEnd: undefined,
      temporaryStart: undefined,
    };
  }

  componentDidUpdate(prevProps) {
    const { id, selectionStart, selectionEnd } = this.props;

    if ((selectionStart === undefined ||
      selectionEnd === undefined)
    || (prevProps.selectionStart === undefined &&
      prevProps.selectionEnd === undefined)) {
      return;
    }

    // check whether a new selection is passed in as prop, if that is the case do not draw the selection stored in state
    // and reset the state
    if (prevProps.id !== id
      || (((!prevProps.selectionStart.isSame(selectionStart, 'day')
          && !selectionStart.isSame(this.state.selectionStart))
        || (!prevProps.selectionEnd.isSame(selectionEnd, 'day')
          && !selectionEnd.isSame(this.state.selectionEnd))))) {
      this.setState({
        drawFromState: false,
        focus: true,
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
      selectionStart: date.clone(),
      selectionEnd: undefined,
      selectionHandler: this.selectionEndHandler,
      temporaryStart: date.clone(),
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
    const { selectionStart, temporaryEnd } = this.state;

    const { reportChanges } = this.props;

    const newState = {
      hasUnreportedChanges: true,
      selectionHandler: this.selectionStartHandler,
      temporaryEnd: undefined,
      temporaryStart: undefined,
    };

    if (date.isBefore(selectionStart, 'day')) {
      newState.selectionStart = date.clone();
      newState.selectionEnd = selectionStart;
    } else if (date.isSame(selectionStart, 'day')) {
      newState.selectionStart = temporaryEnd.isBefore(date, 'day') ? temporaryEnd : date;
      newState.selectionEnd = temporaryEnd.isAfter(date, 'day') ? temporaryEnd : date;
    } else {
      newState.selectionStart = selectionStart;
      newState.selectionEnd = date.clone();
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

  reportFocus() {
    this.setState({ focus: false });
  }
  render() {
    const {
      endDate,
      numberOfCalendars,
      startDate } = this.props;

    const {
      drawFromState,
      focus,
      selectionEnd,
      selectionHandler,
      selectionStart,
      temporaryEnd,
      temporaryStart } = this.state;

    return <CalendarContainer
      endDate={endDate}
      numberOfCalendars={numberOfCalendars}
      drawFromState={drawFromState}
      focus={focus}
      reportFocus={this.reportFocus.bind(this)}
      selectionEnd={drawFromState ? selectionEnd : this.props.selectionEnd}
      selectionStart={drawFromState ? selectionStart : this.props.selectionStart}
      selectionHandler={selectionHandler.bind(this)}
      startDate={startDate}
      temporaryStart={temporaryStart}
      temporaryEnd={temporaryEnd}
      hoverHandler={this.hoverHandler.bind(this)}/>;
  }
}
