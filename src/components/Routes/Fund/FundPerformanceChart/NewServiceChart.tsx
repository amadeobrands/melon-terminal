import React from 'react';
import BigNumber from 'bignumber.js';
import { useQuery } from 'react-query';
import { Block } from '~/storybook/Block/Block';
import { SectionTitle } from '~/storybook/Title/Title';
import { SimpleZoomControl } from '~/components/Charts/Nivo/SimpleZoomControl';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { Datum, Serie } from '@nivo/line';
import { useFundSharePriceQuery } from './SharePriceQuery';

export interface NewFundPerformanceChartProps {
  address: string;
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
  sharePrice?: number;
  price?: number;
  gav: number;
  nav: number;
}

export type Depth = '1y' | '6m' | '3m' | '1m' | '1w' | '1d';

async function fetchFundHistory(key: string, fund: string, depth: Depth) {
  const api = process.env.MELON_METRICS_API;
  const url = `${api}/api/portfolio?address=${fund}&depth=${depth}`;
  console.log(url);

  const response = await fetch(url).then((res) => res.json());
  const data = (response.data as TimelineItem[]).map<Datum>((item) => ({
    x: new Date(item.timestamp * 1000),
    y: new BigNumber(item.price!).toPrecision(8),
  }));

  return data;
}

export function useFundHistory(fund: string, depth: Depth) {
  const address = React.useMemo(() => fund.toLowerCase(), [fund]);
  return useQuery(['prices', address, depth], fetchFundHistory, {
    refetchOnWindowFocus: false,
  });
}

export const NewFundPerformanceChart: React.FC<NewFundPerformanceChartProps> = (props) => {
  const [depth, setDepth] = React.useState<Depth>('1m');
  const { data, error, isFetching } = useFundHistory(props.address, depth);
  const secondaryData = useFundSharePriceQuery(props.address);
  const series = React.useMemo(() => {
    return [{ id: props.address, data }] as Serie[];
  }, [data]);

  return (
    <Block>
      <SectionTitle>Fund Share Price Over Time</SectionTitle>
      {error ? (
        <SectionTitle>Test</SectionTitle>
      ) : data ? (
        <SimpleZoomControl setDepth={setDepth} depth={depth} data={series} loading={isFetching} />
      ) : (
        <Spinner />
      )}
    </Block>
  );
};
