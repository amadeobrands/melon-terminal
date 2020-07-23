import { BigNumber } from 'bignumber.js';
import { endOfMonth, subMonths, addMonths } from 'date-fns';
import { calculateReturn } from '~/utils/finance';
import { MonthendTimelineItem } from '~/hooks/metricsService/useFetchFundPricesByMonthEnd';

export interface DisplayData {
  label?: string;
  date: Date;
  return: BigNumber;
}

export interface MonthlyReturnData {
  maxDigits: number;
  data: {
    ETH: DisplayData[];
    EUR: DisplayData[];
    USD: DisplayData[];
    BTC: DisplayData[];
    BITWISE10?: DisplayData[];
  };
}

/**
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
  today?: Date,
  activeMonths?: number,
  monthsBeforeFund?: number,
  monthsRemaining?: number
): MonthlyReturnData {
  let maxDigits = 0;

  const ethActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
    (item: MonthendTimelineItem, index: number, arr: MonthendTimelineItem[]) => {
      if (index === 0) {
        const rtrn = calculateReturn(new BigNumber(item.calculations.price), new BigNumber(1));
        if (rtrn.toNumber().toString().length > maxDigits) {
          maxDigits = rtrn.toNumber().toString().length;
        }
        return {
          return: rtrn,
          date: new Date(item.timestamp * 1000),
        };
      }

      const rtrn = calculateReturn(
        new BigNumber(item.calculations.price),
        new BigNumber(arr[index - 1].calculations.price)
      );

      if (rtrn.toNumber().toString().length > maxDigits) {
        maxDigits = rtrn.toNumber().toString().length;
      }

      return {
        return: rtrn,
        date: new Date(item.timestamp * 1000),
      };
    }
  );

  const usdActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
    (item: MonthendTimelineItem, index: number, arr: MonthendTimelineItem[]) => {
      if (index === 0) {
        const rtrn = calculateReturn(new BigNumber(item.calculations.price), new BigNumber(1));
        if (rtrn.toString().length > maxDigits) {
          maxDigits = rtrn.toString().length;
        }
        return {
          return: rtrn,
          date: new Date(item.timestamp * 1000),
        };
      }

      const rtrn = calculateReturn(
        new BigNumber(item.calculations.price * item.references.ethusd),
        new BigNumber(arr[index - 1].calculations.price * arr[index - 1].references.ethusd)
      );

      if (rtrn.toString().length > maxDigits) {
        maxDigits = rtrn.toString().length;
      }

      return {
        return: rtrn,
        date: new Date(item.timestamp * 1000),
      };
    }
  );

  const eurActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
    (item: MonthendTimelineItem, index: number, arr: MonthendTimelineItem[]) => {
      if (index === 0) {
        const rtrn = calculateReturn(
          new BigNumber(dayZeroFx.etheur),
          new BigNumber(item.calculations.price * item.references.etheur)
        );
        if (rtrn.toString().length > maxDigits) {
          maxDigits = rtrn.toString().length;
        }
        return {
          return: rtrn,
          date: new Date(item.timestamp * 1000),
        };
      }

      const rtrn = calculateReturn(
        new BigNumber(item.calculations.price * item.references.etheur),
        new BigNumber(arr[index - 1].calculations.price * arr[index - 1].references.etheur)
      );

      if (rtrn.toString().length > maxDigits) {
        maxDigits = rtrn.toString().length;
      }

      return {
        return: rtrn,
        date: new Date(item.timestamp * 1000),
      };
    }
  );

  const btcActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
    (item: MonthendTimelineItem, index: number, arr: MonthendTimelineItem[]) => {
      if (index === 0) {
        const rtrn = calculateReturn(
          new BigNumber(dayZeroFx.ethbtc),
          new BigNumber(item.calculations.price * item.references.ethbtc)
        );
        if (rtrn.toString().length > maxDigits) {
          maxDigits = rtrn.toString().length;
        }
        return {
          return: rtrn,
          date: new Date(item.timestamp * 1000),
        };
      }

      const rtrn = calculateReturn(
        new BigNumber(item.calculations.price * item.references.ethbtc),
        new BigNumber(arr[index - 1].calculations.price * arr[index - 1].references.ethbtc)
      );

      if (rtrn.toString().length > maxDigits) {
        maxDigits = rtrn.toString().length;
      }

      return {
        return: rtrn,
        date: new Date(item.timestamp * 1000),
      };
    }
  );

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

  return { maxDigits: maxDigits, data: aggregatedMonthlyReturns };
}
