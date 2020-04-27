import { useState, useEffect } from 'react';

export interface UseCoinAPIProps {
  base?: string;
  quote?: string;
}

export interface CoinAPIResult {
  time: Date;
  asset_id_base: string;
  asset_id_quote: string;
  rate: number;
}

export const useCoinAPI = (props?: UseCoinAPIProps) => {
  const [state, setState] = useState({ state: 'idle', data: {} as CoinAPIResult });

  useEffect(() => {
    setState({ state: 'loading', data: {} as CoinAPIResult });

    (async () => {
      try {
        const base = props?.base || 'ETH';
        const quote = props?.quote || 'USD';
        const url = `${process.env.MELON_TERMINAL_API_GATEWAY}/coinapi?base=${base}&quote=${quote}`;
        const result = await fetch(url);
        const json = (await result.json()) as CoinAPIResult;
        setState({ state: 'success', data: json });
      } catch (e) {
        setState({ state: 'error', data: {} as CoinAPIResult });
      }
    })();
  }, [props?.base, props?.quote]);

  return state;
};
