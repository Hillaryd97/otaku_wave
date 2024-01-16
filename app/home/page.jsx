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
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import Loading from "../ui/loading";

export default function Home() {
  const [addPostModal, showAddPostModal] = useState(false);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
        // console.log(updatedPosts);
        // console.log(posts);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error fetching posts:", error.message);
      setLoading(false);
      // Handle error, show a message, etc.
    }
  };
  
  const handleLike = async (postId, userId, username) => {
    try {
      const postDocRef = doc(db, "posts", userId);
      const postDocSnapshot = await getDoc(postDocRef);

      // Check if the post document exists
      if (postDocSnapshot.exists()) {
        const postData = postDocSnapshot.data();

        // Check if the user has already liked the post
        const hasLiked = postData[postId].likes.includes(userId);

        // Toggle the like status
        if (hasLiked) {
          // Remove the user from the likes array
          await updateDoc(postDocRef, {
            [`${postId}.likes`]: postData[postId].likes.filter(
              (like) => like !== userId
            ),
          });
        } else {
          // Add the user to the likes array
          await updateDoc(postDocRef, {
            [`${postId}.likes`]: [
              ...postData[postId].likes,
              { userId: userId, username: username },
            ],
          });
        }
      }
    } catch (error) {
      console.error("Error updating like status: ", error);
    }
  };

  const handleComment = (postId) => {
    // Implement logic to handle commenting (e.g., open a comment modal)
    console.log(`Commented on post ${postId}`);
  };
  useEffect(() => {
    const unsubscribe = fetchPosts();

    // Cleanup function to unsubscribe when the component unmounts
    return () => unsubscribe();
  });

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

  // console.log(timeAgo(timestamp));

  return (
    <main className="bg-background flex h-fit w-full min-h-full justify-center mb-16 pb-16 ">
      <TopNav />
      <div className="container mx-auto pt-2 px-2 mt-10">
        <div>
          {loading ? (
            // Display a loading indicator while posts are being fetched
            // <p>Loading...</p>
            <Loading />
          ) : (
            posts.map((userPosts, index) => (
              <div key={index}>
                {posts
                  .flatMap((userPosts) => Object.values(userPosts))
                  .filter((post) => post.newPost && post.timestamp)
                  .sort(
                    (a, b) =>
                      (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
                  )
                  .map((post, index) => (
                    <Post
                      key={index}
                      profilePicture={post.profilePic}
                      userName={post.username}
                      userBio={post.bio}
                      postData={post.newPost}
                      postImage={post.postPic}
                      timePosted={timeAgo(post.timestamp)}
                      likes={post.likes ? post.likes.length : 0}
                      allLikes={post.likes}
                      // comments={post.comments}
                      onLike={() =>
                        handleLike(post.postId, post.authId, post.username)
                      }
                      onComment={() => handleComment(post.postId)}
                    />
                  ))}
              </div>
            ))
          )}
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
