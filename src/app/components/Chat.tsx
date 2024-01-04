'use client';
import { useRecoilState } from 'recoil';
import { userIdState } from '@/app/atoms/userId';
import { textIdState } from '../atoms/textId';
import { textTitleState } from '../atoms/textTitle';
import { TextDetail } from '../types/types';
import { useTextDetail } from '../hooks/useTextDetail';
import { Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { collection, deleteDoc, doc, getDocs, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useTextMeta } from '../hooks/useTextMeta';
import { FaRegTrashAlt } from 'react-icons/fa';

const Chat = () => {
  const [userId] = useRecoilState(userIdState);
  const [textId, setTextId] = useRecoilState(textIdState);
  const [textTitle, setTitle] = useRecoilState(textTitleState);
  const { textDetail, isMutating } = useTextDetail(textId);
  const { metaTrigger } = useTextMeta(userId);
  const [opened, { open, close }] = useDisclosure(false);

  const handleDelete = async (textId: string) => {
    const docRef = doc(db, 'texts', textId);
    await deleteDoc(docRef);
    const subCollectionRef = collection(docRef, 'text');
    const subDocsQuery = query(subCollectionRef);
    const subDocsSnapshot = await getDocs(subDocsQuery);
    subDocsSnapshot.forEach(async subDoc => {
      const subDocRef = doc(subCollectionRef, subDoc.id);
      await deleteDoc(subDocRef);
    });
    metaTrigger();
    setTitle('');
    setTextId('');
    close;
  };

  return (
    <div className="p-6 flex flex-col bg-slate-100 h-[93vh]">
      <div className=" min-h-full bg-white p-5 rounded-lg overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold ">{userId ? textTitle : <></>}</h1>
          {textTitle == '' ? (
            <></>
          ) : (
            <div
              className="font-semibold text-xl text-blue-500 inline-block cursor-pointer "
              onClick={open}
            >
              <FaRegTrashAlt />
            </div>
          )}
        </div>
        <Modal opened={opened} onClose={close} centered withCloseButton={false}>
          <div className="p-4">
            <h1 className=" w-full text-lg text-left mb-1">
              本当に削除してもいいですか？
            </h1>
            <p className=" text-slate-600  mb-10">
              一度削除すると復元できません
            </p>
            <div className="flex justify-end">
              <Button onClick={close} className="mr-2" variant='outline' >
                キャンセル
              </Button>
              <Button
                onClick={() => {
                  handleDelete(textId);
                  close();
                }}
                color="red"
              >
                削除
              </Button>
            </div>
          </div>
        </Modal>
        <div className="flex-grow mb-4">
          {userId && textDetail ? (
            textDetail.map((textDetail: TextDetail) => (
              <div key={textDetail.summary}>
                <div className="mb-5">
                  <h2 className=" font-semibold text-2xl w-full text-center mb-2">
                    Summary
                  </h2>
                  <div className=" border-dashed border-blue-300 border-2 p-6 rounded-lg">
                    <div>{textDetail.summary}</div>
                  </div>
                </div>
                <div>
                  <h2 className=" font-semibold text-2xl w-full text-center mb-2">
                    Transcript
                  </h2>
                  <div className="border-dashed border-blue-300 border-2 p-6 rounded-lg">
                    <div>{textDetail.vanilla}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
