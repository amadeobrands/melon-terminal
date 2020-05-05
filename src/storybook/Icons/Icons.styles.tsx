import styled, { css } from 'styled-components';

export interface IconProps {
  size?: 'normal' | 'small';
  pointer?: boolean;
  colored?: boolean;
}

export const IconsWrapper = styled.div<IconProps>`
  position: relative;
  display: block;

  ${(props) =>
    props.size &&
    props.size === 'normal' &&
    css`
      height: 32px;
      width: 32px;
    `}
  ${(props) =>
    props.size &&
    props.size === 'small' &&
    css`
      height: 16px;
      width: 16px;
    `}

    ${(props) =>
      props.pointer &&
      css`
        cursor: pointer;
      `}

  svg {
    fill: ${(props) => props.colored && props.theme.mainColors.textColor};
    display: block;
    overflow: visible;
    ${(props) =>
      props.size &&
      props.size === 'normal' &&
      css`
        height: 32px;
        width: 32px;
      `}
    ${(props) =>
      props.size &&
      props.size === 'small' &&
      css`
        height: 16px;
        width: 16px;
      `}
  }
`;

export const Loading = styled.div`
  width: 100%;
  height: 100%;
  background: rgba(196, 196, 196, 0.2);
`;
