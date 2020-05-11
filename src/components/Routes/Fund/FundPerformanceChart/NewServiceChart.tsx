import React from 'react';
import BigNumber from 'bignumber.js';
import { useEffectOnce } from 'react-use';
import { useQuery } from 'react-query';

import { PriceChart } from '~/components/Charts/Nivo/PriceChart';
import { Block } from '~/storybook/Block/Block';
import { useFund } from '~/hooks/useFund';
import { useFundSharePriceQuery, parseSharePriceQueryData } from './FundPerformanceChart.query';
import { SectionTitle } from '~/storybook/Title/Title';
import { ControlBox } from '~/components/Charts/Nivo/ControlBox';
import { fetchPricesFromService } from './NewSerivceQuery';
import { startOfDay, subMonths } from 'date-fns';
import { findCorrectFromTime } from '~/utils/priceServiceDates';

export const NewFundPerformanceChart: React.FC = () => {
  const fund = useFund();
  const today = React.useMemo(() => startOfDay(new Date()), []);

  // ***DATES***
  // from - first, oldest date for which you'll show a price
  // required by query - changes dynamically
  // to - last, most recent date for which you'll show a price
  // required by query - changes dynamically
  // startDate - fund's inception, used to display buttons
  // required by Contol Box - only set once
  const startDate = fund.creationTime ? fund.creationTime.getTime() / 1000 : 1589241599;

  const address = fund.address ? fund.address.toLowerCase() : 'sdfjklsd';
  const [from, setFrom] = React.useState(startDate);

  console.log(from, startDate);

  const { data, error, isFetching } = useQuery(['prices', from, address], fetchPricesFromService);

  const trigger = (from: number) => setFrom(from);

  return (
    <Block>
      <SectionTitle>Fund Share Price Over Time</SectionTitle>
      <ControlBox triggerFunction={trigger} chartData={data} startDate={startDate} loading={isFetching} />
    </Block>
  );
};
