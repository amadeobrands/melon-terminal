import React, { useEffect, useRef } from 'react';
import * as Yup from 'yup';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useTransaction } from '~/hooks/useTransaction';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import {
  TokenDefinition,
  ExchangeDefinition,
  Trading,
  ExchangeIdentifier,
  OasisDexTradingAdapter,
  OasisDexExchange,
  toBigNumber,
  ZeroExV3TradingAdapter,
  sameAddress,
  IPriceSource,
} from '@melonproject/melonjs';
import { Dropdown } from '~/storybook/Dropdown/Dropdown';
import { Button } from '~/storybook/Button/Button';
import { Input } from '~/storybook/Input/Input';
import { OrderbookItem } from '../FundOrderbook/utils/aggregatedOrderbook';
import { useAccount } from '~/hooks/useAccount';
import { OasisDexOrderbookItem } from '../FundOrderbook/utils/matchingMarketOrderbook';
import { useForm, FormContext } from 'react-hook-form';
import { BlockActions } from '~/storybook/Block/Block';
import { toTokenBaseUnit } from '~/utils/toTokenBaseUnit';
import { NotificationBar, NotificationContent } from '~/storybook/NotificationBar/NotificationBar';
import {
  Holding,
  Policy,
  MaxPositions,
  MaxConcentration,
  PriceTolerance,
  Token,
  AssetWhitelist,
  AssetBlacklist,
} from '@melonproject/melongql';
import BigNumber from 'bignumber.js';
import { fromTokenBaseUnit } from '~/utils/fromTokenBaseUnit';
import { SignedOrder } from '@0x/order-utils';
import { TransactionDescription } from '~/components/Common/TransactionModal/TransactionDescription';

export interface FundOrderbookMarketFormProps {
  trading: string;
  denominationAsset?: Token;
  asset: TokenDefinition;
  exchanges: ExchangeDefinition[];
  holdings: Holding[];
  policies?: Policy[];
  order?: OrderbookItem;
  unsetOrder: () => void;
}

interface FundOrderbookMarketFormValues {
  quantity: string;
  price: string;
  total: string;
}

export const FundOrderbookMarketForm: React.FC<FundOrderbookMarketFormProps> = props => {
  const environment = useEnvironment()!;
  const account = useAccount()!;
  const transaction = useTransaction(environment, {
    onAcknowledge: () => props.unsetOrder(),
  });

  const assetWhitelists = props.policies?.filter(policy => policy.identifier === 'AssetWhitelist') as
    | AssetWhitelist[]
    | undefined;
  const assetBlacklists = props.policies?.filter(policy => policy.identifier === 'AssetBlacklist') as
    | AssetBlacklist[]
    | undefined;
  const maxPositionsPolicies = props.policies?.filter(policy => policy.identifier === 'MaxPositions') as
    | MaxPositions[]
    | undefined;
  const maxConcentrationPolicies = props.policies?.filter(policy => policy.identifier === 'MaxConcentration') as
    | MaxConcentration[]
    | undefined;
  const priceTolerancePolicies = props.policies?.filter(policy => policy.identifier === 'PriceTolerance') as
    | PriceTolerance[]
    | undefined;

  const nonZeroHoldings = props.holdings.filter(holding => !holding.amount?.isZero());

  const gav = nonZeroHoldings?.reduce(
    (carry, item) => carry.plus(item.value || new BigNumber(0)),
    new BigNumber(0)
  ) as BigNumber;

  const exchanges = props.exchanges.map(item => ({
    value: item.id,
    name: item.name,
  }));

  const exchange = (props.exchanges.find(item => item.id === props.order?.exchange) ?? props.exchanges[0]).id;
  const direction = props.order?.side === 'bid' ? 'sell' : 'buy';
  const directions = [
    {
      value: 'buy',
      name: 'Buy',
    },
    {
      value: 'sell',
      name: 'Sell',
    },
  ];

  const quote = environment.getToken('WETH');
  const base = props.asset;
  const order = props.order;
  const holdings = props.holdings;
  const price = props.order?.price.decimalPlaces(18) ?? new BigNumber('NaN');

  // TODO: These refs are used for validation. Fix this after https://github.com/react-hook-form/react-hook-form/pull/817
  const orderRef = useRef(order);
  const holdingsRef = useRef(holdings);
  const baseRef = useRef(base);

  useEffect(() => {
    holdingsRef.current = holdings;
    orderRef.current = order;
    baseRef.current = base;

    form.triggerValidation().catch(() => {});
  }, [holdings, order, base]);

  const form = useForm<FundOrderbookMarketFormValues>({
    mode: 'onChange',
    defaultValues: {
      quantity: '',
      price: '',
      total: '',
    },
    validationSchema: Yup.object().shape({
      direction: Yup.string()
        .test(
          'maxPositions',
          'Investing with this asset would violate the maximum number of positions policy',
          value => {
            const newAsset = value === 'buy' ? base.address : quote.address;
            return (
              // no policies
              !maxPositionsPolicies?.length ||
              // new investment is in denomination asset
              sameAddress(props.denominationAsset?.address, value) ||
              // already existing token
              !!nonZeroHoldings?.some(holding => sameAddress(holding.token?.address, newAsset)) ||
              // max positions larger than holdings (so new token would still fit in)
              maxPositionsPolicies.every(
                policy => policy.maxPositions && nonZeroHoldings && policy.maxPositions > nonZeroHoldings?.length
              )
            );
          }
        )
        .test('assetWhitelist', 'You cannot invest with this asset because it is not on the asset whitelist', value => {
          const newAsset = value === 'buy' ? base.address : quote.address;
          return (
            // no policies
            !assetWhitelists?.length ||
            // asset is on whitelist
            assetWhitelists.every(list => list.assetWhitelist?.some(item => sameAddress(item, newAsset)))
          );
        })
        .test('assetBlacklist', 'You cannot invest with this asset because it is on the asset blacklist', value => {
          const newAsset = value === 'buy' ? base.address : quote.address;
          return (
            // no policies
            !assetBlacklists?.length ||
            // asset is on whitelist
            !assetBlacklists.some(list => list.assetBlacklist?.some(item => sameAddress(item, newAsset)))
          );
        }),
      price: Yup.string().test(
        'priceTolerance',
        'This price is outside the price tolerance set by the price tolerance policy',
        async function() {
          if (!order) {
            return true;
          }

          const exchange = environment.getExchange(order.exchange);

          if (!priceTolerancePolicies?.length) {
            return true;
          }

          const trading = new Trading(environment, props.trading);
          const priceSourceAddress = await trading.getPriceSource();
          const priceSource = new IPriceSource(environment, priceSourceAddress);

          const taker = order!.side === 'bid' ? base : quote;
          const maker = order!.side === 'bid' ? quote : base;

          const takerQuantity =
            order!.side === 'bid'
              ? toTokenBaseUnit(this.parent.quantity, taker.decimals)
              : toTokenBaseUnit(this.parent.total, maker.decimals);

          let makerQuantity = new BigNumber(0);

          if (exchange.id === ExchangeIdentifier.OasisDex) {
            const market = new OasisDexExchange(environment, exchange.exchange);
            const offer = await market.getOffer((order as OasisDexOrderbookItem).order.id);
            makerQuantity = takerQuantity.multipliedBy(offer.makerQuantity).dividedBy(offer.takerQuantity);
          } else if (exchange.id === ExchangeIdentifier.ZeroExV3) {
            const offer = order?.order.order as SignedOrder;
            makerQuantity = takerQuantity.multipliedBy(offer.makerAssetAmount).dividedBy(offer.takerAssetAmount);
          }

          const [referencePrice, orderPrice] = await Promise.all([
            priceSource.getReferencePriceInfo(taker.address, maker.address),
            priceSource.getOrderPriceInfo(taker.address, takerQuantity, makerQuantity),
          ]);

          return priceTolerancePolicies?.every(
            policy =>
              policy.priceTolerance &&
              orderPrice.isGreaterThan(
                referencePrice.price.minus(policy.priceTolerance.multipliedBy(referencePrice.price).dividedBy('1e18'))
              )
          );
        }
      ),
      quantity: Yup.string()
        .required('Missing quantity.')
        .test('valid-number', 'The given value is not a valid number.', value => {
          const bn = new BigNumber(value);
          return !bn.isNaN() && !bn.isZero() && bn.isPositive();
        })
        .test('max-quantity', 'Maximum quantity exceeded.', value => {
          const quantity = orderRef.current?.quantity;
          return new BigNumber(value).isLessThanOrEqualTo(quantity ?? new BigNumber(0));
        })
        .test('balance-exceeded', 'Available balance exceeded.', value => {
          const order = orderRef.current;
          if (order?.side === 'bid') {
            const holdings = holdingsRef.current;
            const asset = baseRef.current;
            const holding = holdings.find(holding => holding.token?.symbol === asset.symbol);
            const available = fromTokenBaseUnit(holding?.amount ?? new BigNumber(0), holding?.token?.decimals ?? 18);
            return new BigNumber(value).isLessThanOrEqualTo(available);
          }

          return true;
        })
        .test('maxConcentration', 'This investment amount would violate the maximum concentration policy', function(
          value
        ) {
          if (order?.side === 'bid') {
            return true;
          }

          if (
            !maxConcentrationPolicies?.length ||
            sameAddress(this.parent.investmentAsset, props.denominationAsset?.address)
          ) {
            return true;
          }

          const holdings = holdingsRef.current;
          const asset = baseRef.current;

          const investmentAsset = holdings?.find(holding => sameAddress(holding.token?.address, asset.address));
          const investmentAmountInDenominationAsset = new BigNumber(value)
            .multipliedBy(investmentAsset?.token?.price || new BigNumber(0))
            .multipliedBy('1e18');

          const futureGav = (gav || new BigNumber(0)).plus(investmentAmountInDenominationAsset);
          const futureAssetGav = (investmentAsset?.value || new BigNumber(0)).plus(investmentAmountInDenominationAsset);
          const concentration = futureAssetGav.multipliedBy('1e18').dividedBy(futureGav);

          return !!maxConcentrationPolicies?.every(
            policy => policy.maxConcentration && policy.maxConcentration.isGreaterThanOrEqualTo(concentration)
          );
        }),
      total: Yup.string()
        .required('Missing total.')
        .test('max-total', 'Maximum total exceeded.', value => {
          const total = orderRef.current?.quantity.multipliedBy(orderRef.current!.price);
          return new BigNumber(value).isLessThanOrEqualTo(total ?? new BigNumber(0));
        })
        .test('balance-exceeded', 'Available balance exceeded.', value => {
          const order = orderRef.current;
          if (order?.side === 'ask') {
            const holdings = holdingsRef.current;
            const holding = holdings.find(holding => holding.token?.symbol === quote.symbol);
            const available = fromTokenBaseUnit(holding?.amount ?? new BigNumber(0), holding?.token?.decimals ?? 18);
            return new BigNumber(value).isLessThanOrEqualTo(available);
          }

          return true;
        }),
    }),
  });

  useEffect(() => {
    const quantity = order?.quantity ?? new BigNumber('NaN');
    const total = quantity.multipliedBy(price);

    form.setValue('quantity', !quantity.isNaN() ? quantity.decimalPlaces(base.decimals).toFixed(base.decimals) : '');
    form.setValue('price', !price.isNaN() ? price.decimalPlaces(base.decimals).toFixed(base.decimals) : '');
    form.setValue('total', !total.isNaN() ? total.decimalPlaces(18).toFixed(18) : '');
    form.triggerValidation().catch(() => {});
  }, [order]);

  const submit = form.handleSubmit(async values => {
    const trading = new Trading(environment, props.trading);
    const exchange = environment.getExchange(order!.exchange);

    const taker = order!.side === 'bid' ? base : quote;
    const maker = order!.side === 'bid' ? quote : base;
    const quantity =
      order!.side === 'bid'
        ? toTokenBaseUnit(values.quantity, taker.decimals)
        : toTokenBaseUnit(values.total, maker.decimals);

    if (exchange.id === ExchangeIdentifier.OasisDex) {
      const market = new OasisDexExchange(environment, exchange.exchange);
      const adapter = await OasisDexTradingAdapter.create(environment, exchange.adapter, trading);
      const offer = await market.getOffer((order as OasisDexOrderbookItem).order.id);
      const tx = adapter.takeOrder(account.address!, order!.order.id, offer, quantity);
      return transaction.start(tx, 'Take order on OasisDEX');
    }

    if (order!.exchange === ExchangeIdentifier.ZeroExV3) {
      const adapter = await ZeroExV3TradingAdapter.create(environment, exchange.adapter, trading);
      const offer = order?.order.order as SignedOrder;
      const tx = adapter.takeOrder(account.address!, offer, quantity);
      return transaction.start(tx, 'Take order on 0x');
    }
  });

  const quantity = toBigNumber(form.watch('quantity'));
  const total = toBigNumber(form.watch('total'));

  const changeQuantity = async (change: BigNumber.Value) => {
    const quantity = toBigNumber(change).decimalPlaces(quote.decimals);
    const total = quantity.multipliedBy(price).decimalPlaces(base.decimals);

    form.setValue('total', !total.isNaN() ? total.toString() : '', true);
    form.triggerValidation().catch(() => {});
  };

  const changeTotal = async (change: BigNumber.Value) => {
    const total = toBigNumber(change).decimalPlaces(base.decimals);
    const quantity = total.dividedBy(price).decimalPlaces(quote.decimals);

    form.setValue('quantity', !quantity.isNaN() ? quantity.toString() : '', true);
    form.triggerValidation().catch(() => {});
  };

  const ready = form.formState.isValid;
  const description =
    ready &&
    `Market order: ${direction === 'buy' ? 'Buy' : 'Sell'} ${quantity.decimalPlaces(4).toString()} ${
      base.symbol
    } at a price of ${price.decimalPlaces(4).toString()} ${quote.symbol} per ${
      base.symbol
    } for a total of ${total.decimalPlaces(4).toString()} ${quote.symbol}`;

  return (
    <FormContext {...form}>
      {order && (
        <form onSubmit={submit}>
          <Dropdown name="direction" label="Buy or sell" options={directions} disabled={true} value={direction} />
          <Dropdown name="exchange" label="Exchange" options={exchanges} disabled={true} value={exchange} />

          <Input
            type="text"
            name="quantity"
            label={`Quantity (${base.symbol})`}
            onChange={event => changeQuantity(event.target.value)}
          />

          <Input
            type="text"
            name="price"
            label={`Price (${quote.symbol} per ${base.symbol})`}
            disabled={true}
            value={price.toString()}
          />

          <Input
            type="text"
            name="total"
            label={`Total (${quote.symbol})`}
            onChange={event => changeTotal(event.target.value)}
          />

          {description && (
            <NotificationBar kind="neutral">
              <NotificationContent>{description}</NotificationContent>
            </NotificationBar>
          )}

          <BlockActions>
            <Button type="button" length="stretch" disabled={!ready} onClick={submit}>
              Submit
            </Button>
          </BlockActions>
        </form>
      )}

      {!order && (
        <NotificationBar kind="neutral">
          <NotificationContent>Please choose an offer from the order book.</NotificationContent>
        </NotificationBar>
      )}

      <TransactionModal transaction={transaction}>
        {transaction.state.name === 'Take order on OasisDEX' && (
          <TransactionDescription title="Take order on OasisDEX">{description}</TransactionDescription>
        )}
        {transaction.state.name === 'Take order on 0x' && (
          <TransactionDescription title="Take order on 0x">{description}</TransactionDescription>
        )}
      </TransactionModal>
    </FormContext>
  );
};
