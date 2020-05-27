import React from 'react';
import BigNumber from 'bignumber.js';
import { useQuery } from 'react-query';
import { Block } from '~/storybook/Block/Block';
import { SectionTitle } from '~/storybook/Title/Title';
import { ZoomControl, Serie, Datum } from '~/components/Charts/ZoomControl/ZoomControl';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { PriceChart } from '~/components/Charts/PriceChart/PriceChart';

export interface NewFundPerformanceChartProps {
  address: string;
}

interface TimelineItem {
  timestamp: number;
  rates: {
    [symbol: string]: number;
  };
  prices: {
    [symbol: string]: number;
  };
  holdings: {
    [symbol: string]: number;
  };
  shares: number;
  onchain: {
    price: number;
    gav: number;
    nav: number;
  };
  offchain: {
    price: number;
    gav: number;
    nav: number;
  };
}

export type Depth = '1y' | '6m' | '3m' | '1m' | '1w' | '1d';

async function fetchFundHistory(key: string, fund: string, depth: Depth) {
  const api = process.env.MELON_METRICS_API;
  const url = `${api}/api/portfolio?address=${fund}&depth=${depth}`;

  const response = await fetch(url).then((res) => res.json());

  const onChaindata = (response.data as TimelineItem[]).map<Datum>((item) => ({
    x: new Date(item.timestamp * 1000),
    y: new BigNumber(item.onchain.price!).toPrecision(8),
  }));

  const offChainData = (response.data as TimelineItem[]).map<Datum>((item) => ({
    x: new Date(item.timestamp * 1000),
    y: new BigNumber(item.offchain.price!).toPrecision(8),
  }));

  const data = {
    onchain: onChaindata,
    offchain: offChainData,
  };

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

  const primary = React.useMemo(() => {
    return (data
      ? [{ id: 'on-chain', name: 'On-chain share price', type: 'area', data: data.onchain }]
      : []) as Serie[];
  }, [data]);

  const secondary = React.useMemo(() => {
    return (
      data &&
      ([{ id: 'off-chain', name: 'Interim share price movements', type: 'line', data: data.offchain }] as Serie[])
    );
  }, [data]);

  return (
    <Block>
      <SectionTitle>Share Price</SectionTitle>
      {data ? (
        <PriceChart setDepth={setDepth} depth={depth} data={primary} secondaryData={secondary} loading={isFetching} />
      ) : (
        <Spinner />
      )}
    </Block>
  );
};
