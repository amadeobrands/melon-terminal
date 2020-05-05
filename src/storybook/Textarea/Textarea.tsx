import styled, { css } from 'styled-components';
import React from 'react';
import { useFormContext, ErrorMessage } from 'react-hook-form';

interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const TextareaInput = styled.textarea<TextareaInputProps>`
  position: relative;
  width: 100%;
  min-height: calc(${(props) => props.theme.spaceUnits.xl} * 4);
  padding: ${(props) => props.theme.spaceUnits.m};
  border: 1px solid ${(props) => props.theme.mainColors.secondaryDarkAlpha};
  border-radius: 0;
  background: ${(props) => props.theme.mainColors.primary};
  box-shadow: inset 1px 4px 4px rgba(200, 200, 200, 0.25);
  ::placeholder {
    color: ${(props) => props.theme.mainColors.secondaryDarkAlpha};
  }
  :focus {
    outline-color: ${(props) => props.theme.mainColors.secondaryDarkAlpha};
  }
  ${(props) =>
    props.disabled &&
    css`
      background: ${(props) => props.theme.mainColors.secondary};
      border-color: ${(props) => props.theme.mainColors.secondaryDarkAlpha};
      pointer-events: none;
    `}
  ${(props) => {
    if (props.error) {
      return css`
        border-color: ${(props) => props.theme.statusColors.primaryLoss};
      `;
    }
  }}
`;

const TextareaWrapper = styled.div``;

const TextareaLabel = styled.span`
  display: inline-block;
  margin-bottom: ${(props) => props.theme.spaceUnits.xs};
  color: ${(props) => props.theme.mainColors.primaryDark};
`;

const TextareaError = styled.span`
  display: inline-block;
  margin-top: ${(props) => props.theme.spaceUnits.xs};
  color: ${(props) => props.theme.statusColors.primaryLoss};
  font-size: ${(props) => props.theme.fontSizes.s};
`;

export interface TextareaProps extends TextareaInputProps {
  label?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ name, label, rows, cols, ...rest }) => {
  const form = useFormContext();
  const connected = !!(form && name);
  const ref = connected ? form.register : undefined;
  const error = !!(connected && form?.errors[name!]);

  return (
    <TextareaWrapper>
      {label && <TextareaLabel>{label}</TextareaLabel>}
      <TextareaInput {...rest} name={name} error={error} ref={ref} cols={cols || 30} rows={rows || 5} />
      {error && <ErrorMessage errors={form.errors} name={name!} as={<TextareaError />} />}
    </TextareaWrapper>
  );
};
