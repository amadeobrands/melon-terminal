import React from 'react';
import { FundHoldings } from '../FundHoldings/FundHoldings';
import { FundPolicies } from '../FundDiligence/FundPolicies/FundPolicies';
import { FundContracts } from '../FundDiligence/FundContracts/FundContracts';
import { FundFactSheet } from '../FundDiligence/FundFactSheet/FundFactSheet';
import { NewFundPerformanceChart } from '../FundPerformanceChart/FundPerformanceChart';
import { Grid, GridRow, GridCol } from '~/storybook/Grid/Grid';
import { FundPerformanceTable } from '~/components/Routes/Fund/FundPerfomanceTable/FundPerformanceTable';
import { FundPerformanceMetrics } from '../FundReturns/FundPerformanceMetrics';
import { FundDiligence } from '../FundDiligence/FundDiligence';

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
    {/* <GridRow>
      <GridCol xs={12} sm={12}>
        <FundPerformanceMetrics address={address} />
      </GridCol>
    </GridRow> */}

    <GridRow>
      <GridCol>
        <FundPerformanceTable address={address} />
      </GridCol>
    </GridRow>
    <GridRow>
      <GridCol xs={12} sm={6}>
        <FundHoldings address={address} />
      </GridCol>
      <GridCol xs={12} sm={6}>
        <FundDiligence address={address} />
      </GridCol>
    </GridRow>
  </Grid>
);

export default FundOverview;
