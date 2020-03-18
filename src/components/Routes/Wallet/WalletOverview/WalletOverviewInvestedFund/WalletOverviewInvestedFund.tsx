import React from 'react';
import { useHistory } from 'react-router';
import { Fund } from '~/components/Routes/Wallet/WalletOverview/FundParticipationOverview.query';
import { BodyCell, BodyRowHover, BodyCellRightAlign } from '~/storybook/components/Table/Table';
import { FormattedDate } from '~/components/Common/FormattedDate/FormattedDate';
import { TokenValue } from '~/components/Common/TokenValue/TokenValue';
import { getNetworkName } from '~/config';
import { useConnectionState } from '~/hooks/useConnectionState';

export interface WalletOverviewInvestedFundProps {
  fund: Fund;
  version: {
    address: string;
    name: string;
  };
}

export const WalletOverviewInvestedFund: React.FC<WalletOverviewInvestedFundProps> = ({ fund, version }) => {
  const history = useHistory();
  const connection = useConnectionState();
  const prefix = getNetworkName(connection.network);

  return (
    <BodyRowHover onClick={() => history.push(`/${prefix}/fund/${fund.address}`)}>
      <BodyCell>{fund.name}</BodyCell>
      <BodyCell>
        <FormattedDate timestamp={fund.inception} />
      </BodyCell>
      <BodyCellRightAlign>
        <TokenValue value={fund?.gav}></TokenValue>
      </BodyCellRightAlign>
      <BodyCellRightAlign>
        <TokenValue value={fund?.sharePrice}></TokenValue>
      </BodyCellRightAlign>
      <BodyCellRightAlign>{fund.change.toFixed(2)}%</BodyCellRightAlign>
      <BodyCellRightAlign>
        <TokenValue value={fund?.shares}></TokenValue>
      </BodyCellRightAlign>
      <BodyCell>
        {fund.version} {fund.version === version?.name ? '(current)' : '(old)'}
      </BodyCell>
      <BodyCell>{fund.isShutDown ? 'Inactive' : 'Active'}</BodyCell>
    </BodyRowHover>
  );
};
