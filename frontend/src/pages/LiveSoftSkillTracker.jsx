// // -------------------- EMOTION / FACE DETECTION --------------------
// import * as faceapi from "face-api.js";
// import { useRef, useState, useEffect } from "react";

// export default function Interview() {
//   const videoRef = useRef(null);
//   const [emotionData, setEmotionData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [hasDetectionStarted, setHasDetectionStarted] = useState(false);

//   // Load Models Once
//   useEffect(() => {
//     const loadModels = async () => {
//       try {
//         console.log("Loading face-api models...");
//         await Promise.all([
//           faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
//           faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
//           faceapi.nets.faceExpressionNet.loadFromUri("/models"),
//         ]);
//         console.log("✅ Models loaded successfully");
//         startVideo();
//       } catch (err) {
//         console.error("❌ Error loading models:", err);
//       }
//     };
//     loadModels();
//   }, []);

//   // Start webcam stream
//   const startVideo = () => {
//     navigator.mediaDevices
//       .getUserMedia({ video: true })
//       .then((stream) => {
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           console.log("🎥 Video stream started");
//         }
//       })
//       .catch((err) => {
//         console.error("❌ Error accessing webcam:", err);
//       });
//   };

//   // Start Detection Loop
//   useEffect(() => {
//     let interval;
//     const detectEmotions = async () => {
//       if (!videoRef.current || videoRef.current.readyState !== 4) return;

//       setHasDetectionStarted(true);
//       const detections = await faceapi
//         .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks()
//         .withFaceExpressions();

//       if (detections) {
//         const { expressions } = detections;
//         const dominant = Object.keys(expressions).reduce((a, b) =>
//           expressions[a] > expressions[b] ? a : b
//         );
//         setEmotionData({
//           faceDetected: true,
//           expression: dominant,
//           confidence: Math.round(expressions[dominant] * 100),
//         });
//       } else {
//         setEmotionData({ faceDetected: false });
//       }
//     };

//     const startDetection = () => {
//       if (!interval) {
//         console.log("🧠 Starting emotion detection loop...");
//         interval = setInterval(detectEmotions, 1000);
//         setLoading(false);
//       }
//     };

//     videoRef.current?.addEventListener("playing", startDetection);
//     return () => clearInterval(interval);
//   }, []);

//   // -------------------- UI --------------------
//   return (
//     <div className="flex flex-col items-center justify-center p-6">
//       <video
//         ref={videoRef}
//         autoPlay
//         muted
//         playsInline
//         width="420"
//         height="300"
//         className="border-2 border-indigo-300 rounded-2xl shadow-lg"
//       />

//       {/* Status messages */}
//       {loading && (
//         <div className="mt-4 text-indigo-600 animate-pulse text-sm">
//           🔍 Initializing face detection...
//         </div>
//       )}

//       {hasDetectionStarted && !emotionData?.faceDetected && (
//         <div className="mt-4 text-red-600 animate-pulse text-sm">
//           ⚠️ No face detected — ensure you are visible and well-lit.
//         </div>
//       )}

//       {emotionData?.faceDetected && (
//         <div className="mt-4 text-green-600 font-semibold text-sm">
//           😀 Face detected ({emotionData.expression}, {emotionData.confidence}%)
//         </div>
//       )}
//     </div>
//   );
// }
// -------------------- EMOTION / FACE DETECTION --------------------
import * as faceapi from "face-api.js";
import { useRef, useState, useEffect } from "react";

export default function Interview() {
  const videoRef = useRef(null);
  const streamRef = useRef(null); // holds the actual MediaStream across re-renders
  const intervalRef = useRef(null);
  const modelsLoadedRef = useRef(false);

  const [emotionData, setEmotionData] = useState(null);
  const [headPose, setHeadPose] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasDetectionStarted, setHasDetectionStarted] = useState(false);

  // Start webcam stream — stores the stream in a ref so it survives
  // even if the <video> element gets recreated by a parent re-render.
  const startVideo = async () => {
    try {
      // If we already have a live stream, just reattach it instead of
      // requesting the camera again.
      if (streamRef.current) {
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("🎥 Video stream started");
      }
    } catch (err) {
      console.error("❌ Error accessing webcam:", err);
    }
  };

  // Load Models Once (guarded so it never re-runs even under StrictMode
  // double-invoke or parent re-renders)
  useEffect(() => {
    const loadModels = async () => {
      if (modelsLoadedRef.current) return;
      try {
        console.log("Loading face-api models...");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ]);
        modelsLoadedRef.current = true;
        console.log("✅ Models loaded successfully");
      } catch (err) {
        console.error("❌ Error loading models:", err);
      }
    };
    loadModels().then(startVideo);

    // Cleanup: only stop the stream when Interview itself unmounts for
    // good (e.g. leaving the interview page entirely), not between
    // questions — this component should NOT be remounted per-question.
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Reattach the existing stream any time the <video> element itself
  // changes (covers the case where a parent still forces a remount).
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  });

  // Compute head tilt (roll) from eye landmarks.
  // Positive = head tilted toward the right shoulder, negative = left.
  const computeHeadTilt = (landmarks) => {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    // Average point of each eye cluster
    const avg = (pts) => ({
      x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
      y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
    });
    const leftCenter = avg(leftEye);
    const rightCenter = avg(rightEye);

    const dx = rightCenter.x - leftCenter.x;
    const dy = rightCenter.y - leftCenter.y;

    // Canvas/video y-axis increases DOWNWARD (opposite of normal math
    // convention), which is why this often comes out negative when you'd
    // intuitively expect positive. Negating dy corrects for that so the
    // sign matches real-world tilt direction (right ear toward right
    // shoulder = positive degrees).
    const angleRad = Math.atan2(-dy, dx);
    const angleDeg = angleRad * (180 / Math.PI);

    return Math.round(angleDeg * 10) / 10;
  };

  // Start Detection Loop
  useEffect(() => {
    const detectEmotions = async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      setHasDetectionStarted(true);
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections) {
        const { expressions, landmarks } = detections;
        const dominant = Object.keys(expressions).reduce((a, b) =>
          expressions[a] > expressions[b] ? a : b
        );
        setEmotionData({
          faceDetected: true,
          expression: dominant,
          confidence: Math.round(expressions[dominant] * 100),
        });
        setHeadPose({ tilt: computeHeadTilt(landmarks) });
      } else {
        setEmotionData({ faceDetected: false });
        setHeadPose(null);
      }
    };

    const startDetection = () => {
      if (!intervalRef.current) {
        console.log("🧠 Starting emotion detection loop...");
        intervalRef.current = setInterval(detectEmotions, 1000);
        setLoading(false);
      }
    };

    const videoEl = videoRef.current;
    videoEl?.addEventListener("playing", startDetection);

    // If the stream is already playing by the time this effect runs
    // (e.g. reattached from streamRef), kick off detection immediately
    // instead of waiting for a "playing" event that may never re-fire.
    if (videoEl && videoEl.readyState === 4) {
      startDetection();
    }

    return () => {
      videoEl?.removeEventListener("playing", startDetection);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // -------------------- UI --------------------
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="420"
        height="300"
        className="border-2 border-indigo-300 rounded-2xl shadow-lg"
      />

      {/* Status messages */}
      {loading && (
        <div className="mt-4 text-indigo-600 animate-pulse text-sm">
          🔍 Initializing face detection...
        </div>
      )}

      {hasDetectionStarted && !emotionData?.faceDetected && (
        <div className="mt-4 text-red-600 animate-pulse text-sm">
          ⚠️ No face detected — ensure you are visible and well-lit.
        </div>
      )}

      {emotionData?.faceDetected && (
        <div className="mt-4 text-green-600 font-semibold text-sm">
          😀 Face detected ({emotionData.expression}, {emotionData.confidence}%)
        </div>
      )}

      {headPose && (
        <div className="mt-2 text-gray-600 text-sm">
          🧭 Head tilt: {headPose.tilt}°{" "}
          {headPose.tilt > 5 ? "(tilted right)" : headPose.tilt < -5 ? "(tilted left)" : "(level)"}
        </div>
      )}
    </div>
  );
}