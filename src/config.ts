import { NetworkEnum } from './types';
import { DeploymentOutput, TokenDefinition, ExchangeDefinition, PolicyDefinition } from '@melonproject/melonjs';

export interface Config {
  supported: boolean;
  label: string;
  name: string;
  subgraph: string;
  provider: string;
  deployment: () => Promise<DeploymentOutput>;
  tokens?: TokenDefinition[];
  exchanges?: ExchangeDefinition[];
  policies?: PolicyDefinition[];
}

export type ConfigMap = {
  [index in NetworkEnum]?: Config;
};

export function getConfig(network?: NetworkEnum) {
  const current = (network && config[network]) || undefined;
  if (current && current.supported) {
    return current;
  }

  return undefined;
}

export function getNetworkLabel(network?: NetworkEnum) {
  const current = (network && config[network]) || undefined;
  return current?.label ?? undefined;
}

export function getNetworkName(network?: NetworkEnum) {
  const current = (network && config[network]) || undefined;
  return current?.name ?? undefined;
}

async function loadDeployment(fallback: () => Promise<any>, source?: string) {
  if (source && (source.startsWith('https://') || source.startsWith('http://'))) {
    return (await fetch(source)).json();
  }

  if (source) {
    return JSON.parse(source);
  }

  return fallback();
}

export const config: ConfigMap = {
  [NetworkEnum.MAINNET]: {
    label: 'Mainnet',
    name: 'mainnet',
    supported: !!JSON.parse(process.env.MELON_MAINNET),
    subgraph: process.env.MELON_MAINNET_SUBGRAPH,
    provider: process.env.MELON_MAINNET_PROVIDER,
    deployment: async () => {
      // @ts-ignore
      return loadDeployment(() => import('deployments/mainnet-deployment'), process.env.MELON_MAINNET_DEPLOYMENT);
    },
    tokens: [
      {
        symbol: 'DGX',
        address: '0x4f3afec4e5a3f2a6a1a411def7d7dfe50ee057bf',
        decimals: 9,
        name: 'Digix Gold Token',
        historic: true,
      },
      {
        symbol: 'ENG',
        address: '0xf0ee6b27b759c9893ce4f094b49ad28fd15a23e4',
        name: 'Enigma',
        decimals: 8,
        historic: true,
      },
      {
        symbol: 'OMG',
        address: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
        name: 'OmiseGo',
        decimals: 18,
        historic: true,
      },
      {
        symbol: 'USDT',
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        name: 'Tether USD',
        decimals: 6,
        historic: true,
      },
    ],
    exchanges: [
      {
        name: 'ZeroEx (v. 2.0)',
        id: 'ZeroExV2Old',
        adapter: '0x3ECFe6F8414ED517366a5e6f7F7FC74EF21CAac9',
        exchange: '0x4F833a24e1f95D70F028921e27040Ca56E09AB0b',
        historic: true,
      },
      {
        name: 'MelonEngine',
        id: 'MelonEngineV1',
        adapter: '0xF31D358eFD7B80A6733BCb850bd49BFCBEC1428A',
        exchange: '0x7CaEc96607c5c7190d63B5A650E7CE34472352f5',
        historic: true,
      },
      {
        name: 'OasisDEX',
        id: 'OasisDexOld',
        adapter: '0x1Eb5F58058686FDE3322CD22bed96BA36d7f7f63',
        exchange: '0x39755357759cE0d7f32dC8dC45414CCa409AE24e',
        historic: true,
      },
      // {
      //   name: 'Uniswap',
      //   id: 'UniswapOld',
      //   adapter: '0x3FDA51D218919B96a850E7b66D412A4604E4901D',
      //   exchange: '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95',
      //   historic: true,
      // },
    ],
  },
  [NetworkEnum.KOVAN]: {
    label: 'Kovan',
    name: 'kovan',
    supported: !!JSON.parse(process.env.MELON_KOVAN),
    subgraph: process.env.MELON_KOVAN_SUBGRAPH,
    provider: process.env.MELON_KOVAN_PROVIDER,
    deployment: async () => {
      // @ts-ignore
      return loadDeployment(() => import('deployments/kovan-deployment'), process.env.MELON_KOVAN_DEPLOYMENT);
    },
  },
  [NetworkEnum.RINKEBY]: {
    label: 'Rinkeby',
    name: 'rinkeby',
    supported: !!JSON.parse(process.env.MELON_RINKEBY),
    subgraph: process.env.MELON_RINKEBY_SUBGRAPH,
    provider: process.env.MELON_RINKEBY_PROVIDER,
    deployment: async () => {
      // @ts-ignore
      return loadDeployment(() => import('deployments/rinkeby-deployment'), process.env.MELON_RINKEBY_DEPLOYMENT);
    },
  },
  [NetworkEnum.TESTNET]: {
    label: 'Testnet',
    name: 'testnet',
    supported: !!JSON.parse(process.env.MELON_TESTNET),
    subgraph: process.env.MELON_TESTNET_SUBGRAPH,
    provider: process.env.MELON_TESTNET_PROVIDER,
    deployment: async () => {
      // @ts-ignore
      return loadDeployment(() => import('deployments/testnet-deployment'), process.env.MELON_TESTNET_DEPLOYMENT);
    },
  },
};
