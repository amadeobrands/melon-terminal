import React, { Dispatch, SetStateAction } from 'react';
import * as S from './ZoomControl.styles';
import { subDays, subWeeks, subMonths, startOfYear } from 'date-fns';
import { findCorrectFromTime } from '~/utils/priceServiceDates';

export interface Serie {
  id: string;
  name?: string;
  type?: string;
  data: Datum[];
}

export interface Datum {
  x: number | string | Date;
  y: number | string;
}

interface clickHandlerParams {
  queryType: 'depth' | 'date';
  depthQueryValue?: Depth;
  dateQueryValue?: number;
  buttonLabel: string;
}

interface ZoomOption {
  value: Depth | number;
  label: string;
  disabled?: boolean | undefined;
  timestamp?: number;
  type: 'depth' | 'date';
}

export type Depth = '1d' | '1w' | '1m' | '3m' | '6m' | '1y';

export interface ZoomControlProps {
  depth: Depth;
  setDepth: (depth: Depth) => void;
  setDate: (date: number) => void;
  setQueryType: Dispatch<SetStateAction<'depth' | 'date'>>;
  queryType: 'depth' | 'date';
  queryFromDate: number;
  fundInceptionDate: Date | undefined;
}

export const ZoomControl: React.FC<ZoomControlProps> = (props) => {
  const today = new Date();
  const fundInceptionDate: undefined | number = props.fundInceptionDate && props.fundInceptionDate.getTime();

  const options = React.useMemo<ZoomOption[]>(() => {
    const options: ZoomOption[] = [
      { label: '1d', value: '1d', timestamp: subDays(today, 1).getTime(), type: 'depth' },
      { label: '1w', value: '1w', timestamp: subWeeks(today, 1).getTime(), type: 'depth' },
      { label: '1m', value: '1m', timestamp: subMonths(today, 1).getTime(), type: 'depth' },
      { label: '3m', value: '3m', timestamp: subMonths(today, 3).getTime(), type: 'depth' },
      // { label: '6m', value: '6m', timestamp: subMonths(today, 6).getTime(), type: 'depth' },
      { label: '1y', value: '1y', timestamp: subMonths(today, 12).getTime(), type: 'depth' },
      {
        label: 'YTD',
        value: findCorrectFromTime(startOfYear(today)),
        type: 'date',
      },
      {
        label: 'All Time',
        value: findCorrectFromTime(props.fundInceptionDate!),
        type: 'date',
      },
    ];

    return options.map((item) => ({
      ...item,
      disabled: fundInceptionDate && item.timestamp ? item.timestamp < fundInceptionDate : undefined,
    }));
  }, [props.depth, props.queryFromDate]);

  const checkActive = (item: ZoomOption) => {
    if (props.queryType == item.type) {
      if (props.queryType === 'depth') {
        if (item.value == props.depth) {
          return true;
        }
      }
      if (props.queryType === 'date') {
        if (item.value == props.queryFromDate) {
          return true;
        }
      }
    }
    return false;
  };

  function clickHandler(params: clickHandlerParams) {
    if (params.queryType === 'depth' && params.depthQueryValue) {
      props.setDepth(params.depthQueryValue);
    } else {
      props.setDate(params.dateQueryValue!);
    }
    if (params.queryType != props.queryType) {
      props.setQueryType(params.queryType);
    }
  }

  return (
    <>
      <S.ControlBox>
        Zoom:<span></span>
        {options.map((item, index) => {
          const queryValue = item.type === 'depth' ? 'depthQueryValue' : 'dateQueryValue';
          const clickParams: clickHandlerParams = {
            queryType: item.type,
            [queryValue]: item.value,
            buttonLabel: item.label,
          };

          return (
            <S.ChartButton
              kind={checkActive(item) ? 'success' : 'secondary'}
              disabled={item.disabled}
              size="small"
              key={index}
              onClick={() => clickHandler(clickParams)}
            >
              {item.label}
            </S.ChartButton>
          );
        })}
      </S.ControlBox>
    </>
  );
};
