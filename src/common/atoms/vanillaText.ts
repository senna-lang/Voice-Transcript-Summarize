import { atom } from 'recoil';

export const vanillaTextState = atom<string>({
  key: 'vanillaTextState',
  default: '',
});