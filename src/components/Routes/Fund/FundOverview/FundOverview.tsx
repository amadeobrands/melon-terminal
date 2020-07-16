import React from 'react';
import { FundHoldings } from '../FundHoldings/FundHoldings';
import { NewFundPerformanceChart } from '../FundPerformanceChart/FundPerformanceChart';
import { Grid, GridRow, GridCol } from '~/storybook/Grid/Grid';
import { FundPerformanceTable } from '~/components/Routes/Fund/FundPerfomanceTable/FundPerformanceTable';
import { FundDiligence } from '../FundDiligence/FundDiligence';
import { FundSharePriceMetrics } from '../FundPerformanceMetrics/FundSharePriceMetrics';
import { FundMonthlyReturnTable } from '../FundPerformanceMetrics/FundMonthlyReturnTable';

export interface FundOverviewProps {
  address: string;
}

export const FundOverview: React.FC<FundOverviewProps> = ({ address }) => (
  <Grid>
    <GridRow>
      <GridCol sm={12} md={8} lg={8}>
        <NewFundPerformanceChart address={address} />
      </GridCol>
      <GridCol sm={12} md={4} lg={4}>
        <FundSharePriceMetrics address={address} />
      </GridCol>
    </GridRow>
    <GridRow>
      <GridCol>
        <FundMonthlyReturnTable address={address} />
      </GridCol>
    </GridRow>
    <GridRow>
      <GridCol>
        <FundHoldings address={address} />
      </GridCol>
    </GridRow>
    <GridRow>
      <GridCol>
        <FundDiligence address={address} />
      </GridCol>
    </GridRow>
  </Grid>
);

export default FundOverview;
