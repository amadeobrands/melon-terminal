import styled from 'styled-components';

export const ToolTipContainer = styled.div`
  border: 1px solid black;
  padding: 1rem;
  background: white;
  opacity: 95%;
`;
export const ToolTipText = styled.div`
  opacity: 1;
  color: 'rbg(0,0,0)'
`;


export const ControlBox = styled.div`
  border: ${props => props.theme.border.borderSecondary};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: ${props => props.theme.spaceUnits.xs}
`