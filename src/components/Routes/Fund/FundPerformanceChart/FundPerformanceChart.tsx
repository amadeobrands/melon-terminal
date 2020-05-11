import React from 'react';
import BigNumber from 'bignumber.js';
import { useEffectOnce } from 'react-use';
import { PriceChart } from '~/components/Charts/Nivo/PriceChart';
import { Block } from '~/storybook/Block/Block';
import { useFund } from '~/hooks/useFund';
import { useFundSharePriceQuery, parseSharePriceQueryData } from './FundPerformanceChart.query';
import { SectionTitle } from '~/storybook/Title/Title';
import { ControlBox } from '~/components/Charts/Nivo/ControlBox';

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
      <SectionTitle>Fund Share Price Over Time</SectionTitle>
      {/* <ControlBox         triggerFunction={trigger}
        chartData={data}
        startDate={result.variables.start}
        loading={result.loading}/> */}
      <PriceChart
        triggerFunction={trigger}
        chartData={data}
        startDate={result.variables.start}
        loading={result.loading}
      />
    </Block>
  );
};
