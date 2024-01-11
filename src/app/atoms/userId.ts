import { useState } from 'react';
import { atom, useRecoilState } from 'recoil';
import { useEffect } from 'react';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist();

export const userIdState = atom({
  key: 'userIdState',
  default: '',
  effects: [persistAtom],
});

export function useUserIdState() {
  const [didMount, setDidMount] = useState(false);
  const [userId, setUserId] = useRecoilState(userIdState);

  useEffect(() => {
    setDidMount(true);
  }, []);

  return [didMount ? userId : null, setUserId];
}
