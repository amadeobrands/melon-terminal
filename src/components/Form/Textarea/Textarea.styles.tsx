import styled, { css } from 'styled-components';

export interface TextareaInputProps {
  error?: boolean;
}

export const TextareaInput = styled.textarea<TextareaInputProps>`
  position: relative;
  width: 100%;
  min-height: calc(${props => props.theme.spaceUnits.xl} * 4);
  padding: ${props => props.theme.spaceUnits.m};
  border: 1px solid ${props => props.theme.mainColors.secondaryDarkAlpha};
  border-radius: 0;
  background: ${props => props.theme.mainColors.primary};
  box-shadow: inset 1px 4px 4px rgba(200, 200, 200, 0.25);
  ::placeholder {
    color: ${props => props.theme.mainColors.secondaryDarkAlpha};
  }
  :focus {
    outline-color: ${props => props.theme.mainColors.secondaryDarkAlpha};
  }
  ${props =>
    props.disabled &&
    css`
      background: ${props => props.theme.mainColors.secondary};
      border-color: ${props => props.theme.mainColors.secondaryDarkAlpha};
      pointer-events: none;
    `}

  ${props => {
    if (props.error) {
      return css`
        border-color: ${props => props.theme.statusColors.primaryLoss};
      `;
    }
  }}
`;
