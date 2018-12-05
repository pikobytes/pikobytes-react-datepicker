import React, { Component } from 'react';
import propTypes from 'prop-types';

import CalendarContainer from './componentcalendarcontainer';

export class DatePicker extends Component {
  static propTypes = {
    endDate: propTypes.object, // moment
    format: propTypes.string,
    id: propTypes.number,
    numberOfCalendars: propTypes.number,
    reportChanges: propTypes.func.isRequired,
    selection: propTypes.object, // moment
    startDate: propTypes.object, // moment
  };

  static defaultProps = {
    format: 'dd',
    id: 0,
    selection: undefined,
  };

  constructor(props) {
    super(props);
    this.state = {
      drawFromState: props.selection === undefined,
      selection: props.selection,
    };
  }


  componentDidUpdate(prevProps) {
    const { selection } = this.state;
    const { id } = this.props;

    if ((selection === undefined
      && this.props.selection !== undefined) ||
      (prevProps.selection !== undefined
      && this.props.selection !== undefined
      && (!selection.isSame(this.props.selection)
    || prevProps.id !== id))) {
      this.setState({ selection: this.props.selection, drawFromState: false, focus: true });
    }
  }

  selectionHandler(date) {
    const { reportChanges } = this.props;
    this.setState({ selection: date, drawFromState: true });

    reportChanges(date);
  }

  reportFocus() {
    this.setState({ focus: false });
  }

  render() {
    const {
      drawFromState,
      focus,
      selection,
    } = this.state;

    return <CalendarContainer
      {...this.props}
      numberOfCalendars={1}
      focus={focus}
      reportFocus={this.reportFocus.bind(this)}
      selectionEnd={drawFromState ? selection : this.props.selection}
      selectionStart={drawFromState ? selection : this.props.selection}
      selectionHandler={this.selectionHandler.bind(this)}/>;
  }
}
