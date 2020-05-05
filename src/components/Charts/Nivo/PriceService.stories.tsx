import React from 'react';
import { useQuery } from 'react-query';
import { fromUnixTime, format, isBefore, startOfDay, endOfDay, getUnixTime } from 'date-fns';
import { PriceChart, LineChartData } from './PriceChart';
import { fromTokenBaseUnit } from '~/utils/fromTokenBaseUnit';
import { Serie } from '@nivo/line';
import { differenceInSeconds, addDays } from 'date-fns/esm';
import { useEffectOnce } from 'react-use';

export default { title: 'Charts|Price Service Testing' };

/**
 * Implementation of a price chart with three distinct Series pulled from the melon subgraph.
 * Logic has been added to keep the dates in this data evergreen (i.e. you'll always be able to
 * hit the 1 week chart view and see data)
 *
 * The parent component pattern displayed below  (Default wrapping PriceChart) is recommended when implementing
 * price chart. The trigger function here has been built to mock the function returned from a lazy query.
 *
 
 */
interface PriceResults {
  base: string;
  quote: string;
  from: number;
  to: number;
  data: [number, number, number, number, number, number, number][];
}

function parsePrices(prices: PriceResults): LineChartData {
  const data = [
    {
      id: `${prices.base}/${prices.quote}`,
      data: prices.data.map((price) => ({
        x: format(fromUnixTime(price[0]), 'yyyy-MM-dd'),
        y: price[1],
      })),
    },
  ];

  return { earliestDate: prices.from, data: data };
}

function findCorrectFromTime(timestamp: number) {
  // find the timezone offset in minutes
  // adjust for UTC time
  // return beginningOfDay()
  const offset = new Date().getTimezoneOffset();

  const adjustedTime = timestamp + offset;
  console.log(adjustedTime);
  return getUnixTime(startOfDay(adjustedTime));
}

function findCorrectToTime(timestamp: number) {
  const offset = new Date().getTimezoneOffset();
  const adjustedTime = timestamp - offset;
  return getUnixTime(endOfDay(adjustedTime));
}

async function fetchPrices(key: string, quote: string, base: string, from: number, to: number) {
  const url = `https://rates.avantgarde.finance/api/historical?quote=${quote}&base=${base}&from=${from.toString()}&to=${to.toString()}`;
  const data = await fetch(url).then((res) => res.json());
  return parsePrices(data) as LineChartData;
}

export const PriceService: React.FC = () => {
  const [params, setParams] = React.useState({ quote: 'ETH', base: 'MLN', from: 1548806400, to: 1588636799 });
  // params is an object, each value passed to the useQuery hook to query the prices endpoint
  // chart component sends back ONLY the 'from' value, so that may need to be refactored at the chart level

  function editParams(newParam: number) {
    if (typeof newParam === 'number') {
      setParams({ ...params, from: findCorrectFromTime(newParam) });
    } else {
      setParams({ ...params, newParam });
    }
  }

  const { data, error, isFetching } = useQuery(
    ['prices', params.quote, params.base, params.from, params.to],
    fetchPrices
  );
  console.log(data);
  return <PriceChart loading={isFetching} startDate={params.from} chartData={data} triggerFunction={editParams} />;
};

/** 
 * export interface LineChartProps {
  triggerFunction: (start: number) => void;
  chartData?: LineChartData;
  startDate: number;
  loading: boolean;
}

*/
