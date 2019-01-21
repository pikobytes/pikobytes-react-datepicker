import React, { Component } from 'react';

import moment, { isMoment } from 'moment';
import { DateRangePicker } from './componentdaterangepicker';
import { DatePicker } from './componentdatepicker';

const exampleStart = moment('2000-01-31 00+00:00');
const exampleEnd = moment('2000-12-11 00+00:00');

export default class ExampleContainer extends Component {
  state = { selectionStart: moment.utc('2001-01-01 00+00:00'),
    selectionEnd: moment.utc('2002-01-01 00+00:00'),
    id: 0 };

  reportChange(x) {
    if (isMoment(x)) {
      this.setState({ selectionStart: x, selectionEnd: x, selection: x });
    }
    if (x[1] !== undefined) {
      this.setState({ selectionStart: x[0], selectionEnd: x[1] });
    }
  }

  onClick() {
    this.setState({ selectionStart: moment.utc('2001-01-01 00+00:00'),
      selectionEnd: moment.utc('2002-01-01 00+00:00'),
      selection: moment.utc('2002-01-01 00+00:00'),
      id: this.state.id + 1 });
  }

  render() {
    const { selection, selectionStart, selectionEnd } = this.state;

    return <React.Fragment> <DateRangePicker
      startDate={exampleStart}
      endDate={exampleEnd}
      id={this.state.id}
      selectionStart={selectionStart}
      selectionEnd={selectionEnd}
      selection={selection}
      reportChanges={this.reportChange.bind(this)}/>
    <a onClick={this.onClick.bind(this)} className="button"> passNewState </a>
    </React.Fragment>;
  }
}
