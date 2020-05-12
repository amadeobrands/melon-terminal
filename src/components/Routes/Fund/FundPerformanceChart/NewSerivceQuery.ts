import { Serie } from '@nivo/line';
import BigNumber from 'bignumber.js';
import { LineChartData } from '~/components/Charts/Nivo/SimpleZoomControl';

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
  console.log(timeline);
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
  const toDay = date.getUTCDate();
  const endOfDay = Date.UTC(toYear, toMonth, toDay, 23, 59, 59, 0) / 1000;
  return endOfDay;
}

export async function fetchPricesFromService(key: string, from: number, fund: string) {
  const adjustedFrom = findCorrectFromTime(new Date(from * 1000));

  const to = findCorrectToTime(new Date());

  const url = `https://metrics.avantgarde.finance/api/portfolio?address=${fund}&from=${adjustedFrom.toString()}&to=${to.toString()}`;

  const data = await fetch(url).then((res) => res.json());

  const parsedData = parsePrices(data.data);
  return { earliestDate: from, data: [parsedData] } as LineChartData;
}
