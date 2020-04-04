import React from 'react';
import BigNumber from 'bignumber.js';
import { NumberFormatValues } from 'react-number-format';
import { BigNumberInputField } from '~/components/Form/BigNumberInput/BigNumberInput';
import { SelectField, SelectOption } from '~/components/Form/Select/Select';
import { useField, Wrapper, Error, Label } from '~/components/Form/Form';
import { TokenValue } from './TokenValue';
import { TokenDefinition, sameAddress } from '@melonproject/melonjs';
import { ValueType } from 'react-select';

export interface TokenValueInputProps {
  name: string;
  label?: string;
  tokens: TokenDefinition[];
}

export const TokenValueInput: React.FC<TokenValueInputProps> = ({ tokens, label, ...props }) => {
  const [{ onChange, ...field }, meta, helpers] = useField<TokenValue | undefined>(props.name);

  const options = React.useMemo<SelectOption[]>(() => {
    return tokens.map(item => ({
      value: item.address,
      label: item.name,
      icon: item.symbol,
      token: item,
    }));
  }, [tokens]);

  const token = React.useMemo(() => {
    return options.find(option => sameAddress(option.value, field.value?.token.address));
  }, [options, field.value]);

  const value = React.useMemo(() => {
    if (!field.value) {
      return;
    }

    const value = field.value.value;
    return (BigNumber.isBigNumber(value) ? value.toFixed() : value) as string;
  }, [field.value]);

  const onSelectChange = React.useCallback(
    (option: ValueType<SelectOption>) => {
      if (Array.isArray(option)) {
        return;
      }

      const value = field.value?.value;
      const token = (option as SelectOption).token as TokenDefinition;
      helpers.setValue(new TokenValue(token, value));
    },
    [tokens, field.value, helpers.setValue]
  );

  const onValueChange = React.useCallback(
    (values: NumberFormatValues) => {
      if (!field.value?.token) {
        return;
      }

      const value = new BigNumber(values.value);
      const token = field.value.token;
      helpers.setValue(new TokenValue(token, value));
    },
    [field.value, helpers.setValue]
  );

  const isAllowed = React.useCallback(() => !!field.value, [field.value]);

  return (
    <Wrapper>
      <Label>{label}</Label>
      <SelectField {...meta} {...field} {...props} value={token} options={options} onChange={onSelectChange} />
      <BigNumberInputField
        {...meta}
        {...field}
        {...props}
        value={value}
        decimalScale={field.value?.token.decimals}
        isAllowed={isAllowed}
        onValueChange={onValueChange}
      />
      {meta.error && <Error>{meta.error}</Error>}
    </Wrapper>
  );
};
