import { atom } from 'recoil';

export const textIdState = atom<string>({
  key: 'textIdState',
  default: 'textIdState',
});
