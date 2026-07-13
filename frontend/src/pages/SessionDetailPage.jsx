import { useEffect, useState } from "react";
import api from "../Api";

export default function SessionDetailPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    // Fetch all sessions from history API
    api.get("api/interview/history")
      .then((res) => {
        console.log(res)
        const data = Array.isArray(res.data) ? res.data : [];
        setSessions(data);
        if (data.length > 0) setSelectedSession(data[0]); // select first by default
      })
      .catch((err) => {
        console.error("Failed to fetch sessions:", err);
      });
  }, []);

  // Compute summary info for selected session
  const summary = selectedSession
    ? {
        totalQuestions: selectedSession.feedbackList?.length || 0,
        answered: selectedSession.feedbackList?.filter(
          (f) => f.answerTranscript && f.answerTranscript.trim() !== ""
        ).length,
        unanswered: selectedSession.feedbackList?.filter(
          (f) => !f.answerTranscript || f.answerTranscript.trim() === ""
        ).length,
        averageScore:
          selectedSession.feedbackList?.reduce(
            (acc, f) => acc + (f.score || 0),
            0
          ) / (selectedSession.feedbackList?.length || 1),
      }
    : {};

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 py-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">📊 Session Details</h1>
          <p className="text-gray-600 text-lg">Review your interview performance and feedback</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Questions List */}
          <div className="lg:col-span-2 space-y-6">
            {selectedSession ? (
              <>
                <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] rounded-3xl p-8 border border-white/80">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {selectedSession.role}
                    </h2>
                    <span className="px-5 py-2.5 bg-indigo-100/80 text-indigo-700 rounded-2xl text-sm font-bold shadow-sm backdrop-blur-sm border border-indigo-200">
                      Session #{selectedSession.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>🕐 Started: {new Date(selectedSession.startedAt).toLocaleDateString()}</span>
                    {selectedSession.finishedAt && (
                      <span>✅ Finished: {new Date(selectedSession.finishedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {(selectedSession.feedbackList || []).map((feedback, idx) => (
                  <div
                    key={idx}
                    className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] rounded-3xl hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/80"
                  >
                    <div className="bg-gradient-to-r from-indigo-500/90 to-purple-600/90 p-5 backdrop-blur-md">
                      <h3 className="text-white font-bold text-xl flex items-center gap-2">
                        <span className="bg-white/20 px-3 py-1 rounded-xl text-sm">Q{idx + 1}</span>
                      </h3>
                    </div>

                    <div className="p-8 space-y-6">
                      {/* Question Text */}
                      <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
                        <p className="text-gray-900 font-medium text-lg">
                          {feedback.questionText || "No question text"}
                        </p>
                      </div>

                      {/* User Answer */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-bold text-indigo-700 bg-indigo-100/50 px-3 py-1 rounded-lg">💬 Your Answer</span>
                        </div>
                        <div className="bg-blue-50/40 p-5 rounded-2xl border border-blue-100/50">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {feedback.answerTranscript || "Not answered yet"}
                          </p>
                        </div>
                      </div>

                      {/* AI Comments */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-bold text-purple-700 bg-purple-100/50 px-3 py-1 rounded-lg">🤖 AI Feedback</span>
                        </div>
                        <div className="bg-purple-50/40 p-5 rounded-2xl border border-purple-100/50">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {feedback.aiComments || "No comments yet"}
                          </p>
                        </div>
                      </div>

                      {/* Score and Media */}
                      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Score</span>
                          {feedback.score !== null && feedback.score !== undefined ? (
                            <span className={`px-5 py-2 rounded-2xl font-extrabold text-xl shadow-sm ${getScoreColor(feedback.score)}`}>
                              {feedback.score.toFixed(1)} / 100
                            </span>
                          ) : (
                            <span className="px-5 py-2 bg-gray-100 text-gray-500 rounded-2xl font-semibold">
                              N/A
                            </span>
                          )}
                        </div>

                        {feedback.mediaUrl && (
                          <a
                            href={feedback.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                          >
                            <span>🎥</span> View Media
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] rounded-3xl p-16 text-center border border-white/80 min-h-[400px] flex flex-col justify-center items-center">
                <div className="text-7xl mb-6 opacity-80">📭</div>
                <p className="text-gray-500 text-xl font-medium">Select a session to view details</p>
              </div>
            )}
          </div>

          {/* Right Panel: Session Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_0_rgba(31,38,135,0.05)] rounded-3xl p-8 sticky top-8 border border-white/80">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <span className="text-2xl">📈</span> Session Summary
              </h2>

              {selectedSession ? (
                <div className="space-y-4">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 p-5 rounded-2xl text-center border border-blue-100/50">
                      <div className="text-4xl font-extrabold text-blue-600 mb-1">{summary.totalQuestions}</div>
                      <div className="text-sm text-blue-700 font-bold uppercase tracking-wider">Total</div>
                    </div>
                    <div className="bg-green-50/50 p-5 rounded-2xl text-center border border-green-100/50">
                      <div className="text-4xl font-extrabold text-green-600 mb-1">{summary.answered}</div>
                      <div className="text-sm text-green-700 font-bold uppercase tracking-wider">Answered</div>
                    </div>
                    <div className="bg-red-50/50 p-5 rounded-2xl text-center border border-red-100/50">
                      <div className="text-4xl font-extrabold text-red-500 mb-1">{summary.unanswered}</div>
                      <div className="text-sm text-red-600 font-bold uppercase tracking-wider">Missed</div>
                    </div>
                    <div className="bg-purple-50/50 p-5 rounded-2xl text-center border border-purple-100/50">
                      <div className="text-4xl font-extrabold text-purple-600 mb-1">
                        {summary.averageScore ? summary.averageScore.toFixed(0) : "N/A"}
                      </div>
                      <div className="text-sm text-purple-700 font-bold uppercase tracking-wider">Score</div>
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Session ID</span>
                      <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded-lg shadow-sm">#{selectedSession.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Role</span>
                      <span className="font-bold text-gray-900">{selectedSession.role}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Status</span>
                      <span className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm ${selectedSession.finishedAt ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {selectedSession.finishedAt ? "Completed" : "In Progress"}
                      </span>
                    </div>
                  </div>

                  {/* Session Selector */}
                  <div className="pt-4 border-t border-gray-100/50 mt-6">
                    <label className="text-sm font-bold text-gray-700 mb-3 block">
                      Switch Session
                    </label>
                    <select
                      className="w-full border-2 border-gray-200/50 rounded-2xl p-4 focus:border-indigo-500 focus:outline-none transition bg-white/80 font-medium text-gray-700 shadow-sm"
                      value={selectedSession.id}
                      onChange={(e) =>
                        setSelectedSession(
                          sessions.find((s) => s.id.toString() === e.target.value)
                        )
                      }
                    >
                      {sessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.role} - Session #{s.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-500">No session selected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}