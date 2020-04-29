import React from 'react';
import styled, { css } from 'styled-components';
import { Check } from '@styled-icons/fa-solid/Check';
import { useFormContext, ErrorMessage } from 'react-hook-form';

export const CheckboxContainer = styled.div`
  position: relative;
  display: block;
  margin-bottom: ${(props) => props.theme.spaceUnits.s};
  text-align: left;
`;

export const CheckboxInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  width: ${(props) => props.theme.spaceUnits.m};
  height: ${(props) => props.theme.spaceUnits.m};
  opacity: 0;
  margin: 0px;
  cursor: pointer;
  &:hover + span {
    svg {
      color: ${(props) => props.theme.mainColors.primaryDark};
    }
  }
  :checked + span {
    background: ${(props) => props.theme.mainColors.primaryDark};
    svg {
      color: ${(props) => props.theme.mainColors.primary};
    }
  }
  &:hover:checked + span {
    background: ${(props) => props.theme.mainColors.secondaryDark};
    svg {
      color: ${(props) => props.theme.mainColors.textColor};
    }
  }
  ${(props) =>
    props.disabled &&
    css`
      pointer-events: none;
      + span {
        border: 2px solid ${(props) => props.theme.mainColors.textColor};
        background: ${(props) => props.theme.mainColors.secondary};
      }
      :checked + span {
        background: ${(props) => props.theme.mainColors.secondaryDark};
        svg {
          color: ${(props) => props.theme.mainColors.textColor};
        }
      }
      ~ label {
        pointer-events: none;
      }
    `}
`;

export const CheckboxPositioning = styled.div`
  position: relative;
  display: inline-block;
  vertical-align: middle;
`;

export const CheckboxMask = styled.span`
  position: relative;
  display: inline-block;
  vertical-align: middle;
  width: ${(props) => props.theme.spaceUnits.m};
  height: ${(props) => props.theme.spaceUnits.m};
  border-radius: 0px;
  border: 2px solid ${(props) => props.theme.mainColors.primaryDark};
  transition: all 0.2s ease-in-out;
`;

export const CheckboxIcon = styled(Check)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${(props) => props.theme.spaceUnits.xs};
  height: ${(props) => props.theme.spaceUnits.xs};
  transform: translate(-50%, -50%);
  color: transparent;
  transition: all 0.2s ease-in-out;
`;

export const CheckboxLabel = styled.label`
  position: relative;
  vertical-align: middle;
  padding-left: ${(props) => props.theme.spaceUnits.xs};
  cursor: pointer;
`;

export const CheckboxWrapper = styled.div``;

export const CheckboxError = styled.span`
  display: inline-block;
  margin-top: ${(props) => props.theme.spaceUnits.xs};
  color: ${(props) => props.theme.statusColors.primaryLoss};
`;

export const CheckboxesWrapper = styled.div``;

export const CheckboxesLabel = styled.span`
  display: inline-block;
  margin-bottom: ${(props) => props.theme.spaceUnits.xs};
  color: ${(props) => props.theme.mainColors.primaryDark};
`;

export const CheckboxesError = styled.span`
  display: inline-block;
  margin-top: ${(props) => props.theme.spaceUnits.xs};
  color: ${(props) => props.theme.statusColors.primaryLoss};
  font-size: ${(props) => props.theme.fontSizes.s};
`;

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ name, id, label, ...rest }) => {
  const form = useFormContext();
  const connected = !!(form && name);
  const ref = connected ? form.register : undefined;
  const errors = connected ? form.errors : undefined;
  const error = !!(errors && errors[name!]);

  return (
    <CheckboxWrapper>
      <CheckboxContainer>
        <CheckboxInput {...rest} type="checkbox" id={id ?? name} name={name} ref={ref} />
        <CheckboxMask>
          <CheckboxIcon />
        </CheckboxMask>

        {label && <CheckboxLabel htmlFor={id ?? name}>{label}</CheckboxLabel>}
      </CheckboxContainer>

      {error && <ErrorMessage errors={form.errors} name={name!} as={<CheckboxError />} />}
    </CheckboxWrapper>
  );
};

export interface CheckboxesProps {
  options: { value: string; label: string; checked?: boolean; disabled?: boolean }[];
  name: string;
  label?: string;
}

export const Checkboxes: React.FC<CheckboxesProps> = ({ name, label, options }) => {
  const form = useFormContext();
  const connected = !!(form && name);
  const ref = connected ? form.register : undefined;
  const errors = connected ? form.errors : undefined;
  const error = !!(errors && errors[name!]);

  return (
    <CheckboxesWrapper>
      {label && <CheckboxesLabel>{label}</CheckboxesLabel>}

      {options.map((item, index) => (
        <CheckboxContainer key={`${item.label}:${item.value}`}>
          <CheckboxInput
            type="checkbox"
            id={`${name}[${index}]`}
            name={`${name}[${index}]`}
            value={item.value}
            defaultChecked={item.checked}
            disabled={item.disabled}
            ref={ref}
          />

          <CheckboxMask>
            <CheckboxIcon />
          </CheckboxMask>

          {item.label && <CheckboxLabel htmlFor={`${name}[${index}]`}>{item.label}</CheckboxLabel>}
        </CheckboxContainer>
      ))}

      {error && <ErrorMessage errors={form.errors} name={name!} as={<CheckboxesError />} />}
    </CheckboxesWrapper>
  );
};
