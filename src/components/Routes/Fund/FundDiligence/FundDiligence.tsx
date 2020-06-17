import * as React from 'react';
import { SectionTitle } from '~/storybook/Title/Title';
import { Block } from '~/storybook/Block/Block';
import { FundContracts } from './FundContracts/FundContracts';
import { TabBar, TabBarContent, TabBarSection, TabItem } from '~/storybook/TabNavigation/TabNavigation';
import { FundFinancials } from './FundFinancials/FundFinancials';
import { FundFactSheet } from './FundFactSheet/FundFactSheet';
import FundPolicies from './FundPolicies/FundPolicies';

export interface FundDiligenceProps {
  address: string;
}

type Tab = 'facts' | 'financials' | 'contracts' | 'ruleset';

export const FundDiligence: React.FC<FundDiligenceProps> = ({ address }) => {
  const [activeTab, setActiveTab] = React.useState<Tab>('facts');

  const tabHandler = (tab: Tab) => {
    setActiveTab(tab);
  };

  return (
    <Block>
      <SectionTitle>Fund Diligence</SectionTitle>
      <TabBar>
        <TabBarContent justify="between">
          <TabBarSection>
            <TabItem onClick={() => tabHandler('facts')} active={activeTab === 'facts'}>
              Fact Sheet
            </TabItem>
            <TabItem onClick={() => tabHandler('financials')} active={activeTab === 'financials'}>
              Financials
            </TabItem>
            <TabItem onClick={() => tabHandler('contracts')} active={activeTab === 'contracts'}>
              Contracts
            </TabItem>
            <TabItem onClick={() => tabHandler('ruleset')} active={activeTab === 'ruleset'}>
              Ruleset
            </TabItem>
          </TabBarSection>
        </TabBarContent>
      </TabBar>
      {activeTab === 'facts' && <FundFactSheet address={address} />}
      {activeTab === 'financials' && <FundFinancials address={address} />}
      {activeTab === 'contracts' && <FundContracts address={address} />}
      {activeTab === 'ruleset' && <FundPolicies address={address} />}
    </Block>
  );
};
