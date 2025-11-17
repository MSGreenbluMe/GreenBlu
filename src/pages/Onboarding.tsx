interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">🌊</div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to GreenBlu.ai
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your AI companion for achieving <span className="text-teal-600 font-semibold">FLOW state</span>
          </p>
        </div>

        <div className="space-y-6 text-left mb-8">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🧠</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                AI Mood Prediction
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Predict your mood trajectory and prevent stress before it happens
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="text-3xl">👤</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Progressive Personality Profiling
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                1-2 questions per day build your complete personality profile
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="text-3xl">🎯</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Job Crafting Intelligence
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Find your optimal role based on your genius type and flow patterns
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="text-3xl">🔒</div>
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
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors"
        >
          Get Started →
        </button>

        <p className="text-sm text-gray-500 mt-6">
          Ready to achieve flow state and find your genius? 🚀
        </p>
      </div>
    </div>
  );
}
