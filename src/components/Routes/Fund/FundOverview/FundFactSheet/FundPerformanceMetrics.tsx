import * as React from 'react';

import { useFund } from '~/hooks/useFund';
import { SectionTitle } from '~/storybook/Title/Title';
import { Block } from '~/storybook/Block/Block';
import { Spinner } from '~/storybook/Spinner/Spinner.styles';
import { FundMonthlyReturnTable } from './FundMonthlyReturnTable';
import { FundTDReturns } from './FundTDReturns';

export interface FundMetricsProps {
  address: string;
}

interface DepthTimelineItem {
  timestamp: number;
  rates: {
    [symbol: string]: number;
  };
  holdings: {
    [symbol: string]: number;
  };
  shares: number;
  calculations: {
    price: number;
    gav: number;
    nav: number;
  };
}
export type Depth = '1y' | '6m' | '3m' | '1m' | '1w' | '1d';

const depths: Depth[] = ['1w', '1m', '3m', '6m', '1y'];

export const FundPerformanceMetrics: React.FC<FundMetricsProps> = ({ address }) => {
  return (
    <Block>
      <SectionTitle>Various Fund Metrics</SectionTitle>
      <FundMonthlyReturnTable address={address} />
      <FundTDReturns address={address} />
    </Block>
  );
};
