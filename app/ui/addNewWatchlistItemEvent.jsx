import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function AddNewWatchlistItemEvent({
  onSubmit,
  handleAddWatchlistItem,
  closeForm,
  selectedItem,
}) {
  const [title, setTitle] = useState(
    `${selectedItem.media?.title?.english || selectedItem.media?.title?.english}`
  );
  const [status, setStatus] = useState("");
  const [selectedAnimeData, setSelectedAnimeData] = useState([]);
  const [thoughts, setThoughts] = useState(""); // Add state for thoughts
  const [image, setimage] = useState(
    `${selectedItem.media?.coverImage?.medium}`
  );
  const [airingStatus, setairingStatus] = useState("");
  const [episodes, setEpisodes] = useState(`${selectedItem.episode}`);
  const [airingEpisode, setAiringEpisode] = useState(`${selectedItem.episode}`);
  const [malID, setMalID] = useState(`${selectedItem.id}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userDataJSON = sessionStorage.getItem("userData");
  const userSessionData = JSON.parse(userDataJSON);
  const username = userSessionData?.user?.uid;
  const Swal = require("sweetalert2");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate and submit the form
    if (title && status) {
      // Optionally, reset the form fields
      setTitle("");
      setStatus("");
      setThoughts("");
      handleAddWatchlistItem();
    }
    e.preventDefault();
    if (isSubmitting) {
      // If the form is already submitting, exit early to avoid double entry
      return;
    }
    setTitle(
      selectedItem.media?.title?.romaji || selectedItem.media?.title?.english
    );
    setimage(selectedItem.media?.coverImage?.medium);
    try {
      setIsSubmitting(true);

      const userDocRef = doc(db, "users", username);

      // Get the existing user document data
      const userDocSnapshot = await getDoc(userDocRef);

      // If the user document exists, update the watchlist array
      if (userDocSnapshot.exists()) {
        const existingWatchlist = userDocSnapshot.data().watchlist || [];
        const updatedWatchlist = [
          ...existingWatchlist,
          { malID, title, status, thoughts, image, episodes, airingEpisode, airingStatus },
        ];

        // Update the user document with the new watchlist array
        await updateDoc(userDocRef, { watchlist: updatedWatchlist });
      } else {
        // If the user document doesn't exist, create a new document with the watchlist
        await setDoc(userDocRef, {
          watchlist: [
            { malID, title, status, thoughts, image, episodes, airingEpisode, airingStatus },
          ],
        });
      }

      // Swal.fire("Added!");
      console.log("Document updated/added for ID:", username);

      handleAddWatchlistItem();
    } catch (error) {
      console.error("Error updating/adding document: ", error);
    } finally {
      setIsSubmitting(false);
      closeForm();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed top-[28%] w-full  bg-gray-100 p-4 rounded-md shadow-md"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Add To Watchlist</h2>
        <button
          onClick={closeForm}
          className="bg-primary text-white px-2 py-2 rounded flex items-center justify-center font-semibold hover:bg-opacity-70 duration-300 w-fit"
        >
          <IoMdClose size={18} />
        </button>
      </div>
      <div className="mb-4">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-600"
        >
          Title:
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={
            title ||
            (selectedItem?.media?.title?.romaji ||
              selectedItem?.media?.title?.english) +
              (selectedItem?.episode ? ` (ep.${selectedItem.episode})` : "")
          }
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 p-2 w-full border rounded-md"
        />

        {/* {title.length > 1 ? (
          <div className="">
            <AnimeSearchDropdown
              searchTerm={title}
              onSelect={(anime) => handleAnimeSelection(anime)}
            />
          </div>
        ) : (
          ""
        )} */}
      </div>
      <div className="mb-4">
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-600"
        >
          Status:
        </label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 p-2 w-full border rounded-md"
        >
          <option value="">Select Status</option>
          <option value="Watching">Watching</option>
          <option value="Completed">Completed</option>
          <option value="To Watch">To Watch</option>
        </select>
      </div>
      <div className="mb-4">
        <label
          htmlFor="thoughts"
          className="block text-sm font-medium text-gray-600"
        >
          Thoughts:
        </label>
        <textarea
          id="thoughts"
          name="thoughts"
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value.slice(0, 250))}
          className="mt-1 p-2 w-full border rounded-md"
        />
      </div>
      <button
        disabled={isSubmitting}
        type="submit"
        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-80"
      >
        {isSubmitting ? "Adding..." : "Add"}
      </button>
    </form>
  );
}

export default AddNewWatchlistItemEvent;
