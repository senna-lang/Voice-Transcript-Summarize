import { atom } from 'recoil';

export const loadingBState = atom<boolean>({
  key: 'loadingBState',
  default: false,
});