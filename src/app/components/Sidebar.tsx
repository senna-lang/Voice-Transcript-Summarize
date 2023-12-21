'use client';
import { TextMeta } from '../types/types';
import Link from 'next/link';
import { getTextMeta } from '../lib/firestore';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { userIdState } from '@/app/atoms/userId';

const Sidebar = () => {
  const [userId, setUserId] = useRecoilState(userIdState);
  const [texts, setTexts] = useState<TextMeta[]>([]);
  useEffect(() => {
    if (userId) {
      const fetchTextName = async () => {
        const textName = await getTextMeta(userId);
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
