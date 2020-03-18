import React, { useEffect } from 'react';
import * as Yup from 'yup';
import { useForm, FormContext } from 'react-hook-form';
import { useEnvironment } from '~/hooks/useEnvironment';
import { Deployment, UserWhitelist, PolicyDefinition, zeroAddress, Transaction } from '@melonproject/melonjs';
import { UserWhitelistBytecode } from '@melonproject/melonjs/abis/UserWhitelist.bin';
import { Textarea } from '~/storybook/components/Textarea/Textarea';
import { useAccount } from '~/hooks/useAccount';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { Button } from '~/storybook/components/Button/Button';
import { BlockActions } from '~/storybook/components/Block/Block';
import { NotificationBar, NotificationContent } from '~/storybook/components/NotificationBar/NotificationBar';
import { FundPolicy } from '../../FundPolicies/FundPolicies.query';
import { TransactionReceipt } from 'web3-core';
import { isAddress } from 'web3-utils';

interface UserWhitelistConfigurationForm {
  userWhitelist: string;
  removeUsers?: string;
}

export interface UserWhitelistConfigurationProps {
  policyManager: string;
  policy: PolicyDefinition;
  allPolicies?: FundPolicy[];
  startTransaction: (tx: Deployment<UserWhitelist> | Transaction<TransactionReceipt>, name: string) => void;
}

export const UserWhitelistConfiguration: React.FC<UserWhitelistConfigurationProps> = props => {
  const environment = useEnvironment()!;
  const account = useAccount();

  const preExistingPolicy = props.allPolicies?.find(policy => policy.identifier === 'UserWhitelist') as
    | FundPolicy
    | undefined;

  const validationSchema = Yup.object().shape({
    userWhitelist: Yup.string(),
    removeUsers: Yup.string(),
  });

  const form = useForm<UserWhitelistConfigurationForm>({
    validationSchema,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: {
      userWhitelist: '',
      removeUsers: '',
    },
  });

  const submit = form.handleSubmit(async data => {
    const whitelistedUsers = data.userWhitelist!.replace(/^\s+|\s+$/g, '').split('\n') as string[];
    const removedUsers = data.removeUsers?.replace(/^\s+|\s+$/g, '').split('\n') as string[];

    if (whitelistedUsers && whitelistedUsers.some((address: string) => address && !isAddress(address))) {
      form.setError('userWhitelist', 'invalidFormat', 'Invalid address format');
      return;
    } else if (whitelistedUsers && whitelistedUsers.some((address: string) => !isAddress(address))) {
      form.clearError('userWhitelist');
    }

    if (preExistingPolicy && removedUsers && removedUsers.some((address: string) => address && !isAddress(address))) {
      form.setError('removeUsers', 'invalidFormat', 'Invalid address format');
      return;
    } else if (removedUsers && removedUsers.some((address: string) => !isAddress(address))) {
      form.clearError('removeUsers');
    }

    if (preExistingPolicy) {
      const userWhitelist = new UserWhitelist(environment, preExistingPolicy.address);

      if (whitelistedUsers && !whitelistedUsers.some((address: string) => !isAddress(address))) {
        const tx = userWhitelist.batchAddToWhitelist(account.address!, whitelistedUsers);
        props.startTransaction(tx, 'Add investors to whitelist');
      }
      if (removedUsers && !removedUsers.some((address: string) => !isAddress(address))) {
        const tx = userWhitelist.batchRemoveFromWhitelist(account.address!, removedUsers);
        props.startTransaction(tx, 'Remove investors from whitelist');
      }
    } else {
      const tx = UserWhitelist.deploy(environment, UserWhitelistBytecode, account.address!, whitelistedUsers);
      props.startTransaction(tx, 'Deploy InvestorWhitelist Contract');
    }
  });

  return (
    <>
      <SectionTitle>
        {preExistingPolicy ? 'Update investor whitelist' : 'Configure Investor Whitelist Policy'}
      </SectionTitle>
      <NotificationBar kind="neutral">
        <NotificationContent>
          The investor whitelist policy defines a list of investor addresses which are allowed to invest into the fund.
          No other investors will be allowed into the fund.
        </NotificationContent>
      </NotificationBar>

      <FormContext {...form}>
        <form onSubmit={submit}>
          <Textarea
            name="userWhitelist"
            placeholder={`${zeroAddress}\n${zeroAddress}`}
            id="userWhitelist"
            label="Investor addresses to add"
          />
          {preExistingPolicy && (
            <Textarea
              name="removeUsers"
              placeholder={`${zeroAddress}\n${zeroAddress}`}
              id="removeUsers"
              label="Investor addresses to remove"
            />
          )}
          <BlockActions>
            {preExistingPolicy ? (
              <Button type="submit" disabled={!!form.errors.userWhitelist}>
                Update Investor Whitelist Policy
              </Button>
            ) : (
              <Button type="submit">Add Investor Whitelist Policy</Button>
            )}
          </BlockActions>
        </form>
      </FormContext>
    </>
  );
};

export default UserWhitelistConfiguration;
