import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { IoMdClose } from "react-icons/io";
import { Star } from "lucide-react";

function EditWatchListItemForm({ selectedItem, closeForm }) {
  const userDataJSON = sessionStorage.getItem("userData");
  const userSessionData = JSON.parse(userDataJSON);
  const username = userSessionData.user.uid;
  
  const [editedData, setEditedData] = useState({
    title: selectedItem.title,
    status: selectedItem.status,
    thoughts: selectedItem.thoughts || "",
    episodes: selectedItem.episodes,
    airingStatus: selectedItem.airingStatus,
    image: selectedItem.image,
    malID: selectedItem.malID,
    rating: selectedItem.rating || 0,
    dateAdded: selectedItem.dateAdded || new Date().toISOString(),
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const [manualStarRating, setManualStarRating] = useState(selectedItem.rating || 0);
  const [shouldCreatePost, setShouldCreatePost] = useState(false); // FALSE by default for edits
  const [originalStatus, setOriginalStatus] = useState(selectedItem.status);

  // Auto-detect rating from review text
  const parseReviewRating = (reviewText) => {
    if (!reviewText) return 0;
    
    const patterns = [
      /\((\d+(?:\.\d+)?)\/10\)/,      // (8.5/10)
      /\((\d+(?:\.\d+)?)\s*\/\s*10\)/, // (8.5 / 10)
      /(\d+(?:\.\d+)?)\/10/,          // 8.5/10
      /\((\d+(?:\.\d+)?)\)/,          // (8.5) - assuming out of 10
    ];
    
    for (const pattern of patterns) {
      const match = reviewText.match(pattern);
      if (match) {
        const rating = parseFloat(match[1]);
        if (rating <= 0) return 0;
        if (rating > 10) return 5; // Cap at 5 stars for crazy high ratings
        return Math.round(rating / 2); // Convert 10-point to 5-star
      }
    }
    
    // Check for negative ratings like -10/10
    const negativeMatch = reviewText.match(/-(\d+)\/10/);
    if (negativeMatch) return 0;
    
    return 0;
  };

  // Get effective rating (manual priority, then auto-detect)
  const getEffectiveRating = () => {
    if (manualStarRating > 0) return manualStarRating;
    return parseReviewRating(editedData.thoughts);
  };

  // Update effective rating when thoughts change
  useEffect(() => {
    const autoDetectedRating = parseReviewRating(editedData.thoughts);
    // Only update if no manual rating is set
    if (manualStarRating === 0) {
      setEditedData(prev => ({
        ...prev,
        rating: autoDetectedRating
      }));
    }
  }, [editedData.thoughts, manualStarRating]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const truncatedValue = value.slice(0, 250);

    setEditedData((prevData) => ({
      ...prevData,
      [name]: truncatedValue,
    }));
  };

  const handleRatingClick = (rating) => {
    setManualStarRating(rating);
    setEditedData((prevData) => ({
      ...prevData,
      rating: rating,
    }));
  };

  const clearManualRating = () => {
    setManualStarRating(0);
    const autoRating = parseReviewRating(editedData.thoughts);
    setEditedData((prevData) => ({
      ...prevData,
      rating: autoRating,
    }));
  };

  // 🧠 Smart logic to determine if we should post about status changes
  const shouldCreateStatusChangePost = (oldStatus, newStatus) => {
    // Post for meaningful status changes only
    const meaningfulChanges = [
      { from: "Watching", to: "Completed" },
      { from: "Watching", to: "Dropped" },
      { from: "To Watch", to: "Completed" },
      { from: "To Watch", to: "Dropped" },
      { from: "Rewatching", to: "Completed" },
    ];

    return meaningfulChanges.some(
      change => change.from === oldStatus && change.to === newStatus
    );
  };

  // Check if status change is meaningful for preview
  const getStatusChangePreview = () => {
    if (originalStatus === editedData.status) return null;
    
    if (shouldCreateStatusChangePost(originalStatus, editedData.status)) {
      switch (editedData.status) {
        case "Completed":
          return `"Just completed ${editedData.title}! 🎉✨"`;
        case "Dropped":
          return `"Dropped ${editedData.title} 📱"`;
        default:
          return null;
      }
    }
    return null;
  };

  // 🎯 Enhanced post creation function
  const createStatusChangePost = async (animeData, userData, oldStatus, newStatus) => {
  try {
    const postId = Math.random().toString(36).substring(2);
    
    // NEW: Clean post text - ONLY user's review
    let postText = "";
    if (animeData.thoughts && animeData.thoughts.trim()) {
      postText = animeData.thoughts.trim();
    }

    // NEW: Determine action for username display
    let watchlistAction = "";
    switch (newStatus) {
      case "Completed":
        watchlistAction = "completed";
        break;
      case "Dropped":
        watchlistAction = "dropped";
        break;
      default:
        return; // Don't post for other status changes
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
      watchlistAction: watchlistAction, // "completed", "dropped"
      animeRating: animeData.rating || 0,
      animeStatus: animeData.status,
      comments: [],
      likes: [],
      timestamp: serverTimestamp(),
      isAutoPost: true,
      statusChange: true
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

    console.log(`Status change post created: ${oldStatus} → ${newStatus}`);
  } catch (error) {
    console.error("Error creating status change post:", error);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userDocRef = doc(db, "users", username);
      const userDocSnapshot = await getDoc(userDocRef);

      const watchlist = userDocSnapshot.data().watchlist || [];
      if (watchlist && Array.isArray(watchlist)) {
        const finalRating = getEffectiveRating();
        
        const updatedItem = {
          ...editedData,
          rating: finalRating,
          dateAdded: editedData.dateAdded || new Date().toISOString()
        };

        const updatedWatchlist = watchlist.map((item) =>
          item.malID === selectedItem.malID ? updatedItem : item
        );

        await updateDoc(userDocRef, { watchlist: updatedWatchlist });

        // 🎉 AUTO-POST FOR STATUS CHANGES (if enabled and meaningful)
        if (shouldCreatePost && shouldCreateStatusChangePost(originalStatus, editedData.status)) {
          const userData = userDocSnapshot.data();
          await createStatusChangePost(updatedItem, userData, originalStatus, editedData.status);
        }

        closeForm();
      } else {
        console.error("Error: Watchlist not found or has unexpected structure");
      }
    } catch (error) {
      console.error("Error updating watchlist item:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const userDocRef = doc(db, "users", username);
      const malID = selectedItem.malID;

      const userDocSnapshot = await getDoc(userDocRef);
      const watchlist = userDocSnapshot.data().watchlist || [];

      const updatedWatchlist = watchlist.filter(
        (watchlistItem) => watchlistItem.malID !== malID
      );

      await updateDoc(userDocRef, { watchlist: updatedWatchlist });
      closeForm();
    } catch (error) {
      console.error("Error deleting watchlist item:", error);
    }
  };

  const renderStars = () => {
    const effectiveRating = getEffectiveRating();
    const isAutoDetected = manualStarRating === 0 && parseReviewRating(editedData.thoughts) > 0;
    
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
                ? "fill-yellow-300 text-yellow-400 opacity-80" // Auto-detected: slightly different style
                : "fill-yellow-400 text-yellow-400"             // Manual: solid
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
  const isAutoDetected = manualStarRating === 0 && parseReviewRating(editedData.thoughts) > 0;
  const detectedRatingText = parseReviewRating(editedData.thoughts);
  const statusChangePreview = getStatusChangePreview();

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-400 bg-opacity-50 flex items-center justify-center z-50">
      <form className="w-4/5 md:w-3/5 max-w-md bg-gray-100 p-6 rounded-md shadow-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{editedData.title}</h2>
          <button
            type="button"
            onClick={closeForm}
            className="bg-primary text-white px-2 py-2 rounded flex items-center justify-center font-semibold hover:bg-opacity-70 duration-300 w-fit"
          >
            <IoMdClose size={18} />
          </button>
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Status:</label>
          <select
            id="status"
            name="status"
            value={editedData.status}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
          <label className="block mb-2 font-medium text-gray-700">Rating:</label>
          <div className="flex items-center gap-1 mb-2">
            {renderStars()}
            <span className="ml-2 text-sm text-gray-600">
              {effectiveRating > 0 ? `${effectiveRating}/5` : "No rating"}
              {isAutoDetected && (
                <span className="text-xs text-blue-600 ml-1">(auto-detected)</span>
              )}
            </span>
          </div>
          
          {/* Rating controls */}
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
            
            {isAutoDetected && detectedRatingText > 0 && (
              <span className="text-blue-600">
                Detected from review text
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Click stars for quick rating, or write &quot;(8.5/10)&quot; in your review for auto-detection
          </p>
        </div>

        {/* Review/Thoughts */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Review:</label>
          <div className="relative">
            <textarea
              name="thoughts"
              value={editedData.thoughts}
              onChange={handleInputChange}
              placeholder="Share your thoughts... Try writing (8.5/10) for auto-rating!"
              className="w-full border p-3 rounded-md resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="text-right text-gray-500 text-sm mt-1">
              {editedData.thoughts.length}/250
            </div>
          </div>
        </div>

        {/* 🆕 POST TOGGLE - Only show for meaningful status changes */}
        {statusChangePreview && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span>📢</span>
                  Share status update
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Create a post about this status change
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
                ✨ This will create a post: {statusChangePreview}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditWatchListItemForm;