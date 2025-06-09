import Image from "next/image";
import React from "react";
import { Star, Calendar } from "lucide-react";

function WatchListItem({
  imageSrc,
  title,
  status,
  review,
  episodes,
  airingStatus,
  rating = 0,
  dateAdded,
  onClick,
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-600";
      case "Watching":
        return "bg-blue-600";
      case "Rewatching":
        return "bg-yellow-600";
      case "To Watch":
        return "bg-gray-600";
      case "Dropped":
        return "bg-red-600";
      default:
        return "bg-blue-600";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    } else if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
    } else if (diffDays <= 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months === 1 ? "" : "s"} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years === 1 ? "" : "s"} ago`;
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          className={`${
            i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <section
      className="flex w-full mb-2 shadow-md bg-white rounded-md space-x-3 hover:shadow-lg transition-shadow cursor-pointer p-3"
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        <Image
          src={imageSrc || "/hero-image (2).jpg"}
          width={500}
          height={500}
          className="rounded-md w-20 h-fit object-cover"
          alt="Anime Poster"
        />
      </div>

      <div className="flex flex-col flex-grow min-w-0">
        {/* Title and Rating */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-sm leading-tight flex-1 mr-3 truncate">
            {title || "Anime Title"}
          </h3>
          {rating > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0 bg-yellow-50 px-2 py-1 rounded-full">
              {renderStars(rating)}
              <span className="text-xs text-gray-700 ml-1 font-medium">
                {rating}/5
              </span>
            </div>
          )}
        </div>

        {/* Review */}
        {review && (
          <p className="text-gray-600 text-xs mt-1 line-clamp-2 mb-2">
            <span className="font-semibold text-gray-700">Review:</span>{" "}
            {review}
          </p>
        )}

        {/* Bottom Section */}
        <div className="flex items-center justify-between mt-auto">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(
                status
              )}`}
            >
              {status || "Watching"}
            </span>

            {/* Date Added */}
            {dateAdded && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={10} />
                <span>{formatDate(dateAdded)}</span>
              </div>
            )}
          </div>

          {/* Episodes Info */}
          {episodes && status === "Watching" && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {episodes} eps
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

export default WatchListItem;
