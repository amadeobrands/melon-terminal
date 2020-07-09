import React from 'react';
import BigNumber from 'bignumber.js';
import { useQuery } from 'react-query';
import { Block } from '~/storybook/Block/Block';
import { SectionTitle } from '~/storybook/Title/Title';
import { Serie, Datum } from '~/components/Charts/ZoomControl/ZoomControl';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { PriceChart } from '~/components/Charts/PriceChart/PriceChart';
import { findCorrectToTime, findCorrectFromTime } from '~/utils/priceServiceDates';
import { useFund } from '~/hooks/useFund';
import { isBefore, subMonths } from 'date-fns';

export interface NewFundPerformanceChartProps {
  address: string;
}

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

async function fetchOnchainHistoryByDepth(key: string, fund: string, depth: Depth) {
  const api = process.env.MELON_METRICS_API;
  const url = `${api}/api/depth/onchain?address=${fund}&depth=${depth}`;
  const response = await fetch(url).then((res) => res.json());
  const prices = (response.data as DepthTimelineItem[]).map<Datum>((item) => ({
    x: new Date(item.timestamp * 1000),
    y: new BigNumber(item.calculations.price).toPrecision(8),
  }));

  return prices;
}

export function useOnchainFundHistoryByDepth(fund: string, depth: Depth) {
  const address = React.useMemo(() => fund.toLowerCase(), [fund]);
  const key = 'onchainPrices';
  return useQuery([key, address, depth], fetchOnchainHistoryByDepth, {
    refetchOnWindowFocus: false,
  });
}

async function fetchOffchainHistoryByDepth(key: string, fund: string, depth: Depth) {
  const api = process.env.MELON_METRICS_API;
  const url = `${api}/api/depth/offchain?address=${fund}&depth=${depth}`;
  const response = await fetch(url).then((res) => res.json());
  const prices = (response.data as DepthTimelineItem[]).map<Datum>((item) => ({
    x: new Date(item.timestamp * 1000),
    y: new BigNumber(item.calculations.price).toPrecision(8),
  }));
  return prices;
}

function useOffchainFundHistoryByDepth(fund: string, depth: Depth) {
  const address = React.useMemo(() => fund.toLowerCase(), [fund]);
  const key = 'offchainPrices';
  return useQuery([key, address, depth], fetchOffchainHistoryByDepth, {
    refetchOnWindowFocus: false,
  });
}

async function fetchOnchainHistoryByDate(key: string, fund: string, from: number, to: number) {
  const api = process.env.MELON_METRICS_API;
  const url = `${api}/api/range?address=${fund}&from=${from}&to=${to}`;
  const response = await fetch(url).then((res) => res.json());
  const prices = (response.data as DepthTimelineItem[]).map<Datum>((item) => ({
    x: new Date(item.timestamp * 1000),
    y: new BigNumber(item.calculations.price).toPrecision(8),
  }));

  return prices;
}

function useOnchainFundHistoryByDate(fund: string, from: number, to: number) {
  const address = React.useMemo(() => fund.toLowerCase(), [fund]);
  const key = 'pricesByDate';

  return useQuery([key, address, from, to], fetchOnchainHistoryByDate, {
    refetchOnWindowFocus: false,
  });
}

export const NewFundPerformanceChart: React.FC<NewFundPerformanceChartProps> = (props) => {
  const fund = useFund();
  const today = React.useMemo(() => new Date(), []);
  const fundInceptionDate = fund.creationTime;

  const initialQueryType = React.useMemo<'depth' | 'date'>(() => {
    if (isBefore(subMonths(today, 1), fundInceptionDate!)) {
      return 'date';
    }

    return 'depth';
  }, [fund]);

  const [depth, setDepth] = React.useState<Depth>('1m');
  const [queryType, setQueryType] = React.useState<'depth' | 'date'>(initialQueryType);
  const [fromDate, setFromDate] = React.useState<number>(findCorrectFromTime(fundInceptionDate!));

  const {
    data: onchainDataByDepth,
    error: onchainDataByDepthError,
    isFetching: onchainDataByDepthFetching,
  } = useOnchainFundHistoryByDepth(props.address, depth);

  const {
    data: offchainDataByDepth,
    error: offchainDataByDepthError,
    isFetching: offchainDataByDepthFetching,
  } = useOffchainFundHistoryByDepth(props.address, depth);

  const {
    data: onchainDataByDate,
    error: onchainDataByDateError,
    isFetching: onchainDataByDateFetching,
  } = useOnchainFundHistoryByDate(props.address, fromDate, findCorrectToTime(today));

  const formattedOnchainDataByDepth = React.useMemo(() => {
    return (onchainDataByDepth
      ? [{ id: 'on-chain', name: 'On-chain share price', type: 'area', data: onchainDataByDepth }]
      : []) as Serie[];
  }, [onchainDataByDepth]);

  const formattedOffchainDataByDepth = React.useMemo(() => {
    return (
      offchainDataByDepth &&
      ([{ id: 'off-chain', name: 'Interim share price movements', type: 'line', data: offchainDataByDepth }] as Serie[])
    );
  }, [offchainDataByDepth]);

  const formattedOnchainDataByDate = React.useMemo(() => {
    return (onchainDataByDate
      ? [{ id: 'on-chain', name: 'On-chain share price', type: 'area', data: onchainDataByDate }]
      : []) as Serie[];
  }, [onchainDataByDate]);

  return (
    <Block>
      <SectionTitle>Share Price</SectionTitle>
      {(onchainDataByDate || offchainDataByDepth || onchainDataByDate) &&
      !offchainDataByDepthFetching &&
      !offchainDataByDepthFetching &&
      !onchainDataByDateFetching &&
      !onchainDataByDepthError &&
      !offchainDataByDepthError &&
      !onchainDataByDateError ? (
        <>
          <PriceChart
            setDepth={setDepth}
            setDate={setFromDate}
            setQueryType={setQueryType}
            queryType={queryType}
            queryFromDate={fromDate}
            depth={depth}
            data={queryType === 'depth' ? formattedOnchainDataByDepth : formattedOnchainDataByDate}
            secondaryData={queryType === 'depth' ? formattedOffchainDataByDepth : undefined}
            loading={onchainDataByDepthFetching || offchainDataByDepthFetching || onchainDataByDateFetching}
            fundInceptionDate={fundInceptionDate}
          />
        </>
      ) : (
        <Spinner />
      )}
    </Block>
  );
};
