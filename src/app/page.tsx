'use client'
import React from 'react';
import Form from './components/Form';
import Link from 'next/link';

export const runtime = "edge";

const Home = () => {
  return (
    <div>
      <Form />
      <Link href='/profile'>ユーザー情報</Link>
    </div>
  );
};

export default Home;
