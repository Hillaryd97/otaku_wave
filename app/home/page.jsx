"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import BottomNav from "../ui/bottomNav";
import TopNav from "../ui/topNav";
import { AiOutlinePlus } from "react-icons/ai";
import Post from "../ui/post";
import NewPostModal from "../ui/newPostModal";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

export default function Home() {
  const [addPostModal, showAddPostModal] = useState(false);

  const [posts, setPosts] = useState([]);

  const fetchPosts = () => {
    try {
      const postsCollection = collection(db, "posts");
      const unsubscribe = onSnapshot(postsCollection, (snapshot) => {
        const updatedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        setPosts(updatedPosts);
        console.log(updatedPosts);
        console.log(posts);
      });
  
      return unsubscribe;
    } catch (error) {
      console.error("Error fetching posts:", error.message);
      // Handle error, show a message, etc.
    }
  };
  
  useEffect(() => {
    const unsubscribe = fetchPosts();
  
    // Cleanup function to unsubscribe when the component unmounts
    return () => unsubscribe();
  }, [posts]);
  
  // useEffect(() => {
  //   console.log(posts);
  // }, [posts]);

  const timeAgo = (timestamp) => {
    if (!timestamp || !timestamp.seconds) {
      return ""; // Handle the case when timestamp is undefined or seconds are missing
    }
    const currentDate = new Date();
    const postDate = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds

    const timeDifference = currentDate - postDate;
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) {
      return `${seconds} ${seconds === 1 ? "second" : "seconds"} ago`;
    } else if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    } else if (hours < 24) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else {
      // Customize this part for days, weeks, etc. if needed
      return "more than a day ago";
    }
  };

  // Example usage
  const timestamp = {
    seconds: 1704910063,
    nanoseconds: 468000000,
  };

  console.log(timeAgo(timestamp));

  return (
    <main className="bg-background flex h-fit w-full min-h-full justify-center mb-16 pb-16 ">
      <TopNav />
      <div className="container mx-auto pt-2 px-2 mt-10">
        <div>
        {posts
          .flatMap((userPosts) => Object.values(userPosts))
          .filter((post) => post.newPost && post.timestamp)
          .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
          .map((post, index) => (
            <Post
              key={index}
              profilePicture={post.profilePic}
              userName={post.username}
              userBio={post.bio}
              postData={post.newPost}
              postImage={post.postPic}
              timePosted={timeAgo(post.timestamp)}
            />
          ))}
        </div>
      </div>
      <button
        onClick={() => showAddPostModal(!addPostModal)}
        className="fixed bottom-20 right-2 bg-primary p-3 rounded-full shadow-md text-white"
      >
        <AiOutlinePlus size={25} />
      </button>
      {addPostModal ? <NewPostModal addPostModal={showAddPostModal} /> : ""}
      <BottomNav />
    </main>
  );
}
