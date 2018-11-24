import React, { Component } from 'react';
import moment from 'moment';
import './componentapp.css';
import DatePicker from './componentdatepicker';

/**
 * App
 */
export default class App extends Component {
  /**
   * Renders the component
   */
  render() {
    return <div className="container template-app">
      <DatePicker startDate={moment.utc('2000-01-01 00+00:00')}
        endDate={moment.utc('2005-02-01 00+00:00')}
        reportChanges={x => x} />

    </div>;
  }
}
