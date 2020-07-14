import BigNumber from 'bignumber.js';
import React from 'react';
import { useHistory } from 'react-router';
import {
  Column,
  TableOptions,
  useGlobalFilter,
  usePagination,
  useRowState,
  useSortBy,
  useTable,
  FilterValue,
  IdType,
  Row,
} from 'react-table';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { CommonTable, ScrollableTable } from '~/components/Common/Table/Table';
import { TokenValueDisplay } from '~/components/Common/TokenValueDisplay/TokenValueDisplay';
import { useRatesOrThrow } from '~/components/Contexts/Rates/Rates';
import { Button } from '~/components/Form/Button/Button';
import { useEnvironment } from '~/hooks/useEnvironment';
import { Block } from '~/storybook/Block/Block';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { SectionTitle } from '~/storybook/Title/Title';
import { TokenValue } from '~/TokenValue';
import { calculateChangeFromSharePrice } from '~/utils/calculateChangeFromSharePrice';
import { useFundOverviewQuery } from './FundOverview.query';
import { getNetworkName } from '~/config';
import { useConnectionState } from '~/hooks/useConnectionState';
import {
  GiCaesar,
  GiStorkDelivery,
  GiPalisade,
  GiMedusaHead,
  GiIcarus,
  GiPegasus,
  GiSpartanHelmet,
  GiPadlock,
  GiWingfoot,
  GiChariot,
} from 'react-icons/gi';
import { fromTokenBaseUnit } from '~/utils/fromTokenBaseUnit';
import { TableGlobalFilter } from './FundFilters';
import { FundSharePriceChart } from './FundSharePriceChart';
import { Icons, IconName } from '~/storybook/Icons/Icons';
import { Tooltip } from '~/storybook/Tooltip/Tooltip';
import { startOfMonth, startOfYear, getUnixTime } from 'date-fns';
import { sameAddress } from '@melonproject/melonjs';

export type RowData = {
  rank: number;
  age: number;
  address: string;
  name: string;
  inception: Date;
  sharePrice: BigNumber;
  returnSinceInception: BigNumber;
  returnYTD: BigNumber;
  returnMTD: BigNumber;
  returnSinceYesterday: BigNumber;
  holdings: TokenValue[];
  eth: BigNumber;
  usd: BigNumber;
  isShutdown: boolean;
  version: string;
  investments: number;
  userWhitelist: boolean;
  closed: boolean;
  top5AUM: boolean;
  topAUM: boolean;
  top5MTD: boolean;
  topMTD: boolean;
  top5YTD: boolean;
  topYTD: boolean;
  top5Recent: boolean;
  topRecent: boolean;
  top5Investments: boolean;
  topInvestments: boolean;
  largeFund: boolean;
  tinyFund: boolean;
  underperformingFund: boolean;
};

const coloredIcons = ['MLN', 'REN', 'ZRX'];

const columns = (prefix: string, history: any): Column<RowData>[] => {
  return [
    {
      Header: 'Name',
      accessor: 'name',
      filter: 'text',
      headerProps: {
        style: {
          textAlign: 'left',
        },
      },
      cellProps: {
        style: {
          textAlign: 'left',
          verticalAlign: 'top',
          maxWidth: '250px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      },

      Cell: (cell) => (
        <span>
          {cell.value}
          <br />
          {cell.row.original.top5AUM && (
            <Tooltip value="Top 5 fund by AUM">
              <GiCaesar color="rgb(133,213,202)" size={20} />
            </Tooltip>
          )}{' '}
          {cell.row.original.top5YTD && (
            <Tooltip value="Top 5 performance YTD">
              <GiSpartanHelmet color="rgb(133,213,202)" size={20} />
            </Tooltip>
          )}{' '}
          {cell.row.original.top5MTD && (
            <Tooltip value="Top 5 performance MTD">
              <GiPegasus color="rgb(133,213,202)" size={20} />
            </Tooltip>
          )}{' '}
          {cell.row.original.top5Recent && (
            <Tooltip value="5 most recent funds">
              <GiStorkDelivery color="rgb(133,213,202)" size={20} />
            </Tooltip>
          )}{' '}
          {cell.row.original.top5Investments && (
            <Tooltip value="5 funds with most investors">
              <GiChariot color="rgb(133,213,202)" size={20} />
            </Tooltip>
          )}{' '}
          {cell.row.original.largeFund && (
            <Tooltip value="Large fund (> 100 ETH)">
              <GiWingfoot color="rgb(133,213,202)" size={20} />
            </Tooltip>
          )}{' '}
          {cell.row.original.underperformingFund && (
            <Tooltip value="Underperforming fund">
              <GiIcarus color="rgb(255,141,136)" size={20} />
            </Tooltip>
          )}{' '}
          {cell.row.original.tinyFund && (
            <Tooltip value="Tiny fund (< 1 ETH)">
              <GiMedusaHead color="rgb(255,141,136)" size={20} />
            </Tooltip>
          )}{' '}
          {cell.row.original.userWhitelist && (
            <Tooltip value="Fund operates a user whitelist">
              <GiPalisade color="grey" size={20} />
            </Tooltip>
          )}{' '}
          {cell.row.original.closed && (
            <Tooltip value="Fund is closed for investment">
              <GiPadlock color="grey" size={20} />
            </Tooltip>
          )}{' '}
        </span>
      ),
    },

    {
      Header: 'Age',
      accessor: 'age',
      sortType: 'basic',
    },

    {
      Header: 'AUM',
      accessor: 'eth',
      sortType: (rowA, rowB, columnId) => {
        const a = new BigNumber(rowA.values[columnId]);
        const b = new BigNumber(rowB.values[columnId]);
        return b.comparedTo(a);
      },
      Cell: (cell) => (
        <>
          <FormattedNumber value={fromTokenBaseUnit(cell.row.original.usd, 18)} decimals={0} prefix="$" />
          <br />
          <TokenValueDisplay value={cell.value} decimals={18} digits={0} symbol="Ξ" prefixSymbol={true} />
        </>
      ),
      cellProps: {
        style: {
          textAlign: 'right',
          verticalAlign: 'top',
        },
      },
      headerProps: {
        style: {
          textAlign: 'right',
        },
      },
    },
    {
      Header: 'Top 5 assets',
      accessor: 'holdings',
      disableSortBy: true,
      Cell: (cell) =>
        !new BigNumber(cell.row.original.eth).isZero() ? (
          cell.value
            .filter((holding) => !holding?.value?.isZero())
            .filter((_, index) => index < 5)
            .map((holding) => (
              <Tooltip
                value={`${holding.token.symbol}: ${holding.value
                  ?.dividedBy(cell.row.original.eth)
                  .multipliedBy(100)
                  .toFixed(2)}%`}
              >
                <Icons
                  name={holding.token.symbol as IconName}
                  size="medium"
                  colored={coloredIcons.some((icon) => icon === holding.token.symbol)}
                />{' '}
              </Tooltip>
            ))
        ) : (
          <></>
        ),

      cellProps: {
        style: {
          textAlign: 'left',
          // maxWidth: '120px',
          verticalAlign: 'top',
        },
      },
      headerProps: {
        style: {
          textAlign: 'left',
        },
      },
    },
    {
      Header: (
        <>
          Since
          <br />
          inception
        </>
      ),
      accessor: 'returnSinceInception',
      sortType: (rowA, rowB, columnId) => {
        const a = new BigNumber(rowA.values[columnId]);
        const b = new BigNumber(rowB.values[columnId]);
        return b.comparedTo(a);
      },
      Cell: (cell) => <FormattedNumber value={cell.value} colorize={true} decimals={2} suffix="%" />,
      cellProps: {
        style: {
          textAlign: 'right',
          verticalAlign: 'top',
        },
      },
      headerProps: {
        style: {
          textAlign: 'right',
          maxWidth: '100px',
        },
      },
    },
    {
      Header: 'YTD',
      accessor: 'returnYTD',
      sortType: (rowA, rowB, columnId) => {
        const a = new BigNumber(rowA.values[columnId]);
        const b = new BigNumber(rowB.values[columnId]);
        return b.comparedTo(a);
      },
      Cell: (cell) => <FormattedNumber value={cell.value} colorize={true} decimals={2} suffix="%" />,
      cellProps: {
        style: {
          textAlign: 'right',
          verticalAlign: 'top',
        },
      },
      headerProps: {
        style: {
          textAlign: 'right',
        },
      },
    },
    {
      Header: 'MTD',
      accessor: 'returnMTD',
      sortType: (rowA, rowB, columnId) => {
        const a = new BigNumber(rowA.values[columnId]);
        const b = new BigNumber(rowB.values[columnId]);
        return b.comparedTo(a);
      },
      Cell: (cell) => <FormattedNumber value={cell.value} colorize={true} decimals={2} suffix="%" />,
      cellProps: {
        style: {
          textAlign: 'right',
          verticalAlign: 'top',
        },
      },
      headerProps: {
        style: {
          textAlign: 'right',
        },
      },
    },
    {
      Header: '1 day',
      accessor: 'returnSinceYesterday',
      sortType: (rowA, rowB, columnId) => {
        const a = new BigNumber(rowA.values[columnId]);
        const b = new BigNumber(rowB.values[columnId]);
        return b.comparedTo(a);
      },
      Cell: (cell) => <FormattedNumber value={cell.value} colorize={true} decimals={2} suffix="%" />,
      cellProps: {
        style: {
          textAlign: 'right',
          verticalAlign: 'top',
        },
      },
      headerProps: {
        style: {
          textAlign: 'right',
        },
      },
    },
    {
      Header: 'Share price',
      accessor: 'sharePrice',
      disableSortBy: true,
      Cell: (cell) => <FundSharePriceChart address={cell.row.original.address} />,
      cellProps: {
        style: {
          textAlign: 'right',
          verticalAlign: 'middle',
          alignItems: 'center',
          paddingTop: '5px',
          marginTop: 0,
          height: '80px',
        },
      },
      headerProps: {
        style: {
          textAlign: 'center',
        },
      },
    },

    {
      Header: 'Invest',
      accessor: 'address',
      disableSortBy: true,
      Cell: (cell) =>
        cell.row.original.userWhitelist || cell.row.original.closed ? (
          // <GiPadlock size="2rem" />
          <></>
        ) : (
          <Button
            kind="secondary"
            size="small"
            onClick={() => history.push(`/${prefix}/fund/${cell.row.original.address}/invest`)}
          >
            Invest
          </Button>
        ),
      cellProps: {
        style: {
          textAlign: 'center',
          verticalAlign: 'middle',
          height: '80px',
        },
      },
    },
  ];
};

export function useTableData() {
  const today = new Date();
  const startOfMonthDate = new BigNumber(getUnixTime(startOfMonth(today)));
  const startOfYearDate = new BigNumber(getUnixTime(startOfYear(today)));

  const result = useFundOverviewQuery(startOfMonthDate, startOfYearDate);
  const rates = useRatesOrThrow();
  const environment = useEnvironment()!;
  const version = environment?.deployment.melon.addr.Version;

  const data = React.useMemo(() => {
    const funds = result.data?.funds ?? [];

    return funds.map<RowData>((item, index) => {
      // const holdings = tokens.map((token) => {
      //   const tokenHolding = item.holdings.find((holding) => holding.asset.id === token.address);
      //   const quantity = tokenHolding ? tokenHolding.assetGav : 0;
      //   return new TokenValue(token, quantity);
      // });

      const holdings = item.holdings.map((holding) => {
        const token = environment.getToken(holding.asset.symbol);
        return new TokenValue(token, holding.assetGav);
      });

      const eth = new BigNumber(item.gav);
      const usd = new BigNumber(item.gav).multipliedBy(rates.ETH.USD);

      const largeFund = eth.isGreaterThan('1e20');
      const tinyFund = eth.isLessThan('1e18');

      const returnSinceInception = calculateChangeFromSharePrice(item.sharePrice, new BigNumber('1e18'));

      const underperformingFund = returnSinceInception.isLessThan(-20);

      const returnYTD = calculateChangeFromSharePrice(
        item.calculationsHistory[0]?.sharePrice,
        item.yearStartPx[0]?.sharePrice
      );

      const returnMTD = calculateChangeFromSharePrice(
        item.calculationsHistory[0]?.sharePrice,
        item.monthStartPx[0]?.sharePrice
      );

      const returnSinceYesterday = calculateChangeFromSharePrice(
        item.calculationsHistory[0]?.sharePrice,
        item.calculationsHistory[1]?.sharePrice
      );

      const userWhitelist = !!item.policyManager.policies.find((policy) => policy.identifier === 'UserWhitelist');
      const closed = item.isShutdown || !sameAddress(item.version?.id, version);

      const investments = item.investments.length;

      // badges
      const top5AUM = index < 5 ? true : false;
      const topAUM = index === 0 ? true : false;
      const top5MTD = false;
      const topMTD = false;
      const top5YTD = false;
      const topYTD = false;
      const top5Recent = false;
      const topRecent = false;
      const top5Investments = false;
      const topInvestments = false;

      const age = (Date.now() / 1000 - item.createdAt) / (24 * 60 * 60);

      return {
        rank: index + 1,
        age,
        address: item.id,
        name: item.name,
        inception: new Date(item.createdAt * 1000),
        sharePrice: item.sharePrice,
        returnSinceInception,
        returnYTD,
        returnMTD,
        returnSinceYesterday,
        holdings,
        eth,
        usd,
        isShutdown: item.isShutdown,
        version: item.version.name,
        userWhitelist,
        investments,
        closed,
        top5AUM,
        topAUM,
        top5MTD,
        topMTD,
        top5YTD,
        topYTD,
        top5Recent,
        topRecent,
        top5Investments,
        topInvestments,
        largeFund,
        tinyFund,
        underperformingFund,
      };
    });
  }, [result.data]);

  const d1 = React.useMemo(() => {
    return data
      .sort((a, b) => b.returnMTD.comparedTo(a.returnMTD))
      .map((fund, index) => {
        return { ...fund, ...(index < 5 && { top5MTD: true }), ...(index === 0 && { topMTD: true }) };
      });
  }, [data]);

  const d2 = React.useMemo(() => {
    return d1
      .sort((a, b) => b.returnYTD.comparedTo(a.returnYTD))
      .map((fund, index) => {
        return { ...fund, ...(index < 5 && { top5YTD: true }), ...(index === 0 && { topYTD: true }) };
      });
  }, [d1]);

  const d3 = React.useMemo(() => {
    return d2
      .sort((a, b) => a.age - b.age)
      .map((fund, index) => {
        return { ...fund, ...(index < 5 && { top5Recent: true }), ...(index === 0 && { topRecent: true }) };
      });
  }, [d2]);

  const d4 = React.useMemo(() => {
    return d3
      .sort((a, b) => b.investments - a.investments)
      .map((fund, index) => {
        return { ...fund, ...(index < 5 && { top5Investments: true }), ...(index === 0 && { topInvestments: true }) };
      });
  }, [d3]);

  return React.useMemo(() => d4.sort((a, b) => b.eth.comparedTo(a.eth)), [d4]);
}

export const FundOverview: React.FC = () => {
  const data = useTableData();
  const history = useHistory();
  const connection = useConnectionState();

  const prefix = getNetworkName(connection.network);

  const filterTypes = React.useMemo(
    () => ({
      custom: (rows: Row<RowData>[], ids: IdType<string>, filterValue: FilterValue) => {
        if (filterValue == null) {
          return rows;
        }

        return rows
          .filter((row) => {
            return filterValue.search
              ? row.values.name.toLowerCase().startsWith(filterValue.search.toLowerCase())
              : true;
          })
          .filter((row) => {
            if (!filterValue.aum?.length) {
              return true;
            }

            const sizes = filterValue.aum.map((value: string) => {
              const [min, max] = value.split('-');
              return { min, max };
            });

            return sizes.some(
              (size: any) =>
                !!(
                  row.values.eth.dividedBy('1e18').isGreaterThanOrEqualTo(size.min) &&
                  row.values.eth.dividedBy('1e18').isLessThan(size.max)
                )
            );
          })
          .filter((row) => {
            if (!filterValue.age?.length) {
              return true;
            }

            const ages = filterValue.age.map((value: string) => {
              const [min, max] = value.split('-');
              return { min, max };
            });

            return ages.some((age: any) => !!(row.values.age >= age.min && row.values.age < age.max));
          })
          .filter((row) => {
            if (!filterValue.assets?.length) {
              return true;
            }

            if (!row.values.holdings?.length) {
              return false;
            }

            return filterValue.assets.every((asset: string) =>
              row.values.holdings.some(
                (holding: TokenValue) => holding.token.symbol === asset && !holding.value?.isZero()
              )
            );
          })
          .filter((row) => {
            if (!filterValue.sinceInception?.length) {
              return true;
            }

            const returns = filterValue.sinceInception.map((value: string) => {
              const [min, max] = value.split('/');
              return { min: parseFloat(min), max: parseFloat(max) };
            });

            return returns.some(
              (ret: any) =>
                !!(
                  row.values.returnSinceInception.isGreaterThanOrEqualTo(ret.min) &&
                  row.values.returnSinceInception.isLessThan(ret.max)
                )
            );
          })
          .filter((row) => {
            if (!filterValue.ytd?.length) {
              return true;
            }

            const returns = filterValue.ytd.map((value: string) => {
              const [min, max] = value.split('/');
              return { min: parseFloat(min), max: parseFloat(max) };
            });

            return returns.some(
              (ret: any) =>
                !!(row.values.returnYTD.isGreaterThanOrEqualTo(ret.min) && row.values.returnYTD.isLessThan(ret.max))
            );
          })
          .filter((row) => {
            if (!filterValue.sinceYesterday?.length) {
              return true;
            }

            const returns = filterValue.sinceYesterday.map((value: string) => {
              const [min, max] = value.split('/');
              return { min: parseFloat(min), max: parseFloat(max) };
            });

            return returns.some(
              (ret: any) =>
                !!(
                  row.values.returnSinceYesterday.isGreaterThanOrEqualTo(ret.min) &&
                  row.values.returnSinceYesterday.isLessThan(ret.max)
                )
            );
          })
          .filter((row) => {
            if (!filterValue.badges?.length) {
              return true;
            }

            return filterValue.badges.every((badge: string) => !!(row.original as any)[badge]);
          });
      },
    }),
    []
  );

  const options: TableOptions<RowData> = React.useMemo(
    () => ({
      columns: columns(prefix || '', history),
      initialState: {
        hiddenColumns: ['age', 'top20AUM'],
        pageSize: 10,
      },
      data,
      rowProps: (row) => ({ onClick: () => history.push(`/${prefix}/fund/${row.original.address}`) }),
      filterTypes,
      globalFilter: 'custom',
    }),
    [data, history]
  );

  const table = useTable(options, useGlobalFilter, useSortBy, usePagination, useRowState);
  const filter = <TableGlobalFilter table={table} />;

  if (data.length === 0) {
    return (
      <Block>
        <SectionTitle>Melon Fund Universe</SectionTitle>
        <Spinner />
      </Block>
    );
  }

  return (
    <>
      <Block>
        <SectionTitle>Melon Fund Universe</SectionTitle>
        <ScrollableTable>
          <CommonTable table={table} globalFilter={filter} />
        </ScrollableTable>
      </Block>
    </>
  );
};
