import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  Camera,
  Users,
  Play,
  Square,
  UserPlus,
} from "lucide-react";

interface FaceDetectionProps {
  onBack: () => void;
}

interface RecognitionResult {
  result: string;
  confidence?: string;
}

export default function FaceDetection({ onBack }: FaceDetectionProps) {
  const [isActive, setIsActive] = useState(false);
  const [recognitionResult, setRecognitionResult] =
    useState<string>("Waiting...");
  const [knownFacesCount, setKnownFacesCount] = useState(0);
  const [personName, setPersonName] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-activate camera on mount
  useEffect(() => {
    const activateCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsActive(true);
        setRecognitionResult("Camera active, scanning...");
      } catch (err) {
        setRecognitionResult("Error: Camera access denied");
      }
    };

    activateCamera();

    // Cleanup on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Periodic frame capture for recognition
  useEffect(() => {
    if (isActive && videoRef.current && canvasRef.current) {
      intervalRef.current = setInterval(() => {
        captureFrameForRecognition();
      }, 1500);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive]);
  // Periodic frame capture for recognition
  useEffect(() => {
    if (isActive && videoRef.current && canvasRef.current) {
      intervalRef.current = setInterval(() => {
        captureFrameForRecognition();
      }, 1500);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive]);

  const captureFrameForRecognition = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataURL = canvas.toDataURL("image/jpeg");

    try {
      const response = await fetch("/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataURL }),
      });

      const data: RecognitionResult = await response.json();
      setRecognitionResult(
        `${data.result}${data.confidence ? ` (${data.confidence})` : ""}`
      );
    } catch (err) {
      console.error("Recognition failed:", err);
      setRecognitionResult("Server error - Make sure backend is running");
    }
  };

  const handleActivateCamera = async () => {
    if (!isActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsActive(true);
        setRecognitionResult("Camera active, scanning...");
      } catch (err) {
        setRecognitionResult("Error: Camera access denied");
      }
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsActive(false);
      setRecognitionResult("Waiting...");
    }
  };

  const handleCaptureFace = async () => {
    if (!personName.trim()) {
      alert("Please enter a name first");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    setIsCapturing(true);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataURL = canvas.toDataURL("image/jpeg");

    try {
      const response = await fetch("/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataURL, name: personName }),
      });

      const data = await response.json();
      alert(data.result);
      setPersonName("");
      setKnownFacesCount((prev) => prev + 1);
    } catch (err) {
      alert("Capture failed: " + err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          Face Recognition
        </h2>
      </div>

      <div className="p-6 space-y-4">
        <button
          onClick={handleActivateCamera}
          className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${
            isActive
              ? "bg-red-50 hover:bg-red-100 active:bg-red-200"
              : "bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isActive ? "bg-red-100" : "bg-gray-200"
              }`}
            >
              {isActive ? (
                <Square className="w-5 h-5 text-red-600" />
              ) : (
                <Play className="w-5 h-5 text-gray-700" />
              )}
            </div>
            <span
              className={`font-medium ${
                isActive ? "text-red-600" : "text-gray-900"
              }`}
            >
              {isActive ? "Stop Camera Feed" : "Activate Camera Feed"}
            </span>
          </div>
        </button>

        <div className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-700" />
            </div>
            <span className="text-gray-900 font-medium">
              Known Faces Database
            </span>
          </div>
          <span className="text-sm text-gray-500">{knownFacesCount} faces</span>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Live Feed / Results
          </h3>

          <div className="relative bg-black rounded-xl overflow-hidden aspect-video mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-600" />
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg px-4 py-3 mb-4">
            <div className="text-sm text-gray-500 mb-1">
              Recognition Result:
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {recognitionResult}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-5 h-5 text-gray-700" />
              <span className="font-medium text-gray-900">Add New Face</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Enter person's name"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isActive}
              />
              <button
                onClick={handleCaptureFace}
                disabled={!isActive || isCapturing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isCapturing ? "Capturing..." : "Capture"}
              </button>
            </div>
            {!isActive && (
              <p className="text-xs text-gray-500 mt-2">
                Activate camera to capture faces
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
