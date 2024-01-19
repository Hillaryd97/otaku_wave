import React, { useEffect, useState } from "react";
import WatchListItem from "./watchListItem";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Image from "next/image";

function UserWatchList({ userId }) {
  const [userData, setUserData] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      const userDocRef = doc(db, "users", userId);

      const unsubscribe = onSnapshot(
        userDocRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            // console.log("User data:", userData.watchlist);
            setUserData(userData);
          } else {
            console.log("User document not found.");
            // Handle the case when the user document is not found
            // e.g., redirect to login page or show a message to the user
            // router.push("/login");
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error in onSnapshot:", error);
          // router.push("/login");
          setLoading(false);
        }
      );

      return () => {
        // console.log("Unsubscribing from onSnapshot");
        unsubscribe();
      };
    } else {
      // Handle the case when authId is null
      // router.push("/login");
      console.error("Authentication ID not found.");
      setLoading(false);
    }
  });

  return (
    <div className="bg-gray-400 bg-opacity-20 pt-2 w-full min-h-[19rem] flex flex-col gap-2 overflow mr-6">
      {loading ? (
        <div className="flex items-center justify-center h-96 w-full">
          <p>Loading...</p>
        </div>
      ) : (
        ""
      )}
      {userData.watchlist ? (
        <div>
          {userData.watchlist
            .slice() // Create a shallow copy to avoid modifying the original array
            .reverse()
            .map((anime, index) => (
              <div key={anime.malID}>
                <WatchListItem
                  key={anime.malID}
                  imageSrc={anime.image}
                  title={anime.title}
                  status={anime.status}
                  review={anime.thoughts}
                  episodes={anime.airingEpisode}
                  airingStatus={anime.airingStatus}
                />
              </div>
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[20rem]">
          <Image
            width={500}
            height={500}
            alt="No Posts"
            src={"/addNew.svg"}
            className="h-56 w-56"
          />
          <p>
            {userData.username || "They"} has not added any anime to their
            watchlist!
          </p>
        </div>
      )}
    </div>
  );
}

export default UserWatchList;
