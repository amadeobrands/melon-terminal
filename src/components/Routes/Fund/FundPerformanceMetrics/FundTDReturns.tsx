import * as React from 'react';
import BigNumber from 'bignumber.js';
import { startOfYear, startOfMonth, startOfQuarter, isBefore } from 'date-fns';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { useFund } from '~/hooks/useFund';
import { calculateReturn } from '~/utils/finance';
import { Block } from '~/storybook/Block/Block';
import { Spinner } from '~/storybook/Spinner/Spinner.styles';
import { SectionTitle } from '~/storybook/Title/Title';
import { useFetchMonthlyFundPrices, useFetchFundPricesByDate, MetricsTimelineItem } from './FundMetricsQueries';
import { findCorrectFromTime, findCorrectToTime } from '~/utils/priceServiceDates';
import { Dictionary, DictionaryEntry, DictionaryLabel, DictionaryData } from '~/storybook/Dictionary/Dictionary';

export interface FundTDReturnsProps {
  address: string;
}

interface DisplayData {
  date: string;
  price: BigNumber;
}

const findDateInTimeline = (arr: MetricsTimelineItem[], date: Date) => {
  const startOfDay = findCorrectFromTime(date);
  const endOfDay = findCorrectToTime(date);
  const timelineItem = arr.reduce((carry, current) => {
    if (startOfDay < current.timestamp && current.timestamp < endOfDay) {
      return current;
    }
    return carry;
  }, arr[0]);

  return timelineItem;
};

export const FundTDReturns: React.FC<FundTDReturnsProps> = (address) => {
  const today = React.useMemo(() => new Date(), []);
  const fund = useFund();

  const fundInceptionDate = findCorrectFromTime(fund.creationTime!);
  const monthStartDate = findCorrectFromTime(startOfMonth(today));
  const quarterStartDate = findCorrectFromTime(startOfQuarter(today));
  const yearStartDate = findCorrectFromTime(startOfYear(today));
  const toToday = findCorrectToTime(today);

  const {
    data: fundHistoricalData,
    error: fundHistoricalError,
    isFetching: fundHistoricalFetching,
  } = useFetchFundPricesByDate(fund.address!, fundInceptionDate, toToday);

  const { data: monthlyData, error: monthlyError, isFetching: monthlyFetching } = useFetchMonthlyFundPrices(
    fund.address!
  );

  const { data: monthToDateData, error: monthToDateError, isFetching: monthToDateFetching } = useFetchFundPricesByDate(
    fund.address!,
    monthStartDate,
    toToday
  );

  const {
    data: quarterToDateData,
    error: quarterToDateError,
    isFetching: quarterToDateFetching,
  } = useFetchFundPricesByDate(fund.address!, quarterStartDate, toToday);

  const { data: yearToDateData, error: yearToDateError, isFetching: yearToDateFetching } = useFetchFundPricesByDate(
    fund.address!,
    yearStartDate,
    toToday
  );

  if (
    !monthToDateData ||
    monthToDateFetching ||
    !quarterToDateData ||
    quarterToDateFetching ||
    !yearToDateData ||
    yearToDateFetching ||
    !monthlyData ||
    monthlyFetching
  ) {
    return (
      <Block>
        <Spinner />
      </Block>
    );
  }

  // fundHistoricalDate is a bunch of timeline items. to find a specific date amongst them, you need to reduce
  // to find the data.timestamp that's between the 'from' time and the 'to time' of the date you're looking for
  // as generall all timestamps are done around 8utc
  // write a function that takes an array of TimeLineItems and a date and returns the timestamp

  const mostRecentPrice = monthlyData?.data && monthlyData.data[monthlyData.data.length - 1].calculations.price;

  const quarterStartPrice = quarterToDateData?.data.length && quarterToDateData.data[0].calculations.price;

  const yearStartPrice = isBefore(fundInceptionDate, yearStartDate)
    ? yearToDateData && yearToDateData.data[0].calculations.price
    : 1;

  const qtdReturn = mostRecentPrice && quarterStartPrice && calculateReturn(mostRecentPrice, quarterStartPrice);
  const ytdReturn = mostRecentPrice && yearStartPrice && calculateReturn(mostRecentPrice, 1);
  const mtdReturn =
    mostRecentPrice &&
    monthToDateData?.data.length &&
    calculateReturn(mostRecentPrice, monthToDateData.data[0].calculations.price);

  const monthlyReturns = monthlyData.data?.map(
    (item: MetricsTimelineItem, index: number, arr: MetricsTimelineItem[]) => {
      if (index === 0) {
        return calculateReturn(item.calculations.price, 1);
      }
      return calculateReturn(item.calculations.price, arr[index - 1].calculations.price);
    }
  );

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
    </Dictionary>
  );
};
