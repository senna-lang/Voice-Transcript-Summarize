import { AiOutlineFileAdd } from "react-icons/ai";
import { useRecoilState } from "recoil";
import { fileDropModalState } from "@/common/atoms/fileDropModal";
import { userIdState } from "@/common/atoms/userId";

const AddNewButton = () => {
  const [modalOpened, setModalOpened] = useRecoilState(fileDropModalState);
  const [userId, setUserId] = useRecoilState(userIdState);

  //文字起こしモーダルの展開
  const handleModalOpen = () => {
    if (userId) {
      setModalOpened(true);
    } else {
      window.alert("ログインしてください。");
    }
  };
  return (
    <div
      onClick={handleModalOpen}
      className="my-2 flex cursor-pointer items-center justify-evenly rounded-md border border-black text-slate-500 shadow-lg duration-150 hover:border-white hover:bg-blue-500 hover:text-white hover:shadow-none"
    >
      <span className="p-4 text-2xl">
        <AiOutlineFileAdd />
      </span>
      <h1 className="p-4 text-xl font-semibold">新規作成</h1>
    </div>
  );
};

export default AddNewButton;
