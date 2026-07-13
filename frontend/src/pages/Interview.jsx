import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as faceapi from "face-api.js";
import api from "../Api";
import QuestionCard from "../components/QuestionCard";

export default function Interview() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [waitingForFeedback, setWaitingForFeedback] = useState(false); // NEW: Track feedback state

  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [emotionData, setEmotionData] = useState({
    eyeContact: 0,
    headTilt: 0,
    expressions: [],
    faceDetected: false
  });
  const [isListening, setIsListening] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [recognitionQuality, setRecognitionQuality] = useState("good");

  const navigate = useNavigate();
  const { state } = useLocation();
  const fetched = useRef(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const emotionIntervalRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  
  const finalTranscriptRef = useRef("");
  const isRecognitionActiveRef = useRef(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // Load face-api models
  const loadFaceApiModels = async () => {
    try {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      console.log("Face-api models loaded");
    } catch (error) {
      console.error("Error loading face-api models:", error);
    }
  };

  useEffect(() => { 
    loadFaceApiModels(); 
  }, []);

  // Start interview
  useEffect(() => {
    if (!fetched.current) {
      fetched.current = true;

      api.post("/api/interview/start", {
        role: state?.role ?? "Java Developer",
        totalQuestions: state?.totalQuestions ?? 5,
        includeAIGenerated: state?.includeAIGenerated ?? true,
        mode: state?.mode ?? "text",
        difficultyLevel: state?.difficultyLevel ?? "medium",
        experienceLevel: state?.experienceLevel ?? "1 year",
      })
        .then(res => {
          if (res.data.sessionId && res.data.questions) {
            setSessionId(res.data.sessionId);
            setQuestions(res.data.questions);
          } else {
            setQuestions(res.data);
          }
          setLoading(false);
          
          if (state?.mode === "video") {
            setTimeout(() => startVideoRecording(), 500);
          }
        })
        .catch(err => {
          console.error("Error starting interview:", err);
          setLoading(false);
        });
    }
    
    return () => {
      stopVideoRecording();
    };
  }, [state]);

  // --- VIDEO RECORDING + EMOTION DETECTION ---
  const startVideoRecording = async () => {
    try {
      setCameraError(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: "user" 
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });
      
      streamRef.current = stream;
      
      initializeAudioAnalysis(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().then(resolve).catch(err => {
                console.log("Video play error:", err);
                resolve();
              });
            };
          }
        });
      }

      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'video/webm;codecs=vp8,opus' 
      });
      
      mediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          videoChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.start(100);
      setIsRecording(true);

      startEmotionDetection();
      initializeSpeechRecognition();
      
    } catch (err) {
      console.error("Error accessing camera/microphone:", err);
      setCameraError(true);
      alert("Please allow camera and microphone access for video interview");
    }
  };

  const initializeAudioAnalysis = (stream) => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
    } catch (error) {
      console.error("Audio analysis initialization failed:", error);
    }
  };

  const startEmotionDetection = () => {
    if (emotionIntervalRef.current) {
      clearInterval(emotionIntervalRef.current);
    }

    emotionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) {
        return;
      }

      try {
        const detection = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ 
            inputSize: 224, 
            scoreThreshold: 0.4 
          })
        ).withFaceLandmarks().withFaceExpressions();

        if (detection && detection.detection.score >= 0.4) {
          const expressions = detection.expressions;
          const dominantExpression = Object.keys(expressions).reduce((a, b) =>
            expressions[a] > expressions[b] ? a : b
          );

          const leftEye = detection.landmarks.getLeftEye();
          const rightEye = detection.landmarks.getRightEye();
          const nose = detection.landmarks.getNose();
          
          const eyeMidX = (leftEye[0].x + rightEye[3].x) / 2;
          const noseX = nose[3].x;
          const eyeContactPercent =
            100 - Math.min(100, Math.abs(noseX - eyeMidX) / (rightEye[3].x - leftEye[0].x) * 100);

          const dy = rightEye[3].y - leftEye[0].y;
          const dx = rightEye[3].x - leftEye[0].x;
          const headTiltAngle = Math.atan2(dy, dx) * 180 / Math.PI;

          setEmotionData(prev => ({
            expressions: [...prev.expressions.slice(-49), dominantExpression],
            eyeContact: eyeContactPercent,
            headTilt: headTiltAngle,
            faceDetected: true
          }));
        } else {
          setEmotionData(prev => ({
            ...prev,
            faceDetected: false,
            eyeContact: 0,
            headTilt: 0
          }));
        }
      } catch (error) {
        console.error("Emotion detection error:", error);
      }
    }, 500);
  };

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechError("Speech recognition not supported in this browser");
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 5;
      recognition.continuous = true;

      let consecutiveErrors = 0;

      recognition.onstart = () => {
        console.log("Speech recognition started with optimized settings");
        setSpeechError("");
        setIsListening(true);
        isRecognitionActiveRef.current = true;
        consecutiveErrors = 0;
        setRecognitionQuality("good");
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;
          
          if (result.isFinal) {
            if (confidence > 0.7) {
              finalTranscriptRef.current += transcript + ' ';
              setRecognitionQuality("good");
            } else if (confidence > 0.4) {
              finalTranscriptRef.current += `[${transcript}] `;
              setRecognitionQuality("fair");
            } else {
              setRecognitionQuality("poor");
            }
          } else {
            interimTranscript += transcript;
          }
        }

        const displayText = finalTranscriptRef.current + interimTranscript;
        setCurrentAnswer(displayText);

        consecutiveErrors = 0;

        speechTimeoutRef.current = setTimeout(() => {
          console.log("Speech gap detected, but continuing to listen...");
        }, 3000);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isRecognitionActiveRef.current = false;
        consecutiveErrors++;
        
        if (consecutiveErrors > 2) {
          setRecognitionQuality("poor");
        }

        switch (event.error) {
          case 'no-speech':
            console.log("No speech detected - check microphone or speak louder");
            setSpeechError("No speech detected. Please speak clearly and ensure your microphone is working.");
            break;
          case 'audio-capture':
            setSpeechError("No microphone found. Please check your microphone connection.");
            break;
          case 'not-allowed':
            setSpeechError("Microphone permission denied. Please allow microphone access in your browser settings.");
            break;
          case 'network':
            setSpeechError("Network error. Please check your internet connection.");
            break;
          case 'service-not-allowed':
            setSpeechError("Speech recognition service not available.");
            break;
          case 'bad-grammar':
            setSpeechError("Speech recognition grammar error.");
            break;
          case 'language-not-supported':
            setSpeechError("English language not supported for speech recognition.");
            break;
          default:
            setSpeechError(`Recognition error: ${event.error}. Please try again.`);
        }
        
        const restartDelay = Math.min(1000 * consecutiveErrors, 5000);
        if (isListening && ['no-speech', 'audio-capture', 'network'].includes(event.error)) {
          setTimeout(() => {
            if (recognitionRef.current && isListening && !isRecognitionActiveRef.current) {
              try {
                console.log(`Auto-restarting speech recognition after ${restartDelay}ms`);
                recognitionRef.current.start();
              } catch (e) {
                console.error("Error restarting speech recognition:", e);
              }
            }
          }, restartDelay);
        }
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        isRecognitionActiveRef.current = false;
        
        if (isListening) {
          setTimeout(() => {
            if (recognitionRef.current && isListening && !isRecognitionActiveRef.current) {
              try {
                console.log("Auto-restarting speech recognition after end");
                recognitionRef.current.start();
              } catch (e) {
                console.error("Error restarting speech recognition:", e);
                setIsListening(false);
                setSpeechError("Failed to maintain speech recognition");
              }
            }
          }, 100);
        }
      };

      recognition.onsoundstart = () => {
        console.log("Sound detected - speech recognition active");
        setRecognitionQuality("good");
      };

      recognition.onsoundend = () => {
        console.log("Sound ended - waiting for more speech");
      };

      recognition.onspeechstart = () => {
        console.log("Speech started");
        setRecognitionQuality("good");
      };

      recognition.onspeechend = () => {
        console.log("Speech ended - continuing to listen");
      };

      recognitionRef.current = recognition;
      
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      setSpeechError("Failed to initialize speech recognition. Please refresh the page.");
    }
  };

  const improveRecognitionQuality = () => {
    setSpeechError("");
    setRecognitionQuality("good");
    alert("For better speech recognition:\n\n• Speak clearly and at a moderate pace\n• Ensure good microphone placement\n• Reduce background noise\n• Use a quiet environment\n• Keep a consistent distance from microphone");
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not available in your browser. Please use Chrome for best results.');
      return;
    }
    
    try {
      if (isListening) {
        console.log("Stopping speech recognition...");
        recognitionRef.current.stop();
        setIsListening(false);
        isRecognitionActiveRef.current = false;
        setSpeechError("");
        
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
      } else {
        if (isRecognitionActiveRef.current) {
          console.log("Speech recognition already active, skipping start");
          return;
        }
        
        console.log("Starting speech recognition with enhanced settings...");
        setCurrentAnswer("");
        finalTranscriptRef.current = "";
        setRecognitionQuality("good");
        
        try {
          recognitionRef.current.start();
          setIsListening(true);
          setSpeechError("");
        } catch (startError) {
          console.error("Error starting speech recognition:", startError);
          if (startError.name === 'InvalidStateError') {
            setIsListening(true);
            isRecognitionActiveRef.current = true;
          } else {
            setSpeechError("Error starting speech recognition. Please check microphone permissions.");
          }
        }
      }
    } catch (error) {
      console.error('Speech recognition toggle error:', error);
      if (error.name === 'InvalidStateError') {
        setIsListening(true);
        isRecognitionActiveRef.current = true;
      } else {
        setSpeechError("Error toggling speech recognition");
      }
    }
  };

  const clearAnswer = () => {
    if (isListening && recognitionRef.current) {
      try {
        if (isRecognitionActiveRef.current) {
          recognitionRef.current.stop();
        }
        setIsListening(false);
        isRecognitionActiveRef.current = false;
      } catch (error) {
        console.error("Error stopping recognition during clear:", error);
      }
    }
    
    setCurrentAnswer("");
    finalTranscriptRef.current = "";
    setSpeechError("");
    setRecognitionQuality("good");
    
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    
    console.log("All text cleared - starting fresh");
  };

  const stopVideoRecording = () => {
    if (emotionIntervalRef.current) {
      clearInterval(emotionIntervalRef.current);
      emotionIntervalRef.current = null;
    }
    
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    
    if (recognitionRef.current && isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('Error stopping media recorder:', error);
      }
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    setIsRecording(false);
    setIsListening(false);
    isRecognitionActiveRef.current = false;
  };

  // FIXED: Improved handleNextQuestion to properly wait for feedback
  const handleNextQuestion = (answer) => {
    const cleanAnswer = answer.trim();
    if (!cleanAnswer) {
      alert("Please provide an answer before proceeding");
      return;
    }

    const currentQuestion = questions[current];
    const isLastQuestion = current === questions.length - 1;
    const newResult = { 
      questionText: currentQuestion.text, 
      aiComments: null, 
      score: null 
    };

    setResults(prev => [...prev, newResult]);

    if (!sessionId) {
      console.error("No session ID available");
      return;
    }

    if (isListening) {
      toggleListening();
    }

    // NEW: Set waiting state to show loader immediately
    setWaitingForFeedback(true);

    api.post(`/api/interview/submit/${sessionId}`, { 
      questionId: currentQuestion.id, 
      answer: cleanAnswer 
    })
      .then(res => {
        const feedback = res.data;
        setResults(prev => {
          const updated = prev.map((r, i) =>
            i === current ? { ...r, aiComments: feedback.aiComments, score: feedback.score } : r
          );

          if (isLastQuestion) {
            console.log("✅ All feedback received:", updated);
            // Now proceed to finish the interview
            finishInterview(updated);
          } else {
            // Move to next question and reset states
            setCurrent(prev => prev + 1);
            setCurrentAnswer("");
            finalTranscriptRef.current = "";
            setSpeechError("");
            setRecognitionQuality("good");
            setWaitingForFeedback(false); // Reset waiting state
            
            // Restart speech recognition for next question if needed
            if (isListening && recognitionRef.current && !isRecognitionActiveRef.current) {
              setTimeout(() => {
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.start();
                  } catch (error) {
                    console.error("Error restarting speech recognition for next question:", error);
                  }
                }
              }, 500);
            }
          }

          return updated;
        });
      })
      .catch(err => {
        console.error("Error submitting answer:", err);
        alert("Error submitting answer. Please try again.");
        setWaitingForFeedback(false); // Reset on error too
      });
  };

  const finishInterview = (finalResults) => {
    setFinishing(true); // Show finishing loader
    stopVideoRecording();
    
    if (state?.mode === "video" && videoChunksRef.current.length > 0) {
      const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('videoFile', videoBlob, `interview_${sessionId}.webm`);
      formData.append('emotionData', JSON.stringify(emotionData));

      api.post(`/api/interview/video/${sessionId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then(() => console.log("Video + emotion uploaded"))
        .catch(err => console.error("Video upload failed", err));
    }

    api.post(`/api/interview/finish/${sessionId}`)
      .then(() => {
        navigate("/feedback", { 
          state: { 
            results: finalResults, 
            emotionData: state?.mode === "video" ? emotionData : null 
          } 
        });
      })
      .catch(err => {
        console.error("Error finishing interview:", err);
        setFinishing(false); // Reset if error occurs
      });

    setSessionId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-24 space-y-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 blur-lg opacity-70 animate-pulse"></div>
          <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-semibold text-xl animate-bounce">AI</span>
          </div>
        </div>
        <p className="text-base font-medium text-gray-700">
          Loading questions<span className="animate-pulse">...</span>
        </p>
        <p className="text-xs text-gray-500 italic">
          Intelligent setup in progress
        </p>
      </div>
    );
  }

  // NEW: Show waiting loader when waiting for feedback
  if (waitingForFeedback) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 blur-lg opacity-70 animate-pulse"></div>
          <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-semibold text-lg animate-bounce">AI</span>
          </div>
        </div>
        <p className="text-base font-medium text-gray-700">
          Analyzing your answer<span className="animate-pulse">...</span>
        </p>
        <p className="text-xs text-gray-500 italic">
          Generating feedback & insights
        </p>
      </div>
    );
  }

  if (finishing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 blur-lg opacity-70 animate-pulse"></div>
          <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-semibold text-lg animate-bounce">AI</span>
          </div>
        </div>
        <p className="text-base font-medium text-gray-700">
          Processing your final feedback<span className="animate-pulse">...</span>
        </p>
        <p className="text-xs text-gray-500 italic">
          Generating insights & preparing your summary
        </p>
      </div>
    );
  }

  if (!questions.length) {
    return <p className="text-center mt-10 text-lg">No questions found.</p>;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {state?.mode === "video" ? (
        <div className="flex gap-4">
          {/* Left side: camera + metrics */}
          <div className="w-[448px] flex-shrink-0">
            <h2 className="text-2xl font-bold text-indigo-700 mb-3">🎥 Video Interview</h2>
            
            <div className="relative w-full h-[336px] rounded-lg shadow-lg border-2 border-indigo-200 mb-4 bg-gray-100 overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                  <p className="text-red-600 text-center p-4">
                    Camera access denied. Please allow camera permissions and refresh the page.
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl shadow-sm border border-indigo-100 mb-4">
              <h4 className="text-sm font-semibold text-indigo-700 mb-3 uppercase tracking-wide">
                Live Metrics
              </h4>
              <div className="flex flex-col gap-3">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">👁️</span>
                      <span className="text-sm font-medium text-gray-600">Eye Contact</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
                          style={{ width: `${Math.min(100, emotionData.eyeContact)}%` }}
                        ></div>
                      </div>
                      <span className="text-base font-bold text-green-600">
                        {emotionData.eyeContact.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🧑‍🦱</span>
                      <span className="text-sm font-medium text-gray-600">Head Tilt</span>
                    </div>
                    <span className="text-base font-bold text-blue-600">
                      {emotionData.headTilt.toFixed(1)}°
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">😊</span>
                      <span className="text-sm font-medium text-gray-600">Expression</span>
                    </div>
                    <span className="text-base font-bold text-purple-600 capitalize">
                      {emotionData.expressions[emotionData.expressions.length - 1] || "neutral"}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎤</span>
                      <span className="text-sm font-medium text-gray-600">Voice Recognition</span>
                    </div>
                    <span className={`text-base font-bold ${
                      recognitionQuality === "good" ? "text-green-600" :
                      recognitionQuality === "fair" ? "text-yellow-600" : "text-red-600"
                    } capitalize`}>
                      {recognitionQuality}
                    </span>
                  </div>
                  {recognitionQuality !== "good" && (
                    <button
                      onClick={improveRecognitionQuality}
                      className="w-full mt-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                    >
                      Tips to improve
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {!emotionData.faceDetected && isRecording && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                <p className="text-yellow-700 text-base text-center">
                  ⚠️ Face not detected - Ensure good lighting
                </p>
              </div>
            )}

            {speechError && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="text-red-600 text-base text-center">{speechError}</p>
              </div>
            )}
          </div>

          {/* Right side: Q&A */}
          <div className="flex-1">
            <div className="mb-5">
              <span className="text-base text-gray-600">
                Question {current + 1} of {questions.length}
              </span>
              <h3 className="text-3xl font-bold text-gray-800 mt-2 mb-5">
                {questions[current].text}
              </h3>
            </div>

            <div className="relative">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="w-full h-[268px] p-5 border border-gray-300 rounded-lg mb-5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base resize-none"
                placeholder={isListening ? "Speak now... Your speech will appear here..." : "Your answer will appear here as you speak or type..."}
              />
              {isListening && (
                <div className="absolute bottom-8 right-4 flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-xs text-red-500 font-medium ml-1">Recording</span>
                </div>
              )}
            </div>

            <div className="flex gap-4 mb-5">
              <button
                onClick={toggleListening}
                className={`flex-1 py-4 rounded-lg font-semibold text-base transition-colors flex items-center justify-center gap-2 ${
                  isListening
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isListening ? (
                  <>
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    ⏸️ Stop Recording
                  </>
                ) : (
                  "🎤 Start Recording"
                )}
              </button>
              <button
                onClick={clearAnswer}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold text-base hover:bg-gray-300 transition-colors"
              >
                Clear Answer
              </button>
            </div>

            <button
              onClick={() => handleNextQuestion(currentAnswer)}
              disabled={!currentAnswer.trim()}
              className="w-full py-4 bg-indigo-600 text-white rounded-lg font-semibold text-base hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {current === questions.length - 1 ? "Finish Interview" : "Next Question →"}
            </button>
          </div>
        </div>
      ) : (
        <QuestionCard
          question={questions[current]}
          index={current}
          onSubmit={(answer) => handleNextQuestion(answer)}
        />
      )}
    </div>
  );
}