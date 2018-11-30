import React, { Component } from 'react';
import './componentapp.css';
import ExampleContainer from './componentexamplecontainer';

/**
 * App
 */
export default class App extends Component {
  /**
   * Renders the component
   */
  render() {
    return <div className="container template-app">
      <ExampleContainer />
    </div>;
  }
}
