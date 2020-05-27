import React from 'react';
import * as S from '~/components/Charts/PriceChart/PriceChart.styles';
import { Serie } from '~/components/Charts/ZoomControl/ZoomControl';
import ReactApexChart from 'react-apexcharts';

export interface NivoProps {
  data: Serie[];
  generator: (start: number, end: number) => Serie[];
}

export const Nivo: React.FC<NivoProps> = ({ data, generator }) => {
  // console.log(generator, 'in the component')
  const startDate = 293048329; // hard coded change this and endDate
  const endDate = 2390483290;
  const otherData = generator(startDate, endDate);

  return (
    <S.Chart>
      {/* add button/input to zoom in/select date ranges to manipulate the data object that's passed */}
      <ReactApexChart series={data} />
    </S.Chart>
  );
};
