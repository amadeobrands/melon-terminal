import React from 'react';
import { Serie, ResponsiveLine, Line } from '@nivo/line';
import * as S from './Nivo.styles';


export interface NivoProps {
  data: Serie[];
}

export const Nivo: React.FC<NivoProps> = ({ data }) => {
  console.log(data);
  return (
    <S.Chart>
      {/* add button/input to zoom in/select date ranges to manipulate the data object that's passed */}
      <ResponsiveLine
        data={data}
        colors={{ scheme: 'paired' }}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'time', format: '%Y-%m-%d', precision: 'day' }} // format: 'native', precision: 'day' }}
        xFormat="time: %Y-%m-%d"
        // Linear scale setting:
        yScale={{ type: 'linear', min: 'auto', max: 'auto', reverse: false }}
        // Log scale setting:
        // yScale={{ type: 'log', base: 10, max: 'auto', min: 'auto'}}

        axisTop={null}
        axisRight={{orient: 'right'}}
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
            padding: {top: 24},
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
