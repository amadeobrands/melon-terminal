import React, { useMemo } from 'react';
import * as S from './FundInvest.styles';
import { useFundInvestQuery } from '~/queries/FundInvest';
import { Spinner } from '~/components/Common/Spinner/Spinner';
import RequestInvestment from './RequestInvestment/RequestInvestment';
import ExecuteRequest from './ExecuteRequest/ExecuteRequest';
import CancelRequest from './CancelRequest/CancelRequest';

export interface FundInvestProps {
  address: string;
}

export const FundInvest: React.FC<FundInvestProps> = ({ address }) => {
  const [result, query] = useFundInvestQuery(address);

  const account = result?.account;
  const holdings = result?.fund?.routes?.accounting?.holdings;
  const investmentRequestState = result?.account?.participation?.investmentRequestState;
  const canCancelRequest = result?.account?.participation?.canCancelRequest;

  const action = useMemo(() => {
    if (investmentRequestState === 'VALID') {
      return 'execute';
    }

    if (investmentRequestState === 'WAITING') {
      return 'waiting';
    }

    if (investmentRequestState === 'NONE') {
      return 'invest';
    }
  }, [investmentRequestState]);

  if (query.loading) {
    return (
      <S.Wrapper>
        <S.Title>Invest</S.Title>
        <Spinner />
      </S.Wrapper>
    );
  }

  return (
    <S.Wrapper>
      <S.Title>Invest</S.Title>
      {action === 'invest' && <RequestInvestment address={address} holdings={holdings} account={account!} />}
      {action === 'execute' && <ExecuteRequest address={address} account={account!} />}
      {action === 'waiting' && (
        <p>
          You need to wait before you can execute your investment request. The time-window to execute your investment
          request is between the next price update and 24 hours after your investment request .
        </p>
      )}
      {canCancelRequest && <CancelRequest address={address} account={account!} />}
    </S.Wrapper>
  );
};