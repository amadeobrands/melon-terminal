import React, { Fragment } from 'react';
import { useFundDetailsQuery } from '../FundDetails.query';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { SectionTitle } from '~/storybook/Title/Title';
import { Dictionary, DictionaryEntry, DictionaryLabel, DictionaryData } from '~/storybook/Dictionary/Dictionary';
import { EtherscanLink } from '~/components/Common/EtherscanLink/EtherscanLink';

export interface FundContractsProps {
  address: string;
}

export const FundContracts: React.FC<FundContractsProps> = ({ address }) => {
  const [fund, query] = useFundDetailsQuery(address);

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

  const routes = fund?.routes;
  const addresses = contracts
    .map((contract) => {
      const current = routes && ((routes as any)[contract.field] as any);
      return { ...contract, address: current && current.address };
    })
    .filter((item) => !!item.address);

  addresses.unshift({ address, name: 'Fund', field: 'fund' });

  return (
    <Dictionary>
      <SectionTitle>Fund Contracts</SectionTitle>
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
    </Dictionary>
  );
};
