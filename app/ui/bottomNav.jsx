import Link from "next/link";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/store";
import {
  setActiveItem,
  selectActiveItem,
} from "@/redux/features/navigationSlice";

import { AiFillHome } from "react-icons/ai";
import {
  BsFillCalendar2EventFill,
  BsSearch,
  BsFillPersonFill,
} from "react-icons/bs";
import { HiUserGroup } from "react-icons/hi";
import { useRouter } from "next/navigation";

function BottomNav() {
  const dispatch = useDispatch();
  const activeItem = useAppSelector(selectActiveItem);

  const handleItemClick = (item) => {
    dispatch(setActiveItem(item));
  };

  const pages = ["/home", "/topic", "/search", "/events", "/profile"];
  const iconDescriptions = ["Home", "Topics", "Search", "Events", "Profile"];
  const router = useRouter();

  // useEffect(() => {
  //   if (activeItem === "/home") {
  //     router.push("/home");
  //   }
  // }, [activeItem, router]);

  return (
    <nav className="fixed w-full bottom-0 pt-2.5 px-4 pb-5 bg-opacity-80 bg-background shadow-md border-t-2 border-secondary">
      <div className="flex items-center md:justify-around justify-between">
        {pages.map((page, index) => (
          <Link
            key={page}
            href={page} // Replace with the actual link for each page
            className={`flex justify-center items-center  ${
              activeItem === page
                ? "text-primary transform scale-110 duration-300"
                : "hover:text-primary duration-300 text-gray-800"
            }`}
            onClick={() => handleItemClick(page)}
          >
            {index === 0 && (
              <div className="flex flex-col items-center justify-center">
                <AiFillHome size={28} />
                {activeItem === page && (
                  <span className="text-xs duration-300">
                    {iconDescriptions[index]}
                  </span>
                )}
              </div>
            )}
            {index === 1 && (
              <div className="flex flex-col items-center justify-center">
                <HiUserGroup size={28} />
                {activeItem === page && (
                  <span className="text-xs duration-300">
                    {iconDescriptions[index]}
                  </span>
                )}
              </div>
            )}
            {index === 2 && (
              <div className="flex flex-col items-center justify-center">
                <BsSearch size={28} />
                {activeItem === page && (
                  <span className="text-xs duration-300">
                    {iconDescriptions[index]}
                  </span>
                )}
              </div>
            )}
            {index === 3 && (
              <div className="flex flex-col items-center justify-center">
                <BsFillCalendar2EventFill size={28} />
                {activeItem === page && (
                  <span className="text-xs duration-300">
                    {iconDescriptions[index]}
                  </span>
                )}
              </div>
            )}
            {index === 4 && (
              <div className="flex flex-col items-center justify-center">
                <BsFillPersonFill size={28} />
                {activeItem === page && (
                  <span className="text-xs duration-300">
                    {iconDescriptions[index]}
                  </span>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
