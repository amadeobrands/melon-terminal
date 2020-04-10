import gql from 'graphql-tag';
import BigNumber from 'bignumber.js';
import { Serie, Datum } from '@nivo/line';
import { useTheGraphQuery } from '~/hooks/useQuery';
import { useFund } from '~/hooks/useFund';
import { useMemo } from 'react';
import { format, fromUnixTime } from 'date-fns';
import { LineChartData } from '~/components/Charts/Nivo/Nivo';

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
  timestamp: number;
  sharePrice: number;
  source: string;
  validPrices: boolean;
}

export interface FundSharePriceQueryResult {
  createdAt: number;
  name: string;
  calculationsHistory: CalculationHistory[];
}

export interface FundSharePricesParsed {
  earliestDate: number | undefined;
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

  // const data = useMemo(() => {
  //   return result.data;
  // }, [result.data]);

  const chartData = useMemo(() => {
    return result.data?.funds ? parseSharePriceQueryData(result.data.funds, startDate) : undefined;
  }, [result.data.funds]);

  return [chartData, result] as [typeof chartData, typeof result];
};

function parseSharePriceQueryData(input: FundSharePriceQueryResult[], startDate: number): LineChartData {
  // takes an array of - fund objects (must pass correct result.data.funds to function)
  // returns an an object with two values - the oldest date to display and an
  // array of Series: { id: string | number, data: Datum[] }
  // where data is an array of {x: , y: }
  // where x is a date (yyy-MM-dd) and y is a number representing share price
  // also needs to sort by before startDate and after
  // de-duplicate - only take the first update on a given date
  // remove calculations with null and 0 prices
  // remove validPrices false price

  const returnObject: LineChartData = {
    earliestDate: undefined,
    data: [],
  };

  for (let i of input) {
    // find earliest date
    if (!returnObject.earliestDate || returnObject.earliestDate < i.createdAt) {
      returnObject['earliestDate'] = i.createdAt;
      console.log(returnObject, 'I chnaged it');
    }

    // declare empty array to track dates
    const seenDates: { [date: string]: boolean } = {};

    // declare fund object to push onto returnObject.data
    const fundInfo: Serie = { id: i.name, data: [] };

    // loop through calculations
    for (let j of i.calculationsHistory) {
      const date = format(fromUnixTime(j.timestamp), 'yyyy-MM-dd');

      // skip it if sharePrice is null or zero or if validPrices is false
      if (!j.sharePrice || !j.validPrices) {
        continue;
      }

      // skip it if the item's date is before the chart's start date
      if (j.timestamp < startDate) {
        continue;
      }

      // check if you've seen the date before, if not, add it to the dictionary
      // and push the price into the price array
      if (!seenDates[`${date}`]) {
        seenDates[`${date}`] = true;
        fundInfo.data.push({ y: j.sharePrice, x: date });
      }
    }
    // push the Datum into the Serie
    returnObject.data.push(fundInfo);
  }

  console.log('returnObject: ', returnObject);

  return returnObject;
}

/**
{ 
  funds: [
    {calculationsHistory: [
     {
        sharePrices: string or number not sure
        source: "priceUpdate"
        timestamp: string or number
        validPrices: boolean
     }
    ],
    createdAt: string or number not sure
    name: string}
  ] 
}
 */
