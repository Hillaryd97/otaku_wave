"use client";

import React, { useState, useEffect } from "react";
import BottomNav from "../ui/bottomNav";
import { IoIosNotifications } from "react-icons/io";
import { MessageCircle, Users, Sparkles } from "lucide-react";
import Image from "next/image";

function Topics() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 min-h-screen w-full flex items-center justify-center">
      {/* Header */}
      <nav className="absolute w-full top-0 px-3 py-2 bg-white/80 backdrop-blur-sm shadow-sm border-b border-red-100">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Topics</h1>
          <div className="relative text-xl text-primary">
            <IoIosNotifications size={32} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white"></span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className={`text-center px-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Illustration */}
        <div className="relative mb-8">
          {/* <Image
            width={280}
            height={280}
            alt="Coming Soon"
            src="/underConstruction.svg"
            className="mx-auto drop-shadow-lg"
          /> */}
          <Sparkles className="absolute top-8 right-16 w-6 h-6 text-yellow-400 animate-pulse" />
          <Sparkles className="absolute top-8 left-12 w-4 h-4 text-pink-400 animate-pulse" />
        </div>

        {/* Title */}
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-4">
          Coming Soon!
        </h2>

        {/* Description */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg max-w-md mx-auto">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              <Users className="w-6 h-6 text-pink-500" />
            </div>
          </div>
          
          <h3 className="font-bold text-gray-900 mb-3">Topic Discussions</h3>
          <p className="text-gray-600 leading-relaxed">
            A community space where you can discuss anime by topics with fellow fans. Share your thoughts, theories, and passion!
          </p>
          
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">In Development</span>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}

export default Topics;