"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import "animate.css";
import React, { useState } from "react";
import { auth } from "../firebase";
import { logIn, logOut } from "@/redux/features/authSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Image from "next/image";

export default function Register() {
  const dispatch = useDispatch();
  const router = useRouter();
  const Swal = require("sweetalert2");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  // const userDataJSON = sessionStorage.getItem("userData");
  // const userData = JSON.parse(userDataJSON);
  const handleInputChange = (e, field) => {
    const updatedFormData = { ...formData };
    updatedFormData[field] = e.target.value;
    setFormData(updatedFormData);
  };

  const signIn = (e) => {
    e.preventDefault();
    dispatch(logIn(formData.email));
    signInWithEmailAndPassword(auth, formData.email, formData.password)
      .then((userCredential) => {
        console.log(userCredential);
        sessionStorage.setItem("userData", JSON.stringify(userCredential));
        router.push("/home");
      })
      .catch((error) => {
        if (error.code === "auth/invalid-login-credentials") {
          Swal.fire("Invalid Password!");
        } else if (error.code === "auth/email-already-in-use") {
          Swal.fire(
            "Duplicate Email",
            `An account already exists with ${formData.email}!`,
            "error"
          );
        } else {
          setError(error.message);
          Swal.fire("Something went wrong! Please try again!");
        }
      });
  };

  return (
    <div className=" min-h-screen px-4 bg-gray-950 bg-opacity-90 mx-auto flex flex-col items-center justify-center relative">
      <Image
        src="/login-img.png"
        alt="ichigo_final_getsuga_tenshou"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: -1 }}
        width={600}
        height={600}
      />
      <div className="flex flex-col items-center justify-center lg:w-2/6">
        <form
          onSubmit={signIn}
          className="flex flex-col w-full z-30 bg-background p-10 rounded-md  shadow-md border-t border-t-primary animate__animated animate__fadeInLeft"
        >
          <h2 className="text-center text-2xl font-bold">Login</h2>
          <p className="text-center mt-0.5 text-sm text-gray-700">
            Reconnect with anime fans and continue your journey.
          </p>

          <div className="flex flex-col space-y-4 mt-8">
            <input
              type="email"
              required
              className="rounded-full border px-4 py-2 w-full duration-300 bg-gray-50 focus:outline-none focus:bg-secondary placeholder:focus:text-white"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange(e, "email")}
            />
            <input
              type="password"
              required
              className="rounded-full border px-4 py-2 w-full duration-300 bg-gray-50 focus:outline-none focus:bg-secondary placeholder:focus:text-white"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange(e, "password")}
            />
            <div className="flex flex-col justify-center items-center pt-4 space-y-2">
              <button
                className="disabled:opacity-40 disabled:cursor-not-allowed font-bold text-white bg-primary py-2 rounded-lg w-fit px-5 hover:opacity-80 focus:scale-95 duration-300"
                disabled={!formData.email || !formData.password}
              >
                Login
              </button>
              <p className="text-center pt-2 font-bold">
                Not a user?{" "}
                <Link
                  href={"/register"}
                  className="text-primary hover:text-opacity-75"
                >
                  Register
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
      <Link
        className="text-white py-2 shadow-md font-semibold hover:underline"
        href={"/forgot-password"}
      >
        Forgot Password?
      </Link>
    </div>
  );
}
