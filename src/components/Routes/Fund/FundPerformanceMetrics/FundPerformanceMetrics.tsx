import * as React from 'react';
import { SectionTitle } from '~/storybook/Title/Title';
import { Block } from '~/storybook/Block/Block';
import { FundMonthlyReturnTable } from './FundMonthlyReturnTable';
import { FundTDReturns } from './FundTDReturns';

export interface FundMetricsProps {
  address: string;
}

export const FundPerformanceMetrics: React.FC<FundMetricsProps> = ({ address }) => {
  return (
    <>
      <FundMonthlyReturnTable address={address} />
      <FundTDReturns address={address} />
    </>
  );
};
