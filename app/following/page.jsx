"use client";

import React, { useEffect, useState } from "react";
import BottomNav from "../ui/bottomNav";
import Link from "next/link";
import Image from "next/image";
import { IoMdArrowBack } from "react-icons/io";
import FollowerComponent from "../ui/followerComponent";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function Following() {
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState([]);
  const router = useRouter(); // Add useRouter hook

  useEffect(
    () => {
      const userDataJSON =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem("userData")
          : null;
      const userData = userDataJSON ? JSON.parse(userDataJSON) : null;
      const authId = userData?.user?.uid; // Add a check for user

      if (authId) {
        const followerDocRef = doc(db, "users", authId);

        // Subscribe to changes in the user document
        const unsubscribe = onSnapshot(
          followerDocRef,
          (doc) => {
            if (doc.exists()) {
              // Extract the user data from the document
              const followingData = doc.data().following;
              // console.log("User data:", userData);

              // Set the user data in the component state
              setFollowing(followingData);
              console.log(followingData);
            } else {
              console.log("User document not found.");
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

  console.log("folllowers", following);
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
            Following ({following?.length})
          </Link>
        </div>
        <div className="flex flex-col space-y-2">
          {following?.length > 0 ? (
            following?.map((user) => (
              <FollowerComponent
                key={user.authId}
                imageSrc={user.profilePic}
                name={user.username}
                country={user.bio}
                userAuthId={user.uid}
                // handleFollow={handleFollow}
                initialIsFollowing={user.isFollowing}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-96">
              <p>{"You have not followed anyone!"}</p>
            </div>
          )}
        </div>
        {/* <div className="flex justify-between py-3 px-2 bg-secondary bg-opacity-70 items-center">
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
          </div> */}
      </div>

      <BottomNav />
    </main>
  );
}

export default Following;
