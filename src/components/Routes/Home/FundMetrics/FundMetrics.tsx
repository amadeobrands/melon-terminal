import React from 'react';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { useTokenRates } from '~/components/Contexts/Rates/Rates';
import { useFundMetricsQuery } from '~/components/Routes/Home/FundMetrics/FundMetrics.query';
import { Dictionary, DictionaryData, DictionaryEntry, DictionaryLabel } from '~/storybook/Dictionary/Dictionary';
import { Grid, GridCol, GridRow } from '~/storybook/Grid/Grid';
import { Spinner } from '~/storybook/Spinner/Spinner';
import { SectionTitle } from '~/storybook/Title/Title';
import { fromTokenBaseUnit } from '~/utils/fromTokenBaseUnit';

export const FundMetrics: React.FC = () => {
  const [metrics, metricsQuery] = useFundMetricsQuery();
  const rates = useTokenRates('ETH');

  if (metricsQuery.loading || !metrics) {
    return (
      <Dictionary>
        <SectionTitle>Network Metrics</SectionTitle>
        <Spinner />
      </Dictionary>
    );
  }

  const networkGav = fromTokenBaseUnit(metrics.state?.networkGav, 18);
  const activeInvestors = metrics.state?.activeInvestors;
  const nonActiveInvestors = metrics.state?.nonActiveInvestors;
  const activeFunds = metrics.state?.activeFunds;
  const nonActiveFunds = metrics.state?.nonActiveFunds;
  const allInvestments = metrics.state?.allInvestments;

  const mlnPrice = networkGav.multipliedBy(rates.USD);

  return (
    <Dictionary>
      <SectionTitle>Network Metrics</SectionTitle>
      <Grid>
        <GridRow justify="space-around">
          <GridCol xs={12} sm={4}>
            {activeFunds && nonActiveFunds && (
              <DictionaryEntry>
                <DictionaryLabel>Number of funds</DictionaryLabel>
                <DictionaryData textAlign="right">
                  {parseInt(activeFunds ?? '0', 10) + parseInt(nonActiveFunds ?? '0', 10)}
                </DictionaryData>
              </DictionaryEntry>
            )}
            {activeInvestors && nonActiveInvestors && (
              <DictionaryEntry>
                <DictionaryLabel>Number of investors</DictionaryLabel>
                <DictionaryData textAlign="right">
                  {parseInt(activeInvestors ?? '0', 10) + parseInt(nonActiveInvestors ?? '0', 10)}
                </DictionaryData>
              </DictionaryEntry>
            )}
            {allInvestments && (
              <DictionaryEntry>
                <DictionaryLabel>Number of investments</DictionaryLabel>
                <DictionaryData textAlign="right">{parseInt(allInvestments ?? '0', 10)}</DictionaryData>
              </DictionaryEntry>
            )}
          </GridCol>
          <GridCol xs={12} sm={5}>
            <DictionaryEntry>
              <DictionaryLabel>Total AUM (in ETH)</DictionaryLabel>
              <DictionaryData textAlign="right">
                <FormattedNumber tooltip={true} decimals={0} value={networkGav} suffix="ETH" />
              </DictionaryData>
            </DictionaryEntry>
            <DictionaryEntry>
              <DictionaryLabel>Total AUM (in USD)</DictionaryLabel>
              <DictionaryData textAlign="right">
                <FormattedNumber value={mlnPrice} decimals={0} suffix="USD" />
              </DictionaryData>
            </DictionaryEntry>
          </GridCol>
        </GridRow>
      </Grid>
    </Dictionary>
  );
};
