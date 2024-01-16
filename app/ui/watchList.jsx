import React, { useEffect, useState } from "react";
import WatchListItem from "./watchListItem";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Loading from "../ui/loading";
import EditWatchListItemForm from "./editWatchListItemForm";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import {
  setActiveProfileItem,
  selectActiveProfileItem,
} from "@/redux/features/profileNavSlice";
import { useRouter } from "next/navigation";
import EditProfile from "./editProfile";

function WatchList() {
  const [userData, setUserData] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const dispatch = useDispatch();
  const activeProfileItem = useAppSelector(selectActiveProfileItem);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const router = useRouter();

  const handleShowEditProfile = () => {
    setShowEditProfile(!showEditProfile);
  };

  useEffect(() => {
    const userDataJSON = sessionStorage.getItem("userData");
    const userData = JSON.parse(userDataJSON);
    const authId = userData?.user?.uid; // Add a check for user

    if (authId) {
      const userDocRef = doc(db, "users", authId);

      const unsubscribe = onSnapshot(
        userDocRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            // console.log("User data:", userData.watchlist);
            setUserData(userData);
          } else {
            console.log("User document not found.");
            setShowEditProfile();
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

      console.error("Authentication ID not found.");
      router.push("/login");
      setLoading(false);
    }
  });

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
                  episodes={anime.airingEpisode}
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
      {showEditProfile && (
        <EditProfile setEditProfile={handleShowEditProfile} />
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
