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
export const FundTDReturns: React.FC<FundTDReturnsProps> = (address) => {
  const today = React.useMemo(() => new Date(), []);
  const fund = useFund();
  const fundInception = fund.creationTime!;

  const monthStartDate = findCorrectFromTime(startOfMonth(today));
  const quarterStartDate = findCorrectFromTime(startOfQuarter(today));
  const yearStartDate = findCorrectFromTime(startOfYear(today));
  const toToday = findCorrectToTime(today);

  const { data: fundMonthlyData, error: fundMonthlyError, isFetching: fundMonthlyFetching } = useFetchMonthlyFundPrices(
    fund.address!
  );

  const {
    data: fundLastMonthsData,
    error: fundLastMonthsError,
    isFetching: fundLastMonthsFetching,
  } = useFetchFundPricesByDate(fund.address!, monthStartDate, toToday);

  const {
    data: fundLastQuartersData,
    error: fundLastQuartersError,
    isFetching: fundLastQuartersFetching,
  } = useFetchFundPricesByDate(fund.address!, quarterStartDate, toToday);

  const {
    data: fundLastYearsData,
    error: fundLastYearsError,
    isFetching: fundLastYearsFetching,
  } = useFetchFundPricesByDate(fund.address!, yearStartDate, toToday);

  if (
    !fundLastMonthsData ||
    fundLastMonthsFetching ||
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
  const quarterStartPrice = fundLastQuartersData && fundLastQuartersData.data[0].calculations.price;
  const yearStartPrice = isBefore(fundInception, yearStartDate)
    ? fundLastYearsData && fundLastYearsData.data[0].calculations.price
    : 1;

  const qtdReturn = quarterStartPrice && calculateReturn(mostRecentPrice, quarterStartPrice);
  const ytdReturn = yearStartPrice && calculateReturn(mostRecentPrice, 1);
  const mtdReturn =
    fundLastMonthsData && calculateReturn(mostRecentPrice, fundLastMonthsData.data[0].calculations.price);

  const fundMonthlyReturns =
    fundMonthlyData &&
    fundMonthlyData.data.map((item: MetricsTimelineItem, index: number, arr: MetricsTimelineItem[]) => {
      if (index === 0) {
        return calculateReturn(item.calculations.price, 1);
      }
      return calculateReturn(item.calculations.price, arr[index - 1].calculations.price);
    });

  const bestMonth =
    fundMonthlyData &&
    fundMonthlyReturns.reduce((carry: BigNumber, current: BigNumber) => {
      if (current.isGreaterThan(carry)) {
        return current;
      }
      return carry;
    }, fundMonthlyReturns[0]);

  const worstMonth =
    fundMonthlyData &&
    fundMonthlyReturns.reduce((carry: BigNumber, current: BigNumber) => {
      if (current.isLessThan(carry)) {
        return current;
      }
      return carry;
    }, fundMonthlyReturns[0]);

  const monthlyWinLoss =
    fundMonthlyData &&
    fundMonthlyReturns.reduce(
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

  const positiveMonthRatio = (monthlyWinLoss.win / (monthlyWinLoss.win + monthlyWinLoss.lose)) * 100;

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
