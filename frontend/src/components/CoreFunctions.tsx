import { ChevronRight, Users, Search, FileText, Navigation } from 'lucide-react';

interface CoreFunctionsProps {
  onNavigate: (view: string) => void;
}

const functions = [
  { id: 'face-detection', label: 'Face Detection', icon: Users },
  { id: 'object-recognition', label: 'Object Recognition', icon: Search },
  { id: 'text-reading', label: 'Text Reading', icon: FileText },
  { id: 'navigation', label: 'Navigation Assist', icon: Navigation },
];

export default function CoreFunctions({ onNavigate }: CoreFunctionsProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 mb-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Core Functions</h2>
      <div className="space-y-1">
        {functions.map((func) => {
          const Icon = func.icon;
          return (
            <button
              key={func.id}
              onClick={() => onNavigate(func.id)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <span className="text-gray-900 font-medium">{func.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
