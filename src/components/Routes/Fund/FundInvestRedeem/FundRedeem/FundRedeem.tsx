import React, { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import { Participation } from '@melonproject/melonjs';
import { Form, useFormik } from '~/components/Form/Form';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useFundRedeemQuery } from './FundRedeem.query';
import { useTransaction } from '~/hooks/useTransaction';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { useAccount } from '~/hooks/useAccount';
import { Block, BlockActions } from '~/storybook/Block/Block';
import { SectionTitle } from '~/storybook/Title/Title';
import { toTokenBaseUnit } from '~/utils/toTokenBaseUnit';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { TransactionDescription } from '~/components/Common/TransactionModal/TransactionDescription';
import { useFund } from '~/hooks/useFund';
import { RequiresFundManager } from '~/components/Gates/RequiresFundManager/RequiresFundManager';
import { getNetworkName } from '~/config';
import { Input } from '~/components/Form/Input/Input';
import { Button } from '~/components/Form/Button/Button';
import { Checkbox } from '~/components/Form/Checkbox/Checkbox';
import { AccountShares } from '@melonproject/melongql';

export interface FundRedeemProps {
  address: string;
}

const validationSchema = Yup.object().shape({
  shareQuantity: Yup.mixed<BigNumber>()
    .transform((value, _) => new BigNumber(value))
    .test('positive', 'Number of shares has to be positive', (value: BigNumber) => !!value?.isGreaterThan(0))
    .test('smallerThanBalance', 'Number of shares has to be equal or less than number of shares owned', function (
      value: BigNumber
    ) {
      const shares = (this.options.context as any).shares as AccountShares;
      return !!(shares?.balanceOf && value.isLessThanOrEqualTo(shares?.balanceOf));
    }),

  redeemAll: Yup.boolean(),
});

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

  const validationContext = React.useMemo(
    () => ({
      shares,
    }),
    [shares]
  );

  const initialValues = {
    shareQuantity: new BigNumber(1),
    redeemAll: false,
  };

  const formik = useFormik({
    validationSchema,
    validationContext,
    initialValues,
    onSubmit: async (data) => {
      if (data.redeemAll) {
        const tx = participationContract.redeem(account.address!);
        transaction.start(tx, 'Redeem all shares');
        return;
      }

      const shareQuantity = toTokenBaseUnit(data.shareQuantity, 18);
      const tx = participationContract.redeemQuantity(account.address!, shareQuantity);
      transaction.start(tx, 'Redeem shares');
    },
  });

  useEffect(() => {
    formik.setFieldValue('shareQuantity', shares?.balanceOf || new BigNumber(0));
  }, [formik.values.redeemAll]);

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
          <Form formik={formik}>
            <Input
              id="shareQuantity"
              name="shareQuantity"
              label="Number of shares to redeem"
              type="number"
              step="any"
              disabled={formik.values.redeemAll}
            />
            <Checkbox name="redeemAll" label="Redeem all shares" />
            <BlockActions>
              <Button type="submit">Redeem</Button>
            </BlockActions>
          </Form>
        </>
      )}
      {(!hasInvested || shares?.balanceOf?.isZero() || !shares?.balanceOf) && <>You don't own any shares.</>}
      <TransactionModal transaction={transaction}>
        <TransactionDescription title="Redeem shares">
          You are redeeming{' '}
          {formik.values.redeemAll ? (
            <>
              all your <FormattedNumber value={shares?.balanceOf} />
              shares{' '}
            </>
          ) : (
            <>
              <FormattedNumber value={formik.values.shareQuantity} /> shares (of your total of{' '}
              <FormattedNumber value={shares?.balanceOf} /> shares){' '}
            </>
          )}{' '}
          of the fund &laquo;{fund.name}.&raquo; You will you receive a slice of the fund's assets.
        </TransactionDescription>
      </TransactionModal>
    </Block>
  );
};
