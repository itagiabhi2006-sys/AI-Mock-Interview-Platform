import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  ChevronDown,
  LogOut,
  Settings,
  User,
  Menu,
  X,
  Briefcase,
  BarChart3,
  MessageSquare,
  Info,
  Video, // 👈 Added for "Videos Recorded"
  Shield, // 👈 Added for Admin Panel
} from "lucide-react";
import api from "../Api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  // ✅ Added "Session Logs" (Videos Recorded) button here
  const navLinks = [
    { to: "/interviews", label: "Interviews", icon: Briefcase },
    { to: "/analysis", label: "Analysis", icon: BarChart3 },
    { to: "/analysis2", label: "Analysis2", icon: BarChart3 },
    { to: "/videos-recorded", label: "Session Logs", icon: Video }, // 👈 new link
    { to: "/about", label: "About", icon: Info },
    { to: "/contact", label: "Contact", icon: MessageSquare },
  ];

  // Only show Admin Panel if user is an admin
  // You may need to adjust this depending on how your backend sends roles in the user object
  if (user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN' || (user.roles && (user.roles.includes('ADMIN') || user.roles.includes('ROLE_ADMIN'))))) {
    navLinks.push({ to: "/admin", label: "Admin Panel", icon: Shield });
  }

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left Section - Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center w-11 h-11 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <span className="text-white font-bold text-lg">AI</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-5">
                    InterviewAI
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Mock Platform
                  </span>
                </div>
              </Link>
            </div>

            {/* Center Section - Navigation Links (Desktop) */}
            {user && (
              <div className="hidden md:flex items-center space-x-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-200 group"
                    >
                      <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Right Section - Navigation & User Menu */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {/* Mobile Menu Toggle */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                  >
                    {mobileMenuOpen ? (
                      <X className="h-5 w-5 text-gray-700" />
                    ) : (
                      <Menu className="h-5 w-5 text-gray-700" />
                    )}
                  </button>

                  {/* Desktop User Menu */}
                  <div className="hidden md:block relative" ref={menuRef}>
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200 group"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-sm opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center w-9 h-9 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-md group-hover:shadow-lg transition-all duration-200">
                          <span className="text-white text-sm font-bold">
                            {user.firstName?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      </div>

                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-semibold text-gray-900 leading-none">
                          {user.firstName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {user.email?.split("@")[0]}
                        </p>
                      </div>

                      <ChevronDown
                        className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                          menuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-md">
                              <span className="text-white text-lg font-bold">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              navigate("/profile-view");
                            }}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50/50 transition-all duration-150 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors duration-150 mr-3">
                              <User className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium">Profile</p>
                              <p className="text-xs text-gray-500">
                                Manage your account
                              </p>
                            </div>
                          </button>
                        </div>

                        <div className="border-t border-gray-100 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 transition-all duration-150 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors duration-150 mr-3">
                              <LogOut className="h-4 w-4 text-red-600" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium">Sign Out</p>
                              <p className="text-xs text-red-500/70">
                                See you soon!
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Non-authenticated buttons
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200 px-4 py-2 rounded-xl hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link to="/register" className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 px-5 py-2 rounded-xl shadow-lg hover:shadow-xl">
                      Get Started
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {user && mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-200"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/profile-view");
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-200"
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/feedback");
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-200"
                >
                  <Settings className="h-5 w-5" />
                  <span>Feedback</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50/50 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
