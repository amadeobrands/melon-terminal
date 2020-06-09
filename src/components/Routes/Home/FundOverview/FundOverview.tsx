import React, { useState, useMemo, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { FundOverviewPagination } from '~/components/Routes/Home/FundOverviewPagination/FundOverviewPagination';
import { useFundOverviewQuery, FundProcessed } from '~/components/Routes/Home/FundOverview/FundOverview.query';
import { usePagination } from '~/hooks/usePagination';
import { useAccount } from '~/hooks/useAccount';
import { Grid, GridRow, GridCol } from '~/storybook/Grid/Grid';
import { SectionTitle } from '~/storybook/Title/Title';
import { Button } from '~/components/Form/Button/Button';
import { FormattedDate } from '~/components/Common/FormattedDate/FormattedDate';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import {
  ScrollableTable,
  Table,
  HeaderRow,
  HeaderCell,
  HeaderCellRightAlign,
  BodyCellRightAlign,
  BodyRow,
  BodyCell,
  BodyRowHover,
} from '~/storybook/Table/Table';
import styled from 'styled-components';
import { TokenValueDisplay } from '~/components/Common/TokenValueDisplay/TokenValueDisplay';
import { getNetworkName } from '~/config';
import { useConnectionState } from '~/hooks/useConnectionState';
import { BigNumber } from 'bignumber.js';
import { useVersionQuery } from '~/components/Layout/Version.query';
import { InputWidget } from '~/components/Form/Input/Input';
import { CheckboxItem } from '~/components/Form/Checkbox/Checkbox';
import { Block } from '~/storybook/Block/Block';

interface SortChoice {
  key: keyof typeof sortChoice;
  order: 'asc' | 'desc';
}

interface Filter {
  active: boolean;
  funded: boolean;
  version: boolean;
}

function createSortString(key: keyof FundProcessed) {
  return function sortString(a: FundProcessed, b: FundProcessed): number {
    if (a[key] === b[key]) {
      return 0;
    }

    return a[key] < b[key] ? -1 : 1;
  };
}

function createSortNumberFromString(key: keyof FundProcessed) {
  return function sortNumberFromString(a: FundProcessed, b: FundProcessed): number {
    if (+a[key] === +b[key]) {
      return 0;
    }

    return +a[key] < +b[key] ? -1 : 1;
  };
}

const sortChoice = {
  name: createSortString('name'),
  inception: createSortString('inception'),
  aumEth: createSortNumberFromString('aumEth'),
  aumUsd: createSortNumberFromString('aumEth'),
  sharePrice: createSortNumberFromString('sharePrice'),
  shares: createSortNumberFromString('shares'),
  version: createSortString('version'),
  status: createSortString('status'),
  change: (a: FundProcessed, b: FundProcessed) => b.change.comparedTo(a.change),
};

const useFilteredFunds = (funds: FundProcessed[], search: string, filter: Filter, version: string) => {
  const filtered = useMemo(() => {
    if (!search && !filter.active && !filter.funded && !filter.version) {
      return funds;
    }

    const searchString = search.toLowerCase();
    return funds.filter((fund) => {
      const matches = !search || fund.name.toLowerCase().includes(searchString);
      return (
        matches &&
        (!filter.active || fund.status === 'Active') &&
        (!filter.funded || !new BigNumber(fund.aumEth).isZero()) &&
        (!filter.version || fund.version === version)
      );
    });
  }, [funds, search, filter]);

  return {
    search,
    funds: filtered,
  };
};

const useSortedFunds = (filteredFunds: FundProcessed[]) => {
  const [item, setItem] = useState<SortChoice>({
    key: 'sharePrice',
    order: 'desc',
  });

  const sortedFunds = useMemo(() => {
    if (!filteredFunds) {
      return [];
    }

    const sortedValues = filteredFunds.slice().sort(sortChoice[item.key]);

    return item.order === 'asc' ? sortedValues : sortedValues.reverse();
  }, [filteredFunds, item]);

  return {
    item,
    setItem,
    funds: sortedFunds,
  };
};

const tableHeadings = [
  {
    value: '',
    key: '',
    align: 'left',
  },
  {
    value: 'Name',
    key: 'name',
    align: 'left',
  },
  {
    value: 'Inception',
    key: 'inception',
    align: 'left',
  },
  {
    value: 'Share price',
    key: 'sharePrice',
    align: 'right',
  },
  {
    value: 'Daily change',
    key: 'change',
    align: 'right',
  },
  {
    value: 'AUM [ETH]',
    key: 'aumEth',
    align: 'right',
  },
  {
    value: 'AUM [USD]',
    key: 'aumUsd',
    align: 'right',
  },
  {
    value: '# shares',
    key: 'shares',
    align: 'right',
  },
  {
    value: 'Protocol',
    key: 'version',
    align: 'left',
  },
  {
    value: 'Status',
    key: 'status',
    align: 'left',
  },
];

const ToggleCheckbox = styled(CheckboxItem)`
  margin-top: 0;
  margin-bottom: 0;
  text-align: left;
`;

export const FundOverview: React.FC = () => {
  const connection = useConnectionState();
  const history = useHistory();
  const [funds, query] = useFundOverviewQuery();
  const [version] = useVersionQuery();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>({ active: true, funded: false, version: false });

  const filtered = useFilteredFunds(funds, search, filter, version?.name);
  const sorted = useSortedFunds(filtered.funds);
  const pagination = usePagination(sorted.funds, 15);
  const account = useAccount();
  const prefix = getNetworkName(connection.network);

  useEffect(() => {
    pagination.setOffset(0);
  }, [search]);

  if (query.loading) {
    return (
      <Block>
        <SectionTitle>Melon Fund Universe</SectionTitle>
        <Spinner />
      </Block>
    );
  }

  const handleChangeSortableItem = (key: any) => {
    if (key === sorted.item.key) {
      return sorted.setItem({
        key,
        order: sorted.item.order === 'asc' ? 'desc' : 'asc',
      });
    }

    return sorted.setItem({
      key,
      order: 'asc',
    });
  };

  return (
    <Block>
      <SectionTitle>
        <span>Melon Fund Universe</span>
        {!account.loading && !account.fund && account.address && (
          <Button kind="secondary">
            <Link to="/wallet/setup">Create Your Own Melon Fund</Link>
          </Button>
        )}
      </SectionTitle>
      <Grid>
        <GridRow>
          <GridCol xs={12} sm={6}>
            <InputWidget
              name="search"
              type="text"
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </GridCol>

          <GridCol>
            <ToggleCheckbox
              name="filter"
              label="Active"
              checked={filter.active}
              onChange={() => setFilter({ ...filter, active: !filter.active })}
            />
          </GridCol>
          <GridCol>
            <ToggleCheckbox
              name="funded"
              label="Funded"
              checked={filter.funded}
              onChange={() => setFilter({ ...filter, funded: !filter.funded })}
            />
          </GridCol>
          <GridCol>
            <ToggleCheckbox
              name="version"
              label="Current protocol version"
              checked={filter.version}
              onChange={() => setFilter({ ...filter, version: !filter.version })}
            />
          </GridCol>
        </GridRow>
      </Grid>

      <ScrollableTable>
        <Table>
          <thead>
            <HeaderRow>
              {tableHeadings.map((heading, key) =>
                heading.align === 'left' ? (
                  <HeaderCell
                    hover={true}
                    key={key}
                    onClick={heading.key ? () => handleChangeSortableItem(heading.key) : undefined}
                  >
                    {heading.value}
                    {sorted.item.key === heading.key && (sorted.item.order === 'asc' ? <>&uarr;</> : <>&darr;</>)}
                  </HeaderCell>
                ) : (
                  <HeaderCellRightAlign
                    hover={true}
                    key={key}
                    onClick={heading.key ? () => handleChangeSortableItem(heading.key) : undefined}
                  >
                    {heading.value}
                    {sorted.item.key === heading.key && (sorted.item.order === 'asc' ? <>&uarr;</> : <>&darr;</>)}
                  </HeaderCellRightAlign>
                )
              )}
            </HeaderRow>
          </thead>
          <tbody>
            {pagination.data.length ? (
              pagination.data.map((fund, key) => (
                <BodyRowHover
                  key={fund.id}
                  title={fund.name}
                  onClick={() => history.push(`/${prefix}/fund/${fund.id}`)}
                >
                  <BodyCell>{pagination.offset + (key + 1)}</BodyCell>
                  <BodyCell maxWidth="200px">{fund.name}</BodyCell>
                  <BodyCell>
                    <FormattedDate timestamp={fund.inception} format="yyyy/MM/dd" />
                  </BodyCell>
                  <BodyCellRightAlign>
                    <TokenValueDisplay value={fund.sharePrice} />
                  </BodyCellRightAlign>
                  <BodyCellRightAlign>
                    <FormattedNumber value={fund.change} colorize={true} decimals={2} suffix="%" />
                  </BodyCellRightAlign>
                  <BodyCellRightAlign>
                    <TokenValueDisplay decimals={18} value={fund.aumEth} />
                  </BodyCellRightAlign>
                  <BodyCellRightAlign>
                    <TokenValueDisplay decimals={18} digits={2} value={fund.aumUsd} tooltipDigits={2} />
                  </BodyCellRightAlign>
                  <BodyCellRightAlign>
                    <TokenValueDisplay decimals={18} value={fund.shares} />
                  </BodyCellRightAlign>
                  <BodyCell>{fund.version}</BodyCell>
                  <BodyCell>{fund.status}</BodyCell>
                </BodyRowHover>
              ))
            ) : (
              <BodyRow>
                <BodyCell colSpan={12}>No records to display</BodyCell>
              </BodyRow>
            )}
          </tbody>
        </Table>
      </ScrollableTable>
      <FundOverviewPagination
        offset={pagination.offset}
        setOffset={pagination.setOffset}
        funds={filtered.funds.length}
      />
    </Block>
  );
};
