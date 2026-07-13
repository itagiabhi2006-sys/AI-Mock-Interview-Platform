import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../Api';

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (redirect) {
      const timer = setTimeout(() => {
        sessionStorage.setItem("canAccessReset", "true");
        sessionStorage.setItem("resetEmail", email);
        navigate("/reset-password");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [redirect, navigate, email]);

  const resetPasswordHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors("");
    setSuccessMessage("");

    try {
      const res = await api.post("/forget-password", { email });
      setSuccessMessage(res.data || "OTP sent successfully!");
      setRedirect(true);
    } catch (error) {
      setErrors(error.response?.data?.message || "Internal server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-pink-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Background Blur Overlay for 'show only login/blur background' effect */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-white/10 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 px-4 py-8">
        <div className="bg-white/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-8 border border-white/50">
          {/* Header */}
          <div className="text-center mb-6">
            <h4 className="text-2xl font-bold text-gray-800">Forgot Password?</h4>
            <p className="text-gray-500 text-sm">
              Enter your email address and we'll send you an OTP to reset your password.
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-100 text-green-700 text-center px-3 py-2 rounded-lg mb-4">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errors && (
            <div className="bg-red-100 text-red-700 flex items-center gap-2 px-3 py-2 rounded-lg mb-4">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{errors}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={resetPasswordHandler} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="text-center mt-4">
            <small className="text-gray-500">
              Remember your password? 
              <span
                onClick={() => navigate("/login")}
                className="text-blue-500 font-semibold cursor-pointer ml-1 hover:underline"
              >
                Sign in here
              </span>
            </small>
          </div>

          {/* Info Section */}
          <div className="mt-6 grid grid-cols-3 text-center text-gray-500 text-sm gap-4">
            <div className="flex flex-col items-center">
              <i className="fas fa-shield-alt text-2xl mb-1"></i>
              <span>Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <i className="fas fa-clock text-2xl mb-1"></i>
              <span>Fast</span>
            </div>
            <div className="flex flex-col items-center">
              <i className="fas fa-envelope text-2xl mb-1"></i>
              <span>Email Based</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
