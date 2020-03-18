import React from 'react';
import { Spinner } from '~/storybook/components/Spinner/Spinner';
import {
  ScrollableTable,
  Table,
  HeaderCell,
  HeaderRow,
  BodyCell,
  BodyRow,
  NoEntries,
  HeaderCellRightAlign,
  BodyCellRightAlign,
} from '~/storybook/components/Table/Table';
import { Block } from '~/storybook/components/Block/Block';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { useFundTradeHistoryQuery } from './FundTradeHistory.query';
import { FormattedDate } from '~/components/Common/FormattedDate/FormattedDate';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { TokenValue } from '~/components/Common/TokenValue/TokenValue';

export interface FundTradeHistoryProps {
  address: string;
}

export const FundTradeHistory: React.FC<FundTradeHistoryProps> = ({ address }) => {
  const [calls, query] = useFundTradeHistoryQuery(address);

  return (
    <Block>
      <SectionTitle>Order History</SectionTitle>

      {query.loading && <Spinner />}
      {!query.loading && !calls.length && <NoEntries>No entries.</NoEntries>}
      {!query.loading && calls.length > 0 && (
        <ScrollableTable>
          <Table>
            <thead>
              <HeaderRow>
                <HeaderCell>Time</HeaderCell>
                <HeaderCell>Exchange</HeaderCell>
                <HeaderCellRightAlign>Buy quantity</HeaderCellRightAlign>
                <HeaderCell>Buy asset</HeaderCell>
                <HeaderCellRightAlign>Sell quantity</HeaderCellRightAlign>
                <HeaderCell>Sell asset</HeaderCell>
                <HeaderCell>Type</HeaderCell>
              </HeaderRow>
            </thead>
            <tbody>
              {calls.map(call => (
                <BodyRow key={call.id}>
                  <BodyCell>
                    <FormattedDate timestamp={call.timestamp} />
                  </BodyCell>
                  <BodyCell>{call.exchange?.name}</BodyCell>
                  <BodyCellRightAlign>
                    <FormattedNumber tooltip={true} value={call.buyQuantity} />
                  </BodyCellRightAlign>
                  <BodyCell>{call.buyAsset?.symbol}</BodyCell>
                  <BodyCellRightAlign>
                    <FormattedNumber tooltip={true} value={call.sellQuantity} />
                  </BodyCellRightAlign>
                  <BodyCell>{call.sellAsset?.symbol}</BodyCell>
                  <BodyCell>{call.methodName}</BodyCell>
                </BodyRow>
              ))}
            </tbody>
          </Table>
        </ScrollableTable>
      )}
    </Block>
  );
};
