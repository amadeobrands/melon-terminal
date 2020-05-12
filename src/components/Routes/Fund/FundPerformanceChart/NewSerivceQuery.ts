import { Serie } from '@nivo/line';
import BigNumber from 'bignumber.js';
import { LineChartData } from '~/components/Charts/Nivo/SimpleZoomControl';
import { findCorrectFromTime, findCorrectToTime } from '~/utils/priceServiceDates';

interface TimelineItem {
  timestamp: number;
  rates: {
    [symbol: string]: number;
  };
  holdings: {
    [symbol: string]: number;
  };
  shares: number;
  sharePrice?: number;
  price?: number;
  gav: number;
  nav: number;
}
export interface FundSharePricesParsed {
  earliestDate: number | undefined;
  data: Serie[];
}

function parsePrices(timeline: TimelineItem[]): Serie {
  const data = timeline.map((item) => ({
    x: new Date(item.timestamp * 1000),
    y: new BigNumber(item.price!).toPrecision(8),
  }));

  const returnObject: Serie = {
    id: 'Share Price',
    data: data,
  };

  return returnObject;
}

export async function fetchPricesFromService(key: string, from: number, fund: string) {
  const adjustedFrom = findCorrectFromTime(new Date(from * 1000));
  const today = new Date();
  const to = findCorrectToTime(today);
  const url = `https://metrics.avantgarde.finance/api/portfolio?address=${fund}&from=${adjustedFrom.toString()}&to=${to.toString()}`;

  const data = await fetch(url).then((res) => res.json());
  const parsedData = parsePrices(data.data);

  return { earliestDate: from, data: [parsedData] } as LineChartData;
}
