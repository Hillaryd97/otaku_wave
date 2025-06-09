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
import Image from "next/image";

export default function Home() {
  const [addPostModal, showAddPostModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

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
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error fetching posts:", error.message);
      setLoading(false);
    }
  };

  // Fetch current user data for friends filtering
  const fetchUserData = () => {
    const userDataJSON = sessionStorage.getItem("userData");
    const userSessionData = JSON.parse(userDataJSON);
    const authId = userSessionData?.user?.uid;

    if (authId) {
      const userDocRef = doc(db, "users", authId);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        }
      });
      return unsubscribe;
    }
  };

  const handleLike = async (postId, userId, username) => {
    try {
      const postDocRef = doc(db, "posts", userId);
      const postDocSnapshot = await getDoc(postDocRef);

      if (postDocSnapshot.exists()) {
        const postData = postDocSnapshot.data();
        const userDataJSON = sessionStorage.getItem("userData");
        const currentUser = JSON.parse(userDataJSON);
        const currentUserId = currentUser?.user?.uid;

        const hasLiked = postData[postId]?.likes?.some(
          (like) => like.userId === currentUserId
        );

        if (hasLiked) {
          await updateDoc(postDocRef, {
            [`${postId}.likes`]: postData[postId].likes.filter(
              (like) => like.userId !== currentUserId
            ),
          });
        } else {
          await updateDoc(postDocRef, {
            [`${postId}.likes`]: [
              ...postData[postId].likes,
              { userId: currentUserId, username: userData?.username },
            ],
          });
        }
      }
    } catch (error) {
      console.error("Error updating like status: ", error);
    }
  };

  const handleComment = (postId) => {
    console.log(`Commented on post ${postId}`);
  };

  useEffect(() => {
    const userDataJSON = sessionStorage.getItem("userData");
    const userSessionData = JSON.parse(userDataJSON);

    if (!userSessionData || !userSessionData.user) {
      router.push("/login");
      return;
    }

    const unsubscribePosts = fetchPosts();
    const unsubscribeUser = fetchUserData();

    return () => {
      unsubscribePosts();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, [router]);

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const timeAgo = (timestamp) => {
    if (!timestamp || !timestamp.seconds) {
      return "";
    }

    const currentDate = new Date();
    const postDate = new Date(timestamp.seconds * 1000);
    const timeDifference = currentDate - postDate;
    const daysDifference = Math.floor(timeDifference / (24 * 60 * 60 * 1000));

    if (daysDifference > 1) {
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

  // Filter posts to only show from friends + own posts
  const getVisiblePosts = () => {
    if (typeof window === "undefined") return []; // Server-side check

    const userDataJSON = sessionStorage.getItem("userData");
    if (!userDataJSON) return [];

    const currentUser = JSON.parse(userDataJSON);
    const currentUserId = currentUser?.user?.uid;

    if (!userData || !currentUserId) return [];

    const friendIds = userData.following?.map((friend) => friend.uid) || [];
    const allowedUserIds = [currentUserId, ...friendIds];

    return posts
      .filter((userPosts) => allowedUserIds.includes(userPosts.id))
      .flatMap((userPosts) => Object.values(userPosts))
      .filter((post) => post.newPost !== undefined && post.timestamp)
      .sort(
        (a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
      );
  };

  const visiblePosts = getVisiblePosts();

  return (
    <main className="bg-background flex h-fit w-full min-h-full justify-center mb-16 pb-16">
      <TopNav />
      <div className="container mx-auto pt-2 px-2 mt-10">
        <div>
          {loading ? (
            <Loading />
          ) : visiblePosts.length === 0 ? (
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
            visiblePosts.map((post, index) => (
              <Post
                key={`${post.authId}-${post.postId}`}
                postId={post.postId}
                userAuthId={post.authId}
                profilePicture={post.profilePic}
                userName={post.username}
                userBio={post.bio}
                postData={post.newPost}
                postImage={post.postPic}
                timePosted={timeAgo(post.timestamp)}
                likes={post.likes ? post.likes.length : 0}
                comments={post.comments || []}
                allLikes={post.likes}
                selectedAnime={post.selectedAnime}
                watchlistAction={post.watchlistAction} // NEW
                animeRating={post.animeRating} // NEW
                animeStatus={post.animeStatus} // NEW
                onLike={() =>
                  handleLike(post.postId, post.authId, post.username)
                }
                onComment={() => handleComment(post.postId)}
              />
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

      {addPostModal && <NewPostModal addPostModal={showAddPostModal} />}
      <BottomNav />
    </main>
  );
}
