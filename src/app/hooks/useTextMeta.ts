import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axios from 'axios';
import { useCallback } from 'react';

const url = '/api/textTitle';

const fetcher = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
};

export const useTextMeta = (userId: string | null) => {
  const { data:textMeta, isLoading, error, mutate } = useSWR(
    userId ? `${url}/${userId}` : null,
    fetcher
  );

  const revalidate = useCallback(() => mutate(), [mutate]);

  const {
    trigger: metaTrigger,
    isMutating,
    error: mutateError,
  } = useSWRMutation(userId ? `${url}/${userId}` : null, fetcher, {
    onSuccess: revalidate,
  });

  return {
    textMeta,
    revalidate,
    isLoading,
    error,
    metaTrigger,
    isMutating,
    mutateError,
  };
};
