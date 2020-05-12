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

import { Serie, Datum } from '@nivo/line';
import { SimpleZoomControl } from './SimpleZoomControl';
import { Button } from '~/storybook/Button/Button.styles';
import BigNumber from '../../../../../melon-js/node_modules/bignumber.js/bignumber';
import { findCorrectFromTime, findCorrectToTime } from '~/utils/priceServiceDates';

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
interface TimeLineData {
  timestamp: number;
  rates: {
    [symbol: string]: number;
  };
  holdings: {
    [symbol: string]: number;
  };
  shares: number;
  price: number;
  gav: number;
  nav: number;
}

interface TimeLine {
  updated: number;
  revalidate: number;
  params: {
    to: number;
    from: number;
    address: string;
  };
  data: TimeLineData[];
}

interface To {
  to: number;
}

interface From {
  from: number;
}

function parsePrices(timeline: TimeLine) {
  const data = timeline.data.map((item) => ({
    x: new Date(item.timestamp * 1000),
    y: new BigNumber(item.price).toPrecision(8),
  }));
  return {
    id: 'EEK Capital',
    data: data,
  };
}

async function fetchPrices(key: string, from: number, to: number) {
  if (from > to) {
    // handle this
    console.log('your dates are screwy');
  }
  const url = `https://metrics.avantgarde.finance/api/portfolio?address=0x69591bfb5667d2d938ad00ef5da8addbcf811bc9&from=${from.toString()}&to=${to.toString()}`;

  const data = await fetch(url).then((res) => res.json());

  const parsedData = parsePrices(data.data);
  return { earliestDate: from, data: parsedData };
}

export const PriceService: React.FC = () => {
  const from = findCorrectFromTime(subMonths(new Date(), 2));
  const to = findCorrectToTime(new Date());

  function editParams(newParam: To | From) {
    setParams({ ...params, ...newParam });
  }

  function clickHandler(param: number) {
    if (param === 4) {
      const newFrom = findCorrectFromTime(subWeeks(new Date(), param));
      editParams({ from: newFrom });
    } else {
      const newTo = findCorrectToTime(subDays(new Date(), param));
      editParams({ to: newTo });
    }
  }

  const { data, error, isFetching } = useQuery(['prices', params.from, params.to], fetchPrices);

  return (
    <div>
      <div>
        From
        <Button onClick={() => clickHandler(4)}>6 weeks</Button>
      </div>
      <div>
        To
        <Button onClick={() => clickHandler(1)}>1week</Button>
      </div>

      <SimpleZoomControl loading={isFetching} chartData={data} stacked={true} />
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
