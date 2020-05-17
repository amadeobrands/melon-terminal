import React from 'react';
import { Serie } from '@nivo/line';
import { SimplePriceChart } from './SimplePriceChart';
import * as S from './PriceChart.styles';

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

interface ZoomOption {
  value: Depth;
  label: string;
  active?: boolean;
}

export type Depth = '1d' | '1w' | '1m' | '3m' | '6m' | '1y';

export interface LineChartProps {
  loading?: boolean;
  depth: Depth;
  data: Serie[];
  setDepth: (depth: Depth) => void;
}

export const SimpleZoomControl: React.FC<LineChartProps> = (props) => {
  const options = React.useMemo<ZoomOption[]>(() => {
    const options: ZoomOption[] = [
      { label: '1d', value: '1d' },
      { label: '1w', value: '1w' },
      { label: '1m', value: '1m' },
      { label: '3m', value: '3m' },
      { label: '6m', value: '6m' },
      { label: '1y', value: '1y' },
    ];

    return options.map((item) => ({
      ...item,
      active: item.value === props.depth,
    }));
  }, [props.depth]);

  return (
    <>
      <S.ControlBox>
        Zoom:
        {options.map((item, index) => (
          <S.ChartButton
            kind={item.active ? 'success' : 'secondary'}
            size="small"
            key={index}
            onClick={() => props.setDepth(item.value)}
          >
            {item.label}
          </S.ChartButton>
        ))}
      </S.ControlBox>

      <SimplePriceChart area={false} loading={props.loading} data={props.data} stacked={false} />
    </>
  );
};
