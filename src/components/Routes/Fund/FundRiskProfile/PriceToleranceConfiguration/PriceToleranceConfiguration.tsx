import React from 'react';
import * as Yup from 'yup';
import { Form, useFormik } from '~/components/Form/Form';
import { PriceToleranceBytecode } from '@melonproject/melonjs/abis/PriceTolerance.bin';
import { PriceTolerance, Deployment, PolicyDefinition } from '@melonproject/melonjs';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useAccount } from '~/hooks/useAccount';
import { Input } from '~/components/Form/Input/Input';
import { Button } from '~/components/Form/Button/Button';
import { SectionTitle } from '~/storybook/Title/Title';
import { BlockActions } from '~/storybook/Block/Block';
import { NotificationBar, NotificationContent } from '~/storybook/NotificationBar/NotificationBar';

const validationSchema = Yup.object().shape({
  priceTolerance: Yup.number().label('Price Tolerance').required().min(0).max(100),
});

const initialValues = {
  priceTolerance: 10,
};

export interface PriceToleranceConfigurationProps {
  policyManager: string;
  policy: PolicyDefinition;
  startTransaction: (tx: Deployment<PriceTolerance>, name: string) => void;
}

export const PriceToleranceConfiguration: React.FC<PriceToleranceConfigurationProps> = (props) => {
  const environment = useEnvironment()!;
  const account = useAccount();

  const formik = useFormik({
    validationSchema,
    initialValues,
    onSubmit: async (data) => {
      const tx = PriceTolerance.deploy(environment, PriceToleranceBytecode, account.address!, data.priceTolerance!);
      props.startTransaction(tx, 'Deploy PriceTolerance Contract');
    },
  });

  return (
    <>
      <SectionTitle>Configure Price Tolerance Policy</SectionTitle>
      <NotificationBar kind="neutral">
        <NotificationContent>
          The price tolerance policy provides a pre-trade price check ensuring that you do not trade at a price that is
          disadvantageous to the fund. It is expressed as a percentage and references the last on-chain price update.
        </NotificationContent>
      </NotificationBar>
      <Form formik={formik}>
        <Input name="priceTolerance" label="Price tolerance (%)" type="number" step="any" />
        <BlockActions>
          <Button type="submit">Add Price Tolerance Policy</Button>
        </BlockActions>
      </Form>
    </>
  );
};

export default PriceToleranceConfiguration;
