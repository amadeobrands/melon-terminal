import React from 'react';
import BigNumber from 'bignumber.js';
import NumberFormat, { NumberFormatValues, NumberFormatProps } from 'react-number-format';
import { InputWidget, InputField } from '~/components/Form/Input/Input';
import { useField, GenericInputProps } from '~/components/Form/Form';

export type BigNumberInputProps = NumberFormatProps &
  GenericInputProps & {
    name: string;
    value?: BigNumber.Value;
    label?: string;
  };

export const BigNumberInput: React.FC<BigNumberInputProps> = props => {
  const [{ onChange, ...field }, meta, helpers] = useField<BigNumber.Value | undefined>({
    type: 'text',
    ...props,
  } as any);

  const onValueChange = React.useCallback(
    (values: NumberFormatValues) => {
      const value = new BigNumber(values.value);
      helpers.setValue(!value.isNaN() ? value : undefined);
    },
    [helpers.setValue]
  );

  return (
    <BigNumberInputField customInput={InputWidget} onValueChange={onValueChange} {...meta} {...field} {...props} />
  );
};

export const BigNumberInputField: React.FC<BigNumberInputProps> = props => {
  const value = (BigNumber.isBigNumber(props.value) ? props.value.toFixed() : props.value) as string;

  return (
    <NumberFormat
      customInput={InputField}
      thousandSeparator=","
      allowedDecimalSeparators={['.', ',']}
      {...props}
      value={value}
    />
  );
};
