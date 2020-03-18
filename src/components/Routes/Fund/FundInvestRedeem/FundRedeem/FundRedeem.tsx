import React, { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import * as Yup from 'yup';
import { useForm, FormContext } from 'react-hook-form';
import { Participation, sameAddress } from '@melonproject/melonjs';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useFundRedeemQuery } from './FundRedeem.query';
import { useTransaction } from '~/hooks/useTransaction';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import { Spinner } from '~/storybook/components/Spinner/Spinner';
import { useAccount } from '~/hooks/useAccount';
import { Input } from '~/storybook/components/Input/Input';
import { Button } from '~/storybook/components/Button/Button';
import { Block, BlockActions } from '~/storybook/components/Block/Block';
import { SectionTitle } from '~/storybook/components/Title/Title';
import {
  CheckboxContainer,
  CheckboxInput,
  CheckboxMask,
  CheckboxIcon,
  CheckboxLabel,
} from '~/storybook/components/Checkbox/Checkbox';
import { toTokenBaseUnit } from '~/utils/toTokenBaseUnit';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { TransactionDescription } from '~/components/Common/TransactionModal/TransactionDescription';
import { useFund } from '~/hooks/useFund';
import { RequiresFundManager } from '~/components/Gates/RequiresFundManager/RequiresFundManager';
import { Link } from 'react-router-dom';
import { getNetworkName } from '~/config';

export interface FundRedeemProps {
  address: string;
}

export const FundRedeem: React.FC<FundRedeemProps> = ({ address }) => {
  const environment = useEnvironment()!;
  const account = useAccount();
  const [result, query] = useFundRedeemQuery(address);
  const fund = useFund();

  const participationAddress = result?.account?.participation?.address;
  const hasInvested = result?.account?.participation?.hasInvested;
  const shares = result?.account?.shares;

  const lockedAssets = result?.fund?.routes?.trading?.lockedAssets;
  const prefix = getNetworkName(environment.network)!;

  const participationContract = new Participation(environment, participationAddress);

  const transaction = useTransaction(environment);

  const validationSchema = Yup.object().shape({
    shareQuantity: Yup.mixed<BigNumber>()
      .transform((value, _) => new BigNumber(value))
      .test('positive', 'Number of shares has to be positive', (value: BigNumber) => !!value?.isGreaterThan(0))
      .test(
        'smallerThanBalance',
        'Number of shares has to be equal or less than number of shares owned',
        (value: BigNumber) => !!(shares?.balanceOf && value.isLessThanOrEqualTo(shares?.balanceOf))
      ),

    redeemAll: Yup.boolean(),
  });

  const defaultValues = {
    shareQuantity: new BigNumber(1),
    redeemAll: false,
  };

  const form = useForm<typeof defaultValues>({
    defaultValues,
    validationSchema,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });

  const redeemAll = form.watch('redeemAll') as boolean;
  const shareQuantity = form.watch('shareQuantity') as BigNumber;

  useEffect(() => {
    if (redeemAll) {
      form.setValue('shareQuantity', shares?.balanceOf || new BigNumber(0));
    }
  }, [redeemAll]);

  const submit = form.handleSubmit(async data => {
    if (redeemAll) {
      const tx = participationContract.redeem(account.address!);
      transaction.start(tx, 'Redeem all shares');
      return;
    }

    const shareQuantity = toTokenBaseUnit(data.shareQuantity, 18);
    const tx = participationContract.redeemQuantity(account.address!, shareQuantity);
    transaction.start(tx, 'Redeem shares');
  });

  if (query.loading) {
    return (
      <Block>
        <SectionTitle>Redeem</SectionTitle>
        <Spinner />
      </Block>
    );
  }

  if (lockedAssets?.length) {
    return (
      <Block>
        <SectionTitle>Redeem</SectionTitle>
        <p>Redemption is currently not possible, because the fund has assets locked in the trading contract.</p>
        <RequiresFundManager fallback={false}>
          As the fund manager, you can on <Link to={`/${prefix}/fund/${address}/manage`}>move the assets to vault</Link>
          .
        </RequiresFundManager>
      </Block>
    );
  }

  return (
    <Block>
      <SectionTitle>Redeem</SectionTitle>

      {hasInvested && shares && !shares?.balanceOf?.isZero() && (
        <>
          <p>
            You own <FormattedNumber value={shares?.balanceOf} /> shares
          </p>
          <FormContext {...form}>
            <form onSubmit={submit}>
              <Input
                id="shareQuantity"
                name="shareQuantity"
                label="Number of shares to redeem"
                type="number"
                step="any"
                disabled={redeemAll}
              />
              <CheckboxContainer>
                <CheckboxInput type="checkbox" ref={form.register} name="redeemAll" id="redeemAll" />
                <CheckboxMask>
                  <CheckboxIcon />
                </CheckboxMask>
                <CheckboxLabel htmlFor="redeemAll">Redeem all shares</CheckboxLabel>
              </CheckboxContainer>
              <BlockActions>
                <Button type="submit">Redeem</Button>
              </BlockActions>
            </form>
          </FormContext>
        </>
      )}
      {(!hasInvested || shares?.balanceOf?.isZero() || !shares?.balanceOf) && <>You don't own any shares.</>}
      <TransactionModal transaction={transaction}>
        <TransactionDescription title="Redeem shares">
          You are redeeming{' '}
          {redeemAll ? (
            <>
              all your <FormattedNumber value={shares?.balanceOf} />
              shares{' '}
            </>
          ) : (
            <>
              <FormattedNumber value={shareQuantity} /> shares (of your total of{' '}
              <FormattedNumber value={shares?.balanceOf} /> shares){' '}
            </>
          )}{' '}
          of the fund &laquo;{fund.name}.&raquo; You will you receive a slice of the fund's assets.
        </TransactionDescription>
      </TransactionModal>
    </Block>
  );
};
