import Image from "next/image";
import React from "react";

function WatchListItem({
  imageSrc,
  title,
  status,
  review,
  episodes,
  airingStatus,
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-600";
      case "Watching":
        return "bg-purple-600";
      case "Rewatching":
        return "bg-yellow-600";
      case "To Watch":
        return "bg-slate-600";
      default:
        return "bg-purple-600"; // Default color for 'Watching'
    }
  };

  return (
    <section className="flex w-full mb-2 ml-1 shadow-md bg-white rounded-md space-x-1.5">
      <div className="flex-shrink-0">
        <img
          src={imageSrc || "/hero-image (2).jpg"}
          width={500}
          height={500}
          className="rounded-md w-20 h-fit"
          alt="Anime Poster"
        />
      </div>
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-center">
          <p className="font-bold">{title || "Anime Title"}</p>
        </div>{" "}
        <div>
          {/* &nbsp;
          <span className={`text-sm ${getAiringStatusColor(airingStatus)}`}>
            ({airingStatus || "Airing Status"})
          </span> */}
        </div>
        <p className="text-gray-600 text-sm mt-1">
          <span className="font-semibold">Thoughts:</span>{" "}
          {review || "No review available."}
        </p>
        <div className="flex flex-col my-2 ">
          {/* Move the watch status to the bottom */}
          {/* <span className="text-gray-600 text-sm">
            Episodes: {episodes || "Unknown"}
          </span> */}
          <p
            className={`px-3 w-fit py-1 rounded text-white text-xs ${getStatusColor(
              status
            )}`}
          >
            {status || "Watching"}
          </p>
        </div>
      </div>
    </section>
  );
}

export default WatchListItem;
