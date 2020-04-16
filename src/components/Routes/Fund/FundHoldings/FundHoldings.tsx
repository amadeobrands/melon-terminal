import React from 'react';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { useFundHoldingsQuery } from './FundHoldings.query';
import * as S from './FundHoldings.styles';
import BigNumber from 'bignumber.js';
import {
  ScrollableTable,
  Table,
  HeaderCell,
  HeaderCellRightAlign,
  BodyCell,
  BodyCellRightAlign,
  BodyRow,
  HeaderRow,
} from '~/storybook/Table/Table';
import { SectionTitle } from '~/storybook/Title/Title';
import { Block } from '~/storybook/Block/Block';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { Icons, IconName } from '~/storybook/Icons/Icons';
import { TokenValue } from '~/components/Common/TokenValue/TokenValue';

export interface FundHoldingsProps {
  address: string;
}

export const FundHoldings: React.FC<FundHoldingsProps> = ({ address }) => {
  const [holdings, query] = useFundHoldingsQuery(address);

  if (query.loading) {
    return (
      <Block>
        <SectionTitle>Portfolio Holdings</SectionTitle>
        <Spinner />
      </Block>
    );
  }

  const nonZeroHoldings = holdings.filter(holding => !holding.amount?.isZero());

  const totalValue = nonZeroHoldings.reduce((acc, current) => {
    return acc.plus(current.value || new BigNumber(0));
  }, new BigNumber(0));

  if (!nonZeroHoldings.length) {
    return (
      <Block>
        <SectionTitle>Portfolio Holdings</SectionTitle>
        <ScrollableTable maxHeight="650px">No current holdings.</ScrollableTable>
      </Block>
    );
  }

  return (
    <Block>
      <SectionTitle>Portfolio Holdings</SectionTitle>
      <ScrollableTable maxHeight="650px">
        <Table>
          <thead>
            <HeaderRow>
              <HeaderCell>Asset</HeaderCell>
              <HeaderCellRightAlign>Price</HeaderCellRightAlign>
              <HeaderCellRightAlign>Balance</HeaderCellRightAlign>
              <HeaderCellRightAlign>Value [ETH]</HeaderCellRightAlign>
              <HeaderCellRightAlign>Allocation</HeaderCellRightAlign>
            </HeaderRow>
          </thead>
          <tbody>
            {nonZeroHoldings.map((holding, key) => (
              <BodyRow key={key}>
                <BodyCell>
                  <S.HoldingIcon>
                    <Icons name={holding.token?.symbol as IconName} size="small" />
                  </S.HoldingIcon>
                  <S.HoldingName>
                    <S.HoldingSymbol>{holding.token?.symbol}</S.HoldingSymbol>
                    <br />
                    <S.HoldingName>{holding.token?.name}</S.HoldingName>
                  </S.HoldingName>
                </BodyCell>
                <BodyCellRightAlign>
                  <FormattedNumber value={holding.token?.price} />
                </BodyCellRightAlign>
                <BodyCellRightAlign>
                  <TokenValue value={holding.amount!} decimals={holding.token!.decimals!} />
                </BodyCellRightAlign>
                <BodyCellRightAlign>
                  <TokenValue value={holding.value!} />
                </BodyCellRightAlign>
                <BodyCellRightAlign>
                  <FormattedNumber value={holding.value?.dividedBy(totalValue).times(100)} decimals={2} suffix="%" />
                </BodyCellRightAlign>
              </BodyRow>
            ))}
          </tbody>
        </Table>
      </ScrollableTable>
    </Block>
  );
};
