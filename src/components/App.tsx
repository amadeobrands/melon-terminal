import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ModalProvider } from 'styled-react-modal';
import { Theme as ThemeProvider, ModalBackground } from './App.styles';
import { ApolloProvider } from './Contexts/Apollo/Apollo';
import { ConnectionProvider } from './Contexts/Connection/Connection';
import { AccountProvider } from './Contexts/Account/Account';
import { DarkModeProvider } from './Contexts/DarkMode/DarkMode';

// NOTE: Imported using root relative import to allow overrides with webpack.
import { AppRouter } from '~/components/AppRouter';

// TODO: Consider excluding ganache in production builds entirely.
import { method as metamask } from './Layout/ConnectionSelector/MetaMask/MetaMask';
import { method as dapper } from './Layout/ConnectionSelector/Dapper/Dapper';
import { method as coinbase } from './Layout/ConnectionSelector/Coinbase/Coinbase';
import { method as frame } from './Layout/ConnectionSelector/Frame/Frame';
import { method as ganache } from './Layout/ConnectionSelector/Ganache/Ganache';
import { method as fortmatic } from './Layout/ConnectionSelector/Fortmatic/Fortmatic';
import { method as walletconnect } from './Layout/ConnectionSelector/WalletConnect/WalletConnect';
import { method as anonymous } from './Layout/ConnectionSelector/Anonymous/Anonymous';

const common = [metamask, dapper, coinbase, frame, fortmatic, walletconnect];
let start = anonymous;
let methods = process.env.MELON_TESTNET ? [ganache, ...common] : common;
let switchable = true;

if (coinbase.supported()) {
  start = coinbase;
  methods = [coinbase];
  switchable = false;
}

const AppComponent = () => (
  <DarkModeProvider>
    <ThemeProvider>
      <ModalProvider backgroundComponent={ModalBackground}>
        <ConnectionProvider methods={methods} default={start} disconnect={anonymous}>
          <ApolloProvider>
            <AccountProvider>
              <Router>
                <AppRouter connectionSwitch={switchable} />
              </Router>
            </AccountProvider>
          </ApolloProvider>
        </ConnectionProvider>
      </ModalProvider>
    </ThemeProvider>
  </DarkModeProvider>
);

export const App = AppComponent;
