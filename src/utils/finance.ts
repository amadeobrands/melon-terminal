import BigNumber from 'bignumber.js';

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

function average(data: number[] | BigNumber[]) {
  const sum = (data as any[]).reduce((s: BigNumber, value: number | BigNumber) => {
    if (BigNumber.isBigNumber(value)) {
      return s.plus(value);
    }
    return s.plus(new BigNumber(value));
  }, new BigNumber(0));
  const avg = sum.dividedBy(data.length);
  return avg;
}

/**
 * Returns a BigNumber representing the percentage return of the asset given the current price and some historical price
 * @param currentPx a BigNumber representing the current price of the asset
 * @param historicalPx a BigNumber representing the historical price against which you're measuring
 */
export function calculateReturn(currentPx: BigNumber | number, historicalPx: BigNumber | number): BigNumber {
  const current = typeof currentPx === 'number' ? new BigNumber(currentPx) : currentPx;
  const historical = typeof historicalPx === 'number' ? new BigNumber(historicalPx) : historicalPx;
  return current.dividedBy(historical).minus(1).multipliedBy(100);
}

/**
 *
 * @param values is an array of BigNumbers that in most cases will represent an asset's price over time.
 * @returns a BigNumber equal to the standard deviation of those values
 */
export function calculateStdDev(values: BigNumber[]) {
  const avg = average(values);
  const squareDiffs = values.map((value) => {
    const diff = value.minus(avg);
    const sqrDiff = diff.multipliedBy(diff);
    return sqrDiff;
  });
  const variance = average(squareDiffs);
  const stdDev = variance.sqrt();
  return stdDev;
}

/**
 * @param values is an array of BigNumbers that most cases will represent an asset's price over time.
 * @returns an object with two properties - lowZ and highZ - which are both BigNumbers. LowZ represents the
 * maximum expected drawdown per period one can expect in 95% of outcomes. HighZ is 99%.
 */
export function calculateVAR(values: BigNumber[] | undefined) {
  if (typeof values == 'undefined') {
    return {
      lowZ: 'Fetching Data',
      highZ: 'Fetching Data',
    };
  } else {
    const stdDev = calculateStdDev(values);
    return {
      lowZ: stdDev.multipliedBy(1.645).multipliedBy(100),
      highZ: stdDev.multipliedBy(2.33).multipliedBy(100),
    };
  }
}

export function calculateVolatility(values: BigNumber[]) {
  return calculateStdDev(values).multipliedBy(Math.sqrt(values.length)).multipliedBy(100);
}

// export function calculateDailyLogReturns(arr: BigNumber[]) {
//   return arr.map((price, idx: number) => {
//     if (idx > 0) {
//       const logReturn = new BigNumber(Math.log(price.toNumber()) - Math.log(arr[idx - 1].toNumber()));
//       return logReturn;
//     } else {
//       return new BigNumber(0);
//     }
//   });
// }

// export function calculatePeriodReturns(periodPrices: BigNumber[]) {
//   return calculateReturn(periodPrices[0], periodPrices[periodPrices.length - 1]);
// }
