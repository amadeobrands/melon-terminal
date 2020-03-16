import React, { useEffect, useMemo, useRef } from 'react';
import * as Yup from 'yup';
import { useForm, FormContext } from 'react-hook-form';
import { Trading } from '@melonproject/melonjs';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useTransaction } from '~/hooks/useTransaction';
import { Button } from '~/storybook/components/Button/Button';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import { Block, BlockActions } from '~/storybook/components/Block/Block';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { Spinner } from '~/storybook/components/Spinner/Spinner';
import { Checkboxes } from '~/storybook/components/Checkbox/Checkbox';
import { useAccount } from '~/hooks/useAccount';
import { useFundExchangesQuery } from './FundExchanges.query';
import { TransactionDescription } from '~/components/Common/TransactionModal/TransactionDescription';

export interface ExchangesProps {
  address: string;
}

export interface ExchangesForm {
  exchanges: string[];
}

export const FundExchanges: React.FC<ExchangesProps> = ({ address }) => {
  const environment = useEnvironment()!;
  const account = useAccount();
  const [details, query] = useFundExchangesQuery(address);

  const transaction = useTransaction(environment);

  const exchanges = useMemo(() => {
    const exchanges = details?.fund?.routes?.trading?.exchanges || [];
    return exchanges.map(exchange => environment.getExchange(exchange as any)).filter(exchange => !!exchange);
  }, [details?.fund?.routes?.trading?.exchanges]);

  const exchangesRef = useRef(exchanges);
  useEffect(() => {
    exchangesRef.current = exchanges;
  }, [exchanges]);

  const form = useForm<ExchangesForm>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    validationSchema: Yup.object().shape({
      exchanges: Yup.array<string>()
        .compact()
        .test('at-least-one', "You didn't select a new exchange.", (value: string[]) => {
          const options = exchangesRef.current;
          return value.some(selected => selected && !options.some(available => available.id === selected))!;
        })
        .test('only-one', 'You can only add one exchange at a time.', (value: string[]) => {
          const options = exchangesRef.current;
          const add = value.find(selected => selected && !options.some(available => available.id === selected))!;
          return add.length === 1;
        }),
    }),
  });

  if (query.loading) {
    return (
      <Block>
        <SectionTitle>Define Allowed Exchanges</SectionTitle>
        <Spinner />
      </Block>
    );
  }

  const options = environment.exchanges
    .filter(exchange => !exchange.historic)
    .map(exchange => ({
      label: exchange.name,
      value: exchange.id,
      checked: !!exchanges?.some(allowed => allowed.id === exchange.id),
      disabled: !!exchanges?.some(allowed => allowed.id === exchange.id),
    }));

  const submit = form.handleSubmit(async data => {
    const add = data.exchanges.find(selected => selected && !exchanges.some(available => available.id === selected))!;
    const exchange = environment.getExchange(add);
    const address = details?.fund?.routes?.trading?.address;
    const trading = new Trading(environment, address!);
    const tx = trading.addExchange(account.address!, exchange.exchange, exchange.adapter);
    transaction.start(tx, 'Add exchange');
  });

  return (
    <Block>
      <FormContext {...form}>
        <form onSubmit={submit}>
          <SectionTitle>Define Allowed Exchanges</SectionTitle>
          <p>As a fund manager, you can trade on any of the exchanges selected below.</p>

          <Checkboxes options={options} name="exchanges" />

          <BlockActions>
            <Button type="button" onClick={submit}>
              Set Allowed Exchanges
            </Button>
          </BlockActions>
        </form>
      </FormContext>

      <TransactionModal transaction={transaction}>
        <TransactionDescription title="Add exchange">
          You are adding an exchange to the list of allowed exchanges.
        </TransactionDescription>
      </TransactionModal>
    </Block>
  );
};
