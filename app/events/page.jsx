"use client";

import React, { useEffect, useState } from "react";
import BottomNav from "../ui/bottomNav";
import { IoIosNotifications } from "react-icons/io";
import { MdPlaylistAdd } from "react-icons/md";
import { FaEye, FaClock, FaCalendarAlt } from "react-icons/fa";
import EditWatchListItemForm from "../ui/editWatchListItemForm";
import AddWatchListItemForm from "../ui/addWatchlistItemForm ";
import AddNewWatchlistItemEvent from "../ui/addNewWatchlistItemEvent";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

function Events() {
  const [airingScheduleData, setAiringScheduleData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddWatchlistItem, setShowAddWatchlistItem] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "watchlist"
  const [userWatchlist, setUserWatchlist] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleAddWatchlistItem = () => {
    setShowAddWatchlistItem(!showAddWatchlistItem);
  };

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();

  // Check if user is logged in and fetch their watchlist
  useEffect(() => {
    const checkUserAndFetchWatchlist = async () => {
      const userDataJSON = sessionStorage.getItem("userData");
      const userData = userDataJSON ? JSON.parse(userDataJSON) : null;
      const authId = userData?.user?.uid;

      if (authId) {
        setIsLoggedIn(true);
        try {
          const userDocRef = doc(db, "users", authId);
          const userDocSnapshot = await getDoc(userDocRef);
          
          if (userDocSnapshot.exists()) {
            const userInfo = userDocSnapshot.data();
            setUserWatchlist(userInfo.watchlist || []);
          }
        } catch (error) {
          console.error("Error fetching user watchlist:", error);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkUserAndFetchWatchlist();
  }, []);

  // Function to format time with better display
  const formatAiringTime = (timestamp) => {
    const airingDate = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = airingDate - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    // If it's airing within 24 hours, show countdown
    if (diffMs > 0 && diffHours < 24) {
      if (diffHours > 0) {
        return `in ${diffHours}h ${diffMins}m`;
      } else if (diffMins > 0) {
        return `in ${diffMins}m`;
      } else {
        return "Airing now!";
      }
    }
    
    // Otherwise show regular time
    return airingDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Function to check if anime is in user's watchlist
  const isInWatchlist = (animeTitle) => {
    if (!userWatchlist || userWatchlist.length === 0) return false;
    
    return userWatchlist.some(anime => 
      anime.title.toLowerCase().includes(animeTitle.toLowerCase()) ||
      animeTitle.toLowerCase().includes(anime.title.toLowerCase())
    );
  };

  // Function to filter schedule based on active tab
  const getFilteredSchedule = () => {
    if (!airingScheduleData) return {};
    
    if (activeTab === "all") {
      return airingScheduleData;
    }
    
    // Filter for watchlist tab
    const filteredSchedule = {};
    
    Object.keys(airingScheduleData).forEach(day => {
      const daySchedules = airingScheduleData[day].filter(schedule => {
        const animeTitle = schedule.media?.title?.english || schedule.media?.title?.romaji || "";
        return isInWatchlist(animeTitle);
      });
      
      if (daySchedules.length > 0) {
        filteredSchedule[day] = daySchedules;
      }
    });
    
    return filteredSchedule;
  };

  // Function to truncate and format the description
  function truncateAndFormatDescription(description) {
    const maxLength = 200;

    if (!description) {
      return "";
    }

    const firstFullStopIndex = description.indexOf(".");
    const truncationPoint =
      firstFullStopIndex !== -1 && firstFullStopIndex < maxLength
        ? firstFullStopIndex + 1
        : maxLength;

    const truncatedDescription = description
      ? description.slice(0, truncationPoint)
      : "";

    const isTruncated = description.length > truncationPoint;

    const formattedDescription = truncatedDescription
      .replace(/<br\s*[/]?>/gi, "\n")
      .replace(/<i>/gi, "")
      .replace(/<\/i>/gi, "")
      .replace(/<b>/gi, "")
      .replace(/<\/b>/gi, "");

    return isTruncated ? `${formattedDescription}` : formattedDescription;
  }

  const fetchData = async () => {
    const storedData = localStorage.getItem("eventsData");
    const lastFetchTime = localStorage.getItem("lastEventsFetchTime");

    if (storedData && lastFetchTime) {
      const elapsedTime = new Date().getTime() - parseInt(lastFetchTime, 10);
      const thirtyMinutesInMilliseconds = 30 * 60 * 1000;

      if (elapsedTime < thirtyMinutesInMilliseconds) {
        setAiringScheduleData(JSON.parse(storedData));
        setLastUpdated(
          new Date(parseInt(lastFetchTime, 10)).toLocaleTimeString()
        );
        return;
      }
    }

    const query = `
    query {
      Page {
        airingSchedules(airingAt_greater: ${currentTimestamp}) {
          id
          media {
            id
            title {
              romaji
              english
            }
            description
            coverImage {
              medium
            }
            siteUrl
            popularity
            isAdult
          }
          episode
          airingAt
        }
      }
    }
    `;

    const variables = {};
    const url = "https://graphql.anilist.co";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      const sortedByPopularity = data?.data?.Page?.airingSchedules
        .filter((schedule) => !schedule.media?.isAdult)
        .sort((a, b) => b.media?.popularity - a.media?.popularity);

      const groupedByDay = {};
      sortedByPopularity.forEach((schedule) => {
        const airingDate = new Date(schedule.airingAt * 1000);
        const airingDay = airingDate.getDate();

        if (!groupedByDay[airingDay]) {
          groupedByDay[airingDay] = [];
        }

        groupedByDay[airingDay].push(schedule);
      });

      localStorage.setItem("eventsData", JSON.stringify(groupedByDay));
      const currentTime = new Date().getTime().toString();
      localStorage.setItem("lastEventsFetchTime", currentTime);
      setLastUpdated(new Date(parseInt(currentTime, 10)).toLocaleTimeString());
      setAiringScheduleData(groupedByDay);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const filteredScheduleData = getFilteredSchedule();
  const hasWatchlistData = Object.keys(filteredScheduleData).length > 0;

  return (
    <main className="bg-background flex min-h-screen w-full items-center justify-center">
      <nav className="absolute w-full mb-10 top-0 px-3 py-2 opacity-80 bg-background shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-xl lg:3xl text-center font-semibold">Schedule</h1>
          <div className="relative text-xl text-primary">
            <IoIosNotifications size={32} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white"></span>
          </div>
        </div>
      </nav>

      <div className="flex flex-col w-full mt-9 py-4 mb-16 items-center justify-center">
        {/* Tab Navigation */}
        <div className="w-full px-2 mb-4">
          <div className="flex bg-gray-100 rounded-xl p-1 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "all"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FaCalendarAlt size={14} />
              All Anime
            </button>
            
            {isLoggedIn && (
              <button
                onClick={() => setActiveTab("watchlist")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === "watchlist"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FaClock size={14} />
                My Schedule
              </button>
            )}
          </div>
        </div>

        <div>
          {airingScheduleData ? (
            <div className="px-2 flex flex-col space-y-3">
              {/* Show message if no watchlist data */}
              {activeTab === "watchlist" && !hasWatchlistData && (
                <div className="text-center py-8 px-4">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <FaClock className="mx-auto mb-3 text-gray-400" size={32} />
                    <h3 className="font-semibold text-gray-900 mb-2">No anime in your schedule</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Add anime to your watchlist to see them here!
                    </p>
                    <button
                      onClick={() => setActiveTab("all")}
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
                    >
                      Browse All Anime
                    </button>
                  </div>
                </div>
              )}

              {Object.keys(filteredScheduleData)
                .sort((a, b) => {
                  const dateA = new Date(
                    filteredScheduleData[a][0].airingAt * 1000
                  );
                  const dateB = new Date(
                    filteredScheduleData[b][0].airingAt * 1000
                  );
                  return dateA - dateB;
                })
                .map((day) => (
                  <div key={day}>
                    <h2 className="text-lg font-semibold py-2 flex items-center gap-2">
                      {currentDate.getDate() === Number(day) ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          Today
                        </>
                      ) : (
                        new Date(
                          filteredScheduleData[day][0].airingAt * 1000
                        ).toLocaleDateString(undefined, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      )}
                    </h2>

                    {filteredScheduleData[day].map((schedule) => (
                      <div
                        className="flex items-start mb-3 p-3 shadow-md bg-white rounded-xl hover:shadow-lg transition-all duration-200 border border-gray-100"
                        key={schedule.id}
                      >
                        {/* Anime Cover */}
                        <div className="flex-shrink-0 mr-3">
                          <Image
                            width={80}
                            height={112}
                            className="rounded-lg w-16 h-20 sm:w-20 sm:h-28 object-cover shadow-sm"
                            src={schedule.media?.coverImage?.medium}
                            alt={
                              schedule.media?.title?.romaji ||
                              schedule.media?.title?.english
                            }
                          />
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 min-w-0">
                          {/* Title */}
                          <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-tight mb-2 pr-2">
                            <span className="hover:text-primary cursor-pointer transition-colors">
                              {schedule.media?.title?.english || schedule.media?.title?.romaji}
                            </span>
                            <span className="block text-xs sm:text-sm font-medium text-gray-500 mt-1">
                              Episode {schedule.episode}
                            </span>
                          </h3>

                          {/* Time and Status */}
                          <div className="space-y-2 mb-2">
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <FaClock size={12} className="text-primary flex-shrink-0" />
                              <span className="text-gray-600">Airing:</span>
                              <span className="font-semibold text-primary">
                                {formatAiringTime(schedule.airingAt)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{schedule.media.popularity.toLocaleString()} watching</span>
                            </div>

                            {/* Watchlist indicator */}
                            {isInWatchlist(schedule.media?.title?.english || schedule.media?.title?.romaji) && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-green-600 font-medium">
                                  In your watchlist
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 ml-2 flex-shrink-0">
                          <a
                            href={schedule.media?.siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                            title="View on AniList"
                          >
                            <FaEye size={14} />
                          </a>
                          <button
                            onClick={() => handleItemClick(schedule)}
                            className="flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm"
                            title="Add to Watchlist"
                          >
                            <MdPlaylistAdd size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              <p className="text-center text-gray-600">
                Last updated: {lastUpdated}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">{"Loading..."}</p>
          )}
        </div>
      </div>
      <BottomNav />
      {selectedItem && (
        <AddNewWatchlistItemEvent
          selectedItem={selectedItem}
          closeForm={() => setSelectedItem(null)}
          handleAddWatchlistItem={handleAddWatchlistItem}
        />
      )}
    </main>
  );
}

export default Events;