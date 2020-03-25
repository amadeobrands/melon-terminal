import React, { useState, useMemo } from 'react';
import { Serie, ResponsiveLine, Line } from '@nivo/line';
import * as S from './Nivo.styles';
import { subMonths } from 'date-fns';
import { Button } from '~/storybook/Button/Button.styles';

export interface NivoProps {
  generator: (startDate: Date, currentDate: Date) => Serie[];
}

export const Nivo: React.FC<NivoProps> = ({ generator }) => {
  const today = new Date();

  
  const linearProps = { type: 'linear', min: 'auto', max: 'auto', reverse: false }
  const logProps = { type: 'log', base: 10, max: 'auto', min: 'auto'}
  
  const [yScale, setYScale] = useState(linearProps)
  const [startDate, setStartDate] = useState<Date>(new Date('2020-03-01'));
  
  const dateButtonHandler = (num: number) => {
    setStartDate(subMonths(today, num));
  };

  const scaleButtonHandler = () => {
    setYScale(yScale === linearProps ? logProps : linearProps)
  }
  const queryData = useMemo(() => {
    return generator(startDate, today);
  }, [startDate]);

  const months = [1, 2, 3, 6, 9, 12];

  return (
    <S.Chart>
      {months.map(month => (
        <Button
          onClick={() => {
            dateButtonHandler(month);
          }}
        >
          {month}M
        </Button>
      ))}
      <ResponsiveLine
        data={queryData}
        colors={{ scheme: 'paired' }}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'time', format: '%Y-%m-%d', precision: 'day' }} // format: 'native', precision: 'day' }}
        xFormat="time: %Y-%m-%d"
        // Linear scale setting:
        yScale={ yScale }
        // Log scale setting:
        // yScale={{ type: 'log', base: 10, max: 'auto', min: 'auto'}}

        axisTop={null}
        axisRight={{ orient: 'right' }}
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
            <div>
              <div>Date: {slice.points[0].data.xFormatted}</div>
              {slice.points.map(point => (
                <div
                  key={point.id}
                  style={{
                    color: point.serieColor,
                    padding: '3px 0',
                  }}
                >
                  <strong>{point.serieId}:</strong> {point.data.yFormatted}
                </div>
              ))}
            </div>
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
      <Button onClick={() => {scaleButtonHandler()}}>{yScale == linearProps ? 'Log': 'Linear'}</Button>
    </S.Chart>
  );
};
