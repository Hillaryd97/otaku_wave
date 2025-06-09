import React, { useState, useEffect } from "react";
import { IoMdShare, IoMdDownload } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import Image from "next/image";

function UserStats({ userData }) {
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [statsData, setStatsData] = useState(null);

  // Get current date info
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();

  // Check if user has 2024 data
  const hasDataForYear = (year) => {
    if (!userData?.watchlist) return false;
    
    return userData.watchlist.some(anime => {
      if (!anime.dateAdded) return false;
      const addedYear = new Date(anime.dateAdded).getFullYear();
      return addedYear === year;
    });
  };

  // Generate timeline options
  const getTimelineOptions = () => {
    const options = [];
    
    // Current year months (from January to current month)
    for (let month = 0; month <= currentDate.getMonth(); month++) {
      const monthName = new Date(currentYear, month).toLocaleString("default", { month: "long" });
      const isCurrent = month === currentDate.getMonth();
      options.push({
        key: `${currentYear}-${month}`,
        label: `${monthName} ${currentYear}`,
        type: "month",
        isCurrent,
        year: currentYear,
        month: month
      });
    }

    // Yearly wrappeds (only for years that have data)
    for (let year = currentYear - 1; year >= 2024; year--) {
      if (hasDataForYear(year)) {
        options.push({
          key: `${year}-wrapped`,
          label: `🎊 ${year} Wrapped`,
          type: "wrapped",
          year: year
        });
      }
    }

    return options.reverse(); // Show newest first
  };

  const timelineOptions = getTimelineOptions();
  
  // Set default to current month
  useEffect(() => {
    if (!selectedPeriod && timelineOptions.length > 0) {
      const currentOption = timelineOptions.find(opt => opt.isCurrent);
      setSelectedPeriod(currentOption ? currentOption.key : timelineOptions[0].key);
    }
  }, [timelineOptions, selectedPeriod]);

  const selectedOption = timelineOptions.find(opt => opt.key === selectedPeriod) || timelineOptions[0];

  // Filter watchlist by selected period
  const getFilteredWatchlist = () => {
    if (!userData?.watchlist || !selectedOption) return [];
    
    const watchlist = userData.watchlist;
    
    if (selectedOption.type === "wrapped") {
      // For wrapped, get all anime from that year
      return watchlist.filter(anime => {
        if (!anime.dateAdded) return false;
        const addedYear = new Date(anime.dateAdded).getFullYear();
        return addedYear === selectedOption.year;
      });
    } else {
      // For monthly, get anime from that specific month
      return watchlist.filter(anime => {
        if (!anime.dateAdded) return false;
        const addedDate = new Date(anime.dateAdded);
        return (
          addedDate.getFullYear() === selectedOption.year &&
          addedDate.getMonth() === selectedOption.month
        );
      });
    }
  };

  // Calculate stats based on selected period
  useEffect(() => {
    if (!userData?.watchlist || !selectedOption) {
      setStatsData({
        totalAnime: 0,
        completed: 0,
        watching: 0,
        planToWatch: 0,
        dropped: 0,
        rewatching: 0,
        averageRating: 0,
        mostActiveDay: "Saturday",
        longestBinge: 0,
        newDiscoveries: 0,
        completionRate: 0
      });
      return;
    }

    const calculateStats = () => {
      const filteredWatchlist = getFilteredWatchlist();
      
      // If it's current month, also include completed anime for better stats
      let statsWatchlist = filteredWatchlist;
      if (selectedOption.isCurrent) {
        // For current month, show overall stats but highlight recent activity
        statsWatchlist = userData.watchlist;
      }
      
      // Filter by status
      const completed = statsWatchlist.filter(anime => anime.status === "Completed");
      const watching = statsWatchlist.filter(anime => anime.status === "Watching");
      const planToWatch = statsWatchlist.filter(anime => anime.status === "To Watch");
      const dropped = statsWatchlist.filter(anime => anime.status === "Dropped");
      const rewatching = statsWatchlist.filter(anime => anime.status === "Rewatching");
      
      // Calculate average rating - check for both rating field and text format
      let avgRating = 0;
      const ratedAnime = completed.filter(anime => {
        return anime.rating || (anime.thoughts && anime.thoughts.includes("/10"));
      });
      
      if (ratedAnime.length > 0) {
        const total = ratedAnime.reduce((sum, anime) => {
          // Check if there's a direct rating field first
          if (anime.rating && anime.rating > 0) {
            return sum + anime.rating;
          }
          // Otherwise parse from thoughts text
          if (anime.thoughts) {
            const match = anime.thoughts.match(/(\d+\.?\d*)\s*\/\s*10/);
            return sum + (match ? parseFloat(match[1]) : 0);
          }
          return sum;
        }, 0);
        avgRating = (total / ratedAnime.length).toFixed(1);
      }

      // Calculate completion rate
      const completionRate = statsWatchlist.length > 0 
        ? Math.round((completed.length / statsWatchlist.length) * 100)
        : 0;

      // New discoveries = anime added in this period
      const newDiscoveries = filteredWatchlist.length;

      return {
        totalAnime: statsWatchlist.length,
        completed: completed.length,
        watching: watching.length,
        planToWatch: planToWatch.length,
        dropped: dropped.length,
        rewatching: rewatching.length,
        averageRating: avgRating,
        mostActiveDay: "Saturday", // Mock data - you could track this with timestamps
        longestBinge: Math.max(1, Math.floor(Math.random() * 8)), // Mock data
        newDiscoveries: newDiscoveries,
        completionRate: completionRate,
        periodLabel: selectedOption.type === "wrapped" ? `${selectedOption.year}` : selectedOption.label
      };
    };

    setStatsData(calculateStats());
  }, [userData, selectedPeriod, selectedOption]);

//   const handleShare = () => {
//     if (navigator.share) {
//       navigator.share({
//         title: `${userData?.username}'s Anime Stats - ${statsData?.periodLabel}`,
//         text: `Check out my anime stats! I've completed ${statsData?.completed || 0} anime.`,
//         url: window.location.href,
//       });
//     } else {
//       navigator.clipboard.writeText(`Check out my anime stats: ${window.location.href}`);
//       alert("Link copied to clipboard!");
//     }
//   };

  if (!statsData || !selectedOption) {
    return (
      <div className="bg-gray-400 bg-opacity-20 w-full px-2 flex items-center justify-center h-64">
        <p>Loading stats...</p>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${userData?.username}'s Anime Stats - ${currentMonth} ${currentYear}`,
        text: `Check out my anime stats for ${currentMonth}! I've completed ${statsData?.completed || 0} anime.`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`Check out my anime stats: ${window.location.href}`);
      alert("Link copied to clipboard!");
    }
  };

  if (!statsData) {
    return (
      <div className="bg-gray-400 bg-opacity-20 w-full px-2 flex items-center justify-center h-64">
        <p>Loading stats...</p>
      </div>
    );
  }

      return (
    <div className="bg-gray-400 bg-opacity-20 w-full px-3 pt-3 flex flex-col space-y-4">
      {/* Period Selector */}
      <div className="relative w-64 mx-auto">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full bg-secondary bg-opacity-70 px-3 py-2 flex items-center justify-between rounded shadow-sm hover:bg-opacity-100 duration-300"
        >
          <span className="font-medium text-sm">
            {selectedOption?.label || `${currentMonth} ${currentYear}`}
          </span>
          <FaChevronDown className={`transform transition-transform text-xs ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 bg-white border rounded shadow-md z-10 mt-1 max-h-48 overflow-y-auto">
            {timelineOptions.map((option, index) => (
              <button
                key={option.key}
                onClick={() => {
                  setSelectedPeriod(option.key);
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${
                  option.isCurrent ? 'bg-primary text-white hover:bg-primary' : ''
                } ${option.type === 'wrapped' && index > 0 ? 'border-t border-gray-100' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded shadow-md p-4 mx-1">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold text-lg">
              {selectedOption.type === "wrapped" ? `${selectedOption.year} Wrapped` : selectedOption.label}
            </h3>
            <p className="text-gray-600 text-sm">
              @{userData?.username || "user"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="bg-primary text-white p-2 rounded hover:bg-opacity-80 duration-300"
            >
              <IoMdShare size={16} />
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-secondary bg-opacity-40 rounded p-3 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{statsData.completed}</div>
            <div className="text-gray-700 text-sm">Completed</div>
          </div>
          
          <div className="bg-secondary bg-opacity-40 rounded p-3 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{statsData.watching}</div>
            <div className="text-gray-700 text-sm">Watching</div>
          </div>
          
          <div className="bg-secondary bg-opacity-40 rounded p-3 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{statsData.averageRating || "0"}</div>
            <div className="text-gray-700 text-sm">Avg Rating</div>
          </div>
          
          <div className="bg-secondary bg-opacity-40 rounded p-3 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{statsData.completionRate}%</div>
            <div className="text-gray-700 text-sm">Completed</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="space-y-2 text-sm border-t pt-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Total anime:</span>
            <span className="font-medium">{statsData.totalAnime}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Plan to watch:</span>
            <span className="font-medium">{statsData.planToWatch}</span>
          </div>

          {statsData.rewatching > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Rewatching:</span>
              <span className="font-medium">{statsData.rewatching}</span>
            </div>
          )}

          {statsData.dropped > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Dropped:</span>
              <span className="font-medium">{statsData.dropped}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">Added this period:</span>
            <span className="font-medium">{statsData.newDiscoveries} anime</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserStats;
