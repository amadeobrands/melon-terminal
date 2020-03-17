import React, { useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { useEnvironment } from '~/hooks/useEnvironment';
import { Transaction, sameAddress } from '@melonproject/melonjs';
import { useTransaction } from '~/hooks/useTransaction';
import { useFundInvestQuery } from './FundInvest.query';
import { Spinner } from '~/storybook/components/Spinner/Spinner';
import { RequestInvestment } from '../RequestInvestment/RequestInvestment';
import { ExecuteRequest } from '../ExecuteRequest/ExecuteRequest';
import { CancelRequest } from '../CancelRequest/CancelRequest';
import { Block } from '~/storybook/components/Block/Block';
import { SectionTitle } from '~/storybook/components/Title/Title';
import { RequiresFundCreatedAfter } from '~/components/Gates/RequiresFundCreatedAfter/RequiresFundCreatedAfter';
import { TransactionModal } from '~/components/Common/TransactionModal/TransactionModal';
import { usePriceFeedUpdateQuery } from '~/components/Layout/PriceFeedUpdate.query';
import { TokenValue } from '~/components/Common/TokenValue/TokenValue';
import { TransactionDescription } from '~/components/Common/TransactionModal/TransactionDescription';
import { RequiresFundNotShutDown } from '~/components/Gates/RequiresFundNotShutDown/RequiresFundNotShutDown';
import { UserWhitelist, AssetWhitelist, AssetBlacklist } from '@melonproject/melongql';
import { FormattedDate } from '~/components/Common/FormattedDate/FormattedDate';

export interface FundInvestProps {
  address: string;
}

export interface TransactionRef {
  next: (start: (transaction: Transaction, name: string) => void) => void;
}

export const FundInvest: React.FC<FundInvestProps> = ({ address }) => {
  const environment = useEnvironment()!;
  const [result, query] = useFundInvestQuery(address);
  const [priceUpdate] = usePriceFeedUpdateQuery();

  const denominationAsset = result?.fund?.routes?.accounting?.denominationAsset;
  const holdings = result?.fund?.routes?.accounting?.holdings?.filter(holding => !holding.amount?.isZero());

  const policies = result?.fund?.routes?.policyManager?.policies;
  const assetWhitelists = policies?.filter(policy => policy.identifier === 'AssetWhitelist') as
    | AssetWhitelist[]
    | undefined;
  const assetBlacklists = policies?.filter(policy => policy.identifier === 'AssetBlacklist') as
    | AssetBlacklist[]
    | undefined;
  const userWhitelists = policies?.filter(policy => policy.identifier === 'UserWhitelist') as
    | UserWhitelist[]
    | undefined;

  const oneDay = 24 * 60 * 60 * 1000;
  const nextUpdate = new Date((priceUpdate?.getTime() || 0) + oneDay);

  const transactionRef = useRef<TransactionRef>();

  const transaction = useTransaction(environment, {
    onAcknowledge: () => {
      if (transactionRef.current) {
        transactionRef.current.next(transaction.start);
      }
    },
    handleError: (error, validation) => {
      if (validation?.name === 'NoInvestmentRequestError') {
        return 'Your investment request was already successfully executed by someone else.';
      }
    },
  });

  const request = result?.account?.participation?.request;
  const twentyFourHoursAfterRequest = new Date((request?.timestamp?.getTime() || 0) + oneDay);
  const symbol = environment.tokens.find(token => sameAddress(token.address, request?.investmentAsset))?.symbol;

  const account = result?.account;
  const allowedAssets = result?.fund?.routes?.participation?.allowedAssets
    ?.filter(
      asset =>
        !assetWhitelists?.length ||
        assetWhitelists.every(list => list.assetWhitelist?.some(item => sameAddress(item, asset.token?.address)))
    )
    .filter(
      asset =>
        !assetBlacklists?.length ||
        !assetBlacklists.some(list => list.assetBlacklist?.some(item => sameAddress(item, asset.token?.address)))
    );

  const action = useMemo(() => {
    const canCancelRequest = result?.account?.participation?.canCancelRequest;
    if (canCancelRequest) {
      return 'cancel';
    }

    const investmentRequestState = result?.account?.participation?.investmentRequestState;
    if (investmentRequestState === 'VALID') {
      return 'execute';
    }

    if (investmentRequestState === 'WAITING') {
      return 'waiting';
    }

    if (investmentRequestState === 'NONE') {
      return 'invest';
    }
  }, [result]);

  if (query.loading) {
    return (
      <Block>
        <SectionTitle>Invest</SectionTitle>
        <Spinner />
      </Block>
    );
  }

  if (userWhitelists && !userWhitelists.every(list => list.isWhitelisted)) {
    return (
      <Block>
        <SectionTitle>Invest</SectionTitle>
        <p>This fund operates an investor whitelist and you are currently not on that whitelist.</p>
      </Block>
    );
  }

  const totalSupply = result?.fund?.routes?.shares?.totalSupply;

  return (
    <Block>
      <SectionTitle>Invest</SectionTitle>

      <RequiresFundNotShutDown fallback="This fund is already shut down. You can only invest in active funds.">
        <RequiresFundCreatedAfter
          after={new Date('2019-12-19')}
          fallback={
            'The Melon Terminal does not support investments in funds which are running on deprecated versions of the Melon protocol.'
          }
        >
          {action === 'cancel' && (
            <CancelRequest
              address={address}
              account={account!}
              loading={query.networkStatus < 7}
              transaction={transaction}
            />
          )}
          {action === 'invest' && (
            <RequestInvestment
              ref={transactionRef}
              address={address}
              allowedAssets={allowedAssets}
              holdings={holdings}
              denominationAsset={denominationAsset}
              policies={policies}
              totalSupply={totalSupply}
              account={account!}
              loading={query.networkStatus < 7}
              transaction={transaction}
            />
          )}
          {action === 'execute' && (
            <ExecuteRequest
              ref={transactionRef}
              address={address}
              account={account!}
              loading={query.networkStatus < 7}
              totalSupply={totalSupply}
              transaction={transaction}
            />
          )}
          {action === 'waiting' && (
            <>
              <p>You have a pending investment request:</p>

              <p>
                Requested shares: <TokenValue value={request?.requestedShares} />
                <br />
                Investment amount: <TokenValue value={request?.investmentAmount} /> {symbol}
                <br />
                Request date: <FormattedDate timestamp={request?.timestamp}></FormattedDate>
              </p>

              <p>
                Your investment request will be automatically executed after the next price update, which will be around{' '}
                <FormattedDate timestamp={nextUpdate}></FormattedDate>.
              </p>

              <p>
                If you come back during the execution window (which starts at around{' '}
                <FormattedDate timestamp={nextUpdate}></FormattedDate> and ends at{' '}
                <FormattedDate timestamp={twentyFourHoursAfterRequest}></FormattedDate>), and your invesment request
                hasn't been automatically executed, you will see here the option to execute it yourself.
              </p>
            </>
          )}
          <TransactionModal transaction={transaction}>
            {transaction.state.name === 'Approve' && (
              <TransactionDescription title="Approve">
                You are approving the fund's Participation contract to transfer your investment amount to itself.{' '}
              </TransactionDescription>
            )}
            {transaction.state.name === 'Invest' && (
              <TransactionDescription title="Request investment">
                You are creating the actual investment request into the fund.
              </TransactionDescription>
            )}
            {transaction.state.name === 'Execute investment request' && (
              <TransactionDescription title="Execute investment request">
                You are executing the investment request.
              </TransactionDescription>
            )}
            {transaction.state.name === 'Cancel investment request' && (
              <TransactionDescription title="Cancel">
                Your investment request will be cancelled. The initially requested investment amount will be returned to
                your wallet.
              </TransactionDescription>
            )}
          </TransactionModal>
        </RequiresFundCreatedAfter>
      </RequiresFundNotShutDown>
    </Block>
  );
};
