import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Award,
  BookOpen,
  Target,
} from "lucide-react";
import api from "../Api";

export default function InterviewHistory() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    api.get("/api/interview/history").then((res) => {
      const sortedSessions = res.data.sort(
        (a, b) => new Date(b.startedAt) - new Date(a.startedAt)
      );
      setSessions(sortedSessions);
      if (sortedSessions.length > 0) {
        setSelectedSession(sortedSessions[0]);
      }
    });
  }, []);

  // Prepare chart data
  const performanceData = sessions.map((session, idx) => ({
    session: `S${idx + 1}`,
    score: Number((session.averageScore || 0).toFixed(2)),
    date: new Date(session.startedAt).toLocaleDateString(),
  }));

  const getSkillsData = () => {
    if (!selectedSession?.feedbackList) return [];

    const skills = {};
    selectedSession.feedbackList.forEach((feedback) => {
      const category = feedback.question?.category || "General";
      if (!skills[category]) skills[category] = [];
      skills[category].push(feedback.score || 0);
    });

    return Object.keys(skills).map((category) => ({
      category,
      score: Number(
        (
          skills[category].reduce((a, b) => a + b, 0) /
          skills[category].length
        ).toFixed(2)
      ),
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="w-full relative overflow-hidden py-12 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">Interview History</h1>
        <p className="text-gray-600 mt-2">
          Track your progress and review past sessions
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* Performance Overview */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Sessions */}
            <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] rounded-3xl border border-white/80 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {sessions.length}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] rounded-3xl border border-white/80 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Number(
                      (
                        sessions.reduce(
                          (acc, s) => acc + (s.averageScore || 0),
                          0
                        ) / sessions.length
                      ).toFixed(2)
                    ) || 0}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Latest Score */}
            <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] rounded-3xl border border-white/80 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Latest Score</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {sessions[0]?.averageScore
                      ? Number(sessions[0].averageScore.toFixed(2))
                      : "N/A"}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] border border-white/80 rounded-3xl p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Sessions
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                      selectedSession?.id === session.id
                        ? "bg-indigo-50/50 border-indigo-400 shadow-md"
                        : "bg-white/50 border-transparent hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-gray-900">
                        {session.role || "Interview"}
                      </div>
                      <div
                        className={`text-lg font-bold ${getScoreColor(
                          session.averageScore
                        )}`}
                      >
                        {session.averageScore
                          ? Number(session.averageScore.toFixed(2))
                          : "—"}
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(session.startedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <div className="space-y-6">
                {/* Session Overview */}
                <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] border border-white/80 rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedSession.role || "Interview Session"}
                    </h2>
                    <div
                      className={`px-4 py-2 rounded-full font-bold text-2xl ${getScoreBg(
                        selectedSession.averageScore
                      )}`}
                    >
                      <span
                        className={getScoreColor(selectedSession.averageScore)}
                      >
                        {selectedSession.averageScore
                          ? Number(selectedSession.averageScore.toFixed(2))
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Target className="w-5 h-5 text-green-600 mr-2" />
                        <h4 className="font-semibold text-green-900">
                          Strengths
                        </h4>
                      </div>
                      <p className="text-sm text-green-800">
                        {selectedSession.strengths || " "}
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-blue-900">
                          Areas to Improve
                        </h4>
                      </div>
                      <p className="text-sm text-blue-800">
                        {selectedSession.improvements ||
                          "Not yet generated"}
                      </p>
                    </div>
                  </div>

                  {selectedSession.feedbackSummary && (
                    <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">
                        Overall Feedback
                      </h4>
                      <p className="text-sm text-purple-800">
                        {selectedSession.feedbackSummary}
                      </p>
                    </div>
                  )}
                </div>

                {/* Questions & Feedback */}
                <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] border border-white/80 rounded-3xl p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Questions & Feedback
                  </h3>
                  <div className="space-y-4">
                    {selectedSession.feedbackList?.map((feedback, idx) => (
                      <div
                        key={idx}
                        className="bg-white/80 border border-white shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-bold mr-2">
                                Q{idx + 1}
                              </span>
                              <span className="font-semibold text-gray-900">
                                {feedback.question?.text || "No question text"}
                              </span>
                            </div>
                          </div>
                          {feedback.score && (
                            <div
                              className={`ml-4 px-3 py-1 rounded-full font-bold ${getScoreBg(
                                feedback.score
                              )}`}
                            >
                              <span
                                className={getScoreColor(feedback.score)}
                              >
                                {Number(feedback.score.toFixed(2))}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mb-3 pl-4 border-l-4 border-blue-200">
                          <span className="text-xs font-semibold text-gray-600 uppercase">
                            Your Answer
                          </span>
                          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                            {feedback.answerTranscript || "No answer"}
                          </p>
                        </div>

                        <div className="pl-4 border-l-4 border-purple-200 mb-3">
                          <span className="text-xs font-semibold text-gray-600 uppercase">
                            AI Feedback
                          </span>
                          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                            {feedback.aiComments || "No comments yet"}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(
                                feedback.answerTranscript
                              )
                            }
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Copy Answer
                          </button>
                          <button
                            onClick={() => alert(feedback.aiComments)}
                            className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            View Full Feedback
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] border border-white/80 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                <BookOpen className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  Select a session to view details
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section Moved Below Main Content */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Performance Trend */}
            <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] rounded-3xl border border-white/80 p-8 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Performance Trend
              </h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="session" stroke="#6b7280" tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" domain={[0, 100]} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.5)",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="url(#colorScore)"
                      strokeWidth={4}
                      dot={{ fill: "#6366f1", r: 6, strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Skills Breakdown */}
            {selectedSession && getSkillsData().length > 0 && (
              <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] rounded-3xl border border-white/80 p-8 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Skills Breakdown
                </h3>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {getSkillsData().length <= 2 ? (
                      <BarChart data={getSkillsData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="category" stroke="#6b7280" tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b7280" domain={[0, 100]} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.5)",
                            borderRadius: "12px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          }}
                          cursor={{ fill: 'transparent' }}
                        />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={60}>
                          {getSkillsData().map((entry, index) => (
                            <cell key={`cell-${index}`} fill={index % 2 === 0 ? "#8b5cf6" : "#ec4899"} />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <RadarChart data={getSkillsData()}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="category" stroke="#4b5563" fontWeight="600" />
                        <PolarRadiusAxis domain={[0, 100]} stroke="#9ca3af" axisLine={false} tick={false} />
                        <Radar
                          dataKey="score"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          fill="#c084fc"
                          fillOpacity={0.4}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.5)",
                            borderRadius: "12px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          }}
                        />
                      </RadarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
