import React, { useEffect, useState } from 'react';
import { Navigate } from "react-router-dom";
import api from '../Api';

function Logout() {
  const [loggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    console.log("hiiiiiiiiiii")
    const logoutUser = async () => {
      // Clear local storage
      localStorage.removeItem("loggedIn");
      localStorage.clear();

      try {
        await api.post("/logoutt"); // Call backend logout endpoint
        console.log("sdfghjkl")
      } catch (err) {
        // optional: handle errors silently
      } finally {
        setIsLoggedOut(true); // trigger redirect
      }
    };

    logoutUser();
  }, []);

  if (loggedOut) {
    return <Navigate to="/" replace />;
  }

  // Loading screen while logout is in progress
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
        <h5 className="text-gray-500 text-lg mb-2">Logging out...</h5>
        <p className="text-gray-400 text-sm">Please wait while we sign you out securely.</p>
      </div>
    </div>
  );
}

export default Logout;
