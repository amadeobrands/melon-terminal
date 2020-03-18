import React from 'react';
import * as Yup from 'yup';
import { useForm, FormContext } from 'react-hook-form';
import { useEnvironment } from '~/hooks/useEnvironment';
import { MaxPositions, Deployment, PolicyDefinition } from '@melonproject/melonjs';
import { MaxPositionsBytecode } from '@melonproject/melonjs/abis/MaxPositions.bin';
import { useAccount } from '~/hooks/useAccount';
import { Button } from '~/storybook/components/Button/Button';
import { Input } from '~/storybook/components/Input/Input';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { BlockActions } from '~/storybook/components/Block/Block';
import { NotificationBar, NotificationContent } from '~/storybook/components/NotificationBar/NotificationBar';

interface MaxPositionsConfigurationForm {
  maxPositions: number;
}

export interface MaxPositionsConfigurationProps {
  policyManager: string;
  policy: PolicyDefinition;
  startTransaction: (tx: Deployment<MaxPositions>, name: string) => void;
}

export const MaxPositionsConfiguration: React.FC<MaxPositionsConfigurationProps> = props => {
  const environment = useEnvironment()!;
  const account = useAccount();

  const validationSchema = Yup.object().shape({
    maxPositions: Yup.number()
      .label('Maximum number of positions')
      .required()
      .min(0)
      .integer(),
  });

  const defaultValues = {
    maxPositions: 10,
  };

  const form = useForm<MaxPositionsConfigurationForm>({
    defaultValues,
    validationSchema,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });

  const submit = form.handleSubmit(async data => {
    const tx = MaxPositions.deploy(environment, MaxPositionsBytecode, account.address!, data.maxPositions!);
    props.startTransaction(tx, 'Deploy MaxPositions Contract');
  });

  return (
    <>
      <SectionTitle>Configure Max Positions Policy</SectionTitle>
      <NotificationBar kind="neutral">
        <NotificationContent>
          The maximum number of positions policy imposes a maximum on the number of assets that a fund can hold. E.g. a
          maximum of 10 positions means that the fund can hold up to 10 different assets in its portfolio.
        </NotificationContent>
      </NotificationBar>
      <FormContext {...form}>
        <form onSubmit={submit}>
          <Input name="maxPositions" label="Maximum number of positions" type="number" step={1} id="maxPositions" />
          <BlockActions>
            <Button type="submit">Add Max Positions Policy</Button>
          </BlockActions>
        </form>
      </FormContext>
    </>
  );
};

export default MaxPositionsConfiguration;
