import React from 'react';
import Modal, { ModalProps } from 'styled-react-modal';
import { FormContext } from 'react-hook-form';
import { TransactionHookValues, TransactionProgress } from '~/hooks/useTransaction';
import { ProgressBar } from '~/components/Common/ProgressBar/ProgressBar';
import { ProgressBarStep } from '~/components/Common/ProgressBar/ProgressBarStep/ProgressBarStep';
import { Input } from '~/storybook/components/Input/Input';
import { Button } from '~/storybook/components/Button/Button';
import { NotificationBar, NotificationContent } from '~/storybook/components/NotificationBar/NotificationBar';
import { Spinner } from '~/storybook/components/Spinner/Spinner';
import * as S from '~/storybook/components/Modal/Modal';
import { EtherscanLink } from '../EtherscanLink/EtherscanLink';
import { FormattedNumber } from '~/components/Common/FormattedNumber/FormattedNumber';
import { fromTokenBaseUnit } from '~/utils/fromTokenBaseUnit';
import { BigNumber } from 'bignumber.js';
import { useCoinAPI } from '~/hooks/useCoinAPI';
import { useEnvironment } from '~/hooks/useEnvironment';
import { NetworkEnum } from '~/types';
import { TokenValue } from '../TokenValue/TokenValue';
import { ScrollableTable } from '~/storybook/components/Table/Table';
import { useFund } from '~/hooks/useFund';
import { useConnectionState } from '~/hooks/useConnectionState';

function progressToStep(progress: number) {
  if (progress >= TransactionProgress.EXECUTION_FINISHED) {
    return 3;
  }

  if (progress >= TransactionProgress.EXECUTION_RECEIVED) {
    return 2;
  }

  if (progress >= TransactionProgress.EXECUTION_PENDING) {
    return 1;
  }

  return 0;
}

function loadingStep(progress: number) {
  if (progress === TransactionProgress.EXECUTION_PENDING || progress === TransactionProgress.EXECUTION_RECEIVED) {
    return true;
  }

  return false;
}

export interface TransactionModalProps extends Partial<ModalProps> {
  transaction: TransactionHookValues;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction: { form, state, cancel, submit, acknowledge },
  children,
  ...rest
}) => {
  const gas = state.ethGasStation;
  const defaultGasPrice = state.defaultGasPrice;

  const coinApi = useCoinAPI();
  const environment = useEnvironment()!;

  const fund = useFund();
  const connection = useConnectionState();

  const hash = state.hash;
  const receipt = state.receipt;
  const options = state.sendOptions;
  const output = !!(hash || receipt);

  const error = state.error;
  const handled = state.handled;
  const loading = state.loading;
  const finished = state.progress >= TransactionProgress.EXECUTION_FINISHED;
  const estimated = state.progress >= TransactionProgress.ESTIMATION_FINISHED;
  const started = state.progress >= TransactionProgress.EXECUTION_PENDING;
  const open =
    state.progress < TransactionProgress.TRANSACTION_ACKNOWLEDGED &&
    state.progress > TransactionProgress.TRANSACTION_STARTED;

  const formGasPrice = new BigNumber(form.watch('gasPrice') ?? defaultGasPrice);
  const usedGasPrice = new BigNumber(state.sendOptions?.gasPrice ?? 'NaN');
  const gasPriceEth = new BigNumber(options?.gas ?? 'NaN').multipliedBy('1e9').multipliedBy(formGasPrice);
  const gasPriceUsd = gasPriceEth.multipliedBy(coinApi.data.rate);

  const amguUsd = options?.amgu?.multipliedBy(coinApi.data.rate) ?? new BigNumber('NaN');
  const incentiveUsd = options?.incentive?.multipliedBy(coinApi.data.rate) ?? new BigNumber('NaN');

  const totalEth = gasPriceEth?.plus(options?.amgu ?? 0).plus(options?.incentive ?? 0);
  const totalUsd = totalEth.multipliedBy(coinApi.data.rate);

  const setGasPrice = (value: number = 0) => {
    form.setValue('gasPrice', value);
  };

  const currentStep = progressToStep(state.progress);

  if (error) {
    error.issueUri = encodeURI(
      `https://github.com/avantgardefinance/melon-terminal/issues/new?title=Error in transaction "${state.name}";` +
        `body=` +
        `Error message: ${error.message}\n` +
        (fund?.name ? `Fund: ${fund.name}\n` : '') +
        `URL: ${window.location.href}\n` +
        (state.transaction?.contract?.address
          ? `Contract: [${state.transaction?.contract?.address}](https://etherscan.io/address/${state.transaction?.contract?.address})\n`
          : '') +
        `Method: ${state.transaction?.method}\n` +
        (state.transaction?.args ? `Arguments: ${JSON.stringify(state.transaction?.args)}\n` : '') +
        `Sender: [${state.transaction?.from}](https://etherscan.io/address/${state.transaction?.from})\n` +
        (hash ? `TxHash: [${hash}](https://etherscan.io/tx/${hash})\n` : '') +
        (connection?.method ? `Connection: ${connection.method}\n` : '') +
        (connection?.network ? `Network: ${NetworkEnum[connection.network]}` : '') +
        (error?.stack ? `\nStack trace: ${error?.stack}` : '')
    );
  }

  return (
    <FormContext {...form}>
      <Modal isOpen={open} {...rest}>
        <S.TransactionModal>
          <S.TransactionModalTitle>
            <S.TransactionModalName>{state.name}</S.TransactionModalName>
            <S.TransactionModalNetwork>{NetworkEnum[environment.network]} </S.TransactionModalNetwork>
          </S.TransactionModalTitle>

          <S.TransactionModalContent>
            {!estimated && !error && <Spinner />}

            {error && !handled && (
              <NotificationBar kind="error">
                <NotificationContent>{error.message}</NotificationContent>
                <NotificationContent>
                  <a href={error.issueUri} target="_blank">
                    Report error
                  </a>
                </NotificationContent>
              </NotificationBar>
            )}

            {error && handled && (
              <NotificationBar kind="neutral">
                <NotificationContent>{handled}</NotificationContent>
              </NotificationBar>
            )}

            {finished && (
              <NotificationBar kind="success">
                <NotificationContent>Transaction successful!</NotificationContent>
              </NotificationBar>
            )}

            {estimated && !finished && !handled && (
              <ProgressBar step={currentStep} loading={loadingStep(state.progress)}>
                <ProgressBarStep />
                <ProgressBarStep />
                <ProgressBarStep />
                <ProgressBarStep />
              </ProgressBar>
            )}

            {!finished && estimated && gas && !handled && (
              <S.EthGasStation>
                <S.EthGasStationButton onClick={() => !loading && setGasPrice(gas!.low)} disabled={loading}>
                  <S.EthGasStationButtonGwei>{gas.low}</S.EthGasStationButtonGwei>
                  <S.EthGasStationButtonText>
                    Low
                    <br />
                    Gas Price
                  </S.EthGasStationButtonText>
                </S.EthGasStationButton>
                <S.EthGasStationButton onClick={() => !loading && setGasPrice(gas!.average)} disabled={loading}>
                  <S.EthGasStationButtonGwei>{gas.average}</S.EthGasStationButtonGwei>
                  <S.EthGasStationButtonText>
                    Average
                    <br />
                    Gas Price
                  </S.EthGasStationButtonText>
                </S.EthGasStationButton>
                <S.EthGasStationButton onClick={() => !loading && setGasPrice(gas!.fast)} disabled={loading}>
                  <S.EthGasStationButtonGwei>{gas.fast}</S.EthGasStationButtonGwei>
                  <S.EthGasStationButtonText>
                    Fast
                    <br />
                    Gas Price
                  </S.EthGasStationButtonText>
                </S.EthGasStationButton>
              </S.EthGasStation>
            )}

            <S.TransactionModalForm onSubmit={submit}>
              {estimated && !finished && !handled && (
                <>
                  <S.TransactionModalFeeForm>
                    <Input
                      id="gas-price"
                      type="number"
                      step=".1"
                      name="gasPrice"
                      label="Gas Price (gwei)"
                      disabled={loading && estimated}
                    />

                    <ScrollableTable>
                      <S.CostsTable>
                        <S.CostsTableHead>
                          <S.CostsTableRow>
                            <S.CostsTableHeaderCellText />
                            <S.CostsTableHeaderCell>Amount</S.CostsTableHeaderCell>
                            <S.CostsTableHeaderCell>Costs [ETH]</S.CostsTableHeaderCell>
                            <S.CostsTableHeaderCell>Costs [USD]</S.CostsTableHeaderCell>
                          </S.CostsTableRow>
                        </S.CostsTableHead>

                        <S.CostsTableBody>
                          {options && options.gas && gasPriceEth && (
                            <S.CostsTableRow>
                              <S.CostsTableCellText>Gas</S.CostsTableCellText>
                              <S.CostsTableCell>
                                <FormattedNumber value={options.gas} decimals={0} />
                              </S.CostsTableCell>
                              <S.CostsTableCell>
                                <TokenValue value={gasPriceEth} symbol="ETH" />
                              </S.CostsTableCell>
                              <S.CostsTableCell>
                                <TokenValue value={gasPriceUsd} symbol="USD" />
                              </S.CostsTableCell>
                            </S.CostsTableRow>
                          )}

                          {options && options.amgu && (
                            <S.CostsTableRow>
                              <S.CostsTableCellText>Asset management gas</S.CostsTableCellText>
                              <S.CostsTableCell />
                              <S.CostsTableCell>
                                <TokenValue value={options.amgu} symbol="ETH" />
                              </S.CostsTableCell>
                              <S.CostsTableCell>
                                <TokenValue value={amguUsd} symbol="USD" />
                              </S.CostsTableCell>
                            </S.CostsTableRow>
                          )}

                          {options && options.incentive && (
                            <S.CostsTableRow>
                              <S.CostsTableCellText>Incentive</S.CostsTableCellText>
                              <S.CostsTableCell />
                              <S.CostsTableCell>
                                <TokenValue value={options.incentive} symbol="ETH" />
                              </S.CostsTableCell>
                              <S.CostsTableCell>
                                <TokenValue value={incentiveUsd} symbol="USD" />
                              </S.CostsTableCell>
                            </S.CostsTableRow>
                          )}

                          {totalEth && (
                            <S.CostsTableRowTotal>
                              <S.CostsTableCellText>Total</S.CostsTableCellText>
                              <S.CostsTableCell />
                              <S.CostsTableCell>
                                <TokenValue value={totalEth} symbol="ETH" />
                              </S.CostsTableCell>
                              <S.CostsTableCell>
                                <TokenValue value={totalUsd} symbol="USD" />
                              </S.CostsTableCell>
                            </S.CostsTableRowTotal>
                          )}
                        </S.CostsTableBody>
                      </S.CostsTable>
                    </ScrollableTable>
                  </S.TransactionModalFeeForm>
                </>
              )}

              {output && !handled && (
                <S.TransactionModalMessages>
                  <S.TransactionModalMessagesTable>
                    <S.TransactionModalMessagesTableBody>
                      {hash && (
                        <S.TransactionModalMessagesTableRow>
                          <S.TransactionModalMessagesTableRowLabel>Hash</S.TransactionModalMessagesTableRowLabel>
                          <S.TransactionModalMessagesTableRowQuantity>
                            <EtherscanLink hash={hash} />
                          </S.TransactionModalMessagesTableRowQuantity>
                        </S.TransactionModalMessagesTableRow>
                      )}

                      {receipt && (
                        <>
                          <S.TransactionModalMessagesTableRow>
                            <S.TransactionModalMessagesTableRowLabel>Gas used</S.TransactionModalMessagesTableRowLabel>
                            <S.TransactionModalMessagesTableRowQuantity>
                              <FormattedNumber value={receipt.gasUsed} decimals={0} />
                            </S.TransactionModalMessagesTableRowQuantity>
                          </S.TransactionModalMessagesTableRow>

                          <S.TransactionModalMessagesTableRow>
                            <S.TransactionModalMessagesTableRowLabel>Gas cost</S.TransactionModalMessagesTableRowLabel>
                            <S.TransactionModalMessagesTableRowQuantity>
                              <FormattedNumber
                                value={fromTokenBaseUnit(new BigNumber(receipt.gasUsed).multipliedBy(usedGasPrice), 18)}
                                suffix="ETH"
                              />
                              {' ('}
                              <FormattedNumber
                                value={fromTokenBaseUnit(
                                  new BigNumber(receipt.gasUsed)
                                    .multipliedBy(usedGasPrice)
                                    .multipliedBy(coinApi.data.rate),
                                  18
                                )}
                                suffix="USD"
                              />
                              {')'}
                            </S.TransactionModalMessagesTableRowQuantity>
                          </S.TransactionModalMessagesTableRow>
                        </>
                      )}
                    </S.TransactionModalMessagesTableBody>
                  </S.TransactionModalMessagesTable>
                </S.TransactionModalMessages>
              )}

              {estimated && !finished && !handled ? children : null}

              <S.TransactionModalActions>
                {!finished && (
                  <S.TransactionModalAction>
                    <Button type="button" kind="secondary" length="stretch" disabled={started} onClick={() => cancel()}>
                      Close
                    </Button>
                  </S.TransactionModalAction>
                )}

                {!finished && estimated && !handled && (
                  <S.TransactionModalAction>
                    <Button type="submit" kind="success" length="stretch" disabled={loading}>
                      {error ? 'Retry' : 'Confirm'}
                    </Button>
                  </S.TransactionModalAction>
                )}

                {finished && (
                  <S.TransactionModalAction>
                    <Button
                      type="button"
                      kind="success"
                      length="stretch"
                      onClick={() => acknowledge()}
                      disabled={loading}
                    >
                      Acknowledge
                    </Button>
                  </S.TransactionModalAction>
                )}
              </S.TransactionModalActions>
            </S.TransactionModalForm>
          </S.TransactionModalContent>
        </S.TransactionModal>
      </Modal>
    </FormContext>
  );
};
