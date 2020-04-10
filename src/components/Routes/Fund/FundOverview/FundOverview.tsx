import React from 'react';
import { FundHoldings } from '../FundHoldings/FundHoldings';
import { FundPolicies } from '../FundPolicies/FundPolicies';
import { FundContracts } from './FundContracts/FundContracts';
import { FundFactSheet } from './FundFactSheet/FundFactSheet';
import { Grid, GridRow, GridCol } from '~/storybook/Grid/Grid';
import { FundPerformanceTable } from '~/components/Routes/Fund/FundPerfomanceTable/FundPerformanceTable';
import { useFundSharePriceQuery } from '../FundPerfomanceTable/FundPerformanceChart.query';
import { Nivo } from '~/components/Charts/Nivo/Nivo';

export interface FundOverviewProps {
  address: string;
}

export const FundOverview: React.FC<FundOverviewProps> = ({ address }) => (
  <Grid>
    <GridRow>
      <GridCol xs={12} sm={5}>
        <FundFactSheet address={address} />
      </GridCol>
      <GridCol xs={12} sm={7}>
        <FundHoldings address={address} />
      </GridCol>
    </GridRow>
    <GridRow>
      <GridCol>
        <FundPerformanceTable address={address} />
        <Nivo generator={useFundSharePriceQuery} />
      </GridCol>
    </GridRow>
    <GridRow>
      <GridCol xs={12} sm={6}>
        <FundPolicies address={address} />
      </GridCol>
      <GridCol xs={12} sm={6}>
        <FundContracts address={address} />
      </GridCol>
    </GridRow>
  </Grid>
);

export default FundOverview;
