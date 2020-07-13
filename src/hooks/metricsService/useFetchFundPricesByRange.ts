import { useQuery } from 'react-query';

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
async function fetchFundPricesByRange(key: string, address: string, from: number, to: number) {
  const url = process.env.MELON_METRICS_API;
  const queryAddress = `${url}/api/range?address=${address}&from=${from}&to=${to}`;
  const response = await fetch(queryAddress)
    .then((response) => response.json())
    .catch((error) => console.log(error));
  return response;
}

export function useFetchFundPricesByRange(fund: string, from: number, to: number) {
  const address = fund.toLowerCase();
  const key = 'range';
  return useQuery([key, address, from, to], fetchFundPricesByRange, {
    refetchOnWindowFocus: false,
  });
}
