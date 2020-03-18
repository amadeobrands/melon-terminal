import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import * as Rx from 'rxjs';
import {
  TokenDefinition,
  Trading,
  ExchangeDefinition,
  UniswapTradingAdapter,
  UniswapExchange,
  UniswapFactory,
  sameAddress,
} from '@melonproject/melonjs';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useAccount } from '~/hooks/useAccount';
import { useTransaction } from '~/hooks/useTransaction';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import { toTokenBaseUnit } from '~/utils/toTokenBaseUnit';
import { Holding, Token, Policy } from '@melonproject/melongql';
import { Subtitle } from '~/storybook/components/Title/Title';
import { Button } from '~/storybook/components/Button/Button';
import { catchError, map, switchMapTo, expand } from 'rxjs/operators';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { TransactionDescription } from '~/components/Common/TransactionModal/TransactionDescription';
import { validatePolicies } from '../FundLiquidityProviderTrading/validatePolicies';

export interface FundUniswapTradingProps {
  trading: string;
  exchange: ExchangeDefinition;
  holdings: Holding[];
  denominationAsset?: Token;
  policies?: Policy[];
  maker: TokenDefinition;
  taker: TokenDefinition;
  quantity: BigNumber;
  active: boolean;
}

export const FundUniswapTrading: React.FC<FundUniswapTradingProps> = props => {
  const [state, setState] = useState(() => ({
    rate: new BigNumber('NaN'),
    maker: props.maker,
    taker: props.taker,
    quantity: props.quantity,
    state: 'loading',
  }));

  const [policyValidation, setPolicyValidation] = useState({ valid: true, message: '' });

  const environment = useEnvironment()!;
  const account = useAccount()!;

  const transaction = useTransaction(environment);

  useEffect(() => {
    setState(previous => ({
      ...previous,
      maker: props.maker,
      taker: props.taker,
      quantity: props.quantity,
      state: 'loading',
      // Reset the rate if the maker or taker have changed.
      ...(!(props.maker === state.maker && props.taker === state.taker) && { rate: new BigNumber('NaN') }),
    }));

    const fetch$ = Rx.defer(async () => {
      const weth = environment.getToken('WETH');
      const uniswapFactory = new UniswapFactory(environment, environment.deployment.uniswap.addr.UniswapFactory);
      const takerQty = toTokenBaseUnit(props.quantity, props.taker.decimals);

      if (sameAddress(props.taker.address, weth.address)) {
        // Convert WETH into token.
        const exchangeAddress = await uniswapFactory.getExchange(props.maker.address);
        const exchange = new UniswapExchange(environment, exchangeAddress);
        const makerQty = await exchange.getEthToTokenInputPrice(takerQty);
        return makerQty.dividedBy(takerQty);
      }

      if (sameAddress(props.maker.address, weth.address)) {
        // Convert token into WETH.
        const exchangeAddress = await uniswapFactory.getExchange(props.taker.address);
        const exchange = new UniswapExchange(environment, exchangeAddress);
        const makerQty = await exchange.getTokenToEthInputPrice(takerQty);
        return makerQty.dividedBy(takerQty);
      }

      // Convert token into token.
      const [sourceExchangeAddress, targetExchangeAddress] = await Promise.all([
        uniswapFactory.getExchange(props.taker.address),
        uniswapFactory.getExchange(props.maker.address),
      ]);

      const sourceExchange = new UniswapExchange(environment, sourceExchangeAddress);
      const targetExchange = new UniswapExchange(environment, targetExchangeAddress);
      const intermediateEth = await sourceExchange.getTokenToEthInputPrice(takerQty);
      const makerQty = await targetExchange.getEthToTokenInputPrice(intermediateEth);
      return makerQty.dividedBy(takerQty);
    });

    // Refetch every 5 seconds.
    const polling$ = fetch$.pipe(expand(() => Rx.timer(5000).pipe(switchMapTo(fetch$))));
    const observable$ = polling$.pipe(
      map(value => value.multipliedBy(new BigNumber(10).exponentiatedBy(props.taker.decimals - props.maker.decimals))),
      catchError(() => Rx.of(new BigNumber('NaN')))
    );

    const subscription = observable$.subscribe(rate => {
      setState(previous => ({
        ...previous,
        rate,
        state: 'idle',
      }));
    });

    return () => subscription.unsubscribe();
  }, [props.maker, props.taker, props.quantity.valueOf()]);

  const value = props.quantity.multipliedBy(state.rate);
  const valid = !value.isNaN() && !value.isZero();
  const rate = valid ? state.rate : new BigNumber('NaN');
  const loading = state.state === 'loading';
  const ready = !loading && valid;

  useEffect(() => {
    (async () =>
      await validatePolicies({
        environment,
        policies: props.policies,
        taker: props.taker,
        maker: props.maker,
        holdings: props.holdings,
        denominationAsset: props.denominationAsset,
        setPolicyValidation,
        value,
        quantity: props.quantity,
        trading: props.trading,
      }))();
  }, [state]);

  const submit = async () => {
    await validatePolicies({
      environment,
      policies: props.policies,
      taker: props.taker,
      maker: props.maker,
      holdings: props.holdings,
      denominationAsset: props.denominationAsset,
      setPolicyValidation,
      value,
      quantity: props.quantity,
      trading: props.trading,
    });
    if (!policyValidation.valid) {
      return;
    }

    const trading = new Trading(environment, props.trading);
    const adapter = await UniswapTradingAdapter.create(environment, props.exchange.exchange, trading);

    const tx = adapter.takeOrder(account.address!, {
      makerQuantity: toTokenBaseUnit(value, props.maker.decimals),
      takerQuantity: toTokenBaseUnit(props.quantity, props.taker.decimals),
      makerAsset: props.maker.address,
      takerAsset: props.taker.address,
    });

    transaction.start(tx, 'Take order');
  };

  return (
    <>
      <Subtitle>
        Uniswap (<FormattedNumber value={1} suffix={state.taker.symbol} decimals={0} /> ={' '}
        <FormattedNumber value={rate} suffix={state.maker.symbol} />)
      </Subtitle>
      <Button type="button" disabled={!ready || !props.active} loading={loading} onClick={submit}>
        {loading ? (
          ''
        ) : valid ? (
          <>
            Buy <FormattedNumber value={value} suffix={state.maker.symbol} />
          </>
        ) : (
          'No Offer'
        )}
      </Button>
      <TransactionModal transaction={transaction}>
        <TransactionDescription title="Take order on Uniswap">
          You are taking an order on Uniswap.
        </TransactionDescription>
      </TransactionModal>
    </>
  );
};
