import React, { useState, useEffect } from "react";
import Post from "./post";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Import your Firebase configuration
import Loading from "./loading";
import Image from "next/image";

function AllPosts() {
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const userDataJSON =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem("userData")
      : null;
  const userData = userDataJSON ? JSON.parse(userDataJSON) : null;
  const authId = userData?.user?.uid; // Add a check for user

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const postsCollectionRef = collection(db, "posts");

        // Directly using the document ID as the authId
        const postsSnapshot = await getDocs(postsCollectionRef);

        if (!postsSnapshot.empty) {
          const postsData = postsSnapshot.docs
            .filter((doc) => doc.id === authId)
            .map((doc) => ({
              postId: doc.id,
              ...doc.data(),
            }));

          setUserPosts(postsData);
          setLoading(false);
          console.log(postsData);
        } else {
          console.log("No posts found for user with ID:", authId);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [authId]);

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const timeAgo = (timestamp) => {
    if (!timestamp || !timestamp.seconds) {
      return ""; // Handle the case when timestamp is undefined or seconds are missing
    }

    const currentDate = new Date();
    const postDate = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
    const timeDifference = currentDate - postDate;
    const daysDifference = Math.floor(timeDifference / (24 * 60 * 60 * 1000));

    if (daysDifference >= 1) {
      return formatDate(postDate);
    } else {
      const seconds = Math.floor(timeDifference / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (seconds < 60) {
        return `${seconds} ${seconds === 1 ? "second" : "seconds"} ago`;
      } else if (minutes < 60) {
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
      } else {
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
      }
    }
  };

  return (
    <div className="bg-gray-400 bg-opacity-20 w-full px-2 flex flex-col">
      <div>
        {loading ? (
          <Loading />
        ) : userPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Image
              width={500}
              height={500}
              alt="No Posts"
              src={"/empty.svg"}
              className="h-56 w-56"
            />
            <p>No posts to display</p>
          </div>
        ) : (
          userPosts
            .flatMap((userPosts) => Object.values(userPosts))
            .filter((post) => post.newPost && post.timestamp)
            .sort(
              (a, b) =>
                (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
            )
            .map((post, index) => (
              <Post
                key={post.postId}
                userAuthId={post.authId}
                profilePicture={post.profilePic}
                userName={post.username}
                userBio={post.bio}
                postData={post.newPost}
                postImage={post.postPic}
                timePosted={timeAgo(post.timestamp)}
                likes={post.likes ? post.likes.length : 0}
                allLikes={post.likes}
                selectedAnime={post.selectedAnime} // ADD
                watchlistAction={post.watchlistAction} // NEW
                animeRating={post.animeRating} // NEW
                animeStatus={post.animeStatus} // NEW
              />
            ))
        )}
      </div>
    </div>
  );
}

export default AllPosts;
