import * as React from 'react';

import { useFund } from '~/hooks/useFund';
import { calculateReturn } from '~/utils/finance';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
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
  endOfDay,
} from 'date-fns';
import { DictionaryEntry, DictionaryLabel, DictionaryData, Dictionary } from '~/storybook/Dictionary/Dictionary';
import { SectionTitle } from '~/storybook/Title/Title';
import { useQuery } from 'react-query';
import { Block } from '~/storybook/Block/Block';
import { Spinner } from '~/storybook/Spinner/Spinner.styles';

export interface FundMetricsProps {
  address: string;
}

export type Depth = '1y' | '6m' | '3m' | '1m' | '1w' | '1d';

async function fetchFundPrices(key: string, address: string, depth: Depth) {
  const url = process.env.MELON_METRICS_API;
  const queryAddress = `https://metrics.avantgarde.finance/api/portfolio?address=${address}$depth=${depth}`;
  const response = await fetch(queryAddress)
    .then((response) => response.json())
    .catch((error) => console.log(error));

  return response;
}

export function useFetchFundPrices(fund: string, depth: Depth) {
  const address = React.useMemo(() => fund.toLowerCase(), [fund]);
  return useQuery(['prices', address, depth], fetchFundPrices, {
    refetchOnWindowFocus: false,
  });
}

async function fetchIndexPrices(key?: string, startDate: string, endDate: string) {
  const apiKey = '007383bc-d3b7-4249-9a0d-b3a1d17113d9';
  const urlWithParams = `https://api.bitwiseinvestments.com/api/v1/indexes/BITWISE10/history?apiKey=${apiKey}&start=${startDate}&end=${endDate}`;
  console.log(urlWithParams);
  const response = await fetch(urlWithParams)
    .then((response) => response.json())
    .catch((error) => console.log(error));
  const prices = response.map((item: number[]) => new BigNumber(item[1]));

  return prices as BigNumber[];
}

function useFetchIndexPrices(startDate: string, endDate: string) {
  return useQuery(['indices', startDate, endDate], fetchIndexPrices, {
    refetchOnWindowFocus: false,
  });
}

function standardDeviation(values: BigNumber[]) {
  const avg = average(values);

  const squareDiffs = values.map((value) => {
    const diff = value.minus(avg);
    const sqrDiff = diff.multipliedBy(diff);
    return sqrDiff;
  });
  const variance = average(squareDiffs);
  // TODO make the day count dynamic
  const stdDev = variance.sqrt().multipliedBy(100).multipliedBy(Math.sqrt(30));
  return stdDev;
}

function average(data: BigNumber[]) {
  const sum = data.reduce((s, value) => {
    return s.plus(value);
  }, new BigNumber(0));

  const avg = sum.dividedBy(data.length);
  return avg;
}

export default function FundMetrics(props: FundMetricsProps) {
  const today = new Date();
  const fund = useFund();

  const [historicalIndexPrices, setHistoricalIndexPrices] = React.useState([]);
  const [depth, setDepth] = React.useState<Depth>('1m');
  const { data: fundData, error: fundError, isFetching: fundFetching } = useFetchFundPrices(props.address, depth);

  const fundInception = fund.creationTime!;
  const ageInMonths = differenceInCalendarMonths(today, fundInception);
  console.log('AGE IN MONTHS: ', ageInMonths);
  const { data: indexData, error: indexError, isFetching: indexFetching } = useFetchIndexPrices(
    startOfDay(subDays(subMonths(today, 1), 1)).toISOString(),
    endOfDay(today).toISOString()
  );

  if (!indexData && indexFetching) {
    return (
      <Block>
        <Spinner />
      </Block>
    );
  }

  const indexDailyReturns = indexData
    ? indexData.map<BigNumber[]>((price, idx: number) => {
        if (idx > 0) {
          const logReturn = new BigNumber(Math.log(price.toNumber()) - Math.log(indexData[idx - 1].toNumber()));
          return logReturn;
        } else {
          return new BigNumber(0);
        }
      })
    : [new BigNumber('NaN')];

  const indexVol = indexDailyReturns.length > 0 ? standardDeviation(indexDailyReturns).toString() : 'nada';

  // const currentSharePrice = new BigNumber(1.25); // sharePriceQuery(today)
  // const monthStartPrice = new BigNumber(1.19); // sharePriceQuery(startOfMonth(today))
  // const yearStartPrice = new BigNumber(1.03); // sharePriceQuery(startOfYear(today))
  // const allTimeReturn = calculateReturn(currentSharePrice, new BigNumber(1));

  const fundMonthDates = new Array(ageInMonths + 1)
    .fill(null)
    .map((item, index: number) => {
      const targetMonth = subMonths(today, index);
      return [startOfMonth(targetMonth), endOfMonth(targetMonth)] as [Date, Date];
    })
    .reverse();

  const indexMonthlyPrices = (async () => {
    await Promise.all(
      fundMonthDates.map((item) => {
        return fetchIndexPrices('blank', item[0].toISOString(), item[1].toISOString());
      })
    );
  })();

  console.log(indexMonthlyPrices, '<<did it work?');
  // const fundMonthlyPrices = fundMonthDates.map((item) => {
  //   Promise.all(item.map((date) => mockPriceQuery(date)));
  // });

  // const fundMonthlyReturns = fundMonthlyPrices.map((item) => {
  //   return calculateReturn(item[0], item[1]);
  // });

  // const monthlyPerformance =

  // const performanceYTD = calculateReturn(currentSharePrice, yearStartPrice); // calculateReturn(currentSharePrice, yearStartSharePrice)
  // const annualizedReturn = allTimeReturn.exponentiatedBy(1 / (ageInMonths / 12)).minus(1); // all time return calculateReturn(currentSharePrice, 1) raised to the (1/time) minus 1 where time is the years since fund inception as a decimal
  // const monthlyVolatility = 890; // pass array with a month's worth of prices to standardDeviation()
  // const monthlyVAR = 2390; // come back to this
  // const sharpeRatio = 212; // (monthlyReturns - assumedRiskFreeRate)/monthlyVolatility
  // const monthlyAverageReturn = 2390; //
  /**
   * need to get monthly returns for all months the fund's been in existence
   * need to identify which months those are
   * fund's inception date => how many months ago was that? useDifferenceInCalendarMonths(), call it x  use it to loop and call subMonths on 0 to x
   *  - you now have an array of dates. map over it and return [beginningOfMonth(item), endOfMonth(item)]
   *  - you now have an array of date arrays. call the historicalSharePrice query on both dates
   *  - you now have an array of prices, map over it and call calculateReturn(item[0], item[1])
   *  - you now have an array of returns, over which you can reduce to find best month worst month, positive/negative ratio, etc
   */
  // const bestMonth = fundMonthlyReturns.reduce((carry, current) => {
  //   if (current.isGreaterThan(carry)) {
  //     return current;
  //   }
  //   return carry;
  // }, fundMonthlyReturns[0]);

  // const worstMonth = fundMonthlyReturns.reduce((carry, current) => {
  //   if (current.isLessThan(carry)) {
  //     return current;
  //   }
  //   return carry;
  // }, fundMonthlyReturns[0]);

  // const positiveMonthRatio = fundMonthlyReturns.reduce(
  //   (carry, current) => {
  //     if (current.isGreaterThanOrEqualTo(0)) {
  //       carry.win++;
  //       return carry;
  //     }

  //     carry.lose++;
  //     return carry;
  //   },
  //   { win: 0, lose: 0 }
  // );

  // const averageGain = average(fundMonthlyReturns);

  const assumedRiskFreeRate = 0.5;

  return (
    <Dictionary>
      <SectionTitle>Fund Performance Metrics</SectionTitle>
      <DictionaryEntry>
        <DictionaryLabel>Index Vol</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} colorize={true} value={indexVol} suffix={'%'} />
        </DictionaryData>
      </DictionaryEntry>
      {/* <DictionaryEntry>
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
      </DictionaryEntry> */}
    </Dictionary>
  );
}
