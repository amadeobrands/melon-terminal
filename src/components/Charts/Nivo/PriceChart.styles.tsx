import styled, { css } from 'styled-components';
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
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  padding: ${props => props.theme.spaceUnits.s};
`;

export const ButtonBox = styled.div`
  display: flex;
  flex-direction: column;
`;

export const PriceLabel = styled.div`
  transform: rotate(-90deg);
`;

export const Chart = styled.div`
  display: flex;
  flex-direction: column;
  height: 397px;
  padding-bottom: ${props => props.theme.spaceUnits.xxxl};
`;

export const ChartButton = styled(Button)`
  font-size: ${props => props.theme.spaceUnits.s};
  text-align: center;
  width: auto;
  height: auto;
  padding: ${props => props.theme.spaceUnits.xxs};
  border: ${props => props.theme.border.borderColor};
  ${props =>
    props.disabled &&
    css`
      opacity: 0.5;
      background: none;
    `}
`;
