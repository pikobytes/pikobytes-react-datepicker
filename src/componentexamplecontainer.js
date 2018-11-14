import React, { Component } from 'react';

import moment from 'moment';
import DatePicker from './componentdatepicker';

const exampleStart = moment('2000-01-31 00+00:00');
const exampleEnd = moment('2003-12-11 00+00:00');

export default class ExampleContainer extends Component {
  state = { selectionStart: undefined,
    selectionEnd: undefined };

  reportChange(x) {
    this.setState({ selectionStart: x[0], selectionEnd: x[1] });
  }

  render() {
    const random = Math.random() > 0.3;
    return <DatePicker startDate={moment('2000-01-01 00+00:00')}
      endDate={moment('2003-12-31 00+00:00')}
      selectionStart={random ? this.state.selectionStart : exampleStart}
      selectionEnd={random ? this.state.selectionEnd : exampleEnd}
      reportChanges={this.reportChange.bind(this)}/>;
  }
}
