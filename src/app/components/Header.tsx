import React from 'react';
import { PasswordInput} from '@mantine/core';
import { useUserState } from '../atoms/user';


const Header = () => {
  const [user] = useUserState();

  return (
    <div className=" flex justify-between bg-white py-4 px-8 items-center h-[7vh]">
      <div className=' w-3/5'>
        <PasswordInput placeholder=" your OPENAI_API_KEY"/>
      </div>
      <div>
         <p>{user}</p>
      </div>
    </div>
  );
};

export default Header;
