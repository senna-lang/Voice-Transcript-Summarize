import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TextMeta } from '../types/types';

export const getTextName = async (userId: any) => {
  const roomCollectionRef = collection(db, 'texts');
  const q = query(
    roomCollectionRef,
    where('userId', '==', `${userId}`),
    orderBy('createdAt')
  );
  const querySnapshot = await getDocs(q);
  // const texts: TextMeta[] = [];

  // querySnapshot.forEach(doc => {
  //   texts.push(doc.data() as TextMeta);
  // });
  const texts: TextMeta[] = querySnapshot.docs.map(doc => ({
    id: doc.id,
    userId: doc.data().userId,
    name: doc.data().name,
    createdAt: doc.data().createdAt,
  }));
  console.log(texts);
  return texts;
};
