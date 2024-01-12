import { FieldValue, Timestamp } from 'firebase/firestore';

type TextMeta = {
  id: string;
  userId: string;
  name: string;
  createdAt: Timestamp;
};
type TextMetaProps = {
  userId: string;
  name: string;
  createdAt: FieldValue;
};

type TextDetail = {
  summary: string;
  vanilla: string;
};
type TextDetailProps = {
  summary: string | null;
  vanilla: string;
};

export type { TextMeta, TextDetail, TextMetaProps, TextDetailProps };
