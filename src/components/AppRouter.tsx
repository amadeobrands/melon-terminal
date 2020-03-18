import React, { Suspense } from 'react';
import ErrorBoundary from 'react-error-boundary';
import { Route, Switch, Redirect, useRouteMatch } from 'react-router-dom';
import { OnChainApollo, TheGraphApollo } from './Contexts/Apollo/Apollo';
import { RequiresAccount } from './Gates/RequiresAccount/RequiresAccount';
import { RequiresConnection } from './Gates/RequiresConnection/RequiresConnection';
import { Spinner } from '../storybook/components/Spinner/Spinner';
import { ErrorFallback } from './Common/ErrorFallback/ErrorFallback';
import { Layout } from './Layout/Layout';

const graphiql = JSON.parse(process.env.MELON_INCLUDE_GRAPHIQL || 'false');

const Home = React.lazy(() => import('./Routes/Home/Home'));
const Wallet = React.lazy(() => import('./Routes/Wallet/Wallet'));
const Fund = React.lazy(() => import('./Routes/Fund/Fund'));
const Playground = React.lazy(() => import('./Routes/Playground/Playground'));
const NoMatch = React.lazy(() => import('./Routes/NoMatch/NoMatch'));

export interface AppRouterProps {
  connectionSwitch: boolean;
}

const RedirectLegacyFundRoute = () => {
  const match = useRouteMatch<{
    address: string;
  }>();

  return <Redirect to={`/mainnet/fund/${match.params.address}`} />;
};

export const AppRouter: React.FC<AppRouterProps> = props => {
  return (
    <Layout connectionSwitch={props.connectionSwitch}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<Spinner size="large" positioning="overlay" />}>
          <Switch>
            <Route path="/" exact={true}>
              <RequiresConnection>
                <Home />
              </RequiresConnection>
            </Route>
            <Route path="/wallet">
              <RequiresAccount>
                <Wallet />
              </RequiresAccount>
            </Route>

            <Route path={`/fund/:address`}>
              <RedirectLegacyFundRoute />
            </Route>

            <Route path={`/:network(mainnet|kovan|rinkeby|testnet)/fund/:address`}>
              <RequiresConnection>
                <Fund />
              </RequiresConnection>
            </Route>

            {graphiql && (
              <Route path="/playground/onchain" exact={true}>
                <RequiresConnection>
                  <Playground context={OnChainApollo} bucket="onchain" />
                </RequiresConnection>
              </Route>
            )}

            {graphiql && (
              <Route path="/playground/thegraph" exact={true}>
                <RequiresConnection>
                  <Playground context={TheGraphApollo} bucket="thegraph" />
                </RequiresConnection>
              </Route>
            )}

            <Route>
              <NoMatch />
            </Route>
          </Switch>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
};
