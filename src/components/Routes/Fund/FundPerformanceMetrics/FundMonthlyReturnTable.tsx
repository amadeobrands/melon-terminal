import * as React from 'react';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import {
  Table,
  HeaderRow,
  BodyRow,
  BodyCell,
  ScrollableTable,
  BodyCellRightAlign,
  HeaderCellRightAlign,
} from '~/storybook/Table/Table';
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
  getMonth,
  addMonths,
} from 'date-fns';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { useFund } from '~/hooks/useFund';
import { calculateReturn } from '~/utils/finance';
import { Block } from '~/storybook/Block/Block';
import { Spinner } from '~/storybook/Spinner/Spinner.styles';
import { SectionTitle, Title } from '~/storybook/Title/Title';
import {
  useFetchMonthlyFundPrices,
  fetchMultipleIndexPrices,
  MonthlyReturnData,
  useFetchReferencePricesByDate,
  monthlyReturnsFromTimeline,
} from './FundMetricsQueries';
import { Button } from '~/components/Form/Button/Button';
import { SelectWidget } from '~/components/Form/Select/Select';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { SectionTitleContainer } from '~/storybook/Title/Title.styles';
import { useAsync } from 'react-use';

export interface MonthlyReturnTableProps {
  address: string;
}

interface SelectItem {
  value: keyof MonthlyReturnData;
  label: string;
}

export const FundMonthlyReturnTable: React.FC<MonthlyReturnTableProps> = ({ address }) => {
  const today = React.useMemo(() => new Date(), []);
  const fund = useFund();

  const potentialCurrencies: SelectItem[] = [
    { label: 'ETH', value: 'ETH' },
    { label: 'BTC', value: 'BTC' },
    { label: 'EUR', value: 'EUR' },
    { label: 'USD', value: 'USD' },
    { label: 'BITWISE10', value: 'BITWISE10' },
  ];

  // Select management
  const [selectedCurrencies, setSelectedCurrencies] = React.useState<(keyof MonthlyReturnData)[]>([
    potentialCurrencies[0].value,
  ]);

  const unselectedCurrencies = React.useMemo(() => {
    return potentialCurrencies.filter((ccy) => !selectedCurrencies.includes(ccy.value));
  }, [selectedCurrencies]);

  // Display year state management
  const fundInception = fund.creationTime!;

  // find all years in which the fund has existed and put them in an array
  const activeYears =
    fund &&
    new Array(differenceInCalendarYears(today, fundInception) + 1)
      .fill(null)
      .map((item, index) => subYears(today, index))
      .reverse();

  // set state equal to current year
  const [selectedYear, setSelectedYear] = React.useState(activeYears[activeYears.length - 1].getFullYear());

  // Data Fetching
  const [historicalIndexPrices, sethistoricalIndexPrices] = React.useState<BigNumber[][] | undefined>(undefined);
  const { data: monthlyData, error: monthlyError, isFetching: monthlyFetching } = useFetchMonthlyFundPrices(address);

  const {
    data: fxAtInception,
    error: fxAtInceptionError,
    isFetching: fxAtInceptionFetching,
  } = useFetchReferencePricesByDate(fund.creationTime!);

  const monthsBeforeFund = differenceInCalendarMonths(fundInception, startOfYear(activeYears[0]));
  const monthsRemaining = differenceInCalendarMonths(endOfYear(today), today);

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

  if (
    !monthlyData ||
    monthlyFetching ||
    !historicalIndexPrices ||
    monthlyError ||
    !fxAtInception ||
    fxAtInceptionFetching
  ) {
    return (
      <Block>
        <Spinner />
      </Block>
    );
  }

  const tableData: MonthlyReturnData =
    fund &&
    monthlyData &&
    historicalIndexPrices &&
    monthlyReturnsFromTimeline(
      monthlyData.data,
      fxAtInception,
      historicalIndexPrices,
      today,
      activeMonths,
      monthsBeforeFund,
      monthsRemaining
    );

  function toggleYear(direction: 'decrement' | 'increment') {
    if (direction === 'decrement') {
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedYear(selectedYear + 1);
    }
  }

  function toggleCurrencySelection(value: keyof MonthlyReturnData) {
    if (!value) {
      return;
    }
    if (selectedCurrencies.includes(value)) {
      setSelectedCurrencies(selectedCurrencies.filter((ccy) => ccy !== value));
    } else {
      setSelectedCurrencies(selectedCurrencies.concat([value]));
    }
  }
  const months = new Array(12).fill(null).map((item, index) => {
    const january = startOfYear(today);
    return format(addMonths(january, index), 'MMM');
  });

  return (
    <Block>
      <SectionTitleContainer>
        {activeYears.length > 1 && selectedYear !== activeYears[0].getFullYear() ? (
          <FaChevronLeft onClick={() => toggleYear('decrement')} />
        ) : null}
        <Title>{selectedYear} Monthly Returns </Title>
        {activeYears.length > 1 && selectedYear !== activeYears[activeYears.length - 1].getFullYear() ? (
          <FaChevronRight onClick={() => toggleYear('increment')} />
        ) : null}
      </SectionTitleContainer>

      <ScrollableTable>
        <Table>
          <tbody>
            <HeaderRow>
              <HeaderCellRightAlign>{'             '}</HeaderCellRightAlign>
              {months.map((month, index) => (
                <HeaderCellRightAlign key={index}>{month}</HeaderCellRightAlign>
              ))}
              <HeaderCellRightAlign>{null}</HeaderCellRightAlign>
            </HeaderRow>
            {selectedCurrencies.map((ccy, index) => {
              return (
                <BodyRow key={index * Math.random()}>
                  <BodyCell>
                    <Button
                      size="extrasmall"
                      onClick={() => {
                        toggleCurrencySelection(ccy);
                      }}
                    >
                      X
                    </Button>{' '}
                    <>Return in {ccy}</>
                  </BodyCell>
                  {tableData[ccy]!.filter((item) => item.date.getFullYear() === selectedYear).map((item, index) => (
                    <BodyCellRightAlign key={index}>
                      {item.return && !item.return.isNaN() ? (
                        <FormattedNumber suffix={'%'} value={item.return} decimals={2} colorize={true} />
                      ) : (
                        '-'
                      )}
                    </BodyCellRightAlign>
                  ))}
                  <BodyCell>
                    <Button
                      size="extrasmall"
                      onClick={() => {
                        toggleCurrencySelection(ccy);
                      }}
                    >
                      X
                    </Button>
                  </BodyCell>
                </BodyRow>
              );
            })}
          </tbody>
        </Table>
      </ScrollableTable>
      <SelectWidget
        name="Comparison Currency"
        placeholder="Select a currency to view returns"
        options={unselectedCurrencies}
        onChange={(value) => value && toggleCurrencySelection((value as any).value)}
        value={null}
      />
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
