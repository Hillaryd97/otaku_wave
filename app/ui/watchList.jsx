import React, { useEffect, useState } from "react";
import WatchListItem from "./watchListItem";
import { db } from "../firebase";
import {
  doc,
  onSnapshot,
} from "firebase/firestore";
import Loading from "../ui/loading";
import EditWatchListItemForm from "./editWatchListItemForm";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import {
  setActiveProfileItem,
  selectActiveProfileItem,
} from "@/redux/features/profileNavSlice";

function WatchList() {
  const [userData, setUserData] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const dispatch = useDispatch();
  const activeProfileItem = useAppSelector(selectActiveProfileItem);

  useEffect(() => {
    const userDataJSON = sessionStorage.getItem("userData");
    const userData = JSON.parse(userDataJSON);
    const authId = userData?.user.uid;

    const userDocRef = doc(db, "users", authId);

    // Subscribe to changes in the user document
    const unsubscribe = onSnapshot(
      userDocRef,
      (doc) => {
        if (doc.exists()) {
          // Extract the user data from the document
          const userData = doc.data();
          console.log("User data:", userData.watchlist);

          // Set the user data in the component state
          setUserData(userData);
        } else {
          console.log("User document not found.");
          // router.push("/login");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error in onSnapshot:", error);
      }
    );

    // Cleanup function to unsubscribe when the component is unmounted
    return () => {
      console.log("Unsubscribing from onSnapshot");
      unsubscribe();
    };
  }, []);
  const handleItemClick = (item) => {
    setSelectedItem(item);
  };
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
              <div
                key={anime.malID}
                onClick={() => handleItemClick(anime)} // Pass the clicked item to the handler
              >
                <WatchListItem
                  key={anime.malID}
                  imageSrc={anime.image}
                  title={anime.title}
                  status={anime.status}
                  review={anime.thoughts}
                  episodes={anime.episodes}
                  airingStatus={anime.airingStatus}
                />
              </div>
            ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32">
          <p>You have not added any anime to your watchlist!</p>
        </div>
      )}
      {selectedItem && (
        <EditWatchListItemForm
          selectedItem={selectedItem}
          closeForm={() => setSelectedItem(null)} // Close the form when needed
        />
      )}
    </div>
  );
}

export default WatchList;
