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
      <GridCol xs={12} sm={12}>
        <NewFundPerformanceChart address={address} />
      </GridCol>
    </GridRow>
    <GridRow>
      <GridCol>
        <FundMonthlyReturnTable address={address} />
      </GridCol>
    </GridRow>
    <GridRow>
      <GridCol>
        <FundPerformanceTable address={address} />
      </GridCol>
    </GridRow>
    <GridRow>
      <GridCol md={12} lg={4}>
        <FundSharePriceMetrics address={address} />
      </GridCol>
      <GridCol md={12} lg={8}>
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
