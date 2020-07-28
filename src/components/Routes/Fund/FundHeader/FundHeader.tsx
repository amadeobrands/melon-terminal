import React from 'react';
import { useFundDetailsQuery } from './FundDetails.query';
import { useFundDailyChange } from '~/components/Routes/Fund/FundHeader/FundDailyChange.query';
import { RequiresFundSetupComplete } from '~/components/Gates/RequiresFundSetupComplete/RequiresFundSetupComplete';
import { DataBlock, DataBlockSection } from '~/storybook/DataBlock/DataBlock';
import { Bar, BarContent } from '~/storybook/Bar/Bar';
import { Headline } from '~/storybook/Headline/Headline';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { TokenValueDisplay } from '~/components/Common/TokenValueDisplay/TokenValueDisplay';
import { useFundSlug } from './FundSlug.query';
import { NetworkEnum } from '~/types';
import { useEnvironment } from '~/hooks/useEnvironment';
import { CopyToClipboard } from '~/components/Common/CopyToClipboard/CopyToClipboard';
import { useTableData } from '../../Home/FundOverview/FundOverview';
import {
  GiCaesar,
  GiSpartanHelmet,
  GiPegasus,
  GiStorkDelivery,
  GiChariot,
  GiWingfoot,
  GiIcarus,
  GiMedusaHead,
  GiPalisade,
  GiPadlock,
} from 'react-icons/gi';
import { Button } from '~/components/Form/Button/Button';
import { useHistory } from 'react-router';
import { useConnectionState } from '~/hooks/useConnectionState';
import { getNetworkName } from '~/config';
import { Tooltip } from '~/storybook/Tooltip/Tooltip';

export interface FundHeaderProps {
  address: string;
}

export const FundHeader: React.FC<FundHeaderProps> = ({ address }) => {
  const environment = useEnvironment()!;
  const [fund, query] = useFundDetailsQuery(address);
  const [dailyChange, queryDailyChange] = useFundDailyChange(address);
  const [slug] = useFundSlug(address);
  const allFunds = useTableData();

  const history = useHistory();
  const connection = useConnectionState();
  const prefix = getNetworkName(connection.network);

  if (queryDailyChange.loading || query.loading || !fund) {
    return null;
  }

  const fundData = allFunds.find((item) => item.address === address);

  const routes = fund.routes;
  const accounting = routes && routes.accounting;

  const slugUrl =
    slug &&
    slug + (environment.network > 1 ? `.${NetworkEnum[environment.network].toLowerCase()}.melon.fund` : '.melon.fund');

  const SlugComponent = <CopyToClipboard text={slugUrl} value={`https://${slugUrl}`} />;

  const badges = [];
  fundData?.top5AUM &&
    badges.push(
      <Tooltip key="caesar" value="Top 5 fund by AUM">
        <GiCaesar color="rgb(133,213,202)" size={20} />
      </Tooltip>
    );
  fundData?.top5YTD &&
    badges.push(
      <Tooltip key="spartan" value="Top 5 performance YTD">
        <GiSpartanHelmet color="rgb(133,213,202)" size={20} />
      </Tooltip>
    );
  fundData?.top5MTD &&
    badges.push(
      <Tooltip key="pegasus" value="Top 5 performance MTD">
        <GiPegasus color="rgb(133,213,202)" size={20} />
      </Tooltip>
    );
  fundData?.top5Recent &&
    badges.push(
      <Tooltip key="stork" value="5 most recent funds">
        <GiStorkDelivery color="rgb(133,213,202)" size={20} />
      </Tooltip>
    );
  fundData?.top5Investments &&
    badges.push(
      <Tooltip key="chariot" value="5 funds with most investors">
        <GiChariot color="rgb(133,213,202)" size={20} />
      </Tooltip>
    );
  fundData?.largeFund &&
    badges.push(
      <Tooltip key="wingfoot" value="Large fund (> 100 ETH)">
        <GiWingfoot color="rgb(133,213,202)" size={20} />
      </Tooltip>
    );
  fundData?.underperformingFund &&
    badges.push(
      <Tooltip key="icarus" value="Underperforming fund">
        <GiIcarus color="rgb(255,141,136)" size={20} />
      </Tooltip>
    );
  fundData?.tinyFund &&
    badges.push(
      <Tooltip key="medusa" value="Tiny fund (< 1 ETH)">
        <GiMedusaHead color="rgb(255,141,136)" size={20} />
      </Tooltip>
    );
  fundData?.userWhitelist &&
    badges.push(
      <Tooltip key="palisade" value="Fund operates a user whitelist">
        <GiPalisade color="grey" size={20} />
      </Tooltip>
    );
  fundData?.closed &&
    badges.push(
      <Tooltip key="padlock" value="Fund is closed for investment">
        <GiPadlock color="grey" size={20} />
      </Tooltip>
    );

  return (
    <Bar>
      <BarContent justify="between">
        <Headline
          title={
            <span onClick={() => history.push(`/${prefix}/fund/${address}`)} style={{ cursor: 'pointer' }}>
              {fund.name}
            </span>
          }
          text={SlugComponent}
          icon="ETHEREUM"
          badges={badges}
        />
        <RequiresFundSetupComplete fallback={false}>
          <DataBlockSection>
            <DataBlock label="Share price">
              <TokenValueDisplay value={accounting?.sharePrice} decimals={0} symbol="WETH" />
            </DataBlock>

            <DataBlock label="Assets under management">
              <TokenValueDisplay value={accounting?.grossAssetValue} decimals={0} symbol="WETH" />
            </DataBlock>

            <DataBlock label="Daily change">
              <FormattedNumber value={dailyChange} colorize={true} decimals={2} suffix="%" />
            </DataBlock>

            <Button kind="success" size="large" onClick={() => history.push(`/${prefix}/fund/${address}/invest`)}>
              Invest
            </Button>
          </DataBlockSection>
        </RequiresFundSetupComplete>
      </BarContent>
    </Bar>
  );
};
