import * as React from 'react';
import BigNumber from 'bignumber.js';
import { startOfYear, startOfMonth, startOfQuarter, isBefore } from 'date-fns';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { useFund } from '~/hooks/useFund';
import { calculateReturn, average } from '~/utils/finance';
import { Block } from '~/storybook/Block/Block';
import { Spinner } from '~/storybook/Spinner/Spinner.styles';
import { SectionTitle } from '~/storybook/Title/Title';
import {
  useFetchMonthlyFundPrices,
  useFetchFundPricesByDate,
  RangeTimelineItem,
  MonthendTimelineItem,
} from './FundMetricsQueries';
import { findCorrectFromTime, findCorrectToTime } from '~/utils/priceServiceDates';
import { Dictionary, DictionaryEntry, DictionaryLabel, DictionaryData } from '~/storybook/Dictionary/Dictionary';

export interface FundTDReturnsProps {
  address: string;
}

type FxReference = 'ethusd' | 'ethbtc' | 'etheur' | undefined;

function findSharePriceByDate(timeline: RangeTimelineItem[], date: Date) {
  const startOfDay = findCorrectFromTime(date);
  const endOfDay = findCorrectToTime(date);
  const targetDate = timeline.reduce((carry, current) => {
    if (startOfDay < current.timestamp && current.timestamp < endOfDay) {
      return current;
    }
    return carry;
  }, timeline[0]);
  return targetDate.calculations.price;
}

/**
 *
 * @param timeline is an array of MonthendTimelineItems that contain the fund's share price and fx data for the last day of each month of the fund's existence
 * @param dayZero is an object that contains the eth to usd eur and btc exchange rates on the day the fund was created
 * @param identifier tells the function which fx rate to use, both in dayZero and in timeline.references
 */
function prepareMonthlyReturns(
  timeline: MonthendTimelineItem[],
  dayZero: { ethbtc: number; ethusd: number; etheur: number },
  comparisonCurrency: FxReference | undefined
) {
  if (!comparisonCurrency) {
    // the share price-only case
    return timeline.map((item: MonthendTimelineItem, index: number, arr: MonthendTimelineItem[]) => {
      if (index === 0) {
        return calculateReturn(item.calculations.price, 1);
      }
      return calculateReturn(item.calculations.price, arr[index - 1].calculations.price);
    });
  }
  // every other case
  return timeline.map((item, index, arr) => {
    if (index === 0) {
      return calculateReturn(item.references[comparisonCurrency], dayZero[comparisonCurrency]);
    }
    return calculateReturn(
      item.references[comparisonCurrency] * item.calculations.price, // current fx price times current share price
      arr[index - 1].references[comparisonCurrency] * arr[index - 1].calculations.price // one month back's fx price times share price
    );
  });
}

export const FundTDReturns: React.FC<FundTDReturnsProps> = (address) => {
  const today = React.useMemo(() => new Date(), []);
  const fund = useFund();

  const [comparisonCurrency, setComparisonCurrency] = React.useState<FxReference>(undefined);

  const fundInceptionDate = findCorrectFromTime(fund.creationTime!);
  const monthStartDate = startOfMonth(today);
  const quarterStartDate = startOfQuarter(today);
  const yearStartDate = startOfYear(today);
  const toToday = findCorrectToTime(today);
  const fxAtInception = { ethbtc: 1, ethusd: 2, etheur: 1.9 }; // This'll be a UseMemo function with an empty deps array that queries the endpoint that gives us the VWAP of eth/eur btc usd by date

  const {
    data: historicalData,
    error: historicalDataError,
    isFetching: historicalDataFetching,
  } = useFetchFundPricesByDate(fund.address!, fundInceptionDate, toToday);

  const { data: monthlyData, error: monthlyError, isFetching: monthlyFetching } = useFetchMonthlyFundPrices(
    fund.address!
  );

  const monthlyReturns = React.useMemo(() => {
    return monthlyData?.data && prepareMonthlyReturns(monthlyData.data, fxAtInception, comparisonCurrency);
  }, [monthlyData]);

  if (!historicalData || historicalDataFetching || !monthlyData || monthlyFetching) {
    return (
      <Block>
        <Spinner />
      </Block>
    );
  }

  if (historicalDataError || monthlyError) {
    return (
      <Block>
        <>ERROR</>
      </Block>
    );
  }
  const mostRecentPrice = monthlyData?.data && monthlyData.data[monthlyData.data.length - 1].calculations.price;
  const quarterStartPrice = historicalData?.data.length && findSharePriceByDate(historicalData.data, quarterStartDate);
  const monthStartPrice = historicalData?.data.length && findSharePriceByDate(historicalData.data, monthStartDate);
  const yearStartPrice = isBefore(fundInceptionDate, yearStartDate)
    ? historicalData?.data.length && findSharePriceByDate(historicalData.data, yearStartDate)
    : 1;

  const qtdReturn = mostRecentPrice && quarterStartPrice && calculateReturn(mostRecentPrice, quarterStartPrice);
  const mtdReturn = mostRecentPrice && monthStartPrice && calculateReturn(mostRecentPrice, monthStartPrice);
  const ytdReturn = mostRecentPrice && yearStartPrice && calculateReturn(mostRecentPrice, 1);

  const bestMonth = monthlyReturns?.reduce((carry: BigNumber, current: BigNumber) => {
    if (current.isGreaterThan(carry)) {
      return current;
    }
    return carry;
  }, monthlyReturns[0]);

  const worstMonth = monthlyReturns?.reduce((carry: BigNumber, current: BigNumber) => {
    if (current.isLessThan(carry)) {
      return current;
    }
    return carry;
  }, monthlyReturns[0]);

  const monthlyWinLoss = monthlyReturns?.reduce(
    (carry: { win: number; lose: number }, current: BigNumber) => {
      if (current.isGreaterThanOrEqualTo(0)) {
        carry.win++;
        return carry;
      }

      carry.lose++;
      return carry;
    },
    { win: 0, lose: 0 }
  );

  const averageMonthlyReturn = average(monthlyReturns);

  const positiveMonthRatio = monthlyData && (monthlyWinLoss.win / (monthlyWinLoss.win + monthlyWinLoss.lose)) * 100;

  return (
    <Dictionary>
      <SectionTitle>Various Metrics (Share Price)</SectionTitle>
      <DictionaryEntry>
        <DictionaryLabel>MTD Return</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} value={mtdReturn} suffix={'%'} colorize={true} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>QTD Return</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} value={qtdReturn} suffix={'%'} colorize={true} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>YTD Return</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} value={ytdReturn} suffix={'%'} colorize={true} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Best Month</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} value={bestMonth} suffix={'%'} colorize={true} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Worst Month</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} value={worstMonth} suffix={'%'} colorize={true} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>% Months with Gain</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} value={positiveMonthRatio} suffix={'%'} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Average Monthly Return</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} value={averageMonthlyReturn} colorize={true} suffix={'%'} />
        </DictionaryData>
      </DictionaryEntry>
    </Dictionary>
  );
};
