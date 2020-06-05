import React from 'react';
import BigNumber from 'bignumber.js';
import { useQuery } from 'react-query';
import { Block } from '~/storybook/Block/Block';
import { SectionTitle } from '~/storybook/Title/Title';
import { Serie, Datum } from '~/components/Charts/ZoomControl/ZoomControl';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { PriceChart } from '~/components/Charts/PriceChart/PriceChart';
import styled from 'styled-components';
import { findCorrectToTime } from '~/utils/priceServiceDates';

export interface NewFundPerformanceChartProps {
  address: string;
}

interface DepthTimelineItem {
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

interface RangeTimelineItem {
  timestamp: number;

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
}

export type Depth = '1y' | '6m' | '3m' | '1m' | '1w' | '1d';

const ChartDescription = styled.span`
  text-align: right;
  color: ${(props) => props.theme.mainColors.secondaryDark};
  font-size: ${(props) => props.theme.fontSizes.s};
  margin-bottom: ${(props) => props.theme.spaceUnits.m};
  margin-left: 0;
`;

async function fetchFundHistoryByDepth(key: string, fund: string, depth: Depth) {
  const api = process.env.MELON_METRICS_API;
  const url = `${api}/api/depth?address=${fund}&depth=${depth}`;
  const response = await fetch(url).then((res) => res.json());

  const onChaindata = (response.data as DepthTimelineItem[]).map<Datum>((item) => ({
    x: new Date(item.timestamp * 1000),
    y: new BigNumber(item.onchain.price!).toPrecision(8),
  }));

  const offChainData = (response.data as DepthTimelineItem[]).map<Datum>((item) => ({
    x: new Date(item.timestamp * 1000),
    y: new BigNumber(item.offchain.price!).toPrecision(8),
  }));

  const data = {
    onchain: onChaindata,
    offchain: offChainData,
  };
  console.log(data);
  return data;
}

export function useFundHistoryByDepth(fund: string, depth: Depth) {
  const address = React.useMemo(() => fund.toLowerCase(), [fund]);
  return useQuery(['prices', address, depth], fetchFundHistoryByDepth, {
    refetchOnWindowFocus: false,
  });
}

async function fetchFundHistoryByDate(key: string, fund: string, from: number, to: number) {
  const api = process.env.MELON_METRICS_API;
  const url = `${api}/api/range?address=${fund}&from=${from}&to=${to}`;
  const response = await fetch(url).then((res) => res.json());

  const priceData = (response.data as RangeTimelineItem[]).map<Datum>((item) => ({
    x: new Date(item.timestamp * 1000),
    y: new BigNumber(item.onchain.price).toPrecision(8),
  }));

  return priceData;
}

export function useFundHistoryByDate(fund: string, from: number, to: number) {
  const address = React.useMemo(() => fund.toLowerCase(), [fund]);
  return useQuery(['prices', address, from, to], fetchFundHistoryByDate, {
    refetchOnWindowFocus: false,
  });
}

export const NewFundPerformanceChart: React.FC<NewFundPerformanceChartProps> = (props) => {
  const [depth, setDepth] = React.useState<Depth>('1m');
  const [queryType, setQueryType] = React.useState<'depth' | 'date'>('depth');
  const [fromDate, setFromDate] = React.useState<number>(1577750400);

  const { data: byDepthData, error: byDepthError, isFetching: byDepthFetching } = useFundHistoryByDepth(
    props.address,
    depth
  );
  const { data: byDateData, error: byDateError, isFetching: byDateFetching } = useFundHistoryByDate(
    props.address,
    fromDate,
    findCorrectToTime(new Date())
  );

  const primary = React.useMemo(() => {
    return (byDepthData
      ? [{ id: 'on-chain', name: 'On-chain share price', type: 'area', data: byDepthData.onchain }]
      : []) as Serie[];
  }, [byDepthData]);

  const secondary = React.useMemo(() => {
    return (
      byDepthData &&
      ([
        { id: 'off-chain', name: 'Interim share price movements', type: 'line', data: byDepthData.offchain },
      ] as Serie[])
    );
  }, [byDepthData]);

  const dataByDate = React.useMemo(() => {
    return (byDateData
      ? [{ id: 'on-chain', name: 'On-chain share price', type: 'area', data: byDateData }]
      : []) as Serie[];
  }, [byDateData]);

  return (
    <Block>
      <SectionTitle>Share Price</SectionTitle>
      {!byDepthFetching && !byDateFetching && !byDepthError && !byDateError ? (
        <>
          <PriceChart
            setDepth={setDepth}
            setDate={setFromDate}
            setQueryType={setQueryType}
            queryType={queryType}
            queryFromDate={fromDate}
            depth={depth}
            data={queryType === 'depth' ? primary : dataByDate}
            secondaryData={queryType === 'depth' ? secondary : undefined}
            loading={byDepthFetching || byDateFetching}
          />
        </>
      ) : (
        <Spinner />
      )}
    </Block>
  );
};
