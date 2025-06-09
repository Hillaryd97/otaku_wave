import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  getDoc,
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

  // Auto-detect rating from review text
  const parseReviewRating = (reviewText) => {
    if (!reviewText) return 0;
    
    // Patterns to match various rating formats
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
        // Handle special cases like negative ratings or very high ratings
        if (rating <= 0) return 0;
        if (rating > 10) return 5; // Cap at 5 stars for crazy high ratings like 198/10
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userDocRef = doc(db, "users", username);
      const userDocSnapshot = await getDoc(userDocRef);

      const watchlist = userDocSnapshot.data().watchlist || [];
      if (watchlist && Array.isArray(watchlist)) {
        const finalRating = getEffectiveRating();
        const updatedWatchlist = watchlist.map((item) =>
          item.malID === selectedItem.malID ? {
            ...editedData,
            rating: finalRating,
            // Ensure dateAdded exists
            dateAdded: editedData.dateAdded || new Date().toISOString()
          } : item
        );
        await updateDoc(userDocRef, { watchlist: updatedWatchlist });
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