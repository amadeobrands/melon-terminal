import React from 'react';
import { useTheme } from 'styled-components';
import { Serie, ResponsiveLine } from '@nivo/line';
import { LinearScale, LogScale } from '@nivo/scales';
import { subMonths, isBefore, subWeeks, getUnixTime } from 'date-fns';
import * as S from './Nivo.styles';

/**
 * The price chart must be passed a generator function that accepts the start date (currently defaulting to 1m)
 * and returns the earliest unix timestamp for a collection of data (in order to show the All Time sort button)
 * and an array of Serie objects containing the data to be displayed.
 *
 * Price data must be strictly positive in order to display logarithmic charts, and so as not to
 * screw up the display on linear charts.
 *
 * Linear charts may have gaps in the data, with the y value passed as null
 *
 * A logarithmic y axis is not yet possible - a bug within Nivo renders data backwards (highest
 * values at the bottom of the axis) occasionally and unpredictably. The corresponding code to
 * toggle log/linear has been commented out but left intact.
 *
 */
export interface NivoProps {
  generator: (startDate: number) => { earliestDate: number; data: Serie[] };
}

interface ButtonDate {
  label: '1w' | '1m' | '2m' | '3m' | '6m' | '1y' | 'All Time';
  timeStamp: number;
}

// min should maybe be dynamic based on the lowest value that gets passed in through the generator
const linearProps = { type: 'linear', min: 'auto', max: 'auto', reverse: false } as LinearScale;
const logProps = { type: 'log', max: 'auto', min: 'auto' } as LogScale;

export const Nivo: React.FC<NivoProps> = ({ generator }, ...props) => {
  const [yScaleType, setYScaleType] = React.useState<'linear' | 'log'>('linear');
  const today = React.useMemo(() => new Date(), []);
  const yScale = React.useMemo(() => (yScaleType === 'linear' ? linearProps : logProps), [yScaleType]);

  const areaProp = false;
  const theme = useTheme();

  const historicalDates = [
    { label: '1w', timeStamp: getUnixTime(subWeeks(today, 1)) },
    { label: '1m', timeStamp: getUnixTime(subMonths(today, 1)) },
    { label: '2m', timeStamp: getUnixTime(subMonths(today, 2)) },
    { label: '3m', timeStamp: getUnixTime(subMonths(today, 3)) },
    { label: '6m', timeStamp: getUnixTime(subMonths(today, 6)) },
    { label: '1y', timeStamp: getUnixTime(subMonths(today, 12)) },
  ] as ButtonDate[];

  const [startDate, setStartDate] = React.useState<number>(historicalDates[1].timeStamp);

  const [activeButton, setActiveButton] = React.useState<number>(historicalDates[1].timeStamp);

  const tickFrequency = React.useMemo(() => {
    if (isBefore(startDate, historicalDates[4].timeStamp)) {
      return 'every month';
    } else if (isBefore(startDate, historicalDates[1].timeStamp)) {
      return 'every week';
    } else {
      return 'every day';
    }
  }, [startDate, today]);

  const queryData = React.useMemo(() => {
    return generator(startDate);
  }, [today, startDate, generator]);

  queryData && historicalDates.push({ label: 'All Time', timeStamp: queryData.earliestDate });

  const dateButtonHandler = (date: ButtonDate) => {
    setActiveButton(date.timeStamp);
    setStartDate(date.timeStamp);
  };

  // const scaleButtonHandler = (type: 'linear' | 'log') => {
  //   setYScaleType(type === 'linear' ? 'log' : 'linear');
  // };

  console.log(queryData);
  const chartColor = theme.mode === 'light' ? 'set2' : 'accent'; // https://nivo.rocks/guides/colors/

  const legendTextColor = theme.mainColors.textColor;

  return (
    <>
      <S.Chart>
        <S.ControlBox>
          Zoom:
          {historicalDates.map((date, index) => {
            if (isBefore(queryData.earliestDate, date.timeStamp) || date.timeStamp === queryData.earliestDate) {
              return (
                <S.ChartButton
                  kind={activeButton === date.timeStamp ? 'success' : 'secondary'}
                  size="small"
                  key={index}
                  onClick={() => dateButtonHandler(date)}
                >
                  {date.label}
                </S.ChartButton>
              );
            }
          })}
          {/* <S.ChartButton size="small" onClick={() => scaleButtonHandler(yScaleType)}>
            {yScaleType === 'linear' ? 'Log Scale' : 'Linear Scale'}
          </S.ChartButton> */}
        </S.ControlBox>

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
            legend: 'Date',
            legendPosition: 'end',
            legendOffset: -10,
            format: '%d %b',
            orient: 'bottom',
            tickValues: tickFrequency,
            tickSize: 5,
            tickPadding: 10,
            tickRotation: 45,
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
          sliceTooltip={({ slice }) => {
            return (
              <S.ToolTipContainer>
                <S.ToolTipText>Date: {slice.points[0].data.xFormatted}</S.ToolTipText>
                {slice.points.map(point => (
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
    </>
  );
};
