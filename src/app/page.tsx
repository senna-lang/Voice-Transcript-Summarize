'use client';
import React from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/TextData';
import Header from './components/Header';

export const runtime = 'edge';

const Home = () => {
  return (
    <div>
      <div className="flex h-screen justify-center items-center bg-slate-300">
        <div className="h-full flex" style={{ width: '1280px' }}>
          <div className="w-1/4 h-full border-r">
            <Sidebar />
          </div>
          <div className="w-3/4 max-h-screen">
            <Header/>
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
