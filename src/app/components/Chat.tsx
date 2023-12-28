'use client';
import { useRecoilState } from 'recoil';
import { userIdState } from '@/app/atoms/userId';
import { textIdState } from '../atoms/textId';
import { textTitleState } from '../atoms/textTitle';
import { TextDetail } from '../types/types';
import { useTextDetail } from '../hooks/useTextDetail';
import { Button } from '@mantine/core';
import { collection, deleteDoc, doc, getDocs, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useTextMeta } from '../hooks/useTextMeta';

const Chat = () => {
  const [userId] = useRecoilState(userIdState);
  const [textId, setTextId] = useRecoilState(textIdState);
  const [textTitle, setTitle] = useRecoilState(textTitleState);
  const { textDetail, isMutating } = useTextDetail(textId);
  const { metaTrigger } = useTextMeta(userId);

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
  };

  return (
    <div className=" h-full p-4 flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl text-white font-semibold mb-4">
          {userId ? textTitle : <></>}
        </h1>
        {textTitle == '' ? (
          <></>
        ) : (
          <Button className="mb-4" onClick={() => handleDelete(textId)}>
            削除
          </Button>
        )}
      </div>
      <div className="flex-grow overflow-y-auto mb-4">
        {userId && textDetail ? (
          textDetail.map((textDetail: TextDetail) => (
            <div key={textDetail.summary}>
              <div className="text-white">{textDetail.vanilla}</div>
              <div className="text-white">{textDetail.summary}</div>
            </div>
          ))
        ) : (
          <></>
        )}
      </div>

      <div className="flex-shrink-0 relative">
        <input
          type="text"
          placeholder="Send a Message"
          className="border-2 rounded w-full pr-10 focus:outline-none p-2"
          // onChange={(e) => setInputMessage(e.target.value)}
          // value={inputMessage}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              //  sendMessage();
            }
          }}
        />
        <button
          className="absolute inset-y-0 right-4 flex items-center"
          // onClick={() => sendMessage()}
        >
          {/* <FaPaperPlane /> */}
        </button>
      </div>
    </div>
  );
};

export default Chat;
