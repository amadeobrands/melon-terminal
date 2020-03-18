import React, { useEffect, useRef } from 'react';
import BigNumber from 'bignumber.js';
import * as Yup from 'yup';
import { useForm, FormContext } from 'react-hook-form';
import { Holding, Policy, AssetWhitelist, AssetBlacklist, MaxPositions, Token } from '@melonproject/melongql';
import { ExchangeDefinition, ExchangeIdentifier, sameAddress } from '@melonproject/melonjs';
import { useEnvironment } from '~/hooks/useEnvironment';
import { Dropdown } from '~/storybook/components/Dropdown/Dropdown';
import { Input } from '~/storybook/components/Input/Input';
import { FundMelonEngineTrading } from '../FundMelonEngineTrading/FundMelonEngineTrading';
import { FundKyberTrading } from '../FundKyberTrading/FundKyberTrading';
import { FundUniswapTrading } from '../FundUniswapTrading/FundUniswapTrading';
import { Block } from '~/storybook/components/Block/Block';
import { Grid, GridRow, GridCol } from '~/storybook/components/Grid/Grid';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { NotificationBar, NotificationContent } from '~/storybook/components/NotificationBar/NotificationBar';
import { Link } from '~/storybook/components/Link/Link';

export interface FundLiquidityProviderTradingProps {
  trading: string;
  denominationAsset?: Token;
  exchanges: ExchangeDefinition[];
  holdings: Holding[];
  policies?: Policy[];
}

interface FundLiquidityProviderTradingFormValues {
  makerAsset: string;
  takerAsset: string;
  takerQuantity: string;
}

export const FundLiquidityProviderTrading: React.FC<FundLiquidityProviderTradingProps> = props => {
  const environment = useEnvironment()!;

  const assetWhitelists = props.policies?.filter(policy => policy.identifier === 'AssetWhitelist') as
    | AssetWhitelist[]
    | undefined;
  const assetBlacklists = props.policies?.filter(policy => policy.identifier === 'AssetBlacklist') as
    | AssetBlacklist[]
    | undefined;
  const maxPositionsPolicies = props.policies?.filter(policy => policy.identifier === 'MaxPositions') as
    | MaxPositions[]
    | undefined;

  const nonZeroHoldings = props.holdings.filter(holding => !holding.amount?.isZero());

  const takerOptions = environment.tokens
    .filter(item => !item.historic)
    .map(token => ({
      value: token.address,
      name: token.symbol,
    }));

  const makerOptions = environment.tokens
    .filter(item => !item.historic)
    .filter(
      asset =>
        sameAddress(asset.address, props.denominationAsset?.address) ||
        !assetWhitelists?.length ||
        assetWhitelists.every(list => list.assetWhitelist?.some(item => sameAddress(item, asset.address)))
    )
    .filter(
      asset =>
        sameAddress(asset.address, props.denominationAsset?.address) ||
        !assetBlacklists?.length ||
        !assetBlacklists.some(list => list.assetBlacklist?.some(item => sameAddress(item, asset.address)))
    )
    .map(token => ({
      value: token.address,
      name: token.symbol,
    }));

  const mln = environment.getToken('MLN');
  const weth = environment.getToken('WETH');

  // TODO: These refs are used for validation. Fix this after https://github.com/react-hook-form/react-hook-form/pull/817
  const holdingsRef = useRef(props.holdings);

  const form = useForm<FundLiquidityProviderTradingFormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      makerAsset: makerOptions?.[0]?.value,
      takerAsset: takerOptions?.[1]?.value,
      takerQuantity: '1',
    },
    validationSchema: Yup.object().shape({
      makerAsset: Yup.string()
        .required()
        .test(
          'maxPositions',
          'Investing with this asset would violate the maximum number of positions policy',
          (value: string) =>
            // no policies
            !maxPositionsPolicies?.length ||
            // new investment is in denomination asset
            sameAddress(props.denominationAsset?.address, value) ||
            // already existing token
            !!nonZeroHoldings?.some(holding => sameAddress(holding.token?.address, value)) ||
            // max positions larger than holdings (so new token would still fit)
            maxPositionsPolicies.every(
              policy => policy.maxPositions && nonZeroHoldings && policy.maxPositions > nonZeroHoldings?.length
            )
        ),
      takerAsset: Yup.string().required(),
      takerQuantity: Yup.string()
        .required('Missing sell quantity.')
        // tslint:disable-next-line
        .test('valid-number', 'The given value is not a valid number.', function(value) {
          const bn = new BigNumber(value);
          return !bn.isNaN() && !bn.isZero() && bn.isPositive();
        })
        // tslint:disable-next-line
        .test('balance-too-low', 'Your balance of the token is lower than the provided value.', function(value) {
          const holding = holdingsRef.current.find(item => sameAddress(item.token!.address, this.parent.takerAsset))!;
          const divisor = holding ? new BigNumber(10).exponentiatedBy(holding.token!.decimals!) : new BigNumber('NaN');
          const balance = holding ? holding.amount!.dividedBy(divisor) : new BigNumber('NaN');
          return new BigNumber(value).isLessThanOrEqualTo(balance);
        }),
    }),
  });

  useEffect(() => {
    holdingsRef.current = props.holdings;
    form.triggerValidation().catch(() => {});
  }, [props.holdings, form.formState.touched]);

  const makerAsset = environment.getToken(form.watch('makerAsset')!);
  const takerAsset = environment.getToken(form.watch('takerAsset')!);
  const takerQuantity = new BigNumber(form.watch('takerQuantity'));
  const ready = form.formState.isValid;

  const exchanges = props.exchanges
    .map(exchange => {
      if (exchange.id === ExchangeIdentifier.KyberNetwork) {
        return [exchange, FundKyberTrading];
      }

      if (exchange.id === ExchangeIdentifier.Uniswap) {
        return [exchange, FundUniswapTrading];
      }

      if (exchange.id === ExchangeIdentifier.MelonEngine) {
        if (makerAsset === weth && takerAsset === mln) {
          return [exchange, FundMelonEngineTrading];
        }

        return null;
      }

      return null;
    })
    .filter(value => !!value) as [ExchangeDefinition, React.ElementType][];

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
    props.exchanges.includes(environment.getExchange('UniswapOld')) &&
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

      <FormContext {...form}>
        <Grid>
          <GridRow>
            <GridCol>
              <SectionTitle>Choose the assets to swap</SectionTitle>
              <Dropdown
                name="takerAsset"
                label="Sell this asset"
                options={takerOptions}
                onChange={() => form.triggerValidation().catch(() => {})}
              />
              <Dropdown
                name="makerAsset"
                label="To buy this asset"
                options={makerOptions}
                onChange={() => form.triggerValidation().catch(() => {})}
              />
            </GridCol>
          </GridRow>

          <GridRow>
            <GridCol md={6}>
              <SectionTitle>{`Specify an amount of ${takerAsset.symbol} to sell `}</SectionTitle>
              <Input type="number" step="any" name="takerQuantity" label="Quantity" />
            </GridCol>

            <GridCol md={6}>
              <SectionTitle>Choose your pool and swap</SectionTitle>

              <Grid noGap={true}>
                {!!(exchanges && exchanges.length) &&
                  exchanges.map(([exchange, Component]) => (
                    <GridRow key={exchange.id}>
                      <GridCol>
                        <Component
                          active={ready}
                          trading={props.trading}
                          holdings={props.holdings}
                          denominationAsset={props.denominationAsset}
                          policies={props.policies}
                          exchange={exchange}
                          maker={makerAsset}
                          taker={takerAsset}
                          quantity={takerQuantity}
                        />
                      </GridCol>
                    </GridRow>
                  ))}
              </Grid>
            </GridCol>
          </GridRow>
        </Grid>
      </FormContext>
    </Block>
  );
};
