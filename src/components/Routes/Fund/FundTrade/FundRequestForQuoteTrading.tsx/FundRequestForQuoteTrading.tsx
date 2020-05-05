import React, { useEffect, useRef, useState, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import * as Yup from 'yup';
import { useForm, FormContext } from 'react-hook-form';
import { Holding, Policy, AssetWhitelist, AssetBlacklist, MaxPositions, Token } from '@melonproject/melongql';
import { ExchangeDefinition, sameAddress, TokenDefinition } from '@melonproject/melonjs';
import { useEnvironment } from '~/hooks/useEnvironment';
import { Dropdown } from '~/storybook/Dropdown/Dropdown';
import { Input } from '~/storybook/Input/Input';
import { Block } from '~/storybook/Block/Block';
import { Grid, GridRow, GridCol } from '~/storybook/Grid/Grid';
import { SectionTitle } from '~/storybook/Title/Title';
import { FundRequestForQuoteOffer } from './FundRequestForQuoteOffer';

export interface FundRequestForQuoteTradingProps {
  trading: string;
  denominationAsset?: Token;
  exchange: ExchangeDefinition;
  holdings: Holding[];
  policies?: Policy[];
}

interface FundRequestForQuoteTradingFormValues {
  makerAsset: string;
  takerAsset: string;
  takerQuantity: string;
}

interface Asset {
  address: string;
  decimals: string;
  type: string;
}

interface Market {
  id: string;
  base: Asset;
  quote: Asset;
  status: string;
}

function useMarkets() {
  const environment = useEnvironment()!;
  const [state, setState] = useState({
    loading: true,
    markets: [] as Market[],
  });

  useEffect(() => {
    (async () => {
      try {
        const result = await (await fetch(`${process.env.MELON_API_GATEWAY}/rfq/markets`)).json();

        setState({
          loading: false,
          markets: result?.items ?? [],
        });
      } catch (e) {
        setState({
          loading: false,
          markets: [],
        });
      }
    })();
  }, []);

  const markets = useMemo(() => {
    return state.markets
      .filter((item) => item.status === 'available')
      .reduce((carry, current) => {
        const baseToken = environment.getToken(current.base.address);
        const quoteToken = environment.getToken(current.quote.address);
        if (!baseToken || !quoteToken || baseToken.historic || quoteToken.historic) {
          return carry;
        }

        const baseEntries = carry.get(baseToken) ?? new Map();
        baseEntries.set(quoteToken, [current.id, 'buy']);

        const quoteEntries = carry.get(quoteToken) ?? new Map();
        quoteEntries.set(baseToken, [current.id, 'sell']);

        return carry.set(baseToken, baseEntries).set(quoteToken, quoteEntries);
      }, new Map<TokenDefinition, Map<TokenDefinition, [string, 'sell' | 'buy']>>());
  }, [environment.tokens, state.markets]);

  return [markets, state.loading] as [typeof markets, typeof state.loading];
}

export const FundRequestForQuoteTrading: React.FC<FundRequestForQuoteTradingProps> = (props) => {
  const [markets, loading] = useMarkets();
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

  // TODO: These refs are used for validation. Fix this after https://github.com/react-hook-form/react-hook-form/pull/817
  const holdingsRef = useRef(props.holdings);

  const form = useForm<FundRequestForQuoteTradingFormValues>({
    mode: 'onChange',
    defaultValues: {
      takerQuantity: '1',
    },
    validationSchema: Yup.object().shape({
      makerAsset: Yup.string()
        .required('Missing required buy asset.')
        .test(
          'maxPositions',
          'Investing with this asset would violate the maximum number of positions policy',
          (value) =>
            // no policies
            !maxPositionsPolicies?.length ||
            // new investment is in denomination asset
            sameAddress(props.denominationAsset?.address, value) ||
            // already existing token
            !!nonZeroHoldings?.some((holding) => sameAddress(holding.token?.address, value)) ||
            // max positions larger than holdings (so new token would still fit in)
            maxPositionsPolicies.every(
              (policy) => policy.maxPositions && nonZeroHoldings && policy.maxPositions > nonZeroHoldings?.length
            )
        )
        .test(
          'assetWhitelist',
          'This fund operates an asset whitelist and the asset you are intending to buy is not on that whitelist',
          (asset) =>
            !assetWhitelists?.length ||
            assetWhitelists.every((list) => list.assetWhitelist?.some((item) => sameAddress(item, asset.address)))
        )
        .test(
          'assetBlacklist',
          'This fund operates an asset blacklist and the asset you are intending to buy is on that blacklist',
          (asset) =>
            !assetBlacklists?.length ||
            !assetBlacklists.some((list) => list.assetBlacklist?.some((item) => sameAddress(item, asset.address)))
        ),
      takerAsset: Yup.string().required('Missing required sell asset.'),
      takerQuantity: Yup.string()
        .required('Missing sell quantity.')
        .test('valid-number', 'The given value is not a valid number.', (value) => {
          const bn = new BigNumber(value);
          return !bn.isNaN() && !bn.isZero() && bn.isPositive();
        })
        .test('balance-too-low', 'The balance of the fund is lower than the provided value.', function (value) {
          const holding = holdingsRef.current.find((item) => sameAddress(item.token!.address, this.parent.takerAsset))!;
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

  const takerAsset = environment.getToken(form.watch('takerAsset') ?? '');
  const makerAsset = environment.getToken(form.watch('makerAsset') ?? '');

  const takerCandidates = useMemo(() => Array.from(markets.keys()), [markets]);
  const makerCandidates = useMemo(() => {
    if (!takerAsset) {
      return [] as TokenDefinition[];
    }

    return markets.has(takerAsset) ? Array.from(markets.get(takerAsset)!.keys()) : ([] as TokenDefinition[]);
  }, [markets, takerAsset]);

  useEffect(() => {
    if (!takerAsset || !takerCandidates.includes(takerAsset)) {
      form.setValue('takerAsset', takerCandidates[0]?.address);
    }

    form.triggerValidation().catch(() => {});
  }, [takerCandidates, takerAsset]);

  useEffect(() => {
    if (!makerAsset || !makerCandidates.includes(makerAsset)) {
      form.setValue('makerAsset', makerCandidates[0]?.address);
    }

    form.triggerValidation().catch(() => {});
  }, [makerCandidates, makerAsset]);

  const takerOptions = takerCandidates.map((token) => ({
    value: token.address,
    name: token.symbol,
  }));

  const makerOptions = makerCandidates.map((token) => ({
    value: token.address,
    name: token.symbol,
  }));

  const handleTakerAssetChange = (value: string) => {
    const token = environment.getToken(value)!;
    const candidates = token && markets.has(token) ? Array.from(markets.get(token)!.keys()) : ([] as TokenDefinition[]);
    if (!makerAsset || !candidates.includes(makerAsset)) {
      form.setValue('makerAsset', candidates[0]?.address, true);
    }
  };

  const [market, side] = markets.get(takerAsset)?.get(makerAsset) ?? [];
  const amount = new BigNumber(form.watch('takerQuantity') ?? 'NaN');
  const ready = !!(form.formState.isValid && market && amount && !amount.isNaN());

  if (!takerCandidates.length) {
    return (
      <Block>
        <SectionTitle>Request a Quote on 0x</SectionTitle>
        <p>Request a quote on 0x trading is currently not possible. Please check back later.</p>
      </Block>
    );
  }

  return (
    <Block>
      <SectionTitle>Request a Quote on 0x</SectionTitle>

      <FormContext {...form}>
        <Grid>
          <GridRow>
            <GridCol>
              <SectionTitle>Choose the assets to swap</SectionTitle>
              <Dropdown
                name="takerAsset"
                label="Sell this asset"
                disabled={loading}
                options={takerOptions}
                onChange={(event) => handleTakerAssetChange(event.target.value)}
              />

              <Dropdown name="makerAsset" label="To buy this asset" disabled={loading} options={makerOptions} />
            </GridCol>
          </GridRow>

          <GridRow>
            <GridCol md={6}>
              <SectionTitle>{`Specify an amount of ${takerAsset?.symbol} to sell `}</SectionTitle>
              <Input type="number" step="any" name="takerQuantity" disabled={loading} label="Quantity" />
            </GridCol>

            <GridCol md={6}>
              <SectionTitle>Review quote</SectionTitle>
              <FundRequestForQuoteOffer
                active={ready}
                exchange={props.exchange}
                trading={props.trading}
                market={market}
                side={side}
                symbol={makerAsset?.symbol}
                amount={amount}
              />
            </GridCol>
          </GridRow>
        </Grid>
      </FormContext>
    </Block>
  );
};
