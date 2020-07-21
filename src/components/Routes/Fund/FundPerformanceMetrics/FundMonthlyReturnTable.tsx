import * as React from 'react';
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
  subYears,
  format,
  differenceInCalendarMonths,
  startOfYear,
  differenceInCalendarYears,
  endOfYear,
  addMonths,
  differenceInCalendarDays,
} from 'date-fns';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { Button } from '~/components/Form/Button/Button';
import { useFund } from '~/hooks/useFund';
import { Block } from '~/storybook/Block/Block';
import { Spinner } from '~/storybook/Spinner/Spinner.styles';
import { Title, SectionTitle } from '~/storybook/Title/Title';
import { useFetchFundPricesByMonthEnd } from '~/hooks/metricsService/useFetchFundPricesByMonthEnd';
import { useFetchReferencePricesByDate } from '~/hooks/metricsService/useFetchReferencePricesByDate';
import { MonthlyReturnData, monthlyReturnsFromTimeline } from './FundMetricsUtilFunctions';
import { NotificationBar, NotificationContent } from '~/storybook/NotificationBar/NotificationBar';
import styled from 'styled-components';

export interface MonthlyReturnTableProps {
  address: string;
}

interface SelectItem {
  value: keyof MonthlyReturnData;
  label: string;
}

const potentialCurrencies: SelectItem[] = [
  { label: 'ETH', value: 'ETH' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'BTC', value: 'BTC' },
];

const TitleContainerWithButton = styled.div`
  border-bottom: ${(props) => props.theme.border.borderSecondary};
  margin-bottom: ${(props) => props.theme.spaceUnits.m};
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: 'baseline';
`;

export const FundMonthlyReturnTable: React.FC<MonthlyReturnTableProps> = ({ address }) => {
  const today = React.useMemo(() => new Date(), []);
  const fund = useFund();

  if (fund.creationTime && differenceInCalendarDays(today, fund.creationTime) < 7) {
    return (
      <Block>
        <SectionTitle>Monthly Returns</SectionTitle>
        <NotificationBar kind="neutral">
          <NotificationContent>Statistics are not available for funds younger than one week.</NotificationContent>
        </NotificationBar>
      </Block>
    );
  }

  const fundInception = fund.creationTime!;

  const activeYears =
    fund &&
    new Array(differenceInCalendarYears(today, fundInception) + 1)
      .fill(null)
      .map((item, index) => subYears(today, index))
      .reverse();

  const [selectedYear, setSelectedYear] = React.useState(activeYears[activeYears.length - 1].getFullYear());

  const { data: monthlyData, error: monthlyError, isFetching: monthlyFetching } = useFetchFundPricesByMonthEnd(address);

  const {
    data: fxAtInception,
    error: fxAtInceptionError,
    isFetching: fxAtInceptionFetching,
  } = useFetchReferencePricesByDate(fund.creationTime!);

  const monthsBeforeFund = differenceInCalendarMonths(fundInception, startOfYear(activeYears[0]));
  const monthsRemaining = differenceInCalendarMonths(endOfYear(today), today);
  const activeMonths = fund && differenceInCalendarMonths(today, fundInception) + 1;

  if (!monthlyData || monthlyFetching || !fxAtInception || fxAtInceptionFetching) {
    return (
      <Block>
        <SectionTitle>Monthly Returns</SectionTitle>
        <Spinner />
      </Block>
    );
  }

  if (monthlyError || fxAtInceptionError || monthlyData?.errors) {
    return <Block>ERROR</Block>;
  }

  const tableData: MonthlyReturnData =
    fund &&
    monthlyData &&
    fxAtInception &&
    monthlyReturnsFromTimeline(monthlyData.data, fxAtInception, today, activeMonths, monthsBeforeFund, monthsRemaining);

  const validDataLengthCheck = tableData && tableData.ETH.length === monthsBeforeFund + activeMonths + monthsRemaining;

  function toggleYear(direction: 'decrement' | 'increment') {
    if (direction === 'decrement') {
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedYear(selectedYear + 1);
    }
  }

  const months = new Array(12).fill(null).map((item, index) => {
    const january = startOfYear(today);
    return format(addMonths(january, index), 'MMM');
  });

  return (
    <Block>
      {validDataLengthCheck ? (
        <>
          <TitleContainerWithButton>
            <Title>{selectedYear} Monthly Returns </Title>
            {activeYears.length > 1 ? (
              <div>
                <Button
                  onClick={() => toggleYear('decrement')}
                  disabled={selectedYear == activeYears[0].getFullYear()}
                  size="extrasmall"
                  kind="secondary"
                >
                  {'<'}
                </Button>
                <Button
                  onClick={() => toggleYear('increment')}
                  disabled={selectedYear == activeYears[activeYears.length - 1].getFullYear()}
                  size="extrasmall"
                  kind="secondary"
                >
                  {'>'}
                </Button>
              </div>
            ) : null}
          </TitleContainerWithButton>
          <ScrollableTable>
            <Table>
              <tbody>
                <HeaderRow>
                  <HeaderCellRightAlign>{'             '}</HeaderCellRightAlign>
                  {months.map((month, index) => (
                    <HeaderCellRightAlign key={index}>{month}</HeaderCellRightAlign>
                  ))}
                </HeaderRow>
                {potentialCurrencies.map((ccy, index) => {
                  return (
                    <BodyRow key={index * Math.random()}>
                      <BodyCell>Return in {ccy.label}</BodyCell>
                      {tableData[ccy.value]!.filter((item) => item.date.getFullYear() === selectedYear).map(
                        (item, index) => (
                          <BodyCellRightAlign key={index}>
                            {item.return && !item.return.isNaN() ? (
                              <FormattedNumber suffix={'%'} value={item.return} decimals={2} colorize={true} />
                            ) : (
                              '-'
                            )}
                          </BodyCellRightAlign>
                        )
                      )}
                    </BodyRow>
                  );
                })}
              </tbody>
            </Table>
          </ScrollableTable>
        </>
      ) : (
        <NotificationBar kind="error">
          <NotificationContent>
            There is a known issue where funds created in February 2020 cannot query their monthly returns. This is a
            temporary error message while we fix this issue.
          </NotificationContent>
        </NotificationBar>
      )}
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
