/*
  TBD:
  - initial value
  - reset state
  - integration with Chrome DevTools
*/

/* eslint-disable react-hooks/exhaustive-deps */
import { useReducer, useEffect, useCallback, useRef } from 'react';
import merge from 'lodash/merge';

const FETCH_START = 'FETCH_START';
const FETCH_SUCCESS = 'FETCH_SUCCESS';
const FETCH_FAILED = 'FETCH_FAILED';

const defaultState = {
  data: null,
  loading: true,
  loaded: false,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case FETCH_START:
      return { ...state, loading: true };
    case FETCH_SUCCESS:
      return { ...defaultState, data: action.payload, loading: false, loaded: true };
    case FETCH_FAILED:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const useFetch = (fetcher, deps = []) => {
  const prevDeps = useRef([]);
  const [state, dispatch] = useReducer(reducer, defaultState);
  const handleFetcher = useCallback(async () => {
    dispatch({ type: FETCH_START });
    try {
      const data = await fetcher(state.data, prevDeps.current);
      dispatch({ type: FETCH_SUCCESS, payload: data });
    } catch (error) {
      dispatch({ type: FETCH_FAILED, payload: error });
    } finally {
      prevDeps.current = merge([], deps);
    }
  }, deps);
  useEffect(() => {
    handleFetcher();
  }, deps);
  const { data, ...meta } = state;
  return [data, meta, { reload: handleFetcher }];
};
