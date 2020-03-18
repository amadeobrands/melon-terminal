import React from 'react';
import { NotificationBar, NotificationContent } from '~/storybook/components/NotificationBar/NotificationBar';

export interface TransactionDescriptionProps {
  title?: string;
}

export const TransactionDescription: React.FC<TransactionDescriptionProps> = ({ title, children }) => {
  if (!title && !children) {
    return <></>;
  }

  return (
    <NotificationBar kind="neutral">
      <NotificationContent>
        <p>{title}</p>
        <p>{children}</p>
      </NotificationContent>
    </NotificationBar>
  );
};
