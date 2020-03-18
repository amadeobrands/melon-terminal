import gql from 'graphql-tag';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useTheGraphQuery } from '~/hooks/useQuery';
import { ExchangeDefinition, TokenDefinition, sameAddress } from '@melonproject/melonjs';
import { useEnvironment } from '~/hooks/useEnvironment';
import { fromTokenBaseUnit } from '~/utils/fromTokenBaseUnit';

export interface CallOnExchange {
  id: string;
  timestamp: number;
  exchange?: ExchangeDefinition;
  buyAsset?: TokenDefinition;
  sellAsset?: TokenDefinition;
  buyQuantity?: BigNumber;
  sellQuantity?: BigNumber;
  methodName?: string;
}

export interface FundTradeHistoryQueryVariables {
  address?: string;
}

const FundTradeHistoryQuery = gql`
  query FundTradeHistoryQuery($address: ID!) {
    fund(id: $address) {
      trading {
        calls(orderBy: timestamp, orderDirection: "desc") {
          id
          timestamp
          exchange {
            id
          }
          orderAddress2 {
            id
          }
          orderAddress3 {
            id
          }
          orderValue0
          orderValue1
          orderValue2
          orderValue3
          orderValue6
          methodSignature
          methodName
        }
      }
    }
  }
`;

export const useFundTradeHistoryQuery = (address: string) => {
  const environment = useEnvironment()!;
  const result = useTheGraphQuery<any, FundTradeHistoryQueryVariables>(FundTradeHistoryQuery, {
    variables: { address: address?.toLowerCase() },
  });

  const calls = useMemo(
    () =>
      (result.data?.fund?.trading?.calls || []).map((item: any) => {
        const buyAsset = environment.getToken(item.orderAddress2?.id);
        const sellAsset = environment.getToken(item.orderAddress3?.id);

        let buyAmount = new BigNumber(item.orderValue0 ?? 0);
        const sellAmount = new BigNumber((item.orderValue6 || item.orderValue1) ?? 0);

        // Adjust the buy amount for partial fills.
        if (item.orderValue6) {
          buyAmount = buyAmount.multipliedBy(item.orderValue6).dividedBy(item.orderValue1);
        }

        const buyQuantity = buyAsset && fromTokenBaseUnit(buyAmount, buyAsset.decimals);
        const sellQuantity = sellAsset && fromTokenBaseUnit(sellAmount, sellAsset.decimals);
        const exchange = environment.exchanges.find(exchange => sameAddress(exchange.exchange, item.exchange?.id));

        return {
          buyAsset,
          sellAsset,
          buyQuantity,
          sellQuantity,
          id: item.id,
          timestamp: item.timestamp,
          methodName: item.methodName,
          exchange,
        } as CallOnExchange;
      }) as CallOnExchange[],
    [result.data]
  );

  return [calls, result] as [typeof calls, typeof result];
};
