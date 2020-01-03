import React, { useMemo, useLayoutEffect } from 'react';
import BigNumber from 'bignumber.js';
import { TokenDefinition } from '@melonproject/melonjs';
import { Spinner } from '~/components/Common/Spinner/Spinner';
import { useFundHoldingsQuery } from '~/queries/FundHoldings';
import {
  Table,
  HeaderCell,
  HeaderCellRightAlign,
  BodyCell,
  BodyCellRightAlign,
  HeaderRow,
} from '~/components/Common/Table/Table.styles';
import * as S from './FundHoldings.styles';
import { useEnvironment } from '~/hooks/useEnvironment';

export interface FundHoldingsProps {
  address: string;
  asset?: TokenDefinition;
  setAsset: (asset: TokenDefinition) => void;
}

export const FundHoldings: React.FC<FundHoldingsProps> = props => {
  const environment = useEnvironment()!;
  const [holdings, query] = useFundHoldingsQuery(props.address);

  useLayoutEffect(() => {
    if (props.asset) {
      return;
    }

    const symbol = holdings && holdings[0]?.token?.symbol;
    symbol && props.setAsset(environment.getToken(symbol));
  }, [holdings]);

  const mapped = useMemo(
    () =>
      (holdings || [])
        .filter(holding => holding && holding.token)
        .map(holding => {
          const decimals = holding.token?.decimals;
          const amount = holding.amount;

          return {
            ...holding,
            // TODO: This should be done in the graphql api.
            divided:
              decimals && amount ? amount.dividedBy(new BigNumber(10).exponentiatedBy(decimals)) : new BigNumber(0),
          };
        }),
    [holdings]
  );

  if (query.loading) {
    return (
      <S.Wrapper>
        <S.Title>Holdings</S.Title>
        <Spinner />
      </S.Wrapper>
    );
  }

  return (
    <S.Wrapper>
      <S.Title>Holdings</S.Title>
      <Table>
        <thead>
          <HeaderRow>
            <HeaderCell>Asset</HeaderCell>
            <HeaderCellRightAlign>Price</HeaderCellRightAlign>
            <HeaderCellRightAlign>Balance</HeaderCellRightAlign>
          </HeaderRow>
        </thead>
        <tbody>
          {mapped.map(holding => {
            const token = environment.getToken(holding.token!.symbol!);

            return (
              <S.BodyRow
                key={holding.token?.address}
                active={token.symbol === props.asset?.symbol}
                onClick={() => props.setAsset(token)}
              >
                <BodyCell>
                  <S.HoldingSymbol>{holding.token?.symbol}</S.HoldingSymbol>
                  <br />
                  <S.HoldingName>{holding.token?.name}</S.HoldingName>
                </BodyCell>
                <BodyCellRightAlign>{holding.token?.price?.toFixed(4)}</BodyCellRightAlign>
                <BodyCellRightAlign>{holding.divided?.toFixed(4)}</BodyCellRightAlign>
              </S.BodyRow>
            );
          })}
        </tbody>
      </Table>
    </S.Wrapper>
  );
};

export default FundHoldings;