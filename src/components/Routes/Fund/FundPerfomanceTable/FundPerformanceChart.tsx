import React from 'react';
import { Nivo } from '~/components/Charts/Nivo/Nivo';
import { useFundSharePriceQuery } from './FundPerformanceChart.query';

export const FundPerformanceChart: React.FC = () => {
  return <Nivo generator={useFundSharePriceQuery} />;
};
