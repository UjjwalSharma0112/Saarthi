import { useState } from 'react';
import { Battery, Camera } from 'lucide-react';
import CoreFunctions from './components/CoreFunctions';
import VoiceControl from './components/VoiceControl';
import FaceDetection from './components/FaceDetection';
import Benefits from './components/Benefits';

type View = 'main' | 'face-detection' | 'object-recognition' | 'text-reading' | 'navigation';

function App() {
  const [currentView, setCurrentView] = useState<View>('main');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <header className="bg-white rounded-3xl shadow-sm px-6 py-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-600 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Echo Vision</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">Active</span>
            <Battery className="w-5 h-5 text-gray-600" />
          </div>
        </header>

        {currentView === 'main' ? (
          <>
            <CoreFunctions onNavigate={setCurrentView} />
            <VoiceControl />
            <Benefits />
          </>
        ) : currentView === 'face-detection' ? (
          <FaceDetection onBack={() => setCurrentView('main')} />
        ) : null}
      </div>
    </div>
  );
}

export default App;
