"use client";

import React from "react";
import BottomNav from "../ui/bottomNav";
import Image from "next/image";
import { AiOutlineCaretDown } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/store";
import {
  setActiveProfileItem,
  selectActiveProfileItem,
} from "@/redux/features/profileNavSlice";
import WatchListItem from "../ui/watchListItem";
import WatchList from "../ui/watchList";
import AllPosts from "../ui/allPosts";

function Profile() {
  const dispatch = useDispatch();
  const activeProfileItem = useAppSelector(selectActiveProfileItem);

  const handleItemClick = (item) => {
    dispatch(setActiveProfileItem(item));
  };

  return (
    <main className="bg-background flex h-fit w-full min-h-full justify-center mb-16 pb-16 py-4 ">
      <div className="w-full">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-lg font-semibold">Hikariii</p>
          <Image
            src={"/bg-image (1).jpg"}
            width={500}
            height={500}
            className="rounded-full w-32 h-32 "
          />
          <div className="flex gap-5">
            <button className="bg-primary text-red-100 border-2 border-red-50 px-3 py-1.5 shadow-sm rounded-lg hover:bg-opacity-80 font-semibold">
              Followers
            </button>
            <button className="bg-secondary px-3 text-text border-2 border-red-50 py-1.5 shadow-sm rounded-lg hover:bg-opacity-80 font-semibold">
              Edit Profile
            </button>
          </div>
          <div className="px-4 text-center">
            <p>Gojo is still alive...</p>
          </div>
        </div>
        <div className="">
          <div className="w-full flex">
            <div className="flex justify-between mt-6 w-full  ">
              <button
                className={`h-fit bg-secondary bg-opacity-70 px-4 py-2 w-full  flex items-center justify-center ${
                  activeProfileItem === "watchList"
                    ? "font-bold border-b-2 border-primary transform duration-300"
                    : "hover:bg-opacity-100 bg-opacity-40 border-b-2 border-gray-200 duration-300 text-gray-800"
                } `}
                onClick={() => handleItemClick("watchList")}
              >
                Watch List &nbsp; <AiOutlineCaretDown />
              </button>
              <button
                className={`h-fit bg-secondary bg-opacity-70 px-4 py-2 w-full  hover:bg-opacity-40 duration-300  ${
                  activeProfileItem === "posts"
                    ? "font-bold border-b-2 border-primary transform duration-300"
                    : "hover:bg-opacity-100 bg-opacity-40 duration-300 text-gray-800 border-b-2 border-gray-200"
                } `}
                onClick={() => handleItemClick("posts")}
              >
                Posts
              </button>
            </div>
          </div>
          {activeProfileItem === "watchList" ? <WatchList /> : <AllPosts />}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}

export default Profile;
