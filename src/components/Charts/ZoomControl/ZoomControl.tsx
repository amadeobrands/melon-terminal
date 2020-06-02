import React from 'react';
import * as S from './ZoomControl.styles';
import { subDays, subWeeks, subMonths } from 'date-fns';

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

export interface Serie {
  id: string;
  name?: string;
  type?: string;
  data: Datum[];
}

export interface Datum {
  x: number | string | Date;
  y: number | string;
}

interface ZoomOption {
  value: Depth;
  label: string;
  active?: boolean;
  disabled?: boolean | undefined;
  timestamp: number;
}

export type Depth = '1d' | '1w' | '1m' | '3m' | '6m' | '1y';

export interface LineChartProps {
  depth: Depth;
  setDepth: (depth: Depth) => void;
  fundInceptionDate: Date | undefined;
}

export const ZoomControl: React.FC<LineChartProps> = (props) => {
  const today = new Date();
  const fundInceptionDate: undefined | number = props.fundInceptionDate && props.fundInceptionDate.getTime();

  const options = React.useMemo<ZoomOption[]>(() => {
    const options: ZoomOption[] = [
      { label: '1d', value: '1d', timestamp: subDays(today, 1).getTime() },
      { label: '1w', value: '1w', timestamp: subWeeks(today, 1).getTime() },
      { label: '1m', value: '1m', timestamp: subMonths(today, 1).getTime() },
      { label: '3m', value: '3m', timestamp: subMonths(today, 3).getTime() },
      { label: '6m', value: '6m', timestamp: subMonths(today, 6).getTime() },
      { label: '1y', value: '1y', timestamp: subMonths(today, 12).getTime() },
    ];

    return options.map((item) => ({
      ...item,
      active: item.value === props.depth,
      disabled: fundInceptionDate ? item.timestamp < fundInceptionDate : undefined,
    }));
  }, [props.depth]);

  return (
    <>
      <S.ControlBox>
        Zoom:<span></span>
        {options.map((item, index) => (
          <S.ChartButton
            kind={item.active ? 'success' : 'secondary'}
            disabled={item.disabled}
            size="small"
            key={index}
            onClick={() => props.setDepth(item.value)}
          >
            {item.label}
          </S.ChartButton>
        ))}
      </S.ControlBox>
    </>
  );
};
