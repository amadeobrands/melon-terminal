export function findCorrectFromTime(date: Date) {
  const fromYear = date.getUTCFullYear();
  const fromMonth = date.getUTCMonth();
  const fromDay = date.getUTCDay();
  const beginningOfDay = Date.UTC(fromYear, fromMonth, fromDay, 0, 0, 0, 0) / 1000;
  return beginningOfDay;
}

export function findCorrectToTime(date: Date) {
  const toYear = date.getUTCFullYear();
  const toMonth = date.getUTCMonth();
  const toDay = date.getUTCDay();
  const endOfDay = Date.UTC(toYear, toMonth, toDay, 23, 59, 59, 0) / 1000;
  return endOfDay;
}
