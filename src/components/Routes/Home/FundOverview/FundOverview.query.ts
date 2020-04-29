import gql from 'graphql-tag';
import BigNumber from 'bignumber.js';
import { useTheGraphQuery } from '~/hooks/useQuery';
import { calculateChangeFromSharePrice } from '~/utils/calculateChangeFromSharePrice';
import { useCoinAPI } from '~/hooks/useCoinAPI';
import { fromTokenBaseUnit } from '~/utils/fromTokenBaseUnit';

export interface SharePrice {
  sharePrice: string;
}

export interface Fund {
  id: string;
  name: string;
  gav: BigNumber;
  sharePrice: BigNumber;
  totalSupply: BigNumber;
  isShutdown: boolean;
  createdAt: number;
  investments: [
    {
      id: string;
    }
  ];
  version: {
    id: string;
    name: string;
  };
  accounting: {
    id: string;
    denominationAsset: {
      id: string;
      symbol: string;
    };
  };
  calculationsHistory: {
    id: string;
    sharePrice: BigNumber;
    timestamp: string;
  }[];
}

export interface FundProcessed {
  id: string;
  name: string;
  address: string;
  inception: number;
  aumEth: BigNumber;
  aumUsd: BigNumber;
  sharePrice: BigNumber;
  change: BigNumber;
  shares: BigNumber;
  denomination: string;
  investments: number;
  version: string;
  status: string;
}

export interface FundOverviewQueryResult {
  funds: Fund[];
}

export interface FundOverviewQueryVariables {
  orderBy: string;
}

const FundOverviewQuery = gql`
  query FundOverviewQuery {
    funds(
      first: 1000
      where: { id_not: "0x1e3ef9a8fe3cf5b3440b0df8347f1888484b8dc2" }
      orderBy: "sharePrice"
      orderDirection: "desc"
    ) {
      id
      name
      gav
      sharePrice
      totalSupply
      isShutdown
      createdAt
      investments {
        id
      }
      version {
        id
        name
      }
      accounting {
        id
        denominationAsset {
          id
          symbol
        }
      }
      calculationsHistory(orderBy: timestamp, orderDirection: desc, first: 2) {
        id
        sharePrice
        timestamp
      }
    }
  }
`;

export const useFundOverviewQuery = () => {
  const result = useTheGraphQuery<FundOverviewQueryResult, FundOverviewQueryVariables>(FundOverviewQuery);
  const coinApi = useCoinAPI();

  const rate = coinApi.data.rate ?? 0;

  const funds = (result && result.data && result.data.funds) || [];
  const processed = funds.map((item) => ({
    id: item.id,
    name: item.name,
    address: item.id.substr(0, 8),
    inception: item.createdAt,
    aumEth: item.gav,
    aumUsd: new BigNumber(item.gav).multipliedBy(rate),
    sharePrice: item.sharePrice,
    change: calculateChangeFromSharePrice(
      item.calculationsHistory[0]?.sharePrice,
      item.calculationsHistory[1]?.sharePrice
    ),
    shares: item.totalSupply,
    denomination: item.accounting.denominationAsset.symbol,
    investments: item.investments.length,
    version: item.version.name,
    status: item.isShutdown ? 'Not active' : 'Active',
  }));

  return [processed, result] as [FundProcessed[], typeof result];
};
