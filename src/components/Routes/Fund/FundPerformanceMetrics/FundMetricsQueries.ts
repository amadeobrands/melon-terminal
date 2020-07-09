import { useQuery } from 'react-query';
import { BigNumber } from 'bignumber.js';
import { findCorrectToTime } from '~/utils/priceServiceDates';

export interface RangeTimelineItem {
  timestamp: number;
  rates: {
    [symbol: string]: number;
  };
  holdings: {
    [symbol: string]: number;
  };
  shares: number;
  calculations: {
    price: number;
    gav: number;
    nav: number;
  };
}

export interface MonthendTimelineItem {
  timestamp: number;
  rates: {
    [symbol: string]: number;
  };
  holdings: {
    [symbol: string]: number;
  };
  shares: number;
  references: {
    ethusd: number;
    etheur: number;
    ethbtc: number;
  };
  calculations: {
    price: number;
    gav: number;
    nav: number;
  };
}

async function fetchMonthlyFundPrices(key: string, address: string) {
  const url = process.env.MELON_METRICS_API;
  const queryAddress = `${url}/api/monthend?address=${address}`;
  const response = await fetch(queryAddress)
    .then((response) => response.json())
    .catch((error) => console.log(error));
  return response;
}

export function useFetchMonthlyFundPrices(fund: string) {
  const address = fund.toLowerCase();
  return useQuery(['prices', address], fetchMonthlyFundPrices, {
    refetchOnWindowFocus: false,
  });
}

async function fetchFundPricesByDate(key: string, address: string, from: number, to: number) {
  const url = process.env.MELON_METRICS_API;
  const queryAddress = `${url}/api/range?address=${address}&from=${from}&to=${to}`;
  const response = await fetch(queryAddress)
    .then((response) => response.json())
    .catch((error) => console.log(error));
  return response;
}

export function useFetchFundPricesByDate(fund: string, from: number, to: number) {
  const address = fund.toLowerCase();
  return useQuery([(from + to).toString(), address, from, to], fetchFundPricesByDate, {
    refetchOnWindowFocus: false,
  });
}

async function fetchIndexPrices(key: string, startDate: string, endDate: string) {
  const apiKey = '007383bc-d3b7-4249-9a0d-b3a1d17113d9';
  const queryAddress = `https://api.bitwiseinvestments.com/api/v1/indexes/BITWISE10/history?apiKey=${apiKey}&start=${startDate}&end=${endDate}`;
  const response = await fetch(queryAddress)
    .then((response) => response.json())
    .catch((error) => console.log(error));
  const prices = response.map((item: number[]) => new BigNumber(item[1]));
  return prices as BigNumber[];
}

export async function fetchMultipleIndexPrices(dates: [Date, Date][]) {
  const prices = await Promise.all(
    dates.map((item) => {
      return fetchIndexPrices('blank', item[0].toISOString(), item[1].toISOString());
    })
  );
  return prices;
}

export function useFetchIndexPrices(startDate: string, endDate: string) {
  return useQuery([startDate + endDate, startDate, endDate], fetchIndexPrices, {
    refetchOnWindowFocus: false,
  });
}

async function fetchReferencePricesByDate(key: string, date: number) {
  const url = process.env.MELON_RATES_API;
  const btcQueryAddress = `${url}/api/day-average?base=ETH&quote=BTC&day=${date}`;
  const usdQueryAddress = `${url}/api/day-average?base=ETH&quote=USD&day=${date}`;
  const eurQueryAddress = `${url}/api/day-average?base=ETH&quote=EUR&day=${date}`;

  try {
    const [btcResponse, usdResponse, eurResponse] = await Promise.all([
      fetch(btcQueryAddress).then((response) => response.json()),
      fetch(usdQueryAddress).then((response) => response.json()),
      fetch(eurQueryAddress).then((response) => response.json()),
    ]);

    return {
      ethbtc: btcResponse.data.rate,
      ethusd: usdResponse.data.rate,
      etheur: eurResponse.data.rate,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export function useFetchReferencePricesByDate(date: Date) {
  const day = findCorrectToTime(date);
  return useQuery(['fetchReferencePrices', day], fetchReferencePricesByDate, {
    refetchOnWindowFocus: false,
  });
}
