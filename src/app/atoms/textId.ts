import { atom } from 'recoil';

export const textIdState = atom<string | null>({
  key: 'textIdState',
  default: null,
});
