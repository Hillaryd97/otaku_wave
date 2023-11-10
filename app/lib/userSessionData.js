"use client"
// userSessionData.js
export const getUserDataFromSessionStorage = () => {
    if (typeof window !== "undefined") {
      const userDataJSON = sessionStorage.getItem("userData");
      if (userDataJSON) {
        const userData = JSON.parse(userDataJSON);
        return userData;
      }
    }
    return null;
  };
  
  export const setUserDataInSessionStorage = (userData) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("userData", JSON.stringify(userData));
    }
  };
  