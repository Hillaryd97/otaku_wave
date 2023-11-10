import Link from "next/link";
import React, { useEffect } from "react";
import { IoIosNotifications } from "react-icons/io";

function TopNav() {
  return (
    <nav className="fixed w-full top-0 px-3 py-2 opacity-80 bg-background shadow-sm ">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Otaku<span className="text-primary">Wave</span>
        </h1>
        <div className="relative text-xl text-primary ">
          <IoIosNotifications size={32} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white"></span>
        </div>
      </div>
    </nav>
  );
}

export default TopNav;
