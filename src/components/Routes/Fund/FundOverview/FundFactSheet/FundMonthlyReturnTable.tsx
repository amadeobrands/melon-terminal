import * as React from 'react';
import BigNumber from 'bignumber.js';
import { Table, HeaderCell, HeaderRow, BodyRow, BodyCell } from '~/storybook/Table/Table';
import { subMonths, format, differenceInCalendarMonths, startOfYear } from 'date-fns';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { useFund } from '~/hooks/useFund';
import { useQuery } from 'react-query';
import { calculateReturn } from '~/utils/finance';
import { Block } from '~/storybook/Block/Block';
import { Spinner } from '~/storybook/Spinner/Spinner.styles';
import { SectionTitle } from '~/storybook/Title/Title';

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
  date: string;
  price: BigNumber;
}

async function fetchMonthlyFundPrices(key: string, address: string) {
  const url = process.env.MELON_METRICS_API;
  const queryAddress = `${url}/api/monthend?address=${address}`;
  const response = await fetch(queryAddress)
    .then((response) => response.json())
    .catch((error) => console.log(error));
  return response;
}

function useFetchMonthlyFundPrices(fund: string) {
  const address = React.useMemo(() => fund.toLowerCase(), [fund]);
  return useQuery(['prices', address], fetchMonthlyFundPrices, {
    refetchOnWindowFocus: false,
  });
}

export default function FundMonthlyReturnTable(props: MonthlyReturnTableProps) {
  const today = React.useMemo(() => new Date(), []);
  const fund = useFund();
  const fundInception = fund.creationTime!;
  const activeMonths = differenceInCalendarMonths(today, fundInception);
  const inactiveMonths = differenceInCalendarMonths(fundInception, startOfYear(today));
  console.log('inactive months: ', inactiveMonths);

  const { data: fundMonthlyData, error: fundMonthlyError, isFetching: fundMonthlyFetching } = useFetchMonthlyFundPrices(
    props.address
  );

  if (!fundMonthlyData || fundMonthlyFetching) {
    return (
      <Block>
        <Spinner />
      </Block>
    );
  }

  // create two arrays of objects and append one to the other. first one is all months in 2020 prior to fund inception.
  // find length of that array by declaring the beginning of the year, then taking difference in calendar months
  // put the month on an object with the corresponding return
  const activeMonthReturns: DisplayData[] = fundMonthlyData.data.map(
    (item: DepthTimelineItem, index: number, arr: DepthTimelineItem[]) => {
      if (index === 0) {
        return {
          price: calculateReturn(new BigNumber(1), new BigNumber(item.calculations.price)),
          date: format(item.timestamp * 1000, 'MMM yyy'),
        };
      }
      return {
        price: calculateReturn(
          new BigNumber(item.calculations.price),
          new BigNumber(arr[index - 1].calculations.price)
        ),
        date: format(item.timestamp * 1000, 'MMM yyy'),
      };
    }
  );

  const inactiveMonthReturns: DisplayData[] = new Array(inactiveMonths + 1)
    .fill(null)
    .map((item, index: number) => {
      return { date: format(subMonths(today, index + activeMonths), 'MMM yyy'), price: new BigNumber('n/a') };
    })
    .reverse();

  const displayDataset = inactiveMonthReturns.concat(activeMonthReturns);
  // it'll almost always be the case that there are more months than there are returns

  return (
    <Block>
      <SectionTitle>Monthly Returns (Share Price)</SectionTitle>

      <Table>
        <tbody>
          <HeaderRow>
            {displayDataset.map((item, index) => (
              <HeaderCell key={index}>{item.date}</HeaderCell>
            ))}
          </HeaderRow>
          <BodyRow>
            {displayDataset.map((item, index) => (
              <BodyCell key={index}>
                <FormattedNumber suffix={'%'} value={item.price} decimals={2} />
              </BodyCell>
            ))}
          </BodyRow>
        </tbody>
      </Table>
    </Block>
  );
}
