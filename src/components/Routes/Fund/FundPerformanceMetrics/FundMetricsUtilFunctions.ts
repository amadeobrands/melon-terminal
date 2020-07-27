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
      const previous = index === 0 ? new BigNumber(1) : new BigNumber(arr[index - 1].calculations.price);
      const rtrn = calculateReturn(new BigNumber(item.calculations.price), previous);

      if (rtrn.toPrecision(2).toString().length > maxDigits) {
        maxDigits = rtrn.toPrecision(2).toString().length;
      }

      return {
        return: rtrn,
        date: new Date(item.timestamp * 1000),
      };
    }
  );

  const usdActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
    (item: MonthendTimelineItem, index: number, arr: MonthendTimelineItem[]) => {
      const previous =
        index === 0
          ? new BigNumber(dayZeroFx.ethusd)
          : new BigNumber(arr[index - 1].calculations.price * arr[index - 1].references.ethusd);

      const rtrn = calculateReturn(new BigNumber(item.calculations.price * item.references.ethusd), previous);

      if (rtrn.toPrecision(2).toString().length > maxDigits) {
        maxDigits = rtrn.toPrecision(2).toString().length;
      }

      return {
        return: rtrn,
        date: new Date(item.timestamp * 1000),
      };
    }
  );

  const eurActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
    (item: MonthendTimelineItem, index: number, arr: MonthendTimelineItem[]) => {
      const previous =
        index === 0
          ? new BigNumber(dayZeroFx.etheur)
          : new BigNumber(arr[index - 1].calculations.price * arr[index - 1].references.etheur);
      const rtrn = calculateReturn(new BigNumber(item.calculations.price * item.references.etheur), previous);

      if (rtrn.toPrecision(2).toString().length > maxDigits) {
        maxDigits = rtrn.toPrecision(2).toString().length;
      }

      return {
        return: rtrn,
        date: new Date(item.timestamp * 1000),
      };
    }
  );

  const btcActiveMonthReturns: DisplayData[] = monthlyReturnData.map(
    (item: MonthendTimelineItem, index: number, arr: MonthendTimelineItem[]) => {
      const previous =
        index === 0
          ? new BigNumber(dayZeroFx.ethbtc)
          : new BigNumber(arr[index - 1].calculations.price * arr[index - 1].references.ethbtc);

      const rtrn = calculateReturn(new BigNumber(item.calculations.price * item.references.ethbtc), previous);

      if (rtrn.toPrecision(2).toString().length > maxDigits) {
        maxDigits = rtrn.toPrecision(2).toString().length;
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
  // add 2 to maxDigits to account for % and -
  return { maxDigits: maxDigits, data: aggregatedMonthlyReturns };
}
