import React from 'react';
import { mount } from 'enzyme';
import moment from 'moment-mini';

import DatePicker, { calcDistance } from './componentcalendarcontainer';

describe('componendatepicker.js', () => {
  it('calculates distances correctly', () => {
    expect(Math.round(calcDistance({ year: 2015, month: 0 }, { year: 2015, month: 1 }))).toEqual(1);
    expect(calcDistance({ year: 2015, month: 1 }, { year: 2015, month: 0 })).toEqual(1);
    expect(calcDistance({ year: 2014, month: 0 }, { year: 2015, month: 1 })).toEqual(13);
    expect(calcDistance({ year: 2015, month: 1 }, { year: 2014, month: 0 })).toEqual(13);
  });


  let wrapper;
  it('renders without crashing', () => {
    wrapper = mount(<DatePicker format="DD"
      startDate={moment('2000-01-01 00+00:00')}
      endDate={moment('2001-12-31 00+00:00')}
      reportChanges={x => x}/>);
  });

  it('four navigation buttons should be blocked, because the first month and the last month gets selected', () => {
    expect(wrapper.find('.blocked').length).toEqual(4);
  });

  it('button click (4. button) should increment the month of first calendar', () => {
    const button = wrapper.find('.button').at(3);
    expect(wrapper.find('p').at(1).text()).toEqual('Jan');
    button.simulate('click');
    expect(wrapper.find('p').at(1).text()).toEqual('Feb');
  });


  it('actually renders the number of specified calendars', () => {
    wrapper = mount(<DatePicker format="DD"
      numberOfCalendars={4}
      startDate={moment.utc('2000-01-01 00+00:00')}
      endDate={moment.utc('2006-12-31 00+00:00')}
      reportChanges={x => x}/>);

    expect(wrapper.find('.calendar-container').length).toEqual(4);
  });
});
