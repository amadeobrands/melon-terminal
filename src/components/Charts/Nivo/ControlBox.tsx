import React from 'react';
import { useTheme } from 'styled-components';
import { Serie, ResponsiveLine } from '@nivo/line';
import { LinearScale, LogScale } from '@nivo/scales';
import { subMonths, startOfDay, isAfter, getUnixTime, startOfYear } from 'date-fns';
import * as S from './PriceChart.styles';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { BasicPriceChart } from './BareBones';

/**
 * A price chart can accept and display price data over time for multiple assets.
 *
 * The query that feeds data to the chart should be called using the useLazyTheGraphQuery hook, which
 * will return a trigger function along with the query data. The trigger function accepts a timestamp
 * as a number and updates the query and results accordingly (used on the zoom buttons).
 *
 * Its recommended to wrap this chart component in a parent component that will handle managing a fund's context,
 * the chart's state, and calling the hooks that query TheGraph. This implementation has been mocked in storybook.
 *
 * The data that comes back from any TheGraph query will need to be parsed in order to fit the
 * correct shape noted in the LineChartData type below. Notes on how to parse that data below:
 *
 * - Price data must be strictly positive in order to display logarithmic charts, and so as not to
 * screw up the display on linear charts.
 * - Linear charts may have gaps in the data, with the x value passed as a date and the y value passed as null
 * - Always check the date format that comes back from the Graph, as it is in seconds since the epoch and various
 * javascript methods generate timestamps in milliseconds. Compare apples to apples.
 *
 *
 * Other notes:
 * - A logarithmic y axis is not yet possible - a bug within Nivo renders data backwards (highest
 * values at the bottom of the axis) occasionally and unpredictably when the y axis is set to log scale.
 * The corresponding code to toggle log/linear has been commented out but left intact.
 *
 * - The values passed to the trigger function are timestamps. Your query should return all valid
 *  records with values greater than the timestamp passed to the trigger. In the case of the All Time
 *  button, this value is 0.
 */

export interface LineChartData {
  earliestDate: number;
  data: Serie[];
}

export interface LineChartProps {
  triggerFunction: (start: number) => void;
  chartData: LineChartData;
  startDate: number;
  loading: boolean;
}

interface ButtonDate {
  label: string;
  timeStamp: number;
  active: boolean;
  disabled: boolean;
}

export const ControlBox: React.FC<LineChartProps> = (props) => {
  const today = React.useMemo(() => startOfDay(new Date()), []);
  const ytdDate = React.useMemo(() => getUnixTime(startOfYear(new Date())), []);

  const historicalDates = React.useMemo<ButtonDate[]>(() => {
    const options = [
      { label: '1m', timeStamp: getUnixTime(subMonths(today, 1)) },
      { label: '3m', timeStamp: getUnixTime(subMonths(today, 3)) },
      { label: '6m', timeStamp: getUnixTime(subMonths(today, 6)) },
      { label: '1y', timeStamp: getUnixTime(subMonths(today, 12)) },
    ];

    return options.map((item) => ({
      ...item,
      disabled: !props.chartData || isAfter(props.chartData.earliestDate, item.timeStamp),
      active: item.timeStamp === props.startDate,
    }));
  }, [props.chartData, props.startDate, today]);

  return (
    <>
      <S.ControlBox>
        Zoom:
        {historicalDates.map((item, index) => (
          <S.ChartButton
            kind={item.active ? 'success' : 'secondary'}
            disabled={item.disabled}
            size="small"
            key={index}
            onClick={() => props.triggerFunction(item.timeStamp)}
          >
            {item.label}
          </S.ChartButton>
        ))}
        <S.ChartButton
          kind={props.startDate === ytdDate ? 'success' : 'secondary'}
          size="small"
          onClick={() => props.triggerFunction(ytdDate)}
        >
          YTD
        </S.ChartButton>
        <S.ChartButton
          kind={props.startDate === 0 ? 'success' : 'secondary'}
          size="small"
          onClick={() => props.triggerFunction(0)}
        >
          All Time
        </S.ChartButton>
      </S.ControlBox>
      <BasicPriceChart loading={props.loading} chartData={props.chartData} stacked={false} />
    </>
  );
};
