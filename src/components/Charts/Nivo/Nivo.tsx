import React from 'react';
import { useTheme } from 'styled-components';
import { Serie, ResponsiveLine } from '@nivo/line';
import { LinearScale, LogScale } from '@nivo/scales';
import { subMonths, isBefore, fromUnixTime, subWeeks } from 'date-fns';
import { Button } from '~/storybook/Button/Button.styles';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import * as S from './Nivo.styles';

export interface NivoProps {
  generator: (startDate: Date, currentDate: Date) => { earliestDate: number; data: Serie[] };
}

interface ButtonDate {
  tenor: 'W' | 'M';
  number: number;
}

const historicalDates = [
  { tenor: 'W', number: 1 },
  { tenor: 'M', number: 1 },
  { tenor: 'M', number: 2 },
  { tenor: 'M', number: 3 },
  { tenor: 'M', number: 6 },
  { tenor: 'M', number: 9 },
  { tenor: 'M', number: 12 },
] as ButtonDate[];

// min should maybe be dynamic based on the lowest value that gets passed in through the generator
const linearProps = { type: 'linear', min: 0, max: 'auto', reverse: false } as LinearScale;
const logProps = { type: 'log', base: 10, min: 0, max: 'auto' } as LogScale;

export const Nivo: React.FC<NivoProps> = ({ generator }, ...props) => {
  const [yScaleType, setYScaleType] = React.useState<'linear' | 'log'>('linear');
  const today = React.useMemo(() => new Date(), []);
  const yScale = React.useMemo(() => (yScaleType === 'linear' ? linearProps : logProps), [yScaleType]);
  
  const areaProp = false;
  const theme = useTheme();

  const [startDate, setStartDate] = React.useState<Date>(() => {
    return subMonths(today, 1);
  });

  const [activeButton, setActiveButton] = React.useState<ButtonDate>(historicalDates[1]);

  const tickFrequency = React.useMemo(() => {
    if (isBefore(startDate, subMonths(today, 6))) {
      return 'every month';
    } else if (isBefore(startDate, subMonths(today, 1))) {
      return 'every week';
    } else {
      return 'every day';
    }
  }, [startDate, today]);

  const queryData = React.useMemo(() => {
    return generator(startDate, today);
  }, [today, startDate, generator]);

  const dateButtonHandler = (date: ButtonDate) => {
    setActiveButton(date);
    if (date.tenor === 'W') {
      setStartDate(subWeeks(today, date.number));
    } else {
      setStartDate(subMonths(today, date.number));
    }
  };

  // const scaleButtonHandler = (type: 'linear' | 'log') => {
  //   setYScaleType(type === 'linear' ? 'log' : 'linear');
  // };

  const chartColor = theme.mode === 'light' ? 'set2' : 'accent'; // https://nivo.rocks/guides/colors/
  const legendTextColor = theme.mainColors.textColor;

  return (
    <>
      <S.ControlBox>
        <div>
          {historicalDates.map((date, index) => {
            if (date.tenor === 'W' && isBefore(fromUnixTime(queryData.earliestDate), subWeeks(today, date.number))) {
              return (
                <Button
                  kind={activeButton === date ? 'success' : 'secondary'}
                  size="extrasmall"
                  key={index}
                  onClick={() => dateButtonHandler(date)}
                >
                  <FormattedNumber decimals={0} value={date.number} />
                  {date.tenor}
                </Button>
              );
            }
            if (date.tenor === 'M' && isBefore(fromUnixTime(queryData.earliestDate), subMonths(today, date.number))) {
              console.log(activeButton === date)
              return (
                <Button
                  kind={activeButton === date ? 'success' : 'secondary'}
                  size="extrasmall"
                  key={index}
                  onClick={() => dateButtonHandler(date)}
                >
                  <FormattedNumber decimals={0} value={date.number} />
                  {date.tenor}
                </Button>
              );
            } else {
              return (
                <Button
                  kind={activeButton === date ? 'success' : 'secondary'}
                  size="extrasmall"
                  key={index}
                  disabled={true}
                >
                  <FormattedNumber decimals={0} value={date.number} /> {date.tenor}
                </Button>
              );
            }
          })}
        </div>

        {/* <Button size="extrasmall" onClick={() => scaleButtonHandler(yScaleType)}>
          {yScaleType === 'linear' ? 'Log Scale' : 'Linear Scale'}
        </Button> */}
      </S.ControlBox>

      <S.Chart>
        <S.PriceLabel>price</S.PriceLabel>
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
            format: '%d %b',
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
