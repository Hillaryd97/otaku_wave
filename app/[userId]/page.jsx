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
import AllClickedUsersPost from "../ui/allClickedUsersPost";

function UserProfile({ params }) {
  const dispatch = useDispatch();
  const activeProfileItem = useAppSelector(selectActiveProfileItem);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const handleItemClick = (item) => {
    dispatch(setActiveProfileItem(item));
  };

  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [viewingUser, setViewingUser] = useState(null); // Add this line!

  const userId = params.userId;
  const userDataJSON =
    typeof window !== "undefined" ? sessionStorage.getItem("userData") : null;
  const userSessionData = userDataJSON ? JSON.parse(userDataJSON) : null;
  const username = userSessionData?.user?.uid || null;

  useEffect(() => {
    const userDataJSON = sessionStorage.getItem("userData");
    const userData = userDataJSON ? JSON.parse(userDataJSON) : null;
    const authId = userData?.user?.uid;

    // Set viewing user (could be null for non-logged in users)
    setViewingUser(authId);

    if (userId) {
      const userDocRef = doc(db, "users", userId);

      const unsubscribe = onSnapshot(
        userDocRef,
        (doc) => {
          if (doc.exists()) {
            setUserData(doc.data());
          } else {
            console.log("User document not found.");
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error in onSnapshot:", error);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [userId]);

  const handleFollow = async () => {
    try {
      const isFollowing = await checkIfUserIsFollowing(username, userId);

      const clickedUserRef = doc(db, "users", userId);
      const authUserRef = doc(db, "users", username);

      // Fetch data for the clicked user
      const clickedUserData = (await getDoc(clickedUserRef)).data();
      const authUserData = (await getDoc(authUserRef)).data();

      if (isFollowing) {
        const authUserFollowingData = {
          uid: userId,
          username: clickedUserData.username,
          profilePic: clickedUserData.profilePic,
          bio: clickedUserData.bio,
        };

        const clickedUserFollowerData = {
          uid: username,
          username: authUserData.username,
          profilePic: authUserData.profilePic,
          bio: authUserData.bio,
        };

        // If already following, unfollow by removing from arrays
        await updateDoc(clickedUserRef, {
          followers: arrayRemove(authUserFollowingData),
        });

        await updateDoc(authUserRef, {
          following: arrayRemove(clickedUserFollowerData),
        });
      } else {
        // If not following, follow by adding to arrays
        await updateDoc(clickedUserRef, {
          followers: arrayUnion({
            uid: username,
            username: authUserData.username,
            profilePic: authUserData.profilePic,
            bio: authUserData.bio,
          }),
        });
        await updateDoc(authUserRef, {
          following: arrayUnion({
            uid: userId,
            username: clickedUserData.username,
            profilePic: clickedUserData.profilePic,
            bio: clickedUserData.bio,
          }),
        });
      }

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
            {viewingUser && userId !== viewingUser && (
              <button
                onClick={handleFollow}
                className={`border ${
                  userData?.followers?.some(
                    (follower) => follower.uid === username
                  )
                    ? "border-red-400 text-red-500 hover:bg-red-400 hover:text-white"
                    : "border-red-400 text-red-500 hover:bg-red-400 hover:text-white"
                } font-bold px-3 border py-0.5 shadow duration-300 rounded-lg`}
              >
                {userData?.followers?.some(
                  (follower) => follower.uid === username
                )
                  ? "Unfollow"
                  : "Follow"}
              </button>
            )}
          </div>

          {!viewingUser && (
            <div className="text-center text-gray-500 text-sm">
              👀 Viewing as guest • Sign up to interact
            </div>
          )}

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
              <AllClickedUsersPost userId={userId} />
            )}
          </div>
        </div>
      </div>

      {/* Login CTA for non-logged users - SAME AS SEARCH PROFILE */}
      {!viewingUser && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 shadow-lg">
          <div className="max-w-md mx-auto text-center">
            <p className="font-semibold mb-2">Like what you see? 🌟</p>
            <p className="text-sm mb-3">
              Join our anime community to connect with {userData?.username}
            </p>
            <div className="flex space-x-2">
              <Link
                href="/register"
                className="flex-1 bg-white text-blue-600 py-2 px-4 rounded-lg font-semibold"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="flex-1 bg-white/20 backdrop-blur py-2 px-4 rounded-lg font-semibold"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}

export default UserProfile;

const checkIfUserIsFollowing = async (authUserId, targetUserId) => {
  try {
    const targetUserRef = doc(db, "users", targetUserId);
    const targetUserData = (await getDoc(targetUserRef)).data();

    if (targetUserData && targetUserData.followers) {
      return targetUserData.followers.some(
        (follower) => follower.uid === authUserId
      );
    }

    return false;
  } catch (error) {
    console.error("Error checking if user is following:", error);
    return false;
  }
};