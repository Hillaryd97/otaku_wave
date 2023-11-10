"use client"

import React from "react";
import BottomNav from "../ui/bottomNav";
import { IoIosNotifications } from "react-icons/io";

function Topics() {
  return (
    
    <main className="bg-background flex min-h-screen w-full items-center justify-center text-center">
     <nav className="absolute w-full mb-10 top-0 px-3 py-2 opacity-80 bg-background shadow-sm ">
      <div className="flex justify-between items-center">
        <h1 className="text-xl text-center font-semibold">
         Topics
        </h1>
        <div className="relative text-xl text-primary ">
          <IoIosNotifications size={32} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white"></span>
        </div>
      </div>
    </nav>
     <div className="flex h-96 w-full items-center justify-center text-center">Topics</div>
     <BottomNav />
    </main>
  );
}

export default Topics;
