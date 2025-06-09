import React, { useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function MigrationHelper() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [preview, setPreview] = useState([]);

  // Auto-detect current user
  const getCurrentUserId = () => {
    const userDataJSON = sessionStorage.getItem("userData");
    const userData = JSON.parse(userDataJSON);
    return userData?.user?.uid;
  };

  // Parse rating from review text
  const parseReviewRating = (reviewText) => {
    if (!reviewText) return 0;
    
    const patterns = [
      /\((\d+(?:\.\d+)?)\/10\)/,        // (8.5/10)
      /\((\d+(?:\.\d+)?)\s*\/\s*10\)/,  // (8.5 / 10)
      /(\d+(?:\.\d+)?)\/10/,            // 8.5/10 without parentheses
    ];
    
    for (const pattern of patterns) {
      const match = reviewText.match(pattern);
      if (match) {
        const rating = parseFloat(match[1]);
        if (rating <= 0) return 0;
        if (rating > 10) return 5; // Cap crazy high ratings at 5 stars
        return Math.round(rating / 2); // Convert to 5-star
      }
    }
    
    // Handle negative ratings like -10/10
    if (reviewText.includes('-') && reviewText.includes('/10')) {
      return 0;
    }
    
    return 0;
  };

  // Preview migration without saving
  const previewMigration = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      alert("Please log in first!");
      return;
    }

    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnapshot = await getDoc(userDocRef);
      
      if (!userDocSnapshot.exists()) {
        alert("User data not found!");
        return;
      }

      const userData = userDocSnapshot.data();
      const watchlist = userData.watchlist || [];
      
      if (watchlist.length === 0) {
        alert("No watchlist found to migrate!");
        return;
      }

      // Define 2025 anime (from your list)
      const anime2025Titles = [
        "SAKAMOTO DAYS",
        "Toilet-bound Hanako-kun Season 2", 
        "Solo Leveling Season 2",
        "The Apothecary Diaries Season 2",
        "Honey Lemon Soda",
        "Unnamed Memory Act.2",
        "Mahouka Koukou no Rettousei",
        "Kaze ga Tsuyoku Fuiteiru",
        "Sentai Daishikkaku 2nd Season",
        "The Beginning After the End",
        "Can a Boy-Girl Friendship Survive"
      ];

      // Generate preview
      const previewData = watchlist.map((anime, index) => {
        // Check if this is a 2025 anime
        const is2025Anime = anime2025Titles.some(title => 
          anime.title.toLowerCase().includes(title.toLowerCase()) || 
          title.toLowerCase().includes(anime.title.toLowerCase())
        );
        
        // Parse existing rating
        const detectedRating = parseReviewRating(anime.thoughts || "");
        const currentRating = anime.rating || detectedRating;
        
        return {
          title: anime.title,
          currentRating: anime.rating || 0,
          detectedRating: detectedRating,
          finalRating: currentRating,
          year: is2025Anime ? "2025" : "2024",
          hasDateAdded: !!anime.dateAdded,
          reviewText: anime.thoughts || ""
        };
      });

      setPreview(previewData);
    } catch (error) {
      console.error("Preview failed:", error);
      alert("Preview failed: " + error.message);
    }
  };

  // Run the actual migration
  const runMigration = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      alert("Please log in first!");
      return;
    }

    if (!confirm("This will update your watchlist with dates and ratings. Continue?")) {
      return;
    }

    setIsRunning(true);
    
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnapshot = await getDoc(userDocRef);
      
      const userData = userDocSnapshot.data();
      const watchlist = userData.watchlist || [];

      // Define 2025 anime
      const anime2025Titles = [
        "SAKAMOTO DAYS",
        "Toilet-bound Hanako-kun Season 2", 
        "Solo Leveling Season 2",
        "The Apothecary Diaries Season 2",
        "Honey Lemon Soda",
        "Unnamed Memory Act.2",
        "Mahouka Koukou no Rettousei",
        "Kaze ga Tsuyoku Fuiteiru",
        "Sentai Daishikkaku 2nd Season",
        "The Beginning After the End",
        "Can a Boy-Girl Friendship Survive"
      ];

      // Generate timestamps and update ratings
      const now = new Date();
      const startOf2025 = new Date('2025-01-01');
      const startOf2024 = new Date('2024-01-01');
      
      const migratedWatchlist = watchlist.map((anime, index) => {
        // Skip if already has proper dateAdded
        if (anime.dateAdded && anime.dateAdded !== "") {
          const detectedRating = parseReviewRating(anime.thoughts || "");
          return {
            ...anime,
            rating: anime.rating || detectedRating
          };
        }

        // Check if 2025 anime
        const is2025Anime = anime2025Titles.some(title => 
          anime.title.toLowerCase().includes(title.toLowerCase()) || 
          title.toLowerCase().includes(anime.title.toLowerCase())
        );
        
        let dateAdded;
        
        if (is2025Anime) {
          // 2025 anime: January to now, spread evenly
          const daysInto2025 = Math.floor((now - startOf2025) / (1000 * 60 * 60 * 24));
          const anime2025Count = anime2025Titles.length;
          const animeIndex = anime2025Titles.findIndex(title => 
            anime.title.toLowerCase().includes(title.toLowerCase()) || 
            title.toLowerCase().includes(anime.title.toLowerCase())
          );
          
          // Spread across the year so far
          const daySpacing = daysInto2025 / anime2025Count;
          const randomOffset = Math.random() * (daySpacing * 0.3); // Add some randomness
          const daysFromStart = (animeIndex * daySpacing) + randomOffset;
          
          dateAdded = new Date(startOf2025.getTime() + (daysFromStart * 24 * 60 * 60 * 1000));
        } else {
          // 2024 anime: spread throughout 2024, recent ones toward end
          const totalItems = watchlist.length;
          const anime2025Count = watchlist.filter(a => 
            anime2025Titles.some(title => 
              a.title.toLowerCase().includes(title.toLowerCase()) || 
              title.toLowerCase().includes(a.title.toLowerCase())
            )
          ).length;
          
          const anime2024Count = totalItems - anime2025Count;
          const itemIndex2024 = totalItems - index - anime2025Count; // Reverse index for 2024
          
          if (itemIndex2024 >= 0) {
            // Spread throughout 2024 (365 days)
            const daySpacing = 365 / (anime2024Count || 1);
            const randomOffset = Math.random() * (daySpacing * 0.3);
            const daysFromStart = (itemIndex2024 * daySpacing) + randomOffset;
            
            dateAdded = new Date(startOf2024.getTime() + (daysFromStart * 24 * 60 * 60 * 1000));
          } else {
            // Fallback - recent 2025 date
            dateAdded = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
          }
        }
        
        // Parse and update rating
        const detectedRating = parseReviewRating(anime.thoughts || "");
        
        return {
          ...anime,
          dateAdded: dateAdded.toISOString(),
          rating: anime.rating || detectedRating
        };
      });

      // Sort by dateAdded to maintain chronological order
      migratedWatchlist.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));

      // Update database
      await updateDoc(userDocRef, { 
        watchlist: migratedWatchlist 
      });
      
      // Show results
      const stats = {
        total: migratedWatchlist.length,
        withRatings: migratedWatchlist.filter(a => a.rating > 0).length,
        anime2025: migratedWatchlist.filter(a => new Date(a.dateAdded).getFullYear() === 2025).length,
        anime2024: migratedWatchlist.filter(a => new Date(a.dateAdded).getFullYear() === 2024).length
      };
      
      setResults(stats);
      
    } catch (error) {
      console.error("Migration failed:", error);
      alert("Migration failed: " + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        🛠️ Watchlist Migration Tool
      </h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">What this does:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ Adds dates to all your anime (2024 & 2025)</li>
          <li>✅ Converts your (8.5/10) ratings to stars</li>
          <li>✅ Preserves all your review text</li>
          <li>✅ Maintains chronological order</li>
        </ul>
      </div>

      <div className="space-y-4">
        <button
          onClick={previewMigration}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          👀 Preview Migration
        </button>
        
        <button
          onClick={runMigration}
          disabled={isRunning}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors ml-4"
        >
          {isRunning ? "🔄 Running..." : "🚀 Run Migration"}
        </button>
      </div>

      {/* Preview Results */}
      {preview.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-3">📋 Migration Preview:</h3>
          <div className="space-y-2 text-sm">
            {preview.slice(-10).map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                <div>
                  <span className="font-medium">{item.title}</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    item.year === '2025' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.year}
                  </span>
                </div>
                <div className="text-right">
                  {item.detectedRating > 0 && (
                    <span className="text-yellow-600">
                      {item.detectedRating}★ (detected)
                    </span>
                  )}
                  {item.currentRating > 0 && item.detectedRating === 0 && (
                    <span className="text-blue-600">
                      {item.currentRating}★ (existing)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Migration Results */}
      {results && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">✅ Migration Complete!</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>📚 Total anime: {results.total}</div>
            <div>⭐ With ratings: {results.withRatings}</div>
            <div>🗓️ 2024 anime: {results.anime2024}</div>
            <div>🆕 2025 anime: {results.anime2025}</div>
          </div>
          <p className="text-green-700 mt-2 text-sm">
            Refresh your profile page to see the changes!
          </p>
        </div>
      )}
    </div>
  );
}

export default MigrationHelper;