import React from 'react';
import BigNumber from 'bignumber.js';
import { TokenDefinition, sameAddress } from '@melonproject/melonjs';
import { ValueType } from 'react-select';
import { NumberFormatValues } from 'react-number-format';
import { BigNumberInputField } from '~/components/Form/BigNumberInput/BigNumberInput';
import { SelectField, SelectOption, SelectLabel } from '~/components/Form/Select/Select';
import { useField, Wrapper, Error, Label } from '~/components/Form/Form';
import { TokenValue } from './TokenValue';
import * as S from './TokenValueSelect.style';

export interface TokenValueSelectProps {
  name: string;
  label?: string;
  tokens: TokenDefinition[];
}

export const TokenValueSelect: React.FC<TokenValueSelectProps> = ({ tokens, label, ...props }) => {
  const [{ onChange, ...field }, meta, { setValue }] = useField<TokenValue | undefined>(props.name);

  const inputRef = React.useRef<undefined | HTMLInputElement>();
  const [open, setOpen] = React.useState(false);
  const toggleOpen = React.useCallback(() => setOpen(!open), [open, setOpen]);

  const options = React.useMemo<SelectOption[]>(() => {
    return tokens.map((item) => ({
      value: item.address,
      label: item.symbol,
      icon: item.symbol,
      token: item,
    }));
  }, [tokens]);

  const selection = React.useMemo(() => {
    return options.find((option) => sameAddress(option.value, field.value?.token.address));
  }, [options, field.value]);

  const number = React.useMemo(() => {
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

      setValue(new TokenValue((option as SelectOption).token as TokenDefinition, field.value?.value));
      setOpen(false);

      // Focus the big number input field after selecting a token.
      setTimeout(() => {
        inputRef.current?.focus();
      });
    },
    [field.value, setValue, setOpen]
  );

  const isAllowed = React.useCallback(() => !!field.value, [field.value]);
  const onValueChange = React.useCallback(
    (values: NumberFormatValues) => {
      if (!field.value) {
        return;
      }

      setValue(new TokenValue(field.value.token, new BigNumber(values.value)));
    },
    [field.value, setValue]
  );

  return (
    <Wrapper>
      <Label>{label}</Label>
      <S.InputContainer>
        <S.SelectTrigger onClick={toggleOpen}>
          {selection ? <SelectLabel icon={selection.icon} label={selection.label} /> : 'Select a token ...'}
        </S.SelectTrigger>

        <BigNumberInputField
          {...meta}
          {...field}
          {...props}
          getInputRef={inputRef}
          value={number}
          decimalScale={selection?.token.decimals}
          onValueChange={onValueChange}
          isAllowed={isAllowed}
          disabled={!field.value}
          placeholder={field.value ? 'Enter a value ...' : undefined}
        />
      </S.InputContainer>

      {open ? (
        <SelectField
          {...meta}
          {...field}
          {...props}
          autoFocus={true}
          backspaceRemovesValue={false}
          controlShouldRenderValue={false}
          hideSelectedOptions={false}
          isClearable={false}
          isSearchable={true}
          menuIsOpen={true}
          tabSelectsValue={false}
          components={{ IndicatorSeparator: null }}
          onChange={onSelectChange}
          options={options}
          value={selection}
          placeholder="Search ..."
        />
      ) : null}

      {meta.touched && meta.error && <Error>{meta.error}</Error>}
    </Wrapper>
  );
};
