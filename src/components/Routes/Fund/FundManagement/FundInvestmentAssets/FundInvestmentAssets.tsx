import React, { useEffect, useState, useMemo } from 'react';
import * as Yup from 'yup';
import { useForm, FormContext } from 'react-hook-form';
import { Participation, sameAddress } from '@melonproject/melonjs';
import { AllowedInvestmentAsset } from '@melonproject/melongql';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useTransaction } from '~/hooks/useTransaction';
import { Button } from '~/storybook/components/Button/Button';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import { Block, BlockActions } from '~/storybook/components/Block/Block';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { Spinner } from '~/storybook/components/Spinner/Spinner';
import { Checkboxes } from '~/storybook/components/Checkbox/Checkbox';
import { useAccount } from '~/hooks/useAccount';
import { useFundInvestmentAssetsQuery } from './FundInvestmentAssets.query';
import { TransactionDescription } from '~/components/Common/TransactionModal/TransactionDescription';

export interface InvestmentAssetsProps {
  address: string;
}

export interface InvestmentAssetsForm {
  assets: string[];
}

export const InvestmentAssets: React.FC<InvestmentAssetsProps> = ({ address }) => {
  const environment = useEnvironment()!;
  const account = useAccount();
  const [details, query] = useFundInvestmentAssetsQuery(address);
  const [addAssets, setAddAssets] = useState<string[]>([]);
  const [removeAssets, setRemoveAssets] = useState<string[]>([]);

  const transaction = useTransaction(environment, {
    onAcknowledge: () => {
      if (removeAssets?.length) {
        setRemoveAssets([]);
      } else if (addAssets?.length) {
        setAddAssets([]);
      }
    },
  });

  const validationSchema = Yup.object().shape({
    assets: Yup.array<string>().compact(),
  });

  const form = useForm<InvestmentAssetsForm>({
    validationSchema,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });

  const allowedAssets = details?.fund?.routes?.participation?.allowedAssets || [];
  useEffect(() => {
    const participationAddress = details?.fund?.routes?.participation?.address;
    const participation = new Participation(environment, participationAddress);

    if (removeAssets.length) {
      form.clearError('assets');
      const tx = participation.disableInvestment(account.address!, removeAssets);
      transaction.start(tx, 'Remove assets');
    } else if (addAssets.length) {
      form.clearError('assets');
      const tx = participation.enableInvestment(account.address!, addAssets);
      transaction.start(tx, 'Add assets');
    }
  }, [addAssets, removeAssets]);

  const submit = form.handleSubmit(async data => {
    const assetsToAdd = data.assets.filter(
      selected => selected && !allowedAssets?.some(available => sameAddress(available.token!.address, selected))
    );

    const assetsToRemove = (allowedAssets || [])
      .filter(asset => !data.assets.some(selected => sameAddress(selected, asset.token!.address)))
      .map(item => item.token!.address) as string[];

    setRemoveAssets(assetsToRemove);
    setAddAssets(assetsToAdd);

    if (!removeAssets.length && !addAssets.length) {
      form.setError('assets', 'noChanges', 'No changes detected');
    }
  });

  if (query.loading) {
    return (
      <Block>
        <SectionTitle>Define Investment Assets</SectionTitle>
        <Spinner />
      </Block>
    );
  }

  const tokensOptions = environment.tokens
    .filter(token => !token.historic)
    .map(token => ({
      label: `${token.symbol} (${token.name})`,
      value: token.address,
      checked: !!allowedAssets?.some(
        (allowed: AllowedInvestmentAsset) => allowed && allowed.token!.symbol === token.symbol
      ),
    }));

  return (
    <Block>
      <FormContext {...form}>
        <form onSubmit={submit}>
          <SectionTitle>Define Investment Assets</SectionTitle>
          <p>Investors will be able to invest in your funds using any of the assets selected below.</p>

          <Checkboxes options={tokensOptions} name="assets" />

          <BlockActions>
            <Button type="button" onClick={submit}>
              Set Investment Assets
            </Button>
          </BlockActions>
        </form>
      </FormContext>

      <TransactionModal transaction={transaction}>
        {transaction.state.name === 'Remove assets' && (
          <TransactionDescription title="Remove assets">
            You are removing {removeAssets.length} asset{removeAssets.length > 1 && 's'} from the list of allowed
            investment assets.
          </TransactionDescription>
        )}
        {transaction.state.name === 'Add assets' && (
          <TransactionDescription title="Add assets">
            You are adding {addAssets.length} asset{addAssets.length > 1 && 's'} from the list of allowed investment
            assets.
          </TransactionDescription>
        )}
      </TransactionModal>
    </Block>
  );
};

export default InvestmentAssets;
