/// <reference types="react-scripts" />

import 'styled-components';
import { Theme } from '~/theme';
import { Deployment, NetworkEnum } from './types';

declare module 'console' {
  export = typeof import('console');
}

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

declare global {
  declare namespace NodeJS {
    export interface ProcessEnv {
      MELON_MAINNET: string;
      MELON_MAINNET_SUBGRAPH: string;
      MELON_MAINNET_DEPLOYMENT?: string;
      MELON_MAINNET_PROVIDER: string;
      MELON_KOVAN: string;
      MELON_KOVAN_SUBGRAPH: string;
      MELON_KOVAN_DEPLOYMENT?: string;
      MELON_KOVAN_PROVIDER: string;
      MELON_RINKEBY: string;
      MELON_RINKEBY_SUBGRAPH: string;
      MELON_RINKEBY_DEPLOYMENT?: string;
      MELON_RINKEBY_PROVIDER: string;
      MELON_TESTNET: string;
      MELON_TESTNET_SUBGRAPH: string;
      MELON_TESTNET_DEPLOYMENT?: string;
      MELON_TESTNET_PROVIDER: string;
      MELON_INCLUDE_GRAPHIQL: string;
      MELON_FORTMATIC_KEY: string;
      MELON_API_GATEWAY: string;
      MELON_MAX_EXPOSURE: string;
      MELON_TELEGRAM_API: string;
    }
  }
}
