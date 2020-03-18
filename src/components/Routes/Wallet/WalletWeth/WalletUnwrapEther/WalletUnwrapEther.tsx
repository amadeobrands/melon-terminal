import React from 'react';
import * as Yup from 'yup';
import BigNumber from 'bignumber.js';
import { useForm, FormContext } from 'react-hook-form';
import { Weth } from '@melonproject/melonjs';
import { useTransaction } from '~/hooks/useTransaction';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useAccount } from '~/hooks/useAccount';
import { Block, BlockActions } from '~/storybook/components/Block/Block';
import { Title } from '~/storybook/components/Title/Title';
import { Input } from '~/storybook/components/Input/Input';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { Button } from '~/storybook/components/Button/Button';
import * as S from './WalletUnwrapEther.styles';
import { toTokenBaseUnit } from '~/utils/toTokenBaseUnit';
import { fromTokenBaseUnit } from '~/utils/fromTokenBaseUnit';
import { TokenValue } from '~/components/Common/TokenValue/TokenValue';
import { TransactionDescription } from '~/components/Common/TransactionModal/TransactionDescription';

export const WalletUnwrapEther: React.FC = () => {
  const environment = useEnvironment()!;
  const account = useAccount();
  const transaction = useTransaction(environment);

  const validationSchema = Yup.object().shape({
    quantityWeth: Yup.mixed<BigNumber>()
      .transform((value, _) => new BigNumber(value))
      .test('positive', 'Amount of WETH has to be positive', (value: BigNumber) => value.isGreaterThan(0))
      .test(
        'balance',
        'Not enough WETH in wallet',
        (value: BigNumber) => !!account.weth?.isGreaterThanOrEqualTo(toTokenBaseUnit(value, 18))
      ),
  });

  const defaultValues = {
    quantityWeth: account.weth?.isLessThan(new BigNumber('1e18'))
      ? fromTokenBaseUnit(account.weth, 18)
      : new BigNumber(1),
  };

  const form = useForm<typeof defaultValues>({
    defaultValues,
    validationSchema,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const submit = form.handleSubmit(async data => {
    const token = environment.getToken('WETH')!;
    const weth = new Weth(environment, token.address);
    const tx = weth.withdraw(account.address!, toTokenBaseUnit(data.quantityWeth, 18));
    transaction.start(tx, 'Unwrap Ether');
  });

  const amount = form.watch('quantityWeth') as BigNumber;

  return (
    <Block>
      <Title>Unwrap Ether</Title>
      <FormContext {...form}>
        <form onSubmit={submit}>
          <S.WalletUnwrapEtherBalances>
            <S.WalletUnwrapEtherBalance>
              <TokenValue value={account.eth!} symbol="ETH" />
            </S.WalletUnwrapEtherBalance>
            <S.WalletUnwrapEtherBalance>
              <TokenValue value={account.weth!} symbol="WETH" />
            </S.WalletUnwrapEtherBalance>
          </S.WalletUnwrapEtherBalances>

          <Input id="quantityWeth" name="quantityWeth" label="Quantity" />
          <BlockActions>
            <Button type="submit" disabled={!!form.errors.quantityWeth}>
              Unwrap Ether
            </Button>
          </BlockActions>
        </form>
      </FormContext>

      <TransactionModal transaction={transaction}>
        <TransactionDescription title="Unwrap ether">
          This transaction converts <FormattedNumber value={amount} suffix="WETH (wrapped ether)" /> into{' '}
          <FormattedNumber value={amount} suffix="ETH" />
        </TransactionDescription>
      </TransactionModal>
    </Block>
  );
};

export default WalletUnwrapEther;
