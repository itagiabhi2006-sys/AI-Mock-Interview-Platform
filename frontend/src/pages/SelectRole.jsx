import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SelectRole() {
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [topicsError, setTopicsError] = useState(null);

  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [includeAIGenerated, setIncludeAIGenerated] = useState(true);
  const [experienceLevel, setExperienceLevel] = useState("Fresher");
  const [difficultyLevel, setDifficultyLevel] = useState("Medium");

  const navigate = useNavigate();

  // Fetch topics from backend instead of hardcoding them
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoadingTopics(true);
        const response = await fetch("/api/dashboard/options");
        console.log("Fetching topics from /api/dashboard/options");
        if (!response.ok) {
          throw new Error(`Failed to fetch topics: ${response.status}`);
        }
        const data = await response.json();
        setTopics(data);

        // Default the select to the first topic once loaded
        if (data.length > 0) {
          setRole(data[0].name);
        } else {
          setRole("Other");
        }
      } catch (err) {
        console.error(err);
        setTopicsError("Could not load roles. Please try again.");
        setRole("Other");
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchTopics();
  }, []);

  const handleNext = () => {
    const finalRole = role === "Other" ? customRole : role;
    if (!finalRole.trim()) {
      alert("Please enter a valid role name!");
      return;
    }

    navigate("/select-mode", {
      state: {
        role: finalRole,
        totalQuestions,
        includeAIGenerated,
        experienceLevel,
        difficultyLevel,
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-pink-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Background Blur Overlay for glass effect */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-white/10 pointer-events-none"></div>

      <div className="relative z-10 bg-white/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/50 rounded-3xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
          🎯 Select Your Interview Preferences
        </h1>

        {/* Role Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
            <span className="text-lg">💼</span>
            Choose Role / Domain
          </label>

          {loadingTopics ? (
            <div className="w-full border-2 border-gray-200 p-3 rounded-lg text-gray-400">
              Loading roles...
            </div>
          ) : (
            <select
              className="w-full bg-white/50 backdrop-blur-md border border-white/50 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all shadow-sm hover:shadow-md text-gray-800 font-medium"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {topics.map((topic) => (
                <option key={topic.id} value={topic.name}>
                  {topic.name}
                </option>
              ))}
              
            </select>
          )}

          {topicsError && (
            <p className="text-red-500 text-sm mt-2">{topicsError}</p>
          )}

          {/* Custom Role Input */}
          {role === "Other" && (
            <input
              type="text"
              placeholder="Enter your own role"
              className="w-full bg-white/50 backdrop-blur-md border border-white/50 p-3 rounded-xl mt-3 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all shadow-sm hover:shadow-md text-gray-800 placeholder-gray-400 font-medium"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
            />
          )}
        </div>

        {/* Difficulty Level */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
            <span className="text-lg">⚡</span>
            Difficulty Level
          </label>
          <select
            className="w-full bg-white/50 backdrop-blur-md border border-white/50 p-3 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all shadow-sm hover:shadow-md text-gray-800 font-medium"
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(e.target.value)}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        {/* Number of Questions */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
            <span className="text-lg">📝</span>
            Number of Questions
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={totalQuestions}
            onChange={(e) => setTotalQuestions(Number(e.target.value))}
            className="w-full bg-white/50 backdrop-blur-md border border-white/50 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all shadow-sm hover:shadow-md text-gray-800 font-medium"
          />
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={loadingTopics}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Next ➡️
        </button>
      </div>
    </div>
  );
}