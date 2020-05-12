import React from 'react';
import { Serie } from '@nivo/line';
import { subMonths, startOfDay, isAfter, startOfYear } from 'date-fns';
import * as S from './PriceChart.styles';
import { BasicPriceChart } from './SimplePriceChart';
import { findCorrectFromTime } from '~/utils/priceServiceDates';

/**
 * This component wraps a SimplePriceChart and controls the fetching and parsing of data that
 * gets passed to it.
 *
 * The query that feeds data to the this control component should return a trigger function
 * along with the query data. The trigger function accepts a timestamp as a number and updates
 * the query and results accordingly (used on the zoom buttons).
 *
 * Its recommended to wrap this chart component in a parent component that will handle managing
 * a fund's context, the chart's state, and calling the hooks that query the price service API.
 * This implementation has been mocked in storybook.
 *
 * Notes on how to prepare data for the SimplePriceChart below:
 *
 * - Price data must be strictly positive in order to display logarithmic charts, and so as not to
 * screw up the display on linear charts.
 * - Linear charts may have gaps in the data, with the x value passed as a date and the y value
 * passed as null
 * - Dates should be passed as the x value as a native javascript date object. If your data isn't showing
 * up on the chart, dates should be the first place you look.
 *
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
  fundCreation: number;
}

interface ButtonDate {
  label: string;
  timeStamp: number;
  active: boolean;
  disabled: boolean;
}

export const SimpleZoomControl: React.FC<LineChartProps> = (props) => {
  const today = React.useMemo(() => startOfDay(new Date()), []);
  const ytdDate = React.useMemo(() => findCorrectFromTime(startOfYear(new Date())), []);

  const historicalDates = React.useMemo<ButtonDate[]>(() => {
    const options = [
      { label: '1m', timeStamp: findCorrectFromTime(subMonths(today, 1)) },
      { label: '3m', timeStamp: findCorrectFromTime(subMonths(today, 3)) },
      { label: '6m', timeStamp: findCorrectFromTime(subMonths(today, 6)) },
      { label: '1y', timeStamp: findCorrectFromTime(subMonths(today, 12)) },
    ];

    return options.map((item) => ({
      ...item,
      disabled: !props.chartData || isAfter(props.fundCreation, item.timeStamp),
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
          kind={props.startDate === props.fundCreation ? 'success' : 'secondary'}
          size="small"
          onClick={() => props.triggerFunction(props.fundCreation)}
        >
          All Time
        </S.ChartButton>
      </S.ControlBox>
      <BasicPriceChart area={false} loading={props.loading} chartData={props.chartData} stacked={false} />
    </>
  );
};
