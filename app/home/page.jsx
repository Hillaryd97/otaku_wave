"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import BottomNav from "../ui/bottomNav";
import TopNav from "../ui/topNav";
import { AiOutlinePlus } from "react-icons/ai";
import Post from "../ui/post";
import NewPostModal from "../ui/newPostModal";

export default function Home() {
  // const userDataJSON = sessionStorage.getItem("userData");
  // const userData = JSON.parse(userDataJSON);
  // const username = userData.user.email;
  // const router = useRouter();
  // const userSignOut = () => {
  //   signOut(auth)
  //     .then(console.log("signout successful"))
  //     .catch((error) => console.log(error));
  //   sessionStorage.removeItem("userData");
  //   router.push("/");
  //   console.log("hiiii");
  // };

  const [addPostModal, showAddPostModal] = useState(false);

  // console.log(addPostModal)

  return (
    <main className="bg-background flex h-fit w-full min-h-full justify-center mb-16 pb-16 ">
      <TopNav />
      <div className="container mx-auto pt-2 px-2 mt-10">
        <div>
          <Post />
          <Post
            profilePicture={"/hero-image (6).png"}
            userName={"Tanjiro Kamado"}
            userBio={"Demon Slayer Corps member"}
            postData={
              "Just encountered a powerful demon - time to get serious!"
            }
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
      <button
        onClick={() => showAddPostModal(!addPostModal)}
        className="fixed bottom-20 right-2 bg-primary p-3 rounded-full shadow-md text-white"
      >
        <AiOutlinePlus size={25} />
      </button>
      {addPostModal ? <NewPostModal addPostModal={showAddPostModal}/> : ""}
      <BottomNav />
    </main>
  );
}
{
  /* <h1>Welcome back! {username}</h1>
      <button onClick={userSignOut}>Logout</button> */
}
