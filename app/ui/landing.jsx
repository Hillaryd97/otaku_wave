"use client";
import React, { useState, useEffect } from "react";
import Nav from "./landingNav";
import Image from "next/image";
import "animate.css";
import Link from "next/link";
import Footer from "./footer";
import { useAppSelector } from "@/redux/store";

const images = [
  "/bg-image (1).jpg",
  "/hero-image (1).jpg",
  "/bg-image (4).jpg",
  "/bg-image (3).png",
];

export default function Landing() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextImageIndex = (currentImage + 1) % images.length;
      setCurrentImage(nextImageIndex);
    }, 10000);

    return () => clearTimeout(timer);
  }, [currentImage]);

  // const username = useAppSelector((state) => state.authReducer.value.userName);

  return (
    <div>
      <div className="relative w-full h-screen">
        <div className="relative w-full">
          {images.map((image, index) => (
            <Image
              key={index}
              src={image}
              alt={`Slide ${index + 1}`}
              className={`absolute w-full h-screen object-fill transition-opacity duration-1000 ${
                index === currentImage ? "opacity-100" : "opacity-0"
              }`}
              width={600}
              height={600}
            />
          ))}
        </div>

        <div className="absolute bg-black min-h-screen bg-opacity-80 inset-0 flex flex-col z-10">
          <Nav />
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center px-2">
              <div className="flex flex-col space-y-5 pb-6">
                <h1 className="lg:text-5xl text-4xl font-bold animate__animated animate__fadeIn animate__slow">
                  Discover, Share, Engage
                </h1>
                <p className="md:px-40 animate__animated animate__fadeIn animate__slower">
                  Connect with fellow fans, join discussions, and keep track of
                  your anime watchlist. <br className="hidden md:block" /> Start
                  your adventure in the ultimate anime community today.{" "}
                </p>
              </div>
              <div className=" animate__animated animate__slower">
                <Link
                  href={"/register"}
                  className="px-8 py-2 bg-primary rounded-lg shadow-md duration-500 font-semibold hover:bg-red-800"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <section className="h-fit bg-gray-50">
        <div className="flex flex-col space-y-10 pt-16">
          <div className="flex py-2 md:px-20 space-y-6 flex-col md:flex-row items-center justify-center">
            <Image
              src="/undraw_social_update_re_xhjr.svg"
              width={300}
              height={300}
              alt="image"
            />
            <div className="px-4 flex flex-col space-y-2 pb-1">
              <h2 className="font-bold">Showcase Your Anime Preferences</h2>
              <p className="">
                Showcase your favorite anime series, characters, and episodes on
                your profile. Add a cool avatar to let others know what you&apos;re
                into.
              </p>
            </div>
          </div>
          <div className="flex py-6 md:px-20 space-y-6 bg-gray-100 md:flex-row-reverse flex-col items-center justify-center">
            <Image
              src="/undraw_online_messaging_re_qft3.svg"
              width={300}
              height={300}
              alt="image"
            />
            <div className="px-4 flex flex-col space-y-2 pb-1">
              <h2 className="font-bold">Join the Conversation</h2>
              <p className="">
                Dive into topic-based discussions without the chaos of group
                chats. Engage, share, and geek out about anime with like-minded
                fans.
              </p>
            </div>
          </div>
          <div className="flex py-2 md:px-20 space-y-6 flex-col md:flex-row items-center justify-center">
            <Image
              src="/undraw_events_re_98ue.svg"
              width={300}
              height={300}
              alt="image"
            />
            <div className="px-4 flex flex-col space-y-2 pb-1">
              <h2 className="font-bold">Stay in the Loop</h2>
              <p className="">
                Keep track of upcoming anime events, releases, and conventions
                with our user-friendly event calendar. No more missing out on
                exciting anime happenings.
              </p>
            </div>
          </div>
          <div className="flex py-6 md:px-20 space-y-6 bg-gray-100 flex-col ">
            <div className="flex flex-col md:flex-row-reverse items-center justify-center">
              <Image
                src="/undraw_portfolio_feedback_6r17.svg"
                width={300}
                height={300}
                alt="image"
              />
              <div className="px-4 flex flex-col space-y-2 pb-1">
                <h2 className="font-bold">Connect and Share</h2>
                <p className="">
                  Stay connected with fellow anime fans. Post, share, and
                  discuss your latest anime interests in a laid-back News Feed.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center flex-col px-8 gap-4 py-8 bg-red-800">
            <h3 className="md:text-2xl font-bold text-center text-xl text-white">
              Ready to start your journey?
            </h3>
            <Link href={"/get-started/register"} className="button">
              Join the Community
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
