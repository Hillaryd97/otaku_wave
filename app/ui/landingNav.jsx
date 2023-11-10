import React from "react";
import Link from "next/link";

export default function nav() {
  return (
    <nav className="container mx-auto pt-4 px-1 md:px-">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-xl md:text-3xl text-secondary shadow-lg">
          Otaku<span className="text-primary">Wave</span>
        </h1>
        <div className="flex justify-between items-center text-white">
          <Link
            href={"/login"}
            className="flex items-center justify-center px-4 py-1.5 text-base font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-red-800 duration-500"
          >
            Login
          </Link>

          <a href=""></a>
        </div>
      </div>
    </nav>
  );
}
