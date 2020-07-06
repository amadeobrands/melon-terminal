import * as React from 'react';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';
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
  startOfMonth,
} from 'date-fns';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { useFund } from '~/hooks/useFund';
import { calculateReturn } from '~/utils/finance';
import { Block } from '~/storybook/Block/Block';
import { Spinner } from '~/storybook/Spinner/Spinner.styles';
import { SectionTitle, Title } from '~/storybook/Title/Title';
import { useFetchMonthlyFundPrices, fetchMultipleIndexPrices } from './FundMetricsQueries';
import { Button } from '~/components/Form/Button/Button';
import { CheckboxItem } from '~/components/Form/Checkbox/Checkbox';

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
  references: {
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

interface TableData {
  ETH: DisplayData[];
  EUR: DisplayData[];
  USD: DisplayData[];
  BITWISE10: DisplayData[];
  BTC: DisplayData[];
}
const CurrencyCheckbox = styled(CheckboxItem)`
  margin-left: ${(props) => props.theme.spaceUnits.s};
`;
const ControlContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`;

const YearContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 50%;
  justify-content: flex-start;
`;

const CheckBoxContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 50%;
  justify-content: flex-end;
`;

function assembleTableData(
  today: Date,
  activeMonths: number,
  monthsBeforeFund: number,
  monthlyReturnData: DepthTimelineItem[],
  indexReturnData: BigNumber[][]
): TableData {
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

  const usdActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
    (item: DepthTimelineItem, index: number, arr: DepthTimelineItem[]) => {
      if (index === 0) {
        return {
          return: new BigNumber('n/a'),
          date: new Date(item.timestamp * 1000),
        };
      }
      return {
        return: calculateReturn(
          new BigNumber(item.calculations.price * item.references.ethusd),
          new BigNumber(arr[index - 1].calculations.price * arr[index - 1].references.ethusd)
        ),
        date: new Date(item.timestamp * 1000),
      };
    }
  );

  const eurActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
    (item: DepthTimelineItem, index: number, arr: DepthTimelineItem[]) => {
      if (index === 0) {
        return {
          return: new BigNumber('n/a'),
          date: new Date(item.timestamp * 1000),
        };
      }
      return {
        // one eth worth of euros invested
        return: calculateReturn(
          new BigNumber(item.calculations.price * item.references.etheur),
          new BigNumber(arr[index - 1].calculations.price * arr[index - 1].references.etheur)
        ),
        date: new Date(item.timestamp * 1000),
      };
    }
  );

  const btcActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
    (item: DepthTimelineItem, index: number, arr: DepthTimelineItem[]) => {
      if (index === 0) {
        return {
          return: new BigNumber('n/a'),
          date: new Date(item.timestamp * 1000),
        };
      }
      return {
        // one eth worth of  invested
        return: calculateReturn(
          new BigNumber(item.calculations.price * item.references.ethbtc),
          new BigNumber(arr[index - 1].calculations.price * arr[index - 1].references.ethbtc)
        ),
        date: new Date(item.timestamp * 1000),
      };
    }
  );

  const indexActiveMonthReturns: DisplayData[] =
    usdActiveMonthReturns &&
    indexReturnData
      .map((item: any, index: number, arr: any[]) => {
        return {
          // gives the index's return over the month. I.e. a dollar invested in the index is now worth $1 + (1*return)
          return: item.length && calculateReturn(item[0], item[item.length - 1]),
        };
      })
      .map((item: { return: BigNumber }, index: number) => {
        return {
          // a dollar's return invested in the fund minus the index's return should be the difference
          return: usdActiveMonthReturns[index]?.return.minus(item.return),
          date: endOfMonth(subMonths(today, index)),
        };
      });

  return {
    ETH: inactiveMonthReturns.concat(ethActiveMonthReturns),
    USD: inactiveMonthReturns.concat(usdActiveMonthReturns),
    EUR: inactiveMonthReturns.concat(eurActiveMonthReturns),
    BTC: inactiveMonthReturns.concat(btcActiveMonthReturns),
    BITWISE10: inactiveMonthReturns.concat(indexActiveMonthReturns),
  };
}

export const FundMonthlyReturnTable: React.FC<MonthlyReturnTableProps> = ({ address }) => {
  const today = React.useMemo(() => new Date(), []);
  const fund = useFund();

  const potentialCurrencies: (keyof TableData)[] = ['ETH', 'BTC', 'USD', 'EUR', 'BITWISE10'];
  const [selectedCurrencies, setSelectedCurrencies] = React.useState<(keyof TableData)[]>(['ETH']);
  const [selectedYear, setSelectedYear] = React.useState(2020);

  const [historicalIndexPrices, sethistoricalIndexPrices] = React.useState<BigNumber[][] | undefined>(undefined);
  const { data: monthlyData, error: monthlyError, isFetching: monthlyFetching } = useFetchMonthlyFundPrices(address);

  const fundInception = fund.creationTime!;
  const activeYears =
    fund &&
    new Array(differenceInCalendarYears(today, fundInception) + 1)
      .fill(null)
      .map((item, index) => subYears(today, index))
      .reverse();
  const monthsBeforeFund = differenceInCalendarMonths(fundInception, startOfYear(activeYears[0]));
  const activeMonths = fund && differenceInCalendarMonths(today, fundInception) + 1;

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

  if (!monthlyData || monthlyFetching || !historicalIndexPrices || monthlyError) {
    return (
      <Block>
        <Spinner />
      </Block>
    );
  }

  const tableData: TableData =
    fund &&
    monthlyData &&
    historicalIndexPrices &&
    assembleTableData(today, activeMonths, monthsBeforeFund, monthlyData.data, historicalIndexPrices);

  function toggleYear(year: number) {
    setSelectedYear(year);
  }

  // TODO: Type this param correctly
  function handleCcyCheckbox(e: any) {
    if (e.target.checked) {
      const newSelectedCurrencies: (keyof TableData)[] = selectedCurrencies.concat([e.target.name]);
      setSelectedCurrencies(newSelectedCurrencies);
    } else {
      const newSelectedCurrencies = selectedCurrencies.filter((item) => item != e.target.name);
      setSelectedCurrencies(newSelectedCurrencies);
    }
  }

  return (
    <Block>
      <SectionTitle>{selectedYear} Monthly Returns </SectionTitle>
      <ControlContainer>
        <YearContainer>
          {activeYears.length > 1 &&
            activeYears.map((year) => {
              const yearNumber = year.getFullYear();
              return (
                <Button key={yearNumber * Math.random()} onClick={() => toggleYear(yearNumber)}>
                  {yearNumber}
                </Button>
              );
            })}
        </YearContainer>
        <CheckBoxContainer>
          <Title>Returns in: </Title>
          {potentialCurrencies.map((ccy) => {
            return (
              <CurrencyCheckbox
                key={ccy}
                onChange={(e) => handleCcyCheckbox(e)}
                checked={selectedCurrencies.includes(ccy)}
                label={ccy}
                value={ccy}
                name={ccy}
                touched={true}
              />
            );
          })}
        </CheckBoxContainer>
      </ControlContainer>
      <ScrollableTable>
        <Table>
          <tbody>
            <HeaderRow>
              <HeaderCell>{null}</HeaderCell>
              {tableData &&
                tableData.ETH.filter((item) => item.date.getFullYear() === selectedYear).map((item, index) => (
                  <HeaderCell key={index}>{format(item.date, 'MMM')}</HeaderCell>
                ))}
            </HeaderRow>
            {selectedCurrencies.map((ccy, index) => {
              return (
                <BodyRow key={index * Math.random()}>
                  <BodyCell>Return vs {ccy}</BodyCell>
                  {tableData[ccy]
                    .filter((item) => item.date.getFullYear() === selectedYear)
                    .map((item, index) => (
                      <BodyCell key={index}>
                        <FormattedNumber suffix={'%'} value={item.return} decimals={2} colorize={true} />
                      </BodyCell>
                    ))}
                </BodyRow>
              );
            })}
          </tbody>
        </Table>
      </ScrollableTable>
    </Block>
  );
};

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
