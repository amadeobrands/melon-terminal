import React, { useEffect, useReducer } from 'react';
import * as Yup from 'yup';
import useForm from 'react-hook-form';
import { TransactionReceipt } from 'web3-core';
import { Transaction, SendOptions } from '@melonproject/melonjs';
import { FormContextValues } from 'react-hook-form/dist/contextTypes';
import { FieldValues } from 'react-hook-form/dist/types';
import BigNumber from 'bignumber.js';

import { Environment } from '~/environment';
import { useEnvironment } from '~/hooks/useEnvironment';
import { NetworkEnum } from '~/types';

export interface TransactionFormValues extends FieldValues {
  gasLimit: string;
  gasPrice: string;
}

export interface TransactionState {
  progress: number;
  gasLimit?: number;
  gasPrice?: string;
  ethGasStation?: EthGasStation;
  amguValue?: BigNumber;
  incentiveValue?: BigNumber;
  transaction?: Transaction;
  name?: string;
  hash?: string;
  receipt?: TransactionReceipt;
  error?: Error;
  loading: boolean;
}

export enum TransactionProgress {
  TRANSACTION_WAITING,
  TRANSACTION_CANCELLED,
  TRANSACTION_STARTED,
  VALIDATION_ERROR,
  VALIDATION_PENDING,
  VALIDATION_FINISHED,
  ESTIMATION_ERROR,
  ESTIMATION_PENDING,
  ESTIMATION_FINISHED,
  EXECUTION_ERROR,
  EXECUTION_PENDING,
  EXECUTION_RECEIVED,
  EXECUTION_FINISHED,
  TRANSACTION_ACKNOWLEDGED,
}

type TransactionAction =
  | TransactionStarted
  | TransactionCancelled
  | TransactionAcknowledged
  | ValidationPending
  | ValidationFinished
  | ValidationError
  | EstimationPending
  | EstimationFinished
  | EstimationError
  | ExecutionPending
  | ExecutionReceived
  | ExecutionFinished
  | ExecutionError;

interface TransactionStarted {
  type: TransactionProgress.TRANSACTION_STARTED;
  transaction: Transaction;
  name: string;
}

interface TransactionCancelled {
  type: TransactionProgress.TRANSACTION_CANCELLED;
}

interface TransactionAcknowledged {
  type: TransactionProgress.TRANSACTION_ACKNOWLEDGED;
}

interface EstimationPending {
  type: TransactionProgress.ESTIMATION_PENDING;
}

interface EstimationFinished {
  type: TransactionProgress.ESTIMATION_FINISHED;
  limit: number;
  price: string;
  ethGasStation?: EthGasStation;
  amgu?: BigNumber;
  incentive?: BigNumber;
}

interface EstimationError {
  type: TransactionProgress.ESTIMATION_ERROR;
  error: Error;
}

interface ValidationPending {
  type: TransactionProgress.VALIDATION_PENDING;
}

interface ValidationFinished {
  type: TransactionProgress.VALIDATION_FINISHED;
}

interface ValidationError {
  type: TransactionProgress.VALIDATION_ERROR;
  error: Error;
}

interface ExecutionPending {
  type: TransactionProgress.EXECUTION_PENDING;
}

interface ExecutionReceived {
  type: TransactionProgress.EXECUTION_RECEIVED;
  hash: string;
}

interface ExecutionFinished {
  type: TransactionProgress.EXECUTION_FINISHED;
  receipt: TransactionReceipt;
}

interface ExecutionError {
  type: TransactionProgress.EXECUTION_ERROR;
  error: Error;
}

export interface EthGasStation {
  fast: number;
  low: number;
  average: number;
}

function reducer(state: TransactionState, action: TransactionAction): TransactionState {
  switch (action.type) {
    case TransactionProgress.TRANSACTION_STARTED:
      return {
        ...state,
        progress: TransactionProgress.TRANSACTION_STARTED,
        transaction: action.transaction,
        name: action.name,
        error: undefined,
        hash: undefined,
        receipt: undefined,
        gasPrice: undefined,
        ethGasStation: undefined,
        gasLimit: undefined,
        amguValue: undefined,
        incentiveValue: undefined,
        loading: true,
      };

    case TransactionProgress.TRANSACTION_CANCELLED:
      return {
        ...state,
        progress: TransactionProgress.TRANSACTION_CANCELLED,
        transaction: undefined,
        name: undefined,
        error: undefined,
        hash: undefined,
        receipt: undefined,
        gasPrice: undefined,
        ethGasStation: undefined,
        gasLimit: undefined,
        amguValue: undefined,
        incentiveValue: undefined,
        loading: false,
      };

    case TransactionProgress.TRANSACTION_ACKNOWLEDGED: {
      return {
        ...state,
        progress: TransactionProgress.TRANSACTION_ACKNOWLEDGED,
      };
    }

    case TransactionProgress.VALIDATION_PENDING: {
      return {
        ...state,
        progress: TransactionProgress.VALIDATION_PENDING,
        loading: true,
        error: undefined,
      };
    }

    case TransactionProgress.VALIDATION_ERROR: {
      return {
        ...state,
        progress: TransactionProgress.VALIDATION_ERROR,
        loading: false,
        error: action.error,
      };
    }

    case TransactionProgress.VALIDATION_FINISHED:
      return {
        ...state,
        progress: TransactionProgress.VALIDATION_FINISHED,
        loading: false,
      };

    case TransactionProgress.ESTIMATION_PENDING: {
      return {
        ...state,
        progress: TransactionProgress.ESTIMATION_PENDING,
        loading: true,
        error: undefined,
      };
    }

    case TransactionProgress.ESTIMATION_ERROR: {
      return {
        ...state,
        progress: TransactionProgress.ESTIMATION_ERROR,
        loading: false,
        error: action.error,
      };
    }

    case TransactionProgress.ESTIMATION_FINISHED:
      return {
        ...state,
        progress: TransactionProgress.ESTIMATION_FINISHED,
        loading: false,
        gasPrice: action.price,
        ethGasStation: action.ethGasStation,
        gasLimit: action.limit,
        amguValue: action.amgu,
        incentiveValue: action.incentive,
      };

    case TransactionProgress.EXECUTION_PENDING: {
      return {
        ...state,
        progress: TransactionProgress.EXECUTION_PENDING,
        loading: true,
        error: undefined,
        hash: undefined,
      };
    }

    case TransactionProgress.EXECUTION_RECEIVED: {
      return {
        ...state,
        progress: TransactionProgress.EXECUTION_RECEIVED,
        hash: action.hash,
      };
    }

    case TransactionProgress.EXECUTION_FINISHED: {
      return {
        ...state,
        progress: TransactionProgress.EXECUTION_FINISHED,
        loading: false,
        receipt: action.receipt,
      };
    }

    case TransactionProgress.EXECUTION_ERROR: {
      return {
        ...state,
        progress: TransactionProgress.EXECUTION_ERROR,
        loading: false,
        error: action.error,
      };
    }

    default:
      throw new Error('Invalid action.');
  }
}

function validationPending(dispatch: React.Dispatch<TransactionAction>) {
  dispatch({ type: TransactionProgress.VALIDATION_PENDING });
}

function validationFinished(dispatch: React.Dispatch<TransactionAction>) {
  dispatch({ type: TransactionProgress.VALIDATION_FINISHED });
}

function validationError(dispatch: React.Dispatch<TransactionAction>, error: Error) {
  dispatch({ error, type: TransactionProgress.VALIDATION_ERROR });
}

function estimationPending(dispatch: React.Dispatch<TransactionAction>) {
  dispatch({ type: TransactionProgress.ESTIMATION_PENDING });
}

function estimationFinished(
  dispatch: React.Dispatch<TransactionAction>,
  price: string,
  limit: number,
  ethGasStation?: EthGasStation,
  amgu?: BigNumber,
  incentive?: BigNumber
) {
  dispatch({ limit, price, ethGasStation, amgu, incentive, type: TransactionProgress.ESTIMATION_FINISHED });
}

function estimationError(dispatch: React.Dispatch<TransactionAction>, error: Error) {
  dispatch({ error, type: TransactionProgress.ESTIMATION_ERROR });
}

function executionPending(dispatch: React.Dispatch<TransactionAction>) {
  dispatch({ type: TransactionProgress.EXECUTION_PENDING });
}

function executionReceived(dispatch: React.Dispatch<TransactionAction>, hash: string) {
  dispatch({ hash, type: TransactionProgress.EXECUTION_RECEIVED });
}

function executionFinished(dispatch: React.Dispatch<TransactionAction>, receipt: TransactionReceipt) {
  dispatch({ receipt, type: TransactionProgress.EXECUTION_FINISHED });
}

function executionError(dispatch: React.Dispatch<TransactionAction>, error: Error) {
  dispatch({ error, type: TransactionProgress.EXECUTION_ERROR });
}

export interface TransactionOptions {
  onStart?: () => void;
  onFinish?: (receipt: TransactionReceipt) => void;
  onAcknowledge?: (receipt: TransactionReceipt) => void;
  onError?: (error: Error) => void;
}

export interface TransactionHookValues<FormValues extends TransactionFormValues = TransactionFormValues> {
  state: TransactionState;
  form: FormContextValues<FormValues>;
  submit: (event: React.BaseSyntheticEvent) => Promise<void>;
  start: (transaction: Transaction, name: string) => void;
  cancel: () => void;
  acknowledge: () => void;
}

async function fetchEthGasStation(environment: Environment) {
  if (environment.network !== NetworkEnum.MAINNET) {
    return undefined;
  }

  try {
    const result = await fetch('https://ethgasstation.info/json/ethgasAPI.json');
    const json = await result.json();

    return {
      fast: json.fast / 10,
      low: json.safeLow / 10,
      average: json.average / 10,
    };
  } catch (error) {
    return undefined;
  }
}

export function useTransaction(environment: Environment, options?: TransactionOptions) {
  const [state, dispatch] = useReducer(reducer, {
    progress: TransactionProgress.TRANSACTION_WAITING,
    transaction: undefined,
    name: undefined,
    hash: undefined,
    receipt: undefined,
    error: undefined,
    loading: false,
  } as TransactionState);

  const form = useForm<TransactionFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    validationSchema: Yup.object().shape({
      gasPrice: Yup.number(),
    }),
    defaultValues: {
      gasPrice: `${state.gasPrice || ''}`,
    },
  });

  const start = (transaction: Transaction, name: string) => {
    dispatch({ transaction, name, type: TransactionProgress.TRANSACTION_STARTED });
  };

  const cancel = () => {
    dispatch({ type: TransactionProgress.TRANSACTION_CANCELLED });
  };

  const acknowledge = () => {
    dispatch({ type: TransactionProgress.TRANSACTION_ACKNOWLEDGED });
  };

  const submit = form.handleSubmit(async data => {
    if (!state.transaction) {
      return;
    }

    try {
      executionPending(dispatch);
      const transaction = state.transaction!;
      const opts: SendOptions = {
        gasPrice: `${+data.gasPrice * 10e9}`,
        ...(state.gasLimit && { gas: state.gasLimit }),
        ...(state.amguValue && { amgu: state.amguValue }),
        ...(state.incentiveValue && { incentive: state.incentiveValue }),
      };

      const receipt = await transaction.send(opts).on('transactionHash', hash => executionReceived(dispatch, hash));
      executionFinished(dispatch, receipt);
    } catch (error) {
      executionError(dispatch, error);
    }
  });

  useEffect(() => {
    switch (state.progress) {
      case TransactionProgress.EXECUTION_FINISHED: {
        options && options.onFinish && options.onFinish(state.receipt!);
        break;
      }

      case TransactionProgress.TRANSACTION_ACKNOWLEDGED: {
        options && options.onAcknowledge && options.onAcknowledge(state.receipt!);
        break;
      }

      case TransactionProgress.EXECUTION_ERROR:
      case TransactionProgress.ESTIMATION_ERROR:
      case TransactionProgress.VALIDATION_ERROR: {
        options && options.onError && options.onError(state.error!);
        break;
      }

      // Automatically start validation when the modal is opened.
      case TransactionProgress.TRANSACTION_STARTED: {
        options && options.onStart && options.onStart();

        (async () => {
          try {
            validationPending(dispatch);

            const transaction = state.transaction!;
            await transaction.validate();

            validationFinished(dispatch);
          } catch (error) {
            validationError(dispatch, error);
          }
        })();
        break;
      }

      // Automatically start estimation when validation is finished.
      case TransactionProgress.VALIDATION_FINISHED: {
        (async () => {
          try {
            estimationPending(dispatch);
            const [ethGasStation, price, options] = await Promise.all([
              fetchEthGasStation(environment),
              environment.client.getGasPrice(),
              state.transaction!.prepare(),
            ])!;

            const gasPriceFromState = ethGasStation ? ethGasStation.average : +price! / 10e9;
            form.setValue('gasPrice', `${gasPriceFromState || ''}`);

            estimationFinished(dispatch, price!, options!.gas!, ethGasStation, options!.amgu, options!.incentive);
          } catch (error) {
            estimationError(dispatch, error);
          }
        })();
        break;
      }
    }
  }, [state.progress]);

  return {
    state,
    form,
    submit,
    start,
    cancel,
    acknowledge,
  } as TransactionHookValues;
}
