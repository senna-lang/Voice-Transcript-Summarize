"use client";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { collection, deleteDoc, doc, getDocs, query } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { FaRegTrashAlt } from "react-icons/fa";
import { TextDetail } from "@/app/types/types";
import { useTextMeta } from "@/app/hooks/useTextMeta";
import { useTextDetail } from "@/app/hooks/useTextDetail";
import { useRecoilState } from "recoil";
import { userIdState } from "@/app/atoms/userId";
import { textIdState } from "@/app/atoms/textId";
import { textTitleState } from "@/app/atoms/textTitle";

const TextData = () => {
  const [userId] = useRecoilState(userIdState);
  const [textId, setTextId] = useRecoilState(textIdState);
  const [textTitle, setTitle] = useRecoilState(textTitleState);
  const { textDetail } = useTextDetail(textId);
  const { metaTrigger } = useTextMeta(userId);
  const [opened, { open, close }] = useDisclosure(false);

  //テキストデータの削除
  const handleDelete = async (textId: string) => {
    try {
      const docRef = doc(db, "texts", textId);
      await deleteDoc(docRef);
      const subCollectionRef = collection(docRef, "text");
      const subDocsQuery = query(subCollectionRef);
      const subDocsSnapshot = await getDocs(subDocsQuery);
      subDocsSnapshot.forEach(async (subDoc) => {
        const subDocRef = doc(subCollectionRef, subDoc.id);
        await deleteDoc(subDocRef);
      });
      metaTrigger();
      setTitle("");
      setTextId("");
    } catch (err) {
      alert("削除に失敗しました。もう１度お試しください。");
      console.log("エラーが発生しました。", err);
    } finally {
      close;
    }
  };

  return (
    <div className="flex h-[93vh] flex-col bg-slate-100 p-6">
      <div className=" min-h-full overflow-y-auto rounded-lg bg-white p-5">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold ">{userId ? textTitle : <></>}</h1>
          {textTitle == "" ? (
            <></>
          ) : (
            <div
              className="inline-block cursor-pointer text-xl font-semibold text-blue-500 "
              onClick={open}
            >
              <FaRegTrashAlt />
            </div>
          )}
        </div>
        <Modal opened={opened} onClose={close} centered withCloseButton={false}>
          <div className="p-4">
            <h1 className=" mb-1 w-full text-left text-lg">
              本当に削除してもいいですか？
            </h1>
            <p className=" mb-10  text-slate-600">
              一度削除すると復元できません
            </p>
            <div className="flex justify-end">
              <Button onClick={close} className="mr-2" variant="outline">
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
        <div className="mb-4 flex-grow">
          {userId && textDetail ? (
            textDetail.map((textDetail: TextDetail) => (
              <div key={textDetail.summary}>
                <div className="mb-5">
                  <h2 className=" mb-2 w-full text-center text-2xl font-semibold">
                    Summary
                  </h2>
                  <div className=" whitespace-pre-wrap break-words rounded-lg border-2 border-dashed border-blue-300 p-6 leading-relaxed">
                    <div>{textDetail.summary}</div>
                  </div>
                </div>
                <div>
                  <h2 className=" mb-2 w-full text-center text-2xl font-semibold">
                    Transcript
                  </h2>
                  <div className="whitespace-pre-wrap break-words rounded-lg border-2 border-dashed border-blue-300 p-6 leading-relaxed">
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

export default TextData;
