import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  TextDetail,
  TextDetailProps,
  TextMeta,
  TextMetaProps,
} from "../types/types";
import { doc } from "firebase/firestore";

//テキストメタデータの取得
export const getTextMeta = async (userId: string) => {
  const roomCollectionRef = collection(db, "texts");
  const q = query(
    roomCollectionRef,
    where("userId", "==", `${userId}`),
    orderBy("createdAt"),
  );
  const querySnapshot = await getDocs(q);
  const texts: TextMeta[] = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    userId: doc.data().userId,
    name: doc.data().name,
    createdAt: doc.data().createdAt,
  }));
  return texts;
};

//新しく作成したドキュメントのテキストメタデータの取得
export const getNewTextMeta = async (userId: string) => {
  const roomCollectionRef = collection(db, "texts");
  const q = query(
    roomCollectionRef,
    where("userId", "==", `${userId}`),
    orderBy("createdAt"),
  );
  const querySnapshot = await getDocs(q);
  const texts: TextMeta[] = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    userId: doc.data().userId,
    name: doc.data().name,
    createdAt: doc.data().createdAt,
  }));
  const firstText = texts.pop();
  return firstText;
};

//テキスト内容の取得
export const getTextDetail = async (id: string) => {
  const docRef = doc(db, "texts", id);
  const detailTextCollectionRef = collection(docRef, "text");
  const querySnapshot = await getDocs(detailTextCollectionRef);
  const detailText: TextDetail[] = querySnapshot.docs.map((doc) => ({
    summary: doc.data().summary,
    vanilla: doc.data().vanilla,
  }));
  return detailText;
};

//新規テキストの保存
export const saveText = async (
  TextMeta: TextMetaProps,
  textData: TextDetailProps,
  userId: string,
) => {
  const newTextRef = collection(db, "texts");
  await addDoc(newTextRef, TextMeta);
  const newTextMeta = await getNewTextMeta(userId);
  const docRef = doc(db, "texts", `${newTextMeta?.id}`);
  const detailTextCollectionRef = collection(docRef, "text");
  await addDoc(detailTextCollectionRef, textData);
};
