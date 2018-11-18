import React, { Component } from 'react';
import moment from 'moment';

const INITDATE = '1990-02-01 00+00:00';

/**
 * generates an array of size 7, representing a single week
 * @param {number} year - for which the week should be generated
 * @param {number} month - for which the week should be generated
 * @param {number} week - the concrete week which should be generated
 * @returns {moment.Moment[]} array of size 7, representing a week
 */
export function generateDays(year, month, week) {
  return Array(7).fill(0).map((n, i) => moment(INITDATE)
    .year(year)
    .month(month)
    .week(week)
    .utc()
    .startOf('week')
    .clone()
    .add(n + (i + 1), 'day'));
}

/**
 * builds a monthObject for the specified month
 * @param {number} year for which the monthObject should be generated
 * @param {number} month for which the monthObject should be generated
 * @returns {{
 * month: number,
 * weeks: Array
 * }} containing all weeks of a month
 */
export function buildCalendarMonth(year, month) {
  // subtract is needed for the shift from sunday to monday as first day of the week
  let startWeek = moment(INITDATE).year(year).month(month)
    .startOf('month')
    .startOf('week')
    .week();
  let endWeek = moment().year(year).month(month).utc()
    .endOf('month')
    .startOf('week')
    .week();

  const weeks = [];

  // due to the shift from sunday to monday as first day of the week, as it is more common in europe,
  // the year might start with the 53th week. If that happens, we will just generate this week manually
  if (startWeek === 53) {
    startWeek = 1;
    weeks.push({ week: 53, days: generateDays(year - 1, 0, 53) });
  }

  // the week containing january the first is handled as the first week of the next year
  if (endWeek === 1) {
    endWeek = 53;
  }

  for (let week = startWeek; week <= endWeek; week++) {
    weeks.push({
      week: week,
      days: generateDays(year, month, week),
    });
  }

  return {
    month: month,
    weeks: weeks,
  };
}

/**
 *
 * @param WrappedComponent which will be returned, with the injected prop
 * @returns {*} Wrapped Component with injected prop
 */
export default function MonthProvider(WrappedComponent) {
  return class extends Component {
    render() {
      const { monthSelection, ...passThroughProps } = this.props;
      const { month, year } = monthSelection;
      return <WrappedComponent {...passThroughProps}
        monthSelection={monthSelection}
        month={buildCalendarMonth(year, month)} />;
    }
  };
}
