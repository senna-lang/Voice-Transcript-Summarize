'use client';
import { TextMeta } from '../types/types';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { userIdState } from '@/app/atoms/userId';
import { textIdState } from '../atoms/textId';
import { textTitleState } from '../atoms/textTitle';
import { auth } from '../lib/firebase';
import { BiLogOut } from 'react-icons/bi';
import Link from 'next/link';
import { Modal, Button, Textarea } from '@mantine/core';
import { addDoc, collection, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getNewTextMeta } from '../lib/firestore';
import { useTextMeta } from '../hooks/useTextMeta';
import { useTextDetail } from '../hooks/useTextDetail';

const Sidebar = () => {
  const [userId, setUserId] = useRecoilState(userIdState);
  const [textId, setTextId] = useRecoilState(textIdState);
  const [textTitle, setTextTitle] = useRecoilState(textTitleState);
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [fsModalOpened, setFsModalOpened] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const { textMeta, metaTrigger, isMutating } = useTextMeta(userId);
  const { detailTrigger } = useTextDetail(textId);

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
      setFsModalOpened(true);
    }
  };

  const saveTexts = async () => {
    if (textTitle == '') {
      window.alert('タイトルを入力してください。');
      return;
    } else if (text == '') {
      window.alert('生成テキストが空です');
      return;
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
    setFsModalOpened(false);
    setModalOpened(false);
    metaTrigger();
  };

  const handleLogout = () => {
    auth.signOut();
    metaTrigger();
  };

  const selectText = (title: string, id: string) => {
    setTextId(id);
    setTextTitle(title);
    detailTrigger();
  };

  const handleModalOpen = () => {
    if (userId) {
      setModalOpened(true);
    } else {
      window.alert('ログインしてください。');
    }
  };

  return (
    <div className="bg-custom-blue h-full overflow-y-auto px-5 flex flex-col">
      <div className="flex-grow">
        <div
          onClick={handleModalOpen}
          className="cursor-pointer flex justify-evenly items-center border mt-2 rounded-md hover:bg-blue-800 duration-150"
        >
          <span className="text-white p-4 text-2xl">＋</span>
          <h1 className="text-white text-xl font-semibold p-4">New Chat</h1>
        </div>
        <ul>
          {textMeta ? (
            textMeta.map((meta: TextMeta) => (
              <li
                key={meta.id}
                className="cursor-pointer border-b p-4 text-slate-100 hover:bg-slate-700 duration-150 "
                onClick={() => selectText(meta.name, meta.id)} //text.idとtext.nameをグローバルに管理する必要がある
              >
                {meta.name}
              </li>
            ))
          ) : (
            <></>
          )}
        </ul>
      </div>
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Authentication"
        centered
      >
        <form onSubmit={submitFile}>
          <div className="flex flex-col">
            <label>音声ファイル</label>
            <input type="file" name="resource" accept="audio/*" required />
          </div>
          <div className="mt-2">
            <Button type="submit" fullWidth>
              送信
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        opened={fsModalOpened}
        onClose={() => setFsModalOpened(false)}
        title="This is a fullscreen modal"
        fullScreen
        radius={0}
        transitionProps={{ transition: 'fade', duration: 200 }}
      >
        <div>変換: {text}</div>
        <input
          type="text"
          className=" border"
          onChange={e => setTextTitle(e.target.value)}
        />
        <Button loading={isMutating} onClick={saveTexts}>
          保存
        </Button>
      </Modal>

      {userId && (
        <div className="mb-2 p-4 text-slate-100 text-lg font-medium">
          {userId}
        </div>
      )}
      {userId ? (
        <div
          onClick={() => handleLogout()}
          className="text-lg flex items-center justify-evenly mb-2 cursor-pointer p-4 text-slate-100 hover:bg-slate-700 duration-150"
        >
          <BiLogOut />
          <span>ログアウト</span>
        </div>
      ) : (
        <Link
          href="/auth/login"
          className="text-lg flex items-center justify-evenly mb-2 cursor-pointer p-4 text-slate-100 hover:bg-slate-700 duration-150"
        >
          <BiLogOut />
          <span>ログイン</span>
        </Link>
      )}
    </div>
  );
};

export default Sidebar;
