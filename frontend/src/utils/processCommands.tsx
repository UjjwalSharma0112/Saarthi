import nlp from "compromise";

export type View =
  | "main"
  | "face-detection"
  | "object-recognition"
  | "text-reading"
  | "navigation";

interface ProcessCommandsProps {
  transcript: string;
  onNavigate: React.Dispatch<React.SetStateAction<View>>;
}

/**
 * Processes voice transcript using NLP and navigates to the appropriate view.
 */
export default function processCommand({
  transcript,
  onNavigate,
}: ProcessCommandsProps) {
  const command = transcript.toLowerCase().trim();
  if (!command) return;

  const doc = nlp(command);
  const tokens = doc.terms().out("array");
  console.log("🧠 NLP tokens:", tokens);

  const speak = (msg: string) => {
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  // === 🎯 FACE DETECTION ===
  if (
    command.includes("who am i seeing") ||
    command.includes("who do i see") ||
    command.includes("who is in front of me") ||
    command.includes("faces") ||
    command.includes("see person") ||
    doc.has("face") ||
    doc.has("person")
  ) {
    speak("Opening face detection mode.");
    onNavigate("face-detection");
    return;
  }

  // === 🧩 OBJECT RECOGNITION ===
  if (
    command.includes("what am i seeing") ||
    command.includes("what do i see") ||
    command.includes("object") ||
    command.includes("things") ||
    doc.has("object") ||
    doc.has("thing")
  ) {
    speak("Opening object recognition mode.");
    onNavigate("object-recognition");
    return;
  }

  // === 📖 TEXT READING ===
  if (
    command.includes("read") ||
    command.includes("read text") ||
    command.includes("read this") ||
    doc.has("read") ||
    doc.has("text")
  ) {
    speak("Opening text reading mode.");
    onNavigate("text-reading");
    return;
  }

  // === 🗺️ NAVIGATION ===
  if (
    command.includes("navigate") ||
    command.includes("go to") ||
    command.includes("take me to") ||
    command.includes("direction") ||
    doc.has("navigate") ||
    doc.has("direction")
  ) {
    speak("Opening navigation mode.");
    onNavigate("navigation");
    return;
  }

  // === 🏠 BACK / MAIN ===
  if (
    command.includes("back") ||
    command.includes("home") ||
    command.includes("main") ||
    command.includes("exit") ||
    doc.has("back") ||
    doc.has("home")
  ) {
    speak("Returning to main view.");
    onNavigate("main");
    return;
  }

  // === 🤷 UNKNOWN ===
  speak("Sorry, I didn't understand that command.");
  console.log("⚠️ No command matched:", command);
}
