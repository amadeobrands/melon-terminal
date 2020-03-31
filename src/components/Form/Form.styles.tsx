import styled from 'styled-components';

export const Wrapper = styled.div``;

export const Label = styled.span`
  display: inline-block;
  margin-bottom: ${props => props.theme.spaceUnits.xs};
  color: ${props => props.theme.mainColors.primaryDark};
`;

export const Error = styled.span`
  display: inline-block;
  margin-top: ${props => props.theme.spaceUnits.xs};
  color: ${props => props.theme.statusColors.primaryLoss};
  font-size: ${props => props.theme.fontSizes.s};
`;
