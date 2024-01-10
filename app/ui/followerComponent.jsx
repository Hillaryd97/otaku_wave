import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

function FollowerComponent({
  imageSrc,
  name,
  country,
  userAuthId,
  handleFollow,
  initialIsFollowing
}) {
  const userDataJSON = sessionStorage.getItem("userData");
  const userSessionData = JSON.parse(userDataJSON);
  const username = userSessionData.user.uid;
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing); // Use local state


  return (
    <Link href={`/${userAuthId}`}>
    <div className="flex justify-between py-3 px-2 bg-secondary bg-opacity-70 items-start mb-2 rounded-md">
      <div className="flex gap-4 items-center">
        <Image
          src={imageSrc}
          width={500}
          height={500}
          className="rounded-full w-16 h-16"
          alt={name}
        />
        <div className="flex flex-col text-left">
          <h4 className="font-semibold">{name}</h4>
          <p className="text-sm text-gray-700">{country}</p>
        </div>
      </div>
      {username === userAuthId ? (
        ""
      ) : (
        <button
          onClick={() => handleFollow(userAuthId, isFollowing, setIsFollowing)}
          className={`border ${
            isFollowing ? "border-gray-500 text-gray-500" : "border-red-500"
          } text-red-500 font-bold px-3 py-1 shadow hover:bg-red-500 hover:text-white duration-300`}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      )}
    </div>
    </Link>
  );
}

export default FollowerComponent;
