import React, { useState } from "react";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { IoMdClose } from "react-icons/io";

function EditWatchListItemForm({ selectedItem, closeForm }) {
  const userDataJSON = sessionStorage.getItem("userData");
  const userSessionData = JSON.parse(userDataJSON);
  const username = userSessionData.user.uid;
  const [editedData, setEditedData] = useState({
    title: selectedItem.title,
    status: selectedItem.status,
    thoughts: selectedItem.thoughts,
    episodes: selectedItem.episodes,
    airingStatus: selectedItem.airingStatus,
    image: selectedItem.image,
    malID: selectedItem.malID,
    // Add other fields as needed
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Limit the character entry to 250 characters
    const truncatedValue = value.slice(0, 250);

    setEditedData((prevData) => ({
      ...prevData,
      [name]: truncatedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userDocRef = doc(db, "users", username);
      const userDocSnapshot = await getDoc(userDocRef);

      const watchlist = userDocSnapshot.data().watchlist || [];
      if (watchlist && Array.isArray(watchlist)) {
        const updatedWatchlist = watchlist.map((item) =>
          item.malID === selectedItem.malID ? editedData : item
        );
        await updateDoc(userDocRef, { watchlist: updatedWatchlist });
        closeForm();
      } else {
        console.error("Error: Watchlist not found or has unexpected structure");
      }
    } catch (error) {
      console.error("Error updating watchlist item:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const userDocRef = doc(db, "users", username);
      const malID = selectedItem.malID;

      const userDocSnapshot = await getDoc(userDocRef);
      const watchlist = userDocSnapshot.data().watchlist || [];

      // Filter out the item with the specified malID
      const updatedWatchlist = watchlist.filter(
        (watchlistItem) => watchlistItem.malID !== malID
      );

      // Update the document with the filtered watchlist
      await updateDoc(userDocRef, { watchlist: updatedWatchlist });

      closeForm();
    } catch (error) {
      console.error("Error deleting watchlist item:", error);
      console.log(selectedItem.malID);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-400 bg-opacity-50 flex items-center justify-center">
      <form className="fixed top-[20%] w-3/5  bg-gray-100 p-4 rounded-md shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{editedData.title}</h2>
          <button
            onClick={closeForm}
            className="bg-primary text-white px-2 py-2 rounded flex items-center justify-center font-semibold hover:bg-opacity-70 duration-300 w-fit"
          >
            <IoMdClose size={18} />
          </button>
        </div>
        <label className="block mb-2">Status:</label>
        <select
          id="status"
          name="status"
          value={editedData.status}
          onChange={handleInputChange}
          className="mt-1 p-2 w-full border rounded-md"
        >
          <option value="">Select Status</option>
          <option value="Watching">Watching</option>
          <option value="Completed">Completed</option>
          <option value="To Watch">To Watch</option>
        </select>
        <label className="block mb-2">Thoughts:</label>
        <div className="relative">
          <textarea
            name="thoughts"
            value={editedData.thoughts}
            onChange={handleInputChange}
            className="w-full border p-2 rounded-md resize-none"
          />
          <div className=" text-gray-500 text-sm">
            {editedData.thoughts.length}/250
          </div>
        </div>{" "}
        <div className="flex justify-end">
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded-md mr-2"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-md"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditWatchListItemForm;
