"use client";

import Image from "next/image";
import Swal from "sweetalert2";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import Link from "next/link";
import "animate.css";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logIn, logOut } from "@/redux/features/authSlice";

export default function Register() {
  const Swal = require("sweetalert2");

  const dispatch = useDispatch();
  const router = useRouter();
  const userDataJSON = sessionStorage.getItem("userData");
  const userData = JSON.parse(userDataJSON);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e, field) => {
    const updatedFormData = { ...formData };
    updatedFormData[field] = e.target.value;
    setFormData(updatedFormData);
  };
  console.log(formData);
  const [error, setError] = useState(null);
  const signUp = (e) => {
    e.preventDefault();
    dispatch(logIn(formData.email));

    createUserWithEmailAndPassword(auth, formData.email, formData.password)
      .then((userCredential) => {
        console.log(userCredential);
        sessionStorage.setItem("userData", JSON.stringify(userCredential));
        router.push("/home");
      })
      .catch((error) => {
        if (error.code === "auth/weak-password") {
          Swal.fire("Password should be at least 6 characters");
        } else if (error.code === "auth/email-already-in-use") {
          Swal.fire(
            "Duplicate Email",
            `An account already exists with ${formData.email}!`,
            "error"
          );
        } else {
          setError(error.message);
        }
      });
  };
  return (
    <div className="px-4 min-h-screen bg-gray-950 bg-opacity-90 mx-auto flex flex-col items-center justify-center relative">
      <img
        src="/register-image.jpg"
        alt="ichigo_final_getsuga_tenshou"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: -1 }}
      />
      <div className="flex flex-col items-center justify-center lg:w-2/6">
        <form
          onSubmit={signUp}
          className="flex flex-col w-full z-30 bg-background p-10 rounded-md  shadow-md border-t border-t-primary  animate__animated animate__fadeInRight"
        >
          <h2 className="text-center md:text-2xl text-xl font-bold">
            Register
          </h2>
          <p className="text-center mt-0.5 text-sm text-gray-700">
            Join our community and connect with other anime fans
          </p>

          <div className="flex flex-col space-y-4 mt-8">
            <input
              type="text"
              className="rounded-full border px-4 py-2 w-full duration-300 bg-gray-50 focus:outline-none focus:bg-secondary placeholder:focus:text-white"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange(e, "email")}
            />
            <input
              type="password"
              className="rounded-full border px-4 py-2 w-full duration-300 bg-gray-50 focus:outline-none focus:bg-secondary placeholder:focus:text-white"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange(e, "password")}
            />
            <div className="flex flex-col justify-center items-center pt-4 space-y-2">
              <button
                disabled={!formData.email || !formData.password}
                type="submit"
                className="disabled:opacity-40 disabled:cursor-not-allowed font-bold text-white bg-primary py-2 rounded-lg w-fit px-5 hover:opacity-80 focus:scale-95 duration-300"
              >
                Register
              </button>
              <p className="text-center pt-2 font-bold">
                Have an account?{" "}
                <Link
                  href={"/login"}
                  className="text-primary hover:text-opacity-75"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
      <button
        className="text-white mt-3 bg-gray-600 hover:bg-opacity-70 duration-300 px-2 py-1 rounded-xl"
        onClick={() => router.push("/")}
      >
        Go Back
      </button>
    </div>
  );
}
