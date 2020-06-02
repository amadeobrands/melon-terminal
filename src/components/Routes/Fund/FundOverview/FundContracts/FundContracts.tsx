import React, { Fragment } from 'react';
import { useFundDetailsQuery } from '../FundDetails.query';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { SectionTitle } from '~/storybook/Title/Title';
import { Dictionary, DictionaryEntry, DictionaryLabel, DictionaryData } from '~/storybook/Dictionary/Dictionary';
import { EtherscanLink } from '~/components/Common/EtherscanLink/EtherscanLink';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { useEnvironment } from '~/hooks/useEnvironment';
import { FormattedDate } from '~/components/Common/FormattedDate/FormattedDate';
import { sameAddress } from '@melonproject/melonjs';

export interface FundContractsProps {
  address: string;
}

export const FundContracts: React.FC<FundContractsProps> = ({ address }) => {
  const [fund, query] = useFundDetailsQuery(address);
  const environment = useEnvironment()!;

  const contracts = [
    { name: 'Accounting', field: 'accounting' },
    { name: 'Fee Manager', field: 'feeManager' },
    { name: 'Participation', field: 'participation' },
    { name: 'Policy Manager', field: 'policyManager' },
    { name: 'Shares', field: 'shares' },
    { name: 'Trading', field: 'trading' },
    { name: 'Vault', field: 'vault' },
    { name: 'Registry', field: 'registry' },
    { name: 'Version', field: 'version' },
  ];

  if (!fund) {
    return null;
  }

  const routes = fund?.routes;
  const addresses = contracts
    .map((contract) => {
      const current = routes && ((routes as any)[contract.field] as any);
      return { ...contract, address: current && current.address };
    })
    .filter((item) => !!item.address);

  addresses.unshift({ address, name: 'Fund', field: 'fund' });

  const creation = fund.creationTime;
  const accounting = routes?.accounting;
  const shares = routes?.shares;
  const version = routes?.version;
  const feeManager = routes?.feeManager;
  const managementFee = feeManager?.managementFee;
  const performanceFee = feeManager?.performanceFee;

  const initializeSeconds = (fund?.routes?.feeManager?.performanceFee?.initializeTime.getTime() || Date.now()) / 1000;
  const secondsNow = Date.now() / 1000;
  const secondsSinceInit = secondsNow - initializeSeconds;
  const performanceFeePeriodInSeconds = (performanceFee?.period || 1) * 24 * 60 * 60;
  const secondsSinceLastPeriod = secondsSinceInit % performanceFeePeriodInSeconds;
  const nextPeriodStart = secondsNow + (performanceFeePeriodInSeconds - secondsSinceLastPeriod);

  const exchanges = routes?.trading?.exchanges
    ?.map((exchange) => environment?.getExchange(exchange as any))
    .filter((item) => !!item)
    .sort((a, b) => {
      if (a.historic === b.historic) {
        return 0;
      }

      return a.historic ? 1 : -1;
    })
    .filter((item, index, array) => {
      const found = array.findIndex((inner) => sameAddress(item.exchange, inner.exchange));
      return found >= index;
    });

  const allowedAssets = routes?.participation?.allowedAssets;
  const allowedAssetsSymbols = allowedAssets?.map((asset) => asset?.token?.symbol);

  return (
    <Dictionary>
      <SectionTitle>Fund Contract and Fee Diligence</SectionTitle>
      {query.loading && <Spinner />}

      {!query.loading &&
        addresses.map((a) => (
          <Fragment key={a.address}>
            <DictionaryEntry>
              <DictionaryLabel>{a.name}</DictionaryLabel>
              <DictionaryData>
                <EtherscanLink address={a.address} />
              </DictionaryData>
            </DictionaryEntry>
            {(a.name === 'Fund' || a.name === 'Vault') && (
              <DictionaryEntry>
                <DictionaryLabel>&nbsp;</DictionaryLabel>
                <DictionaryData>&nbsp;</DictionaryData>
              </DictionaryEntry>
            )}
          </Fragment>
        ))}

      <DictionaryEntry>
        <DictionaryLabel>Protocol version</DictionaryLabel>
        <DictionaryData>{version?.name ? version.name : 'N/A'}</DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Fund address</DictionaryLabel>
        <DictionaryData>
          <EtherscanLink address={address} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Manager address</DictionaryLabel>
        <DictionaryData>
          <EtherscanLink address={fund.manager} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Management fee</DictionaryLabel>
        <DictionaryData>{managementFee?.rate}%</DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Performance fee</DictionaryLabel>
        <DictionaryData>{performanceFee?.rate}%</DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Performance fee period</DictionaryLabel>
        <DictionaryData>{performanceFee?.period} days</DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Start of next performance fee period</DictionaryLabel>
        <DictionaryData>
          <FormattedDate timestamp={nextPeriodStart} />
        </DictionaryData>
      </DictionaryEntry>

      <DictionaryEntry>
        <DictionaryLabel>Authorized exchanges</DictionaryLabel>
        <DictionaryData>
          {exchanges?.map((item, index) => (
            <Fragment key={item.id}>
              <EtherscanLink key={index} inline={true} address={item.adapter}>
                {item.name}
              </EtherscanLink>
              {index + 1 < exchanges.length && ', '}
            </Fragment>
          ))}
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Investable assets</DictionaryLabel>
        <DictionaryData>{allowedAssetsSymbols ? allowedAssetsSymbols.sort().join(', ') : 'N/A'}</DictionaryData>
      </DictionaryEntry>
    </Dictionary>
  );
};
