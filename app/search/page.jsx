"use client";

import React, { useState } from "react";
import BottomNav from "../ui/bottomNav";
import { FaSearch } from "react-icons/fa";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import Image from "next/image";
import FollowerComponent from "../ui/followerComponent";

function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  // const [searchResults, setSearchResults] = useState([]);
  const userDataJSON =
    typeof window !== "undefined" ? sessionStorage.getItem("userData") : null;
  const userSessionData = JSON.parse(userDataJSON);
  const username = userSessionData?.user?.uid;
  // const [isFollowing, setIsFollowing] = useState(false);

  const handleSearch = async (e) => {
    try {
      // Create a reference to the "users" collection
      const usersCollectionRef = collection(db, "users");

      // Use a query to search for users based on the username or anime interests
      const querySnapshot = await getDocs(collection(db, "users"));

      // Extract the user data from the query results
      const results = querySnapshot.docs
        .filter((doc) => doc.data().username) // Filter out undefined usernames
        .map((doc) => {
          const userData = doc.data();
          const isFollowing = userData.followers
            ? userData.followers.includes(username)
            : false;

          return {
            ...userData,
            isFollowing,
          };
        });

      // Update the searchResults state with the matching users' data
      setSearchResults(results);
      console.log(results);
    } catch (error) {
      console.error("Error searching for users:", error);
    }
  };

  const handleInputChange = (e) => {
    // Update search query and trigger search function
    setSearchQuery(e.target.value);
    handleSearch();
  };

  const handleFollow = async (
    userAuthId,
    initialIsFollowing,
    setIsFollowing
  ) => {
    try {
      // Get references to the clicked user and the user to be followed
      const clickedUserRef = doc(db, "users", userAuthId);
      const authUserRef = doc(db, "users", username);

      console.log("Clicked User Ref:", clickedUserRef.path);
      console.log("Auth User Ref:", authUserRef.path);

      // Fetch data for the clicked user
      const clickedUserData = (await getDoc(clickedUserRef)).data();

      // Check if the current user is already following the clicked user
      const isFollowing = clickedUserData.followers
        ? clickedUserData.followers.includes(username)
        : false;

      // Check if the user is already following
      if (isFollowing) {
        // If already following, unfollow by removing from arrays
        await updateDoc(clickedUserRef, {
          followers: arrayRemove(username),
        });
        await updateDoc(authUserRef, {
          following: arrayRemove(userAuthId),
        });
      } else {
        // If not following, follow by adding to arrays
        await updateDoc(clickedUserRef, {
          followers: arrayUnion(username),
        });
        await updateDoc(authUserRef, {
          following: arrayUnion(userAuthId),
        });
      }

      // Toggle the follow state
      setIsFollowing(!initialIsFollowing);
      const updatedClickedUserData = (await getDoc(clickedUserRef)).data();
      const updatedIsFollowing = updatedClickedUserData.followers
        ? updatedClickedUserData.followers.includes(username)
        : false;

      // Update isFollowing state based on the current database state
      setIsFollowing(updatedIsFollowing);
      console.log(clickedUserData);
    } catch (error) {
      console.error("Error updating followers/following:", error);
    }
  };

  return (
    <main className="bg-background flex min-h-screen w-full  justify-center py-3 text-center">
      <div className="w-full ">
        <div className="max-w-xl p-4">
          <div onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search by username..."
              className="w-full border border-gray-300 p-2 rounded-md mb-4 focus:outline-0"
              value={searchQuery}
              onInput={handleInputChange}
            />
            <button
              onClick={handleSearch}
              className="bg-primary  text-white p-2.5 rounded-r-md  mb-4"
            >
              <FaSearch />
            </button>
          </div>
          <div>
            {searchResults?.length > 0 ? (
              searchResults?.map((user) => (
                <FollowerComponent
                  key={user.authId}
                  imageSrc={user.profilePic}
                  name={user.username}
                  country={user.country}
                  userAuthId={user.authId}
                  handleFollow={handleFollow}
                  initialIsFollowing={user.isFollowing}
                />
              ))
            ) : (
              <p>Try searching for users</p>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}

export default Search;
