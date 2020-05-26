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

import ReactApexChart from 'react-apexcharts';

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

  const data = [...props.data, ...(props.secondaryData ? props.secondaryData : [])];

  const options = {
    chart: {
      type: 'area',
      stacked: false,
      height: 300,
      fontFamily: theme.fontFamilies,
      foreColor: theme.mainColors.textColor,
      zoom: {
        type: 'x',
        enabled: true,
        autoScaleYaxis: true,
      },
      toolbar: {
        autoSelected: 'zoom',
        tools: {
          download: false,
        },
      },
    },
    colors: [theme.otherColors.green, '#aaaaaa'],
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: ['gradient', 'solid'],
    },
    legend: {
      showForSingleSeries: true,
    },
    markers: {
      size: 0,
    },
    yaxis: {
      title: {
        text: 'Share price',
      },
      decimalsInFloat: 2,
    },
    xaxis: {
      type: 'datetime',
    },
    stroke: {
      width: [4, 2],
      curve: ['stepline', 'smooth'],
    },
    tooltip: {
      shared: true,
      theme: theme.mode,
      x: {
        format: 'dd-MM-yyyy',
      },
    },
  };

  return (
    <>
      <S.Chart>
        {props.loading ? <Spinner /> : <ReactApexChart options={options} series={data} type="area" height={350} />}
      </S.Chart>
    </>
  );
};
