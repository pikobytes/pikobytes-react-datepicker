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
      <DatePicker selectionStart={moment('1990-02-08 00+00:00')} selectionEnd={moment('1991-03-31 00+00:00')}/>
    </div>;
  }
}
