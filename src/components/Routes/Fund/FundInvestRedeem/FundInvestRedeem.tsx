import React from 'react';
import { FundInvest } from './FundInvest/FundInvest';
import { FundRedeem } from './FundRedeem/FundRedeem';
import { FundInvestmentHistoryList } from './FundInvestmentHistoryList/FundInvestmentHistoryList';
import { Grid, GridRow, GridCol } from '~/storybook/Grid/Grid';
import { RequiresAccount } from '~/components/Gates/RequiresAccount/RequiresAccount';
import { Fallback } from '~/components/Common/Fallback/Fallback';

export interface FundInvestProps {
  address: string;
}

export const FundInvestRedeem: React.FC<FundInvestProps> = ({ address }) => {
  const fallback = (
    <Fallback kind="error">You must be logged in with a connection provider to invest in a fund.</Fallback>
  );
  return (
    <Grid>
      <RequiresAccount fallback={fallback}>
        <GridRow>
          <GridCol xs={12} sm={6}>
            <FundInvest address={address} />
          </GridCol>
          <GridCol xs={12} sm={6}>
            <FundRedeem address={address} />
          </GridCol>
        </GridRow>
      </RequiresAccount>
    </Grid>
  );
};

export default FundInvestRedeem;
