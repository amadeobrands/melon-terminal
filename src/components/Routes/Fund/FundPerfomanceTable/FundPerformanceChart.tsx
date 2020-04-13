import React from 'react';
import BigNumber from 'bignumber.js';
import { useEffectOnce } from 'react-use';
import { Nivo } from '~/components/Charts/Nivo/Nivo';
import { Block } from '~/storybook/Block/Block';
import { useFund } from '~/hooks/useFund';
import { useFundSharePriceQuery, parseSharePriceQueryData } from './FundPerformanceChart.query';

export const FundPerformanceChart: React.FC = () => {
  const fund = useFund();
  const [load, result] = useFundSharePriceQuery();

  const trigger = React.useCallback(
    (start: number) => {
      load({
        variables: {
          start: start,
          funds: [fund.address!.toLowerCase()],
        },
      });
    },
    [load, fund]
  );

  const data = React.useMemo(() => {
    if (!result.data) {
      return undefined;
    }

    return parseSharePriceQueryData(result.data.funds, new BigNumber(result.variables.start));
  }, [result.data]);

  useEffectOnce(() => trigger(0));

  if (!result.called) {
    return null;
  }

  return (
    <Block>
      <Nivo triggerFunction={trigger} chartData={data} startDate={result.variables.start} loading={result.loading} />
    </Block>
  );
};
