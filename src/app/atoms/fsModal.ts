import { atom } from "recoil";

export const fsModalState = atom<boolean>({
  key: "fsModalState",
  default: false,
});
