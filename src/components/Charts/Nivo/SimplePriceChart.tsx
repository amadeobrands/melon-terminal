import React from 'react';
import { useTheme } from 'styled-components';
import { Serie, ResponsiveLine } from '@nivo/line';
import { LinearScale } from '@nivo/scales';
import * as S from './PriceChart.styles';
import { Spinner } from '~/storybook/Spinner/Spinner';

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

export interface LineChartData {
  earliestDate: number;
  data: Serie[];
}

export interface BasicLineChartProps {
  chartData?: LineChartData;
  loading: boolean;
  stacked: boolean;
  area: boolean;
}

const stackedProps = { type: 'linear', min: 'auto', stacked: true, max: 'auto', reverse: false } as LinearScale;
const nonStackedProps = { type: 'linear', min: 'auto', stacked: false, max: 'auto', reverse: false } as LinearScale;

export const SimplePriceChart: React.FC<BasicLineChartProps> = (props) => {
  const yScale = props.stacked ? stackedProps : nonStackedProps;
  const areaProp = false;
  const theme = useTheme();

  const chartColor = theme.mode === 'light' ? 'set2' : 'accent'; // https://nivo.rocks/guides/colors/

  return (
    <>
      <S.Chart>
        {props.loading ? (
          <Spinner />
        ) : (
          <ResponsiveLine
            data={props.chartData?.data ?? []}
            theme={theme.chartColors}
            colors={{ scheme: chartColor }} // data colors
            animate={false}
            margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
            xScale={{ type: 'time', format: 'native', precision: 'day' }} // format: 'native', precision: 'day' }}
            xFormat="time: %Y-%m-%d %H:%m"
            yScale={yScale}
            axisTop={null}
            // layers={['crosshair']}
            axisRight={null}
            curve="natural"
            axisBottom={{
              legendPosition: 'end',
              legendOffset: -10,
              format: '%d %b',
              orient: 'bottom',
              tickValues: 'every month',
              tickSize: 5,
              tickPadding: 10,
              tickRotation: 0,
            }}
            axisLeft={{
              orient: 'left',
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legendOffset: 10,
              legendPosition: 'end',
              legend: 'Price (ETH)',
            }}
            enableSlices={'x'} // enables tool tip display of data at each point of axis passed
            enableCrosshair={true} // enables a crosshair for the tooltip
            crosshairType="cross" // sets the type of crosshair (though I can't get it to change)
            enablePoints={false} // enables point graphics for each data point (defaults to true)
            enableArea={areaProp} // fills in the area below the lines
            areaOpacity={0.75} // opacity of the area underneath the lines
            sliceTooltip={({ slice }) => {
              return (
                <S.ToolTipContainer>
                  <S.ToolTipText>Date: {slice.points[0].data.xFormatted}</S.ToolTipText>
                  {slice.points.map((point) => (
                    <S.ToolTipText
                      key={point.id}
                      style={{
                        color: point.serieColor,
                        padding: '3px 0',
                      }}
                    >
                      <strong>{point.serieId}:</strong> {point.data.yFormatted}
                    </S.ToolTipText>
                  ))}
                </S.ToolTipContainer>
              );
            }}
          />
        )}
      </S.Chart>
    </>
  );
};
