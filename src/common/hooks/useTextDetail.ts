import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axios from 'axios';
import { useCallback } from 'react';

const url = '/api/textDetail';

const fetcher = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
};

export const useTextDetail = (textId: string) => {
  const {
    data: textDetail,
    isLoading,
    error,
    mutate,
  } = useSWR(textId ? `${url}/${textId}` : null, fetcher);

  const revalidate = useCallback(() => mutate(), [mutate]);

  const {
    trigger: detailTrigger,
    isMutating,
    error: mutateError,
  } = useSWRMutation(textId ? `${url}/${textId}` : null, fetcher, {
    onSuccess: revalidate,
  });

  return {
    textDetail,
    revalidate,
    isLoading,
    error,
    detailTrigger,
    isMutating,
    mutateError,
  };
};
