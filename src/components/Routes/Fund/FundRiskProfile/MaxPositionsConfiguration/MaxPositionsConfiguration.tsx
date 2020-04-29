import React from 'react';
import * as Yup from 'yup';
import { MaxPositions, Deployment, PolicyDefinition } from '@melonproject/melonjs';
import { MaxPositionsBytecode } from '@melonproject/melonjs/abis/MaxPositions.bin';
import { Form, useFormik } from '~/components/Form/Form';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useAccount } from '~/hooks/useAccount';
import { Button } from '~/components/Form/Button/Button';
import { Input } from '~/components/Form/Input/Input';
import { SectionTitle } from '~/storybook/Title/Title';
import { BlockActions } from '~/storybook/Block/Block';
import { NotificationBar, NotificationContent } from '~/storybook/NotificationBar/NotificationBar';

const validationSchema = Yup.object().shape({
  maxPositions: Yup.number().required().min(0).integer(),
});

const initialValues = {
  maxPositions: 10,
};

export interface MaxPositionsConfigurationProps {
  policyManager: string;
  policy: PolicyDefinition;
  startTransaction: (tx: Deployment<MaxPositions>, name: string) => void;
}

export const MaxPositionsConfiguration: React.FC<MaxPositionsConfigurationProps> = (props) => {
  const environment = useEnvironment()!;
  const account = useAccount();

  const formik = useFormik({
    validationSchema,
    initialValues,
    onSubmit: async (data) => {
      const tx = MaxPositions.deploy(environment, MaxPositionsBytecode, account.address!, data.maxPositions!);
      props.startTransaction(tx, 'Deploy MaxPositions Contract');
    },
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
      <Form formik={formik}>
        <Input name="maxPositions" label="Maximum number of positions" type="number" step={1} />
        <BlockActions>
          <Button type="submit">Add Max Positions Policy</Button>
        </BlockActions>
      </Form>
    </>
  );
};

export default MaxPositionsConfiguration;
