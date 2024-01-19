"use client";

import React, { useEffect, useState } from "react";
import BottomNav from "../ui/bottomNav";
import Link from "next/link";
import FollowerComponent from "../ui/followerComponent";
import { IoMdArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function Followers() {
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
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
              const followersData = doc.data().followers;
              // console.log("User data:", userData);

              // Set the user data in the component state
              setFollowers(followersData);
              console.log(followersData);
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

  console.log("folllowers" , followers);
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
            Followers ({followers?.length})
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
        {followers?.length > 0 ? (
              followers?.map((user) => (
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
                <p>
                {"You have no followers....yet"}
              </p>
              </div>
            )}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}

export default Followers;
