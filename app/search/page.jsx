"use client";

import React, { useEffect, useState } from "react";
import BottomNav from "../ui/bottomNav";
import { FaSearch } from "react-icons/fa";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import Image from "next/image";
import FollowerComponent from "../ui/followerComponent";
import { useRouter } from "next/navigation";

function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  // const [searchResults, setSearchResults] = useState([]);
  const userDataJSON =
    typeof window !== "undefined" ? sessionStorage.getItem("userData") : null;
  const userSessionData = JSON.parse(userDataJSON);
  const username = userSessionData?.user?.uid;
  // const [isFollowing, setIsFollowing] = useState(false);
  const router = useRouter(); // Add useRouter hook

  useEffect(() => {
    // Check if the user is logged in, else redirect to login page
    if (!userSessionData || !userSessionData.user) {
      router.push("/login");
    }

    // Cleanup function to unsubscribe when the component unmounts
  }, [router]);

  const handleSearch = async () => {
    try {
      // Create a reference to the "users" collection
      const usersCollectionRef = collection(db, "users");

      // Use a query to search for users based on the username or anime interests
      const querySnapshot = await getDocs(usersCollectionRef);

      // Extract the user data from the query results
      const results = querySnapshot.docs
        .filter((doc) => {
          const userData = doc.data();
          // Check if username exists and includes the search term (case-insensitive)
          return (
            userData.username &&
            userData.username
              .toLowerCase()
              .includes(searchQuery.toLowerCase().trim())
          );
        })
        .map((doc) => {
          const userData = doc.data();
          // Add any additional processing if needed
          return {
            ...userData,
          };
        });

      // Update the searchResults state with the matching users' data
      setSearchResults(results);
      console.log("Search query:", searchQuery);
      console.log("Search results:", results);
    } catch (error) {
      console.error("Error searching for users:", error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    console.log("Search query:", value); // Add this line to log the value
    handleSearch();
  };

  // const handleFollow = async (
  //   userAuthId,
  //   initialIsFollowing,
  //   setIsFollowing
  // ) => {
  //   try {
  //     const clickedUserRef = doc(db, "users", userAuthId);
  //     const authUserRef = doc(db, "users", username);

  //     const clickedUserData = (await getDoc(clickedUserRef)).data();
  //     const authUserData = (await getDoc(authUserRef)).data();

  //     // Check if the user is already following
  //     const isFollowing = clickedUserData.followers
  //       ? clickedUserData.followers.some((follower) => follower.uid === username)
  //       : false;

  //     if (isFollowing) {
  //       // If already following, unfollow by removing from arrays
  //       await updateDoc(clickedUserRef, {
  //         followers: arrayRemove({
  //           uid: username,
  //           username: authUserData.username,
  //           profilePic: authUserData.profilePic,
  //           bio: authUserData.bio,
  //         }),
  //       });
  //       await updateDoc(authUserRef, {
  //         following: arrayRemove({
  //           uid: userAuthId,
  //           username: clickedUserData.username,
  //           profilePic: clickedUserData.profilePic,
  //           bio: clickedUserData.bio,
  //         }),
  //       });
  //     } else {
  //       // If not following, follow by adding to arrays
  //       await updateDoc(clickedUserRef, {
  //         followers: arrayUnion({
  //           uid: username,
  //           username: authUserData.username,
  //           profilePic: authUserData.profilePic,
  //           bio: authUserData.bio,
  //         }),
  //       });
  //       await updateDoc(authUserRef, {
  //         following: arrayUnion({
  //           uid: userAuthId,
  //           username: clickedUserData.username,
  //           profilePic: clickedUserData.profilePic,
  //           bio: clickedUserData.bio,
  //         }),
  //       });
  //     }

  //     // Toggle the follow state
  //     setIsFollowing(!initialIsFollowing);

  //     // Fetch the updated clicked user data
  //     const updatedClickedUserData = (await getDoc(clickedUserRef)).data();

  //     // Check if the array includes an object with your user details
  //     const updatedIsFollowing = updatedClickedUserData.followers
  //       ? updatedClickedUserData.followers.some(
  //           (follower) => follower.uid === username
  //         )
  //       : false;

  //     // Update isFollowing state based on the current database state
  //     setIsFollowing(updatedIsFollowing);

  //     console.log(updatedIsFollowing);
  //     console.log(clickedUserData);
  //     console.log(authUserData);
  //   } catch (error) {
  //     console.error("Error updating followers/following:", error);
  //   }
  // };

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
                  country={user.bio}
                  userAuthId={user.authId}
                  // handleFollow={handleFollow}
                  initialIsFollowing={user.isFollowing}
                />
              ))
            ) : (
              <p>
                {searchQuery ? "No users found" : "Try searching for users"}
              </p>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}

export default Search;
