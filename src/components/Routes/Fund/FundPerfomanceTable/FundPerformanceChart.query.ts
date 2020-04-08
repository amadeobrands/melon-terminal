import gql from 'graphql-tag';
import BigNumber from 'bignumber.js';
import { Serie } from '@nivo/line';
import { useTheGraphQuery } from '~/hooks/useQuery';
import { useFund } from '~/hooks/useFund';
import { useMemo } from 'react';

/**
 * Query must take a fund address and a date
 * Query method must return
 * {
 *  earliestDate: number
 *  data: Serie[]
 * }
 *
 * where Serie is an imported Nivo type that looks like:
 * {
 *  y: price (number with four decimals)
 *  x: date (format 'yyyy-MM-dd')
 * }
 *
 *
 * add tests to parsing function
 *
 *
 */

export interface FundSharePriceQueryVariables {
  startDate: BigNumber;
  funds: string[];
}

const FundSharePriceQuery = gql`
  query FundSharePriceQuery($funds: [String!]!, $startDate: BigInt!) {
    funds(where: { id_in: $funds }) {
      name
      createdAt
      calculationsHistory(
        where: { source: "priceUpdate", timestamp_gt: $startDate }
        first: 1000
        orderBy: timestamp
        orderDirection: desc
      ) {
        sharePrice
        source
        validPrices
        timestamp
      }
    }
  }
`;

export interface CalculationHistory {
  sharePrice: number;
  source: string;
  validPrices: boolean;
}

export interface FundSharePriceQueryResult {
  createdAt: number;
  calculationsHistory: CalculationHistory[];
}

export interface FundSharePricesParsed {
  earliestDate: number;
  data: Serie[];
}

export const useFundSharePriceQuery = (startDate: number) => {
  const context = useFund();
  const address = context.address!.toLowerCase();
  const dummyDate = new Date('March 1 2020').getTime();
  const options = {
    variables: {
      startDate: new BigNumber(dummyDate).dividedBy(1000),
      funds: [address.toLowerCase()],
    } as FundSharePriceQueryVariables,
  };

  const result = useTheGraphQuery(FundSharePriceQuery, options);

  const data = useMemo(() => {
    return result.data;
  }, [result.data]);

  console.log(data);
};

function parseSharePriceQueryData(input: FundSharePriceQueryResult[]): FundSharePricesParsed {}
