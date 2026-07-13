import { useState, useEffect, useRef } from "react";

export default function QuestionCard({ question, index, onSubmit }) {
  const [answer, setAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => console.log("🎙️ Listening...");
    recognition.onspeechstart = () => console.log("🗣️ Speech detected!");
    recognition.onspeechend = () => console.log("🤐 Speech stopped (pause).");

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript + " ";
        else interim += transcript;
      }

      // Combine previously finalized text + current interim
      setAnswer(finalTranscript + interim);

      // Update stored final transcript separately
      if (final) setFinalTranscript((prev) => prev + final);
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      if (event.error === "no-speech" && isRecording) {
        console.log("⚠️ No speech detected, restarting...");
        recognition.start();
      }
    };

    recognition.onend = () => {
      console.log("🛑 Recognition ended.");
      // If user is still recording, restart automatically
      if (isRecording) {
        console.log("🔁 Restarting...");
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
  }, [finalTranscript, isRecording]);

  const toggleRecording = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert("SpeechRecognition not initialized!");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      console.log("🛑 Stopped listening");
    } else {
      setAnswer("");
      setFinalTranscript("");
      recognition.start();
      setIsRecording(true);
      console.log("🎤 Started listening");
    }
  };

  const handleNext = () => {
    if (!answer.trim()) {
      alert("Please speak or type your answer first!");
      return;
    }
    onSubmit(answer);
    setAnswer("");
    setFinalTranscript("");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-md mt-8">
      <h2 className="text-xl font-semibold mb-4">
        Question {index + 1}: {question.text}
      </h2>

      <textarea
        className="w-full border rounded-lg p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Speak or type your answer..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      <div className="flex gap-4 mt-4 items-center">
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Next
        </button>

        <button
          onClick={toggleRecording}
          className={`px-5 py-2 rounded-lg transition ${
            isRecording
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {isRecording ? "Stop Recording" : "Speak Answer"}
        </button>

        {/* Optional visual indicator */}
        {isRecording && (
          <span className="ml-2 flex items-center text-red-500 font-semibold">
            🔴 Listening...
          </span>
        )}
      </div>
    </div>
  );
}
