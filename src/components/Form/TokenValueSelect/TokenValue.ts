import BigNumber from 'bignumber.js';
import { TokenDefinition } from '@melonproject/melonjs';

export class TokenValue {
  public readonly value?: BigNumber;

  constructor(public readonly token: TokenDefinition, value?: BigNumber.Value) {
    if (BigNumber.isBigNumber(value)) {
      this.value = value;
    } else if (value != null) {
      this.value = new BigNumber(value);
    }
  }

  public static fromToken(token: TokenDefinition, value: BigNumber.Value) {
    return new TokenValue(token, new BigNumber(value).dividedBy(new BigNumber(10).exponentiatedBy(token.decimals)));
  }

  public setValue(value: BigNumber.Value) {
    return new TokenValue(this.token, value);
  }

  public setToken(token: TokenDefinition) {
    return new TokenValue(token, this.value);
  }

  public toString() {
    const value = new BigNumber(this.value ?? 0);
    return `${value.toFixed(this.token.decimals)} ${this.token.symbol}`;
  }

  public toJSON() {
    return this.toString();
  }
}
