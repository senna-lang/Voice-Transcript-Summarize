import { atom } from 'recoil';

export const textTitleState = atom<string>({
  key: 'textTitleState',
  default: '',
});
