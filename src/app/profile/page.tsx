'use client';
import React, { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Text } from '../types/types';

const Profile = () => {
  const [texts, setTexts] = useState<Text[]>([]);
  useEffect(() => {
    const fetchTextData = async () => {
      const roomCollectionRef = collection(db, 'texts');
      const q = query(roomCollectionRef, orderBy('createdAt'));
      const unsubscribe = onSnapshot(q, snapshot => {
        const newTexts: any = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTexts(newTexts);
      });
    };
    fetchTextData();
  }, []);
  console.log(texts);
  return <div></div>;
};

export default Profile;
