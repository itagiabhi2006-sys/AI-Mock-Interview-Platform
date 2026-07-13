import { useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, Video, Sparkles } from "lucide-react";

export default function ModeSelect() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const handleSelect = (mode) => {
    navigate("/start-interview", { state: { ...state, mode } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 shadow-lg">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Choose Your Mode
          </h1>
          <p className="text-xl text-white/90 font-light">
            Select how you'd like to take your interview
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Text Interview Card */}
          <button
            onClick={() => handleSelect("text")}
            className="group relative bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Text Interview
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Type your responses at your own pace. Perfect for thoughtful, detailed answers.
              </p>
              
              <div className="flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                Start typing
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>

          {/* Video Interview Card */}
          <button
            onClick={() => handleSelect("video")}
            className="group relative bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                <Video className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Video Interview
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Face-to-face experience with real-time interaction. Showcase your communication skills.
              </p>
              
              <div className="flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                Go live
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Info Footer */}
        <div className="mt-12 text-center">
          <p className="text-white/80 text-sm">
            💡 You can switch modes anytime during your interview
          </p>
        </div>
      </div>
    </div>
  );
}