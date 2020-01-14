import React from 'react';
import * as Yup from 'yup';
import BigNumber from 'bignumber.js';
import useForm, { FormContext } from 'react-hook-form';
import { toWei } from 'web3-utils';
import { Weth } from '@melonproject/melonjs';
import { useTransaction } from '~/hooks/useTransaction';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useAccount } from '~/hooks/useAccount';
import { useOnChainQueryRefetcher } from '~/hooks/useOnChainQueryRefetcher';
import { Block, BlockActions } from '~/storybook/components/Block/Block';
import { Title } from '~/storybook/components/Title/Title';
import { FormField } from '~/storybook/components/FormField/FormField';
import { Input } from '~/storybook/components/Input/Input';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { Button } from '~/storybook/components/Button/Button';
import * as S from './WalletUnwrapEther.styles';

const validationSchema = Yup.object().shape({
  quantity: Yup.mixed<number>(),
});

const defaultValues = {
  quantity: '0.5',
};

export const WalletUnwrapEther: React.FC = () => {
  const environment = useEnvironment()!;
  const account = useAccount();
  const refetch = useOnChainQueryRefetcher();
  const transaction = useTransaction(environment!, {
    onFinish: () => refetch(),
  });

  const form = useForm<typeof defaultValues>({
    defaultValues,
    validationSchema,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });

  const submit = form.handleSubmit(async data => {
    const token = environment.getToken('WETH')!;
    const weth = new Weth(environment, token.address);
    const tx = weth.withdraw(account.address!, new BigNumber(toWei(data.quantity)));
    transaction.start(tx, 'Unwrap Ether');
  });

  return (
    <Block>
      <Title>Unwrap Ether</Title>
      <FormContext {...form}>
        <form onSubmit={submit}>
          <S.WalletUnwrapEtherBalances>
            <S.WalletUnwrapEtherBalance>
              <FormattedNumber value={account.eth} suffix="ETH" />
            </S.WalletUnwrapEtherBalance>
            <S.WalletUnwrapEtherBalance>
              <FormattedNumber value={account.weth} suffix="WETH" />
            </S.WalletUnwrapEtherBalance>
          </S.WalletUnwrapEtherBalances>

          <FormField name="quantity" label="Quantity">
            <Input id="quantity" name="quantity" type="number" step="any" />
          </FormField>
          <BlockActions>
            <Button type="submit">Unwrap Ether</Button>
          </BlockActions>
        </form>
      </FormContext>

      <TransactionModal transaction={transaction} />
    </Block>
  );
};

export default WalletUnwrapEther;
