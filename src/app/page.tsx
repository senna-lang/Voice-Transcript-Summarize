"use client";
import React from "react";
import Sidebar from "./components/Sidebar";
import Chat from "./components/TextData";
import Header from "./components/Header";

export const runtime = "edge";

const Home = () => {
  return (
    <div>
      <div className="h-screen items-center justify-center bg-slate-300 md:flex">
        <div className="h-full md:flex xl:w-[1280px]">
          <div className="h-full border-r md:w-1/4">
            <Sidebar />
          </div>
          <div className="max-h-screen md:w-3/4">
            <Header />
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
