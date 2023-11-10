import React from "react";
import WatchListItem from "./watchListItem";

function WatchList() {
  return (
    <div className="bg-gray-400 bg-opacity-20 pt-2 w-full px-2 flex flex-col gap-2 overflow">
      <WatchListItem
        imageSrc="/hero-image (2).jpg"
        title="Naruto: Shippuden"
        status="Watched"
        review="Epic journey, Naruto's growth is inspiring!"
      />
      <WatchListItem
        imageSrc="/hero-image (8).png"
        title="Bleach"
        status="Watching"
        review="Epic battles with soul reapers and intriguing plot twists!"
      />
      <WatchListItem
        imageSrc="/hero-image (6).png"
        title="Demon Slayer"
        status="Watched"
        review="Stunning animation, emotional story, and intense demon slaying action!"
      />
      <WatchListItem
        imageSrc="/hero-image (7).png"
        title="My Hero Academia"
        status="Watching"
        review="Exciting hero battles and character development!"
      />
      <WatchListItem
        imageSrc="/bg-image (3).png"
        title="One Piece"
        status="Watching"
        review="Amazing world-building and epic adventures!"
      />

      <WatchListItem
        imageSrc="/bg-image (4).jpg"
        title="Spirited Away"
        status="Plan to Watch"
        review="Studio Ghibli classic, heard it's a masterpiece."
      />
      <WatchListItem
        imageSrc="/hero-image (1).jpg"
        title="Attack on Titan"
        status="Plan to Watch"
        review="Heard it's a must-watch, looking forward to it."
      />
      <WatchListItem
        imageSrc="/hero-image (2).jpg"
        title="Death Note"
        status="Watched"
        review="Incredible mind games between Light and L!"
      />
    </div>
  );
}

export default WatchList;
