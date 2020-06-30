import React, { Dispatch, SetStateAction } from 'react';
import ReactApexChart from 'react-apexcharts';
import styled, { useTheme } from 'styled-components';
import * as S from './PriceChart.styles';
import { Depth, Serie, ZoomControl } from '../ZoomControl/ZoomControl';

export interface PriceChartProps {
  loading?: boolean;
  depth: Depth;
  data: Serie[];
  secondaryData?: Serie[];
  setDepth: (depth: Depth) => void;
  setDate: (date: number) => void;
  setQueryType: Dispatch<SetStateAction<'depth' | 'date'>>;
  queryType: 'depth' | 'date';
  queryFromDate: number;
  fundInceptionDate: Date | undefined;
}

const ChartDescription = styled.span`
  text-align: left;
  color: ${(props) => props.theme.mainColors.secondaryDark};
  font-size: ${(props) => props.theme.fontSizes.s};
  margin-bottom: ${(props) => props.theme.spaceUnits.m};
  margin-left: 0;
`;

export const PriceChart: React.FC<PriceChartProps> = (props) => {
  const theme = useTheme();

  const showSecondaryData = props.queryType == 'depth' && (props.depth === '1d' || props.depth === '1w') ? true : false;

  const data = React.useMemo(() => {
    if (props.secondaryData && showSecondaryData) {
      return [...props.data, ...props.secondaryData];
    }
    return [...props.data];
  }, [props.queryType, props.depth]);

  const curveType = data.length === 1 ? ['smooth'] : ['stepline', 'smooth'];

  const options = {
    chart: {
      type: 'area',
      stacked: false,
      height: 'auto',
      fontFamily: theme.fontFamilies,
      foreColor: theme.mainColors.textColor,
      zoom: {
        enabled: false,
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
      showForSingleSeries: false,
    },
    markers: {
      size: [2, 0],
      colors: ['#238757', '#aaaaaa'],
    },
    yaxis: {
      title: {
        text: 'Share Price',
      },
      decimalsInFloat: 4,
    },
    xaxis: {
      type: 'datetime',
    },
    stroke: {
      width: [3, 1],
      curve: curveType,
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
      <ZoomControl
        fundInceptionDate={props.fundInceptionDate}
        depth={props.depth}
        setDepth={props.setDepth}
        setDate={props.setDate}
        setQueryType={props.setQueryType}
        queryFromDate={props.queryFromDate}
        queryType={props.queryType}
      />

      <S.Chart>
        <ReactApexChart options={options} series={data} type="area" height={350} />
        {showSecondaryData ? (
          <ChartDescription>
            On-chain prices are updated once daily and used for all fund accounting functions. The interim prices
            displayed here are from an off-chain source and are for descriptive purposes only to show intra-update
            fluctuations. Because of the way they're observed, there may be small differences between onchain and
            offchain prices.
          </ChartDescription>
        ) : (
          <></>
        )}
      </S.Chart>
    </>
  );
};
