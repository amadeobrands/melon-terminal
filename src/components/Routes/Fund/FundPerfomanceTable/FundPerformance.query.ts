import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';
import { useTheGraphQuery } from '~/hooks/useQuery';
import { startOfQuarter, startOfYear, getUnixTime, subMonths, subYears, startOfDay, subDays } from 'date-fns';
import { useFund } from '~/hooks/useFund';
import { useMemo } from 'react';
import { fromTokenBaseUnit } from '~/utils/fromTokenBaseUnit';
import { calculateReturn } from '~/utils/finance';

export interface FundPerformanceQueryVariables {
  fund: string;
  symbols: string[];
  startOfQuarterDate: BigNumber;
  startOfYearDate: BigNumber;
  oneMonthBackDate: BigNumber;
  sixMonthsBackDate: BigNumber;
  oneYearBackDate: BigNumber;
  inceptionDate: BigNumber;
}

const FundPerformanceQuery = gql`
  fragment AssetPriceHistoryFragment on AssetPriceHistory {
    price
    timestamp
    priceValid
  }

  fragment FundCalculationsHistoryFragment on FundCalculationsHistory {
    sharePrice
    timestamp
    validPrices
  }

  query FundPerformanceQuery(
    $fund: String!
    $symbols: [String!]!
    $startOfQuarterDate: BigInt!
    $startOfYearDate: BigInt!
    $oneMonthBackDate: BigInt!
    $sixMonthsBackDate: BigInt!
    $oneYearBackDate: BigInt!
    $inceptionDate: BigInt!
  ) {
    fund(id: $fund) {
      currentPx: calculationsHistory(orderBy: timestamp, orderDirection: desc, first: 1) {
        ...FundCalculationsHistoryFragment
      }
      quarterStartPx: calculationsHistory(where: { timestamp_gt: $startOfQuarterDate }, orderBy: timestamp, first: 1) {
        ...FundCalculationsHistoryFragment
      }
      yearStartPx: calculationsHistory(where: { timestamp_gt: $startOfYearDate }, orderBy: timestamp, first: 1) {
        ...FundCalculationsHistoryFragment
      }
      oneMonthBackPx: calculationsHistory(where: { timestamp_gt: $oneMonthBackDate }, orderBy: timestamp, first: 1) {
        ...FundCalculationsHistoryFragment
      }
      sixMonthsBackPx: calculationsHistory(where: { timestamp_gt: $sixMonthsBackDate }, orderBy: timestamp, first: 1) {
        ...FundCalculationsHistoryFragment
      }
      oneYearBackPx: calculationsHistory(where: { timestamp_gt: $oneYearBackDate }, orderBy: timestamp, first: 1) {
        ...FundCalculationsHistoryFragment
      }
    }

    assets(where: { symbol_in: $symbols }) {
      symbol
      currentPx: priceHistory(orderBy: timestamp, orderDirection: desc, first: 1) {
        ...AssetPriceHistoryFragment
      }
      quarterStartPx: priceHistory(where: { timestamp_gt: $startOfQuarterDate }, orderBy: timestamp, first: 1) {
        ...AssetPriceHistoryFragment
      }
      yearStartPx: priceHistory(where: { timestamp_gt: $startOfYearDate }, orderBy: timestamp, first: 1) {
        ...AssetPriceHistoryFragment
      }
      oneMonthBackPx: priceHistory(where: { timestamp_gt: $oneMonthBackDate }, orderBy: timestamp, first: 1) {
        ...AssetPriceHistoryFragment
      }
      sixMonthsBackPx: priceHistory(where: { timestamp_gt: $sixMonthsBackDate }, orderBy: timestamp, first: 1) {
        ...AssetPriceHistoryFragment
      }
      oneYearBackPx: priceHistory(where: { timestamp_gt: $oneYearBackDate }, orderBy: timestamp, first: 1) {
        ...AssetPriceHistoryFragment
      }
      inceptionDatePx: priceHistory(where: { timestamp_gt: $inceptionDate }, orderBy: timestamp, first: 1) {
        ...AssetPriceHistoryFragment
      }
    }
  }
`;

interface CalculatedReturns {
  qtdReturn: BigNumber;
  ytdReturn: BigNumber;
  oneMonthReturn: BigNumber;
  sixMonthReturn: BigNumber;
  oneYearReturn: BigNumber;
  returnSinceInception: BigNumber;
}

export interface FundCalculatedReturns extends CalculatedReturns {
  name: string;
}

export interface AssetCalculatedReturns extends CalculatedReturns {
  symbol: string;
}

interface FundPerformanceBenchmark {
  sharePrice: number;
  validPrices: boolean;
}

interface FundPerformance {
  currentPx: FundPerformanceBenchmark[];
  quarterStartPx: FundPerformanceBenchmark[];
  yearStartPx: FundPerformanceBenchmark[];
  oneMonthBackPx: FundPerformanceBenchmark[];
  sixMonthsBackPx: FundPerformanceBenchmark[];
  oneYearBackPx: FundPerformanceBenchmark[];
}

interface FundPerformanceParsed {
  currentPx: BigNumber;
  quarterStartPx: BigNumber;
  yearStartPx: BigNumber;
  oneMonthBackPx: BigNumber;
  sixMonthsBackPx: BigNumber;
  oneYearBackPx: BigNumber;
}

interface AssetPerformanceBenchmark {
  price: number;
  timestamp: number;
  priceValid: boolean;
}

interface AssetPerformance {
  symbol: string;
  currentPx: AssetPerformanceBenchmark[];
  quarterStartPx: AssetPerformanceBenchmark[];
  yearStartPx: AssetPerformanceBenchmark[];
  oneMonthBackPx: AssetPerformanceBenchmark[];
  sixMonthsBackPx: AssetPerformanceBenchmark[];
  oneYearBackPx: AssetPerformanceBenchmark[];
  inceptionDatePx: AssetPerformanceBenchmark[];
}

interface AssetPerformanceParsed {
  currentPx: BigNumber;
  quarterStartPx: BigNumber;
  yearStartPx: BigNumber;
  oneMonthBackPx: BigNumber;
  sixMonthsBackPx: BigNumber;
  oneYearBackPx: BigNumber;
  inceptionDatePx: BigNumber;
}

export interface FundPerformanceQueryResult {
  fund: FundPerformance;
  assets: AssetPerformance[];
}

export interface AssetReturnObject {
  [symbol: string]: AssetCalculatedReturns;
}

export const useFundPerformanceQuery = (address: string, symbols: string[]) => {
  const context = useFund()!;

  const args = useMemo(() => {
    const today = new Date();
    return {
      startOfQuarterDate: new BigNumber(getUnixTime(startOfQuarter(today))),
      startOfYearDate: new BigNumber(getUnixTime(startOfYear(today))),
      oneMonthBackDate: new BigNumber(getUnixTime(subMonths(today, 1))),
      sixMonthsBackDate: new BigNumber(getUnixTime(subMonths(today, 6))),
      oneYearBackDate: new BigNumber(getUnixTime(subYears(today, 1))),
    };
  }, []);

  const options = {
    skip: !context.creationTime || symbols.length === 0,
    variables: {
      ...args,
      symbols,
      fund: address.toLowerCase(),
      inceptionDate: context.creationTime ? new BigNumber(context.creationTime.getTime() / 1000) : new BigNumber(0),
    } as FundPerformanceQueryVariables,
  };

  const result = useTheGraphQuery<FundPerformanceQueryResult, FundPerformanceQueryVariables>(
    FundPerformanceQuery,
    options
  );

  const fund = useMemo(() => {
    return result.data?.fund ? computeFundBenchmarkData(result.data.fund, context.name!) : undefined;
  }, [result.data?.fund, context.name]);

  const assets = useMemo(() => {
    return result.data?.assets
      ? assembleAssetReturnObject(result.data?.assets, context.creationTime!.getTime() / 1000)
      : undefined;
  }, [result.data?.assets]);

  return [fund, assets, result] as [typeof fund, typeof assets, typeof result];
};

function computeFundBenchmarkData(input: FundPerformance, name: string): FundCalculatedReturns {
  const nan = new BigNumber('NaN');
  const inceptionPrice = fromTokenBaseUnit(1000000000000000000, 8);
  const keys = [
    'currentPx',
    'quarterStartPx',
    'yearStartPx',
    'oneMonthBackPx',
    'sixMonthsBackPx',
    'oneYearBackPx',
  ] as (keyof FundPerformance)[];

  const data = keys.reduce((carry, key) => {
    const value = input[key] && input[key][0];
    const valid = value?.validPrices;
    return { ...carry, [key]: valid ? fromTokenBaseUnit(value?.sharePrice ?? nan, 8) : nan };
  }, {} as FundPerformanceParsed);

  return {
    name,
    qtdReturn: calculateReturn(data.currentPx, data.quarterStartPx === nan ? inceptionPrice : data.quarterStartPx),
    ytdReturn: calculateReturn(data.currentPx, data.yearStartPx === nan ? inceptionPrice : data.yearStartPx),
    oneMonthReturn: calculateReturn(data.currentPx, data.oneMonthBackPx),
    sixMonthReturn: calculateReturn(data.currentPx, data.sixMonthsBackPx),
    oneYearReturn: calculateReturn(data.currentPx, data.oneYearBackPx),
    returnSinceInception: calculateReturn(data.currentPx, inceptionPrice),
  };
}

function computeAssetBenchmarkData(input: AssetPerformance, fundAge: number): AssetCalculatedReturns {
  const nan = new BigNumber('NaN');
  const keys = [
    'currentPx',
    'quarterStartPx',
    'yearStartPx',
    'oneMonthBackPx',
    'sixMonthsBackPx',
    'oneYearBackPx',
    'inceptionDatePx',
  ] as (keyof Omit<AssetPerformance, 'symbol'>)[];

  const data = keys.reduce((carry, key) => {
    const value = input[key] && input[key][0];
    const valid = value?.priceValid;
    const ageCheck = input[key][0]?.timestamp > fundAge;
    return {
      ...carry,
      [key]:
        valid && ageCheck
          ? fromTokenBaseUnit(value?.price ?? nan, 8)
          : fromTokenBaseUnit(input['inceptionDatePx'][0]?.price, 8),
    };
  }, {} as AssetPerformanceParsed);

  return {
    symbol: input.symbol,
    qtdReturn: calculateReturn(data.currentPx, data.quarterStartPx),
    ytdReturn: calculateReturn(data.currentPx, data.yearStartPx),
    oneMonthReturn: calculateReturn(data.currentPx, data.oneMonthBackPx),
    sixMonthReturn: calculateReturn(data.currentPx, data.sixMonthsBackPx),
    oneYearReturn: calculateReturn(data.currentPx, data.oneYearBackPx),
    returnSinceInception: calculateReturn(data.currentPx, data.inceptionDatePx),
  };
}

function assembleAssetReturnObject(input: AssetPerformance[], fundAge: number): AssetReturnObject {
  const returnObject: AssetReturnObject = input.reduce((carry, asset) => {
    return { ...carry, [asset.symbol]: computeAssetBenchmarkData(asset, fundAge) };
  }, {});

  return returnObject as AssetReturnObject;
}
