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
      <DatePicker endDate={moment('2000-01-31')} startDate={moment('1990-01-01')}/>
    </div>;
  }
}
