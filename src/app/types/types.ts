import { Timestamp } from "firebase/firestore";
import { type } from "os";

type TextMeta = {
  id: string;
  userId:string;
  name:string;
  createdAt: Timestamp;
};

type TextDetail = {
  summary:string;
  vanilla:string;
}
export type { TextMeta,TextDetail };
