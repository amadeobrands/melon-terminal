import styled from 'styled-components';

export const InputContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

export interface SelectTriggerProps {
  disabled?: boolean;
}

export const SelectTrigger = styled.div<SelectTriggerProps>`
  cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
  border-color: ${(props) => props.theme.mainColors.secondaryDarkAlpha};
  border-style: solid;
  border-width: 1px 1px 1px 0px;
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${(props) => (props.disabled ? props.theme.mainColors.secondary : props.theme.mainColors.primary)};
  border-radius: 0px;
  box-shadow: inset 1px 4px 4px rgba(200, 200, 200, 0.25);
  padding: 0px ${(props) => props.theme.spaceUnits.xxs} 0px ${(props) => props.theme.spaceUnits.m};

  &:focus {
    outline-color: ${(props) => props.theme.mainColors.secondaryDarkAlpha};
  }
`;

export const SelectField = styled.div`
  background: ${(props) => props.theme.mainColors.primary};
`;

export const Dropdown = styled.div`
  padding-left: ${(props) => props.theme.spaceUnits.s};
`;
