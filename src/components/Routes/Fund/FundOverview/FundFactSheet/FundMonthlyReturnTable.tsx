import * as React from 'react';
import BigNumber from 'bignumber.js';
import { Table, HeaderCell, HeaderRow, BodyRow, BodyCell } from '~/storybook/Table/Table';
import { subMonths, format } from 'date-fns';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';

export interface MonthlyReturnTableProps {
  prices: BigNumber[];
  today: Date;
}

export default function MonthlyReturnTable(props: MonthlyReturnTableProps) {
  const months: string[] = props.prices
    .map((price, index) => {
      return format(subMonths(props.today, index), 'MMM yyy');
    })
    .reverse();
  return (
    <Table>
      <tbody>
        <HeaderRow>
          {months.map((item, index) => (
            <HeaderCell key={index}>{item}</HeaderCell>
          ))}
        </HeaderRow>
        <BodyRow>
          {props.prices.map((item, index) => (
            <BodyCell key={index}>
              <FormattedNumber suffix={'%'} value={item} decimals={2} />
            </BodyCell>
          ))}
        </BodyRow>
      </tbody>
    </Table>
  );
}
