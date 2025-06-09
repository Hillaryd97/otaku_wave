"use client"
import React, { useState, useEffect } from 'react';
import { Search, UserPlus, MessageCircle, MoreHorizontal, Users, UserCheck, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const ModernFriendsComponent = () => {
  const [activeTab, setActiveTab] = useState('followers');
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get current user data
  useEffect(() => {
    const userDataJSON = typeof window !== "undefined" 
      ? window.sessionStorage.getItem("userData") 
      : null;
    const userSessionData = userDataJSON ? JSON.parse(userDataJSON) : null;
    const authId = userSessionData?.user?.uid;

    if (authId) {
      const userDocRef = doc(db, "users", authId);
      const unsubscribe = onSnapshot(
        userDocRef,
        (doc) => {
          if (doc.exists()) {
            setUserData(doc.data());
          } else {
            console.log("User document not found.");
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error in onSnapshot:", error);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      console.error("Authentication ID not found.");
      setLoading(false);
    }
  }, []);

  const getLastActiveText = (lastActive) => {
    if (!lastActive || !lastActive.seconds) return 'Unknown';
    
    const now = new Date();
    const lastActiveDate = new Date(lastActive.seconds * 1000);
    const diffMs = now - lastActiveDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 10) return 'Active now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  // Get current friends list based on active tab
  const currentFriends = activeTab === 'followers' 
    ? (userData?.followers || [])
    : (userData?.following || []);

  const filteredFriends = currentFriends.filter(friend =>
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const FriendCard = ({ friend }) => (
    <Link href={`/${friend.uid}`} className="block">
      <div className="bg-gradient-to-br from-white via-white to-red-50/30 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100/50 hover:border-primary/30 group backdrop-blur-sm">
        <div className="flex items-start space-x-4">
          {/* Avatar with online indicator */}
          <div className="relative">
            <Image
              src={friend.profilePic || "/bg-image (4).jpg"}
              alt={friend.username}
              width={56}
              height={56}
              className="rounded-full ring-3 ring-white shadow-md group-hover:ring-primary/20 transition-all"
            />
            {friend.lastActive && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-3 border-white shadow-sm"></div>
            )}
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 truncate  transition-colors text-lg">
                  {friend.username}
                </h3>
                <p className="text-sm text-gray-600 truncate mt-1">
                  {friend.bio || "Anime enthusiast 🌸"}
                </p>
              </div>
            </div>

            {/* Activity info */}
            {/* <div className="mt-3 space-y-2">
              <p className="text-xs text-primary/70 font-medium">
                {friend.lastActive ? getLastActiveText(friend.lastActive) : 'Just joined!'}
              </p>
            </div> */}

            {/* Quick action */}
            <div className="flex items-center space-x-2 mt-4">
              <div className="px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary rounded-xl text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 border border-primary/20">
                View Profile
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  const SkeletonCard = () => (
    <div className="bg-gradient-to-br from-white via-white to-red-50/30 rounded-2xl p-5 shadow-lg border border-red-100/50 animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="w-14 h-14 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-28"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-36"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
          <div className="flex space-x-2 mt-4">
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-red-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
                {/* <p className="text-gray-600 mt-1">
                  Your anime community
                </p> */}
              </div>
            </div>
            <Link 
              href="/search"
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Find Friends</span>
            </Link>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-red-100 rounded-xl p-2 items-center justify-center shadow-sm">
            <button
              onClick={() => setActiveTab('followers')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'followers'
                  ? 'bg-white text-primary shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Followers</span>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
                {userData?.followers?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'following'
                  ? 'bg-white text-primary shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Following</span>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
                {userData?.following?.length || 0}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Friends grid */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredFriends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFriends.map((friend) => (
              <FriendCard key={friend.uid} friend={friend} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-white to-red-50/50 rounded-3xl p-12 shadow-xl border border-red-100/50 max-w-md mx-auto">
              <Users className="w-20 h-20 text-primary/30 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {searchQuery ? 'No friends found' : `No ${activeTab} yet`}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {searchQuery 
                  ? `No friends match "${searchQuery}"`
                  : activeTab === 'followers' 
                    ? 'No one is following you yet. Share your profile to get followers! 🌟'
                    : 'You\'re not following anyone yet. Find some friends to follow! 🚀'
                }
              </p>
              {!searchQuery && (
                <Link 
                  href="/search"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Find Friends</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernFriendsComponent;