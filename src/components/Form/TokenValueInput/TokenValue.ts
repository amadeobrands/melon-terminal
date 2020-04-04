import BigNumber from 'bignumber.js';
import { TokenDefinition } from '@melonproject/melonjs';

export const tokens = [
  {
    address: '0x0000000000000000000000000000000000000001',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
  },
  {
    address: '0x0000000000000000000000000000000000000002',
    symbol: 'MLN',
    name: 'Melon',
    decimals: 18,
  },
  {
    address: '0x0000000000000000000000000000000000000003',
    symbol: 'SAI',
    name: 'Sai',
    decimals: 9,
  },
] as TokenDefinition[];

export class TokenValue {
  public readonly value?: BigNumber;

  constructor(public readonly token: TokenDefinition, value?: BigNumber.Value) {
    if (BigNumber.isBigNumber(value)) {
      this.value = value;
    } else if (value != null) {
      this.value = new BigNumber(value);
    }
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
