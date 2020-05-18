import { Participation, StandardToken, Transaction, sameAddress } from '@melonproject/melonjs';
import BigNumber from 'bignumber.js';
import React from 'react';
import { ValueType } from 'react-select';
import * as Yup from 'yup';
import { Form, useFormik } from '~/components/Form/Form';
import { Checkbox } from '~/components/Form/Checkbox/Checkbox';
import { Select, SelectOption } from '~/components/Form/Select/Select';
import { TokenValueInput } from '~/components/Form/TokenValueInput/TokenValueInput';
import { TokenValueSelect } from '~/components/Form/TokenValueSelect/TokenValueSelect';
import { useAccountAllowanceQuery } from '~/components/Routes/Fund/FundInvestRedeem/RequestInvestment/AccountAllowance.query';
import { useAccount } from '~/hooks/useAccount';
import { useEnvironment } from '~/hooks/useEnvironment';
import { TransactionHookValues } from '~/hooks/useTransaction';
import { BlockActions } from '~/storybook/Block/Block';
import { Button } from '~/components/Form/Button/Button';
import { TokenValue } from '~/TokenValue';
import { bigNumberSchema, tokenValueSchema } from '~/utils/formValidation';
import { sharesToken } from '~/utils/sharesToken';
import { TransactionRef } from '../FundInvest/FundInvest';
import { useInvestorTotalExposureQuery } from './InvestorTotalExposure.query';
import { useTokenRates } from '~/components/Contexts/Rates/Rates';
import { NotificationBar, NotificationContent } from '~/storybook/NotificationBar/NotificationBar';
import { TokenValueDisplay } from '~/components/Common/TokenValueDisplay/TokenValueDisplay';
import { Link } from '~/storybook/Link/Link';
import { Token } from '@melonproject/melongql';

export interface RequestInvestmentProps {
  fundAddress: string;
  participationAddress: string;
  investableAssets: TokenValue[];
  currentShares: BigNumber;
  transaction: TransactionHookValues;
  denominationAsset: Token;
}

const validationSchema = Yup.object({
  acknowledgeLimitRequired: Yup.boolean().required(),
  acknowledgeLimit: Yup.boolean().when(['acknowledgeLimitRequired'], (required: boolean, schema: Yup.BooleanSchema) => {
    return required ? schema.required().oneOf([true], 'This is a required field.') : schema;
  }),
  premiumPercentage: Yup.number().required().min(0),
  etherBalance: bigNumberSchema()
    .required()
    .gte('1.4e16', 'Your ether balance is not sufficient to pay for the transaction cost.'),
  tokenBalance: tokenValueSchema().required(),
  tokenAllowance: tokenValueSchema().required(),
  requestedShares: tokenValueSchema().required().gt(0, 'Number of shares has to be positive.'),
  investmentAmount: tokenValueSchema()
    .required()
    .lte(Yup.ref('tokenBalance'), 'Your balance is too low for this investment amount.'),
});

export const RequestInvestment = React.forwardRef(
  (props: RequestInvestmentProps, ref: React.Ref<TransactionRef | undefined>) => {
    const account = useAccount();
    const environment = useEnvironment()!;
    const [nextTransaction, setNextTransaction] = React.useState<Transaction>();

    const participationAddress = props.participationAddress;
    const initialPremium = props.currentShares.isZero() ? 0 : 0.1;
    const initialInvestment = React.useMemo(() => {
      const asset = props.investableAssets[0];
      return asset.setValue(asset.value!.multipliedBy(1 + initialPremium));
    }, [props.investableAssets, initialPremium]);

    const formik = useFormik({
      validationSchema,
      initialValues: {
        requestedShares: new TokenValue(sharesToken, 1),
        tokenAllowance: initialInvestment.setValue(0),
        tokenBalance: initialInvestment.setValue(0),
        etherBalance: account.eth,
        investmentAmount: initialInvestment,
        premiumPercentage: initialPremium,
        acknowledgeLimit: false,
        acknowledgeLimitRequired: false,
      },
      onSubmit: (values) => {
        const contract = new Participation(environment, participationAddress);
        const investTx = contract.requestInvestment(
          account.address!,
          requestedShares.integer!,
          investmentAmount.integer!,
          investmentAmount.token.address
        );

        if (values.tokenAllowance.value!.isLessThan(values.investmentAmount.value!)) {
          const contract = new StandardToken(environment, investmentAmount.token.address);
          const tx = contract.approve(account.address!, participationAddress, investmentAmount.integer!);

          setNextTransaction(investTx);

          props.transaction.start(tx, 'Approve');
        } else {
          props.transaction.start(investTx, 'Invest');
        }
      },
    });

    const investmentAmount = formik.values.investmentAmount;
    const requestedShares = formik.values.requestedShares;

    const ethRate = useTokenRates('ETH');
    const tokenRate = useTokenRates(investmentAmount.token.symbol);

    const [currentExposureResult, currentExposureQuery] = useInvestorTotalExposureQuery(account.address);
    const [currentAllowanceResult, currentAllowanceQuery] = useAccountAllowanceQuery(
      account.address,
      investmentAmount.token.address,
      participationAddress
    );

    const tokenBalance = React.useMemo(() => {
      const selectedToken = investmentAmount.token;
      const currentBalance = currentAllowanceResult?.balance ?? 0;
      return TokenValue.fromToken(selectedToken, currentBalance);
    }, [currentAllowanceResult, investmentAmount.token]);

    const tokenAllowance = React.useMemo(() => {
      const selectedToken = investmentAmount.token;
      const currentAllowance = currentAllowanceResult?.allowance ?? 0;
      return TokenValue.fromToken(selectedToken, currentAllowance);
    }, [currentAllowanceResult, investmentAmount.token]);

    React.useLayoutEffect(() => {
      formik.setFieldValue('etherBalance', account.eth, true);
    }, [account.eth]);

    React.useLayoutEffect(() => {
      formik.setFieldValue('tokenBalance', tokenBalance, true);
      formik.setFieldValue('tokenAllowance', tokenAllowance, true);
    }, [tokenBalance, tokenAllowance]);

    React.useLayoutEffect(() => {
      const currentExposure = (currentExposureResult ?? new BigNumber(0)).multipliedBy(ethRate.USD);
      const additionalExposure = (investmentAmount.value ?? new BigNumber(0))
        .multipliedBy(tokenRate.USD)
        .multipliedBy('1e18');

      const totalExposure = currentExposure.plus(additionalExposure);
      const councilExposureLimit = new BigNumber(process.env.MELON_MAX_EXPOSURE).multipliedBy('1e18');

      if (totalExposure.isGreaterThan(councilExposureLimit)) {
        formik.setFieldValue('acknowledgeLimitRequired', true);
      } else {
        formik.setFieldValue('acknowledgeLimitRequired', false);
      }
    }, [ethRate, tokenRate, investmentAmount, currentExposureResult]);

    const handleRequestedSharesChange = React.useCallback(
      (value: TokenValue, before?: TokenValue) => {
        const token = formik.values.investmentAmount;
        const shareCostInAsset = props.investableAssets.find((asset) => asset.token.address === token.token.address);
        const multiplier = 1 + formik.values.premiumPercentage;

        // if requested shares change, we derive the investment amount
        if (before && value.value !== before?.value) {
          const amount = value.value?.multipliedBy(shareCostInAsset!.value!).multipliedBy(multiplier);
          const amountRounded = amount?.decimalPlaces(token!.token!.decimals!, BigNumber.ROUND_UP);
          formik.setFieldValue('investmentAmount', new TokenValue(token.token, amountRounded));
        }
      },
      [formik]
    );

    const handleInvestmentChange = React.useCallback(
      (value: TokenValue, before?: TokenValue) => {
        const requestedShares = formik.values.requestedShares;
        const shareCostInAsset = props.investableAssets.find((asset) => asset.token.address === value.token.address);
        const multiplier = 1 + formik.values.premiumPercentage;

        // if token changes, we keep the number of shares constant and calculate the investment amount
        if (before && value.token !== before?.token) {
          const amount = requestedShares.value?.multipliedBy(shareCostInAsset!.value!).multipliedBy(multiplier);
          const amountRounded = amount!.decimalPlaces(investmentAmount!.token!.decimals!, BigNumber.ROUND_UP);
          formik.setFieldValue('investmentAmount', value.setValue(amountRounded));
        } else if (before && value.value?.comparedTo(before.value ?? '')) {
          // if investment amount changes, we derive the number of shares
          const shares = value.value?.dividedBy(shareCostInAsset!.value!).dividedBy(multiplier);
          const sharesRounded = shares.decimalPlaces(sharesToken.decimals, BigNumber.ROUND_UP);
          formik.setFieldValue('requestedShares', requestedShares.setValue(sharesRounded!));
        }
      },
      [formik]
    );

    const handlePremiumChange = React.useCallback(
      (option: ValueType<SelectOption>) => {
        const requestedShares = formik.values.requestedShares;
        const token = formik.values.investmentAmount;
        const shareCostInAsset = props.investableAssets.find((asset) => asset.token.address === token.token.address);
        const multiplier = 1 + (option as any).value;

        // if the premium changes, we keep the requested shares constant but we adapt the investment amount
        const amount = requestedShares.value!.multipliedBy(shareCostInAsset!.value!).multipliedBy(multiplier);
        const amountRounded = amount.decimalPlaces(token.token.decimals, BigNumber.ROUND_UP);
        formik.setFieldValue('investmentAmount', token.setValue(amountRounded));
      },
      [formik]
    );

    const premiumOptions = [0, 0.01, 0.02, 0.05, 0.1, 0.15, 0.2, 0.25].map((value) => ({
      value,
      label: `${(value * 100).toFixed(0)}%`,
    }));

    React.useImperativeHandle(ref, () => ({
      next: (start: (transaction: Transaction, name: string) => void) => {
        if (nextTransaction) {
          return props.transaction.start(nextTransaction, 'Invest');
        }
      },
    }));

    const loading = currentExposureQuery.loading || currentAllowanceQuery.loading;
    const shareCostInAsset = props.investableAssets.find(
      (asset) => asset.token.address === formik.values.investmentAmount.token.address
    );
    const maxSharePrice = new TokenValue(
      shareCostInAsset!.token,
      investmentAmount.value?.dividedBy(requestedShares.value!)
    );

    const test = <>asdfa</>;

    return (
      <Form formik={formik}>
        <TokenValueInput
          name="requestedShares"
          label="Number of shares"
          noIcon={true}
          disabled={loading}
          onChange={handleRequestedSharesChange}
        />

        <TokenValueSelect
          name="investmentAmount"
          label={
            <>
              Amount and asset (your wallet's balance: <TokenValueDisplay value={tokenBalance} />)
            </>
          }
          tokens={props.investableAssets.map((item) => item.token)}
          disabled={loading}
          onChange={handleInvestmentChange}
        />

        <Select
          name="premiumPercentage"
          label="Maximum premium to current share price"
          options={premiumOptions}
          disabled={loading}
          onChange={handlePremiumChange}
        />

        {formik.values.acknowledgeLimitRequired && (
          <>
            <NotificationBar kind="error">
              <NotificationContent style={{ textAlign: 'left' }}>
                After this investment, your maximum exposure to Melon funds will exceed the current limit set by the
                Melon Council (DAI 50k).
              </NotificationContent>
            </NotificationBar>

            <Checkbox
              disabled={loading}
              name="acknowledgeLimit"
              label="I acknowledge that I am aware of the risks associated with having a large exposure to Melon funds."
            />
          </>
        )}

        {initialPremium > formik.values.premiumPercentage && (
          <>
            <NotificationBar kind="warning">
              <NotificationContent style={{ textAlign: 'left' }}>
                You have set the "Maximum premium to the current share price" to {formik.values.premiumPercentage * 100}
                %, which is lower than the recommended premium of {initialPremium * 100}%. If the share price increases
                by more than {formik.values.premiumPercentage * 100}% by the next price update, then your investment
                request cannot be executed.
              </NotificationContent>
              {!sameAddress(investmentAmount.token.address, props.denominationAsset?.address) && (
                <NotificationContent style={{ textAlign: 'left' }}>
                  <br />
                  In addition, you are investing in {investmentAmount.token.symbol} and the denomination asset of the
                  fund is {props.denominationAsset?.symbol}. If the price of {investmentAmount.token.symbol} falls more
                  than {formik.values.premiumPercentage * 100}% by the next price update, your investment request cannot
                  be executed.
                </NotificationContent>
              )}
            </NotificationBar>
          </>
        )}

        <NotificationBar kind="neutral">
          <NotificationContent>
            <p style={{ textAlign: 'left', fontWeight: 'bold' }}>Investment summary</p>
            <p style={{ textAlign: 'left' }}>
              You are requesting an investment of <TokenValueDisplay value={formik.values.requestedShares} /> at a
              maximum price of <TokenValueDisplay value={maxSharePrice} /> per share. This is a{' '}
              {formik.values.premiumPercentage * 100}% premium to the current share price of{' '}
              <TokenValueDisplay value={shareCostInAsset} />.
            </p>
            <p style={{ textAlign: 'left' }}>
              Your investment request will be executed at the share price that is valid after the next price update. If
              the share price at that point in time is higher than your maximum share price, your investment request
              will not be executed.
            </p>
          </NotificationContent>
        </NotificationBar>

        <BlockActions>
          <Button type="submit" disabled={loading}>
            Invest
          </Button>
        </BlockActions>
      </Form>
    );
  }
);
