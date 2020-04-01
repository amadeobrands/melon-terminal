import gql from 'graphql-tag';
import { useTheGraphQuery } from '~/hooks/useQuery';
import BigNumber from 'bignumber.js';

export interface FundMetricsResult {
  state: {
    activeInvestors: string;
    nonActiveInvestors: string;
    allInvestments: string;
    activeFunds: string;
    nonActiveFunds: string;
    networkGav: string;
  };
}

const FundMetricsQuery = gql`
  query FundMetricsQuery {
    state(id: "0x") {
      activeInvestors
      nonActiveInvestors
      allInvestments
      activeFunds
      nonActiveFunds
      networkGav
    }
  }
`;

export const useFundMetricsQuery = () => {
  const result = useTheGraphQuery<FundMetricsResult>(FundMetricsQuery);
  return [result.data, result] as [typeof result.data, typeof result];
};
