import * as React from 'react';
import BigNumber from 'bignumber.js';
import { Table, HeaderCell, HeaderRow, BodyRow, BodyCell, ScrollableTable } from '~/storybook/Table/Table';
import {
  subMonths,
  subYears,
  format,
  differenceInCalendarMonths,
  startOfYear,
  differenceInCalendarYears,
  endOfMonth,
  endOfYear,
  addMonths,
  startOfMonth,
} from 'date-fns';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { useFund } from '~/hooks/useFund';
import { calculateReturn } from '~/utils/finance';
import { Block } from '~/storybook/Block/Block';
import { Spinner } from '~/storybook/Spinner/Spinner.styles';
import { SectionTitle } from '~/storybook/Title/Title';
import { useFetchMonthlyFundPrices, fetchMultipleIndexPrices } from './FundMetricsQueries';
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
  fx: {
    ethusd: number;
    etheur: number;
    ethbtc: number;
  };
  calculations: {
    price: number;
    gav: number;
    nav: number;
  };
}

interface DisplayData {
  label?: string;
  date: Date;
  return: BigNumber;
}

function assembleTableData(
  today: Date,
  activeMonths: number,
  monthsBeforeFund: number,
  monthsRemainingInYear: number,
  monthlyReturnData: DepthTimelineItem[],
  indexReturnData: BigNumber[][]
  // #TODO remove null types
): { eth: DisplayData[]; eur: DisplayData[] | null; usd: DisplayData[] | null; index: DisplayData[] } {
  const inactiveMonthReturns: DisplayData[] = new Array(monthsBeforeFund)
    .fill(null)
    .map((item, index: number) => {
      return { date: endOfMonth(subMonths(today, index + activeMonths)), return: new BigNumber('n/a') };
    })
    .reverse();

  const ethActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
    (item: DepthTimelineItem, index: number, arr: DepthTimelineItem[]) => {
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
    }
  );

  // const usdActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
  //   (item: DepthTimelineItem, index: number, arr: DepthTimelineItem[]) => {
  //     if (index === 0) {
  //       return {
  //         return: calculateReturn(new BigNumber(item.calculations.price / item.fx.ethusd), new BigNumber(1)),
  //         date: new Date(item.timestamp * 1000),
  //       };
  //     }
  //     return {
  //       return: calculateReturn(
  //         new BigNumber(item.calculations.price / item.fx.ethusd),
  //         new BigNumber(arr[index - 1].calculations.price / arr[index - 1].fx.ethusd)
  //       ),
  //       date: new Date(item.timestamp * 1000),
  //     };
  //   }
  // );

  // const eurActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
  //   (item: DepthTimelineItem, index: number, arr: DepthTimelineItem[]) => {
  //     if (index === 0) {
  //       return {
  //         return: calculateReturn(new BigNumber(item.calculations.price / item.fx.etheur), new BigNumber(1)),
  //         date: new Date(item.timestamp * 1000),
  //       };
  //     }
  //     return {
  //       return: calculateReturn(
  //         new BigNumber(item.calculations.price / item.fx.etheur),
  //         new BigNumber(arr[index - 1].calculations.price / arr[index - 1].fx.etheur)
  //       ),
  //       date: new Date(item.timestamp * 1000),
  //     };
  //   }
  // );

  const indexActiveMonthReturns: DisplayData[] = indexReturnData.map((item: any, index: number, arr: any[]) => {
    return {
      return: calculateReturn(item[0], item[item.length - 1]),
      date: endOfMonth(subMonths(today, index)),
    };
  });

  const remainingMonthReturns: DisplayData[] = new Array(monthsRemainingInYear)
    .fill(null)
    .map((item, index: number) => {
      return { date: endOfMonth(addMonths(today, index + 1)), return: new BigNumber('n/a') };
    });

  return {
    eth: inactiveMonthReturns.concat(ethActiveMonthReturns).concat(remainingMonthReturns),
    // usd: inactiveMonthReturns.concat(usdActiveMonthReturns).concat(remainingMonthReturns),
    // eur: inactiveMonthReturns.concat(eurActiveMonthReturns).concat(remainingMonthReturns),
    usd: null,
    eur: null,
    index: inactiveMonthReturns.concat(indexActiveMonthReturns).concat(remainingMonthReturns),
  };
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

  const [historicalIndexPrices, sethistoricalIndexPrices] = React.useState<BigNumber[][] | undefined>(undefined);

  const { data: monthlyData, error: monthlyError, isFetching: monthlyFetching } = useFetchMonthlyFundPrices(address);

  const monthsBeforeFund = differenceInCalendarMonths(fundInception, startOfYear(activeYears[0]));
  const activeMonths = fund && differenceInCalendarMonths(today, fundInception) + 1;
  const monthsRemainingInYear = differenceInCalendarMonths(endOfYear(today), today);

  const activeMonthDates = new Array(activeMonths)
    .fill(null)
    .map((item, index: number, arr: null[]) => {
      if (index === arr.length - 1) {
        const targetMonth = subMonths(today, index);
        return [fund.creationTime!, endOfMonth(targetMonth)] as [Date, Date];
      } else {
        const targetMonth = subMonths(today, index);
        return [startOfMonth(targetMonth), endOfMonth(targetMonth)] as [Date, Date];
      }
    })
    .reverse();

  React.useMemo(async () => {
    const prices = await fetchMultipleIndexPrices(activeMonthDates);
    sethistoricalIndexPrices(prices);
  }, [fund]);

  if (!monthlyData || monthlyFetching || !historicalIndexPrices) {
    return (
      <Block>
        <Spinner />
      </Block>
    );
  }

  const tableData =
    fund &&
    monthlyData &&
    assembleTableData(
      today,
      activeMonths,
      monthsBeforeFund,
      monthsRemainingInYear,
      monthlyData.data,
      historicalIndexPrices
    );
  console.log(historicalIndexPrices);
  function toggleYear() {
    if (selectedYear === 2020) {
      setSelectedYear(2019);
    } else {
      setSelectedYear(2020);
    }
  }

  return (
    <Block>
      <SectionTitle>{selectedYear} Monthly Returns (Share Price)</SectionTitle>
      {activeYears.length > 1 ? <Button onClick={toggleYear}>Switch Year</Button> : null}
      <ScrollableTable>
        <Table>
          <tbody>
            <HeaderRow>
              <HeaderCell></HeaderCell>
              {tableData &&
                tableData.eth
                  .filter((item) => item.date.getFullYear() === selectedYear)
                  .map((item, index) => <HeaderCell key={index}>{format(item.date, 'MMM')}</HeaderCell>)}
            </HeaderRow>
            <BodyRow>
              <BodyCell>Return vs ETH</BodyCell>
              {tableData.eth
                .filter((item) => item.date.getFullYear() === selectedYear)
                .map((item, index) => (
                  <BodyCell key={index}>
                    <FormattedNumber suffix={'%'} value={item.return} decimals={2} colorize={true} />
                  </BodyCell>
                ))}
            </BodyRow>
            <BodyRow>
              <BodyCell>Index Return</BodyCell>
              {tableData.index
                .filter((item) => item.date.getFullYear() === selectedYear)
                .map((item, index) => (
                  <BodyCell key={index}>
                    <FormattedNumber suffix={'%'} value={item.return} decimals={2} colorize={true} />
                  </BodyCell>
                ))}
            </BodyRow>
            {/* <BodyRow>
              {tableData.usd
                .filter((item) => item.date.getFullYear() === selectedYear)
                .map((item, index) => (
                  <BodyCell key={index}>
                    <FormattedNumber suffix={'%'} value={item.return} decimals={2} colorize={true} />
                  </BodyCell>
                ))}
            </BodyRow>
            <BodyRow>
              {tableData.eur
                .filter((item) => item.date.getFullYear() === selectedYear)
                .map((item, index) => (
                  <BodyCell key={index}>
                    <FormattedNumber suffix={'%'} value={item.return} decimals={2} colorize={true} />
                  </BodyCell>
                ))}
            </BodyRow> */}
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
