import gql from 'graphql-tag';
import { useOnChainQuery, OnChainQueryHookOptions } from '~/hooks/useQuery';

export interface FundContext {
  name?: string;
  manager?: string;
  // TODO: Use enum here.
  progress?: string;
  isShutDown?: boolean;
  creationTime?: Date;
}

export interface FundContextQueryResult {
  fund?: FundContext;
}

export interface FundContextQueryVariables {
  address?: string;
}

const FundContextQuery = gql`
  query FundContextQuery($address: String!) {
    fund(address: $address) {
      name
      manager
      progress
      isShutDown
      creationTime
    }
  }
`;

export const useFundContextQuery = (options: OnChainQueryHookOptions<FundContextQueryVariables>) => {
  const result = useOnChainQuery<FundContextQueryVariables>(FundContextQuery, options);
  const fund = result.data?.fund;
  const output: FundContext = {
    name: fund?.name,
    manager: fund?.manager,
    progress: fund?.progress,
    isShutDown: fund?.isShutDown,
    creationTime: fund?.creationTime,
  };

  return [output, result] as [typeof output, typeof result];
};
