import React, { useMemo, useEffect } from 'react';
import * as Yup from 'yup';
import { useForm, FormContext } from 'react-hook-form';
import { Button } from '~/storybook/components/Button/Button';
import { useEnvironment } from '~/hooks/useEnvironment';
import { Deployment, AssetBlacklist, PolicyDefinition, availableTokens, Transaction } from '@melonproject/melonjs';
import { AssetBlacklistBytecode } from '@melonproject/melonjs/abis/AssetBlacklist.bin';
import { useAccount } from '~/hooks/useAccount';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { BlockActions } from '~/storybook/components/Block/Block';
import { Checkboxes } from '~/storybook/components/Checkbox/Checkbox';
import { NotificationBar, NotificationContent } from '~/storybook/components/NotificationBar/NotificationBar';
import { FundPolicy, AssetBlacklistPolicy } from '../../FundPolicies/FundPolicies.query';
import { TransactionReceipt } from 'web3-core';

interface AssetBlacklistConfigurationForm {
  assetBlacklist: string[];
}

export interface AssetBlacklistConfigurationProps {
  policyManager: string;
  policy: PolicyDefinition;
  allPolicies?: FundPolicy[];
  startTransaction: (tx: Deployment<AssetBlacklist> | Transaction<TransactionReceipt>, name: string) => void;
}

export const AssetBlacklistConfiguration: React.FC<AssetBlacklistConfigurationProps> = props => {
  const environment = useEnvironment()!;
  const account = useAccount();
  const tokens = availableTokens(environment.deployment).filter(token => !token.historic);

  const preExistingPolicy = props.allPolicies?.find(policy => policy.identifier === 'AssetBlacklist') as
    | AssetBlacklistPolicy
    | undefined;

  const validationSchema = Yup.object().shape({
    assetBlacklist: Yup.array<string>()
      .label('Asset blacklist')
      .compact()
      .min(1, 'Select at least one asset'),
  });

  const form = useForm<AssetBlacklistConfigurationForm>({
    validationSchema,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const selectedAssets = form.watch('assetBlacklist') as string[];

  const assetsToAdd = useMemo(() => {
    if (preExistingPolicy && selectedAssets) {
      return selectedAssets
        .map(asset => !preExistingPolicy?.assetBlacklist.some(list => list === asset) && asset)
        .filter(asset => asset);
    }
  }, [selectedAssets]);

  useEffect(() => {
    if (!preExistingPolicy) {
      return;
    }

    if (assetsToAdd && assetsToAdd.length > 1) {
      form.setError('assetBlacklist', 'maxOne', 'You can add maximum one new asset at a time.');
    } else {
      form.clearError('assetBlacklist');
    }
  }, [assetsToAdd?.length]);

  const submit = form.handleSubmit(async data => {
    if (preExistingPolicy && assetsToAdd && assetsToAdd[0]) {
      const assetBlackList = new AssetBlacklist(environment, preExistingPolicy.address);
      const list = await assetBlackList.getMembers();
      const tx = assetBlackList.addToBlacklist(account.address!, assetsToAdd[0]);
      props.startTransaction(tx, 'Update Asset Blacklist');
    } else if (!preExistingPolicy) {
      const tx = AssetBlacklist.deploy(environment, AssetBlacklistBytecode, account.address!, data.assetBlacklist);
      props.startTransaction(tx, 'Deploy AssetBlacklist Contract');
    }
  });

  const options = tokens.map(item => ({
    label: `${item.symbol} (${item.name})`,
    value: item.address,
    checked: preExistingPolicy?.assetBlacklist.some(address => address === item.address),
    disabled: preExistingPolicy && preExistingPolicy?.assetBlacklist.some(address => address === item.address),
  }));

  return (
    <>
      <SectionTitle>
        {preExistingPolicy ? 'Update Asset Blacklist Policy' : 'Configure Asset Blacklist Policy'}
      </SectionTitle>
      <NotificationBar kind="neutral">
        <NotificationContent>
          The asset blacklist policy defines a list of assets that the fund is not allowed to invest in. Please note
          that no assets can be remove from the blacklist once it has been registered. Assets can only be added to the
          blacklist.
        </NotificationContent>
      </NotificationBar>
      <FormContext {...form}>
        <form onSubmit={submit}>
          <Checkboxes options={options} name="assetBlacklist" />

          <BlockActions>
            {preExistingPolicy ? (
              <Button type="submit" disabled={!!form.errors.assetBlacklist}>
                Update Asset Blacklist Policy
              </Button>
            ) : (
              <Button type="submit">Add Asset Blacklist Policy</Button>
            )}
          </BlockActions>
        </form>
      </FormContext>
    </>
  );
};

export default AssetBlacklistConfiguration;
