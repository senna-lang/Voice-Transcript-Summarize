'use client';
import { TextMeta } from '../types/types';
import Link from 'next/link';
import { getTextName } from '../lib/firestore';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { userIdState } from '@/app/atoms/userId';

const Sidebar = () => {
  const [userId, setUserId] = useRecoilState(userIdState);
  const [texts, setTexts] = useState<TextMeta[]>([]);
  useEffect(() => {
    if (userId) {
      const fetchTextName = async () => {
        const textName = await getTextName(userId);
        setTexts(textName);
      };
      fetchTextName();
    }
  }, [userId]);
  console.log(texts);
  return (
    <div>
      {texts.map((text: TextMeta) => (
        <Link key={text.id} href={`/detailtexts/${text.id}`}>
          {text.name}
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
