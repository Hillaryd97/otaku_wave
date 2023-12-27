import React from "react";
import Image from "next/image";

function FollowerComponent({ imageSrc, name, status }) {
  return (
    <div className="flex justify-between py-3 px-2 bg-secondary bg-opacity-70 items-center">
      <div className="flex gap-4 items-center">
        <Image
          src={imageSrc}
          width={500}
          height={500}
          className="rounded-full w-16 h-16"
          alt={name}
        />
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-sm text-gray-700">{status}</p>
        </div>
      </div>
      <button className="border border-red-500 h-fit text-red-500 font-bold px-3 py-1 shadow hover:bg-red-500 hover:text-white duration-300">
        Follow
      </button>
    </div>
  );
}

export default FollowerComponent;
