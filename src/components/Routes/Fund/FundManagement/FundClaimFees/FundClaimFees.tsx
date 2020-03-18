import React from 'react';
import { useEnvironment } from '~/hooks/useEnvironment';
import { useTransaction } from '~/hooks/useTransaction';
import { Accounting, FeeManager } from '@melonproject/melonjs';
import { Button } from '~/storybook/components/Button/Button';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import { useFundDetailsQuery } from './FundDetails.query';
import { Spinner } from '~/storybook/components/Spinner/Spinner';
import { useAccount } from '~/hooks/useAccount';
import { Block, BlockActions } from '~/storybook/components/Block/Block';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { DictionaryData, DictionaryEntry, DictionaryLabel } from '~/storybook/components/Dictionary/Dictionary';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { TokenValue } from '~/components/Common/TokenValue/TokenValue';
import { TransactionDescription } from '~/components/Common/TransactionModal/TransactionDescription';
import BigNumber from 'bignumber.js';
import { fromTokenBaseUnit } from '~/utils/fromTokenBaseUnit';

export interface ClaimFeesProps {
  address: string;
}

export const ClaimFees: React.FC<ClaimFeesProps> = ({ address }) => {
  const environment = useEnvironment()!;
  const account = useAccount();
  const [details, query] = useFundDetailsQuery(address);

  const accountingAddress = details && details.routes && details.routes.accounting && details.routes.accounting.address;
  const accounting = new Accounting(environment, accountingAddress);
  const feeManagerInfo = details && details.routes && details.routes.feeManager;
  const feeManagerAddress = feeManagerInfo && feeManagerInfo.address;
  const feeManager = new FeeManager(environment, feeManagerAddress);

  const transaction = useTransaction(environment);

  const submitAllFees = () => {
    const tx = accounting.triggerRewardAllFees(account.address!);
    transaction.start(tx, 'Claim all fees');
  };

  const submitManagementFees = () => {
    const tx = feeManager.rewardManagementFee(account.address!);
    transaction.start(tx, 'Claim management fees');
  };

  if (query.loading) {
    return (
      <Block>
        <SectionTitle>Claim Fees</SectionTitle>
        <Spinner />
      </Block>
    );
  }

  return (
    <Block>
      <SectionTitle>Claim Fees</SectionTitle>

      <p>Claim management fees and performance fees for the fund.</p>

      <DictionaryEntry>
        <DictionaryLabel>Accrued management fee</DictionaryLabel>
        <DictionaryData>
          <TokenValue value={feeManagerInfo!.managementFeeAmount} />
        </DictionaryData>
      </DictionaryEntry>
      <DictionaryEntry>
        <DictionaryLabel>Accrued performance fee</DictionaryLabel>
        <DictionaryData>
          <TokenValue value={feeManagerInfo!.performanceFeeAmount} />
        </DictionaryData>
      </DictionaryEntry>

      <BlockActions>
        <Button type="submit" onClick={() => submitAllFees()} disabled={!feeManagerInfo?.performanceFee?.canUpdate}>
          Claim All Fees
        </Button>
        <Button type="submit" onClick={() => submitManagementFees()}>
          Claim Management Fees
        </Button>
      </BlockActions>

      <TransactionModal transaction={transaction}>
        {transaction.state.name === 'Claim all fees' && (
          <TransactionDescription title="Claim all fees">
            You are claiming all accrued fees (
            <FormattedNumber
              value={fromTokenBaseUnit(feeManagerInfo!.managementFeeAmount, 18)}
              suffix="WETH"
              tooltip={true}
            />
            ) for this fund.
          </TransactionDescription>
        )}
        {transaction.state.name === 'Claim management fees' && (
          <TransactionDescription title="Claim management fee">
            You are claiming the accrued management fees (
            <FormattedNumber
              value={fromTokenBaseUnit(
                new BigNumber(feeManagerInfo!.managementFeeAmount).plus(
                  new BigNumber(feeManagerInfo!.performanceFeeAmount)
                ),
                18
              )}
              suffix="WETH"
              tooltip={true}
            />
            ) for this fund.
          </TransactionDescription>
        )}
      </TransactionModal>
    </Block>
  );
};

export default ClaimFees;
