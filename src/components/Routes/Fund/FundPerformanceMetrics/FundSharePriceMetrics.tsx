import * as React from 'react';
import BigNumber from 'bignumber.js';
import { startOfYear, startOfMonth, startOfQuarter, isBefore, subDays, differenceInCalendarDays } from 'date-fns';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { useFund } from '~/hooks/useFund';
import { calculateReturn, average, calculateVolatility } from '~/utils/finance';
import { Block } from '~/storybook/Block/Block';
import { Spinner } from '~/storybook/Spinner/Spinner.styles';
import { SectionTitle } from '~/storybook/Title/Title';
import {
  useFetchFundPricesByMonthEnd,
  MonthendTimelineItem,
} from '~/hooks/metricsService/useFetchFundPricesByMonthEnd';
import { useFetchFundPricesByRange, RangeTimelineItem } from '~/hooks/metricsService/useFetchFundPricesByRange';
import { useFetchReferencePricesByDate } from '~/hooks/metricsService/useFetchReferencePricesByDate';
import { monthlyReturnsFromTimeline, DisplayData } from './FundMetricsUtilFunctions';
import { findCorrectFromTime, findCorrectToTime } from '~/utils/priceServiceDates';
import { Dictionary, DictionaryEntry, DictionaryLabel, DictionaryData } from '~/storybook/Dictionary/Dictionary';
import { SelectWidget } from '~/components/Form/Select/Select';

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

  const [selectedCurrency, setSelectedCurrency] = React.useState<keyof HoldingPeriodReturns>(
    comparisonCurrencies[0].label
  );

  const unselectedCurrencies = React.useMemo(() => {
    return comparisonCurrencies.filter((ccy) => ccy.label !== selectedCurrency);
  }, [selectedCurrency]);

  if (fund.creationTime && differenceInCalendarDays(today, fund.creationTime) < 7) {
    return null;
  }

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
  }, [monthlyData]);

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
          monthlyData &&
          calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, monthStartDate)).ETH,
        USD:
          monthlyData &&
          calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, monthStartDate)).USD,
        EUR:
          monthlyData &&
          calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, monthStartDate)).EUR,
        BTC:
          monthlyData &&
          calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, monthStartDate)).BTC,
      },
      quarterStart: {
        ETH:
          monthlyData &&
          calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, quarterStartDate)).ETH,
        USD:
          monthlyData &&
          calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, quarterStartDate)).USD,
        EUR:
          monthlyData &&
          calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, quarterStartDate)).EUR,
        BTC:
          monthlyData &&
          calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, quarterStartDate)).BTC,
      },
      yearStart: {
        ETH:
          monthlyData && isBefore(yearStartDate, fundInceptionDate)
            ? calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, yearStartDate)).ETH
            : 1,
        USD:
          monthlyData && isBefore(yearStartDate, fundInceptionDate)
            ? calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, yearStartDate)).USD
            : fxAtInception?.ethusd,
        EUR:
          monthlyData && isBefore(yearStartDate, fundInceptionDate)
            ? calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, yearStartDate)).EUR
            : fxAtInception?.etheur,
        BTC:
          monthlyData && isBefore(yearStartDate, fundInceptionDate)
            ? calculateSharePricesFromTimelineItem(findTimeLineItemByDate(monthlyData.data, yearStartDate)).BTC
            : fxAtInception?.ethbtc,
      },
    };
  }, [monthlyData, historicalData, fxAtMonthStart, fxAtQuarterStart, fxAtYearStart, fxAtInception]);

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
        <Spinner />
      </Block>
    );
  }

  if (
    historicalDataError ||
    monthlyError ||
    fxAtInceptionError ||
    fxAtMonthStartError ||
    fxAtQuarterStartError ||
    fxAtYearStartError
  ) {
    return (
      <Block>
        <>ERROR</>
      </Block>
    );
  }

  const mostRecentPrice = sharePriceByDate.mostRecent[selectedCurrency];
  const quarterStartPrice = sharePriceByDate.quarterStart[selectedCurrency];
  const monthStartPrice = sharePriceByDate.monthStart[selectedCurrency];
  const yearStartPrice = sharePriceByDate.yearStart[selectedCurrency];

  const qtdReturn = mostRecentPrice && quarterStartPrice && calculateReturn(mostRecentPrice, quarterStartPrice);
  const mtdReturn = mostRecentPrice && monthStartPrice && calculateReturn(mostRecentPrice, monthStartPrice);
  const ytdReturn = mostRecentPrice && yearStartPrice && calculateReturn(mostRecentPrice, yearStartPrice);

  const bestMonth = monthlyReturns?.[selectedCurrency].reduce((carry: DisplayData, current: DisplayData) => {
    if (current.return.isGreaterThan(carry.return)) {
      return current;
    }
    return carry;
  }, monthlyReturns[selectedCurrency][0]);

  const worstMonth = monthlyReturns?.[selectedCurrency].reduce((carry: DisplayData, current: DisplayData) => {
    if (current.return.isLessThan(carry.return)) {
      return current;
    }
    return carry;
  }, monthlyReturns[selectedCurrency][0]);

  const monthlyWinLoss = monthlyReturns?.[selectedCurrency].reduce(
    (carry: { win: number; lose: number }, current: DisplayData) => {
      if (current.return.isGreaterThanOrEqualTo(0)) {
        carry.win++;
        return carry;
      }
      carry.lose++;
      return carry;
    },
    { win: 0, lose: 0 }
  );

  const averageMonthlyReturn = monthlyReturns && average(monthlyReturns[selectedCurrency].map((month) => month.return));
  const positiveMonthRatio = monthlyWinLoss && (monthlyWinLoss.win / (monthlyWinLoss.win + monthlyWinLoss.lose)) * 100;

  const volSampleTime =
    differenceInCalendarDays(today, fund.creationTime!) > 20 ? 20 : differenceInCalendarDays(today, fund.creationTime!);

  const sampleVol =
    historicalData &&
    calculateVolatility(
      historicalData.data
        .slice(volSampleTime, historicalData.data.length - 1)
        .map((item: RangeTimelineItem) => new BigNumber(item.calculations.price))
    );

  function toggleCurrencySelection(value: keyof HoldingPeriodReturns) {
    if (!value) {
      return;
    }
    const newCurrency = comparisonCurrencies.filter((item) => item.value == value)[0];
    setSelectedCurrency(newCurrency.value);
  }

  return (
    <Dictionary>
      <SectionTitle>Share Price Metrics in {selectedCurrency}</SectionTitle>

      <DictionaryEntry>
        <DictionaryLabel>MTD Return</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          <FormattedNumber decimals={2} value={mtdReturn} suffix={'%'} colorize={true} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>QTD Return</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          {qtdReturn ? <FormattedNumber decimals={2} value={qtdReturn} suffix={'%'} colorize={true} /> : '...loading'}
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>YTD Return</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          {ytdReturn ? <FormattedNumber decimals={2} value={ytdReturn} suffix={'%'} colorize={true} /> : '...loading'}
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Best Month</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          {bestMonth ? (
            <FormattedNumber decimals={2} value={bestMonth.return} suffix={'%'} colorize={true} />
          ) : (
            '...loading'
          )}
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Worst Month</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          {worstMonth ? (
            <FormattedNumber decimals={2} value={worstMonth?.return} suffix={'%'} colorize={true} />
          ) : (
            '...loading'
          )}
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>% Months with Gain</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          {positiveMonthRatio ? <FormattedNumber decimals={2} value={positiveMonthRatio} suffix={'%'} /> : '...loading'}
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Average Monthly Return</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          {averageMonthlyReturn ? (
            <FormattedNumber decimals={2} value={averageMonthlyReturn} colorize={true} suffix={'%'} />
          ) : (
            '...loading'
          )}
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>{volSampleTime}-day Return Volatility (of Share Price in ETH)</DictionaryLabel>
        <DictionaryData textAlign={'right'}>
          {sampleVol ? <FormattedNumber decimals={2} value={sampleVol} suffix={'%'} colorize={true} /> : '...loading'}
        </DictionaryData>
      </DictionaryEntry>
      <SelectWidget
        name="Comparison Currency"
        placeholder="Select a currency to view returns"
        options={unselectedCurrencies}
        onChange={(value) => value && toggleCurrencySelection((value as any).value)}
        value={null}
      />
    </Dictionary>
  );
};
