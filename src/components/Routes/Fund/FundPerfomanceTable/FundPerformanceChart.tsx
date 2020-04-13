import React from 'react';
import BigNumber from 'bignumber.js';
import { Nivo } from '~/components/Charts/Nivo/Nivo';
import { useFundSharePriceQuery, parseSharePriceQueryData } from './FundPerformanceChart.query';
import { Block } from '~/storybook/Block/Block';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { Button } from '~/storybook/Button/Button';

export const FundPerformanceChart: React.FC = () => {

  const [loadSharePriceData, {called, loading, data}] = useFundSharePriceQuery()
  
  if (called && loading){
    return (
      <Block>
        <Spinner />
      </Block>
    );
  }

  if (!called){
    return (
      <Block>
        <Button onClick={() => loadSharePriceData()}>X</Button>
      </Block>
    )
  }

  const parsedData = parseSharePriceQueryData(data.funds, dummyDate)

  return (<Block><Nivo triggerFunction={loadSharePriceData} chartData={parsedData}/></Block>);
};
