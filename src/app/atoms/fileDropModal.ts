import { atom } from "recoil";

export const fileDropModalState = atom<boolean>({
  key: "fileDropModalState",
  default: false,
});
