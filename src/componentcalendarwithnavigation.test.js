import React from 'react';
import { shallow } from 'enzyme';

import moment from 'moment';
import { buildCalendarYear } from './componentdatepicker';

import CalendarWithNavigation from './componentcalendarwithnavigation';

describe('componentcalendarwithnavigation.js', () => {
  const testYear = buildCalendarYear(2000);
  let wrapper;
  it('renders without crashing', () => {
    wrapper = shallow(<CalendarWithNavigation format="DD"
      monthSelection={{ month: 0, year: 2000 }}
      month={testYear[0]}
      startDate={moment('2000-01-01 00+00:00')}
      endDate={moment('2001-12-31 00+00:00')}/>);
  });

  it('navigation should be rendered completely, because no handler restricting the choice are passed in', () => {
    expect(wrapper.find('.button').length).toEqual(4);
  });
});
