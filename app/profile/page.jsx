"use client";

import React, { useEffect, useState, useRef } from "react";
import BottomNav from "../ui/bottomNav";
import Image from "next/image";
import { AiOutlinePlus } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/store";
import {
  setActiveProfileItem,
  selectActiveProfileItem,
} from "@/redux/features/profileNavSlice";
import WatchList from "../ui/watchList";
import AllPosts from "../ui/allPosts";
import Link from "next/link";
import EditProfile from "../ui/editProfile";
import AddWatchListItemForm from "../ui/addWatchlistItemForm ";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Loading from "../ui/loading";
import { useRouter } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa";
import { signOut } from "firebase/auth";
import UserStats from "../ui/userStats";

function Profile() {
  const dispatch = useDispatch();
  const activeProfileItem = useAppSelector(selectActiveProfileItem);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddWatchlistItem, setShowAddWatchlistItem] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const handleItemClick = (item) => {
    dispatch(setActiveProfileItem(item));
  };

  const handleWatchlistClick = () => {
    setShowDropdown(!showDropdown);
  };
  const handleShowEditProfile = () => {
    setShowEditProfile(!showEditProfile);
  };
  const handleAddWatchlistItem = () => {
    setShowAddWatchlistItem(!showAddWatchlistItem);
  };
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userDataJSON =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("userData")
        : null;
    const userData = userDataJSON ? JSON.parse(userDataJSON) : null;
    const authId = userData?.user?.uid;

    if (authId) {
      const userDocRef = doc(db, "users", authId);

      const unsubscribe = onSnapshot(
        userDocRef,
        (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setUserData(userData);
            console.log(userData);
          } else {
            console.log("User document not found.");
            handleShowEditProfile();
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error in onSnapshot:", error);
        }
      );

      return () => {
        unsubscribe();
      };
    } else {
      console.error("Authentication ID not found.");
      router.push("/login");
      setLoading(false);
    }
  }, []);

  const signOutUser = async () => {
    try {
      await auth.signOut();
      sessionStorage?.removeItem("userData");
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <main className="bg-background flex flex-col h-fit w-full min-h-full justify-center pb-16 py-4 ">
      <div className="w-full ">
        {/* Header with Sign Out */}
        <div className="flex justify-end items-center px-4 mb-4">
          <button
            onClick={signOutUser}
            className="hover:text-primary duration-300 transition-all"
          >
            <FaSignOutAlt size={20} />
          </button>
        </div>

        {/* Profile Header - Back to Original Style */}
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-lg font-semibold">
            {userData?.username || "No Username"}
          </p>
          <Image
            src={userData?.profilePic || "/bg-image (4).jpg"}
            width={500}
            height={500}
            className="rounded-full w-32 h-32 "
            alt="image"
          />
          <div className="flex gap-5">
            <Link
              href={"/friends"}
              className="bg-primary text-red-100 border-2 border-red-50 px-3 py-1.5 shadow-sm rounded-lg hover:bg-opacity-80 font-semibold"
            >
              Friends 
            </Link>
            <button
              onClick={() => setShowEditProfile(true)}
              className="bg-secondary px-3 text-text border-2 border-red-50 py-1.5 shadow-sm rounded-lg hover:bg-opacity-80 font-semibold"
            >
              Edit Profile
            </button>
          </div>
          <div className="px-4 text-center">
            <p>{userData?.bio || "No Bio"}</p>
          </div>
        </div>

        {/* Navigation Tabs - Back to Original Style */}
        <div className="">
          <div className="w-full flex">
            <div className="flex justify-between mt-6 w-full" ref={dropdownRef}>
              <button
                className={`h-fit bg-secondary bg-opacity-70 px-4 py-2 w-full  flex items-center justify-center ${
                  activeProfileItem === "watchList"
                    ? "font-bold border-b-2 border-primary transform duration-300"
                    : "hover:bg-opacity-100 bg-opacity-40 border-b-2 border-gray-200 duration-300 text-gray-800"
                } `}
                onClick={() => handleItemClick("watchList")}
              >
                Watch List
              </button>
              <button
                className={`h-fit bg-secondary bg-opacity-70 px-4 py-2 w-full  hover:bg-opacity-40 duration-300  ${
                  activeProfileItem === "activity"
                    ? "font-bold border-b-2 border-primary transform duration-300"
                    : "hover:bg-opacity-100 bg-opacity-40 duration-300 text-gray-800 border-b-2 border-gray-200"
                } `}
                onClick={() => handleItemClick("activity")}
              >
                Activity
              </button>
              <button
                className={`h-fit bg-secondary bg-opacity-70 px-4 py-2 w-full  hover:bg-opacity-40 duration-300  ${
                  activeProfileItem === "stats"
                    ? "font-bold border-b-2 border-primary transform duration-300"
                    : "hover:bg-opacity-100 bg-opacity-40 duration-300 text-gray-800 border-b-2 border-gray-200"
                } `}
                onClick={() => handleItemClick("stats")}
              >
                Stats
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeProfileItem === "watchList" && (
            <div className="flex bg-gray-400 bg-opacity-20 px-2 items-center w-full flex-col">
              <button
                className="bg-primary text-white w-full px-2 py-2 rounded flex items-center justify-center font-semibold hover:bg-opacity-70 duration-300 my-1 mx-2"
                onClick={() => handleAddWatchlistItem()}
              >
                Add <AiOutlinePlus size={18} />
              </button>
            </div>
          )}
          
          {activeProfileItem === "watchList" && <WatchList />}
          {activeProfileItem === "activity" && <AllPosts />}
          {activeProfileItem === "stats" && <UserStats userData={userData} />}
        </div>

        {/* Modals */}
        {showEditProfile && (
          <EditProfile setEditProfile={handleShowEditProfile} />
        )}
        {showAddWatchlistItem && (
          <AddWatchListItemForm
            handleAddWatchlistItem={handleAddWatchlistItem}
          />
        )}
      </div>
      <BottomNav />
    </main>
  );
}

export default Profile;