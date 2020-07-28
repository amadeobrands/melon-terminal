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
import { Spinner } from '~/storybook/Spinner/Spinner';
import { Title, SectionTitle } from '~/storybook/Title/Title';
import { useFetchFundPricesByMonthEnd } from '~/hooks/metricsService/useFetchFundPricesByMonthEnd';
import { useFetchReferencePricesByDate } from '~/hooks/metricsService/useFetchReferencePricesByDate';
import { MonthlyReturnData, monthlyReturnsFromTimeline } from './FundMetricsUtilFunctions';
import { NotificationBar, NotificationContent } from '~/storybook/NotificationBar/NotificationBar';
import styled from 'styled-components';
import { numberPadding } from '~/utils/numberPadding';

export interface MonthlyReturnTableProps {
  address: string;
}

interface SelectItem {
  value: keyof MonthlyReturnData['data'];
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

  const fundInception = fund.creationTime!;

  const activeYears = React.useMemo(() => {
    return new Array(differenceInCalendarYears(today, fundInception) + 1)
      .fill(null)
      .map((item, index) => subYears(today, index))
      .reverse();
  }, [fund]);

  const [selectedYear, setSelectedYear] = React.useState(today.getFullYear());

  const { data: monthlyData, error: monthlyError, isFetching: monthlyFetching } = useFetchFundPricesByMonthEnd(address);

  const {
    data: fxAtInception,
    error: fxAtInceptionError,
    isFetching: fxAtInceptionFetching,
  } = useFetchReferencePricesByDate(fund.creationTime!);

  const monthsBeforeFund = differenceInCalendarMonths(fundInception, startOfYear(activeYears[0]));
  const monthsRemaining = differenceInCalendarMonths(endOfYear(today), today);
  const activeMonths = fund && differenceInCalendarMonths(today, fundInception) + 1;

  const tableData: MonthlyReturnData | undefined = React.useMemo(() => {
    if (!monthlyData || !fxAtInception || !fund) {
      return undefined;
    }
    if (fund.creationTime && differenceInCalendarDays(today, fund.creationTime) < 7) {
      return undefined;
    }
    return monthlyReturnsFromTimeline(
      monthlyData.data,
      fxAtInception,
      today,
      activeMonths,
      monthsBeforeFund,
      monthsRemaining
    );
  }, [fund, monthlyData, fxAtInception]);

  const months = React.useMemo(() => {
    return new Array(12).fill(null).map((item, index) => {
      const january = startOfYear(today);
      return format(addMonths(january, index), 'MMM');
    });
  }, []);

  const validDataLengthCheck =
    tableData && tableData.data.ETH.length === monthsBeforeFund + activeMonths + monthsRemaining;

  function toggleYear(direction: 'decrement' | 'increment') {
    if (direction === 'decrement') {
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedYear(selectedYear + 1);
    }
  }

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

  if (!tableData) {
    return (
      <Block>
        <SectionTitle>Monthly Returns</SectionTitle>
        <Spinner />
      </Block>
    );
  }

  if (monthlyError || fxAtInceptionError || monthlyData?.errors) {
    return (
      <Block>
        <SectionTitle>Monthly Returns</SectionTitle>
        <NotificationBar kind="error">
          <NotificationContent>There was an unexpected error fetching fund data.</NotificationContent>
        </NotificationBar>
      </Block>
    );
  }

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
                      {tableData.data[ccy.value]!.filter((item) => item.date.getFullYear() === selectedYear).map(
                        (item, index) => (
                          <BodyCellRightAlign key={index}>
                            {item.return && !item.return.isNaN() ? (
                              <>
                                <span>
                                  {numberPadding(item.return.toPrecision(2).toString().length, tableData.maxDigits)}
                                </span>
                                <FormattedNumber suffix={'%'} value={item.return} decimals={2} colorize={true} />
                              </>
                            ) : (
                              <>
                                <span>{numberPadding(0, tableData.maxDigits + 3)}</span>
                                <span>-</span>
                              </>
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
        <>
          <SectionTitle>Monthly Returns</SectionTitle>
          <NotificationBar kind="error">
            <NotificationContent>
              There is a known issue where funds created in February 2020 cannot query their monthly returns. This is a
              temporary error message while we fix this issue.
            </NotificationContent>
          </NotificationBar>
        </>
      )}
    </Block>
  );
};
