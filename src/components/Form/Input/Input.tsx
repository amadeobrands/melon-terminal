import React from 'react';
import {
  useField,
  Wrapper,
  Label,
  Error,
  FieldInputProps,
  FieldMetaProps,
  FieldHelperProps,
} from '~/components/Form/Form';
import * as S from './Input.styles';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
}

export const Input: React.FC<InputProps> = props => {
  const [field, meta, helper] = useField({ type: 'text', ...props });
  if (props.type === 'hidden') {
    return <input {...props} {...field} />;
  }

  return <InputField {...props} field={field} meta={meta} helper={helper} />;
};

export interface InputFieldProps<TValue = any> extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  field: FieldInputProps<TValue>;
  meta: FieldMetaProps<TValue>;
  helper: FieldHelperProps<TValue>;
}

export const InputField: React.FC<InputFieldProps> = props => {
  const { field, meta, helper, ...rest } = props;

  return (
    <Wrapper>
      {props.label && <Label>{props.label}</Label>}
      <S.Input error={!!meta.error} {...rest} {...field} />
      {meta.error && <Error>{meta.error}</Error>}
    </Wrapper>
  );
};
