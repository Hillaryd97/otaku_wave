"use client";

import React, { useEffect, useState, useCallback } from "react";
import BottomNav from "../ui/bottomNav";
import { Search as SearchIcon, X, Clock, Users, ArrowLeft } from "lucide-react";
import {
  collection,
  getDocs,
  query as firebaseQuery,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  // Get current user data
  useEffect(() => {
    const userDataJSON =
      typeof window !== "undefined" ? sessionStorage.getItem("userData") : null;
    const userSessionData = userDataJSON ? JSON.parse(userDataJSON) : null;

    if (!userSessionData || !userSessionData.user) {
      router.push("/login");
      return;
    }

    setCurrentUser(userSessionData.user.uid);

    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, [router]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        // Use your original approach - get all users then filter client-side
        const usersCollectionRef = collection(db, "users");
        const querySnapshot = await getDocs(usersCollectionRef);

        const results = querySnapshot.docs
          .filter((doc) => {
            const userData = doc.data();
            // Check if username exists and includes the search term (case-insensitive)
            return (
              userData.username &&
              userData.username
                .toLowerCase()
                .includes(searchTerm.toLowerCase().trim()) &&
              doc.id !== currentUser // Don't show current user
            );
          })
          .map((doc) => {
            const userData = doc.data();
            return {
              uid: doc.id,
              ...userData,
            };
          })
          .slice(0, 15); // Limit to 15 results

        setSearchResults(results);
      } catch (error) {
        console.error("Error searching for users:", error);
        setSearchResults([]);
      }
      setLoading(false);
    }, 300),
    [currentUser]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const addToRecentSearches = (user) => {
    const searchItem = {
      uid: user.uid,
      username: user.username,
      profilePic: user.profilePic,
      bio: user.bio,
    };

    const newRecentSearches = [
      searchItem,
      ...recentSearches.filter((item) => item.uid !== user.uid),
    ].slice(0, 5); // Keep only 5 recent searches

    setRecentSearches(newRecentSearches);
    localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));
  };

  const removeFromRecentSearches = (uid, e) => {
    e.preventDefault();
    e.stopPropagation();
    const filtered = recentSearches.filter((item) => item.uid !== uid);
    setRecentSearches(filtered);
    localStorage.setItem("recentSearches", JSON.stringify(filtered));
  };

  const SearchResultCard = ({ user, isRecent = false }) => (
    <Link
      href={`/${user.uid}`}
      className="block"
      onClick={() => !isRecent && addToRecentSearches(user)}
    >
      <div className="bg-gradient-to-r from-white via-white to-red-50/30 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100/50 hover:border-red-300/30 group ">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Image
              src={user.profilePic || "/bg-image (4).jpg"}
              width={52}
              height={52}
              className="rounded-2xl ring-2 ring-white shadow-md group-hover:ring-red-300/30 transition-all"
              alt={user.username}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 truncate group-hover:text-red-600 transition-colors">
                  {user.username}
                </h3>
                <p className="text-sm text-gray-600 truncate mt-1">
                  {user.bio || "Anime enthusiast 🌸"}
                </p>
              </div>

              {isRecent && (
                <button
                  onClick={(e) => removeFromRecentSearches(user.uid, e)}
                  className="p-1 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-red-600/70 font-medium">
                {isRecent ? "Recent search" : "Tap to view profile"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  const SkeletonCard = () => (
    <div className="bg-gradient-to-r from-white via-white to-red-50/30 rounded-2xl p-4 shadow-lg border border-red-100/50 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-13 h-13 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Search Section */}
      <div className="bg-background ">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-6">
            {/* <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button> */}
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-center w-full">Search</h1>
              {/* <p className="text-gray-600 mt-1">Find your anime community</p> */}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by username..."
              className="w-full pl-12 pr-12 py-4 bg-white/95 backdrop-blur-sm border-0 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30 text-gray-900 placeholder-gray-500 shadow-xl"
              value={searchQuery}
              onChange={handleInputChange}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Searches
              </h2>
            </div>
            <div className="space-y-3">
              {recentSearches.map((user) => (
                <SearchResultCard key={user.uid} user={user} isRecent={true} />
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <SearchIcon className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Search Results{" "}
                {searchResults.length > 0 && `(${searchResults.length})`}
              </h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((user) => (
                  <SearchResultCard key={user.uid} user={user} />
                ))}
              </div>
            ) : searchQuery.length > 0 ? (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-white to-red-50/50 rounded-3xl p-12 shadow-xl border border-red-100/50 max-w-md mx-auto">
                  <Users className="w-16 h-16 text-red-400/40 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    No users found
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    No users match "{searchQuery}". Try a different username or
                    check your spelling.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && recentSearches.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-white to-red-50/50 rounded-3xl p-12 shadow-xl border border-red-100/50 max-w-md mx-auto">
              <SearchIcon className="w-20 h-20 text-red-400/40 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Discover New Friends
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Search for users by their username to connect with fellow anime
                fans! 🌟
              </p>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

export default Search;
