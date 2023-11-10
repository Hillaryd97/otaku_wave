"use client";

import { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";

// Define the ForgotPassword component
export default function ForgotPassword() {
  // Use state to store the user's email address
  const [email, setEmail] = useState("");

  // Define a function to reset the user's password
  const resetEmail = () => {
    // Send a password reset email to the user
    sendPasswordResetEmail(auth, email);
  };

  // Return the component's UI
  return (
    <>
      <div className=" min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h1 className="font-bold text-xl md:text-3xl text-black text-center ">
            Otaku<span className="text-primary">Wave</span>
          </h1>
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-text">
            Forgot Password
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto flex flex-col w-full z-30 bg-background p-10 rounded-md  shadow-md border-t border-t-primary sm:w-full sm:max-w-sm">
          <div className="space-y-6">
            <div>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="px-4 block w-full duration-300 bg-gray-50 focus:outline-none focus:bg-secondary placeholder:focus:text-white rounded-md border-0 py-1.5 shadow-md ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset  sm:text-sm sm:leading-6"
                  placeholder="Enter Email Address"
                />
              </div>
            </div>

            <div>
              <button
                onClick={resetEmail}
                disabled={!email}
                className="disabled:opacity-40 flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Send Forgot Password Email
              </button>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center pt-4 space-y-2">
            <Link
              href={"/login"}
              className="text-white mt-3 bg-gray-600 hover:bg-opacity-70 duration-300 px-2 py-1 rounded-xl"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
