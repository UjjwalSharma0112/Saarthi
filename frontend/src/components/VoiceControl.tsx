import { Mic, Settings } from 'lucide-react';

export default function VoiceControl() {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 mb-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Voice Command</h2>
        <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-colors">
          <Settings className="w-4 h-4 text-gray-700" />
        </button>
      </div>
      <div className="flex flex-col items-center">
        <button className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all">
          <Mic className="w-9 h-9 text-white" />
        </button>
        <p className="text-sm text-gray-500 mt-4">Tap to speak a command</p>
      </div>
    </div>
  );
}
