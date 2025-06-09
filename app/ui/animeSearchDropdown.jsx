// AnimeSearchDropdown.js

import Image from "next/image";
import React, { useEffect, useState } from "react";

function AnimeSearchDropdown({ searchTerm, onSelect, searchType }) {
  const [searchResults, setSearchResults] = useState([]);
  const [itemSelected, setItemSelected] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (searchTerm) {
          const apiUrl = `https://api.jikan.moe/v4/anime?q=${searchTerm}`;

          const response = await fetch(apiUrl);
          const responseData = await response.json();

          console.log("Received API response:", responseData); // Log the received data

          const resultsArray = responseData.data || [];
          setSearchResults(resultsArray);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error fetching anime data:", error);
      }
    };

    fetchData();
  }, [searchTerm]);

  const handleItemClick = (anime) => {
    onSelect(anime);
    setItemSelected(true);
    console.log("itemcick");
  };

  useEffect(() => {
    if (searchTerm && !itemSelected) {
      setItemSelected(false);
      console.log("searchterm");
    }
  }, [searchTerm, itemSelected]);

  return (
    <div>
      {itemSelected === false ? (
        <div className="absolute left-0 right-0 mt-2 overflow-y-scroll h-44 bg-white border rounded-md shadow-md z-50">
          {searchResults.length > 0 && searchTerm
            ? searchResults.map((anime) => (
                <div key={anime.mal_id}>
                  <div
                    key={anime.mal_id}
                    className="p-2 cursor-pointer hover:bg-gray-100 flex "
                    onClick={() => handleItemClick(anime)}
                  >
                    <Image
                      src={anime.images?.jpg?.large_image_url}
                      alt={anime.title}
                      height={500}
                      width={500}
                      className="w-10 h-14 object-cover rounded-md mr-2"
                    />
                    <div className="flex justify-center flex-col">
                      <span className="text-sm">
                        {anime.title} {anime.year ? `(${anime.year})` : ""}
                      </span>
                      <span className="text-xs text-gray-500">
                        Episodes: {anime.episodes}{" "}
                      </span>
                      <span className="text-xs text-gray-500">
                        {anime.airing}
                      </span>
                      <span className="text-xs text-gray-500">
                        {anime.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            : null}
          {searchResults.length === 0 && searchTerm && (
            <div className="p-2 text-gray-500">No results found</div>
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default AnimeSearchDropdown;
