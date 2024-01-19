import Image from "next/image";
import React from "react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center items-center px-4">
      <div className="text-white lg:text-4xl text-3xl font-bold mb-4">
      <Image
            src={"/notFound.svg"}
            className="w-14 h-14 rounded-full"
            alt=""
            width={500}
            height={500}
          />
        <p>Oops! Something went wrong</p>
      </div>
      <p className="text-white text-lg mb-8">
        We could not find the page you were looking for.
      </p>
      <a
        href="/"
        className="bg-white text-primary text-lg font-semibold py-2 px-6 rounded hover:bg-opacity-80"
      >
        Go back Home
      </a>
    </div>
  );
};

export default NotFound;
