import React from 'react';
import BigNumber from 'bignumber.js';
import NumberFormat, { NumberFormatValues } from 'react-number-format';
import { InputField, InputFieldProps } from '~/components/Form/Input/Input';
import { useField } from '~/components/Form/Form';

export interface BigNumberInputProps {
  name: string;
  label?: string;
}

export const BigNumberInputField: React.FC<InputFieldProps> = props => {
  return <InputField {...props} field={{ ...props.field, value: props.value }} />;
};

export const BigNumberInput: React.FC<BigNumberInputProps> = props => {
  const [{ onChange, ...field }, meta, helper] = useField<BigNumber | undefined>({ type: 'text', ...props });

  const onValueChange = React.useCallback(
    (values: NumberFormatValues) => {
      const value = new BigNumber(values.value);
      helper.setValue(!value.isNaN() ? value : undefined);
    },
    [helper]
  );

  return (
    <NumberFormat
      customInput={BigNumberInputField}
      onValueChange={onValueChange}
      thousandSeparator=","
      allowedDecimalSeparators={['.', ',']}
      value={field.value?.toFixed()}
      field={field}
      meta={meta}
      helper={helper}
      {...props}
    />
  );
};
