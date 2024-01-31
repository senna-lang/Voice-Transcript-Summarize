"use client";
import React from "react";
import Header from "./components/layouts/Header";
import * as Vts from '@/app/features/VTS/components/index';

export const runtime = "edge";

const Home = () => {
  return (
    <div>
      <div className="h-screen items-center justify-center bg-slate-300 md:flex">
        <div className="h-full md:flex xl:w-[1280px]">
          <div className="h-full border-r md:w-1/4">
            <Vts.Sidebar />
          </div>
          <div className="max-h-screen md:w-3/4">
            <Header />
            <Vts.TextData/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
