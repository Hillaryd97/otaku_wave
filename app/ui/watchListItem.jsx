import Image from "next/image";
import React from "react";

function WatchListItem({ imageSrc, title, status, review }) {
  return (
    <section className="flex w-full bg-white rounded-md space-x-1.5">
      <div className="flex-shrink-0">
        <Image
          src={imageSrc || "/hero-image (2).jpg"}
          width={500}
          height={500}
          className="rounded- w-20 h-20"
        />
      </div>
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-center">
          <p className="font-bold text-lg">{title || "Anime Title"}</p>
          <p className="bg-green-600 px-3 py-1 rounded text-white text-sm">
            {status || "Watching"}
          </p>
        </div>
        <p className="text-gray-600 text-sm mt-1">
          <span className="font-semibold">Thoughts:</span>{" "}
          {review || "No review available."}
        </p>
      </div>
    </section>
  );
}

export default WatchListItem;
