import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { Star } from "lucide-react";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

function AddNewWatchlistItemEvent({
  onSubmit,
  handleAddWatchlistItem,
  closeForm,
  selectedItem,
}) {
  const [title, setTitle] = useState(
    `${selectedItem.media?.title?.english || selectedItem.media?.title?.romaji}`
  );
  const [status, setStatus] = useState("");
  const [selectedAnimeData, setSelectedAnimeData] = useState([]);
  const [thoughts, setThoughts] = useState("");
  const [image, setimage] = useState(
    `${selectedItem.media?.coverImage?.medium}`
  );
  const [airingStatus, setairingStatus] = useState("");
  const [episodes, setEpisodes] = useState(`${selectedItem.episode}`);
  const [airingEpisode, setAiringEpisode] = useState(`${selectedItem.episode}`);
  const [malID, setMalID] = useState(`${selectedItem.id}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [manualStarRating, setManualStarRating] = useState(0);
  const [shouldCreatePost, setShouldCreatePost] = useState(true); // Toggle for post creation

  const userDataJSON = sessionStorage.getItem("userData");
  const userSessionData = JSON.parse(userDataJSON);
  const username = userSessionData?.user?.uid;
  const Swal = require("sweetalert2");

  const updateLastActive = async (userId) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        lastActive: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating last active:", error);
    }
  };

  // Auto-detect rating from review text
  const parseReviewRating = (reviewText) => {
    if (!reviewText) return 0;

    const patterns = [
      /\((\d+(?:\.\d+)?)\/10\)/, // (8.5/10)
      /\((\d+(?:\.\d+)?)\s*\/\s*10\)/, // (8.5 / 10)
      /(\d+(?:\.\d+)?)\/10/, // 8.5/10
      /\((\d+(?:\.\d+)?)\)/, // (8.5) - assuming out of 10
    ];

    for (const pattern of patterns) {
      const match = reviewText.match(pattern);
      if (match) {
        const rating = parseFloat(match[1]);
        if (rating <= 0) return 0;
        if (rating > 10) return 5;
        return Math.round(rating / 2);
      }
    }

    const negativeMatch = reviewText.match(/-(\d+)\/10/);
    if (negativeMatch) return 0;

    return 0;
  };

  // Get effective rating (manual priority, then auto-detect)
  const getEffectiveRating = () => {
    if (manualStarRating > 0) return manualStarRating;
    return parseReviewRating(thoughts);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const truncatedValue = value.slice(0, 250);

    if (name === "thoughts") {
      setThoughts(truncatedValue);
    }
  };

  const handleRatingClick = (rating) => {
    setManualStarRating(rating);
  };

  const clearManualRating = () => {
    setManualStarRating(0);
  };

  // 🎯 Enhanced post creation function
const createWatchlistPost = async (animeData, userData, actionType) => {
  try {
    const postId = Math.random().toString(36).substring(2);
    
    // NEW: Clean post text - ONLY user's review, no auto-generated text
    let postText = "";
    if (animeData.thoughts && animeData.thoughts.trim()) {
      postText = animeData.thoughts.trim();
    }

    // NEW: Determine action for username display
    let watchlistAction = "";
    switch (animeData.status) {
      case "Watching":
        watchlistAction = "started watching";
        break;
      case "Completed":
        watchlistAction = "completed";
        break;
      case "To Watch":
        watchlistAction = "added to plan to watch";
        break;
      case "Rewatching":
        watchlistAction = "started rewatching";
        break;
      case "Dropped":
        watchlistAction = "dropped";
        break;
      default:
        watchlistAction = "added to watchlist";
    }

    const postData = {
      authId: username,
      username: userData.username,
      profilePic: userData.profilePic,
      bio: userData.bio,
      newPost: postText, // CLEAN: Only user's actual review
      postPic: "",
      selectedAnime: {
        malID: animeData.malID,
        title: animeData.title,
        image: animeData.image,
        episode: null
      },
      // NEW: Watchlist-specific data
      watchlistAction: watchlistAction, // "completed", "started watching", etc.
      animeRating: animeData.rating || 0, // 1-5 stars
      animeStatus: animeData.status, // "Completed", "Watching", etc.
      comments: [],
      likes: [],
      timestamp: serverTimestamp(),
      isAutoPost: true
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

    console.log(`Auto-post created for ${actionType}:`, animeData.title);
  } catch (error) {
    console.error("Error creating auto-post:", error);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const userDocRef = doc(db, "users", username);
      const userDocSnapshot = await getDoc(userDocRef);

      const finalRating = getEffectiveRating();

      // Add to watchlist
      const newWatchlistItem = {
        malID,
        title,
        status,
        thoughts,
        image,
        episodes,
        airingEpisode,
        airingStatus,
        rating: finalRating,
        dateAdded: new Date().toISOString(),
        isNewAddition: true // Flag for new additions
      };

      if (userDocSnapshot.exists()) {
        const existingWatchlist = userDocSnapshot.data().watchlist || [];

        // Check if anime already exists
        const isAnimeAlreadyInWatchlist = existingWatchlist.some(
          (item) => item.malID === malID
        );

        if (isAnimeAlreadyInWatchlist) {
          Swal.fire("This anime is already in your watchlist!");
          return;
        }

        const updatedWatchlist = [...existingWatchlist, newWatchlistItem];
        await updateDoc(userDocRef, { watchlist: updatedWatchlist });

        // 🚀 AUTO-POST FOR NEW ADDITIONS (only if user wants to post)
        if (shouldCreatePost) {
          await createWatchlistPost(newWatchlistItem, userDocSnapshot.data(), 'added');
        }

        updateLastActive(username);
      } else {
        // Handle new user case
        await setDoc(userDocRef, {
          watchlist: [newWatchlistItem],
        });

        // 🚀 AUTO-POST FOR NEW USER
        if (shouldCreatePost) {
          const userData = (await getDoc(userDocRef)).data();
          await createWatchlistPost(newWatchlistItem, userData, 'added');
        }
      }

      handleAddWatchlistItem();
    } catch (error) {
      console.error("Error updating/adding document: ", error);
    } finally {
      setIsSubmitting(false);
      closeForm();
    }
  };

  const renderStars = () => {
    const effectiveRating = getEffectiveRating();
    const isAutoDetected =
      manualStarRating === 0 && parseReviewRating(thoughts) > 0;

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isActive = i <= (hoveredRating || effectiveRating);
      stars.push(
        <Star
          key={i}
          size={24}
          className={`cursor-pointer transition-colors ${
            isActive
              ? isAutoDetected
                ? "fill-yellow-300 text-yellow-400 opacity-80"
                : "fill-yellow-400 text-yellow-400"
              : "text-gray-300 hover:text-yellow-200"
          }`}
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
        />
      );
    }
    return stars;
  };

  const effectiveRating = getEffectiveRating();
  const isAutoDetected =
    manualStarRating === 0 && parseReviewRating(thoughts) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-4/5 md:w-3/5 max-w-md bg-white p-6 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add To Watchlist</h2>
          <button
            type="button"
            onClick={closeForm}
            className="bg-primary text-white px-2 py-2 rounded flex items-center justify-center font-semibold hover:bg-opacity-70 duration-300 w-fit"
          >
            <IoMdClose size={18} />
          </button>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-600"
          >
            Title:
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={
              title ||
              (selectedItem?.media?.title?.romaji ||
                selectedItem?.media?.title?.english) +
                (selectedItem?.episode ? ` (ep.${selectedItem.episode})` : "")
            }
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            readOnly
          />
        </div>

        {/* Status */}
        <div className="mb-4">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-600"
          >
            Status:
          </label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select Status</option>
            <option value="Watching">Watching</option>
            <option value="Completed">Completed</option>
            <option value="To Watch">To Watch</option>
            <option value="Rewatching">Rewatching</option>
            <option value="Dropped">Dropped</option>
          </select>
        </div>

        {/* Rating */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">
            Rating:
          </label>
          <div className="flex items-center gap-1 mb-2">
            {renderStars()}
            <span className="ml-2 text-sm text-gray-600">
              {effectiveRating > 0 ? `${effectiveRating}/5` : "No rating"}
              {isAutoDetected && (
                <span className="text-xs text-blue-600 ml-1">
                  (auto-detected)
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            {effectiveRating > 0 && (
              <button
                type="button"
                onClick={clearManualRating}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                Clear rating
              </button>
            )}

            {isAutoDetected && (
              <span className="text-blue-600">Detected from review text</span>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Click stars for quick rating, or write &quot;(8.5/10)&quot;
            in your review for auto-detection
          </p>
        </div>

        {/* Review/Thoughts */}
        <div className="mb-4">
          <label
            htmlFor="thoughts"
            className="block text-sm font-medium text-gray-600"
          >
            Review:
          </label>
          <div className="relative">
            <textarea
              id="thoughts"
              name="thoughts"
              value={thoughts}
              onChange={handleInputChange}
              placeholder="Share your thoughts... Try writing (8.5/10) for auto-rating!"
              className="mt-1 p-2 w-full border rounded-md resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="text-right text-gray-500 text-sm mt-1">
              {thoughts.length}/250
            </div>
          </div>
        </div>

        {/* POST TOGGLE */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span>📢</span>
                Share with community
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Create a post when you add this anime
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShouldCreatePost(!shouldCreatePost)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                shouldCreatePost ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  shouldCreatePost ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {shouldCreatePost && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
              ✨ This will create a post: &quot;Started watching {title || 'this anime'}! 📺&quot;
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:bg-gray-400"
        >
          {isSubmitting ? "Adding..." : "Add to Watchlist"}
        </button>
      </form>
    </div>
  );
}

export default AddNewWatchlistItemEvent;