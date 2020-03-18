import React from 'react';
import * as Yup from 'yup';
import { useForm, FormContext } from 'react-hook-form';
import { useEnvironment } from '~/hooks/useEnvironment';
import { MaxConcentration, Deployment, PolicyDefinition } from '@melonproject/melonjs';
import { MaxConcentrationBytecode } from '@melonproject/melonjs/abis/MaxConcentration.bin';
import { BigNumber } from 'bignumber.js';
import { useAccount } from '~/hooks/useAccount';
import { Input } from '~/storybook/components/Input/Input';
import { Button } from '~/storybook/components/Button/Button';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { BlockActions } from '~/storybook/components/Block/Block';
import { NotificationBar, NotificationContent } from '~/storybook/components/NotificationBar/NotificationBar';

interface MaxConcentrationConfigurationForm {
  maxConcentration: number;
}

export interface MaxConcentrationConfigurationProps {
  policyManager: string;
  policy: PolicyDefinition;
  startTransaction: (tx: Deployment<MaxConcentration>, name: string) => void;
}

export const MaxConcentrationConfiguration: React.FC<MaxConcentrationConfigurationProps> = props => {
  const environment = useEnvironment()!;
  const account = useAccount();

  const validationSchema = Yup.object().shape({
    maxConcentration: Yup.number()
      .label('Maximum concentration (%)')
      .required()
      .min(0)
      .max(100),
  });

  const defaultValues = {
    maxConcentration: 20,
  };

  const form = useForm<MaxConcentrationConfigurationForm>({
    defaultValues,
    validationSchema,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });

  const submit = form.handleSubmit(async data => {
    const tx = MaxConcentration.deploy(
      environment,
      MaxConcentrationBytecode,
      account.address!,
      new BigNumber(data.maxConcentration!).multipliedBy('1e16')
    );
    props.startTransaction(tx, 'Deploy MaxConcentration Contract');
  });

  return (
    <>
      <SectionTitle>Configure Max Concentration Policy</SectionTitle>
      <NotificationBar kind="neutral">
        <NotificationContent>
          The maximum concentration policy imposes a maximum concentration for each asset in the portfolio (except for
          the denomination asset). E.g. a maximum concentration of 33% means that a single asset in the portfolio can
          make up at most 33% of the fund's total asset value.
        </NotificationContent>
      </NotificationBar>
      <FormContext {...form}>
        <form onSubmit={submit}>
          <Input
            name="maxConcentration"
            label="Maximum concentration (%)"
            type="number"
            step="any"
            id="maxConcentration"
          />

          <BlockActions>
            <Button type="submit">Add Max Concentration Policy</Button>
          </BlockActions>
        </form>
      </FormContext>
    </>
  );
};

export default MaxConcentrationConfiguration;
