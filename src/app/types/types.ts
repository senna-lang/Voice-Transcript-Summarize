import { Timestamp } from "firebase/firestore";

type TextMeta = {
  id: string;
  name:string;
  createdAt: Timestamp;
};

export type { TextMeta };
