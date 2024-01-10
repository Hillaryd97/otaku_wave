import React, { useEffect, useRef, useState } from "react";
import { BsCardImage } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import { FaSpinner } from "react-icons/fa";
import "animate.css";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Image from "next/image";

function NewPostModal({ addPostModal }) {
  const modalRef = useRef(null);
  const [newPost, setNewPost] = useState("");
  const [postPic, setpostPic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const userDataJSON = sessionStorage.getItem("userData");
  const userSessionData = JSON.parse(userDataJSON);
  const username = userSessionData.user.uid;

  console.log(newPost, postPic);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("overlay")) {
      closeModal();
    }
  };

  const closeModal = () => {
    modalRef.current.classList.remove("animate__bounceInUp");
    modalRef.current.classList.add("animate__bounceOutDown");
    setTimeout(() => {
      addPostModal(false);
      modalRef.current.classList.remove("animate__bounceOutDown");
    }, 300); // Adjust the timeout to match the fade-out duration
  };

  useEffect(() => {
    const closeAnimation = () => {
      document.body.style.overflow = "auto"; // Allow scrolling when modal is closed
    };

    if (!addPostModal) {
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
      modalRef.current.classList.add("animate__bounceInUp");
      return closeAnimation;
    }
  }, [addPostModal]);

  const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];

  const handleFileChange = async (e) => {
    if (isLoading) {
      // If the form is already submitting, exit early to avoid double entry
      return;
    }
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
        setIsLoading(true);

        // const username = "your_username"; // replace with actual username
        const userDocRef = doc(db, "posts", username);

        // Upload the file to Firebase Storage
        const storageRef = ref(storage, `posts/${username}/${file.name}`);
        const snapshot = await uploadBytesResumable(storageRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Check if the user document exists
        const userDocSnapshot = await getDoc(userDocRef);

        setpostPic(downloadURL);
      } catch (error) {
        console.error("Error uploading post picture:", error);
      } finally {
        // Reset isSubmitting to enable the button again
        setIsLoading(false);
      }
    }
  };
  const generateRandomId = () => {
    // A simple function to generate a random alphanumeric string
    return Math.random().toString(36).substring(2);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) {
      // If the form is already submitting, exit early to avoid double entry
      return;
    }
    const postId = generateRandomId();
    const userDocRef = doc(db, "users", username);
    const userDocSnapshot = await getDoc(userDocRef);

    // Extract the username from the user's document
    const userUsername = userDocSnapshot.data().username;

    const postData = {
      authId: username,
      username: userUsername,
      newPost: newPost.length < 1 ? newPost : newPost,
      postPic: postPic.length < 1 ? postPic : postPic,
      timestamp: serverTimestamp(),
    };
    
    try {
      setIsSubmitting(true);

      // Check if the user document exists based on the authentication ID
      const postDocRef = doc(db, "posts", username);

      // Set the document with the provided data while merging existing data
      await setDoc(
        postDocRef,
        {
          [postId]: {
            postId,
            ...postData,
          },
        },
        { merge: true }
      );

      // Swal.fire("post Updated!");
      console.log("Post added with ID:", postId);

      addPostModal(false);
    } catch (error) {
      console.error("Error updating/adding document: ", error);
    } finally {
      // Reset isSubmitting to enable the button again
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={modalRef}
      className={`fixed inset-0 flex items-center justify-center bg-background bg-opacity-75 overlay animate__animated ${
        addPostModal
          ? "animate__bounceInUp faster"
          : "animate__bounceOutDown faster"
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`w-full max-w-md bg-white p-4 mx-1.5 rounded-md shadow-md animate__animated ${
          addPostModal ? "animate__bounceInUp faster" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-700">New Post</p>
          <button
            onClick={closeModal}
            className="text-xl text-gray-600 cursor-pointer hover:scale-110"
          >
            <AiOutlineClose />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4">
          <textarea
            name="newPost"
            id="newPost"
            cols="30"
            rows="6"
            className="w-full p-3 rounded resize-none border border-gray-300 focus:outline-none focus:border-secondary"
            placeholder="Share your thoughts..."
            onChange={(e) => setNewPost(e.target.value)}
          ></textarea>
          {postPic ? (
            <div className="flex items-center justify-center">
              <Image
                width={600}
                height={600}
                src={postPic}
                alt="post image"
                className="w-4/5"
              />
            </div>
          ) : (
            ""
          )}
          <div className="flex justify-between items-center mt-4">
            <label
              htmlFor="postPic"
              className="hover:text-opacity-80 cursor-pointer focus:outline-none text-gray-600 duration-300 transition-all focus:text-secondary"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin text-accent" size={26} />
              ) : (
                <BsCardImage size={26} />
              )}
            </label>
            <input
              className="hidden" // hide the input
              type="file"
              id="postPic"
              name="postPic"
              onChange={handleFileChange}
            />

            <button
              disabled={isSubmitting}
              className="px-4 py-1 bg-primary rounded-md shadow-md text-white hover:bg-opacity-70 focus:outline-none focus:ring focus:border-primary duration-300 transition-all"
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewPostModal;
