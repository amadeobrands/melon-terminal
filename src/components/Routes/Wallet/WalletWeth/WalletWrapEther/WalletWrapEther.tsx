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
import { Button } from '~/storybook/components/Button/Button';
import * as S from './WalletWrapEther.styles';
import { toTokenBaseUnit } from '~/utils/toTokenBaseUnit';
import { fromTokenBaseUnit } from '~/utils/fromTokenBaseUnit';
import { TokenValue } from '~/components/Common/TokenValue/TokenValue';
import { NotificationBar, NotificationContent } from '~/storybook/components/NotificationBar/NotificationBar';
import { TransactionDescription } from '~/components/Common/TransactionModal/TransactionDescription';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';

export const WalletWrapEther: React.FC = () => {
  const environment = useEnvironment()!;
  const account = useAccount();
  const transaction = useTransaction(environment);

  const validationSchema = Yup.object().shape({
    quantityEth: Yup.mixed<BigNumber>()
      .transform((value, _) => new BigNumber(value))
      .test('positive', 'Amount of ETH has to be positive', (value: BigNumber) => value.isGreaterThan(0))
      .test(
        'balance',
        'Not enough ETH in wallet',
        (value: BigNumber) => !!account.eth?.isGreaterThanOrEqualTo(toTokenBaseUnit(value, 18))
      ),
  });

  const defaultValues = {
    quantityEth: BigNumber.minimum(
      BigNumber.maximum(
        fromTokenBaseUnit((account.eth || new BigNumber(0)).minus(new BigNumber('1e16')), 18),
        new BigNumber(0)
      ),
      new BigNumber(1)
    ),
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
    const tx = weth.deposit(account.address!, toTokenBaseUnit(data.quantityEth, 18));
    transaction.start(tx, 'Wrap Ether');
  });

  const amount = form.watch('quantityEth') as BigNumber;
  const showNotification =
    !account.eth?.isLessThan(toTokenBaseUnit(amount, 18)) &&
    account.eth?.minus(toTokenBaseUnit(amount, 18)).isLessThan(new BigNumber('1e16'));

  return (
    <Block>
      <Title>Wrap Ether</Title>
      <FormContext {...form}>
        <form onSubmit={submit}>
          <S.WalletWrapEtherBalances>
            <S.WalletWrapEtherBalance>
              <TokenValue value={account.eth!} symbol="ETH" />
            </S.WalletWrapEtherBalance>
            <S.WalletWrapEtherBalance>
              <TokenValue value={account.weth!} symbol="WETH" />
            </S.WalletWrapEtherBalance>
          </S.WalletWrapEtherBalances>
          <Input id="quantityEth" name="quantityEth" label="Quantity" type="number" step="any" />

          {showNotification && (
            <NotificationBar kind="warning">
              <NotificationContent>
                Only a very small amount of ETH will be left in your wallet after this transaction, but you need some
                ETH in your wallet to pay transaction fees.
              </NotificationContent>
            </NotificationBar>
          )}
          <BlockActions>
            <Button type="submit" disabled={!!form.errors.quantityEth}>
              Wrap Ether
            </Button>
          </BlockActions>
        </form>
      </FormContext>

      <TransactionModal transaction={transaction}>
        <TransactionDescription title="Wrap ether">
          This transaction converts <FormattedNumber value={amount} suffix="ETH" /> into{' '}
          <FormattedNumber value={amount} suffix="WETH (wrapped ether)" />
        </TransactionDescription>
      </TransactionModal>
    </Block>
  );
};

export default WalletWrapEther;
