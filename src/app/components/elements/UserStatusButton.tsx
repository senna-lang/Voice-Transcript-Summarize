import Link from "next/link";
import { auth } from "@/app/lib/firebase";
import { useRecoilState } from "recoil";
import { BiLogOut } from "react-icons/bi";
import { useUserState } from "@/app/atoms/user";
import { useUserIdState } from "@/app/atoms/userId";
import { apiKeyState } from "@/app/atoms/apikey";
import { textTitleState } from "@/app/atoms/textTitle";
import { useTextMeta } from "@/app/hooks/useTextMeta";

const UserStatusButton = () => {
  const [user, setUser] = useUserState();
  const [apiKey, setApiKey] = useRecoilState(apiKeyState);
  const [userId, setUserId] = useUserIdState();
  const [textTitle, setTextTitle] = useRecoilState(textTitleState);
  const { textMeta, metaTrigger } = useTextMeta(userId);

  const handleLogout = () => {
    try {
      setUser(null);
      setUserId("");
      setApiKey("");
      setTextTitle("");
      auth.signOut();
      metaTrigger();
    } catch (err) {
      alert("ログアウトに失敗しました。");
      console.log("エラーが発生しました。", err);
    }
  };

  return (
    <div>
      {user ? (
        <div
          onClick={() => handleLogout()}
          className="mb-4 flex cursor-pointer items-center justify-evenly rounded-md p-4 text-lg font-semibold text-slate-900 duration-150 hover:bg-blue-500 hover:text-white"
        >
          <BiLogOut />
          <span>ログアウト</span>
        </div>
      ) : (
        <Link
          href="/auth/login"
          className="mb-4 flex cursor-pointer items-center justify-evenly rounded-md p-4 text-lg font-semibold text-slate-900 duration-150 hover:bg-blue-500"
        >
          <BiLogOut />
          <span>ログイン</span>
        </Link>
      )}
    </div>
  );
};

export default UserStatusButton;
