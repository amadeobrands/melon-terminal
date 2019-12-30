import React from 'react';
import * as S from './CancelRequest.styles';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useTransaction } from '~/hooks/useTransaction';
import useForm, { FormContext } from 'react-hook-form';
import { Participation } from '@melonproject/melonjs';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import { SubmitButton } from '~/components/Common/Form/SubmitButton/SubmitButton';
import { Account } from '@melonproject/melongql';
import { useOnChainQueryRefetcher } from '~/hooks/useOnChainQueryRefetcher';
import { useAccount } from '~/hooks/useAccount';

export interface CancelRequestProps {
  address: string;
  account: Account;
}

export const CancelRequest: React.FC<CancelRequestProps> = props => {
  const environment = useEnvironment()!;
  const account = useAccount();
  const refetch = useOnChainQueryRefetcher();

  const transaction = useTransaction(environment, {
    onFinish: () => refetch(),
  });

  const participationAddress = props.account && props.account.participation && props.account.participation.address;
  const participationContract = new Participation(environment, participationAddress);

  const form = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });

  const submit = form.handleSubmit(() => {
    const tx = participationContract.cancelRequest(account.address!);
    transaction.start(tx, 'Cancel investment request');
  });

  return (
    <>
      <FormContext {...form}>
        <S.CancelInvestmentForm onSubmit={submit}>
          <SubmitButton label="Cancel investment request" id="action" />
        </S.CancelInvestmentForm>
      </FormContext>
      <TransactionModal transaction={transaction} />
    </>
  );
};

export default CancelRequest;
