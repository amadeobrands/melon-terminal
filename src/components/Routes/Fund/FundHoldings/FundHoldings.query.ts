import gql from 'graphql-tag';
import { useOnChainQuery, useTheGraphQuery } from '~/hooks/useQuery';
import { Holding } from '@melonproject/melongql';
import BigNumber from 'bignumber.js';
import { calculateChangeFromSharePrice } from '~/utils/calculateChangeFromSharePrice';

export interface FundHoldingsQueryVariables {
  address: string;
}

const FundHoldingsQuery = gql`
  query FundHoldingsQuery($address: String!) {
    fund(address: $address) {
      routes {
        accounting {
          holdings {
            amount
            value
            token {
              address
              symbol
              decimals
              name
              price
            }
          }
        }
      }
    }
  }
`;

export const useFundHoldingsQuery = (address: string) => {
  const options = {
    variables: { address },
  };

  const result = useOnChainQuery<FundHoldingsQueryVariables>(FundHoldingsQuery, options);
  const holdings = result.data?.fund?.routes?.accounting?.holdings ?? ([] as Holding[]);
  return [holdings, result] as [typeof holdings, typeof result];
};

export interface AssetsDailyChangeQueryResult {
  assets: {
    id: string;
    symbol: string;
    priceHistory: {
      id: string;
      price: BigNumber;
    }[];
  }[];
}

export interface AssetsDailyChangeQueryVariables {
  address: string;
}

interface DailyChanges {
  [key: string]: BigNumber;
}

const AssetsDailyChangeQuery = gql`
  query AssetsDailyChangeQuery {
    assets {
      id
      symbol
      priceHistory(orderBy: timestamp, orderDirection: desc, first: 2) {
        id
        price
      }
    }
  }
`;

export const useAssetsDailyChange = () => {
  const result = useTheGraphQuery<AssetsDailyChangeQueryResult, AssetsDailyChangeQueryVariables>(
    AssetsDailyChangeQuery
  );

  const assets = result?.data?.assets || [];

  const dailyChanges = assets.reduce((carry, current) => {
    const change = calculateChangeFromSharePrice(current?.priceHistory[0]?.price, current?.priceHistory[1]?.price);
    return { ...carry, [current.symbol]: change };
  }, {} as DailyChanges);

  return [dailyChanges, result] as [DailyChanges, typeof result];
};
