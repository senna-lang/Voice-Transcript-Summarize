import React from 'react';
import { PasswordInput} from '@mantine/core';
import { useUserIdState } from '@/app/atoms/userId';

const Header = () => {
  const [userId] = useUserIdState();
  return (
    <div className=" flex justify-between bg-white py-4 px-8 items-center h-[7vh]">
      <div className=' w-3/5'>
        <PasswordInput placeholder=" your OPENAI_API_KEY"/>
      </div>
      <div>
         <p>{userId}</p>
      </div>
    </div>
  );
};

export default Header;
