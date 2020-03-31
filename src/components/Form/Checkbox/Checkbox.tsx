import React from 'react';
import { FieldMetaProps } from 'formik';
import { useField, Wrapper, Error } from '~/components/Form/Form';
import { CheckboxIcon, CheckboxContainer, CheckboxInput, CheckboxMask, CheckboxLabel } from './Checkbox.styles';

export type CheckboxItemProps<TValue = string | boolean> = React.InputHTMLAttributes<HTMLInputElement> &
  FieldMetaProps<TValue> & {
    name: string;
    label?: string;
  };

export const CheckboxItem: React.FC<CheckboxItemProps> = props => (
  <CheckboxContainer>
    <CheckboxInput type="checkbox" id={props.id ?? props.name} {...props} />

    <CheckboxMask>
      <CheckboxIcon />
    </CheckboxMask>

    {props.label && <CheckboxLabel htmlFor={props.id ?? props.name}>{props.label}</CheckboxLabel>}
    {props.error && <Error>{props.error}</Error>}
  </CheckboxContainer>
);

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = props => {
  const [field, meta] = useField({ type: 'checkbox', ...props });

  return (
    <Wrapper>
      <CheckboxItem {...props} {...meta} {...field} />
    </Wrapper>
  );
};
