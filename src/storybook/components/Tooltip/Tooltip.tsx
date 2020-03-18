import React, { useState } from 'react';
import { Manager, Reference, Popper } from 'react-popper';
import * as S from './Tooltip.styles';

export interface TooltipProps {
  value?: string | number | React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ value, children }) => {
  const [position, setPosition] = useState(false);

  return (
    <Manager>
      <Reference>
        {({ ref }) => (
          <span ref={ref} onMouseEnter={() => setPosition(true)} onMouseLeave={() => setPosition(false)}>
            {children}
          </span>
        )}
      </Reference>
      {position && (
        <Popper placement="right">
          {({ ref, style, placement }) => (
            <S.Container ref={ref} style={style} data-placement={placement}>
              {value}
            </S.Container>
          )}
        </Popper>
      )}
    </Manager>
  );
};
