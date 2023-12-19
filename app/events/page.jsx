"use client";

import React, { useEffect, useState } from "react";
import BottomNav from "../ui/bottomNav";
import { IoIosNotifications, IoIosAdd } from "react-icons/io";
import { MdPlaylistAdd } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import EditWatchListItemForm from "../ui/editWatchListItemForm";
import AddWatchListItemForm from "../ui/addWatchlistItemForm ";
import AddNewWatchlistItemEvent from "../ui/addNewWatchlistItemEvent";
function Events() {
  const [airingScheduleData, setAiringScheduleData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddWatchlistItem, setShowAddWatchlistItem] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const handleAddWatchlistItem = () => {
    setShowAddWatchlistItem(!showAddWatchlistItem);
  };
  // useState(null);

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const currentMonthStart =
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() /
    1000;
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();
  const output = `${currentMonth} ${currentYear}`;
  // console.log(output);

  // Function to truncate and format the description
  function truncateAndFormatDescription(description) {
    const maxLength = 200;

    // Check if description is null or undefined
    if (!description) {
      return "";
    }

    // Find the index of the first full stop
    const firstFullStopIndex = description.indexOf(".");

    // Determine the truncation point based on the first full stop
    const truncationPoint =
      firstFullStopIndex !== -1 && firstFullStopIndex < maxLength
        ? firstFullStopIndex + 1
        : maxLength;

    // Truncate the description
    const truncatedDescription = description
      ? description.slice(0, truncationPoint)
      : "";

    // Check if the description was truncated
    const isTruncated = description.length > truncationPoint;

    // Replace HTML tags with line breaks
    const formattedDescription = truncatedDescription
      .replace(/<br\s*[/]?>/gi, "\n")
      .replace(/<i>/gi, "")
      .replace(/<\/i>/gi, "")
      .replace(/<b>/gi, "")
      .replace(/<\/b>/gi, "");

    // Add "..." if the description was truncated
    return isTruncated ? `${formattedDescription}` : formattedDescription;
  }

  useEffect(() => {
    const storedData = localStorage.getItem("eventsData");
    const lastFetchTime = localStorage.getItem("lastEventsFetchTime");

    if (storedData && lastFetchTime) {
      const elapsedTime = new Date().getTime() - parseInt(lastFetchTime, 10);
      const thirtyMinutesInMilliseconds = 30 * 60 * 1000; // 30 minutes in milliseconds

      if (elapsedTime < thirtyMinutesInMilliseconds) {
        setAiringScheduleData(JSON.parse(storedData));
        setLastUpdated(
          new Date(parseInt(lastFetchTime, 10)).toLocaleTimeString()
        );
        return;
      }
    }
    // Define the GraphQL query
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

    // Define the GraphQL variables (if needed)
    const variables = {
      // You can add variables here if necessary
    };

    // Define the config for the API request
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

    fetch(url, options)
      .then((response) => response.json())
      .then((data) => {
        // Sort anime schedules by popularity in ascending order
        const sortedByPopularity = data?.data?.Page?.airingSchedules
          .filter((schedule) => !schedule.media?.isAdult)
          .sort((a, b) => b.media?.popularity - a.media?.popularity);

        // Organize anime schedules by day
        const groupedByDay = {};
        sortedByPopularity.forEach((schedule) => {
          const airingDate = new Date(schedule.airingAt * 1000);
          const airingDay = airingDate.getDate();

          if (!groupedByDay[airingDay]) {
            groupedByDay[airingDay] = [];
          }

          groupedByDay[airingDay].push(schedule);
        });

        // Set the organized data to the state
        localStorage.setItem("eventsData", JSON.stringify(groupedByDay));
        const currentTime = new Date().getTime().toString();
        localStorage.setItem("lastEventsFetchTime", currentTime);
        setLastUpdated(
          new Date(parseInt(currentTime, 10)).toLocaleTimeString()
        );
        setAiringScheduleData(groupedByDay);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error if needed
      });
  }, []);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    console.log(selectedItem);
  };
  console.log(lastUpdated);

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
        <div>
          {/* <div className="flex items-center flex-col">
            <h2 className="text-xl font-semibold text-center pb-2">
              Airing Soon
            </h2>
            <p className="text-center text-sm">
              Explore upcoming anime releases and plan your watchlist
            </p>
          </div> */}
          {airingScheduleData ? (
            <div className="px-2 flex flex-col space-y-3 ">
              {Object.keys(airingScheduleData).map((day) => (
                <div key={day}>
                  <h2 className="text-lg font-semibold py-2">
                    {currentDate.getDate() === Number(day)
                      ? "Today"
                      : new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          Number(day)
                        ).toLocaleDateString(undefined, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                  </h2>
                  {console.log(airingScheduleData)}
                  {airingScheduleData[day].map((schedule) => (
                    <div
                      className="flex items-center
                      mb-2 ml-1 shadow-md bg-white rounded-md space-x-1.5 flex-shrink-0"
                      key={schedule.id}
                    >
                      <div className="w-2/5">
                        <img
                          width={500}
                          height={500}
                          className="rounded-md w-24 h-fit object-cover"
                          src={schedule.media?.coverImage?.medium}
                          alt={
                            schedule.media?.title?.romaji ||
                            schedule.media?.title?.english
                          }
                        />
                      </div>
                      <div className="w-full py-0.5 flex flex-col space-y-1 md:space-y-1.5">
                        <h3 className="font-semibold md:w-3/4">
                          <span
                            title={schedule.media.title.romaji}
                            className="hover:text-gray-800 cursor-pointer"
                          >
                            {schedule.media?.title?.english && (
                              <span>
                                {schedule.media.title.english} (Ep{" "}
                                {schedule.episode})
                                <br />
                                {/* <span className="text-gray-600 font-medium text-xs">
                                  Other Names: {schedule.media.title.romaji}
                                </span> */}
                              </span>
                            )}
                            {!schedule.media?.title?.english && (
                              <span>{schedule.media.title.romaji}</span>
                            )}
                          </span>
                        </h3>
                        {/* <p>Episode: <span className="font-semibold">{schedule.episode}</span></p> */}
                        <p className="text-sm text-gray-800">
                          Airing:{" "}
                          <span className="font-semibold">
                            {new Date(
                              schedule.airingAt * 1000
                            ).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </p>
                        <p className="text-xs text-red-500">
                          {schedule.media.popularity.toLocaleString()} people
                          are watching
                        </p>
                        {/* <p
                        dangerouslySetInnerHTML={{
                          __html: truncateAndFormatDescription(
                            schedule.media?.description
                          ),
                        }}
                      ></p> */}
                      </div>
                      <div className="flex flex-col space-y-2 px-4 text-2xl text-white">
                        <a
                          href={schedule.media?.siteUrl}
                          className="flex items-center p-1 rounded bg-red-600 hover:bg-gray-500 duration-300"
                        >
                          <FaEye size={24} />
                        </a>
                        <button
                          onClick={() => handleItemClick(schedule)}
                          className="flex items-center font-bold p-1 rounded bg-green-600 hover:bg-gray-500 duration-300"
                        >
                          <MdPlaylistAdd size={24} />
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
          closeForm={() => setSelectedItem(null)} // Close the form when needed
          handleAddWatchlistItem={handleAddWatchlistItem}
        />
      )}
    </main>
  );
}

export default Events;
