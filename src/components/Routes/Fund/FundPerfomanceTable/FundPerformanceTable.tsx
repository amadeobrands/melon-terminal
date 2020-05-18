import React, { Fragment, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useEnvironment } from '~/hooks/useEnvironment';
import {
  ScrollableTable,
  Table,
  HeaderCell,
  HeaderRow,
  BodyCell,
  BodyRow,
  HeaderCellRightAlign,
  BodyCellRightAlign,
} from '~/storybook/Table/Table';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { Block } from '~/storybook/Block/Block';
import { SectionTitle } from '~/storybook/Title/Title';
import { useFundPerformanceQuery } from './FundPerformance.query';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { SelectWidget } from '~/components/Form/Select/Select';
import { Button } from '~/components/Form/Button/Button.styles';

export interface FundPerformanceTableProps {
  address: string;
}

const TableDescription = styled.span`
  text-align: right;
  color: ${(props) => props.theme.mainColors.secondaryDark};
  font-size: ${(props) => props.theme.fontSizes.s};
  margin-bottom: ${(props) => props.theme.spaceUnits.m};
  margin-left: 0;
`;

export const FundPerformanceTable: React.FC<FundPerformanceTableProps> = ({ address }) => {
  const excludedTokens = ['USDC', 'ENG'];
  const startingTokens = ['WETH', 'DAI', 'WBTC'];

  const tokens = useEnvironment()!
    .tokens.filter((token) => !excludedTokens.includes(token.symbol))
    .map((token) => ({
      label: token.symbol,
      value: token.symbol,
    }));

  const [selectedTokens, setSelectedTokens] = useState(() =>
    tokens.filter((token) => startingTokens.includes(token.label)).map((token) => token.label)
  );

  const unselectedTokens = useMemo(() => {
    return tokens.filter((token) => !selectedTokens.includes(token.label));
  }, [selectedTokens]);

  const [fund, assets, query] = useFundPerformanceQuery(address, selectedTokens);

  function toggleTokenSelection(symbol: string) {
    if (!symbol) {
      return;
    }
    if (selectedTokens.includes(symbol)) {
      setSelectedTokens(selectedTokens.filter((token) => token !== symbol));
    } else {
      setSelectedTokens(selectedTokens.concat([symbol]));
    }
  }

  if (query.loading && !assets) {
    return (
      <Block>
        <SectionTitle>Fund Performance and Benchmarks</SectionTitle>
        <Spinner />
      </Block>
    );
  }

  const items = assets && selectedTokens.filter((symbol) => assets[symbol]).map((symbol) => assets[symbol]);

  return (
    <Block>
      <SectionTitle>Fund Performance and Benchmarks</SectionTitle>
      {items && items.length && fund && (
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
                <HeaderCellRightAlign>{null}</HeaderCellRightAlign>
              </HeaderRow>
            </thead>

            <tbody>
              {(items ?? []).map((item) => (
                <Fragment key={item.symbol}>
                  <BodyRow>
                    <BodyCell>
                      {fund.name} vs. {item.symbol}
                    </BodyCell>
                    <BodyCellRightAlign>
                      <FormattedNumber
                        value={fund.qtdReturn.minus(item.qtdReturn)}
                        colorize={true}
                        decimals={2}
                        suffix="%"
                      />
                    </BodyCellRightAlign>
                    <BodyCellRightAlign>
                      <FormattedNumber
                        value={fund.ytdReturn.minus(item.ytdReturn)}
                        colorize={true}
                        decimals={2}
                        suffix="%"
                      />
                    </BodyCellRightAlign>
                    <BodyCellRightAlign>
                      <FormattedNumber
                        value={fund.oneMonthReturn.minus(item.oneMonthReturn)}
                        colorize={true}
                        decimals={2}
                        suffix="%"
                      />
                    </BodyCellRightAlign>
                    <BodyCellRightAlign>
                      <FormattedNumber
                        value={fund.sixMonthReturn.minus(item.sixMonthReturn)}
                        colorize={true}
                        decimals={2}
                        suffix="%"
                      />
                    </BodyCellRightAlign>
                    <BodyCellRightAlign>
                      <FormattedNumber
                        value={fund.oneYearReturn.minus(item.oneYearReturn)}
                        colorize={true}
                        decimals={2}
                        suffix="%"
                      />
                    </BodyCellRightAlign>
                    <BodyCellRightAlign>
                      <FormattedNumber
                        value={fund.returnSinceInception.minus(item.returnSinceInception)}
                        colorize={true}
                        decimals={2}
                        suffix="%"
                      />
                    </BodyCellRightAlign>
                    <BodyCell>
                      <Button size="extrasmall" onClick={() => toggleTokenSelection(item.symbol)}>
                        X
                      </Button>
                    </BodyCell>
                  </BodyRow>
                </Fragment>
              ))}
            </tbody>
          </Table>
        </ScrollableTable>
      )}
      {unselectedTokens.length > 1 && (
        <SelectWidget
          name="token"
          placeholder="Select an asset to compare"
          options={unselectedTokens}
          onChange={(value) => value && toggleTokenSelection((value as any).value)}
          value={null}
        />
      )}
      <TableDescription>Fund share price and assets benchmarked against ETH</TableDescription>
    </Block>
  );
  // }
};
