import React from 'react';
import { useQuery } from 'react-query';
import { Block } from '~/storybook/Block/Block';
import { useFund } from '~/hooks/useFund';
import { SectionTitle } from '~/storybook/Title/Title';
import { SimpleZoomControl } from '~/components/Charts/Nivo/SimpleZoomControl';
import { fetchPricesFromService } from './NewSerivceQuery';
import { Spinner } from '~/storybook/Spinner/Spinner';

export const NewFundPerformanceChart: React.FC = () => {
  const fund = useFund();

  // TODO: find services's january date to use as the second term in the ternary for fundCreationTime
  const fundCreationTime = fund.creationTime ? fund.creationTime.getTime() / 1000 : 1589241599;

  // TODO: find suitable fallback for second term in ternary
  const address = fund.address ? fund.address.toLowerCase() : 'sdfjklsd';

  const [from, setFrom] = React.useState(fundCreationTime);
  const { data, error, isFetching } = useQuery(['prices', from, address], fetchPricesFromService);

  const trigger = (from: number) => setFrom(from);

  return (
    <Block>
      <SectionTitle>Fund Share Price Over Time</SectionTitle>
      {error ? (
        <SectionTitle>Test</SectionTitle>
      ) : data ? (
        <SimpleZoomControl
          fundCreation={fundCreationTime}
          triggerFunction={trigger}
          chartData={data}
          startDate={from}
          loading={isFetching}
        />
      ) : (
        <Spinner />
      )}
    </Block>
  );
};
