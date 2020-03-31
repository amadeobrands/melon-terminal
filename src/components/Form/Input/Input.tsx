import React from 'react';
import { useField, Wrapper, Label, Error } from '~/components/Form/Form';
import * as S from './Input.styles';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
}

export const Input: React.FC<InputProps> = props => {
  const [field, meta] = useField({ type: 'text', ...props });
  if (props.type === 'hidden') {
    return <S.Input {...props} {...field} />;
  }

  return (
    <Wrapper>
      {props.label && <Label>{props.label}</Label>}
      <S.Input error={!!meta.error} {...props} {...field} />
      {meta.error && <Error>{meta.error}</Error>}
    </Wrapper>
  );
};
