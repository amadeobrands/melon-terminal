import React from 'react';
import { useTheme } from 'styled-components';
import { Serie, ResponsiveLine } from '@nivo/line';
import { LinearScale, LogScale } from '@nivo/scales';
import * as S from './Nivo.styles';
import { subMonths, isBefore, fromUnixTime } from 'date-fns';
import { Button } from '~/storybook/Button/Button.styles';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { ToolTipContainer, ToolTipText, ControlBox } from './ToolTip';

export interface NivoProps {
  generator: (startDate: Date, currentDate: Date) => { earliestDate: number; data: Serie[] };
}

const months = [1, 2, 3, 6, 9, 12];
const linearProps = { type: 'linear', min: 'auto', max: 'auto', reverse: false } as LinearScale;
const logProps = { type: 'log', base: 10, max: 'auto', min: 'auto' } as LogScale;

export const Nivo: React.FC<NivoProps> = ({ generator }, ...props) => {
  const [yScaleType, setYScaleType] = React.useState<'linear' | 'log'>('linear');
  const today = React.useMemo(() => new Date(), []);
  const yScale = React.useMemo(() => (yScaleType === 'linear' ? linearProps : logProps), [yScaleType]);
  const areaProp = React.useMemo(() => (yScaleType === 'linear' ? true : false), [yScaleType]);
  const theme = useTheme();

  const [startDate, setStartDate] = React.useState<Date>(() => {
    return subMonths(today, 3);
  });

  const [tickFrequency, setTickFrequency] = React.useState<'every week' | 'every day'>('every week')



  const queryData = React.useMemo(() => {
    return generator(startDate, today);
  }, [today, startDate]);

  const dateButtonHandler = (num: number) => {
    setStartDate(subMonths(today, num));
  };

  const scaleButtonHandler = (type: 'linear' | 'log') => {
    setYScaleType(type === 'linear' ? 'log' : 'linear');
  };

  const frequencyButtonHandler = (frequency: 'every day' | 'every week') => {
    setTickFrequency(frequency === 'every day' ? 'every week' : 'every day')
  }

  const chartColor = theme.mode == 'light' ? 'set2' : 'accent'; // https://nivo.rocks/guides/colors/
  const legendTextColor = theme.mainColors.textColor
  return (
    <S.Chart>
      <ControlBox>
        <div>
          {months.map((month, index) => {
            if (isBefore(fromUnixTime(queryData.earliestDate), subMonths(today, month))) {
              return (
                <Button size="small" key={index} onClick={() => dateButtonHandler(month)}>
                  <FormattedNumber decimals={0} value={month} />M
                </Button>
              );
            }
          })}
        </div>
        <Button size="small" onClick={() => frequencyButtonHandler(tickFrequency)}>
          {tickFrequency === 'every day' ? 'Weekly Ticks' : 'Daily Ticks'}
        </Button>
        <Button size="small" onClick={() => scaleButtonHandler(yScaleType)}>
          {yScaleType === 'linear' ? 'Log Scale' : 'Linear Scale'}
        </Button>
      </ControlBox>
      <ResponsiveLine
        data={queryData.data}
        theme={theme.chartColors}
        colors={{ scheme: chartColor }} // data colors
        animate={false}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'time', format: '%Y-%m-%d', precision: 'day' }} // format: 'native', precision: 'day' }}
        xFormat="time: %Y-%m-%d"
        yScale={yScale}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          format: '%b %d',
          orient: 'bottom',
          tickValues: tickFrequency, // this should be dynamic based on how long the time series is
          tickSize: 5, // the distance the tick extends from the axis
          tickPadding: 10,
          tickRotation: 45,
        }}
        axisLeft={{
          orient: 'left',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legendOffset: -40,
          legendPosition: 'middle',
        }}
        // enableGridX={false}
        sliceTooltip={({ slice }) => {
          console.log(slice.points[0].data.xFormatted);
          return (
            <ToolTipContainer>
              <ToolTipText>Date: {slice.points[0].data.xFormatted}</ToolTipText>
              {slice.points.map(point => (
                <ToolTipText
                  key={point.id}
                  style={{
                    color: point.serieColor,
                    padding: '3px 0',
                  }}
                >
                  <strong>{point.serieId}:</strong> {point.data.yFormatted}
                </ToolTipText>
              ))}
            </ToolTipContainer>
          );
        }}
        enableSlices={'x'} // enables tool tip display of data at each point of axis passed
        enableCrosshair={true} // enables a crosshair for the tooltip
        crosshairType="cross" // sets the type of crosshair (though I can't get it to change)
        enablePoints={false} // enables point graphics for each data point (defaults to true)
        enableArea={areaProp} // fills in the area below the lines
        areaOpacity={1} // opacity of the area underneath the lines
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 110,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemTextColor: legendTextColor,
            itemWidth: 100,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            padding: { top: 24 },
            symbolShape: 'circle',
            symbolBorderColor: 'rgba(0, 0, 0, .5)',
            effects: [
              {
                on: 'hover',
                style: {
                  itemBackground: 'rgba(0, 0, 0, .03)',
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </S.Chart>
  );
};
