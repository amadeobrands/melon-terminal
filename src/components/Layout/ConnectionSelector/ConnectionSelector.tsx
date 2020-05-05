import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useConnectionState } from '~/hooks/useConnectionState';
import { Dropdown } from '~/storybook/Dropdown/Dropdown';
import { Icons, IconName } from '~/storybook/Icons/Icons';
import { ConnectionContext } from '~/components/Contexts/Connection/Connection';
import * as S from './ConnectionSelector.styles';
import { useLocation, useHistory } from 'react-router';

export interface ConnectionButtonProps {
  name: string;
  label: string;
  icon?: IconName;
  connection: ConnectionContext;
  accounts: { name: string; value: string }[];
  active: boolean;
}

export const ConnectionButton: React.FC<ConnectionButtonProps> = ({
  name,
  label,
  icon,
  connection,
  accounts,
  active,
}) => {
  const location = useLocation()!;
  const history = useHistory();
  const click = () => {
    if (active) {
      connection.disconnect();

      if (location.pathname.match(/^\/wallet/g)) {
        history.push('/');
      }
    } else {
      connection.connect(name);
    }
  };

  return (
    <S.ConnectionButtonWrapper>
      <S.ConnectionButton onClick={click}>
        <S.ButtonWrapper>
          {icon && (
            <S.ButtonIcon>
              <Icons name={icon} />
            </S.ButtonIcon>
          )}
          <S.ButtonText>{active ? `Disconnect from ${label}` : `Connect to ${label}`}</S.ButtonText>
        </S.ButtonWrapper>
      </S.ConnectionButton>

      {(accounts && accounts.length > 1 && (
        <Dropdown
          options={accounts}
          value={connection.account}
          onChange={(event) => connection.switch(event.target.value)}
        />
      )) ||
        null}
    </S.ConnectionButtonWrapper>
  );
};

export const ConnectionSelector = () => {
  const ref = useRef<any>();
  const [open, setOpen] = useState(false);
  const connection = useConnectionState();
  const current = connection.methods.find((item) => item.name === connection.method);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current!.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handler, false);

    return () => {
      document.removeEventListener('click', handler, false);
    };
  }, [open]);

  return (
    <S.ConnectionSelector ref={ref}>
      <S.ConnectionSelectorToggle>
        {current && current.icon ? (
          <Icons name={current.icon} onClick={() => setOpen(!open)} className={open ? 'active' : undefined} />
        ) : (
          <S.ConnectionLabel onClick={() => setOpen(!open)} className={open ? 'active' : undefined}>
            {current ? current.label : 'Login'}
          </S.ConnectionLabel>
        )}
      </S.ConnectionSelectorToggle>

      {open && (
        <S.ConnectionSelectorBox>
          {connection.methods.map((method) => {
            const active = method.name === connection.method;
            const accounts = active
              ? (connection.accounts || []).map((address, index) => ({
                  name: `${index}: ${address}`,
                  value: address,
                }))
              : [];

            if (!active && !method.supported()) {
              return null;
            }

            return (
              <ConnectionButton
                key={method.name}
                name={method.name}
                label={method.label}
                icon={method.icon}
                active={active}
                connection={connection}
                accounts={accounts}
              />
            );
          })}
        </S.ConnectionSelectorBox>
      )}
    </S.ConnectionSelector>
  );
};

export default ConnectionSelector;
