import * as React from 'react';
import { useFund } from '~/hooks/useFund';
import { useQuery } from 'react-query';
import { standardDeviation } from '~/utils/finance';

export interface IFundMetricsProps {}
/**
 * display a fund's volatility and performance over a given time period
 *  - get fund address
 *  - get time period to query (1d 1wk etc)
 *  - query metrics endpoint
 *  - parse response
 *  - calculate return
 *  - calculate vol
 *
 * dislay a given token's volatility and performance over a given time period
 * - check out prices API
 *
 */

type Depth = '1y' | '6m' | '3m' | '1m' | '1w' | '1d';

async function fetchFundHistory(key: string, fund: string, depth: Depth) {
  const api = process.env.MELON_METRICS_API;
  const url = `https://metrics.avantgarde.finance/api/portfolio?address=${fund}&depth=${depth}`;
  console.log(url);
  const response = await fetch(url).then((res) => res.json());
  console.log(response);
  const data = response.data.map((item) => item.price);
  return data;
}

function useFundHistory(fund: string, depth: Depth) {
  return useQuery(['prices', fund, depth], fetchFundHistory, {
    refetchOnWindowFocus: false,
  });
}

export default function FundMetrics(props: IFundMetricsProps) {
  const context = useFund();
  const fundAddress = context.address!.toLowerCase();
  const [depth, setDepth] = React.useState<Depth>('1m');
  const { data, error, isFetching } = useFundHistory(fundAddress, depth);

  const fundVol = data && standardDeviation(data);

  return <div></div>;
}
