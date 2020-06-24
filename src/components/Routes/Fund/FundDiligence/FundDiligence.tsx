import * as React from 'react';
import { SectionTitle } from '~/storybook/Title/Title';
import { Block } from '~/storybook/Block/Block';
import { FundContracts } from './FundContracts/FundContracts';
import { TabBar, TabBarContent, TabBarSection, TabItem } from '~/storybook/TabNavigation/TabNavigation';
import { FundFinancials } from './FundFinancials/FundFinancials';
import { FundFactSheet } from './FundFactSheet/FundFactSheet';
import FundPolicies from './FundPolicies/FundPolicies';
import { FundTradeHistory } from './FundTradeHistory/FundTradeHistory';
import { FundInvestmentHistory } from './FundInvestmentHistory/FundInvestmentHistory';
import { Bar, BarContent } from '~/storybook/Bar/Bar';
import styled from 'styled-components';

export interface FundDiligenceProps {
  address: string;
}

type Tab = 'facts' | 'financials' | 'contracts' | 'ruleset' | 'tradeHistory' | 'investmentHistory';

const AccordionSection = styled(Bar)``;

export const FundDiligence: React.FC<FundDiligenceProps> = ({ address }) => {
  const [activeTabs, setActiveTabs] = React.useState<Tab[]>(['facts']);

  const tabHandler = (section: Tab) => {
    if (activeTabs.includes(section)) {
      const newActiveTabs = activeTabs.filter((tab) => tab !== section);
      setActiveTabs(newActiveTabs);
    } else {
      const newActiveTabs: Tab[] = activeTabs.concat([section]);
      setActiveTabs(newActiveTabs);
    }
  };

  return (
    <Block>
      <SectionTitle>Fund Diligence</SectionTitle>
      <Bar>
        <BarContent>
          <div onClick={() => tabHandler('facts')} active={activeTabs.includes('facts')}>
            Fact Sheet
          </div>
        </BarContent>
      </Bar>
      {activeTabs.includes('facts') && <FundFactSheet address={address} />}
      <Bar>
        <BarContent>
          <div onClick={() => tabHandler('financials')} active={activeTabs.includes('financials')}>
            Financials
          </div>
        </BarContent>
      </Bar>
      {activeTabs.includes('financials') && <FundFinancials address={address} />}
      <Bar>
        <BarContent>
          <div onClick={() => tabHandler('contracts')} active={activeTabs.includes('contracts')}>
            Contracts
          </div>
        </BarContent>
      </Bar>
      {activeTabs.includes('contracts') && <FundContracts address={address} />}
      <Bar>
        <BarContent>
          <div onClick={() => tabHandler('ruleset')} active={activeTabs.includes('ruleset')}>
            Ruleset
          </div>
        </BarContent>
      </Bar>
      {activeTabs.includes('ruleset') && <FundPolicies address={address} />}
      <Bar>
        <BarContent>
          <div onClick={() => tabHandler('tradeHistory')} active={activeTabs.includes('tradeHistory')}>
            Trade History
          </div>
        </BarContent>
      </Bar>
      {activeTabs.includes('tradeHistory') && <FundTradeHistory address={address} />}
      <Bar>
        <BarContent>
          <div onClick={() => tabHandler('investmentHistory')} active={activeTabs.includes('investmentHistory')}>
            Investment History
          </div>
        </BarContent>
      </Bar>
      {activeTabs.includes('investmentHistory') && <FundInvestmentHistory address={address} />}
    </Block>
  );
};
