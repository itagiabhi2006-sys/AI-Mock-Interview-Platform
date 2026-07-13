import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../Api';

function ChangePassword() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const changePsd = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const res = await api.post("/change-password", { oldPassword, newPassword });
      setSuccessMessage(res.data);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      let cleanMessage = "Internal Server Error";
      if (err.response?.data?.message) {
        cleanMessage = err.response.data.message;
      }
      setError(cleanMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mx-auto mb-3 text-2xl">
                <i className="fas fa-lock"></i>
              </div>
              <h5 className="text-lg font-bold text-gray-800 mb-1">Change Password</h5>
              <p className="text-gray-500 text-sm">Secure your account</p>
            </div>

            {/* Alerts */}
            {successMessage && (
              <div className="bg-green-100 text-green-700 px-3 py-2 rounded mb-3 flex items-center text-sm">
                <i className="fas fa-check-circle mr-2"></i>
                {successMessage}
              </div>
            )}

            {error && (
              <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-3 flex items-center text-sm">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={changePsd} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Current Password</label>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <span className="bg-gray-100 text-gray-500 px-3 py-2">
                    <i className="fas fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    value={oldPassword}
                    placeholder="Current password"
                    onChange={(e) => setOldPassword(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 border-l border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-r-md"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">New Password</label>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <span className="bg-gray-100 text-gray-500 px-3 py-2">
                    <i className="fas fa-key"></i>
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    placeholder="New password"
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 border-l border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-r-md"
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1 flex items-center">
                  <i className="fas fa-info-circle mr-1"></i> Use a strong password
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold flex items-center justify-center hover:bg-blue-600 transition disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                ) : (
                  <i className="fas fa-shield-alt mr-2"></i>
                )}
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </form>

            {/* Back Button */}
            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={() => navigate("/")}
                disabled={isLoading}
                className="px-3 py-1 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition disabled:opacity-70 flex items-center"
              >
                <i className="fas fa-arrow-left mr-1"></i> Back
              </button>
            </div>

            {/* Security Tips */}
            <div className="text-center mt-4 flex justify-center gap-4 text-gray-500 text-xs">
              <div className="flex items-center gap-1"><i className="fas fa-shield-alt"></i> Secure</div>
              <div className="flex items-center gap-1"><i className="fas fa-lock"></i> Encrypted</div>
              <div className="flex items-center gap-1"><i className="fas fa-check"></i> Verified</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
