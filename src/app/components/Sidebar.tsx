'use client';
import { TextMeta } from '../types/types';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { textIdState } from '../atoms/textId';
import { textTitleState } from '../atoms/textTitle';
import { auth } from '../lib/firebase';
import { BiLogOut } from 'react-icons/bi';
import Link from 'next/link';
import { Modal, Button, Textarea, TextInput } from '@mantine/core';
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
import axios from 'axios';
import ReactLoading from 'react-loading';
import { IconContext } from 'react-icons';
import { RiRobot2Line } from 'react-icons/ri';
import { HiMiniArrowsPointingOut } from 'react-icons/hi2';
import { FaEnvelopeOpenText } from 'react-icons/fa';
import { FaRegFileLines } from 'react-icons/fa6';
import { AiOutlineFileAdd } from 'react-icons/ai';

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
    const cleanedText = whisperText.replace(/^\s*$[\n\r]{1,}/gm, '');
    setVanillaText(cleanedText);
    setLoading(false);
    setFsModalOpened(true);
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
      summary: summaryText,
      vanilla: vanillaText,
    };
    const newTextRef = collection(db, 'texts');
    await addDoc(newTextRef, TextMeta);
    const newTextMeta = await getNewTextMeta(userId);
    const docRef = doc(db, 'texts', `${newTextMeta?.id}`);
    const detailTextCollectionRef = collection(docRef, 'text');
    await addDoc(detailTextCollectionRef, textData);
    setVanillaText('');
    setSummaryText('');
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
    <div className="h-full overflow-y-auto px-5 flex flex-col bg-white">
      <div className="flex items-center justify-center my-12">
        <div className=" font-extrabold text-4xl mr-1">VTS</div>
        <div className=" font-extrabold text-4xl text-blue-600">
          <HiMiniArrowsPointingOut />
        </div>
      </div>
      <div
        onClick={handleModalOpen}
        className="cursor-pointer flex justify-evenly items-center border border-black my-2 rounded-md shadow-lg text-slate-500 hover:bg-blue-500 hover:shadow-none hover:text-white hover:border-white duration-150"
      >
        <span className="p-4 text-2xl ">
          <AiOutlineFileAdd />
        </span>
        <h1 className="text-xl font-semibold p-4">新規作成</h1>
      </div>
      <div className="flex-grow overflow-y-auto">
        <ul>
          {textMeta ? (
            textMeta.map((meta: TextMeta) => (
              <li
                key={meta.id}
                className="cursor-pointer flex items-center border-b border-black mb-2 p-4 text-slate-500 font-semibold hover:rounded-md hover:bg-blue-500 hover:text-white hover:border-white duration-150 "
                onClick={() => selectText(meta.name, meta.id)} 
              >
                <span className="inline-block mr-2">
                  <FaRegFileLines />
                </span>
                <span className=" inline-block">{meta.name}</span>
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
          {loading ? (
            <div className=" border-blue-400 border-dashed border-2 rounded-md p-5">
              <div className=" flex flex-col items-center justify-center">
                <div className=" my-5">
                  <ReactLoading
                    type="bars"
                    color="rgb(96 165 250)"
                    height="50px"
                    width="50px"
                    className="mx-auto"
                  />
                </div>
                <div>アップロード中...</div>
              </div>
            </div>
          ) : (
            <div className=" border-blue-400 border-dashed border-2 rounded-md p-5">
              <div className=" flex flex-col items-center justify-center">
                <FaFileAudio className="w-16 h-16 text-sky-400" />
                <div>音声ファイルを文字起こしする</div>
                <div className=" text-sm text-gray-500">(MP3,MP4,M4A)</div>
              </div>
            </div>
          )}
        </FileUploader>
      </Modal>
      <Modal
        opened={fsModalOpened}
        onClose={() => {
          setFsModalOpened(false);
          setSummaryText('');
        }}
        fullScreen
        radius={0}
        transitionProps={{ transition: 'fade', duration: 200 }}
      >
        <div className=" h-[90vh] flex">
          <div className="flex flex-col items-center w-1/2 mx-3 pw-4 pb-4">
            <div className="mb-2 flex flex-col items-center">
              <h1 className=" text-xl font-bold mb-3">
                文字起こしされたテキスト
              </h1>
            </div>
            <div className=" mb-7 bg-slate-500 rounded-lg p-8 overflow-y-auto min-h-[70vh]">
              {vanillaText}
            </div>
            <div className=" flex ">
              <IconContext.Provider value={{ size: '100px' }}>
                <FaEnvelopeOpenText />
              </IconContext.Provider>
              <Button onClick={createSummary}>AIに要約してもらう⇨</Button>
            </div>
          </div>
          <div className="flex flex-col items-cente w-1/2 rounded-md mx-3 pw-4 pb-4">
            <div className="mb-2 flex flex-col items-center">
              <h1 className=" text-xl font-bold mb-3">
                文字起こしされたテキスト
              </h1>
            </div>
            <div className=" mb-7 bg-slate-500 rounded-md p-8 overflow-y-auto min-h-[70vh]">
              {summaryText}
            </div>
            <div className="flex">
              <IconContext.Provider value={{ size: '100px' }}>
                <RiRobot2Line />
              </IconContext.Provider>
              <div className="flex justify-between">
                <Button onClick={saveTexts}>保存する</Button>
                <TextInput
                  placeholder="タイトルを入力してください"
                  onChange={e => setTextTitle(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {userId ? (
        <div
          onClick={() => handleLogout()}
          className="text-lg font-semibold flex items-center justify-evenly mb-4 cursor-pointer p-4 rounded-md text-slate-900 hover:bg-blue-500 hover:text-white duration-150"
        >
          <BiLogOut />
          <span>ログアウト</span>
        </div>
      ) : (
        <Link
          href="/auth/login"
          className="text-lg font-semibold flex items-center justify-evenly mb-4 cursor-pointer p-4 text-slate-900 hover:bg-blue-500 duration-150"
        >
          <BiLogOut />
          <span>ログイン</span>
        </Link>
      )}
    </div>
  );
};

export default Sidebar;
