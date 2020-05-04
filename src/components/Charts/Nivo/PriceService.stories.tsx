import React from 'react';
import { useQuery } from 'react-query';
import { fromUnixTime, format, isBefore, startOfDay } from 'date-fns';
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
  const series = prices.data.map(price => ({
    x: format(fromUnixTime(price[0]), 'yyyy-MM-dd'),
    y: price[1],
  }));
  const aThing = series.pop()
  console.log(aThing)
  const data = {
    id: `${prices.base}/${prices.quote}`,
    data: prices.data.map(price => ({
      x: format(fromUnixTime(price[0]), 'yyyy-MM-dd'),
      y: price[1]
    })),
  };
  console.log(data);
  return { earliestDate: prices.from, data: data };
}

async function fetchPrices(key: string, quote: string, base: string, from: number, to: number) {
  const url = `https://rates.avantgarde.finance/api/historical?quote=${quote}&base=${base}&from=${from.toString()}&to=${to.toString()}`;
  const data = await fetch(url).then(res => res.json());

  return parsePrices(data) as LineChartData;
}

export const PriceService: React.FC = () => {
  const [quote, setQuote] = React.useState('ETH');
  const [base, setBase] = React.useState('MLN');
  const [from, setFrom] = React.useState(1548806400);
  const [to, setTo] = React.useState(1588636799);

  const { data, error, isFetching } = useQuery(['prices', quote, base, from, to], fetchPrices);
  console.log(data);
  return <PriceChart loading={isFetching} startDate={from} chartData={data} triggerFunction={setFrom} />;
};

/** 
 * export interface LineChartProps {
  triggerFunction: (start: number) => void;
  chartData?: LineChartData;
  startDate: number;
  loading: boolean;
}

*/
