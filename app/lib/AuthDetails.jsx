"use client";
import { useEffect, useState } from "react";
import { Auth, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function AuthDetails() {
  const [authUser, setAuthUser] = useState(null);
  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
      }
    });
    return () => {
      listen();
    };
  }, []);

  const userSignOut = () => {
    signOut(auth)
      .then(console.log("signout successful"))
      .catch((error) => console.log(error));
  };
  return (
    <div>
      {authUser ? (
        <div>
          <p>`Signed in as: ${authUser.email}`</p>{" "}
          <button onClick={userSignOut}>Sign Out</button>
        </div>
      ) : (
        <p>Signed Out</p>
      )}
    </div>
  );
}
