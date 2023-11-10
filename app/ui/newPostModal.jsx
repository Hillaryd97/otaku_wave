import React, { useEffect, useRef } from "react";
import { BsCardImage } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import "animate.css";

function NewPostModal({ addPostModal }) {
  const modalRef = useRef(null);

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
        <form onSubmit={""} className="mt-4">
          <textarea
            name=""
            id=""
            cols="30"
            rows="6"
            className="w-full p-3 rounded resize-none border border-gray-300 focus:outline-none focus:border-secondary"
            placeholder="Share your thoughts..."
          ></textarea>
          <div className="flex justify-between items-center mt-4">
            <button className="hover:text-opacity-80 focus:outline-none text-gray-600 duration-300 transition-all focus:text-secondary">
              <BsCardImage size={26} />
            </button>
            <button className="px-4 py-1 bg-primary rounded-md shadow-md text-white hover:bg-opacity-70 focus:outline-none focus:ring focus:border-primary duration-300 transition-all">
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewPostModal;
