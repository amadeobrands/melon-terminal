import BigNumber from 'bignumber.js';

import { toBigNumber } from '@melonproject/melonjs';

// export function toTokenBaseUnit(value: BigNumber | string | number | undefined, decimals: number): BigNumber {
//   const val = toBigNumber(value ?? 'NaN');
//   const dec = toBigNumber(decimals ?? 'NaN');
//   return val.multipliedBy(new BigNumber(10).exponentiatedBy(dec)).integerValue();
// }

export function standardDeviation(values: number[]) {
  const avg = average(values);

  const squareDiffs = values.map((value) => {
    const diff = value - avg;
    const sqrDiff = diff * diff;
    return sqrDiff;
  });

  const avgSquareDiff = average(squareDiffs);

  const stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

// function average(data: number[]) {
//   const sum = data.reduce((s, value) => {
//     return s + value;
//   }, 0);

//   const avg = sum / data.length;
//   return avg;
// }

function average(input: BigNumber[] | number[]) {
  const data = typeof input[0] === 'number' ? input.map((item) => new BigNumber(item)) : input;
  const sum = data.reduce((s, value) => {
    return toBigNumber(s).plus(toBigNumber(value));
  }, new BigNumber(0));
  const avg = sum.dividedBy(data.length);
  return avg;
}

/**
 * Returns a string representing the percentage return of the asset given the current price and some historical price
 * @param currentPx a BigNumber representing the current price of the asset
 * @param historicalPx a BigNumber representing the historical price against which you're measuring
 */
export function calculateReturn(currentPx: BigNumber | number, historicalPx: BigNumber | number): BigNumber {
  const current = typeof currentPx === 'number' ? new BigNumber(currentPx) : currentPx;
  const historical = typeof historicalPx === 'number' ? new BigNumber(historicalPx) : historicalPx;

  return current.dividedBy(historical).minus(1).multipliedBy(100);
}

function calculateStdDev(values: BigNumber[]) {
  const avg = average(values);
  const squareDiffs = values.map((value) => {
    const diff = value.minus(avg);
    const sqrDiff = diff.multipliedBy(diff);
    return sqrDiff;
  });
  const variance = average(squareDiffs);
  const stdDev = variance.sqrt().multipliedBy(Math.sqrt(values.length));
  return stdDev;
}

function calculateVAR(values: BigNumber[] | undefined) {
  if (typeof values == 'undefined') {
    return {
      lowZ: 'Fetching Data',
      highZ: 'Fetching Data',
    };
  } else {
    const avg = average(values);
    const squareDiffs = values.map((value) => {
      const diff = value.minus(avg);
      const sqrDiff = diff.multipliedBy(diff);
      return sqrDiff;
    });
    const variance = average(squareDiffs);
    const stdDev = variance.sqrt();
    return {
      lowZ: stdDev.multipliedBy(1.645).multipliedBy(100),
      highZ: stdDev.multipliedBy(2.33).multipliedBy(100),
    };
  }
}

function calculateVolatility(stdDev: BigNumber, observations: number) {
  return stdDev.multipliedBy(Math.sqrt(observations)).multipliedBy(100);
}

function calculateDailyLogReturns(arr: BigNumber[]) {
  return arr.map((price, idx: number) => {
    if (idx > 0) {
      const logReturn = new BigNumber(Math.log(price.toNumber()) - Math.log(arr[idx - 1].toNumber()));
      return logReturn;
    } else {
      return new BigNumber(0);
    }
  });
}

function calculatePeriodReturns(periodPrices: BigNumber[]) {
  return calculateReturn(periodPrices[0], periodPrices[periodPrices.length - 1]);
}
