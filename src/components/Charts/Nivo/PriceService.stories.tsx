import React from 'react';
import { useQuery } from 'react-query';
import {
  fromUnixTime,
  format,
  isBefore,
  startOfDay,
  endOfDay,
  getUnixTime,
  addWeeks,
  subWeeks,
  subMonths,
} from 'date-fns';
import { PriceChart, LineChartData } from './PriceChart';
import { fromTokenBaseUnit } from '~/utils/fromTokenBaseUnit';
import { Serie } from '@nivo/line';
import { differenceInSeconds, addDays } from 'date-fns/esm';
import { useEffectOnce } from 'react-use';
import { BasicPriceChart } from './BareBones';
import { Button } from '~/storybook/Button/Button.styles';

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
  updated: number;
  revalidate: number;
  params: {
    to: number;
    from: number;
    base: string;
    quote: string;
  };
  data: [number, number, number, number, number, number, number][];
}

interface QueryParams {
  to: number;
  from: number;
  base: string;
  quote: string;
}

function parsePrices(prices: PriceResults): LineChartData {
  const data = [
    {
      id: `${prices.params.base}/${prices.params.quote}`,
      data: prices.data.map((price) => ({
        x: fromUnixTime(price[0]),
        y: price[1],
      })),
    },
  ];

  return { earliestDate: prices.params.from, data: data };
}

function findCorrectFromTime(date: Date) {
  const fromYear = date.getUTCFullYear();
  const fromMonth = date.getUTCMonth();
  const fromDay = date.getUTCDay();
  const beginningOfDay = Date.UTC(fromYear, fromMonth, fromDay, 0, 0, 0, 0) / 1000;
  return beginningOfDay;
}

function findCorrectToTime(date: Date) {
  const toYear = date.getUTCFullYear();
  const toMonth = date.getUTCMonth();
  const toDay = date.getUTCDay();
  const endOfDay = Date.UTC(toYear, toMonth, toDay, 23, 59, 59, 0) / 1000;
  return endOfDay;
}

async function fetchPrices(key: string, quote: string, base: string, from: number, to: number) {
  if (from > to) {
    // handle this
    console.log('your dates are screwy');
  }
  const url = `https://rates.avantgarde.finance/api/historical?quote=${quote}&base=${base}&from=${from.toString()}&to=${to.toString()}`;
  const data = await fetch(url).then((res) => res.json());
  return parsePrices(data) as LineChartData;
}

export const PriceService: React.FC = () => {
  const from = findCorrectFromTime(subMonths(new Date(), 2));

  const to = findCorrectToTime(new Date());

  const [params, setParams] = React.useState({ quote: 'ETH', base: 'MLN', from: from, to: to });

  // how to type this?
  function editParams(newParam) {
    console.log('before', params);
    setParams({ ...params, ...newParam });
    console.log('after', params);
  }

  function clickHandler(variable: number) {
    if (variable === 6) {
      const newFrom = findCorrectFromTime(addWeeks(fromUnixTime(from), variable));
      editParams({ from: newFrom });
    } else {
      const newTo = findCorrectToTime(subWeeks(fromUnixTime(to), variable));
      editParams({ to: newTo });
    }
  }

  const { data, error, isFetching } = useQuery(
    ['prices', params.quote, params.base, params.from, params.to],
    fetchPrices
  );
  console.log(data);

  return (
    <div>
      <div>
        From
        <Button onClick={() => clickHandler(6)}>6 weeks</Button>
      </div>
      <div>
        To
        <Button onClick={() => clickHandler(1)}>1week</Button>
      </div>
      <BasicPriceChart loading={isFetching} chartData={data} />
    </div>
  );
};

/** 
 * export interface LineChartProps {
  triggerFunction: (start: number) => void;
  chartData?: LineChartData;
  startDate: number;
  loading: boolean;
}

*/
