"use client";

import React from "react";
import BottomNav from "../ui/bottomNav";
import Link from "next/link";
import Image from "next/image";
import { IoMdArrowBack } from "react-icons/io";

function Followers() {
  return (
    <main className="bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href={"/profile"}>
            <IoMdArrowBack size={20} />
          </Link>
          <h2 className="text-lg text-center py-2 font-semibold">Friends</h2>
          <div></div>{" "}
        </div>

        <div className="flex justify-between mb-2 w-full">
          <Link
            href={"/followers"}
            className={`h-fit text-center bg-secondary bg-opacity-70 px-4 py-2 w-full focus:font-bold focus:border-primary hover:bg-opacity-40  transform duration-300  text-gray-800 border-b-2`}
          >
            Followers
          </Link>
          <Link
            href={"/following"}
            className={`h-fit text-center bg-secondary bg-opacity-70 px-4 py-2 w-full hover:bg-opacity-40   font-bold border-primary transform duration-300  text-gray-800 border-b-2`}
          >
            Following
          </Link>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between py-3 px-2 bg-secondary bg-opacity-70 items-center">
            <div className="flex gap-4 items-center">
              <Image
                src={"/bg-image (1).jpg"}
                width={500}
                height={500}
                className="rounded-full w-16 h-16"
                alt="image"
              />
              <div>
                <h4 className="font-semibold">Hikariii</h4>
                <p className="text-sm text-gray-700">Gojo is alive</p>
              </div>
            </div>
            <button className="bg-red-500 h-fit text-white px-3 py-1 shadow hover:bg-opacity-70 duration-300">
              Unfollow
            </button>
          </div>
          <div className="flex justify-between py-3 px-2 bg-secondary bg-opacity-70 items-center">
            <div className="flex gap-4 items-center">
              <Image
                src={"/hero-image (1).jpg"}
                width={500}
                height={500}
                className="rounded-full w-16 h-16"
                alt="image"
              />
              <div>
                <h4 className="font-semibold">Hikariii</h4>
                <p className="text-sm text-gray-700">Gojo is alive</p>
              </div>
            </div>
            <button className="bg-red-500 h-fit text-white px-3 py-1 shadow hover:bg-opacity-70 duration-300">
              Unfollow
            </button>
          </div>
          <div className="flex justify-between py-3 px-2 bg-secondary bg-opacity-70 items-center">
            <div className="flex gap-4 items-center">
              <Image
                src={"/bg-image (4).jpg"}
                width={500}
                height={500}
                className="rounded-full w-16 h-16"
                alt="image"
              />
              <div>
                <h4 className="font-semibold">Hikariii</h4>
                <p className="text-sm text-gray-700">Gojo is alive</p>
              </div>
            </div>
            <button className="bg-red-500 h-fit text-white px-3 py-1 shadow hover:bg-opacity-70 duration-300">
              Unfollow
            </button>
          </div>
          <div className="flex justify-between py-3 px-2 bg-secondary bg-opacity-70 items-center">
            <div className="flex gap-4 items-center">
              <Image
                src={"/bg-image (3).png"}
                width={500}
                height={500}
                className="rounded-full w-16 h-16"
                alt="image"
              />
              <div>
                <h4 className="font-semibold">Hikariii</h4>
                <p className="text-sm text-gray-700">Gojo is alive</p>
              </div>
            </div>
            <button className="bg-red-500 h-fit text-white px-3 py-1 shadow hover:bg-opacity-70 duration-300">
              Unfollow
            </button>
          </div>
          <div className="flex justify-between py-3 px-2 bg-secondary bg-opacity-70 items-center">
            <div className="flex gap-4 items-center">
              <Image
                src={"/bg-image (1).jpg"}
                width={500}
                height={500}
                className="rounded-full w-16 h-16"
                alt="image"
              />
              <div>
                <h4 className="font-semibold">Hikariii</h4>
                <p className="text-sm text-gray-700">Gojo is alive</p>
              </div>
            </div>
            <button className="bg-red-500 h-fit text-white px-3 py-1 shadow hover:bg-opacity-70 duration-300">
              Unfollow
            </button>
          </div>
          <div className="flex justify-between py-3 px-2 bg-secondary bg-opacity-70 items-center">
            <div className="flex gap-4 items-center">
              <Image
                src={"/bg-image (1).jpg"}
                width={500}
                height={500}
                className="rounded-full w-16 h-16"
                alt="image"
              />
              <div>
                <h4 className="font-semibold">Hikariii</h4>
                <p className="text-sm text-gray-700">Gojo is alive</p>
              </div>
            </div>
            <button className="bg-red-500 h-fit text-white px-3 py-1 shadow hover:bg-opacity-70 duration-300">
              Unfollow
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}

export default Followers;
