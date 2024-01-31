import { PasswordInput } from "@mantine/core";
import { useRecoilState } from "recoil";
import { useUserState } from "@/app/atoms/user";
import { apiKeyState } from "@/app/atoms/apikey";

const Header = () => {
  const [user] = useUserState();
  const [apiKey, setApiKey] = useRecoilState(apiKeyState);
  const isValidKey = !apiKey.startsWith("sk-") && apiKey !== "";

  return (
    <div className=" items-center bg-white px-8 py-4 md:flex md:h-[7vh] md:justify-between">
      <div className="w-full md:w-3/5">
        <PasswordInput
          placeholder="your OPENAI_API_KEY"
          onChange={(e) => setApiKey(e.target.value)}
          error={isValidKey ? "無効なkeyです" : null}
        />
      </div>
      <div>{user == null ? <></> : <div>{user}</div>}</div>
    </div>
  );
};

export default Header;
