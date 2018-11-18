import React from 'react';
import { shallow } from 'enzyme';

import moment from 'moment';

import Calendar from './componentcalendar';
import { buildCalendarMonth } from './componentmonthprovider';

describe('componentcalendar.js', () => {
  it('renders without crashing', () => {
    shallow(<Calendar month={buildCalendarMonth(2012, 0)}/>);
  });

  it('date between start and end should be marked as selected', () => {
    expect(Calendar.determineSelection(
      moment('1990-02-03 00+00:00'),
      moment('1990-02-05 00+00:00'), // end
      moment('1990-02-01 00+00:00'), // start
    )).toEqual(true);
  });
  it('start date should be marked as selected', () => {
    expect(Calendar.determineSelection(
      moment('1990-02-03 00+00:00'),
      moment('1990-02-05 00+00:00'), // end
      moment('1990-02-03 00+00:00'), // start
    )).toEqual(true);
  });
  it('date not inside range should not be marked as selected', () => {
    expect(Calendar.determineSelection(
      moment('1990-02-02 00+00:00'),
      moment('1990-02-05 00+00:00'), // end
      moment('1990-02-03 00+00:00'), // start
    )).toEqual(false);
  });
});
