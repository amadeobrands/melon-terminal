import styled from 'styled-components';

export const Label = styled.span`
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding-bottom: ${(props) => props.theme.spaceUnits.xs};
  border-bottom: ${(props) => props.theme.border.borderSecondary};
  margin-bottom: ${(props) => props.theme.spaceUnits.xs};
`;

export const LabelSideInfo = styled.span`
  text-align: right;
  color: ${(props) => props.theme.mainColors.secondaryDark};
`;
