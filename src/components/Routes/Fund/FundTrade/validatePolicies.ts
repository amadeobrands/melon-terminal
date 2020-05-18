import {
  AssetBlacklist,
  AssetWhitelist,
  Holding,
  MaxConcentration,
  MaxPositions,
  Policy,
  PriceTolerance,
  Token,
} from '@melonproject/melongql';
import { DeployedEnvironment, IPriceSource, sameAddress, TokenDefinition, Trading } from '@melonproject/melonjs';
import BigNumber from 'bignumber.js';
import { toTokenBaseUnit } from '../../../../utils/toTokenBaseUnit';

interface ValidatePoliciesArguments {
  environment: DeployedEnvironment;
  tradingAddress: string;
  policies: Policy[] | undefined;
  holdings: Holding[];
  taker: TokenDefinition;
  maker: TokenDefinition;
  takerAmount: BigNumber;
  makerAmount: BigNumber;
  setPolicyValidation: React.Dispatch<
    React.SetStateAction<{
      valid: boolean;
      message: string;
    }>
  >;
  denominationAsset?: Token;
}

export const validatePolicies = async (args: ValidatePoliciesArguments) => {
  const assetWhitelists = args.policies?.filter((policy) => policy.identifier === 'AssetWhitelist') as
    | AssetWhitelist[]
    | undefined;
  const assetBlacklists = args.policies?.filter((policy) => policy.identifier === 'AssetBlacklist') as
    | AssetBlacklist[]
    | undefined;

  const maxConcentrationPolicies = args.policies?.filter((policy) => policy.identifier === 'MaxConcentration') as
    | MaxConcentration[]
    | undefined;
  const maxPositionsPolicies = args.policies?.filter((policy) => policy.identifier === 'MaxPositions') as
    | MaxPositions[]
    | undefined;
  const priceTolerancePolicies = args.policies?.filter((policy) => policy.identifier === 'PriceTolerance') as
    | PriceTolerance[]
    | undefined;

  const nonZeroHoldings = args.holdings.filter((holding) => !holding.amount?.isZero());
  const gav = nonZeroHoldings?.reduce(
    (carry, item) => carry.plus(item.value || new BigNumber(0)),
    new BigNumber(0)
  ) as BigNumber;

  // Asset Whitelist
  if (!assetWhitelists?.length) {
    args.setPolicyValidation({ valid: true, message: 'mssg' });
  } else {
    const valid = assetWhitelists.every((list) =>
      list.assetWhitelist?.some((item) => sameAddress(item, args.maker.address))
    );

    if (!valid) {
      args.setPolicyValidation({
        valid: false,
        message: 'This investment would violate the asset whitelist policy',
      });
      return;
    }
  }

  // Asset Blacklist
  if (!assetBlacklists?.length) {
    args.setPolicyValidation({ valid: true, message: '' });
  } else {
    const valid = !assetBlacklists.some((list) =>
      list.assetBlacklist?.some((item) => sameAddress(item, args.maker.address))
    );

    if (!valid) {
      args.setPolicyValidation({
        valid: false,
        message: 'This investment would violate the asset blacklist policy',
      });
      return;
    }
  }

  // Max Positions Policies
  if (!maxPositionsPolicies?.length || sameAddress(args.maker.address, args.denominationAsset?.address)) {
    args.setPolicyValidation({ valid: true, message: '' });
  } else {
    const valid =
      // already existing token
      !!nonZeroHoldings?.some((holding) => sameAddress(holding.token?.address, args.maker.address)) ||
      // max positions larger than holdings (so new token would still fit)
      maxPositionsPolicies.every(
        (policy) => policy.maxPositions && nonZeroHoldings && policy.maxPositions > nonZeroHoldings?.length
      );

    if (!valid) {
      args.setPolicyValidation({
        valid: false,
        message: 'This investment would violate the maximum number of positions policy',
      });
      return;
    }
  }

  // Max Concentration Policies
  if (!maxConcentrationPolicies?.length || sameAddress(args.maker.address, args.denominationAsset?.address)) {
    args.setPolicyValidation({ valid: true, message: '' });
  } else {
    const investmentAsset = args.holdings?.find((holding) => sameAddress(holding.token?.address, args.maker.address));
    const investmentAmountInDenominationAsset = new BigNumber(args.makerAmount)
      .multipliedBy(investmentAsset?.token?.price || new BigNumber(0))
      .multipliedBy(investmentAsset?.token?.decimals || new BigNumber(18));

    const futureGav = (gav || new BigNumber(0)).plus(investmentAmountInDenominationAsset);
    const futureAssetGav = (investmentAsset?.value || new BigNumber(0)).plus(investmentAmountInDenominationAsset);
    const concentration = futureAssetGav.multipliedBy('1e18').dividedBy(futureGav);

    const valid = !!maxConcentrationPolicies?.every(
      (policy) => policy.maxConcentration && policy.maxConcentration.isGreaterThanOrEqualTo(concentration)
    );

    if (!valid) {
      args.setPolicyValidation({
        valid: false,
        message: 'This investment would violate the maximum concentration policy.',
      });
      return;
    }
  }

  // Price Tolerance Policies
  if (!priceTolerancePolicies?.length) {
    args.setPolicyValidation({ valid: true, message: '' });
  } else {
    const trading = new Trading(args.environment, args.tradingAddress);
    const priceSourceAddress = await trading.getPriceSource();
    const priceSource = new IPriceSource(args.environment, priceSourceAddress);

    const takerQuantity = toTokenBaseUnit(args.takerAmount, args.taker.decimals);
    const makerQuantity = toTokenBaseUnit(args.makerAmount, args.maker.decimals);

    const [referencePrice, orderPrice] = await Promise.all([
      priceSource.getReferencePriceInfo(args.taker.address, args.maker.address),
      priceSource.getOrderPriceInfo(args.taker.address, takerQuantity, makerQuantity),
    ]);

    const valid = priceTolerancePolicies?.every(
      (policy) =>
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
