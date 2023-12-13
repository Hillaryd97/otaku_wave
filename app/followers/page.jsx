"use client";

import React from "react";
import BottomNav from "../ui/bottomNav";
import Link from "next/link";
import FollowerComponent from "../ui/followerComponent";
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
            passHref
            className={`h-fit text-center bg-secondary bg-opacity-70  px-4 py-2 w-full hover:bg-opacity-40 font-bold border-primary transform duration-300  text-gray-800 border-b-2`}
          >
            Followers
          </Link>
          <Link
            href={"/following"}
            passHref
            className={`h-fit text-center bg-secondary bg-opacity-70  px-4 py-2 w-full hover:bg-opacity-40  focus:font-bold focus:border-primary transform duration-300  text-gray-800 border-b-2`}
          >
            Following
          </Link>
        </div>
        <div className="flex flex-col space-y-2">
          <FollowerComponent
            imageSrc={"/bg-image (1).jpg"}
            name="Hikariii"
            status="Gojo is alive"
          />
          <FollowerComponent
            imageSrc={"/bg-image (1).jpg"}
            name="Hikariii"
            status="Gojo is alive"
          />
        </div>
      </div>

      <BottomNav />
    </main>
  );
}

export default Followers;
