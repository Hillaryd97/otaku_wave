import Image from "next/image";
import React from "react";
import { AiFillHeart } from "react-icons/ai";
import { FaCommentDots } from "react-icons/fa";

function Post({
  profilePicture,
  userName,
  userBio,
  postData,
  postImage,
  timePosted,
}) {
  return (
    <div className="bg-secondary h-fit p-3 text-left flex flex-col gap-2 shadow-md rounded mt-3">
      <div className="flex space-x-2 items-center ">
        <Image
          src={profilePicture || "/bg-image (1).jpg"}
          className="w-14 h-14 rounded-full"
          alt=""
          width={500}
          height={500}

        />
        <div>
          <p className="font-bold">{userName || "Hikariiii"}</p>
          <p className="text-gray-600 text-xs">
            {userBio || "No bio yet"}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {postData ||
          "Just finished reading the new JJK manga chapter...why is Gege so evil??"}
        {postImage ? (
          <Image
            src={postImage}
            width={700}
            height={700}
            loading="lazy"
            className="w-full rounded"
            alt="image"
          />
        ) : (
          ""
        )}
      </div>
      <div className="text-gray-600 flex justify-between mt-2">
        <div className="flex space-x-4">
          <div className="text-gray-600 hover:text-primary duration-300">
            <AiFillHeart size={20} />
          </div>
          <div className="text-gray-600 hover:text-gray-500 duration-300">
            <FaCommentDots size={20} />
          </div>
        </div>
        <div>{timePosted || "Just Now"}</div>
      </div>
    </div>
  );
}

export default Post;
