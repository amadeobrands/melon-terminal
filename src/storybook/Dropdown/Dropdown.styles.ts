import styled, { css } from 'styled-components';

export const DropdownWrapper = styled.div`
  margin-bottom: ${props => props.theme.spaceUnits.l};
  width: 100%;
`;

export const DropdownLabel = styled.span`
  display: inline-block;
  margin-bottom: ${props => props.theme.spaceUnits.xs};
  color: ${props => props.theme.mainColors.primaryDark};
`;

export const DropdownError = styled.span`
  display: inline-block;
  margin-top: ${props => props.theme.spaceUnits.xs};
  color: ${props => props.theme.statusColors.primaryLoss};
  font-size: ${props => props.theme.fontSizes.s};
`;

export interface DropdownSelectContainerProps {
  error?: boolean;
  disabled?: boolean;
}

export const DropdownSelectContainer = styled.div<DropdownSelectContainerProps>`
  position: relative;
  width: 100%;
  background-color: ${props => props.theme.mainColors.primary};
  color: ${props => props.theme.mainColors.primaryDark};
  border: ${props => props.theme.border.borderDefault};
  &:before {
    content: '';
    position: absolute;
    right: ${props => props.theme.spaceUnits.s};
    top: ${props => props.theme.spaceUnits.m};
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid ${props => props.theme.border.borderColor};
    pointer-events: none;
  }
  ${props => {
    if (props.disabled) {
      return css`
        background: ${props => props.theme.mainColors.secondary};
        border-color: ${props => props.theme.mainColors.secondaryDarkAlpha};
        pointer-events: none;
      `;
    }
  }}
  ${props => {
    if (props.error) {
      return css`
        border-color: ${props => props.theme.statusColors.primaryLoss};
      `;
    }
  }}
`;

export const DropdownSelect = styled.select`
  width: 100%;
  appearance: none;
  border-radius: 0;
  border: none;
  background: transparent;
  color: ${props => props.theme.mainColors.textColor};
  padding: ${props => props.theme.spaceUnits.xs} ${props => props.theme.spaceUnits.xl}
    ${props => props.theme.spaceUnits.xs} ${props => props.theme.spaceUnits.s};
  line-height: 1.6;
  margin: 0;
  :focus {
    outline-color: ${props => props.theme.mainColors.secondaryDarkAlpha};
  }
  &::-ms-expand {
    display: none;
  }
  &:focus::-ms-value {
    background-color: transparent;
  }
`;
