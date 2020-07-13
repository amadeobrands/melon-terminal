import { useQuery } from 'react-query';

interface DepthTimelineItem {
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

export type Depth = '1y' | '6m' | '3m' | '1m' | '1w' | '1d';

async function fetchFundPricesByDepth(key: string, fund: string, depth: Depth) {
  const api = process.env.MELON_METRICS_API;
  const url = `${api}/api/depth/onchain?address=${fund}&depth=${depth}`;
  const response = await fetch(url)
    .then((res) => res.json())
    .catch((error) => console.log(error));
  return response;
}

export function useFetchFundPricesByDepth(fund: string, depth: Depth) {
  const address = fund.toLowerCase();
  const key = 'depth';
  return useQuery([key, address, depth], fetchFundPricesByDepth, {
    refetchOnWindowFocus: false,
  });
}
