import React from 'react';
import { useTheme } from 'styled-components';
import { Serie, ResponsiveLine } from '@nivo/line';
import * as S from './PriceChart.styles';

export interface StepLineChartProps {
  data: Serie[];
  precision: 'millisecond' | 'second' | 'minute' | 'hour' | 'month' | 'year' | 'day' | undefined;
  minDate: Date;
  area: boolean;
  loading?: boolean;
  format: string;
  tickValues: string;
  minValue: number;
  maxValue: number;
}

export const StepPriceChart: React.FC<StepLineChartProps> = (props) => {
  const theme = useTheme();
  const chartColor = theme.mode === 'light' ? 'accent' : 'set2'; // https://nivo.rocks/guides/colors/
  const extraProps = { areaBaselineValue: props.minValue };
  return (
    <>
      <S.Chart>
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
            precision: props.precision,
            min: props.minDate,
          }}
          xFormat="time: %Y-%m-%d %H:%m"
          yScale={{
            type: 'linear',
            stacked: false,
            reverse: false,
            min: props.minValue,
            max: props.maxValue,
          }}
          lineWidth={3}
          curve="step"
          axisBottom={{
            legendPosition: 'end',
            legendOffset: -10,
            format: props.format,
            orient: 'bottom',
            tickValues: props.tickValues,
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
          enableArea={true} // fills in the area below the lines
          areaOpacity={0.5} // opacity of the area underneath the lines
          enableSlices="x"
          // tooltip={(props) => {
          //   console.log('asd');
          //   return (
          //     <S.ToolTipContainer>
          //       {/* <S.ToolTipText>Date: {slice.points[0].data.xFormatted}</S.ToolTipText> */}
          //       <S.ToolTipText
          //         style={{
          //           color: props.point.serieColor,
          //           padding: '3px 0',
          //         }}
          //       >
          //         <strong>{props.point.serieId}:</strong> {props.point.data.yFormatted}
          //       </S.ToolTipText>
          //     </S.ToolTipContainer>
          //   );
          // }}
        />
      </S.Chart>
    </>
  );
};
