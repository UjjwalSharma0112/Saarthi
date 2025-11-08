import { useEffect, useState, useRef } from "react";
import { Mic, Settings } from "lucide-react";
import { usePorcupine } from "@picovoice/porcupine-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import processCommand from "../utils/processCommands";
type View =
  | "main"
  | "face-detection"
  | "object-recognition"
  | "text-reading"
  | "navigation";

interface VoiceControlProps {
  onNavigate: React.Dispatch<React.SetStateAction<View>>;
}

export default function VoiceAssistant({ onNavigate }: VoiceControlProps) {
  const {
    keywordDetection,
    isLoaded,
    isListening: isWakewordListening,
    init,
    start: startWakeword,
    stop: stopWakeword,
  } = usePorcupine();

  const {
    transcript,
    listening: isRecording,
    resetTranscript,
  } = useSpeechRecognition();

  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState("idle");

  const wakewordRestartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef("");

  const ACCESS_KEY = "MgIVeCzQrZUMwxDq5Ten/jPLlamUi+h0oxSwntmFAQS7/hu2fHv6Lg==";
  const keywordPath = "/Hey-Echo_en_wasm_v3_0_0.ppn";
  const modelPath = "/porcupine_params.pv";

  // keep transcript up to date
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    const porcupineKeyword = { publicPath: keywordPath, label: "Hey Cruz" };
    const porcupineModel = { publicPath: modelPath };

    const setupWakeword = async () => {
      try {
        await init(ACCESS_KEY, porcupineKeyword, porcupineModel);
        await startWakeword();
        console.log("🔊 Wakeword detection active!");
        setStatus("listening for wakeword");
      } catch (error) {
        console.error("Error setting up wakeword:", error);
        setStatus("error initializing");
      }
    };

    setupWakeword();

    return () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      if (wakewordRestartTimerRef.current)
        clearTimeout(wakewordRestartTimerRef.current);
      stopWakeword();
    };
  }, []);

  useEffect(() => {
    if (keywordDetection) {
      console.log("🟢 Wake word detected:", keywordDetection.label);
      setStatus("wake word detected");
      stopWakeword();
      startRecording();
    }
  }, [keywordDetection]);

  useEffect(() => {
    if (isRecording && transcript) {
      if (silenceTimer) clearTimeout(silenceTimer);
      const timer = setTimeout(() => {
        console.log("⏹️ Silence detected — stopping...");
        stopRecording();
      }, 3000);
      setSilenceTimer(timer as NodeJS.Timeout);
    }
  }, [transcript, isRecording]);

  const startRecording = async () => {
    resetTranscript();
    transcriptRef.current = "";
    try {
      await SpeechRecognition.startListening({
        continuous: true,
        language: "en-US",
      });
      console.log("🎤 Recording started...");
      setStatus("recording");
    } catch (error) {
      console.error("Error starting SpeechRecognition:", error);
      setStatus("error recording");
      restartWakewordDetection();
    }
  };

  const stopRecording = async () => {
    try {
      await SpeechRecognition.stopListening();
      console.log("⏹️ Recording stopped...");
      setStatus("processing");

      await new Promise((r) => setTimeout(r, 500));
      const finalTranscript = transcriptRef.current.trim();

      if (finalTranscript) {
        console.log("✅ Captured:", finalTranscript);
        setCurrentCommand(finalTranscript);
        setCommandHistory((prev) => [...prev, finalTranscript]);
        processCommand({ transcript: finalTranscript, onNavigate });
      } else {
        console.log("⚠️ Empty transcript.");
        setStatus("no input detected");
      }

      restartWakewordDetection();
    } catch (error) {
      console.error("Error stopping recording:", error);
      restartWakewordDetection();
    }
  };

  const restartWakewordDetection = () => {
    if (wakewordRestartTimerRef.current)
      clearTimeout(wakewordRestartTimerRef.current);

    wakewordRestartTimerRef.current = setTimeout(() => {
      startWakeword();
      setStatus("listening for wakeword");
      console.log("🔁 Wakeword restarted");
      wakewordRestartTimerRef.current = null;
    }, 1000) as NodeJS.Timeout;
  };

  // 👇 mic button manual trigger handler
  const handleMicClick = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      stopWakeword(); // stop listening to wakeword when manually triggered
      await startRecording();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Voice Command
            </h2>
            <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-colors">
              <Settings className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={handleMicClick}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all ${
                isRecording
                  ? "bg-red-500"
                  : "bg-gradient-to-br from-gray-800 to-gray-600"
              }`}
            >
              <Mic className="w-9 h-9 text-white" />
            </button>

            <p className="text-sm text-gray-500 mt-4">
              {status === "listening for wakeword" &&
                "Say 'Hey Echo' to activate"}
              {status === "wake word detected" && "Wake word detected!"}
              {status === "recording" && "Listening..."}
              {status === "processing" && "Processing your command..."}
              {status === "command received" && "Command received!"}
              {status === "no input detected" && "No voice detected"}
              {status === "idle" && "Initializing..."}
            </p>

            {isRecording && transcript && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">{transcript}</p>
              </div>
            )}
          </div>
        </div>

        {currentCommand && (
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Current Command
            </h3>
            <p className="text-gray-900">{currentCommand}</p>
          </div>
        )}

        {commandHistory.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Command History
            </h3>
            <div className="space-y-2">
              {commandHistory.map((cmd, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="text-gray-400 mr-2">#{idx + 1}</span>
                    {cmd}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
