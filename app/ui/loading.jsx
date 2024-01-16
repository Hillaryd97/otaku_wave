import Image from "next/image";
import React from "react";

function Loading() {
  return (
    <div className=" flex items-center w-full z-60 justify-center h-96 mt-16 text-white">
      <div className="bg-gray-800 p-8 rounded-lg z-60">
        <Image height={200} width={200} src={"/Paw.gif"} priority className="mx-auto z-60" alt="loading image" />
        <p className="text-center mt-4">Loading...</p>
      </div>
    </div>
  );
}

export default Loading;
