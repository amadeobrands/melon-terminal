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
      MELON_TERMINAL_MAINNET: string;
      MELON_TERMINAL_MAINNET_SUBGRAPH: string;
      MELON_TERMINAL_MAINNET_DEPLOYMENT?: string;
      MELON_TERMINAL_MAINNET_PROVIDER: string;
      MELON_TERMINAL_KOVAN: string;
      MELON_TERMINAL_KOVAN_SUBGRAPH: string;
      MELON_TERMINAL_KOVAN_DEPLOYMENT?: string;
      MELON_TERMINAL_KOVAN_PROVIDER: string;
      MELON_TERMINAL_RINKEBY: string;
      MELON_TERMINAL_RINKEBY_SUBGRAPH: string;
      MELON_TERMINAL_RINKEBY_DEPLOYMENT?: string;
      MELON_TERMINAL_RINKEBY_PROVIDER: string;
      MELON_TERMINAL_TESTNET: string;
      MELON_TERMINAL_TESTNET_SUBGRAPH: string;
      MELON_TERMINAL_TESTNET_DEPLOYMENT?: string;
      MELON_TERMINAL_TESTNET_PROVIDER: string;
      MELON_TERMINAL_INCLUDE_GRAPHIQL: string;
      MELON_TERMINAL_FORTMATIC_KEY: string;
      MELON_TERMINAL_WALLETCONNECT_INFURA_ID: string;
      MELON_TERMINAL_API_GATEWAY: string;
      MELON_TERMINAL_MAX_EXPOSURE: string;
      MELON_TERMINAL_TELEGRAM_API: string;
    }
  }
}
