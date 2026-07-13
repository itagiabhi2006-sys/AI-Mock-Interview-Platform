import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../Api';

function ResetPassword() {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const otpRefs = useRef([]);

  // Check access and get email from sessionStorage
  useEffect(() => {
    const canAccess = sessionStorage.getItem("canAccessReset");
    const storedEmail = sessionStorage.getItem("resetEmail");

    if (!canAccess || !storedEmail) {
      navigate("/login");
      return;
    }

    setEmail(storedEmail);
  }, [navigate]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    otpRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors("");
    setSuccess("");

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setErrors("Please enter complete 6-digit OTP");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setErrors("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/reset-password", {
        newPassword,
        confirmPassword,
        otp: otpString,
        email,
      });
      setSuccess(res.data?.message || "Password reset successful!");
      sessionStorage.removeItem("canAccessReset");
      sessionStorage.removeItem("resetEmail");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrors(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrors("");
    setSuccess("");
    setIsLoading(true);
    
    try {
      await api.post("/forget-password", { email });
      setSuccess("OTP resent successfully!");
      setTimer(120);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setErrors(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-redo text-2xl"></i>
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mb-1">Reset Password</h4>
            <p className="text-gray-500 text-sm">Enter your OTP and new password</p>
          </div>

          {/* Success & Error Messages */}
          {success && (
            <div className="bg-green-100 text-green-700 flex items-center gap-2 px-3 py-2 rounded-lg mb-4">
              <i className="fas fa-check-circle"></i>
              <span>{success}</span>
            </div>
          )}
          {errors && (
            <div className="bg-red-100 text-red-700 flex items-center gap-2 px-3 py-2 rounded-lg mb-4">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{errors}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* OTP Inputs */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">OTP Code</label>
              <div className="flex justify-between mb-2 gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    maxLength="1"
                    inputMode="numeric"
                  />
                ))}
              </div>
              <small className="text-gray-500 text-sm">
                {canResend ? (
                  <span>
                    Didn't receive OTP?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-blue-500 font-semibold hover:underline ml-1"
                      disabled={isLoading}
                    >
                      Resend OTP
                    </button>
                  </span>
                ) : (
                  `You can resend OTP in ${formatTimer(timer)}`
                )}
              </small>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">New Password</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-blue-500">
                <span className="px-3 text-gray-500">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-2 py-2 outline-none"
                />
              </div>
              <small className="text-gray-400 text-sm">Minimum 6 characters</small>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Confirm Password</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-blue-500">
                <span className="px-3 text-gray-500">
                  <i className="fas fa-check"></i>
                </span>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-2 py-2 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Reset Password
                </>
              )}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-6 grid grid-cols-3 text-center text-gray-500 text-sm gap-4">
            <div className="flex flex-col items-center">
              <i className="fas fa-shield-alt text-xl mb-1"></i>
              <span>Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <i className="fas fa-clock text-xl mb-1"></i>
              <span>Fast Reset</span>
            </div>
            <div className="flex flex-col items-center">
              <i className="fas fa-envelope text-xl mb-1"></i>
              <span>Email Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
