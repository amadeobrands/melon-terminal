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
  subDays,
  subYears,
} from 'date-fns';
import { PriceChart, LineChartData } from './PriceChart';

import { Serie, Datum } from '@nivo/line';
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
    address: string;
  };
  data: [number, number, number, number, number, number, number][];
}

interface TimelineItem {
  timestamp: number;
  rates: {
    [symbol: string]: number;
  };
  holdings: {
    [symbol: string]: number;
  };
  shares: number;
}

interface To {
  to: number;
}

interface From {
  from: number;
}

function parsePrices(timeline: TimelineItem[]) {
  // from holdings and rates, provide value in WETH at the timestamp of every holding
  // x: timestamp
  // y: value in WETH
  // id: Token symbol
  const data = timeline.reduce((carry, current) => {
    const timestamp = new Date(current.timestamp * 1000);
    const symbols = Object.keys(current.rates);

    return symbols.reduce((carry, symbol) => {
      const value = current.rates[symbol] * current.holdings[symbol];
      if (!carry[symbol]) {
        carry[symbol] = [];
      }
      carry[symbol].push({ x: timestamp, y: value ? value : null });
      return carry;
    }, carry);
  }, {} as { [symbol: string]: Datum[] });
  const symbols = Object.keys(data);
  return symbols.map<Serie>((symbol) => ({
    id: symbol,
    data: data[symbol],
  }));
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
  const url = `https://metrics.avantgarde.finance/api/portfolio?address=0x69591bfb5667d2d938ad00ef5da8addbcf811bc9&from=${from.toString()}&to=${to.toString()}`;
  const data = await fetch(url).then((res) => res.json());
  console.log(data);
  const parsedData = parsePrices(data.data);
  return { earliestDate: from, data: parsedData };
}

export const PriceService: React.FC = () => {
  const from = findCorrectFromTime(subMonths(new Date(), 2));
  const to = findCorrectToTime(new Date());
  const [params, setParams] = React.useState({ quote: 'ETH', base: 'MLN', from: from, to: to });

  function editParams(newParam: To | From | Base | Quote) {
    setParams({ ...params, ...newParam });
  }

  function clickHandler(param: string | number) {
    if (typeof param === 'string') {
      editParams({ base: param });
    }

    // if (variable === 6) {
    //   const newFrom = findCorrectFromTime(addWeeks(fromUnixTime(from), variable));
    //   editParams({ from: newFrom });
    // } else {
    //   const newTo = findCorrectToTime(subWeeks(fromUnixTime(to), variable));
    //   editParams({ to: newTo });
    // }
  }
  const toggle = params.base === 'MLN' ? 'BAT' : 'MLN';
  const { data, error, isFetching } = useQuery(
    ['prices', params.quote, params.base, params.from, params.to],
    fetchPrices
  );
  console.log(data);

  return (
    <div>
      {/* <div>
        From
        <Button onClick={() => clickHandler(6)}>6 weeks</Button>
      </div>
      <div>
        To
        <Button onClick={() => clickHandler(1)}>1week</Button>
      </div>
      <div>
        <Button onClick={() => clickHandler(toggle)}>Toggle Token</Button>
      </div> */}
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
