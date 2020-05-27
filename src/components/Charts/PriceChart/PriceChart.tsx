import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from 'styled-components';
import { Spinner } from '~/storybook/Spinner/Spinner';
import * as S from './PriceChart.styles';
import { Depth, Serie, ZoomControl } from '../ZoomControl/ZoomControl';

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

export interface PriceChartProps {
  loading?: boolean;
  depth: Depth;
  data: Serie[];
  secondaryData?: Serie[];
  setDepth: (depth: Depth) => void;
}

export const PriceChart: React.FC<PriceChartProps> = (props) => {
  const theme = useTheme();

  const showSecondaryData = props.depth === '1d' || props.depth === '1w' ? true : false;
  let data = [...props.data, ...(showSecondaryData && props.secondaryData ? props.secondaryData : [])];

  const options = {
    chart: {
      type: 'area',
      stacked: false,
      height: 'auto',
      fontFamily: theme.fontFamilies,
      foreColor: theme.mainColors.textColor,
      zoom: {
        type: 'x',
        enabled: true,
        autoScaleYaxis: true,
      },
      toolbar: {
        show: false,
        autoSelected: 'zoom',
        tools: {
          download: false,
        },
      },
    },
    colors: ['#238757', '#aaaaaa'],
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: ['gradient', 'solid'],
      gradient: {
        shadeIntensity: 0.5,
      },
    },
    grid: {
      strokeDashArray: 4,
      borderColor: '#90A4AE',
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
      decimalsInFloat: 4,
    },
    xaxis: {
      type: 'datetime',
    },
    stroke: {
      width: [3, 1],
      curve: ['smooth', 'smooth'],
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
      <ZoomControl depth={props.depth} setDepth={props.setDepth} />

      <S.Chart>
        <ReactApexChart options={options} series={data} type="area" height={350} />
      </S.Chart>
    </>
  );
};
