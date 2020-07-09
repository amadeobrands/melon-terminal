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
  useFetchReferencePricesByDate,
} from './FundMetricsQueries';
import { findCorrectFromTime, findCorrectToTime } from '~/utils/priceServiceDates';
import { Dictionary, DictionaryEntry, DictionaryLabel, DictionaryData } from '~/storybook/Dictionary/Dictionary';
import { SelectWidget } from '~/components/Form/Select/Select';

export interface FundTDReturnsProps {
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
 * @param dayZero is an object that contains the eth/usd /eur and /btc exchange rates on the day the fund was created
 * @returns an object whose properties are arrays of BigNumbers that represent holding period returns in each denomination
 */

function prepareMonthlyReturns(
  timeline: MonthendTimelineItem[],
  dayZero: { ethbtc: number; ethusd: number; etheur: number }
): HoldingPeriodReturns {
  const ethReturns = timeline.map((item: MonthendTimelineItem, index: number, arr: MonthendTimelineItem[]) => {
    if (index === 0) {
      return calculateReturn(item.calculations.price, 1);
    }
    return calculateReturn(item.calculations.price, arr[index - 1].calculations.price);
  });

  const usdReturns = timeline.map((item, index, arr) => {
    if (index === 0) {
      return calculateReturn(item.references.ethusd * item.calculations.price, dayZero.ethusd);
    }
    return calculateReturn(
      item.references.ethusd * item.calculations.price, // current fx price times current share price
      arr[index - 1].references.ethusd * arr[index - 1].calculations.price // one month back's fx price times share price
    );
  });

  const eurReturns = timeline.map((item, index, arr) => {
    if (index === 0) {
      return calculateReturn(item.references.ethusd * item.calculations.price, dayZero.etheur);
    }
    return calculateReturn(
      item.references.etheur * item.calculations.price, // current fx price times current share price
      arr[index - 1].references.etheur * arr[index - 1].calculations.price // one month back's fx price times share price
    );
  });

  const btcReturns = timeline.map((item, index, arr) => {
    if (index === 0) {
      return calculateReturn(item.references.ethbtc * item.calculations.price, dayZero.ethbtc);
    }
    return calculateReturn(
      item.references.ethbtc * item.calculations.price, // current fx price times current share price
      arr[index - 1].references.ethbtc * arr[index - 1].calculations.price // one month back's fx price times share price
    );
  });

  return { ETH: ethReturns, USD: usdReturns, EUR: eurReturns, BTC: btcReturns };
}

export const FundTDReturns: React.FC<FundTDReturnsProps> = () => {
  const today = React.useMemo(() => new Date(), []);
  const fund = useFund();

  const comparisonCurrencies: SelectItem[] = [
    { label: 'ETH', value: 'ETH' },
    { label: 'BTC', value: 'BTC' },
    { label: 'EUR', value: 'EUR' },
    { label: 'USD', value: 'USD' },
  ];
  // selectedCurrency will dictate which asset prices are passed to the functions that compute returns

  const [selectedCurrency, setSelectedCurrency] = React.useState<keyof HoldingPeriodReturns>(
    comparisonCurrencies[0].label
  );

  const unselectedCurrencies = React.useMemo(() => {
    return comparisonCurrencies.filter((ccy) => ccy.label !== selectedCurrency);
  }, [selectedCurrency]);

  const fundInceptionDate = findCorrectFromTime(fund.creationTime!);
  const monthStartDate = startOfMonth(today);
  const quarterStartDate = startOfQuarter(today);
  const yearStartDate = startOfYear(today);
  const toToday = findCorrectToTime(today);

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

  const {
    data: historicalData,
    error: historicalDataError,
    isFetching: historicalDataFetching,
  } = useFetchFundPricesByDate(fund.address!, fundInceptionDate, toToday);

  const { data: monthlyData, error: monthlyError, isFetching: monthlyFetching } = useFetchMonthlyFundPrices(
    fund.address!
  );

  const monthlyReturns = React.useMemo(() => {
    return monthlyData?.data && fxAtInception && prepareMonthlyReturns(monthlyData.data, fxAtInception);
  }, [monthlyData]);

  const datePrices = React.useMemo(() => {
    return {
      mostRecent: {
        ETH: monthlyData?.data && monthlyData.data[monthlyData.data.length - 1].calculations.price,
        USD: monthlyData?.data && monthlyData.data[monthlyData.data.length - 1].references.ethusd,
        EUR: monthlyData?.data && monthlyData.data[monthlyData.data.length - 1].references.etheur,
        BTC: monthlyData?.data && monthlyData.data[monthlyData.data.length - 1].references.ethbtc,
      },
      monthStart: {
        ETH: historicalData?.data.length && findSharePriceByDate(historicalData.data, monthStartDate),
        USD:
          historicalData?.data.length &&
          fxAtMonthStart &&
          fxAtMonthStart.ethusd * findSharePriceByDate(historicalData.data, monthStartDate),
        EUR:
          historicalData?.data.length &&
          fxAtMonthStart &&
          fxAtMonthStart.etheur * findSharePriceByDate(historicalData.data, monthStartDate),
        BTC:
          historicalData?.data.length &&
          fxAtMonthStart &&
          fxAtMonthStart.ethbtc * findSharePriceByDate(historicalData.data, monthStartDate),
      },
      quarterStart: {
        ETH: historicalData?.data.length && findSharePriceByDate(historicalData.data, quarterStartDate),
        USD:
          historicalData?.data.length &&
          fxAtQuarterStart &&
          fxAtQuarterStart.ethusd * findSharePriceByDate(historicalData.data, quarterStartDate),
        EUR:
          historicalData?.data.length &&
          fxAtQuarterStart &&
          fxAtQuarterStart.etheur * findSharePriceByDate(historicalData.data, quarterStartDate),
        BTC:
          historicalData?.data.length &&
          fxAtQuarterStart &&
          fxAtQuarterStart.ethbtc * findSharePriceByDate(historicalData.data, quarterStartDate),
      },
      yearStart: {
        ETH:
          historicalData?.data.length && isBefore(fundInceptionDate, yearStartDate)
            ? historicalData?.data.length && findSharePriceByDate(historicalData.data, yearStartDate)
            : 1,
        USD:
          historicalData?.data.length && isBefore(fundInceptionDate, yearStartDate)
            ? fxAtYearStart && fxAtYearStart.ethusd
            : fxAtInception?.ethusd,
        EUR:
          historicalData?.data.length && isBefore(fundInceptionDate, yearStartDate)
            ? fxAtYearStart && fxAtYearStart.etheur
            : fxAtInception?.etheur,
        BTC:
          historicalData?.data.length && isBefore(fundInceptionDate, yearStartDate)
            ? fxAtYearStart && fxAtYearStart.ethbtc
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
    fxAtInceptionFetching
  ) {
    return (
      <Block>
        <Spinner />
      </Block>
    );
  }

  if (historicalDataError || monthlyError || fxAtInceptionError) {
    return (
      <Block>
        <>ERROR</>
      </Block>
    );
  }

  const mostRecentPrice = datePrices.mostRecent[selectedCurrency];
  const quarterStartPrice = datePrices.quarterStart[selectedCurrency];
  const monthStartPrice = datePrices.monthStart[selectedCurrency];
  const yearStartPrice = datePrices.yearStart[selectedCurrency];
  const qtdReturn = mostRecentPrice && quarterStartPrice && calculateReturn(mostRecentPrice, quarterStartPrice);
  const mtdReturn = mostRecentPrice && monthStartPrice && calculateReturn(mostRecentPrice, monthStartPrice);
  const ytdReturn = mostRecentPrice && yearStartPrice && calculateReturn(mostRecentPrice, yearStartPrice);

  const bestMonth = monthlyReturns?.[selectedCurrency].reduce((carry: BigNumber, current: BigNumber) => {
    if (current.isGreaterThan(carry)) {
      return current;
    }
    return carry;
  }, monthlyReturns[selectedCurrency][0]);

  const worstMonth = monthlyReturns?.[selectedCurrency].reduce((carry: BigNumber, current: BigNumber) => {
    if (current.isLessThan(carry)) {
      return current;
    }
    return carry;
  }, monthlyReturns[selectedCurrency][0]);

  const monthlyWinLoss = monthlyReturns?.[selectedCurrency].reduce(
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

  console.log(monthlyWinLoss);

  const averageMonthlyReturn = monthlyReturns && average(monthlyReturns[selectedCurrency]);

  const positiveMonthRatio = monthlyWinLoss && (monthlyWinLoss.win / (monthlyWinLoss.win + monthlyWinLoss.lose)) * 100;

  function toggleCurrencySelection(value: keyof HoldingPeriodReturns) {
    if (!value) {
      return;
    }
    const newCurrency = comparisonCurrencies.filter((item) => item.value == value)[0];
    setSelectedCurrency(newCurrency.value);
  }

  return (
    <Dictionary>
      <SectionTitle>Various Metrics in {selectedCurrency} (Share Price)</SectionTitle>

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
