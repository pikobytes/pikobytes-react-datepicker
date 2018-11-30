import React, { Component } from 'react';

import moment, { isMoment } from 'moment';
import { DateRangePicker } from './componentdaterangepicker';

const exampleStart = moment('2000-01-31 00+00:00');
const exampleEnd = moment('2003-12-11 00+00:00');

export default class ExampleContainer extends Component {
  state = { selectionStart: moment('2001-01-01 00+00:00'),
    selectionEnd: moment('2002-01-01 00+00:00') };

  reportChange(x) {
    if (isMoment(x)) {
      this.setState({ selectionStart: x, selectionEnd: x });
    }
    if (x[1] !== undefined) {
      this.setState({ selectionStart: x[0], selectionEnd: x[1] });
    }
  }

  onClick() {
    this.setState({ selectionStart: moment('2001-01-01 00+00:00'),
      selectionEnd: moment('2002-01-01 00+00:00') });
  }

  render() {
    return <React.Fragment> <DateRangePicker
      startDate={exampleStart}
      endDate={exampleEnd}
      selectionStart={this.state.selectionStart}
      selectionEnd={this.state.selectionEnd}
      reportChanges={this.reportChange.bind(this)}/>
    <a onClick={this.onClick.bind(this)}> passNewState </a>
    </React.Fragment>;
  }
}
