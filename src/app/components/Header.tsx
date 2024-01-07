import React from 'react';
import { PasswordInput } from '@mantine/core';
import { useUserState } from '../atoms/user';
import { useRecoilState } from 'recoil';
import { apiKeyState } from '../atoms/apikey';

const Header = () => {
  const [user] = useUserState();
  const [apiKey, setApiKey] = useRecoilState(apiKeyState);
  const isValidKey = !apiKey.startsWith('sk-') && apiKey !== '';

  return (
    <div className=" md:flex md:justify-between bg-white py-4 px-8 items-center md:h-[7vh]">
      <div className="w-full md:w-3/5">
        <PasswordInput
          placeholder="your OPENAI_API_KEY"
          onChange={e => setApiKey(e.target.value)}
          error={isValidKey ? '無効なkeyです' : null}
        />
      </div>
      <div>{user == null ? <></> : <div>{user}</div>}</div>
    </div>
  );
};

export default Header;
