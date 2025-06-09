// Data Migration Script - Run once to update existing watchlist
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const migrateUserWatchlist = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnapshot = await getDoc(userDocRef);
    
    if (!userDocSnapshot.exists()) {
      console.log("User not found");
      return;
    }

    const userData = userDocSnapshot.data();
    const watchlist = userData.watchlist || [];
    
    if (watchlist.length === 0) {
      console.log("No watchlist to migrate");
      return;
    }

    // Define 2025 anime (from SAKAMOTO DAYS onwards)
    const anime2025 = [
      "SAKAMOTO DAYS",
      "Toilet-bound Hanako-kun Season 2", 
      "Solo Leveling Season 2 -Arise from the Shadow-",
      "The Apothecary Diaries Season 2",
      "Honey Lemon Soda",
      "Unnamed Memory Act.2",
      "Mahouka Koukou no Rettousei: Raihousha-hen",
      "Kaze ga Tsuyoku Fuiteiru",
      "Sentai Daishikkaku 2nd Season",
      "The Beginning After the End",
      "Can a Boy-Girl Friendship Survive?"
    ];

    // Parse rating from review text
    const parseReviewRating = (reviewText) => {
      if (!reviewText) return 0;
      
      const patterns = [
        /\((\d+(?:\.\d+)?)\/10\)/,        // (8.5/10)
        /\((\d+(?:\.\d+)?)\s*\/\s*10\)/,  // (8.5 / 10)
        /(\d+(?:\.\d+)?)\/10/,            // 8.5/10
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
      
      // Handle negative ratings
      if (reviewText.includes('-') && reviewText.includes('/10')) {
        return 0;
      }
      
      return 0;
    };

    // Generate timestamps
    const generateTimestamps = (watchlist) => {
      const now = new Date();
      const startOf2025 = new Date('2025-01-01');
      const endOf2024 = new Date('2024-12-31');
      
      return watchlist.map((anime, index) => {
        const is2025Anime = anime2025.some(title => 
          anime.title.includes(title) || title.includes(anime.title)
        );
        
        let dateAdded;
        
        if (is2025Anime) {
          // 2025 anime: spread from Jan 1 to now
          const daysSinceStart = Math.floor((now - startOf2025) / (1000 * 60 * 60 * 24));
          const daysSpacing = Math.floor(daysSinceStart / anime2025.length);
          const animeIndex = anime2025.findIndex(title => 
            anime.title.includes(title) || title.includes(anime.title)
          );
          
          const daysFromStart = animeIndex * daysSpacing + Math.random() * (daysSpacing * 0.5);
          dateAdded = new Date(startOf2025.getTime() + (daysFromStart * 24 * 60 * 60 * 1000));
        } else {
          // 2024 anime: spread throughout 2024, most recent at bottom
          const total2024Anime = watchlist.length - anime2025.length;
          const daysIn2024 = 365;
          const indexIn2024 = watchlist.length - index - anime2025.length;
          
          if (indexIn2024 >= 0) {
            const daySpacing = daysIn2024 / (total2024Anime || 1);
            const daysFromEnd = indexIn2024 * daySpacing + Math.random() * (daySpacing * 0.5);
            dateAdded = new Date(endOf2024.getTime() - (daysFromEnd * 24 * 60 * 60 * 1000));
          } else {
            // Fallback for 2025 anime not in list
            dateAdded = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
          }
        }
        
        return {
          ...anime,
          dateAdded: dateAdded.toISOString(),
          rating: anime.rating || parseReviewRating(anime.thoughts || "")
        };
      });
    };

    // Migrate the data
    const migratedWatchlist = generateTimestamps(watchlist);
    
    console.log("Migration preview:");
    migratedWatchlist.slice(-5).forEach(anime => {
      console.log(`${anime.title}: ${anime.rating}★ (${new Date(anime.dateAdded).toLocaleDateString()})`);
    });

    // Update the database
    await updateDoc(userDocRef, { 
      watchlist: migratedWatchlist 
    });
    
    console.log(`✅ Successfully migrated ${migratedWatchlist.length} anime`);
    console.log(`📅 Date range: ${new Date(migratedWatchlist[0].dateAdded).toLocaleDateString()} - ${new Date(migratedWatchlist[migratedWatchlist.length - 1].dateAdded).toLocaleDateString()}`);
    
  } catch (error) {
    console.error("Migration failed:", error);
  }
};

// Usage: Call this function once with your user ID
// migrateUserWatchlist("your-user-id-here");

export { migrateUserWatchlist };