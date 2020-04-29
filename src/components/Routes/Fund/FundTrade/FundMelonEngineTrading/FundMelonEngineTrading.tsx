import React, { useState, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { ExchangeDefinition, MelonEngineTradingAdapter, TokenDefinition, Trading } from '@melonproject/melonjs';
import { useEnvironment } from '~/hooks/useEnvironment';
import { Button } from '~/storybook/Button/Button';
import { useTransaction } from '~/hooks/useTransaction';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import { useMelonEngineTradingQuery } from './FundMelonEngineTrading.query';
import { Holding, Token, Policy, MaxConcentration, PriceTolerance } from '@melonproject/melongql';
import { toTokenBaseUnit } from '~/utils/toTokenBaseUnit';
import { useAccount } from '~/hooks/useAccount';
import { Subtitle } from '~/storybook/Title/Title';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { TransactionDescription } from '~/components/Common/TransactionModal/TransactionDescription';
import { InputError } from '~/storybook/Input/Input.styles';
import { validatePolicies } from '../FundLiquidityProviderTrading/validatePolicies';

export interface FundMelonEngineTradingProps {
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

export const FundMelonEngineTrading: React.FC<FundMelonEngineTradingProps> = (props) => {
  const [price, liquid, query] = useMelonEngineTradingQuery();
  const environment = useEnvironment()!;
  const account = useAccount()!;
  const transaction = useTransaction(environment);

  const [policyValidation, setPolicyValidation] = useState({ valid: true, message: '' });

  const loading = query.loading;
  const value = props.quantity.multipliedBy(price ?? new BigNumber('NaN'));
  const valid = !value.isNaN() && !value.isZero() && value.isLessThanOrEqualTo(liquid);
  const rate = valid ? price : new BigNumber('NaN');
  const ready = !loading && valid;

  useEffect(() => {
    if (rate.isNaN()) {
      return;
    }
    (async () =>
      await validatePolicies({
        environment,
        setPolicyValidation,
        value,
        policies: props.policies,
        taker: props.taker,
        maker: props.maker,
        holdings: props.holdings,
        denominationAsset: props.denominationAsset,
        quantity: props.quantity,
        trading: props.trading,
      }))();
  }, [props.quantity]);

  const submit = async () => {
    await validatePolicies({
      environment,
      setPolicyValidation,
      value,
      policies: props.policies,
      taker: props.taker,
      maker: props.maker,
      holdings: props.holdings,
      denominationAsset: props.denominationAsset,
      quantity: props.quantity,
      trading: props.trading,
    });
    if (!policyValidation.valid) {
      return;
    }

    const trading = new Trading(environment, props.trading);
    const adapter = await MelonEngineTradingAdapter.create(environment, props.exchange.adapter, trading);
    const tx = adapter.takeOrder(account.address!, {
      makerAsset: props.maker.address,
      takerAsset: props.taker.address,
      makerQuantity: toTokenBaseUnit(value, props.maker.decimals),
      takerQuantity: toTokenBaseUnit(props.quantity, props.taker.decimals),
    });

    transaction.start(tx, 'Take order on the Melon engine');
  };

  return (
    <>
      <Subtitle>
        Melon Engine (<FormattedNumber value={1} suffix={props.taker.symbol} decimals={0} /> ={' '}
        <FormattedNumber value={rate} suffix={props.maker.symbol} />)
      </Subtitle>
      <Button type="button" disabled={!ready || !props.active} loading={loading} onClick={submit}>
        {loading ? (
          ''
        ) : valid ? (
          <>
            Buy <FormattedNumber value={value} suffix={props.maker.symbol} />
          </>
        ) : (
          'No Offer'
        )}
      </Button>

      {policyValidation.valid || <InputError>{policyValidation.message}</InputError>}

      <TransactionModal transaction={transaction}>
        <TransactionDescription title="Take order on the Melon engine">
          You are selling{' '}
          <FormattedNumber
            value={props.quantity}
            suffix={props.taker.symbol}
            decimals={4}
            tooltip={true}
            tooltipDecimals={props.taker.decimals}
          />{' '}
          to the Melon Engine, in exchange for{' '}
          <FormattedNumber
            value={value}
            suffix={props.maker.symbol}
            decimals={4}
            tooltip={true}
            tooltipDecimals={props.maker.decimals}
          />
        </TransactionDescription>
      </TransactionModal>
    </>
  );
};
