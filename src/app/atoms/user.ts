import { atom } from 'recoil';
import { User } from 'firebase/auth'; 
import { useEffect } from 'react';

export const userState = atom<User | null>({
  key: 'userState',
  default: null,
});

