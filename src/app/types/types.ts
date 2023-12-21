import { Timestamp } from "firebase/firestore";

type TextMeta = {
  id: string;
  userId:string;
  name:string;
  createdAt: Timestamp;
};

export type { TextMeta };
