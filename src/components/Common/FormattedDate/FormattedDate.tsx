import React from 'react';
import BigNumber from 'bignumber.js';
import { format } from 'date-fns';

export interface FormattedDateProps {
  timestamp?: Date | BigNumber.Value | null;
  format?: string;
}

export const FormattedDate: React.FC<FormattedDateProps> = (props) => {
  if (!props.timestamp) {
    return <>N/A</>;
  }

  const date =
    props.timestamp instanceof Date
      ? props.timestamp
      : new Date(new BigNumber(props.timestamp).integerValue().toNumber() * 1000);
  return <>{format(date, props.format || 'yyyy/MM/dd HH:mm O')}</>;
};
