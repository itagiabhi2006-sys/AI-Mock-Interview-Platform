import React, { useEffect, useState } from "react";
import api from "../Api";

export default function AllVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await api.get("/api/interview/video"); // fetch all videos
      setVideos(res.data);
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueExpressions = (arr) => {
    if (!arr || arr.length === 0) return [];
    return [...new Set(arr)]; // remove duplicates
  };

  return (
    <div className="p-6">
      {/* 🔔 Notice at the top */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg mb-6 shadow-sm">
        <p className="text-sm md:text-base font-medium">
          ⏳ Please wait up to <span className="font-semibold">3 minutes</span> after completing your interview. 
          Your recorded video and analysis will appear here once processing is complete.
        </p>
      </div>

      {/* Loading or Empty State */}
      {loading ? (
        <p className="text-center mt-10 text-lg">Loading videos...</p>
      ) : !videos.length ? (
        <p className="text-center mt-10 text-lg">No videos found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => {
            const emotion = video.emotionData ? JSON.parse(video.emotionData) : null;
            const uniqueExpressions = emotion ? getUniqueExpressions(emotion.expressions) : [];

            const avgEyeContact = emotion?.eyeContact ?? 0;
            const avgConfidence = emotion?.headTilt ?? 0;

            return (
              <div key={video.id} className="bg-white shadow-md rounded-xl p-4">
                {/* Video */}
                <video
                  controls
                  src={video.mediaUrl || "https://res.cloudinary.com/demo/video/upload/sample.mp4"}
                  className="w-full max-w-md mx-auto rounded-lg mb-4 border"
                />

                {/* Recorded Timestamp */}
                {video.recordedAt && (
                  <p className="text-sm text-gray-500 mb-2">
                    Recorded: {new Date(video.recordedAt).toLocaleString()}
                  </p>
                )}

                {/* Emotion Metrics */}
                {emotion && (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-blue-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-600">Avg Eye Contact</p>
                      <p className="text-lg font-bold text-blue-600">{avgEyeContact.toFixed(1)}%</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-600">Avg Headtilt</p>
                      <p className="text-lg font-bold text-green-600">{avgConfidence.toFixed(1)}%</p>
                    </div>
                  </div>
                )}

                {/* Expressions */}
                {uniqueExpressions.length > 0 && (
                  <div className="bg-yellow-50 p-2 rounded-lg text-sm text-gray-800">
                    Expressions: {uniqueExpressions.join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
