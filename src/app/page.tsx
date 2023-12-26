'use client';
import React from 'react';
import Form from './components/Form';
import Link from 'next/link';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';

export const runtime = 'edge';

const Home = () => {
  return (
    <div>
      {/* <Form />
      <Link href='/profile'>ユーザー情報</Link> */}
      <div className="flex h-screen justify-center items-center bg-dark-mode">
        <div className="h-full flex" style={{ width: '1280px' }}>
          <div className="w-1/5 h-full border-r"><Sidebar /></div>
          <div className="w-4/5 h-full"><Chat /></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
