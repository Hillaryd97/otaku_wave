import React, { useEffect, useRef, useState } from "react";
import { ImageIcon, X, Film, Send } from "lucide-react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import Image from "next/image";

function NewPostModal({ addPostModal }) {
  const modalRef = useRef(null);
  const [newPost, setNewPost] = useState("");
  const [postPic, setpostPic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // New anime selection states
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [episode, setEpisode] = useState("");
  const [userWatchlist, setUserWatchlist] = useState([]);
  const [showAnimeDropdown, setShowAnimeDropdown] = useState(false);
  
  const userDataJSON = sessionStorage.getItem("userData");
  const userSessionData = JSON.parse(userDataJSON);
  const username = userSessionData.user.uid;

  // Fetch user's watchlist when modal opens
  useEffect(() => {
    const fetchUserWatchlist = async () => {
      try {
        const userDocRef = doc(db, "users", username);
        const userDocSnapshot = await getDoc(userDocRef);
        
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setUserWatchlist(userData.watchlist || []);
        }
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      }
    };

    if (username) {
      fetchUserWatchlist();
    }
  }, [username]);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("overlay")) {
      closeModal();
    }
  };

  const closeModal = () => {
    addPostModal(false);
  };

  useEffect(() => {
    if (!addPostModal) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, [addPostModal]);

  const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];

  const handleFileChange = async (e) => {
    if (isLoading) return;
    
    const file = e.target.files[0];
    if (!file) return;

    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      alert("File is too large! Please choose a smaller image.");
      return;
    } 
    
    if (!allowedImageTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPG, PNG, or GIF).");
      return;
    }

    try {
      setIsLoading(true);
      const storage = getStorage();
      const storageRef = ref(storage, `posts/${username}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytesResumable(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setpostPic(downloadURL);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomId = () => {
    return Math.random().toString(36).substring(2);
  };

  const handleAnimeSelect = (anime) => {
    setSelectedAnime(anime);
    setShowAnimeDropdown(false);
  };

  const removeSelectedAnime = () => {
    setSelectedAnime(null);
    setEpisode("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || (!newPost.trim() && !postPic && !selectedAnime)) return;
    
    try {
      setIsSubmitting(true);
      const postId = generateRandomId();
      const userDocRef = doc(db, "users", username);
      const userDocSnapshot = await getDoc(userDocRef);

      const userData = userDocSnapshot.data();
      
      const postData = {
        authId: username,
        username: userData.username,
        profilePic: userData.profilePic,
        bio: userData.bio,
        newPost: newPost.trim(),
        postPic: postPic,
        selectedAnime: selectedAnime ? {
          malID: selectedAnime.malID,
          title: selectedAnime.title,
          image: selectedAnime.image,
          episode: episode || null
        } : null,
        comments: [],
        likes: [],
        timestamp: serverTimestamp(),
      };

      const postDocRef = doc(db, "posts", username);
      await setDoc(
        postDocRef,
        {
          [postId]: {
            postId,
            ...postData,
          },
        },
        { merge: true }
      );

      addPostModal(false);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overlay"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Create Post</h2>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selected Anime */}
          {selectedAnime && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
              <Image
                src={selectedAnime.image || "/hero-image (2).jpg"}
                width={40}
                height={56}
                className="rounded-lg object-cover shadow-sm"
                alt={selectedAnime.title}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{selectedAnime.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    placeholder="Episode"
                    value={episode}
                    onChange={(e) => setEpisode(e.target.value)}
                    className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                  <span className="text-xs text-gray-500">{selectedAnime.status}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={removeSelectedAnime}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>
          )}

          {/* Text Input */}
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-32 p-4 text-gray-900 placeholder-gray-500 bg-gray-50 border-0 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          {/* Image Preview */}
          {postPic && (
            <div className="relative">
              <Image
                width={600}
                height={400}
                src={postPic}
                alt="Post image"
                className="w-full h-64 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => setpostPic("")}
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              {/* Image Upload */}
              <label className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                {isLoading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full" />
                ) : (
                  <ImageIcon size={20} className="text-gray-600" />
                )}
              </label>

              {/* Anime Selection */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAnimeDropdown(!showAnimeDropdown)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Film size={20} className="text-gray-600" />
                </button>

                {/* Anime Dropdown */}
                {showAnimeDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 w-80 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                    <div className="p-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-700">Your Watchlist</p>
                    </div>
                    {userWatchlist.length > 0 ? (
                      userWatchlist.map((anime) => (
                        <div
                          key={anime.malID}
                          onClick={() => handleAnimeSelect(anime)}
                          className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                        >
                          <Image
                            src={anime.image || "/hero-image (2).jpg"}
                            width={32}
                            height={44}
                            className="rounded object-cover"
                            alt={anime.title}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{anime.title}</p>
                            <p className="text-sm text-gray-500">{anime.status}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <Film size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No anime in your watchlist</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (!newPost.trim() && !postPic && !selectedAnime)}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              {isSubmitting ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send size={16} />
              )}
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewPostModal;