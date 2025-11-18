import Octopus from '../components/Octopus';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <Octopus vad={{ valence: 0.8, arousal: 0.7, dominance: 0.8 }} size={120} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to GreenBlu.ai
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your AI companion for achieving <span className="text-teal-600 font-semibold">FLOW state</span>
          </p>
        </div>

        <div className="space-y-6 text-left mb-8">
          <div className="flex items-start gap-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex-shrink-0">
              <Octopus vad={{ valence: 0.6, arousal: 0.8, dominance: 0.7 }} size={48} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                AI Mood Prediction
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Predict your mood trajectory and prevent stress before it happens
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-800 rounded-lg p-4">
            <div className="flex-shrink-0">
              <Octopus vad={{ valence: 0.5, arousal: 0.5, dominance: 0.6 }} size={48} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Progressive Personality Profiling
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                1-2 questions per day build your complete personality profile
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex-shrink-0">
              <Octopus vad={{ valence: 0.7, arousal: 0.6, dominance: 0.8 }} size={48} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Job Crafting Intelligence
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Find your optimal role based on your genius type and flow patterns
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="flex-shrink-0">
              <Octopus vad={{ valence: 0, arousal: 0, dominance: 0.5 }} size={48} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Privacy First
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                All data stored locally on your device with encryption
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors shadow-sm"
        >
          Get Started →
        </button>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          Ready to achieve flow state and find your genius?
        </p>
      </div>
    </div>
  );
}
