import React from 'react';
import * as Yup from 'yup';
import { useForm, FormContext } from 'react-hook-form';
import { useEnvironment } from '~/hooks/useEnvironment';
import { PriceTolerance, Deployment, PolicyDefinition } from '@melonproject/melonjs';
import { PriceToleranceBytecode } from '@melonproject/melonjs/abis/PriceTolerance.bin';
import { useAccount } from '~/hooks/useAccount';
import { Input } from '~/storybook/components/Input/Input';
import { Button } from '~/storybook/components/Button/Button';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { BlockActions } from '~/storybook/components/Block/Block';
import { NotificationBar, NotificationContent } from '~/storybook/components/NotificationBar/NotificationBar';

interface PriceToleranceConfigurationForm {
  priceTolerance: number;
}

export interface PriceToleranceConfigurationProps {
  policyManager: string;
  policy: PolicyDefinition;
  startTransaction: (tx: Deployment<PriceTolerance>, name: string) => void;
}

export const PriceToleranceConfiguration: React.FC<PriceToleranceConfigurationProps> = props => {
  const environment = useEnvironment()!;
  const account = useAccount();

  const validationSchema = Yup.object().shape({
    priceTolerance: Yup.number()
      .label('Price tolerance (%)')
      .required()
      .min(0)
      .max(100),
  });

  const defaultValues = {
    priceTolerance: 10,
  };

  const form = useForm<PriceToleranceConfigurationForm>({
    defaultValues,
    validationSchema,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });

  const submit = form.handleSubmit(async data => {
    const tx = PriceTolerance.deploy(environment, PriceToleranceBytecode, account.address!, data.priceTolerance!);
    props.startTransaction(tx, 'Deploy PriceTolerance Contract');
  });

  return (
    <>
      <SectionTitle>Configure Price Tolerance Policy</SectionTitle>
      <NotificationBar kind="neutral">
        <NotificationContent>
          The price tolerance policy sets a specific price tolerance for all trading activities. E.g. if you set a price
          tolerance of 10%, then the fund manager can only trade assets at prices that are at most 10% lower than the
          previous asset price update.
        </NotificationContent>
      </NotificationBar>
      <FormContext {...form}>
        <form onSubmit={submit}>
          <Input name="priceTolerance" label="Price tolerance (%)" type="number" step="any" id="priceTolerance" />
          <BlockActions>
            <Button type="submit">Add Price Tolerance Policy</Button>
          </BlockActions>
        </form>
      </FormContext>
    </>
  );
};

export default PriceToleranceConfiguration;
