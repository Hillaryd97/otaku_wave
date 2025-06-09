import React, { useState } from "react";
import WatchListItem from "./watchListItem";
import { IoMdClose } from "react-icons/io";
import { Star } from "lucide-react";
import AnimeSearchDropdown from "./animeSearchDropdown";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Swal from "sweetalert2";

function AddWatchListItemForm({ onSubmit, handleAddWatchlistItem }) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [selectedAnimeData, setSelectedAnimeData] = useState([]);
  const [thoughts, setThoughts] = useState("");
  const [image, setimage] = useState("");
  const [airingStatus, setairingStatus] = useState("");
  const [episodes, setEpisodes] = useState("");
  const [malID, setMalID] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [manualStarRating, setManualStarRating] = useState(0);
  const [shouldCreatePost, setShouldCreatePost] = useState(true); // TRUE by default

  const userDataJSON = sessionStorage.getItem("userData");
  const userSessionData = JSON.parse(userDataJSON);
  const username = userSessionData.user.uid;
  const Swal = require("sweetalert2");

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
    } else if (name === "title") {
      setTitle(value);
    }
  };

  const handleRatingClick = (rating) => {
    setManualStarRating(rating);
  };

  const clearManualRating = () => {
    setManualStarRating(0);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const userDocRef = doc(db, "users", username);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const existingWatchlist = userDocSnapshot.data().watchlist || [];

        // Check if anime already exists (for profile modal)
        const isAnimeAlreadyInWatchlist = existingWatchlist.some(
          (item) => item.malID === malID
        );

        if (isAnimeAlreadyInWatchlist) {
          Swal.fire("This anime is already in your watchlist!");
          return;
        }

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
          isNewAddition: true, // Flag for new additions
        };

        const updatedWatchlist = [...existingWatchlist, newWatchlistItem];
        await updateDoc(userDocRef, { watchlist: updatedWatchlist });

        // 🚀 AUTO-POST FOR NEW ADDITIONS (only if user wants to post)
        if (shouldCreatePost) {
          // This comes from the toggle
          await createWatchlistPost(
            newWatchlistItem,
            userDocSnapshot.data(),
            "added"
          );
        }

        updateLastActive(username);
      }

      handleAddWatchlistItem();
    } catch (error) {
      console.error("Error updating/adding document: ", error);
    } finally {
      setIsSubmitting(false);
      closeForm();
    }
  };

  // Updated handleSubmit for EDIT watchlist modal (EditWatchListItemForm.jsx)

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const userDocRef = doc(db, "users", username);
      const userDocSnapshot = await getDoc(userDocRef);

      const watchlist = userDocSnapshot.data().watchlist || [];
      if (watchlist && Array.isArray(watchlist)) {
        const oldItem = watchlist.find(
          (item) => item.malID === selectedItem.malID
        );
        const finalRating = getEffectiveRating();

        const updatedItem = {
          ...editedData,
          rating: finalRating,
          dateAdded: editedData.dateAdded || new Date().toISOString(),
        };

        const updatedWatchlist = watchlist.map((item) =>
          item.malID === selectedItem.malID ? updatedItem : item
        );

        await updateDoc(userDocRef, { watchlist: updatedWatchlist });

        // 🎉 AUTO-POST FOR STATUS CHANGES (Watching → Completed)
        if (shouldCreateCompletionPost(oldItem, updatedItem)) {
          const userData = userDocSnapshot.data();
          await createWatchlistPost(updatedItem, userData, "completed");
        }

        closeForm();
      }
    } catch (error) {
      console.error("Error updating watchlist item:", error);
    }
  };

  // 🧠 Smart logic to determine if we should post about completion
  const shouldCreateCompletionPost = (oldItem, newItem) => {
    // Only post if status changed TO "Completed" from something else
    return (
      oldItem.status !== "Completed" &&
      newItem.status === "Completed" &&
      oldItem.status !== "Rewatching" // Don't post for rewatching completions
    );
  };

  // 🎯 Enhanced post creation function
  const createWatchlistPost = async (animeData, userData, actionType) => {
    try {
      const postId = Math.random().toString(36).substring(2);

      let postText = "";
      const ratingText =
        animeData.rating > 0
          ? ` • Rating: ${"⭐".repeat(animeData.rating)}`
          : "";

      if (actionType === "completed") {
        // Special post for completions
        postText = `Just completed **${animeData.title}**! 🎉✨\n`;
        if (animeData.rating > 0) {
          postText += `Gave it ${animeData.rating}/5 stars${ratingText}`;
        }
      } else {
        // Posts for new additions
        switch (animeData.status) {
          case "Watching":
            postText = `Started watching **${animeData.title}**! 📺✨\nStatus: ${animeData.status}${ratingText}`;
            break;
          case "Completed":
            postText = `Just finished **${animeData.title}**! 🎉\nStatus: ${animeData.status}${ratingText}`;
            break;
          case "To Watch":
            postText = `Added **${animeData.title}** to my plan to watch list! 📋\nStatus: ${animeData.status}`;
            break;
          case "Rewatching":
            postText = `Rewatching **${animeData.title}** because it's that good! 🔄\nStatus: ${animeData.status}${ratingText}`;
            break;
          default:
            postText = `Added **${animeData.title}** to my watchlist! ✨\nStatus: ${animeData.status}${ratingText}`;
        }
      }

      // Add user's review if they wrote one
      if (animeData.thoughts && animeData.thoughts.trim()) {
        postText += `\n\n"${animeData.thoughts.trim()}"`;
      }

      const postData = {
        authId: userData.authId || userData.username, // Handle both cases
        username: userData.username,
        profilePic: userData.profilePic,
        bio: userData.bio,
        newPost: postText,
        postPic: "",
        selectedAnime: {
          malID: animeData.malID,
          title: animeData.title,
          image: animeData.image,
          episode: null,
        },
        comments: [],
        likes: [],
        timestamp: serverTimestamp(),
        isAutoPost: true, // Flag to identify auto-generated posts
      };

      const postDocRef = doc(db, "posts", userData.authId || userData.username);
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
      // Don't fail the watchlist operation if post creation fails
    }
  };

  const handleAnimeSelection = (anime) => {
    setTitle(`${anime.title}`);
    setairingStatus(anime.status);
    setimage(anime.images?.jpg?.large_image_url);
    setEpisodes(anime.episodes);
    setMalID(anime.mal_id);
    console.log(selectedAnimeData);
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
          <h2 className="text-lg font-semibold">Add New Anime</h2>
          <button
            type="button"
            onClick={handleAddWatchlistItem}
            className="bg-primary text-white px-2 py-2 rounded flex items-center justify-center font-semibold hover:bg-opacity-70 duration-300 w-fit"
          >
            <IoMdClose size={18} />
          </button>
        </div>

        {/* Title with Search */}
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
            value={title}
            onChange={handleInputChange}
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Search for anime..."
          />
          {title.length > 1 ? (
            <div className="">
              <AnimeSearchDropdown
                searchTerm={title}
                onSelect={(anime) => handleAnimeSelection(anime)}
              />
            </div>
          ) : (
            ""
          )}
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
                shouldCreatePost ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  shouldCreatePost ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {shouldCreatePost && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
              ✨ This will create a post saying you started watching 
              {title || "this anime"}! 📺
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

export default AddWatchListItemForm;
