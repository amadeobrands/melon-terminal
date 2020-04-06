import styled from 'styled-components';
import { Button } from '~/storybook/Button/Button';

export const ToolTipContainer = styled.div`
  border: 1px solid black;
  padding: 1rem;
  background: white;
  opacity: 95%;
`;
export const ToolTipText = styled.div`
  opacity: 1;
  color: 'rbg(0,0,0)';
`;

export const ControlBox = styled.div`
  border: ${props => props.theme.border.borderSecondary};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spaceUnits.xs};
`;

export const ButtonBox = styled.div`
  display: flex;
  flex-direction: column;
`

export const PriceLabel = styled.div`
  transform: rotate(-90deg);
`;
// export const ChartContainer = styled.div`
// `

export const Chart = styled.div`
  display: flex;
  flex-direction: row;
  height: 397px;
`;
