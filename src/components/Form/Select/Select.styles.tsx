import styled from 'styled-components';

export const SelectWrapper = styled.div`
  display: flex;
`;

export const SelecLabelWrapper = styled.span`
  display: flex;
  flex-direction: column;
`;

export const SelectIcon = styled.span`
  margin-right: 10px;
`;

export const SelectLabel = styled.span``;

export const SelectDescription = styled.span`
  font-size: ${(props) => props.theme.fontSizes.m};
  color: ${(props) => props.theme.mainColors.secondaryDark};
`;
