import React from 'react';
import { useTheme } from 'styled-components';
import { Serie, ResponsiveLine, CustomLayer, Layer } from '@nivo/line';
import * as S from './PriceChart.styles';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { Depth } from './SimpleZoomControl';
import { TimeScale } from '@nivo/scales';
import { subYears, subMonths, subWeeks } from 'date-fns';
import { subDays, min } from 'date-fns/esm';
import { StepPriceChart } from './StepPriceChart';

/**
 * A price chart can accept and display price data over time for multiple assets.
 *
 * The query that feeds data to the chart should be called using the useLazyTheGraphQuery hook, which
 * will return a trigger function along with the query data. The trigger function accepts a timestamp
 * as a number and updates the query and results accordingly (used on the zoom buttons).
 *
 * This simple chart component only receives data. That data should be queried and parsed in a control
 * component that wraps this one e.g. the SimpleZoomControl component. 
 *
 * Various implementation notes:
 * 
 * - A logarithmic y axis is not yet possible - a bug within Nivo renders data backwards (highest
 * values at the bottom of the axis) occasionally and unpredictably when the y axis is set to log scale.
 * The corresponding code to toggle log/linear has been commented out but left intact.
 
 * - The values passed to the trigger function are timestamps. Your query should return all valid
 *  records with values greater than the timestamp passed to the trigger. In the case of the All Time
 *  button, this value is 0.
 */

export interface BasicLineChartProps {
  data: Serie[];
  secondaryData?: Serie[];
  loading?: boolean;
  area: boolean;
  depth: Depth;
}

interface DepthConfiguration {
  precision: TimeScale['precision'];
  tickValues: string;
  format: string;
  minDate: Date;
}

export const SimplePriceChart: React.FC<BasicLineChartProps> = (props) => {
  const theme = useTheme();
  const chartColor = theme.mode === 'light' ? 'set2' : 'accent'; // https://nivo.rocks/guides/colors/

  const [lowestValue, highestValue] = React.useMemo(() => {
    return props.data.reduce<[number, number]>(
      (carry, current) => {
        return current.data.reduce<[number, number]>(([lowest, highest], current) => {
          const value = current.y! as number;
          return [Math.min(value, lowest), Math.max(value, highest)];
        }, carry);
      },
      [Infinity, -Infinity]
    );
  }, [props.data]);

  const [earliestDate, latestDate] = React.useMemo(() => {
    const [min, max] = props.data.reduce<[number, number]>(
      (carry, current) => {
        return current.data.reduce<[number, number]>(([lowest, highest], current) => {
          const value = current.x! as Date;
          return [Math.min(value.getTime(), lowest), Math.max(value.getTime(), highest)];
        }, carry);
      },
      [Infinity, -Infinity]
    );

    return [new Date(min), new Date(max)];
  }, [props.data]);

  const chartConfig = React.useMemo(() => {
    const depthMapping: { [depth in Depth]: DepthConfiguration } = {
      '1d': {
        precision: 'hour',
        format: '%H:%m (%b %d)',
        tickValues: 'every 4 hours',
        minDate: subDays(Date.now(), 1),
      },
      '1w': {
        precision: 'day',
        format: '%b %d',
        tickValues: 'every day',
        minDate: subWeeks(Date.now(), 1),
      },
      '1m': {
        precision: 'day',
        format: '%b %d',
        tickValues: 'every 5 days',
        minDate: subMonths(Date.now(), 1),
      },
      '3m': {
        precision: 'month',
        format: '%b %d',
        tickValues: 'every 2 weeks',
        minDate: subMonths(Date.now(), 3),
      },
      '6m': {
        precision: 'month',
        format: '%b %d',
        tickValues: 'every month',
        minDate: subMonths(Date.now(), 6),
      },
      '1y': {
        precision: 'month',
        format: '%b %d',
        tickValues: 'every month',
        minDate: subYears(Date.now(), 1),
      },
    };

    const depthConfig = depthMapping[props.depth];

    return {
      ...depthConfig,
      minDate: min([earliestDate, depthConfig.minDate]),
    };
  }, [props.depth, earliestDate]);

  const valueMargin = (highestValue - lowestValue) * 0.1;
  const minValue = lowestValue - valueMargin;
  const maxValue = highestValue;

  const secondaryLayer = () => {
    if (props.secondaryData) {
      return (
        <StepPriceChart
          data={props.secondaryData}
          precision={chartConfig.precision}
          minDate={chartConfig.minDate}
          area={true}
          format={chartConfig.format}
          tickValues={chartConfig.tickValues}
          minValue={minValue}
          maxValue={maxValue}
        />
      );
    }
  };

  const areaProp = props.secondaryData ? true : false;

  const layersProp = ['grid', 'markers', 'axes', secondaryLayer, 'lines', 'slices', 'points', 'legends'] as Layer[];

  // TODO: This value is currently incorrectly typed: https://github.com/plouc/nivo/pull/961
  const extraProps = { areaBaselineValue: minValue };

  return (
    <>
      <S.Chart>
        {props.loading ? (
          <Spinner />
        ) : (
          <ResponsiveLine
            {...extraProps}
            data={props.data}
            theme={theme.chartColors}
            colors={{ scheme: chartColor }} // data colors
            animate={false}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            xScale={{
              type: 'time',
              format: 'native',
              precision: chartConfig.precision,
            }}
            xFormat="time: %Y-%m-%d %H:%m"
            yScale={{
              type: 'linear',
              stacked: false,
              reverse: false,
              min: minValue,
              max: maxValue,
            }}
            // layers={layersProp}
            lineWidth={3}
            curve="monotoneX"
            axisBottom={{
              legendPosition: 'end',
              legendOffset: -10,
              format: chartConfig.format,
              orient: 'bottom',
              tickValues: chartConfig.tickValues,
              tickSize: 5,
              tickPadding: 10,
              tickRotation: 0,
            }}
            axisLeft={{
              orient: 'left',
              tickSize: 5,
              tickPadding: 10,
              tickRotation: 0,
              legendOffset: 10,
              legendPosition: 'middle',
              legend: 'Price (ETH)',
            }}
            crosshairType="bottom-left" // sets the type of crosshair (though I can't get it to change)
            enablePoints={false} // enables point graphics for each data point (defaults to true)
            enableGridX={false}
            enableGridY={true}
            enableArea={areaProp} // fills in the area below the lines
            areaOpacity={0.5} // opacity of the area underneath the lines
            enableSlices="x"
            tooltip={(props) => {
              return (
                <S.ToolTipContainer>
                  <S.ToolTipText>Date: {props.point.data.xFormatted}</S.ToolTipText>
                  <S.ToolTipText
                    style={{
                      color: props.point.serieColor,
                      padding: '3px 0',
                    }}
                  >
                    <strong>{props.point.serieId}:</strong> {props.point.data.yFormatted}
                  </S.ToolTipText>
                </S.ToolTipContainer>
              );
            }}
          />
        )}
      </S.Chart>
    </>
  );
};
