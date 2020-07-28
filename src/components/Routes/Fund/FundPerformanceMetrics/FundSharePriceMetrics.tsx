import * as React from 'react';
import BigNumber from 'bignumber.js';
import { startOfYear, startOfMonth, startOfQuarter, isBefore, subDays, differenceInCalendarDays } from 'date-fns';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { useFund } from '~/hooks/useFund';
import {
  useFetchFundPricesByMonthEnd,
  MonthendTimelineItem,
} from '~/hooks/metricsService/useFetchFundPricesByMonthEnd';
import { useFetchFundPricesByRange, RangeTimelineItem } from '~/hooks/metricsService/useFetchFundPricesByRange';
import { useFetchReferencePricesByDate } from '~/hooks/metricsService/useFetchReferencePricesByDate';
import { monthlyReturnsFromTimeline, DisplayData } from './FundMetricsUtilFunctions';
import { SelectField } from '~/components/Form/Select/Select';
import { DictionaryEntry, DictionaryLabel, DictionaryData } from '~/storybook/Dictionary/Dictionary';
import { SectionTitle } from '~/storybook/Title/Title.styles';
import { NotificationBar, NotificationContent } from '~/storybook/NotificationBar/NotificationBar';
import { Tooltip } from '~/storybook/Tooltip/Tooltip';
import { Block } from '~/storybook/Block/Block';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { Title } from '~/storybook/Title/Title';
import { findCorrectFromTime, findCorrectToTime } from '~/utils/priceServiceDates';
import { calculateReturn, average, calculateVolatility } from '~/utils/finance';
import styled from 'styled-components';

export interface FundSharePriceMetricsProps {
  address: string;
}

interface HoldingPeriodReturns {
  ETH: BigNumber[];
  USD: BigNumber[];
  EUR: BigNumber[];
  BTC: BigNumber[];
}

interface SelectItem {
  label: keyof HoldingPeriodReturns;
  value: keyof HoldingPeriodReturns;
}

const CurrencySelect = styled.div`
  min-width: 100px;
  float: left;
  margin-bottom: 5px;
`;

const TitleContainerWithSelect = styled.div`
  border-bottom: ${(props) => props.theme.border.borderSecondary};
  margin-bottom: ${(props) => props.theme.spaceUnits.m};
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: flex-end;
`;

const BlockWithSelect = styled(Block)`
  padding-top: ${(props) => props.theme.spaceUnits.xs};
`;

function findTimeLineItemByDate(timeline: MonthendTimelineItem[], date: Date) {
  const startOfDay = findCorrectFromTime(date);
  const endOfDay = findCorrectToTime(date);
  const targetDate = timeline.reduce((carry, current) => {
    if (startOfDay < current.timestamp && current.timestamp < endOfDay) {
      return current;
    }
    return carry;
  }, timeline[0]);
  return targetDate;
}

function calculateSharePricesFromTimelineItem(item: MonthendTimelineItem) {
  const usd = item.calculations.price * item.references.ethusd;
  const eur = item.calculations.price * item.references.etheur;
  const btc = item.calculations.price * item.references.ethbtc;
  return {
    ETH: item.calculations.price,
    USD: usd,
    EUR: eur,
    BTC: btc,
  };
}

const comparisonCurrencies: SelectItem[] = [
  { label: 'ETH', value: 'ETH' },
  { label: 'BTC', value: 'BTC' },
  { label: 'EUR', value: 'EUR' },
  { label: 'USD', value: 'USD' },
];

export const FundSharePriceMetrics: React.FC<FundSharePriceMetricsProps> = (props) => {
  const today = React.useMemo(() => new Date(), []);
  const fund = useFund();

  const [selectedCurrency, setSelectedCurrency] = React.useState<SelectItem>(comparisonCurrencies[0]);

  const fundInceptionDate = findCorrectFromTime(fund.creationTime!);
  const monthStartDate = subDays(startOfMonth(today), 1);
  const quarterStartDate = subDays(startOfQuarter(today), 1);
  const yearStartDate = subDays(startOfYear(today), 1);
  const toToday = findCorrectToTime(today);

  const {
    data: historicalData,
    error: historicalDataError,
    isFetching: historicalDataFetching,
  } = useFetchFundPricesByRange(fund.address!, fundInceptionDate, toToday);

  const { data: monthlyData, error: monthlyError, isFetching: monthlyFetching } = useFetchFundPricesByMonthEnd(
    fund.address!
  );

  const {
    data: fxAtInception,
    error: fxAtInceptionError,
    isFetching: fxAtInceptionFetching,
  } = useFetchReferencePricesByDate(fund.creationTime!);

  const {
    data: fxAtMonthStart,
    error: fxAtMonthStartError,
    isFetching: fxAtMonthStartFetching,
  } = useFetchReferencePricesByDate(monthStartDate);

  const {
    data: fxAtQuarterStart,
    error: fxAtQuarterStartError,
    isFetching: fxAtQuarterStartFetching,
  } = useFetchReferencePricesByDate(quarterStartDate);

  const {
    data: fxAtYearStart,
    error: fxAtYearStartError,
    isFetching: fxAtYearStartFetching,
  } = useFetchReferencePricesByDate(yearStartDate);

  const monthlyReturns = React.useMemo(() => {
    return monthlyData?.data && fxAtInception && monthlyReturnsFromTimeline(monthlyData.data, fxAtInception);
  }, [monthlyData?.data, fxAtInception]);

  const sharePriceByDate = React.useMemo(() => {
    return {
      random: {},
      mostRecent: {
        ETH: monthlyData?.data && monthlyData.data[monthlyData.data.length - 1].calculations.price,
        USD:
          monthlyData?.data &&
          monthlyData.data[monthlyData.data.length - 1].references.ethusd *
            monthlyData.data[monthlyData.data.length - 1].calculations.price,
        EUR:
          monthlyData?.data &&
          monthlyData.data[monthlyData.data.length - 1].references.etheur *
            monthlyData.data[monthlyData.data.length - 1].calculations.price,
        BTC:
          monthlyData?.data &&
          monthlyData.data[monthlyData.data.length - 1].references.ethbtc *
            monthlyData.data[monthlyData.data.length - 1].calculations.price,
      },
      monthStart: {
        ETH:
          monthlyData?.data &&
          calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, monthStartDate)).ETH,
        USD:
          monthlyData?.data &&
          calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, monthStartDate)).USD,
        EUR:
          monthlyData?.data &&
          calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, monthStartDate)).EUR,
        BTC:
          monthlyData?.data &&
          calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, monthStartDate)).BTC,
      },
      quarterStart: {
        ETH:
          monthlyData?.data &&
          calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, quarterStartDate)).ETH,
        USD:
          monthlyData?.data &&
          calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, quarterStartDate)).USD,
        EUR:
          monthlyData?.data &&
          calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, quarterStartDate)).EUR,
        BTC:
          monthlyData?.data &&
          calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, quarterStartDate)).BTC,
      },
      yearStart: {
        ETH:
          monthlyData?.data && isBefore(yearStartDate, fundInceptionDate)
            ? calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, yearStartDate)).ETH
            : 1,
        USD:
          monthlyData?.data && isBefore(yearStartDate, fundInceptionDate)
            ? calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, yearStartDate)).USD
            : fxAtInception?.ethusd,
        EUR:
          monthlyData?.data && isBefore(yearStartDate, fundInceptionDate)
            ? calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, yearStartDate)).EUR
            : fxAtInception?.etheur,
        BTC:
          monthlyData?.data && isBefore(yearStartDate, fundInceptionDate)
            ? calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, yearStartDate)).BTC
            : fxAtInception?.ethbtc,
      },
    };
  }, [monthlyData, historicalData, fxAtMonthStart, fxAtQuarterStart, fxAtYearStart, fxAtInception]);

  const mostRecentPrice = sharePriceByDate.mostRecent[selectedCurrency.value];
  const quarterStartPrice = sharePriceByDate.quarterStart[selectedCurrency.value];
  const monthStartPrice = sharePriceByDate.monthStart[selectedCurrency.value];
  const yearStartPrice = sharePriceByDate.yearStart[selectedCurrency.value];

  const qtdReturn = mostRecentPrice && quarterStartPrice && calculateReturn(mostRecentPrice, quarterStartPrice);
  const mtdReturn = mostRecentPrice && monthStartPrice && calculateReturn(mostRecentPrice, monthStartPrice);
  const ytdReturn = mostRecentPrice && yearStartPrice && calculateReturn(mostRecentPrice, yearStartPrice);

  const bestMonth = React.useMemo(() => {
    return monthlyReturns?.data[selectedCurrency.value].reduce((carry: DisplayData, current: DisplayData) => {
      if (current.return.isGreaterThan(carry.return)) {
        return current;
      }
      return carry;
    }, monthlyReturns.data[selectedCurrency.value][0]);
  }, [monthlyReturns, selectedCurrency]);

  const worstMonth = React.useMemo(() => {
    return monthlyReturns?.data[selectedCurrency.value].reduce((carry: DisplayData, current: DisplayData) => {
      if (current.return.isLessThan(carry.return)) {
        return current;
      }
      return carry;
    }, monthlyReturns.data[selectedCurrency.value][0]);
  }, [monthlyReturns, selectedCurrency]);

  const monthlyWinLoss = React.useMemo(() => {
    return (
      monthlyReturns?.data[selectedCurrency.value].reduce(
        (carry: { win: number; lose: number }, current: DisplayData) => {
          if (current.return.isGreaterThanOrEqualTo(0)) {
            carry.win++;
            return carry;
          }
          carry.lose++;
          return carry;
        },
        { win: 0, lose: 0 }
      ) || { win: 0, lose: 0 }
    );
  }, [monthlyReturns, selectedCurrency]);

  const averageMonthlyReturn = React.useMemo(() => {
    return monthlyReturns && average(monthlyReturns.data[selectedCurrency.value].map((month) => month.return));
  }, [monthlyReturns, selectedCurrency]);

  const volSampleTime =
    differenceInCalendarDays(today, fund.creationTime!) > 20 ? 20 : differenceInCalendarDays(today, fund.creationTime!);

  const sampleVol = React.useMemo(() => {
    return (
      historicalData &&
      volSampleTime &&
      calculateVolatility(
        historicalData.data
          .slice(volSampleTime, historicalData.data.length - 1)
          .map((item: RangeTimelineItem) => new BigNumber(item.calculations.price))
      )
    );
  }, [volSampleTime, historicalData]);

  function toggleCurrencySelection(value: keyof HoldingPeriodReturns) {
    if (!value) {
      return;
    }
    const newCurrency = comparisonCurrencies.filter((item) => item.value == value)[0];
    setSelectedCurrency(newCurrency);
  }

  if (fund.creationTime && differenceInCalendarDays(today, fund.creationTime) < 7) {
    return (
      <Block>
        <SectionTitle>Share Price Metrics</SectionTitle>
        <NotificationBar kind="neutral">
          <NotificationContent>Statistics are not available for funds younger than one week.</NotificationContent>
        </NotificationBar>
      </Block>
    );
  }

  if (
    historicalDataError ||
    monthlyError ||
    fxAtInceptionError ||
    fxAtMonthStartError ||
    fxAtQuarterStartError ||
    fxAtYearStartError ||
    monthlyData?.errors?.length
  ) {
    return (
      <Block>
        <SectionTitle>Share Price Metrics</SectionTitle>
        <NotificationBar kind="error">
          <NotificationContent>There was an unexpected error fetching fund data.</NotificationContent>
        </NotificationBar>
      </Block>
    );
  }

  if (
    !historicalData ||
    historicalDataFetching ||
    !monthlyData ||
    monthlyFetching ||
    !fxAtInception ||
    fxAtInceptionFetching ||
    !fxAtMonthStart ||
    fxAtMonthStartFetching ||
    !fxAtQuarterStart ||
    fxAtQuarterStartFetching ||
    !fxAtYearStart ||
    fxAtYearStartFetching
  ) {
    return (
      <Block>
        <SectionTitle>Share Price Metrics</SectionTitle>
        <Spinner />
      </Block>
    );
  }

  return (
    <BlockWithSelect>
      <TitleContainerWithSelect>
        <Title>Share Price Metrics</Title>{' '}
        <CurrencySelect>
          <SelectField
            name="Comparison Currency"
            defaultValue={selectedCurrency}
            options={comparisonCurrencies}
            onChange={(value) => value && toggleCurrencySelection((value as any).value)}
          />
        </CurrencySelect>
      </TitleContainerWithSelect>

      <DictionaryEntry>
        <DictionaryLabel>MTD</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} value={mtdReturn} suffix={'%'} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>QTD</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          {qtdReturn ? <FormattedNumber decimals={2} value={qtdReturn} suffix={'%'} /> : '...loading'}
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>YTD</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          {ytdReturn ? <FormattedNumber decimals={2} value={ytdReturn} suffix={'%'} /> : '...loading'}
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Best Month</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          {bestMonth ? <FormattedNumber decimals={2} value={bestMonth.return} suffix={'%'} /> : '...loading'}
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Worst Month</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          {worstMonth ? <FormattedNumber decimals={2} value={worstMonth?.return} suffix={'%'} /> : '...loading'}
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Average Month</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          {averageMonthlyReturn ? (
            <FormattedNumber decimals={2} value={averageMonthlyReturn} suffix={'%'} />
          ) : (
            '...loading'
          )}
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Positive Months</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber
            value={(monthlyWinLoss.win / (monthlyWinLoss.win + monthlyWinLoss.lose)) * 100}
            suffix={'%'}
            decimals={2}
          />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Track Record</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber value={monthlyWinLoss.win + monthlyWinLoss.lose} decimals={0} /> months
        </DictionaryData>
      </DictionaryEntry>
      <Tooltip placement="auto" value={`${volSampleTime}-day volatility of fund share price in ETH`}>
        <DictionaryEntry>
          <DictionaryLabel>Volatility</DictionaryLabel>
          <DictionaryData textAlign={'right'}>
            {sampleVol ? <FormattedNumber decimals={2} value={sampleVol} suffix={'%'} /> : '...loading'}
          </DictionaryData>
        </DictionaryEntry>
      </Tooltip>
    </BlockWithSelect>
  );
};
