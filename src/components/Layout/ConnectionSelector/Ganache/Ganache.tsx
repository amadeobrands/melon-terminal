import React from 'react';
import * as Rx from 'rxjs';
import { retryWhen, delay } from 'rxjs/operators';
import { Eth } from 'web3-eth';
import { HttpProvider } from 'web3-providers';
import { networkFromId } from '~/utils/networkFromId';
import {
  connectionEstablished,
  ConnectionAction,
  ConnectionMethod,
  ConnectionMethodProps,
} from '~/components/Contexts/Connection/Connection';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { Button } from '~/storybook/components/Button/Button';
import { getConfig } from '~/config';
import { NetworkEnum } from '~/types';

interface Resource extends Rx.Unsubscribable {
  eth: Eth;
}

const connect = (): Rx.Observable<ConnectionAction> => {
  const config = getConfig(NetworkEnum.TESTNET)!;
  const create = (): Resource => {
    const provider = new HttpProvider(config.provider);
    const eth = new Eth(provider, undefined, {
      transactionConfirmationBlocks: 1,
    });

    return { eth, unsubscribe: () => provider.disconnect() };
  };

  return Rx.using(create, resource => {
    const eth = (resource as Resource).eth;

    const connection$ = Rx.defer(async () => {
      const [id, accounts] = await Promise.all([eth.net.getId(), eth.getAccounts()]);
      const network = networkFromId(id);
      return connectionEstablished(eth, network, accounts);
    }).pipe(retryWhen(error => error.pipe(delay(1000))));

    return Rx.concat(connection$, Rx.NEVER);
  });
};

export const Ganache: React.FC<ConnectionMethodProps> = ({ connect, disconnect, active }) => {
  return (
    <>
      <SectionTitle>Ganache</SectionTitle>

      {!active ? (
        <Button length="stretch" onClick={() => connect()}>
          Connect
        </Button>
      ) : (
        <Button length="stretch" onClick={() => disconnect()}>
          Disconnect
        </Button>
      )}
    </>
  );
};

export const method: ConnectionMethod = {
  connect,
  supported: () => !!getConfig(NetworkEnum.TESTNET),
  component: Ganache,
  icon: 'GANACHE',
  name: 'ganache',
  label: 'Ganache',
};
