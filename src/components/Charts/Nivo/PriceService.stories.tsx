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
import { SimpleZoomControl, LineChartData } from './SimpleZoomControl';
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

function parsePrices(timeline: TimeLineData[]) {
  console.log(timeline);
  const data = timeline.map((item) => ({
    x: new Date(item.timestamp * 1000),
    y: new BigNumber(item.price).toPrecision(8),
  }));

  return [
    {
      id: 'EEK Capital',
      data: data,
    },
  ];
}

async function fetchPrices(key: string, from: number, address: string) {
  const adjustedFrom = findCorrectFromTime(new Date(from * 1000));
  const to = findCorrectToTime(new Date());
  const url = `https://metrics.avantgarde.finance/api/portfolio?address=${address}&from=${adjustedFrom.toString()}&to=${to.toString()}`;
  const data = await fetch(url).then((res) => res.json());
  const parsedData = parsePrices(data.data);
  return { earliestDate: from, data: parsedData } as LineChartData;
}

export const PriceService: React.FC = () => {
  const address = '0x69591bfb5667d2d938ad00ef5da8addbcf811bc9';
  const fundCreationTime = 1584202322;

  const [from, setFrom] = React.useState(fundCreationTime);
  const { data, error, isFetching } = useQuery(['prices', from, address], fetchPrices, { refetchOnWindowFocus: false });

  const trigger = (from: number) => setFrom(from);

  return (
    <div>
      {error ? (
        <h3>There was an error fetching the data</h3>
      ) : (
        <SimpleZoomControl
          triggerFunction={trigger}
          chartData={data!}
          startDate={fundCreationTime}
          fundCreation={fundCreationTime}
          loading={isFetching}
        />
      )}
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
