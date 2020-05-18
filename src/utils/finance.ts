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

function average(data: number[]) {
  const sum = data.reduce((s, value) => {
    return s + value;
  }, 0);

  const avg = sum / data.length;
  return avg;
}

/**
 * Returns a string representing the percentage return of the asset given the current price and some historical price
 * @param currentPx a BigNumber representing the current price of the asset
 * @param historicalPx a BigNumber representing the historical price against which you're measuring
 */
export function calculateReturn(currentPx: BigNumber, historicalPx: BigNumber) {
  return historicalPx && currentPx && currentPx.dividedBy(historicalPx).minus(1).multipliedBy(100);
}
