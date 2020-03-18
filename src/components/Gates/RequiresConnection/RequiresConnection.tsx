import React from 'react';
import { Fallback } from '~/components/Common/Fallback/Fallback';
import { useConnectionState } from '~/hooks/useConnectionState';
import { ConnectionStatus } from '~/components/Contexts/Connection/Connection';
import { Spinner } from '~/storybook/components/Spinner/Spinner';
import { NetworkEnum } from '~/types';
import { Container } from '~/storybook/components/Container/Container';
import { useRouteMatch } from 'react-router';
import { networkFromName } from '~/utils/networkFromName';
import { getNetworkLabel } from '~/config';

export interface RequiresConnectionProps {
  fallback?: React.ReactNode;
}

interface NetworkedRouteParams {
  network?: string;
}

export const RequiresConnection: React.FC<RequiresConnectionProps> = ({ children, fallback = true }) => {
  const connection = useConnectionState();
  const match = useRouteMatch<NetworkedRouteParams>()!;

  if (connection.status === ConnectionStatus.CONNECTED && connection.network) {
    const restricted = match.params.network && networkFromName(match.params.network);
    if (!restricted || connection.network === restricted) {
      return <>{children}</>;
    }

    const current = getNetworkLabel(connection.network);
    const requested = getNetworkLabel(restricted);

    const output =
      fallback === true ? (
        <Container>
          <Fallback>
            You are currently connected to {current} but the page you are trying to load is on {requested}.
          </Fallback>
        </Container>
      ) : (
        fallback
      );

    return <>{output || null}</>;
  }

  if (connection.status === ConnectionStatus.CONNECTING) {
    return <Spinner positioning="centered" size="large" />;
  }

  if (connection.network === NetworkEnum.UNSUPPORTED) {
    const output =
      fallback === true ? (
        <Container>
          <Fallback>
            You are connected to an unsupported network. We currently only support Mainnet, Rinkeby and Kovan.
          </Fallback>
        </Container>
      ) : (
        fallback
      );

    return <>{output || null}</>;
  }

  const output =
    fallback === true ? (
      <Container>
        <Fallback>You have to be connected to a supported network to see this page.</Fallback>
      </Container>
    ) : (
      fallback
    );

  return <>{output || null}</>;
};
