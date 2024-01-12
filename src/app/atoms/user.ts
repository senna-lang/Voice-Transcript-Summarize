import { useState } from 'react';
import { atom, useRecoilState } from 'recoil';
import { useEffect } from 'react';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist();

export const userState = atom<string|null>({
  key: 'userState',
  default: null,
  effects: [persistAtom],
});

export function useUserState():[string|null, React.Dispatch<React.SetStateAction<string|null>>] {
  const [didMount, setDidMount] = useState(false);
  const [user, setUser] = useRecoilState(userState);

  useEffect(() => {
    setDidMount(true);
  }, []);

  return [didMount ? user : null, setUser];
}

