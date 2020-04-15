import styled from 'styled-components';

export const InputContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

export const TokenWrapper = styled.div`
  border-color: ${props => props.theme.mainColors.secondaryDarkAlpha};
  border-color: ${props => props.theme.mainColors.secondaryDarkAlpha};
  border-style: solid;
  border-width: 1px 0px 1px 1px;
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${props => props.theme.mainColors.primary};
  border-radius: 0;
  color: ${props => props.theme.mainColors.textColor};
  box-shadow: inset 1px 4px 4px rgba(200, 200, 200, 0.25);
  padding: 0px ${props => props.theme.spaceUnits.m};
  &:focus {
    outline-color: ${props => props.theme.mainColors.secondaryDarkAlpha};
  }
`;
