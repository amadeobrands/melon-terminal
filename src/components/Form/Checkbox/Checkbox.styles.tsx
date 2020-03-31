import styled, { css } from 'styled-components';
import { Check } from 'styled-icons/fa-solid/Check';

export const CheckboxContainer = styled.div`
  position: relative;
  display: block;
  margin-bottom: ${props => props.theme.spaceUnits.s};
  text-align: left;
`;

export const CheckboxInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  width: ${props => props.theme.spaceUnits.m};
  height: ${props => props.theme.spaceUnits.m};
  opacity: 0;
  margin: 0px;
  cursor: pointer;
  &:hover + span {
    svg {
      color: ${props => props.theme.mainColors.primaryDark};
    }
  }
  :checked + span {
    background: ${props => props.theme.mainColors.primaryDark};
    svg {
      color: ${props => props.theme.mainColors.primary};
    }
  }
  &:hover:checked + span {
    background: ${props => props.theme.mainColors.secondaryDark};
    svg {
      color: ${props => props.theme.mainColors.textColor};
    }
  }
  ${props =>
    props.disabled &&
    css`
      pointer-events: none;
      + span {
        border: 2px solid ${props => props.theme.mainColors.textColor};
        background: ${props => props.theme.mainColors.secondary};
      }
      :checked + span {
        background: ${props => props.theme.mainColors.secondaryDark};
        svg {
          color: ${props => props.theme.mainColors.textColor};
        }
      }
    `}
`;

export const CheckboxMask = styled.span`
  position: relative;
  display: inline-block;
  vertical-align: middle;
  width: ${props => props.theme.spaceUnits.m};
  height: ${props => props.theme.spaceUnits.m};
  border-radius: 0px;
  border: 2px solid ${props => props.theme.mainColors.primaryDark};
  transition: all 0.2s ease-in-out;
`;

export const CheckboxIcon = styled(Check)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${props => props.theme.spaceUnits.xs};
  height: ${props => props.theme.spaceUnits.xs};
  transform: translate(-50%, -50%);
  color: transparent;
  transition: all 0.2s ease-in-out;
`;

export const CheckboxLabel = styled.label`
  position: relative;
  vertical-align: middle;
  padding-left: ${props => props.theme.spaceUnits.xs};
  cursor: pointer;
`;
