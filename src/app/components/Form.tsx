'use client';

import { addDoc, collection, doc, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../lib/firebase';
import { useRecoilState } from 'recoil';
import { userIdState } from '@/app/atoms/userId';
import { userState } from '@/app/atoms/user';
import { getNewTextMeta } from '../lib/firestore';

export default function Form() {
  const [text, setText] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [userId, setUserId] = useRecoilState(userIdState);
  const [user, setUser] = useRecoilState(userState);

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
    if (textTitle == '') {
      window.alert('タイトルを入力してください。');
    } else if (text == '') {
      window.alert('生成テキストが空です');
    }
    const TextMeta = {
      name: textTitle,
      userId,
      createdAt: serverTimestamp(),
    };
    const textData = {
      summary: 'test',
      vanilla: text,
    };
    const newTextRef = collection(db, 'texts');
    await addDoc(newTextRef, TextMeta);
    const newTextMeta = await getNewTextMeta(userId);
    const docRef = doc(db, 'texts', `${newTextMeta?.id}`);
    const detailTextCollectionRef = collection(docRef, 'text');
    await addDoc(detailTextCollectionRef, textData);
    setText('');
    setTextTitle('');
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
      <input type="text" onChange={e => setTextTitle(e.target.value)} />
      <button onClick={saveTexts}>保存</button>
    </div>
  );
}
