import { useQuery } from 'react-query';
import { BigNumber } from 'bignumber.js';
import { findCorrectToTime } from '~/utils/priceServiceDates';
import { endOfMonth, subMonths, addMonths } from 'date-fns';
import { calculateReturn } from '~/utils/finance';

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

export interface DisplayData {
  label?: string;
  date: Date;
  return: BigNumber;
}

export interface MonthlyReturnData {
  ETH: DisplayData[];
  EUR: DisplayData[];
  USD: DisplayData[];
  BTC: DisplayData[];
  BITWISE10?: DisplayData[];
}

/**
 *
 * @param monthlyReturnData the data returned from a monthend call to our metrics service
 * @param dayZeroFx an object with the ethusd, etheur, and ethbtc VWAP prices from the day of the fund's inception
 * @param indexReturnData an array of [startOfMonthPrice, endOfMonthPRice] prices generated from the call to the bitwise api above
 * optional params: for generating the empty padding arrays to display in a table
 * @param today Today as a date.
 * @param activeMonths The total number of months a fund has been active
 * @param monthsBeforeFund The months before the fund was created in the year the fund was created,
 * @param monthsRemaining The months remaining in the current year
 */

export function monthlyReturnsFromTimeline(
  monthlyReturnData: MonthendTimelineItem[],
  dayZeroFx: {
    ethbtc: number;
    ethusd: number;
    etheur: number;
  },
  indexReturnData?: BigNumber[][],
  today?: Date,
  activeMonths?: number,
  monthsBeforeFund?: number,
  monthsRemaining?: number
): MonthlyReturnData {
  const ethActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
    (item: MonthendTimelineItem, index: number, arr: MonthendTimelineItem[]) => {
      if (index === 0) {
        return {
          return: calculateReturn(new BigNumber(item.calculations.price), new BigNumber(1)),
          date: new Date(item.timestamp * 1000),
        };
      }
      return {
        return: calculateReturn(
          new BigNumber(item.calculations.price),
          new BigNumber(arr[index - 1].calculations.price)
        ),
        date: new Date(item.timestamp * 1000),
      };
    }
  );

  const usdActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
    (item: MonthendTimelineItem, index: number, arr: MonthendTimelineItem[]) => {
      if (index === 0) {
        return {
          return: calculateReturn(
            new BigNumber(dayZeroFx.ethusd),
            new BigNumber(item.calculations.price * item.references.ethusd)
          ),
          date: new Date(item.timestamp * 1000),
        };
      }
      return {
        return: calculateReturn(
          new BigNumber(item.calculations.price * item.references.ethusd),
          new BigNumber(arr[index - 1].calculations.price * arr[index - 1].references.ethusd)
        ),
        date: new Date(item.timestamp * 1000),
      };
    }
  );

  const eurActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
    (item: MonthendTimelineItem, index: number, arr: MonthendTimelineItem[]) => {
      if (index === 0) {
        return {
          return: calculateReturn(
            new BigNumber(dayZeroFx.etheur),
            new BigNumber(item.calculations.price * item.references.etheur)
          ),
          date: new Date(item.timestamp * 1000),
        };
      }
      return {
        return: calculateReturn(
          new BigNumber(item.calculations.price * item.references.etheur),
          new BigNumber(arr[index - 1].calculations.price * arr[index - 1].references.etheur)
        ),
        date: new Date(item.timestamp * 1000),
      };
    }
  );

  const btcActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
    (item: MonthendTimelineItem, index: number, arr: MonthendTimelineItem[]) => {
      if (index === 0) {
        return {
          return: calculateReturn(
            new BigNumber(dayZeroFx.ethbtc),
            new BigNumber(item.calculations.price * item.references.ethbtc)
          ),
          date: new Date(item.timestamp * 1000),
        };
      }
      return {
        return: calculateReturn(
          new BigNumber(item.calculations.price * item.references.ethbtc),
          new BigNumber(arr[index - 1].calculations.price * arr[index - 1].references.ethbtc)
        ),
        date: new Date(item.timestamp * 1000),
      };
    }
  );

  const indexActiveMonthReturns: DisplayData[] | undefined =
    usdActiveMonthReturns && indexReturnData && today
      ? indexReturnData
          .map((item: any, index: number, arr: any[]) => {
            return {
              // gives the index's return over the month. I.e. a dollar invested in the index is now worth $1 + (1*return)
              return: item.length && calculateReturn(item[0], item[item.length - 1]),
            };
          })
          .map((item: { return: BigNumber }, index: number) => {
            return {
              // a dollar's return invested in the fund minus the index's return should be the difference
              return: usdActiveMonthReturns[index]?.return.minus(item.return),
              date: endOfMonth(subMonths(today, index)),
            } as DisplayData;
          })
      : undefined;

  const inactiveMonthReturns: DisplayData[] | undefined =
    today && monthsBeforeFund && activeMonths
      ? new Array(monthsBeforeFund)
          .fill(null)
          .map((item, index: number) => {
            return {
              date: endOfMonth(subMonths(today, index + activeMonths)),
              return: new BigNumber('NaN'),
            } as DisplayData;
          })
          .reverse()
      : undefined;

  const monthsRemainingInYear: DisplayData[] | undefined =
    today && monthsRemaining
      ? new Array(monthsRemaining).fill(null).map((item, index: number) => {
          return { date: endOfMonth(addMonths(today, index + 1)), return: new BigNumber('NaN') } as DisplayData;
        })
      : undefined;

  const aggregatedMonthlyReturns = {
    ETH:
      inactiveMonthReturns && monthsRemainingInYear
        ? inactiveMonthReturns.concat(ethActiveMonthReturns).concat(monthsRemainingInYear)
        : ethActiveMonthReturns,
    USD:
      inactiveMonthReturns && monthsRemainingInYear
        ? inactiveMonthReturns.concat(usdActiveMonthReturns).concat(monthsRemainingInYear)
        : usdActiveMonthReturns,
    EUR:
      inactiveMonthReturns && monthsRemainingInYear
        ? inactiveMonthReturns.concat(eurActiveMonthReturns).concat(monthsRemainingInYear)
        : eurActiveMonthReturns,
    BTC:
      inactiveMonthReturns && monthsRemainingInYear
        ? inactiveMonthReturns.concat(btcActiveMonthReturns).concat(monthsRemainingInYear)
        : btcActiveMonthReturns,
  };

  if (indexReturnData) {
    return {
      BITWISE10:
        inactiveMonthReturns &&
        monthsRemainingInYear &&
        indexActiveMonthReturns &&
        inactiveMonthReturns.concat(indexActiveMonthReturns).concat(monthsRemainingInYear),
      ...aggregatedMonthlyReturns,
    };
  }
  return aggregatedMonthlyReturns;
}
