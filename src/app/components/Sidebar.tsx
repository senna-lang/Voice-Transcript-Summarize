'use client'
import { TextMeta } from '../types/types';
import Link from 'next/link';
import { getTextName } from '../lib/firestore';
import { useEffect, useState } from 'react';

const Sidebar = (userId: any) => {
 const [texts,setTexts] = useState<TextMeta[]>([])
 useEffect(()=> {
   const fetchTextName = async () => {
      const textName = await getTextName(userId)
      setTexts(textName)
   }
   fetchTextName();
 })
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
