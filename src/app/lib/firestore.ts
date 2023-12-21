import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TextDetail, TextMeta } from '../types/types';
import { doc } from 'firebase/firestore';

export const getTextMeta = async (userId: any) => {
  const roomCollectionRef = collection(db, 'texts');
  const q = query(
    roomCollectionRef,
    where('userId', '==', `${userId}`),
    orderBy('createdAt')
  );
  const querySnapshot = await getDocs(q);
  const texts: TextMeta[] = querySnapshot.docs.map(doc => ({
    id: doc.id,
    userId: doc.data().userId,
    name: doc.data().name,
    createdAt: doc.data().createdAt,
  }));
  return texts;
};
export const getNewTextMeta = async (userId: any) => {
  const roomCollectionRef = collection(db, 'texts');
  const q = query(
    roomCollectionRef,
    where('userId', '==', `${userId}`),
    orderBy('createdAt')
  );
  const querySnapshot = await getDocs(q);
  const texts: TextMeta[] = querySnapshot.docs.map(doc => ({
    id: doc.id,
    userId: doc.data().userId,
    name: doc.data().name,
    createdAt: doc.data().createdAt,
  }));
  const firstText = texts.pop();
  return firstText;
};

export const getTextDetail = async (id: string) => {
  const docRef = doc(db, 'texts', id);
  const detailTextCollectionRef = collection(docRef, 'text');
  const querySnapshot = await getDocs(detailTextCollectionRef);
  const detailText: TextDetail[] = querySnapshot.docs.map(doc => ({
    summary: doc.data().summary,
    vanilla: doc.data().vanilla,
  }));
  return detailText;
};
