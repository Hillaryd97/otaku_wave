"use client";

import React, { useEffect, useState, useRef } from "react";
import BottomNav from "../ui/bottomNav";
import Image from "next/image";
import { AiOutlineCaretDown, AiOutlinePlus } from "react-icons/ai";
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

  useEffect(
    () => {
      const userDataJSON = sessionStorage.getItem("userData");
      const userData = JSON.parse(userDataJSON);
      const authId = userData?.user?.uid; // Add a check for user

      if (authId) {
        const userDocRef = doc(db, "users", authId);

        // Subscribe to changes in the user document
        const unsubscribe = onSnapshot(
          userDocRef,
          (doc) => {
            if (doc.exists()) {
              // Extract the user data from the document
              const userData = doc.data();
              // console.log("User data:", userData);

              // Set the user data in the component state
              setUserData(userData);
              console.log(userData);
            } else {
              // User document not found, it's a new user
              // You can redirect to a different page or handle the creation of user data here
              console.log("User document not found.");

              // Example: Redirect to a page where the user can create their data
              // router.push("/create-user-data");
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error in onSnapshot:", error);
          }
        );

        // Cleanup function to unsubscribe when the component is unmounted
        return () => {
          // console.log("Unsubscribing from onSnapshot");
          unsubscribe();
        };
      } else {
        // Handle the case when authId is undefined
        console.error("Authentication ID not found.");
        setLoading(false);
      }
    },
    [
      /* dependencies */
    ]
  );

  const signOut = async () => {
    try {
      await auth.signOut();
      sessionStorage.removeItem("userData");
      router.push("/");

      // You can add any additional logic you want after signing out
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <main className="bg-background flex flex-col h-fit w-full min-h-full justify-center pb-16 py-4 ">
      {/* {loading && <Loading />} */}

      {userData ? (
        <div className="w-full ">
          <div className="flex justify-end items-center px-2">
            <button
              onClick={signOut}
              className="hover:text-primary duration-300 transition-all"
            >
              <FaSignOutAlt size={20} />
            </button>
          </div>
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
                href={"/followers"}
                className="bg-primary text-red-100 border-2 border-red-50 px-3 py-1.5 shadow-sm rounded-lg hover:bg-opacity-80 font-semibold"
              >
                Friends
              </Link>
              <button
                onClick={setShowEditProfile}
                className="bg-secondary px-3 text-text border-2 border-red-50 py-1.5 shadow-sm rounded-lg hover:bg-opacity-80 font-semibold"
              >
                Edit Profile
              </button>
            </div>
            <div className="px-4 text-center">
              <p>{userData?.bio || "No Bio"}</p>
            </div>
          </div>
          <div className="">
            <div className="w-full flex">
              <div
                className="flex justify-between mt-6 w-full"
                ref={dropdownRef}
              >
                <button
                  className={`h-fit bg-secondary bg-opacity-70 px-4 py-2 w-full  flex items-center justify-center ${
                    activeProfileItem === "watchList"
                      ? "font-bold border-b-2 border-primary transform duration-300"
                      : "hover:bg-opacity-100 bg-opacity-40 border-b-2 border-gray-200 duration-300 text-gray-800"
                  } `}
                  onClick={() => handleItemClick("watchList")}
                >
                  Watch List &nbsp;{" "}
                  {/* <span className="hover:text-primary duration-300">
                    {" "}
                    <AiOutlineCaretDown onClick={handleWatchlistClick} />
                  </span> */}
                </button>
                {/* {showDropdown && (
                  <div className="absolute transition-all flex flex-col w-3/6 bg-gray-50 shadow-md border border-gray-400 border-t-white border-l-white mt-10">
                     <button
                      onClick={() => handleItemClick("all")}
                      className="hover:bg-gray-200 hover:font-semibold duration-300 border-b border-b-gray-400 py-1 focus:bg-primary focus:text-white"
                    >
                      All
                    </button>
                    <button
                      onClick={() => handleItemClick("watching")}
                      className="hover:bg-gray-200 hover:font-semibold duration-300 border-b border-b-gray-400 py-1 focus:bg-primary focus:text-white"
                    >
                      Watching
                    </button>
                    <button
                      onClick={() => handleItemClick("completed")}
                      className="hover:bg-gray-200 hover:font-semibold duration-300 border-b border-b-gray-400 py-1 focus:bg-primary focus:text-white"
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => handleItemClick("planToWatch")}
                      className="hover:bg-gray-200 hover:font-semibold duration-300 py-1 focus:bg-primary focus:text-white"
                    >
                      Plan To Watch
                    </button>
                  </div>
                )} */}
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
              {activeProfileItem === "watchList" ? <WatchList /> : <AllPosts />}
            </div>
          </div>
          {showEditProfile && (
            <EditProfile setEditProfile={handleShowEditProfile} />
          )}
          {showAddWatchlistItem && (
            <AddWatchListItemForm
              handleAddWatchlistItem={handleAddWatchlistItem}
            />
          )}
        </div>
      ) : (
        // User data not found, render EditProfile component
        <EditProfile setEditProfile={handleShowEditProfile} />
      )}
      <BottomNav />
    </main>
  );
}

export default Profile;
