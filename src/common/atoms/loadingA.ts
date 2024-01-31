import { atom } from 'recoil';

export const loadingAState = atom<boolean>({
  key: 'loadingAState',
  default: false,
});

