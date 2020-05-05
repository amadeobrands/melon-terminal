import React from 'react';
import BigNumber from 'bignumber.js';
import * as Yup from 'yup';
import { Holding, Policy, AssetWhitelist, AssetBlacklist, MaxPositions, Token } from '@melonproject/melongql';
import { ExchangeDefinition, ExchangeIdentifier, sameAddress, DeployedEnvironment } from '@melonproject/melonjs';
import { useEnvironment } from '~/hooks/useEnvironment';
import { FundMelonEngineTrading } from '../FundMelonEngineTrading/FundMelonEngineTrading';
import { FundKyberTrading } from '../FundKyberTrading/FundKyberTrading';
import { FundUniswapTrading } from '../FundUniswapTrading/FundUniswapTrading';
import { Block } from '~/storybook/Block/Block';
import { Grid, GridRow, GridCol } from '~/storybook/Grid/Grid';
import { SectionTitle } from '~/storybook/Title/Title';
import { NotificationBar, NotificationContent } from '~/storybook/NotificationBar/NotificationBar';
import { Link } from '~/storybook/Link/Link';
import { Form, useFormik } from '~/components/Form/Form';
import { Select } from '~/components/Form/Select/Select';
import { BigNumberInput } from '~/components/Form/BigNumberInput/BigNumberInput';

export interface FundLiquidityProviderTradingProps {
  trading: string;
  denominationAsset?: Token;
  exchanges: ExchangeDefinition[];
  holdings: Holding[];
  policies?: Policy[];
}

export const FundLiquidityProviderTrading: React.FC<FundLiquidityProviderTradingProps> = (props) => {
  const environment = useEnvironment()!;

  const assetWhitelists = props.policies?.filter((policy) => policy.identifier === 'AssetWhitelist') as
    | AssetWhitelist[]
    | undefined;
  const assetBlacklists = props.policies?.filter((policy) => policy.identifier === 'AssetBlacklist') as
    | AssetBlacklist[]
    | undefined;
  const maxPositionsPolicies = props.policies?.filter((policy) => policy.identifier === 'MaxPositions') as
    | MaxPositions[]
    | undefined;

  const nonZeroHoldings = props.holdings.filter((holding) => !holding.amount?.isZero());

  const takerOptions = environment.tokens
    .filter((item) => !item.historic)
    .map((token) => ({
      value: token.address,
      label: token.symbol,
    }));

  const makerOptions = environment.tokens
    .filter((item) => !item.historic)
    .filter(
      (asset) =>
        sameAddress(asset.address, props.denominationAsset?.address) ||
        !assetWhitelists?.length ||
        assetWhitelists.every((list) => list.assetWhitelist?.some((item) => sameAddress(item, asset.address)))
    )
    .filter(
      (asset) =>
        sameAddress(asset.address, props.denominationAsset?.address) ||
        !assetBlacklists?.length ||
        !assetBlacklists.some((list) => list.assetBlacklist?.some((item) => sameAddress(item, asset.address)))
    )
    .map((token) => ({
      value: token.address,
      label: token.symbol,
    }));

  if (takerOptions?.length < 2) {
    return (
      <Block>
        <SectionTitle>Liquidity Pool Trading</SectionTitle>
        <p>
          Liquidity pool trading is not possible because the fund's risk management policies prevent the investment in
          any asset.
        </p>
      </Block>
    );
  }

  const uniswapLegacyWarning =
    props.exchanges.includes(environment.getExchange('0x3fda51d218919b96a850e7b66d412a4604e4901d')) &&
    !props.exchanges.includes(environment.getExchange(ExchangeIdentifier.Uniswap));

  return (
    <Block>
      <SectionTitle>Liquidity Pool Trading</SectionTitle>

      {uniswapLegacyWarning && (
        <NotificationBar kind="error">
          <NotificationContent>
            We have deployed a bug fix for the Uniswap adapter. To continue trading on Uniswap, you have to{' '}
            <Link to={`manage`}>register</Link> the new adapter in the <Link to={`manage`}>admin section</Link> of your
            fund.
          </NotificationContent>
        </NotificationBar>
      )}

      <FundLiquidityProviderTradingForm
        takerOptions={takerOptions}
        makerOptions={makerOptions}
        environment={environment}
        maxPositionsPolicies={maxPositionsPolicies}
        nonZeroHoldings={nonZeroHoldings}
        {...props}
      />
    </Block>
  );
};

const validationSchema = Yup.object().shape({
  makerAsset: Yup.string()
    .required()
    .test('maxPositions', 'Investing with this asset would violate the maximum number of positions policy', function (
      value: string
    ) {
      const maxPositionsPolicies = (this.options.context as any).maxPositionsPolicies as MaxPositions[] | undefined;
      const denominationAsset = (this.options.context as any).denominationAsset;
      const nonZeroHoldings = (this.options.context as any).nonZeroHoldings as Holding[];

      return (
        // no policies
        !maxPositionsPolicies?.length ||
        // new investment is in denomination asset
        sameAddress(denominationAsset?.address, value) ||
        // already existing token
        !!nonZeroHoldings?.some((holding) => sameAddress(holding.token?.address, value)) ||
        // max positions larger than holdings (so new token would still fit)
        maxPositionsPolicies.every(
          (policy) => policy.maxPositions && nonZeroHoldings && policy.maxPositions > nonZeroHoldings?.length
        )
      );
    }),
  takerAsset: Yup.string().required(),
  takerQuantity: Yup.mixed()
    .required('Missing sell quantity.')
    // tslint:disable-next-line
    .test('valid-number', 'The given value is not a valid number.', function (value) {
      return !value.isNaN() && !value.isZero() && value.isPositive();
    })
    // tslint:disable-next-line
    .test('balance-too-low', 'Your balance of the token is lower than the provided value.', function (value) {
      const holdings = (this.options.context as any).holdings as Holding[];
      const holding = holdings.find((item) => sameAddress(item.token!.address, this.parent.takerAsset))!;
      const divisor = holding ? new BigNumber(10).exponentiatedBy(holding.token!.decimals!) : new BigNumber('NaN');
      const balance = holding ? holding.amount!.dividedBy(divisor) : new BigNumber('NaN');
      return new BigNumber(value).isLessThanOrEqualTo(balance);
    }),
});

interface Options {
  value: string;
  label: string;
}

interface FundLiquidityProviderTradingFormProps extends FundLiquidityProviderTradingProps {
  takerOptions: Options[];
  makerOptions: Options[];
  environment: DeployedEnvironment;
  maxPositionsPolicies: MaxPositions[] | undefined;
  nonZeroHoldings: Holding[];
}

const FundLiquidityProviderTradingForm: React.FC<FundLiquidityProviderTradingFormProps> = ({
  takerOptions,
  makerOptions,
  environment,
  maxPositionsPolicies,
  denominationAsset,
  nonZeroHoldings,
  holdings,
  ...props
}) => {
  const validationContext = React.useMemo(
    () => ({ maxPositionsPolicies, denominationAsset, nonZeroHoldings, holdings }),
    [maxPositionsPolicies, denominationAsset, nonZeroHoldings, holdings]
  );

  const initialValues = {
    takerAsset: '',
    makerAsset: '',
    takerQuantity: new BigNumber(0),
  };

  const formik = useFormik({
    validationSchema,
    validationContext,
    initialValues,
    onSubmit: () => {},
  });

  const mln = environment.getToken('MLN');
  const weth = environment.getToken('WETH');

  const exchanges = props.exchanges
    .map((exchange) => {
      if (exchange.id === ExchangeIdentifier.KyberNetwork) {
        return [exchange, FundKyberTrading];
      }

      if (exchange.id === ExchangeIdentifier.Uniswap) {
        return [exchange, FundUniswapTrading];
      }

      if (exchange.id === ExchangeIdentifier.MelonEngine) {
        if (formik.values.makerAsset === weth && formik.values.takerAsset === mln) {
          return [exchange, FundMelonEngineTrading];
        }

        return null;
      }

      return null;
    })
    .filter((value) => !!value) as [ExchangeDefinition, React.ElementType][];

  return (
    <Form formik={formik}>
      <Grid>
        <GridRow>
          <GridCol>
            <SectionTitle>Choose the assets to swap</SectionTitle>
            <Select name="takerAsset" label="Sell this asset" options={takerOptions} />
            <Select name="makerAsset" label="To buy this asset" options={makerOptions} />
          </GridCol>
        </GridRow>

        <GridRow>
          <GridCol md={6}>
            <SectionTitle>{`Specify an amount of ${formik.values.takerAsset} to sell `}</SectionTitle>
            <BigNumberInput name="takerQuantity" label="Quantity" />
          </GridCol>

          <GridCol md={6}>
            <SectionTitle>Choose your pool and swap</SectionTitle>

            <Grid noGap={true}>
              {!!(exchanges && exchanges.length) &&
                exchanges.map(([exchange, Component]) => (
                  <GridRow key={exchange.id}>
                    <GridCol>
                      <Component
                        active={formik.isValid}
                        trading={props.trading}
                        holdings={holdings}
                        denominationAsset={denominationAsset}
                        policies={props.policies}
                        exchange={exchange}
                        maker={formik.values.makerAsset}
                        taker={formik.values.takerAsset}
                        quantity={formik.values.takerQuantity}
                      />
                    </GridCol>
                  </GridRow>
                ))}
            </Grid>
          </GridCol>
        </GridRow>
      </Grid>
    </Form>
  );
};
