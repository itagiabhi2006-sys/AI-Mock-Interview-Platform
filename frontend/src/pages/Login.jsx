import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Mail,
  Lock,
  Key,
  LogIn,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  Brain,
  Sparkles,
} from "lucide-react";
import api from "../Api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleForget = () => navigate("/forget-password");
  const handleRegister = () => navigate("/register");
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };
  const handleGithubLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/github";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/login", { email, passwords });
      login(res.data);
      await api.get("/me");
      setToastMessage(res.data.message || "Logged in successfully 🎉");
      setError("");
      localStorage.setItem("loggedIn", "true");
    } catch (err) {
      setError(err.response?.data?.message || "Internal Server Error");
    } finally {
      setIsLoading(false);
    }
  };

  // 🕒 Redirect after 3 seconds of toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, navigate]);

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
            <div className="relative inline-block mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-60 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto shadow-lg">
                <Brain className="text-white w-7 h-7" />
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
              Welcome Back
            </h3>
            <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Sign in to continue your AI interview journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 hover:bg-white transition-all text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 hover:bg-white transition-all text-sm"
                  value={passwords}
                  onChange={(e) => setPasswords(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={handleForget}
                className="text-indigo-600 text-xs hover:text-indigo-700 font-medium"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-2 text-gray-400 text-[11px] font-medium">
              OR CONTINUE WITH
            </span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 border-2 border-gray-200 rounded-lg py-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-sm"
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Google
            </button>

            <button
              onClick={handleGithubLogin}
              className="flex items-center justify-center gap-2 border-2 border-gray-200 rounded-lg py-2 hover:border-gray-400 hover:bg-gray-50 transition-all text-sm"
            >
              <img
                src="https://www.svgrepo.com/show/475654/github-color.svg"
                alt="GitHub"
                className="w-5 h-5"
              />
              GitHub
            </button>
          </div>

          {/* Register Section */}
          <div className="text-center border-t border-gray-200 pt-4">
            <p className="text-gray-600 text-xs mb-2">Don’t have an account?</p>
            <button
              onClick={handleRegister}
              className="w-full border-2 border-indigo-500 text-indigo-600 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-all font-semibold flex items-center justify-center gap-2 text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-[10px] text-gray-500">
            © 2024 InterviewAI Platform. All rights reserved.
          </p>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in-0">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 min-w-[250px] text-sm">
            <CheckCircle className="w-4 h-4" />
            <span className="flex-1">{toastMessage}</span>
            <button
              onClick={() => setToastMessage("")}
              className="text-white/80 hover:text-white font-bold text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
