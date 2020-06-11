import * as React from 'react';
import BigNumber from 'bignumber.js';
import { Table, HeaderCell, HeaderRow, BodyRow, BodyCell, ScrollableTable } from '~/storybook/Table/Table';
import {
  subMonths,
  subYears,
  format,
  differenceInCalendarMonths,
  startOfYear,
  isBefore,
  differenceInCalendarYears,
  endOfMonth,
} from 'date-fns';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { useFund } from '~/hooks/useFund';
import { calculateReturn } from '~/utils/finance';
import { Block } from '~/storybook/Block/Block';
import { Spinner } from '~/storybook/Spinner/Spinner.styles';
import { SectionTitle } from '~/storybook/Title/Title';
import { useFetchMonthlyFundPrices } from './FundMetricsQueries';
import { InputWidget } from '~/components/Form/Input/Input';
import { CheckboxGroup } from '~/components/Form/CheckboxGroup/CheckboxGroup';
import { Button } from '~/components/Form/Button/Button';

export interface MonthlyReturnTableProps {
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

interface DisplayData {
  date: Date;
  return: BigNumber;
}

export const FundMonthlyReturnTable: React.FC<MonthlyReturnTableProps> = ({ address }) => {
  const today = React.useMemo(() => new Date(), []);
  const fund = useFund();
  const fundInception = fund.creationTime!;
  const activeYears =
    fund &&
    new Array(differenceInCalendarYears(today, fundInception) + 1)
      .fill(null)
      .map((item, index) => subYears(today, index))
      .reverse();

  const [selectedYear, setSelectedYear] = React.useState(2020);

  const activeMonths = fund && differenceInCalendarMonths(today, fundInception) + 1;

  const inactiveMonths = differenceInCalendarMonths(fundInception, startOfYear(activeYears[0]));

  const [historicalMonthlyIndexPrices, setHistoricalMonthlyIndexPrices] = React.useState<BigNumber[][] | undefined>(
    undefined
  );

  const { data: fundMonthlyData, error: fundMonthlyError, isFetching: fundMonthlyFetching } = useFetchMonthlyFundPrices(
    address
  );

  if (!fundMonthlyData || fundMonthlyFetching) {
    return (
      <Block>
        <Spinner />
      </Block>
    );
  }

  const activeMonthReturns: DisplayData[] =
    fund &&
    fundMonthlyData.data.map((item: DepthTimelineItem, index: number, arr: DepthTimelineItem[]) => {
      if (index === 0) {
        return {
          return: calculateReturn(new BigNumber(item.calculations.price), new BigNumber(1)),
          date: new Date(item.timestamp * 1000),
        };
      }
      return {
        return: calculateReturn(
          new BigNumber(item.calculations.price),
          new BigNumber(arr[index - 1].calculations.price)
        ),
        date: new Date(item.timestamp * 1000),
      };
    });

  // shows the months in a year before the fund was created
  const inactiveMonthReturns: DisplayData[] =
    fund &&
    new Array(inactiveMonths)
      .fill(null)
      .map((item, index: number) => {
        return { date: endOfMonth(subMonths(today, index + activeMonths)), return: new BigNumber('n/a') };
      })
      .reverse();

  function toggleYear() {
    if (selectedYear === 2020) {
      setSelectedYear(2019);
    } else {
      setSelectedYear(2020);
    }
  }

  const displayDataset = inactiveMonthReturns.concat(activeMonthReturns);

  return (
    <Block>
      <SectionTitle>{selectedYear} Monthly Returns (Share Price)</SectionTitle>
      {activeYears.length > 1 ? <Button onClick={toggleYear}>Switch Year</Button> : null}
      <ScrollableTable>
        <Table>
          <tbody>
            <HeaderRow>
              {displayDataset
                .filter((item) => item.date.getFullYear() === selectedYear)
                .map((item, index) => (
                  <HeaderCell key={index}>{format(item.date, 'MMM yyy')}</HeaderCell>
                ))}
            </HeaderRow>
            <BodyRow>
              {displayDataset
                .filter((item) => item.date.getFullYear() === selectedYear)
                .map((item, index) => (
                  <BodyCell key={index}>
                    <FormattedNumber suffix={'%'} value={item.return} decimals={2} colorize={true} />
                  </BodyCell>
                ))}
            </BodyRow>
          </tbody>
        </Table>
      </ScrollableTable>
    </Block>
  );
};

/**
 *
 *  Index query logic that we'll need later:
 *
 *
 *  const fundMonthDates = new Array(ageInMonths + 1)
 *    .fill(null)
 *    .map(item, index: number) => {
 *      const targetMonth = subMonths(today, index);
 *      return [startOfMonth(targetMonth), endOfMonth(targetMonth)] as [Date, Date];
 *    })
 *      .reverse()
 *
 *  React.useMemo(async () => {
 *    const prices = await fetchMultipleIndexPrices(fundMonthDates)
 *    setHistoricalMonthlyIndexPrices(prices)
 *  }, [fund])
 *
 *  const { data: indexData, error: indexError, isFetching: indexFetching } = useFetchIndexPrices(
 *    indexQueryStartDate,
 *    endOfDay(today).toISOString()
 *  ) // where indexQueryStartDate is something like => startOfDay(subDays(subWeeks(today, 1), 1)).toISOString();
 *
 */

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

{
  /* <DictionaryEntry>
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
      </DictionaryEntry> */
}
