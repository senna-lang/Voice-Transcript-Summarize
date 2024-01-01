'use client';
import { TextMeta } from '../types/types';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
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
import { useUserIdState } from '@/app/atoms/userId';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { useEffect } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { FaFileAudio } from 'react-icons/fa6';
import OpenAI from 'openai';
import axios from 'axios';

const ffmpeg = createFFmpeg({
  //ffmpegの初期化
  corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
  log: true,
});
const MAX_FILE_SIZE = 25000000;
const fileTypes = ['mp4', 'mp3', 'm4a'];

const Sidebar = () => {
  const [userId, setUserId] = useUserIdState();
  const [textId, setTextId] = useRecoilState(textIdState);
  const [textTitle, setTextTitle] = useRecoilState(textTitleState);
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [fsModalOpened, setFsModalOpened] = useState<boolean>(false);
  const [vanillaText, setVanillaText] = useState<string>('');
  const [summaryText, setSummaryText] = useState<string>('');
  const { textMeta, metaTrigger, isMutating } = useTextMeta(userId);
  const { detailTrigger } = useTextDetail(textId);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      await ffmpeg.load();
    };
    // Loadチェック
    if (!ffmpeg.isLoaded()) {
      load();
    }
  }, []);

  const submitFile = async (file: File) => {
    setLoading(true);
    ffmpeg.FS('writeFile', file.name, await fetchFile(file));
    await ffmpeg.run(
      '-i', // 入力ファイルを指定
      file.name,
      '-vn', // ビデオストリームを無視し、音声ストリームのみを出力
      '-ar', // オーディオサンプリング周波数
      '16000',
      '-ac', // チャンネル
      '1',
      '-b:a', // ビットレート
      '64k',
      '-f', // 出力ファイルのフォーマット
      'mp3',
      'output.mp3'
    );
    const readData = ffmpeg.FS('readFile', 'output.mp3');
    const audioBlob = new Blob([readData.buffer], { type: 'audio/mp3' });

    // サイズチェック Whisperは最大25MB
    if (audioBlob.size > MAX_FILE_SIZE) {
      alert('サイズが大きすぎます');
      setLoading(false);
      return;
    }

    const audio_file = new File([audioBlob], 'audio.mp3', {
      type: audioBlob.type,
      lastModified: Date.now(),
    });

    const formData = new FormData();
    formData.append('file', audio_file);

    const res = await fetch('/api', {
      method: 'POST',
      body: formData,
    });
    const whisperText = await res.json();
    if (whisperText) {
      setVanillaText(whisperText);
      setFsModalOpened(true);
    }
  };

  const saveTexts = async () => {
    if (vanillaText == '') {
      window.alert('生成テキストが空です');
      return;
    } else if (textTitle == '') {
      window.alert('タイトルを入力してください。');
      return;
    }
    const TextMeta = {
      name: textTitle,
      userId,
      createdAt: serverTimestamp(),
    };
    const textData = {
      summary: 'test',
      vanilla: vanillaText,
    };
    const newTextRef = collection(db, 'texts');
    await addDoc(newTextRef, TextMeta);
    const newTextMeta = await getNewTextMeta(userId);
    const docRef = doc(db, 'texts', `${newTextMeta?.id}`);
    const detailTextCollectionRef = collection(docRef, 'text');
    await addDoc(detailTextCollectionRef, textData);
    setVanillaText('');
    setTextTitle('');
    setFsModalOpened(false);
    setModalOpened(false);
    metaTrigger();
  };

  const createSummary = async () => {
    const prompt = `「${vanillaText}」この文章を元にアジェンダとサマリーを作成してください`;
    const body = JSON.stringify({ prompt: prompt });
    const headers = {
      'Content-Type': 'application/json',
    };
    const res = await axios.post('/api/chatgpt', body, {
      headers: headers,
    });
    const summaryText = res.data;
    setSummaryText(summaryText.choices[0].message.content);
  };

  const handleLogout = () => {
    auth.signOut();
    setUserId(null);
    metaTrigger();
  };

  const selectText = async (title: string, id: string) => {
    setTextTitle(title);
    await setTextId(id);
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
      <div
        onClick={handleModalOpen}
        className="cursor-pointer flex justify-evenly items-center border mt-2 rounded-md hover:bg-blue-800 duration-150"
      >
        <span className="text-white p-4 text-2xl">＋</span>
        <h1 className="text-white text-xl font-semibold p-4">新規作成</h1>
      </div>
      <div className="flex-grow overflow-y-auto">
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
        title="文字起こしするファイルをアップロードします"
        centered
      >
        <FileUploader handleChange={submitFile} name="file" types={fileTypes}>
          <div className=" border-blue-400 border-dashed border-2 rounded-md p-5">
            <div className=" flex flex-col items-center justify-center">
              <FaFileAudio className="w-16 h-16 text-sky-400" />
              <div>音声ファイルを文字起こしする</div>
              <div className=" text-sm text-gray-500">(MP3,MP4,M4A)</div>
            </div>
          </div>
        </FileUploader>
      </Modal>
      <Modal
        opened={fsModalOpened}
        onClose={() => setFsModalOpened(false)}
        fullScreen
        radius={0}
        transitionProps={{ transition: 'fade', duration: 200 }}
      >
        <div className=" h-screen flex">
          <div className="flex flex-col items-center bg-slate-500 w-1/2 rounded-md mx-3 p-8">
            <h1 className=" text-xl font-bold mb-3">
              文字起こしされたテキスト
            </h1>
            <div className=" mb-7">{vanillaText}</div>
            <Button onClick={createSummary}>AIに要約してもらう</Button>
          </div>
          <div className="flex flex-col items-center bg-blue-300 w-1/2 rounded-md mx-3 p-8">
            <h1 className=" text-xl font-bold mb-3">要約されたテキスト</h1>
            <div className=" mb-7">{summaryText}</div>
            <Button onClick={saveTexts}>保存する</Button>
          </div>
        </div>
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
