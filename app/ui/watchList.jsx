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
import Image from "next/image";
import { ChevronDown } from "lucide-react";

function WatchList() {
  const [userData, setUserData] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortBy, setSortBy] = useState("recent"); // recent, oldest, rating-high, rating-low, title
  const [statusFilter, setStatusFilter] = useState("all"); // all, watching, completed, etc.
  const [showSortDropdown, setShowSortDropdown] = useState(false);
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
    const authId = userData?.user?.uid;

    if (authId) {
      const userDocRef = doc(db, "users", authId);

      const unsubscribe = onSnapshot(
        userDocRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setUserData(userData);
          } else {
            console.log("User document not found.");
            setShowEditProfile();
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error in onSnapshot:", error);
          setLoading(false);
        }
      );

      return () => {
        unsubscribe();
      };
    } else {
      console.error("Authentication ID not found.");
      router.push("/login");
      setLoading(false);
    }
  });

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const filterAndSortWatchlist = (watchlist) => {
    if (!watchlist) return [];

    // First filter by status
    let filtered = watchlist;
    if (statusFilter !== "all") {
      const statusMap = {
        "watching": "Watching",
        "completed": "Completed", 
        "towatch": "To Watch",
        "rewatching": "Rewatching",
        "dropped": "Dropped"
      };
      
      filtered = watchlist.filter(anime => anime.status === statusMap[statusFilter]);
    }

    // Then sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
        case "oldest":
          return new Date(a.dateAdded || 0) - new Date(b.dateAdded || 0);
        case "rating-high":
          return (b.rating || 0) - (a.rating || 0);
        case "rating-low":
          return (a.rating || 0) - (b.rating || 0);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  };

  const sortOptions = [
    { value: "recent", label: "Recently Added" },
    { value: "oldest", label: "Oldest First" },
    { value: "rating-high", label: "Highest Rated" },
    { value: "rating-low", label: "Lowest Rated" },
    { value: "title", label: "A-Z" },
  ];

  const statusOptions = [
    { value: "all", label: "All", color: "bg-gray-100 text-gray-700" },
    { value: "watching", label: "Watching", color: "bg-blue-100 text-blue-700" },
    { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
    { value: "towatch", label: "To Watch", color: "bg-gray-100 text-gray-700" },
    { value: "rewatching", label: "Rewatching", color: "bg-yellow-100 text-yellow-700" },
    { value: "dropped", label: "Dropped", color: "bg-red-100 text-red-700" },
  ];

  const sortedWatchlist = filterAndSortWatchlist(userData.watchlist);

  // Get counts for each status
  const getStatusCounts = () => {
    if (!userData.watchlist) return {};
    
    const counts = {};
    userData.watchlist.forEach(anime => {
      const status = anime.status;
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="bg-gray-400 bg-opacity-20 pt-2 w-full min-h-[19rem] flex flex-col gap-2 overflow mr-6 px-2">
      {loading ? (
        <div className="flex items-center justify-center h-96 w-full">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {/* Smart Controls - Only show for larger lists */}
          {userData.watchlist && userData.watchlist.length > 5 && (
            <div className="mb-3">
              {/* Compact horizontal layout */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-white rounded-lg border border-gray-200">
                {/* Status Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => {
                    const count = option.value === "all" 
                      ? userData.watchlist.length 
                      : statusCounts[option.value === "towatch" ? "To Watch" : option.label] || 0;
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => setStatusFilter(option.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all group ${
                          statusFilter === option.value
                            ? `${option.color} ring-1 ring-gray-300 shadow-sm`
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        title={`${option.label} (${count})`}
                      >
                        <span>{option.label}</span>
                        <span className="ml-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Compact Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <span className="hidden sm:inline">Sort:</span>
                    <span>{sortOptions.find(option => option.value === sortBy)?.label}</span>
                    <ChevronDown size={12} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showSortDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            sortBy === option.value ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Simple sort for small lists */}
          {userData.watchlist && userData.watchlist.length > 0 && userData.watchlist.length <= 5 && (
            <div className="mb-3 flex justify-end">
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span>{sortOptions.find(option => option.value === sortBy)?.label}</span>
                  <ChevronDown size={14} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showSortDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    {/* Only show basic sort options for small lists */}
                    {sortOptions.filter(opt => ['recent', 'title', 'rating-high'].includes(opt.value)).map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          sortBy === option.value ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {userData.watchlist && userData.watchlist.length > 0 ? (
            <>
              {sortedWatchlist.length > 0 ? (
                <div className="space-y-2">
                  {/* Show results count only for larger lists with active filters */}
                  {userData.watchlist.length > 5 && statusFilter !== "all" && (
                    <p className="text-xs text-gray-500 mb-2 px-1">
                      {sortedWatchlist.length} of {userData.watchlist.length} anime
                    </p>
                  )}
                  {sortedWatchlist.map((anime, index) => (
                    <div
                      key={anime.malID}
                      onClick={() => handleItemClick(anime)}
                    >
                      <WatchListItem
                        key={anime.malID}
                        imageSrc={anime.image}
                        title={anime.title}
                        status={anime.status}
                        review={anime.thoughts}
                        episodes={anime.episodes}
                        airingStatus={anime.airingStatus}
                        rating={anime.rating || 0}
                        dateAdded={anime.dateAdded}
                        onClick={() => handleItemClick(anime)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[15rem] text-gray-500">
                  <p className="text-base font-medium">No anime found</p>
                  <p className="text-sm text-center mt-1">
                  No anime with status &quot;{statusOptions.find(s => s.value === statusFilter)?.label}&quot;
                  </p>
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    Show All Anime
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[20rem]">
              <Image
                width={500}
                height={500}
                alt="No Posts"
                src={"/addNew.svg"}
                className="h-56 w-56"
              />
              <p>You have not added any anime to your watchlist!</p>
            </div>
          )}
        </>
      )}

      {showEditProfile && (
        <EditProfile setEditProfile={handleShowEditProfile} />
      )}
      {selectedItem && (
        <EditWatchListItemForm
          selectedItem={selectedItem}
          closeForm={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

export default WatchList;