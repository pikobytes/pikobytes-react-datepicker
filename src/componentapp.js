import React, { Component } from 'react';

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
      <DatePicker/>
    </div>;
  }
}
