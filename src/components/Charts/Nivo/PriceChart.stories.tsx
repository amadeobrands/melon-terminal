import React from 'react';
import gql from 'graphql-tag';
import BigNumber from 'bignumber.js';
import { useEffectOnce } from 'react-use';
import { PriceChart } from '~/components/Charts/Nivo/PriceChart';
import { Block } from '~/storybook/Block/Block';
import { SectionTitle } from '~/storybook/Title/Title';
import { Serie } from '@nivo/line';
import { useLazyTheGraphQuery } from '~/hooks/useQuery';
import { format, fromUnixTime } from 'date-fns';
import { LineChartData } from '~/components/Charts/Nivo/PriceChart';
import { fromTokenBaseUnit } from '~/utils/fromTokenBaseUnit';

export interface FundSharePriceQueryVariables {
  start: number;
  funds: string[];
}

const FundSharePriceQuery = gql`
  query FundSharePriceQuery($funds: [String!]!, $start: BigInt!) {
    funds(where: { id_in: $funds }) {
      name
      createdAt
      calculationsHistory(
        where: { source: "priceUpdate", timestamp_gt: $start }
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

export const useFundSharePriceQuery = () => {
  return useLazyTheGraphQuery<any, FundSharePriceQueryVariables>(FundSharePriceQuery);
};

export function parseSharePriceQueryData(input: FundSharePriceQueryResult[], startDate: BigNumber): LineChartData {
  const editedDate = startDate.dividedBy(1000).toNumber();
  const returnObject: LineChartData = {
    earliestDate: 0,
    data: [],
  };

  for (let i of input) {
    // find earliest date
    if (!returnObject.earliestDate || returnObject.earliestDate < i.createdAt) {
      returnObject['earliestDate'] = parseInt(i.createdAt);
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
      if (j.timestamp < editedDate) {
        continue;
      }

      // check if you've seen the date before, if not, add it to the dictionary
      // and push the price into the price array
      if (!seenDates[`${date}`]) {
        seenDates[`${date}`] = true;
        fundInfo.data.push({ y: fromTokenBaseUnit(j.sharePrice, 18).toFixed(4), x: date });
      }
    }
    // push the Datum into the Serie
    returnObject.data.push(fundInfo);
  }

  return returnObject;
}

export const Default: React.FC = () => {
  const [load, result] = useFundSharePriceQuery();
  const funds = [
    '0x270e9478faaeca03d22d9c92b155bdd7ba39b5ca',
    '0xd6024aecfc626f1d65a469dedbd3199948a7b4c6',
    '0x7a956b7c804039bd92fbfd2b8034d5fbcc2d2d40',
  ];
  const trigger = React.useCallback(
    (start: number) => {
      load({
        variables: {
          start: start,
          funds: funds,
        },
      });
    },
    [load, funds]
  );

  const data = React.useMemo(() => {
    if (!result.data) {
      return undefined;
    }

    return parseSharePriceQueryData(result.data.funds, new BigNumber(result.variables.start));
  }, [result.data]);

  useEffectOnce(() => trigger(0));

  if (!result.called) {
    return null;
  }

  return (
    <Block>
      <SectionTitle>Fund Share Price Over Time</SectionTitle>

      <PriceChart
        triggerFunction={trigger}
        chartData={data}
        startDate={result.variables.start}
        loading={result.loading}
      />
    </Block>
  );
};
