import React, { useMemo, useEffect } from 'react';
import * as Yup from 'yup';
import { useForm, FormContext } from 'react-hook-form';
import { Button } from '~/storybook/components/Button/Button';
import { useEnvironment } from '~/hooks/useEnvironment';
import { Deployment, AssetWhitelist, availableTokens, PolicyDefinition, Transaction } from '@melonproject/melonjs';
import { AssetWhitelistBytecode } from '@melonproject/melonjs/abis/AssetWhitelist.bin';
import { useAccount } from '~/hooks/useAccount';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { Checkboxes } from '~/storybook/components/Checkbox/Checkbox';
import { BlockActions } from '~/storybook/components/Block/Block';
import { NotificationContent, NotificationBar } from '~/storybook/components/NotificationBar/NotificationBar';
import { FundPolicy, AssetWhitelistPolicy } from '../FundRegisterPolicies/FundPolicies.query';
import { TransactionReceipt } from 'web3-core';

interface AssetWhitelistConfigurationForm {
  assetWhitelist: string[];
}

export interface AssetWhitelistConfigurationProps {
  policyManager: string;
  policy: PolicyDefinition;
  allPolicies?: FundPolicy[];
  startTransaction: (tx: Deployment<AssetWhitelist> | Transaction<TransactionReceipt>, name: string) => void;
}

export const AssetWhitelistConfiguration: React.FC<AssetWhitelistConfigurationProps> = props => {
  const environment = useEnvironment()!;
  const account = useAccount();
  const tokens = availableTokens(environment.deployment).filter(token => !token.historic);

  const preExistingPolicy = props.allPolicies?.find(policy => policy.identifier === 'AssetWhitelist') as
    | AssetWhitelistPolicy
    | undefined;

  const validationSchema = Yup.object().shape({
    assetWhitelist: Yup.array<string>()
      .label('Asset whitelist')
      .compact()
      .min(1, 'Select at least one asset'),
  });

  const form = useForm<AssetWhitelistConfigurationForm>({
    validationSchema,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const selectedAssets = form.watch('assetWhitelist') as string[];

  const assetsToRemove = useMemo(() => {
    if (preExistingPolicy && selectedAssets) {
      return preExistingPolicy?.assetWhitelist
        .map(policy => !selectedAssets?.some(list => list === policy) && policy)
        .filter(asset => asset);
    }
  }, [selectedAssets]);

  useEffect(() => {
    if (!preExistingPolicy) {
      return;
    }

    if (assetsToRemove && assetsToRemove.length > 1) {
      form.setError('assetWhitelist', 'maxOne', 'You can remove maximum one asset at a time.');
    } else {
      form.clearError('assetWhitelist');
    }
  }, [assetsToRemove?.length]);

  const submit = form.handleSubmit(async data => {
    if (preExistingPolicy && assetsToRemove && assetsToRemove[0]) {
      const assetWhiteList = new AssetWhitelist(environment, preExistingPolicy.address);
      const tx = assetWhiteList.removeFromWhitelist(account.address!, assetsToRemove[0]);
      props.startTransaction(tx, 'Update Asset Whitelist');
    } else if (!preExistingPolicy) {
      const tx = AssetWhitelist.deploy(environment, AssetWhitelistBytecode, account.address!, data.assetWhitelist);
      props.startTransaction(tx, 'Deploy AssetWhitelist Contract');
    }
  });

  const options = tokens.map(item => ({
    label: `${item.symbol} (${item.name})`,
    value: item.address,
    checked: preExistingPolicy?.assetWhitelist.some(address => address === item.address),
    disabled: preExistingPolicy && !preExistingPolicy?.assetWhitelist.some(address => address === item.address),
  }));

  return (
    <>
      <SectionTitle>
        {preExistingPolicy ? 'Update Asset Whitelist Policy' : 'Configure Asset Whitelist Policy'}
      </SectionTitle>
      <NotificationBar kind="neutral">
        <NotificationContent>
          The asset whitelist policy defines a list of assets that the fund can invest in. Please note that no assets
          can be added to the whitelist once it has been registered. Assets can only be removed from the whitelist.
        </NotificationContent>
      </NotificationBar>
      <FormContext {...form}>
        <form onSubmit={submit}>
          <Checkboxes options={options} name="assetWhitelist" />

          <BlockActions>
            {preExistingPolicy ? (
              <Button type="submit" disabled={!!form.errors.assetWhitelist}>
                Update Asset Whitelist Policy
              </Button>
            ) : (
              <Button type="submit">Add Asset Whitelist Policy</Button>
            )}
          </BlockActions>
        </form>
      </FormContext>
    </>
  );
};

export default AssetWhitelistConfiguration;
