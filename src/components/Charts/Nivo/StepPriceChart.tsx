import React from 'react';
import { useTheme } from 'styled-components';
import { Serie, ResponsiveLine } from '@nivo/line';
import * as S from './PriceChart.styles';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { Depth } from './SimpleZoomControl';
import { TimeScale } from '@nivo/scales';
import { subYears, subMonths, subWeeks } from 'date-fns';
import { subDays, min } from 'date-fns/esm';

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

export interface StepLineChartProps {
  data: Serie[];
  loading?: boolean;
}

export const StepPriceChart: React.FC<StepLineChartProps> = (props) => {
  const theme = useTheme();
  const chartColor = theme.mode === 'light' ? 'accent' : 'set2'; // https://nivo.rocks/guides/colors/

  return (
    <>
      <S.Chart>
        <ResponsiveLine
          data={props.data}
          theme={theme.chartColors}
          colors={{ scheme: chartColor }} // data colors
          animate={false}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          lineWidth={3}
          curve="step"
          crosshairType="bottom-left" // sets the type of crosshair (though I can't get it to change)
          enablePoints={true} // enables point graphics for each data point (defaults to true)
          enableGridX={false}
          enableGridY={true}
          enableArea={true} // fills in the area below the lines
          areaOpacity={0.5} // opacity of the area underneath the lines
          enableSlices="x"
          // tooltip={(props) => {
          //   console.log(props.point);
          //   return (
          //     <S.ToolTipContainer>
          //       {/* <S.ToolTipText>Date: {props.point[0].data.xFormatted}</S.ToolTipText> */}
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
