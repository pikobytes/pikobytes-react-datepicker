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
    const oldSelection = this.state.selection;
    const { id } = this.props;
    const newSelection = this.props.selection;

    if ((oldSelection === undefined && newSelection !== undefined)
      || (prevProps.selection !== undefined && newSelection !== undefined
        && (!oldSelection.isSame(newSelection) || prevProps.id !== id))) {
      this.setState({ selection: newSelection, drawFromState: false, focus: true });
    }
  }

  selectionHandler(date) {
    const { reportChanges } = this.props;
    this.setState({ selection: date, drawFromState: true });
    if (reportChanges !== undefined) {
      reportChanges(date);
    }
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
