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
  subWeeks,
  startOfYear,
  isBefore,
} from 'date-fns';
import {
  DictionaryEntry,
  DictionaryLabel,
  DictionaryData,
  Dictionary,
  DictionaryDivider,
} from '~/storybook/Dictionary/Dictionary';
import { SectionTitle } from '~/storybook/Title/Title';
import { useQuery } from 'react-query';
import { Block } from '~/storybook/Block/Block';
import { Spinner } from '~/storybook/Spinner/Spinner.styles';
import { SelectWidget } from '~/components/Form/Select/Select';
import { Button } from '~/components/Form/Button/Button';
import { Grid, GridCol, GridRow } from '~/storybook/Grid/Grid';
import { findCorrectFromTime, findCorrectToTime } from '~/utils/priceServiceDates';
import MonthlyReturnTable from './FundMonthlyReturnTable';

export interface FundMetricsProps {
  address: string;
}

interface DepthTimelineItem {
  timestamp: number;
  rates: {
    [symbol: string]: number;
  };
  holdings: {
    [symbol: string]: number;
  };
  shares: number;
  calculations: {
    price: number;
    gav: number;
    nav: number;
  };
}
export type Depth = '1y' | '6m' | '3m' | '1m' | '1w' | '1d';

const depths: Depth[] = ['1w', '1m', '3m', '6m', '1y'];

async function fetchMonthlyFundPrices(key: string, address: string) {
  const url = process.env.MELON_METRICS_API;
  const queryAddress = `${url}/api/monthend?address=${address}`;
  const response = await fetch(queryAddress)
    .then((response) => response.json())
    .catch((error) => console.log(error));
  return response;
}

function useFetchMonthlyFundPrices(fund: string) {
  const address = React.useMemo(() => fund.toLowerCase(), [fund]);
  return useQuery(['prices', address], fetchMonthlyFundPrices, {
    refetchOnWindowFocus: false,
  });
}

async function fetchFundPricesByDate(key: string, address: string, from: number, to: number) {
  const url = process.env.MELON_METRICS_API;
  const queryAddress = `${url}/api/range?address=${address}&from=${from}&to=${to}`;
  const response = await fetch(queryAddress)
    .then((response) => response.json())
    .catch((error) => console.log(error));
  return response;
}

function useFetchFundPricesByDate(fund: string, from: number, to: number) {
  const address = fund.toLowerCase();
  return useQuery([(from + to).toString(), address, from, to], fetchFundPricesByDate, {
    refetchOnWindowFocus: false,
  });
}

function stripDuplicateOnchainPrices(timelineArray: DepthTimelineItem[]) {
  return timelineArray.map((item) => new BigNumber(item.calculations.price));
}

async function fetchIndexPrices(key: string, startDate: string, endDate: string) {
  const apiKey = '007383bc-d3b7-4249-9a0d-b3a1d17113d9';
  const urlWithParams = `https://api.bitwiseinvestments.com/api/v1/indexes/BITWISE10/history?apiKey=${apiKey}&start=${startDate}&end=${endDate}`;
  const response = await fetch(urlWithParams)
    .then((response) => response.json())
    .catch((error) => console.log(error));
  const prices = response.map((item: number[]) => new BigNumber(item[1]));
  return prices as BigNumber[];
}

async function fetchMultipleIndexPrices(dates: [Date, Date][]) {
  const prices = await Promise.all(
    dates.map((item) => {
      return fetchIndexPrices('blank', item[0].toISOString(), item[1].toISOString());
    })
  );
  return prices;
}

function useFetchIndexPrices(startDate: string, endDate: string) {
  return useQuery(['indices', startDate, endDate], fetchIndexPrices, {
    refetchOnWindowFocus: false,
  });
}

function calculateStdDev(values: BigNumber[]) {
  const avg = average(values);
  const squareDiffs = values.map((value) => {
    const diff = value.minus(avg);
    const sqrDiff = diff.multipliedBy(diff);
    return sqrDiff;
  });
  const variance = average(squareDiffs);
  const stdDev = variance.sqrt().multipliedBy(Math.sqrt(values.length));
  return stdDev;
}

function calculateVAR(values: BigNumber[] | undefined) {
  if (typeof values == 'undefined') {
    return {
      lowZ: 'Fetching Data',
      highZ: 'Fetching Data',
    };
  } else {
    const avg = average(values);
    const squareDiffs = values.map((value) => {
      const diff = value.minus(avg);
      const sqrDiff = diff.multipliedBy(diff);
      return sqrDiff;
    });
    const variance = average(squareDiffs);
    const stdDev = variance.sqrt();
    return {
      lowZ: stdDev.multipliedBy(1.645).multipliedBy(100),
      highZ: stdDev.multipliedBy(2.33).multipliedBy(100),
    };
  }
}

function calculateVolatility(stdDev: BigNumber, observations: number) {
  return stdDev.multipliedBy(Math.sqrt(observations)).multipliedBy(100);
}

function average(data: BigNumber[]) {
  const sum = data.reduce((s, value) => {
    return s.plus(value);
  }, new BigNumber(0));
  const avg = sum.dividedBy(data.length);
  return avg;
}

function calculateDailyLogReturns(arr: BigNumber[]) {
  return arr.map((price, idx: number) => {
    if (idx > 0) {
      const logReturn = new BigNumber(Math.log(price.toNumber()) - Math.log(arr[idx - 1].toNumber()));
      return logReturn;
    } else {
      return new BigNumber(0);
    }
  });
}

function calculatePeriodReturns(periodPrices: BigNumber[]) {
  return calculateReturn(periodPrices[0], periodPrices[periodPrices.length - 1]);
}

export default function FundPerformanceMetrics(props: FundMetricsProps) {
  const today = React.useMemo(() => new Date(), []);
  const fund = useFund();
  const [depth, setDepth] = React.useState<Depth>('1m');
  const [historicalMonthlyIndexPrices, setHistoricalMonthlyIndexPrices] = React.useState<BigNumber[][] | undefined>(
    undefined
  );
  const fundInception = fund.creationTime!;
  const ageInMonths = differenceInCalendarMonths(today, fundInception);

  const indexQueryStartDate = React.useMemo(() => {
    if (depth === '1w') {
      return startOfDay(subDays(subWeeks(today, 1), 1)).toISOString();
    } else if (depth === '1m') {
      return startOfDay(subDays(subMonths(today, 1), 1)).toISOString();
    } else if (depth === '3m') {
      return startOfDay(subDays(subMonths(today, 3), 1)).toISOString();
    } else if (depth === '6m') {
      return startOfDay(subDays(subMonths(today, 6), 1)).toISOString();
    } else {
      return startOfDay(subDays(subMonths(today, 12), 1)).toISOString();
    }
  }, [depth]);
  const monthStartDate = findCorrectFromTime(startOfMonth(today));
  const quarterStartDate = findCorrectFromTime(startOfQuarter(today));
  const yearStartDate = findCorrectFromTime(startOfYear(today));
  const toToday = findCorrectToTime(today);

  // fundMonthlyData is Only the the month-end prices for every month the fund's been in existence
  const { data: fundMonthlyData, error: fundMonthlyError, isFetching: fundMonthlyFetching } = useFetchMonthlyFundPrices(
    props.address
  );

  const {
    data: fundLastMonthsData,
    error: fundLastMonthsError,
    isFetching: fundLastMonthsFetching,
  } = useFetchFundPricesByDate(props.address, monthStartDate, toToday);

  const {
    data: fundLastQuartersData,
    error: fundLastQuartersError,
    isFetching: fundLastQuartersFetching,
  } = useFetchFundPricesByDate(props.address, quarterStartDate, toToday);

  const {
    data: fundLastYearsData,
    error: fundLastYearsError,
    isFetching: fundLastYearsFetching,
  } = useFetchFundPricesByDate(props.address, yearStartDate, toToday);

  const { data: indexData, error: indexError, isFetching: indexFetching } = useFetchIndexPrices(
    indexQueryStartDate,
    endOfDay(today).toISOString()
  );

  const fundMonthDates = new Array(ageInMonths + 1)
    .fill(null)
    .map((item, index: number) => {
      const targetMonth = subMonths(today, index);
      return [startOfMonth(targetMonth), endOfMonth(targetMonth)] as [Date, Date];
    })
    .reverse();

  React.useMemo(async () => {
    const prices = await fetchMultipleIndexPrices(fundMonthDates);
    setHistoricalMonthlyIndexPrices(prices);
  }, [fund]);

  if (
    !indexData ||
    indexFetching ||
    !fundMonthlyData ||
    fundMonthlyFetching ||
    !fundLastQuartersData ||
    fundLastQuartersFetching ||
    !fundLastYearsData ||
    fundLastYearsFetching
  ) {
    return (
      <Block>
        <Spinner />
      </Block>
    );
  }

  const mostRecentPrice =
    fundLastMonthsData && fundLastMonthsData.data[fundLastMonthsData.data.length - 1].calculations.price;

  const monthStartPrice = fundMonthlyData && fundMonthlyData.data[fundMonthlyData.data.length - 1].calculations.price;

  const quarterStartPrice = fundLastQuartersData && fundLastQuartersData.data[0].calculations.price;
  const yearStartPrice = isBefore(fundInception, yearStartDate)
    ? fundLastYearsData && fundLastYearsData.data[0].calculations.price
    : 1;
  const mtdReturn = calculateReturn(mostRecentPrice, monthStartPrice);
  console.log(mtdReturn.toPrecision(8));
  const qtdReturn = calculateReturn(mostRecentPrice, quarterStartPrice);
  const ytdReturn = calculateReturn(mostRecentPrice, 1);

  const fundMonthlyReturns: BigNumber[] = fundMonthlyData.data.map(
    (item: DepthTimelineItem, index: number, arr: DepthTimelineItem[]) => {
      if (index === 0) {
        return calculateReturn(new BigNumber(1), new BigNumber(item.calculations.price));
      }
      return calculateReturn(new BigNumber(item.calculations.price), new BigNumber(arr[index - 1].calculations.price));
    }
  );

  const bestMonth = fundMonthlyReturns.reduce((carry: BigNumber, current: BigNumber) => {
    if (current.isGreaterThan(carry)) {
      return current;
    }
    return carry;
  }, fundMonthlyReturns[0]);

  const worstMonth = fundMonthlyReturns.reduce((carry: BigNumber, current: BigNumber) => {
    if (current.isLessThan(carry)) {
      return current;
    }
    return carry;
  }, fundMonthlyReturns[0]);

  const monthlyWinLoss = fundMonthlyReturns.reduce(
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
  const positiveMonthRatio = (monthlyWinLoss.win / (monthlyWinLoss.win + monthlyWinLoss.lose)) * 100;

  const averageMonthlyGain = average(fundMonthlyReturns);

  const assumedRiskFreeRate = 0.5;

  return (
    <>
      <SectionTitle>Fund Performance Metrics</SectionTitle>

      {/* <DictionaryEntry>
        <DictionaryLabel>{depth} Fund Volatility </DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} value={periodFundVol} suffix={'%'} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>{depth} BitWise 10 Index Vol</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} value={periodIndexVol} suffix={'%'} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>{depth} Fund Return</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} value={periodFundReturn} colorize={true} suffix={'%'} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>{depth} BitWise 10 Index Return</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} value={periodIndexReturn} colorize={true} suffix={'%'} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>{depth} Fund VAR</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} value={periodFundVAR?.lowZ} colorize={false} suffix={'%'} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>{depth} BitWise 10 Index VAR</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} value={periodIndexVAR?.lowZ} colorize={false} suffix={'%'} />
        </DictionaryData>
      </DictionaryEntry> */}
      <DictionaryEntry>
        <DictionaryLabel>MTD Return</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber
            decimals={mtdReturn.toNumber() >= 0.005 ? 2 : 4}
            suffix={'%'}
            colorize={true}
            value={mtdReturn}
          />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>QTD Return</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} suffix={'%'} colorize={true} value={qtdReturn} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>YTD Return</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} suffix={'%'} colorize={true} value={ytdReturn} />
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
          <FormattedNumber decimals={2} colorize={true} value={positiveMonthRatio} suffix={'%'} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Average Monthly Return</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} suffix={'%'} colorize={true} value={averageMonthlyGain} />
        </DictionaryData>
      </DictionaryEntry>
      <MonthlyReturnTable today={today} prices={fundMonthlyReturns} />
    </>
  );
}

/**
 * RETURN MATH FOR VOLATILITY AND VAR CALS
 */
// // indexData is an array of bignumbers, every index price since the date that's passed
// // indexDailyReturns is an array of bignumbers, with index 0 being the return on day 0 and index(len-1) the return yesterday
// const indexDailyReturns = indexData ? calculateDailyLogReturns(indexData) : [new BigNumber('NaN')];
// // periodIndexVol takes the daily returns as a parameter and returns a bignumber == the volatility of those returns
// const periodIndexVol = indexData
//   ? calculateVolatility(calculateStdDev(indexDailyReturns), indexDailyReturns.length)
//   : new BigNumber('Nan');
// // periodIndexReturn shows the return if one were to hold an index for the time period
// const periodIndexReturn = indexData ? calculatePeriodReturns(indexData) : new BigNumber('Nan');
// // periodIndexVar takes the daily returns as a parameter and returns an object where lowZ == 95% CI and highZ = 99% CI
// const periodIndexVAR = indexDailyReturns && calculateVAR(indexDailyReturns);

// // fundData.data is an array of price objects with onchain and offchain prices as well as fund holdings data
// // onChainPriceUpdates is an array of BigNumbers with the duplicate onchain prices stripped out (would otherwise remain constant for a day)
// const onChainPriceUpdates = fundData && stripDuplicateOnchainPrices(fundData.data);
// // onChainDailyReturns is an array of BigNumbers showing the inter-day returns starting with day 1's return  and ending with yesterday's
// const onChainDailyReturns = onChainPriceUpdates
//   ? calculateDailyLogReturns(onChainPriceUpdates)
//   : [new BigNumber('Nan')];
// // periodFundVol takes the onChainDailyReturns as a parameter and returns a bignumber === the volatility of those returns
// const periodFundVol =
//   onChainDailyReturns && calculateVolatility(calculateStdDev(onChainDailyReturns), onChainDailyReturns.length);
// // periodFundReturn takes the onChainPriceUpdates as a parameter and returns a bignumner
// const periodFundReturn = onChainPriceUpdates ? calculatePeriodReturns(onChainPriceUpdates) : new BigNumber('Nan');
// // periodFundVar takes the daily returns as a parameter and returns an object where lowZ = 95% CI and highZ = 9% CI
// const periodFundVAR = onChainDailyReturns && calculateVAR(onChainDailyReturns);
