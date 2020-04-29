import styled from 'styled-components';

export const Wrapper = styled.div``;

export const Label = styled.span`
  display: block;
  margin-bottom: ${(props) => props.theme.spaceUnits.xs};
  margin-top: ${(props) => props.theme.spaceUnits.m};
  color: ${(props) => props.theme.mainColors.primaryDark};
`;

export const Error = styled.span`
  display: block;
  margin-top: ${(props) => props.theme.spaceUnits.xs};
  margin-bottom: ${(props) => props.theme.spaceUnits.m};
  color: ${(props) => props.theme.statusColors.primaryLoss};
  font-size: ${(props) => props.theme.fontSizes.s};
`;
