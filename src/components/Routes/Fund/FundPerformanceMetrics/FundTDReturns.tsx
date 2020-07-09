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
import { useQuery } from 'react-query';
import { useAsync } from 'react-use';

export interface FundTDReturnsProps {
  address: string;
}

interface HoldingPeriodReturns {
  ethReturns: BigNumber[];
  usdReturns: BigNumber[];
  eurReturns: BigNumber[];
  btcReturns: BigNumber[];
}

interface SelectItem {
  label: string;
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
      return calculateReturn(item.references.ethusd, dayZero.ethusd);
    }
    return calculateReturn(
      item.references.ethusd * item.calculations.price, // current fx price times current share price
      arr[index - 1].references.ethusd * arr[index - 1].calculations.price // one month back's fx price times share price
    );
  });

  const eurReturns = timeline.map((item, index, arr) => {
    if (index === 0) {
      return calculateReturn(item.references.ethusd, dayZero.etheur);
    }
    return calculateReturn(
      item.references.etheur * item.calculations.price, // current fx price times current share price
      arr[index - 1].references.etheur * arr[index - 1].calculations.price // one month back's fx price times share price
    );
  });

  const btcReturns = timeline.map((item, index, arr) => {
    if (index === 0) {
      return calculateReturn(item.references.ethbtc, dayZero.ethbtc);
    }
    return calculateReturn(
      item.references.ethbtc * item.calculations.price, // current fx price times current share price
      arr[index - 1].references.ethbtc * arr[index - 1].calculations.price // one month back's fx price times share price
    );
  });

  return { ethReturns: ethReturns, usdReturns: usdReturns, eurReturns: eurReturns, btcReturns: btcReturns };
}

export const FundTDReturns: React.FC<FundTDReturnsProps> = () => {
  const today = React.useMemo(() => new Date(), []);
  const fund = useFund();

  const comparisonCurrencies: SelectItem[] = [
    { label: 'ETH', value: 'ethReturns' },
    { label: 'BTC', value: 'btcReturns' },
    { label: 'EUR', value: 'eurReturns' },
    { label: 'USD', value: 'usdReturns' },
  ];

  const [selectedCurrency, setSelectedCurrency] = React.useState<SelectItem>(comparisonCurrencies[0]);

  const unselectedCurrencies = React.useMemo(() => {
    return comparisonCurrencies.filter((ccy) => ccy.label !== selectedCurrency.label);
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

  const mostRecentPrice = monthlyData?.data && monthlyData.data[monthlyData.data.length - 1].calculations.price;
  const quarterStartPrice = historicalData?.data.length && findSharePriceByDate(historicalData.data, quarterStartDate);
  const monthStartPrice = historicalData?.data.length && findSharePriceByDate(historicalData.data, monthStartDate);
  const yearStartPrice = isBefore(fundInceptionDate, yearStartDate)
    ? historicalData?.data.length && findSharePriceByDate(historicalData.data, yearStartDate)
    : 1;

  const qtdReturn = mostRecentPrice && quarterStartPrice && calculateReturn(mostRecentPrice, quarterStartPrice);
  const mtdReturn = mostRecentPrice && monthStartPrice && calculateReturn(mostRecentPrice, monthStartPrice);
  const ytdReturn = mostRecentPrice && yearStartPrice && calculateReturn(mostRecentPrice, 1);

  const bestMonth = monthlyReturns?.[selectedCurrency.value].reduce((carry: BigNumber, current: BigNumber) => {
    if (current.isGreaterThan(carry)) {
      return current;
    }
    return carry;
  }, monthlyReturns[selectedCurrency.value][0]);

  const worstMonth = monthlyReturns?.[selectedCurrency.value].reduce((carry: BigNumber, current: BigNumber) => {
    if (current.isLessThan(carry)) {
      return current;
    }
    return carry;
  }, monthlyReturns[selectedCurrency.value][0]);

  const monthlyWinLoss = monthlyReturns?.[selectedCurrency.value].reduce(
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

  const averageMonthlyReturn = monthlyReturns && average(monthlyReturns[selectedCurrency.value]);

  const positiveMonthRatio = monthlyWinLoss && (monthlyWinLoss.win / (monthlyWinLoss.win + monthlyWinLoss.lose)) * 100;

  function toggleCurrencySelection(value: keyof HoldingPeriodReturns) {
    if (!value) {
      return;
    }
    const newCurrency = comparisonCurrencies.filter((item) => item.value == value)[0];
    setSelectedCurrency(newCurrency);
  }

  return (
    <Dictionary>
      <SectionTitle>Various Metrics (Share Price)</SectionTitle>
      <SelectWidget
        name="Comparison Currency"
        placeholder="Select a currency to view returns"
        options={unselectedCurrencies}
        onChange={(value) => value && toggleCurrencySelection((value as any).value)}
        value={null}
      />
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
