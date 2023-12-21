'use client';

import { addDoc, collection, doc } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../lib/firebase';
import { useRecoilState } from 'recoil';
import { userIdState } from '@/app/atoms/userId';
import { userState } from '@/app/atoms/user';

export default function Form() {
  const [text, setText] = useState('');
  const [userId, setUserId] = useRecoilState(userIdState);
  const [user, setUser] = useRecoilState(userState);
  console.log(user);
  const submitFile = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api', {
      method: 'POST',
      body: formData,
    });
    const whisperText = await res.json();
    if (whisperText) {
      setText(whisperText);
    }
  };

  const saveTexts = async () => {
    const textData = {
      summary: "test",
      vanilla: text,
    };
    const docRef = doc(db, 'texts', 'prIWjsCjv13h0x2JWJog');
    const detailTextCollectionRef = collection(docRef, 'text');
    console.log(textData)
    await addDoc(detailTextCollectionRef, textData);
  };
  return (
    <div>
      <form onSubmit={submitFile} className="flex flex-col gap-8">
        <div className="flex flex-col">
          <label>音声ファイル</label>
          <input type="file" name="resource" accept="audio/*" required />
        </div>
        <div className="flex justify-center">
          <button type="submit">送信</button>
        </div>
      </form>
      <div>変換: {text}</div>
      <button onClick={saveTexts}>保存</button>
    </div>
  );
}
