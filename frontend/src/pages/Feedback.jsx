import { useLocation, useNavigate } from "react-router-dom";

export default function Feedback() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const results = state?.results || [];


  console.log(results)
  if (!results.length)
    return (
      <div className="text-center mt-10">
        <p>No feedback available.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-green-600 mb-6">
        Interview Feedback
      </h1>

      {results.map((r, i) => (
        <div key={i} className="bg-white rounded-xl shadow p-5 mb-4">
          <h2 className="font-semibold text-lg mb-2">
            Q{i + 1}: {r.questionText}
          </h2>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">AI Feedback:</span> {r.aiComments}
          </p>
          <p className="text-blue-600 font-semibold">
             Score: {(r.score / 10).toFixed()} / 10
          </p>
        </div>
      ))}

      <div className="text-center mt-6">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Restart Interview
        </button>
      </div>
    </div>
  );
}
