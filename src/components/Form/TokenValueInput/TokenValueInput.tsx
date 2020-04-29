import React from 'react';
import BigNumber from 'bignumber.js';
import { NumberFormatValues } from 'react-number-format';
import { TokenDefinition } from '@melonproject/melonjs';
import { useField, Wrapper, Error, Label } from '~/components/Form/Form';
import { SelectLabel } from '~/components/Form/Select/Select';
import { BigNumberInputField } from '~/components/Form/BigNumberInput/BigNumberInput';
import { TokenValue } from '../TokenValueSelect/TokenValue';
import * as S from './TokenValueInput.styles';

export interface TokenValueInputProps {
  name: string;
  label?: string;
  token: TokenDefinition;
}

export const TokenValueInput: React.FC<TokenValueInputProps> = ({ token, label, ...props }) => {
  const [{ onChange, ...field }, meta, { setValue }] = useField(props.name);

  const number = React.useMemo(() => {
    if (!field.value) {
      return;
    }

    const value = field.value.value;
    return (BigNumber.isBigNumber(value) ? value.toFixed() : value) as string;
  }, [field.value]);

  const onValueChange = React.useCallback(
    (values: NumberFormatValues) => {
      if (!values.value) {
        return setValue(new TokenValue(token));
      }
      setValue(new TokenValue(token, new BigNumber(values.value)));
    },
    [token, setValue]
  );

  return (
    <Wrapper>
      <Label>{label}</Label>
      <S.InputContainer>
        <S.TokenWrapper>
          <SelectLabel icon={token.symbol} label={token.symbol} />
        </S.TokenWrapper>

        <BigNumberInputField
          {...meta}
          {...field}
          {...props}
          value={number}
          decimalScale={token.decimals}
          onValueChange={onValueChange}
          placeholder={field.value ? 'Enter a value ...' : undefined}
        />
      </S.InputContainer>

      {meta.touched && meta.error && <Error>{meta.error}</Error>}
    </Wrapper>
  );
};
