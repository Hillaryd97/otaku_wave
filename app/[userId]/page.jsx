"use client";

import React, { useEffect, useState, useRef } from "react";
import BottomNav from "../ui/bottomNav";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/store";
import { IoArrowBack } from "react-icons/io5";
import {
  setActiveProfileItem,
  selectActiveProfileItem,
} from "@/redux/features/profileNavSlice";
import AllPosts from "../ui/allPosts";
import Link from "next/link";
import { db } from "../firebase";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import { useRouter } from "next/navigation";
import UserWatchList from "../ui/userWatchlist";

function UserProfile({ params }) {
  const dispatch = useDispatch();
  const activeProfileItem = useAppSelector(selectActiveProfileItem);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const handleItemClick = (item) => {
    dispatch(setActiveProfileItem(item));
  };
  const [loading, setLoading] = useState(true);
  const userId = params.userId;
  console.log(userId);
  const [isFollowing, setIsFollowing] = useState(false);
  const userDataJSON = typeof window !== 'undefined' ? sessionStorage.getItem("userData") : null;
  const userSessionData = userDataJSON ? JSON.parse(userDataJSON) : null;
  const username = userSessionData?.user?.uid || null;
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userDataJSON = sessionStorage.getItem("userData");
    const userData = JSON.parse(userDataJSON);
    const authId = userData?.user?.uid; // Add a check for user

    if (userId) {
      const userDocRef = doc(db, "users", userId);

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
  }, [userId]);

  const handleFollow = async () => {
    try {
      const isFollowing = await checkIfUserIsFollowing(username, userId);

      const clickedUserRef = doc(db, "users", userId);
      const authUserRef = doc(db, "users", username);

      console.log("Clicked User Ref:", clickedUserRef.path);
      console.log("Auth User Ref:", authUserRef.path);

      // Fetch data for the clicked user
      const clickedUserData = (await getDoc(clickedUserRef)).data();

      if (isFollowing) {
        // If already following, unfollow by removing from arrays
        await updateDoc(clickedUserRef, {
          followers: arrayRemove(username),
        });
        await updateDoc(authUserRef, {
          following: arrayRemove(userId),
        });
      } else {
        // If not following, follow by adding to arrays
        await updateDoc(clickedUserRef, {
          followers: arrayUnion(username),
        });
        await updateDoc(authUserRef, {
          following: arrayUnion(userId),
        });
      }

      console.log(clickedUserData);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error updating followers/following:", error);
    }
  };
  const handleGoBack = () => {
    router.back();
  };
  return (
    <main className="bg-background flex flex-col h-fit w-full min-h-full justify-center pb-16 py-4 ">
      <div className="w-full ">
        <button
          onClick={handleGoBack}
          className="flex ml-2 items-center bg-primary text-white px-2 py-2 rounded-md hover:bg-opacity-80 focus:outline-none"
        >
          <IoArrowBack />
        </button>
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
              className="bg-primary font-bold text-white border  px-3 py-0.5 shadow-sm rounded-lg hover:bg-opacity-80 "
            >
              Friends
            </Link>
            {userId === username ? (
              ""
            ) : (
              <button
                onClick={() => handleFollow()}
                className={`border ${
                  userData?.followers?.includes(username)
                    ? "border-red-400"
                    : "border-red-400"
                } text-red-500 font-bold px-3 border py-0.5 shadow hover:bg-red-400 rounded-lg hover:text-white duration-300`}
              >
                {userData?.followers?.includes(username)
                  ? "Unfollow"
                  : "Follow"}
              </button>
            )}
          </div>
          <div className="px-4 text-center">
            <p>{userData?.bio || "No Bio"}</p>
          </div>
        </div>
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
                Watch List &nbsp;{" "}
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
          <div>
            {activeProfileItem === "watchList" ? (
              <UserWatchList userId={userId} />
            ) : (
              <AllPosts />
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}

export default UserProfile;
const checkIfUserIsFollowing = async (authUserId, targetUserId) => {
  try {
    const targetUserRef = doc(db, "users", targetUserId);
    const targetUserData = (await getDoc(targetUserRef)).data();
    const isFollowing = targetUserData.followers
      ? targetUserData.followers.includes(authUserId)
      : false;
    return isFollowing;
  } catch (error) {
    console.error("Error checking if user is following:", error);
    return false;
  }
};
