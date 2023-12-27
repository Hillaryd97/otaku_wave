import React from "react";
import Post from "./post";

function AllPosts() {
  return (
    <div className="bg-gray-400 bg-opacity-20 w-full px-2 flex flex-col" >
      <div>
        <Post
          profilePicture={"/hero-image (6).png"}
          userName={"Tanjiro Kamado"}
          userBio={"Demon Slayer Corps member"}
          postData={"Just encountered a powerful demon - time to get serious!"}
          timePosted={"3 minutes ago"}
        />

        <Post
          profilePicture={"/hero-image (2).jpg"}
          userName={"Naruto Uzumaki"}
          userBio={"Believe it! The Hokage of Konoha"}
          postData={"Believe in yourself and never give up!"}
          postImage={"/bg-image (4).jpg"}
          timePosted={"5 minutes ago"}
        />
        <Post
          profilePicture={"/hero-image (8).png"}
          userName={"Ichigo Kurosaki"}
          userBio={"Soul Reaper with a Hollow side"}
          postData={
            "Wondering if I can take a day off from saving the world..."
          }
          timePosted={"7 minutes ago"}
        />

        <Post
          profilePicture={"/bg-image (3).png"}
          userName={"Monkey D. Luffy"}
          userBio={"Future Pirate King"}
          postData={"I'm gonna find the One Piece!"}
          timePosted={"10 minutes ago"}
        />

        <Post
          profilePicture={"/hero-image (7).png"}
          userName={"Izuku Midoriya"}
          userBio={"Quirk: One For All"}
          postData={"Plus Ultra! Let's be heroes!"}
          timePosted={"15 minutes ago"}
        />
      </div>
    </div>
  );
}

export default AllPosts;
