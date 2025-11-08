export default function speak(text: string) {
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Small delay to ensure cancellation completes
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 100);
}
