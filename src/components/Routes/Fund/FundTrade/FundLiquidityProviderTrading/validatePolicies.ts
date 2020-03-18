import { sameAddress, TokenDefinition, Trading, IPriceSource, DeployedEnvironment } from '@melonproject/melonjs';
import { MaxConcentration, Token, Holding, PriceTolerance, Policy } from '@melonproject/melongql';
import { toTokenBaseUnit } from '../../../../../utils/toTokenBaseUnit';
import BigNumber from 'bignumber.js';

interface ValidatePoliciesArguments {
  environment: DeployedEnvironment;
  policies: Policy[] | undefined;
  taker: TokenDefinition;
  maker: TokenDefinition;
  holdings: Holding[];
  denominationAsset?: Token;
  setPolicyValidation: React.Dispatch<
    React.SetStateAction<{
      valid: boolean;
      message: string;
    }>
  >;
  value: BigNumber;
  quantity: BigNumber;
  trading: string;
}

export const validatePolicies = async (args: ValidatePoliciesArguments) => {
  const maxConcentrationPolicies = args.policies?.filter(policy => policy.identifier === 'MaxConcentration') as
    | MaxConcentration[]
    | undefined;
  const priceTolerancePolicies = args.policies?.filter(policy => policy.identifier === 'PriceTolerance') as
    | PriceTolerance[]
    | undefined;

  const nonZeroHoldings = args.holdings.filter(holding => !holding.amount?.isZero());
  const gav = nonZeroHoldings?.reduce(
    (carry, item) => carry.plus(item.value || new BigNumber(0)),
    new BigNumber(0)
  ) as BigNumber;

  if (!maxConcentrationPolicies?.length || sameAddress(args.taker.address, args.denominationAsset?.address)) {
    args.setPolicyValidation({ valid: true, message: '' });
  } else {
    const investmentAsset = args.holdings?.find(holding => sameAddress(holding.token?.address, args.maker.address));
    const investmentAmountInDenominationAsset = new BigNumber(args.value)
      .multipliedBy(investmentAsset?.token?.price || new BigNumber(0))
      .multipliedBy(investmentAsset?.token?.decimals || new BigNumber(18));

    const futureGav = (gav || new BigNumber(0)).plus(investmentAmountInDenominationAsset);
    const futureAssetGav = (investmentAsset?.value || new BigNumber(0)).plus(investmentAmountInDenominationAsset);
    const concentration = futureAssetGav.multipliedBy('1e18').dividedBy(futureGav);

    const valid = !!maxConcentrationPolicies?.every(
      policy => policy.maxConcentration && policy.maxConcentration.isGreaterThanOrEqualTo(concentration)
    );

    if (!valid) {
      args.setPolicyValidation({
        valid: false,
        message: 'This investment would violate the maximum concentration policy.',
      });
      return;
    }
  }

  if (!priceTolerancePolicies?.length) {
    args.setPolicyValidation({ valid: true, message: '' });
  } else {
    const trading = new Trading(args.environment, args.trading);
    const priceSourceAddress = await trading.getPriceSource();
    const priceSource = new IPriceSource(args.environment, priceSourceAddress);

    const takerQuantity = toTokenBaseUnit(args.quantity, args.taker.decimals);
    const makerQuantity = toTokenBaseUnit(args.value, args.maker.decimals);

    const [referencePrice, orderPrice] = await Promise.all([
      priceSource.getReferencePriceInfo(args.taker.address, args.maker.address),
      priceSource.getOrderPriceInfo(args.taker.address, takerQuantity, makerQuantity),
    ]);

    const valid = priceTolerancePolicies?.every(
      policy =>
        policy.priceTolerance &&
        orderPrice.isGreaterThan(
          referencePrice.price.minus(policy.priceTolerance.multipliedBy(referencePrice.price).dividedBy('1e18'))
        )
    );

    if (!valid) {
      args.setPolicyValidation({
        valid: false,
        message: 'This investment would violate the price tolerance policy.',
      });
    }
  }
};
