import React from 'react';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useTransaction } from '~/hooks/useTransaction';
import { Button } from '~/storybook/components/Button/Button';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import { Hub, Trading } from '@melonproject/melonjs';
import { useAccount } from '~/hooks/useAccount';
import { Block, BlockActions } from '~/storybook/components/Block/Block';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { useFundReturnBatchToVaultQuery } from './FundReturnBatchToVaultQuery.query';
import { TransactionDescription } from '~/components/Common/TransactionModal/TransactionDescription';

export interface ReturnBatchToVaultProps {
  address: string;
}

export const ReturnBatchToVault: React.FC<ReturnBatchToVaultProps> = ({ address }) => {
  const environment = useEnvironment()!;
  const account = useAccount();
  const [addresses] = useFundReturnBatchToVaultQuery(address);
  const transaction = useTransaction(environment);
  const submit = async () => {
    const hub = new Hub(environment, address);
    const td = (await hub.getRoutes()).trading;
    const trading = new Trading(environment, td);
    const tx = trading.returnBatchToVault(account.address!, addresses);
    transaction.start(tx, 'Move assets to vault');
  };

  if (!(addresses && addresses.length)) {
    return <></>;
  }

  return (
    <Block>
      <SectionTitle>Move Assets to Vault</SectionTitle>
      <p>
        Some of your fund's assets have not been returned to the vault contract. This can happen when trading. In order
        to be able to use all your assets for trading, you have to move the assets back to vault
      </p>

      <BlockActions>
        <Button type="submit" kind="success" onClick={() => submit()}>
          Move Assets to Vault
        </Button>
      </BlockActions>

      <TransactionModal transaction={transaction}>
        <TransactionDescription title="Move assets to Vault">
          This transaction moves all assets to the Vault contract.
        </TransactionDescription>
      </TransactionModal>
    </Block>
  );
};

export default ReturnBatchToVault;
