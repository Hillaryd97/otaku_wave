import Image from "next/image";
import React, { useState } from "react";
import { AiFillHeart } from "react-icons/ai";
import { FaCommentDots } from "react-icons/fa";

function Post({
  profilePicture,
  userName,
  userBio,
  postData,
  postImage,
  timePosted,
  likes,
  comments,
  onLike,
  onComment,
  allLikes = [],
}) {
  const [isLiked, setIsLiked] = useState(false);
  const userDataJSON = sessionStorage.getItem("userData");
  const userData = JSON.parse(userDataJSON);
  const authId = userData?.user?.uid; // Add a check for user

  const currentUserLiked = allLikes.some((like) => like.userId === authId);
  const handleLike = () => {
    // Toggle the like status
    setIsLiked((prevIsLiked) => !prevIsLiked);

    // Call the parent component's onLike function to update the likes
    onLike();
  };

  const handleComment = () => {
    // Call the parent component's onComment function to handle commenting
    onComment();
  };

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
          <p className="font-bold">{userName || "No username"}</p>
          <p className="text-gray-600 text-xs">{userBio || "No bio yet"}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {postData || " "}
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
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center space-x-1 text-gray-600 hover:text-primary duration-300 cursor-pointer ${
              currentUserLiked ? "text-primary" : ""
            }`}
            onClick={handleLike}
          >
            <AiFillHeart size={20} />
            <p>{likes}</p>
          </div>
          <div
            className="text-gray-600 hover:text-gray-500 duration-300 cursor-pointer"
            onClick={handleComment}
          >
            <FaCommentDots size={20} />
          </div>
        </div>
        <div>{timePosted || ""}</div>
      </div>
    </div>
  );
}

export default Post;
