import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Calendar, Shield, CheckCircle, AlertTriangle, Brain, Sparkles, LogIn, Eye, EyeOff } from "lucide-react";
import api from "../Api";

function Reg() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [passwords, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
    strengthText: "",
    strengthColor: ""
  });

  const navigate = useNavigate();

  const checkPasswordStrength = (passwords) => {
    let score = 0;
    let feedback = [];

    if (passwords.length >= 8) score += 1;
    else feedback.push("At least 8 characters");

    if (/[A-Z]/.test(passwords)) score += 1;
    else feedback.push("One uppercase letter");

    if (/[a-z]/.test(passwords)) score += 1;
    else feedback.push("One lowercase letter");

    if (/[0-9]/.test(passwords)) score += 1;
    else feedback.push("One number");

    if (/[^A-Za-z0-9]/.test(passwords)) score += 1;
    else feedback.push("One special character");

    let strengthText = "";
    let strengthColor = "";

    if (score === 5) {
      strengthText = "Very Strong";
      strengthColor = "green";
    } else if (score >= 4) {
      strengthText = "Strong";
      strengthColor = "blue";
    } else if (score >= 3) {
      strengthText = "Good";
      strengthColor = "yellow";
    } else {
      strengthText = "Weak";
      strengthColor = "red";
    }

    return {
      score,
      feedback: feedback.length ? `Missing: ${feedback.join(", ")}` : "All requirements met!",
      strengthText,
      strengthColor
    };
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword) {
      setPasswordStrength(checkPasswordStrength(newPassword));
    } else {
      setPasswordStrength({ score: 0, feedback: "", strengthText: "", strengthColor: "" });
    }
  };

  const validateDOB = (dateString) => {
    const today = new Date();
    const selectedDate = new Date(dateString);
    today.setHours(0, 0, 0, 0);

    if (selectedDate >= today) return "Date of birth must be in the past";

    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 13);
    if (selectedDate > minAgeDate) return "You must be at least 13 years old";

    return "";
  };

  const handleDOBChange = (e) => {
    const newDob = e.target.value;
    setDob(newDob);

    if (newDob) {
      const dobError = validateDOB(newDob);
      if (dobError) setErrors(prev => ({ ...prev, dob: dobError }));
      else setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.dob;
        return newErrors;
      });
    }
  };

  const getMaxDOB = () => new Date().toISOString().split("T")[0];

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    setIsLoading(true);

    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!gender) newErrors.gender = "Gender is required";
    if (!dob) newErrors.dob = "Date of birth is required";
    else {
      const dobError = validateDOB(dob);
      if (dobError) newErrors.dob = dobError;
    }
    if (!email.trim()) newErrors.email = "Email is required";
    if (!passwords) newErrors.passwords = "Password is required";
    else if (passwordStrength.score < 3) newErrors.passwords = "Please choose a stronger password";
    if (passwords !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post("/reg", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        dob,
        email: email.trim(),
        passwords,
      });

      setSuccessMessage("Registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const fieldErrors = {};
      if (error.response?.data?.message) {
        const msg = error.response.data.message.toLowerCase();
        if (msg.includes("email") && msg.includes("already")) fieldErrors.email = "Email is already registered";
        else fieldErrors.general = error.response.data.message;
      } else {
        fieldErrors.general = "Network or server error. Please try again.";
      }
      setErrors(fieldErrors);
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthBarColor = () => {
    switch (passwordStrength.strengthColor) {
      case "green": return "bg-green-500";
      case "blue": return "bg-blue-500";
      case "yellow": return "bg-yellow-500";
      case "red": return "bg-red-500";
      default: return "bg-gray-300";
    }
  };

  const getStrengthTextColor = () => {
    switch (passwordStrength.strengthColor) {
      case "green": return "text-green-600";
      case "blue": return "text-blue-600";
      case "yellow": return "text-yellow-600";
      case "red": return "text-red-600";
      default: return "text-gray-600";
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
      
      {/* Background Blur Overlay for 'show only register/blur background' effect */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-white/10 pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10 px-4 py-8">
        <div className="bg-white/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-8 border border-white/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-60 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
                <Brain className="text-white w-8 h-8" />
              </div>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h3>
            <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Join us to start your AI interview journey
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl mb-6 flex items-center gap-3 shadow-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* General Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleOnSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                    placeholder="Enter first name"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
                  </div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                    placeholder="Enter last name"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.lastName}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 ${
                    errors.gender ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.gender}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
                  </div>
                  <input
                    type="date"
                    value={dob}
                    onChange={handleDOBChange}
                    max={getMaxDOB()}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 ${
                      errors.dob ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.dob && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.dob}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwords}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                    placeholder="Create password"
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 ${
                      errors.passwords ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwords && (
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-medium">Password Strength:</span>
                      <span className={`font-semibold ${getStrengthTextColor()}`}>
                        {passwordStrength.strengthText}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthBarColor()}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">{passwordStrength.feedback}</p>
                  </div>
                )}
                {errors.passwords && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.passwords}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="Confirm password"
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full group mt-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Login Section */}
          <div className="text-center border-t border-gray-200 mt-6 pt-6">
            <p className="text-gray-600 text-sm mb-3">Already have an account?</p>
            <button
              onClick={() => navigate("/login")}
              disabled={isLoading}
              className="w-full border-2 border-indigo-500 text-indigo-600 py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-200 font-semibold flex items-center justify-center gap-2 group"
            >
              <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              Sign In
            </button>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            © 2024 InterviewAI Platform. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
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

export default Reg;