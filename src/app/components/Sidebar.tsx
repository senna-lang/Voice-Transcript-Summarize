'use client';
import { TextMeta } from '../types/types';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { textIdState } from '../atoms/textId';
import { textTitleState } from '../atoms/textTitle';
import { auth } from '../lib/firebase';
import { BiLogOut } from 'react-icons/bi';
import Link from 'next/link';
import { Modal, Button, TextInput, Stepper, Group } from '@mantine/core';
import { addDoc, collection, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getNewTextMeta } from '../lib/firestore';
import { useTextMeta } from '../hooks/useTextMeta';
import { useTextDetail } from '../hooks/useTextDetail';
import { useUserIdState } from '@/app/atoms/userId';
import { apiKeyState } from '../atoms/apikey';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { useEffect } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { FaFileAudio } from 'react-icons/fa6';
import ReactLoading from 'react-loading';
import { HiMiniArrowsPointingOut } from 'react-icons/hi2';
import { FaRegFileLines } from 'react-icons/fa6';
import { AiOutlineFileAdd } from 'react-icons/ai';
import OpenAI from 'openai';
import { useUserState } from '../atoms/user';
import { transcription } from '../lib/openai';

const ffmpeg = createFFmpeg({
  //ffmpegの初期化
  corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
  log: true,
});
const MAX_FILE_SIZE = 25000000;
const fileTypes = ['mp4', 'mp3', 'm4a'];

const Sidebar = () => {
  const [userId, setUserId] = useUserIdState();
  const [user, setUser] = useUserState();
  const [textId, setTextId] = useRecoilState(textIdState);
  const [textTitle, setTextTitle] = useRecoilState(textTitleState);
  const [apiKey, setApiKey] = useRecoilState(apiKeyState);
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [fsModalOpened, setFsModalOpened] = useState<boolean>(false);
  const [vanillaText, setVanillaText] = useState<string>('');
  const [summaryText, setSummaryText] = useState<string | null>('');
  const { textMeta, metaTrigger, isMutating } = useTextMeta(userId);
  const { detailTrigger } = useTextDetail(textId);
  const [loading1, setLoading1] = useState<boolean>(false);
  const [loading2, setLoading2] = useState<boolean>(false);
  const [active, setActive] = useState(1);
  const nextStep = () =>
    setActive(current => (current < 3 ? current + 1 : current));

  const openAi = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });
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
    setLoading1(true);
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
      setLoading1(false);
      return;
    }

    const audio_file = new File([audioBlob], 'audio.mp3', {
      type: audioBlob.type,
      lastModified: Date.now(),
    });

    const formData = new FormData();
    formData.append('file', audio_file);

    const whisperText = await transcription(formData);
    const cleanedText = whisperText.replace(/^\s*$[\n\r]{1,}/gm, '');
    setVanillaText(cleanedText);
    setLoading1(false);
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
    if (apiKey == '') {
      window.alert('openaiのAPIKeyをセットしてください');
      setLoading1(false);
    } else {
      const prompt = `「${vanillaText}」この文章を元にアジェンダとサマリーを作成してください`;
      try {
        const gptRes = await openAi.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-3.5-turbo-1106',
          temperature: 0,
        });
        setSummaryText(gptRes.choices[0].message.content);
        nextStep();
        setLoading1(false);
      } catch {
        window.alert('APIKeyが間違っている可能性があります。');
        setLoading1(false);
      }
    }
  };

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
    setApiKey('');
    setTextTitle('');
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
        <span className="p-4 text-2xl">
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

      {user ? (
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
          className="text-lg font-semibold flex items-center justify-evenly mb-4 cursor-pointer p-4 rounded-md text-slate-900 hover:bg-blue-500 duration-150"
        >
          <BiLogOut />
          <span>ログイン</span>
        </Link>
      )}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="文字起こしするファイルをアップロードします"
        centered
      >
        <FileUploader handleChange={submitFile} name="file" types={fileTypes}>
          {loading1 ? (
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
          setActive(1);
          setLoading1(false);
          setLoading2(false);
        }}
        fullScreen
        radius={0}
        transitionProps={{ transition: 'fade', duration: 200 }}
      >
        <div className=" h-[90vh] mx-3 md:flex">
          <div className="flex flex-col items-center md:w-1/2 md:mb-0 mb-4 p-8 bg-slate-100 rounded-lg">
            <div className=" w-full h-1/2">
              <h2 className=" font-semibold text-2xl w-full text-center mb-4">
                Transcript
              </h2>
              <div className="h-[85%] border-dashed border-blue-300 border-2 p-6 mb-2 rounded-lg overflow-y-auto">
                {vanillaText}
              </div>
            </div>
            <div className=" w-full h-1/2">
              <h2 className=" font-semibold text-2xl w-full text-center m-4">
                Summary
              </h2>
              <div className="h-[85%] border-dashed border-blue-300 border-2 p-6 rounded-lg overflow-y-auto">
                {summaryText}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center md:w-1/2 rounded-lg md:mx-3 p-8 bg-slate-100">
            <Stepper active={active} orientation="vertical" size="xl">
              <Stepper.Step
                label="Transcription"
                description="文字起こし"
              ></Stepper.Step>
              <Stepper.Step
                label="Save or Summarize"
                description="保存か要約を選んでください"
                loading={loading1}
              >
                文字起こしのみを保存 or ChatGptに要約してもらう
              </Stepper.Step>
              <Stepper.Step
                label="Save All"
                description="全て保存"
                loading={loading2}
              >
                文字起こしと要約の両方を保存する
              </Stepper.Step>
            </Stepper>

            <Group justify="between" mt="xl">
              {active == 1 && (
                <div className="flex flex-col">
                  <Button
                    onClick={() => {
                      setLoading1(true);
                      createSummary();
                    }}
                    className="mb-2"
                    disabled={loading1}
                  >
                    要約してもらう
                  </Button>
                  <div className=" flex">
                    <TextInput
                      placeholder="タイトルを入力"
                      onChange={e => setTextTitle(e.target.value)}
                    />
                    <Button
                      variant="default"
                      onClick={() => {
                        setLoading1(true);
                        saveTexts();
                        setLoading1(false);
                      }}
                      disabled={loading1}
                    >
                      保存する
                    </Button>
                  </div>
                </div>
              )}
              {active == 2 && (
                <div className="flex flex-col">
                  <Button
                    onClick={() => {
                      setLoading2(true);
                      createSummary();
                      nextStep();
                      setLoading2(false);
                    }}
                    className="mb-2 opacity-0"
                    disabled={loading2}
                  >
                    要約してもらう
                  </Button>
                  <div className=" flex">
                    <TextInput
                      placeholder="タイトルを入力"
                      onChange={e => setTextTitle(e.target.value)}
                    />
                    <Button
                      variant="default"
                      onClick={() => {
                        setLoading2(true);
                        saveTexts();
                        setLoading2(false);
                      }}
                      disabled={loading2}
                    >
                      保存する
                    </Button>
                  </div>
                </div>
              )}
            </Group>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Sidebar;
