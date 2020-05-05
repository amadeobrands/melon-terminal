import React from 'react';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useAccount } from '~/hooks/useAccount';
import { Participation } from '@melonproject/melonjs';
import { Account } from '@melonproject/melongql';
import { TransactionHookValues, TransactionFormValues } from '~/hooks/useTransaction';
import { Button } from '~/storybook/Button/Button';

export interface CancelRequestProps {
  address: string;
  account: Account;
  loading: boolean;
  transaction: TransactionHookValues<TransactionFormValues>;
}

export const CancelRequest: React.FC<CancelRequestProps> = (props) => {
  const environment = useEnvironment()!;
  const account = useAccount();

  const cancel = () => {
    const participationAddress = props.account && props.account.participation && props.account.participation.address;
    const participationContract = new Participation(environment, participationAddress);
    const tx = participationContract.cancelRequest(account.address!);
    props.transaction.start(tx, 'Cancel investment request');
  };

  return (
    <Button type="button" id="action" disabled={props.loading} onClick={() => cancel()}>
      Cancel Investment Request
    </Button>
  );
};
