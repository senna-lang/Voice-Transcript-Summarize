import { atom } from 'recoil';

export const textTitleState = atom<string | null>({
  key: 'textTitleState',
  default: '',
});
