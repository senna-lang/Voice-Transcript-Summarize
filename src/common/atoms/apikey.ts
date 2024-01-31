import { atom } from 'recoil';

export const apiKeyState = atom<string>({
  key: 'openApiKeyState',
  default: '',
});

