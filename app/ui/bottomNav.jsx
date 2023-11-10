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

  // Define the names of the pages that correspond to the navigation items
  const pages = ["/home", "/topic", "/search", "/events", "/profile"];
  const router = useRouter(); // Get the current router instance

  useEffect(() => {
    if (activeItem === "/home") {
      router.push("/home");
    }
  }, [activeItem, router]);

  return (
    <nav className="fixed w-full bottom-0 pt-2.5 px-3 pb-5 bg-opacity-80 bg-background shadow-md border-t-2 border-secondary">
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
            {index === 0 && <AiFillHome size={32} />}
            {index === 1 && <HiUserGroup size={32} />}
            {index === 2 && <BsSearch size={32} />}
            {index === 3 && <BsFillCalendar2EventFill size={30} />}
            {index === 4 && <BsFillPersonFill size={32} />}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
