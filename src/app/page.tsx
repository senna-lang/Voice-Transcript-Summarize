'use client'
import React from 'react';
import Form from './components/Form';
import Link from 'next/link';
import { useRecoilState } from 'recoil';
import { userIdState } from '@/app/atoms/userId';
import { userState } from '@/app/atoms/user';

export const runtime = "edge";

const Home = () => {
  const [userId, setUserId] = useRecoilState(userIdState);
  const [user, setUser] = useRecoilState(userState);
  return (
    <div>
      <Form />
      <Link href='/profile'>ユーザー情報</Link>
    </div>
  );
};

export default Home;
