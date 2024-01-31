import { useTextDetail } from "@/common/hooks/useTextDetail";
import { useTextMeta } from "@/common/hooks/useTextMeta";
import { FaRegFileLines } from "react-icons/fa6";
import { TextMeta } from "@/common/types/types";
import { useRecoilState } from "recoil";
import { useUserIdState } from "@/common/atoms/userId";
import { textIdState } from "@/common/atoms/textId";
import { textTitleState } from "@/common/atoms/textTitle";

const TextList = () => {
  const [userId, setUserId] = useUserIdState();
  const [textId, setTextId] = useRecoilState(textIdState);
  const { textMeta } = useTextMeta(userId);
  const { detailTrigger } = useTextDetail(textId);
  const [textTitle, setTextTitle] = useRecoilState(textTitleState);

  const selectText = async (title: string, id: string) => {
    try {
      setTextTitle(title);
      setTextId(id);
      detailTrigger();
    } catch (err) {
      alert("データの取得に失敗しました。もう１度お試しください。");
      console.log("エラーが発生しました", err);
    }
  };

  return (
    <div className="flex-grow overflow-y-auto">
      <ul>
        {textMeta ? (
          textMeta.map((meta: TextMeta) => (
            <li
              key={meta.id}
              className="mb-2 flex cursor-pointer items-center border-b border-black p-4 font-semibold text-slate-500 duration-150 hover:rounded-md hover:border-white hover:bg-blue-500 hover:text-white "
              onClick={() => selectText(meta.name, meta.id)}
            >
              <span className="mr-2 inline-block">
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
  );
};

export default TextList;
