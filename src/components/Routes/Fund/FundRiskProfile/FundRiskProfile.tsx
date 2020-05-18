import React from 'react';
import { Grid, GridRow, GridCol } from '~/storybook/Grid/Grid';
import { FundRegisterPolicies } from './FundRegisterPolicies/FundRegisterPolicies';
import { FundPolicies } from '../FundPolicies/FundPolicies';
import { RequiresFundDeployedWithCurrentVersion } from '~/components/Gates/RequiresFundDeployedWithCurrentVersion/RequiresFundDeployedWithCurrentVersion';
import { RequiresFundManager } from '~/components/Gates/RequiresFundManager/RequiresFundManager';

export interface FundRiskProfileProps {
  address: string;
}

export const FundRiskProfile: React.FC<FundRiskProfileProps> = ({ address }) => (
  <RequiresFundManager>
    <Grid>
      <GridRow>
        <RequiresFundDeployedWithCurrentVersion address={address} fallback={false}>
          <GridCol xs={12} sm={6}>
            <FundRegisterPolicies address={address} />
          </GridCol>
        </RequiresFundDeployedWithCurrentVersion>
        <GridCol xs={12} sm={6}>
          <FundPolicies address={address} />
        </GridCol>
      </GridRow>
    </Grid>
  </RequiresFundManager>
);

export default FundRiskProfile;
