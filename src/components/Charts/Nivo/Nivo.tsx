import React from 'react';
import { Serie, ResponsiveLine } from '@nivo/line';
import { LinearScale, LogScale } from '@nivo/scales';
import * as S from './Nivo.styles';
import { subMonths, isBefore, fromUnixTime } from 'date-fns';
import { Button } from '~/storybook/Button/Button.styles';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { ToolTipContainer, ToolTipText } from './ToolTip';
import { useDarkMode } from '~/hooks/useDarkMode';


export interface NivoProps {
  generator: (startDate: Date, currentDate: Date) => { earliestDate: number; data: Serie[] };
}

const months = [1, 2, 3, 6, 9, 12];
const linearProps = { type: 'linear', min: 'auto', max: 'auto', reverse: false } as LinearScale;
const logProps = { type: 'log', base: 10, max: 'auto', min: 'auto' } as LogScale;



export const Nivo: React.FC<NivoProps> = ({ generator },...props) => {
  const [yScaleType, setYScaleType] = React.useState<'linear' | 'log'>('linear');
  const today = React.useMemo(() => new Date(), []);
  const yScale = React.useMemo(() => (yScaleType === 'linear' ? linearProps : logProps), [yScaleType]);

  const context = useDarkMode();
  console.log(context);
  const nivoTheme = context.isDarkMode ? S.chartColorsDark : S.chartColorsLight;
  console.log(nivoTheme)
  const [startDate, setStartDate] = React.useState<Date>(() => {
    return subMonths(today, 3);
  });
  console.log(props)
  const queryData = React.useMemo(() => {
    return generator(startDate, today);
  }, [today, startDate]);

  const dateButtonHandler = (num: number) => {
    setStartDate(subMonths(today, num));
  };

  const scaleButtonHandler = (type: 'linear' | 'log') => {
    setYScaleType(type === 'linear' ? 'log' : 'linear');
  };

  return (
    <S.Chart>
      {months.map((month, index) => {
        if (isBefore(fromUnixTime(queryData.earliestDate), subMonths(today, month))) {
          return (
            <Button size="small" key={index} onClick={() => dateButtonHandler(month)}>
              <FormattedNumber decimals={0} value={month} />M
            </Button>
          );
        }
      })}
      <ResponsiveLine
        theme={nivoTheme}
        data={queryData.data}
        animate={false}
        // colors={{scheme: 'nivo'}}
        enableArea={true}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'time', format: '%Y-%m-%d', precision: 'day' }} // format: 'native', precision: 'day' }}
        xFormat="time: %Y-%m-%d"
        // Linear scale setting:
        yScale={yScale}
        // Log scale setting:
        // yScale={{ type: 'log', base: 10, max: 'auto', min: 'auto'}}

        axisTop={null}
        axisBottom={{
          format: '%b %d',
          orient: 'bottom',
          tickValues: 'every week',

          // tickSize: 5,
          // tickPadding: 5,
          tickRotation: 45,
          legend: 'date', // this'll be dynamic
          legendOffset: 40,
          legendPosition: 'middle',
        }}
        axisLeft={{
          orient: 'left',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'price',
          legendOffset: -40,
          legendPosition: 'middle',
        }}
        enablePoints={false}
        // enableGridX={false}
        // Below is a custom tooltip that shows the date in common between the data series in the slice
        //
        sliceTooltip={({ slice }) => {
          return (
            <ToolTipContainer>
              <div>Date: {slice.points[0].data.xFormatted}</div>
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
        enableSlices="x"
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabel="y"
        pointLabelYOffset={-12}
        areaOpacity={0.65}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 110,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
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
      <Button onClick={() => scaleButtonHandler(yScaleType)}>{yScaleType === 'linear' ? 'Log' : 'Linear'}</Button>
    </S.Chart>
  );
};
