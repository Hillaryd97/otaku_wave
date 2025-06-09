import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  Edit3,
  X,
} from "lucide-react";
import { doc, updateDoc, getDoc, deleteField } from "firebase/firestore";
import { db } from "../firebase";

function Post({
  profilePicture,
  userAuthId,
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
  postId,
  selectedAnime,
  watchlistAction, // NEW: Add this
  animeRating,     // NEW: Add this
  animeStatus,     // NEW: Add this
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const dropdownRef = useRef(null);

  const getAniDbId = (malId) => {
    // For now, return the MAL ID as placeholder
    // TODO: Implement actual MAL->AniDB ID conversion
    return malId;
  };

  const userDataJSON = sessionStorage.getItem("userData");
  const userData = JSON.parse(userDataJSON);
  const authId = userData?.user?.uid;

  const currentUserLiked = allLikes.some((like) => like.userId === authId);
  const isOwnPost = userAuthId === authId;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteComment = async (commentId) => {
    try {
      const postDocRef = doc(db, "posts", userAuthId);
      const postDocSnapshot = await getDoc(postDocRef);

      if (postDocSnapshot.exists()) {
        const postData = postDocSnapshot.data();
        const existingComments = postData[postId]?.comments || [];

        // Filter out the comment to delete
        const updatedComments = existingComments.filter(
          (comment) => comment.id !== commentId
        );

        await updateDoc(postDocRef, {
          [`${postId}.comments`]: updatedComments,
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleLike = () => {
    setIsLiked((prevIsLiked) => !prevIsLiked);
    if (onLike) onLike();
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;

    try {
      setIsCommenting(true);
      const postDocRef = doc(db, "posts", userAuthId);
      const postDocSnapshot = await getDoc(postDocRef);

      if (postDocSnapshot.exists()) {
        const postData = postDocSnapshot.data();
        const userDataJSON = sessionStorage.getItem("userData");
        const currentUser = JSON.parse(userDataJSON);
        const currentUserId = currentUser?.user?.uid;

        // Get current user's profile data for username
        const currentUserDocRef = doc(db, "users", currentUserId);
        const currentUserDoc = await getDoc(currentUserDocRef);
        const currentUserData = currentUserDoc.data();

        const newCommentObj = {
          id: Math.random().toString(36).substring(2),
          userId: currentUserId,
          username: currentUserData?.username || "Anonymous",
          comment: newComment.trim(),
          timestamp: new Date().toISOString(),
        };

        const existingComments = postData[postId]?.comments || [];

        await updateDoc(postDocRef, {
          [`${postId}.comments`]: [...existingComments, newCommentObj],
        });

        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!postId || !isOwnPost) return;

    try {
      setIsDeleting(true);
      const postDocRef = doc(db, "posts", authId);

      // Remove the specific post from the user's posts document
      await updateDoc(postDocRef, {
        [postId]: deleteField(),
      });

      setShowDeleteModal(false);
      setShowDropdown(false);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <Link
            href={`/${userAuthId}`}
            className="flex items-center gap-3 group"
          >
            <Image
              src={profilePicture || "/bg-image (1).jpg"}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
              alt={userName}
              width={48}
              height={48}
            />
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                {userName || "Anonymous"}
                {/* NEW: Show watchlist action */}
                {watchlistAction && (
                  <span className="font-normal text-gray-600 ml-1">
                    {watchlistAction}
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-500">{timePosted}</p>
            </div>
          </Link>

          {/* More Options */}
          {isOwnPost && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreHorizontal size={20} className="text-gray-500" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Anime Context */}
    {selectedAnime && (
  <div className="mx-4 mb-3">
    <a 
      href={`https://myanimelist.net/anime/${selectedAnime.malID}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100 hover:from-red-100 hover:to-pink-100 transition-colors group relative"
    >
      {/* NEW: Status Badge */}
      {animeStatus && (
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            animeStatus === 'Completed' ? 'bg-green-100 text-green-700' :
            animeStatus === 'Watching' ? 'bg-blue-100 text-blue-700' :
            animeStatus === 'Dropped' ? 'bg-red-100 text-red-700' :
            animeStatus === 'To Watch' ? 'bg-gray-100 text-gray-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {animeStatus.toUpperCase()}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Image
          src={selectedAnime.image || "/hero-image (2).jpg"}
          width={40}
          height={56}
          className="rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow"
          alt={selectedAnime.title}
        />
        <div className="flex-1">
          <p className="font-medium text-gray-900 group-hover:text-red-700 transition-colors pr-8">
            {selectedAnime.title}
          </p>
          {selectedAnime.episode && (
            <p className="text-sm text-red-600">Episode {selectedAnime.episode}</p>
          )}
          
          {/* NEW: Rating Display */}
          {animeRating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-400">
                {"⭐".repeat(animeRating)}
              </span>
              <span className="text-xs text-gray-600 font-medium">
                {animeRating}/5
              </span>
            </div>
          )}
        </div>
      </div>
    </a>
  </div>
)}

        {/* Content */}
        {postData && (
          <div className="px-4 pb-3">
            <p className="text-gray-900 leading-relaxed">{postData}</p>
          </div>
        )}

        {/* Image */}
        {postImage && (
          <div className="relative">
            <Image
              src={postImage}
              width={600}
              height={400}
              className="w-full max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
              alt="Post image"
              onClick={() => setShowImageModal(true)}
            />
          </div>
        )}

        {/* Bio on mobile - placed after content */}
        {/* {userBio && (
          <div className="px-4 pb-2 md:hidden">
            <p className="text-sm text-gray-600 italic">
              &quot;{userBio}&quot;
            </p>
          </div>
        )} */}

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-gray-50">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${
                currentUserLiked
                  ? "text-red-600"
                  : "text-gray-500 hover:text-red-600"
              }`}
            >
              <Heart
                size={20}
                className={currentUserLiked ? "fill-current" : ""}
              />
              <span className="text-sm font-medium">{likes || 0}</span>
            </button>

            <button
              onClick={handleComment}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-sm font-medium">
                {comments?.length || 0}
              </span>
            </button>
          </div>

          {/* Bio on desktop - right side */}
          {/* <div className="hidden md:block text-sm text-gray-500 max-w-xs">
            {userBio && <span className="italic">&quot;{userBio}&quot;</span>}
          </div> */}
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-gray-100 bg-gray-50">
            {/* Existing Comments */}
            {comments && comments.length > 0 && (
              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {comments.map((comment) => {
                  const userDataJSON =
                    typeof window !== "undefined"
                      ? sessionStorage.getItem("userData")
                      : null;
                  const currentUser = userDataJSON
                    ? JSON.parse(userDataJSON)
                    : null;
                  const currentUserId = currentUser?.user?.uid;
                  const canDeleteComment =
                    comment.userId === currentUserId ||
                    userAuthId === currentUserId;

                  return (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm text-gray-900">
                              {comment.username}
                            </p>
                            {canDeleteComment && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm">
                            {comment.comment}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Comment */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isCommenting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-sm rounded-full transition-colors"
                  >
                    {isCommenting ? "..." : "Post"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Post
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this post? This action cannot be
                undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePost}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && postImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
            <Image
              src={postImage}
              width={800}
              height={600}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              alt="Post image"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Post;
