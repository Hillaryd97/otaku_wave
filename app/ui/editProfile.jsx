import React, { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  getDoc,
  doc,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
} from "firebase/storage";
import Swal from "sweetalert2";

function EditProfile({ setEditProfile }) {
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    country: "",
    birthday: "",
    gender: "",
    profilePic: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const truncatedValue = value.slice(0, 250);

    setFormData({
      ...formData,
      [name]: truncatedValue,
    });
  };

  console.log(formData);

  const Swal = require("sweetalert2");

  const userDataJSON = sessionStorage.getItem("userData");
  const userSessionData = JSON.parse(userDataJSON);
  const username = userSessionData.user.uid;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const getUserProfileData = async () => {
      try {
        // Extract the authentication ID from the user data
        const authId = userSessionData.user.uid;

        console.log("Auth ID:", authId);

        // Create a query to find the user document based on the authId field
        const q = query(collection(db, "users"), where("authId", "==", authId));

        // Retrieve the user document from Firestore
        const querySnapshot = await getDocs(q);

        // Check if any documents match the query
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          console.log("User data:", userData);

          // Set the user data in the component state
          setUserData(userData);
        });

        if (querySnapshot.empty) {
          console.log("User document not found.");
        }
      } catch (error) {
        console.error("Error fetching user profile data:", error);
      }
    };

    // Call the getUserProfileData function to initiate the data retrieval
    getUserProfileData();
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) {
      // If the form is already submitting, exit early to avoid double entry
      return;
    }
    const userInfo = {
      authId: username,
      username:
        formData.username.length < 1
          ? userData?.username || ""
          : formData.username,
      bio: formData.bio.length < 1 ? userData?.bio || "" : formData.bio,
      country:
        formData.country.length < 1
          ? userData?.country || ""
          : formData.country,
      birthday:
        formData.birthday.length < 1
          ? userData?.birthday || ""
          : formData.birthday,
      gender:
        formData.gender.length < 1 ? userData?.gender || "" : formData.gender,
      profilePic:
        formData.profilePic.length < 1
          ? userData?.profilePic || ""
          : formData.profilePic,
    };
    try {
      setIsSubmitting(true);

      // Check if the user document exists based on the authentication ID
      const userDocRef = doc(db, "users", userInfo.authId);

      // Set the document with the provided data while merging existing data
      await setDoc(userDocRef, userInfo, { merge: true });

      // Swal.fire("Profile Updated!");
      // console.log("Document updated/added for ID:", userInfo.authId);

      setEditProfile();
    } catch (error) {
      console.error("Error updating/adding document: ", error);
    } finally {
      // Reset isSubmitting to enable the button again
      setIsSubmitting(false);
    }
  };
  const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"]; // Add more valid image MIME types as needed

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const storage = getStorage();
    if (file) {
      const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB as an example; adjust as needed
      if (file.size > maxSizeInBytes) {
        // Display an error message or take appropriate action
        console.error("File size exceeds the maximum allowed size.");
        alert("File is too heavy!");

        return;
      } else if (!allowedImageTypes.includes(file.type)) {
        //  Display an error message or take appropriate action
        console.error("Invalid file type. Please upload a valid image file.");
        alert("Please upload an image!");
        return;
      }

      try {
        // const username = "your_username"; // replace with actual username
        const userDocRef = doc(db, "users", username);

        // Upload the file to Firebase Storage
        const storageRef = ref(
          storage,
          `profilePictures/${username}/${file.name}`
        );
        const snapshot = await uploadBytesResumable(storageRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Check if the user document exists
        const userDocSnapshot = await getDoc(userDocRef);

        // if (userDocSnapshot.exists()) {
        //   // User document exists, update it
        //   await updateDoc(userDocRef, { profilePic: downloadURL });
        // } else {
        //   // User document doesn't exist, create it
        //   await setDoc(userDocRef, { profilePic: downloadURL });
        // }

        // Optionally, update your local state or context with the new URL
        // handleChange()
        setFormData({ ...formData, profilePic: downloadURL });
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      }
    }
  };

  return (
    <div className="fixed overflow-scroll top-0 left-0 w-full min-h-full flex justify-between py-3 px-2 bg-secondary bg-opacity-70 items-center">
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto p-4 bg-gray-100 shadow-md rounded-md"
      >
        <div>
          <label
            className="text-sm font-semibold text-gray-600"
            htmlFor="username"
          >
            Username:
          </label>
          <input
            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:border-primary"
            type="text"
            id="username"
            name="username"
            value={formData.username || userData?.username || ""}
            onChange={handleChange}
            onClick={() => setFormData({ ...formData, username: "" })} // Clear the value on click
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600" htmlFor="bio">
            Bio:
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio || userData?.bio || ""}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 mt-1 border rounded-md resize-none focus:outline-none focus:ring focus:border-primary"
          />
        </div>
        <div>
          <label
            className="text-sm font-semibold text-gray-600"
            htmlFor="profilePic"
          >
            Profile Picture:
          </label>
          {/* <div className="flex items-center justify-center">
        <img src={userData?.profilePic} alt="" width={200} className="w-40 h-40 rounded-full"/>

        </div> */}
          <input
            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:border-primary"
            type="file"
            id="profilePic"
            name="profilePic"
            onChange={handleFileChange}
          />
        </div>

        <div>
          <label
            className="text-sm font-semibold text-gray-600"
            htmlFor="country"
          >
            Country:
          </label>
          <input
            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:border-primary"
            type="text"
            id="country"
            name="country"
            value={formData.country || userData?.country || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            className="text-sm font-semibold text-gray-600"
            htmlFor="birthday"
          >
            Birthday:
          </label>
          <input
            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:border-primary"
            type="date"
            id="birthday"
            name="birthday"
            value={formData.birthday || userData?.birthday || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            className="text-sm font-semibold text-gray-600"
            htmlFor="gender"
          >
            Gender:
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender || userData?.gender || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:border-primary"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between gap-6 p">
          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full py-2 text-white bg-green-500 rounded-md hover:bg-opacity-80 focus:outline-none"
          >
            {isSubmitting ? "Submitting..." : "Save Changes"}
          </button>
          <button
            onClick={setEditProfile}
            disabled={userData?.username === ""}
            className={`w-full duration-300 py-2 text-white rounded-md focus:outline-none ${
              userData?.username === ""
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-opacity-80"
            }`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
