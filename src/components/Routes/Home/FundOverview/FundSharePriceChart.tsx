import React, { useMemo } from 'react';
import * as R from 'ramda';
import { TokenValue } from '~/TokenValue';
import BigNumber from 'bignumber.js';
import ReactApexChart from 'react-apexcharts';
import styled, { useTheme } from 'styled-components';

import { useOnchainFundHistoryByDepth } from '~/components/Routes/Fund/FundPerformanceChart/FundPerformanceChart.tsx';

export interface FundSharePriceChartProps {
  address: string;
}

export const Chart = styled.div`
  // display: flex;
  // flex-direction: column;
  vertical-align: bottom;
  height: 60px;
  float: right;
`;

export const FundSharePriceChart: React.FC<FundSharePriceChartProps> = (props) => {
  const theme = useTheme();

  const { data, error, isFetching } = useOnchainFundHistoryByDepth(props.address, '1m');

  if (!data) {
    return <></>;
  }

  if (error) {
    return <>Error</>;
  }

  const series = [{ id: 'sharePrice', name: 'Share price', data }];

  const options = {
    colors: ['#aaaaaa'],
    chart: {
      type: 'line',
      sparkline: {
        enabled: true,
      },
    },

    stroke: {
      width: 2,
      curve: 'smooth',
    },

    xaxis: {
      type: 'datetime',
    },

    grid: {
      padding: {
        top: 10,
        bottom: 3,
      },
    },

    yaxis: {
      logarithmic: true,
      labels: {
        show: false,
      },
    },
    tooltip: {
      enabled: false,
      theme: theme.mode,
      x: {
        format: 'dd-MM-yyyy',
      },
      marker: {
        show: false,
      },
    },
  };

  return (
    <Chart>
      <ReactApexChart options={options} series={series} type="line" width={100} height={40} />
    </Chart>
  );
};
