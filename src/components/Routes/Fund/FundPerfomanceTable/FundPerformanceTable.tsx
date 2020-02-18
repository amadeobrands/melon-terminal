import React, { Fragment, useState } from 'react';
import {
  ScrollableTable,
  Table,
  HeaderCell,
  HeaderRow,
  BodyCell,
  BodyRow,
  HeaderCellRightAlign,
  BodyCellRightAlign,
} from '~/storybook/components/Table/Table';
import { Spinner } from '~/storybook/components/Spinner/Spinner';
import { Block } from '~/storybook/components/Block/Block';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { useFundPerformanceQuery } from './FundPerformance.query';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { LabelSideInfo } from '~/storybook/components/Label/Label';
import styled from 'styled-components';

export interface FundPerformanceTableProps {
  address: string;
}

const TableDescription = styled(LabelSideInfo)`
  font-size: ${props => props.theme.fontSizes.s};
`;

export const FundPerformanceTable: React.FC<FundPerformanceTableProps> = ({ address }) => {
  const [fund, assets, query] = useFundPerformanceQuery(address, ['WBTC', 'WETH', 'DAI']);

  if (query.loading && !assets) {
    return (
      <Block>
        <SectionTitle>Performance History</SectionTitle>
        <Spinner />
      </Block>
    );
  }

  if (!fund) {
    return null;
  }

  return (
    <Block>
      <SectionTitle>Relative Fund Performance</SectionTitle>

      <ScrollableTable>
        <Table>
          <thead>
            <HeaderRow>
              <HeaderCell>{null}</HeaderCell>
              <HeaderCellRightAlign>QTD</HeaderCellRightAlign>
              <HeaderCellRightAlign>YTD</HeaderCellRightAlign>
              <HeaderCellRightAlign>1-Month</HeaderCellRightAlign>
              <HeaderCellRightAlign>6-Month</HeaderCellRightAlign>
              <HeaderCellRightAlign>1-Year</HeaderCellRightAlign>
              <HeaderCellRightAlign>Since Fund Inception</HeaderCellRightAlign>
            </HeaderRow>
          </thead>

          <tbody>
            {(assets ?? []).map(asset => (
              <Fragment key={asset.symbol}>
                <BodyRow>
                  <BodyCell>
                    {fund.name} vs. {asset.symbol}
                  </BodyCell>
                  <BodyCellRightAlign>
                    <FormattedNumber
                      value={fund.qtdReturn.minus(asset.qtdReturn)}
                      colorize={true}
                      decimals={2}
                      suffix="%"
                    />
                  </BodyCellRightAlign>
                  <BodyCellRightAlign>
                    <FormattedNumber
                      value={fund.ytdReturn.minus(asset.ytdReturn)}
                      colorize={true}
                      decimals={2}
                      suffix="%"
                    />
                  </BodyCellRightAlign>
                  <BodyCellRightAlign>
                    <FormattedNumber
                      value={fund.oneMonthReturn.minus(asset.oneMonthReturn)}
                      colorize={true}
                      decimals={2}
                      suffix="%"
                    />
                  </BodyCellRightAlign>
                  <BodyCellRightAlign>
                    <FormattedNumber
                      value={fund.sixMonthReturn.minus(asset.sixMonthReturn)}
                      colorize={true}
                      decimals={2}
                      suffix="%"
                    />
                  </BodyCellRightAlign>
                  <BodyCellRightAlign>
                    <FormattedNumber
                      value={fund.oneYearReturn.minus(asset.oneYearReturn)}
                      colorize={true}
                      decimals={2}
                      suffix="%"
                    />
                  </BodyCellRightAlign>
                  <BodyCellRightAlign>
                    <FormattedNumber
                      value={fund.returnSinceInception.minus(asset.returnSinceInception)}
                      colorize={true}
                      decimals={2}
                      suffix="%"
                    />
                  </BodyCellRightAlign>
                </BodyRow>
              </Fragment>
            ))}
          </tbody>
        </Table>
      </ScrollableTable>

      <TableDescription>Fund share price and assets benchmarked against ETH</TableDescription>
    </Block>
  );
};
