import React, { useMemo } from 'react';
import * as Yup from 'yup';
import { TransactionReceipt } from 'web3-core';
import { Deployment, AssetWhitelist, availableTokens, PolicyDefinition, Transaction } from '@melonproject/melonjs';
import { AssetWhitelistBytecode } from '@melonproject/melonjs/abis/AssetWhitelist.bin';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useAccount } from '~/hooks/useAccount';
import { SectionTitle } from '~/storybook/Title/Title';
import { BlockActions } from '~/storybook/Block/Block';
import { NotificationContent, NotificationBar } from '~/storybook/NotificationBar/NotificationBar';
import { FundPolicy, AssetWhitelistPolicy } from '../FundRegisterPolicies/FundPolicies.query';
import { useFormik, Form } from '~/components/Form/Form';
import { CheckboxGroup } from '~/components/Form/CheckboxGroup/CheckboxGroup';
import { Button } from '~/components/Form/Button/Button';

export interface AssetWhitelistConfigurationProps {
  policyManager: string;
  policy: PolicyDefinition;
  allPolicies?: FundPolicy[];
  startTransaction: (tx: Deployment<AssetWhitelist> | Transaction<TransactionReceipt>, name: string) => void;
}

const validationSchema = Yup.object().shape({
  assetWhitelist: Yup.array<string>()
    .label('Asset whitelist')
    .compact()
    .min(1, 'Select at least one asset')
    .test('max-One', 'You can remove maximum one asset at a time.', function (assetWhitelist: string[]) {
      const preExistingPolicy = (this.options.context as any).preExistingPolicy as AssetWhitelistPolicy | undefined;

      if (!preExistingPolicy) {
        return true;
      }

      const assetsToRemove = preExistingPolicy?.assetWhitelist
        .map((policy) => !assetWhitelist.some((list) => list === policy) && policy)
        .filter((asset) => asset);

      if (assetsToRemove && assetsToRemove.length > 1) {
        return false;
      }

      return true;
    }),
});

export const AssetWhitelistConfiguration: React.FC<AssetWhitelistConfigurationProps> = (props) => {
  const environment = useEnvironment()!;
  const account = useAccount();
  const tokens = availableTokens(environment.deployment).filter((token) => !token.historic);

  const preExistingPolicy = props.allPolicies?.find((policy) => policy.identifier === 'AssetWhitelist') as
    | AssetWhitelistPolicy
    | undefined;

  const validationContext = useMemo(
    () => ({
      preExistingPolicy,
    }),
    [preExistingPolicy]
  );

  const options = tokens.map((item) => ({
    label: `${item.symbol} (${item.name})`,
    value: item.address,
    disabled: preExistingPolicy && !preExistingPolicy?.assetWhitelist.some((address) => address === item.address),
  }));

  const initialValues = {
    assetWhitelist: preExistingPolicy?.assetWhitelist || [],
  };

  const formik = useFormik({
    validationSchema,
    validationContext,
    initialValues,
    onSubmit: async (data) => {
      const assetsToRemove = preExistingPolicy?.assetWhitelist
        .map((policy) => !data.assetWhitelist.some((list) => list === policy) && policy)
        .filter((asset) => asset);

      if (preExistingPolicy && assetsToRemove && assetsToRemove[0]) {
        const assetWhiteList = new AssetWhitelist(environment, preExistingPolicy.address);
        const tx = assetWhiteList.removeFromWhitelist(account.address!, assetsToRemove[0]);
        props.startTransaction(tx, 'Update Asset Whitelist');
      } else if (!preExistingPolicy) {
        const tx = AssetWhitelist.deploy(environment, AssetWhitelistBytecode, account.address!, data.assetWhitelist);
        props.startTransaction(tx, 'Deploy AssetWhitelist Contract');
      }
    },
  });

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
      <Form formik={formik}>
        <CheckboxGroup options={options} name="assetWhitelist" />

        <BlockActions>
          {preExistingPolicy ? (
            <Button type="submit">Update Asset Whitelist Policy</Button>
          ) : (
            <Button type="submit">Add Asset Whitelist Policy</Button>
          )}
        </BlockActions>
      </Form>
    </>
  );
};

export default AssetWhitelistConfiguration;
