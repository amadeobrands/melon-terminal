import * as React from 'react';
import { useFund } from '~/hooks/useFund';
import { standardDeviation, calculateReturn } from '~/utils/finance';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { Block } from '~/storybook/Block/Block';
import BigNumber from 'bignumber.js';
import {
  getUnixTime,
  startOfQuarter,
  startOfMonth,
  fromUnixTime,
  subDays,
  startOfDay,
  differenceInCalendarMonths,
  subMonths,
  endOfMonth,
} from 'date-fns';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { DictionaryEntry, DictionaryLabel, DictionaryData, Dictionary } from '~/storybook/Dictionary/Dictionary';
import { SectionTitle } from '~/storybook/Title/Title';

export interface FundMetricsProps {
  address: string;
}

export default function FundMetrics(props: FundMetricsProps) {
  const fund = useFund();
  const fundInception = fund.creationTime!;
  const today = new Date();
  const ageInMonths = differenceInCalendarMonths(today, fundInception);

  async function mockPriceQuery(date: Date) {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos/1').then((response) => response.json());
    return new BigNumber(response.userId);
  }

  function average(data: BigNumber[]) {
    const sum = data.reduce((s, value) => {
      return s.plus(value);
    }, new BigNumber(0));
    const avg = sum.dividedBy(data.length);
    return avg;
  }

  const currentSharePrice = new BigNumber(1.25); // sharePriceQuery(today)
  const monthStartPrice = new BigNumber(1.19); // sharePriceQuery(startOfMonth(today))
  const yearStartPrice = new BigNumber(1.03); // sharePriceQuery(startOfYear(today))
  const allTimeReturn = calculateReturn(currentSharePrice, new BigNumber(1));

  const fundMonthDates = new Array(ageInMonths)
    .map((item, index) => {
      const targetMonth = subMonths(today, index);
      return [startOfMonth(targetMonth), endOfMonth(targetMonth)];
    })
    .reverse();

  //
  const fundMonthlyPrices = fundMonthDates.map((item) => {
    Promise.all(item.map((date) => mockPriceQuery(date)));
  });

  const fundMonthlyReturns = fundMonthlyPrices.map((item) => {
    return calculateReturn(item[0], item[1]);
  });

  const monthlyPerformance = calculateReturn(currentSharePrice, monthStartPrice);
  const performanceYTD = calculateReturn(currentSharePrice, yearStartPrice); // calculateReturn(currentSharePrice, yearStartSharePrice)
  const annualizedReturn = allTimeReturn.exponentiatedBy(1 / (ageInMonths / 12)).minus(1); // all time return calculateReturn(currentSharePrice, 1) raised to the (1/time) minus 1 where time is the years since fund inception as a decimal
  const monthlyVolatility = 890; // pass array with a month's worth of prices to standardDeviation()
  const monthlyVAR = 2390; // come back to this
  const sharpeRatio = 212; // (monthlyReturns - assumedRiskFreeRate)/monthlyVolatility
  const monthlyAverageReturn = 2390; //
  /**
   * need to get monthly returns for all months the fund's been in existence
   * need to identify which months those are
   * fund's inception date => how many months ago was that? useDifferenceInCalendarMonths(), call it x  use it to loop and call subMonths on 0 to x
   *  - you now have an array of dates. map over it and return [beginningOfMonth(item), endOfMonth(item)]
   *  - you now have an array of date arrays. call the historicalSharePrice query on both dates
   *  - you now have an array of prices, map over it and call calculateReturn(item[0], item[1])
   *  - you now have an array of returns, over which you can reduce to find best month worst month, positive/negative ratio, etc
   */
  const bestMonth = fundMonthlyReturns.reduce((carry, current) => {
    if (current.isGreaterThan(carry)) {
      return current;
    }
    return carry;
  }, fundMonthlyReturns[0]);

  const worstMonth = fundMonthlyReturns.reduce((carry, current) => {
    if (current.isLessThan(carry)) {
      return current;
    }
    return carry;
  }, fundMonthlyReturns[0]);

  const positiveMonthRatio = fundMonthlyReturns.reduce(
    (carry, current) => {
      if (current.isGreaterThanOrEqualTo(0)) {
        carry.win++;
        return carry;
      }

      carry.lose++;
      return carry;
    },
    { win: 0, lose: 0 }
  );

  const averageGain = average(fundMonthlyReturns);

  const assumedRiskFreeRate = 0.5;

  return (
    <Dictionary>
      <SectionTitle>Fund Performance Metrics</SectionTitle>
      <DictionaryEntry>
        <DictionaryLabel>Monthly Performance</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} suffix={'%'} value={monthlyPerformance} colorize={true} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Performance YTD</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} suffix={'%'} colorize={true} value={performanceYTD} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Annualized return</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} suffix={'%'} colorize={true} value={annualizedReturn} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Monthly Volatility</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} suffix={'%'} colorize={true} value={monthlyVolatility} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Monthly VAR</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} colorize={true} value={monthlyVAR} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Sharpe Ratio</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} colorize={true} value={sharpeRatio} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Monthly Average Return</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} suffix={'%'} colorize={true} value={monthlyAverageReturn} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Best Month</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} suffix={'%'} colorize={true} value={bestMonth} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Worst Month</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} suffix={'%'} colorize={true} value={worstMonth} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>% Positive Months</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} colorize={true} value={positiveMonthRatio.win / positiveMonthRatio.lose} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Average Gain</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} suffix={'%'} colorize={true} value={averageGain} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Assumed Risk Free Rate</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} colorize={true} suffix={'%'} value={assumedRiskFreeRate} />
        </DictionaryData>
      </DictionaryEntry>
    </Dictionary>
  );
}
