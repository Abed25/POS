export default function SystemThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-6 py-10">
      <div className="max-w-3xl w-full bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-8 md:p-12 text-center">
        {/* Logo / Badge */}
        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-400/30">
          <span className="text-4xl">💚</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Thank You for Testing Our System
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          We sincerely appreciate the time, effort, feedback, recommendations,
          and positive remarks shared during the testing phase of this system.
          Your support has played a major role in improving the platform and
          shaping its future direction.
        </p>

        {/* Message Card */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
          <h2 className="text-xl font-semibold text-emerald-400 mb-3">
            Important Notice
          </h2>

          <p className="text-slate-300 leading-relaxed mb-4">
            The live demo system has been temporarily taken offline as part of
            infrastructure cost optimization and maintenance adjustments.
          </p>

          <p className="text-slate-300 leading-relaxed mb-4">
            This does <span className="font-semibold text-white">not</span> mean
            the project has been abandoned. Development and improvements are
            still ongoing behind the scenes.
          </p>

          <p className="text-slate-300 leading-relaxed">
            We are truly grateful for your valuable contributions, bug reports,
            recommendations, and encouragement throughout the testing process.
          </p>
        </div>

        {/* Appreciation Grid */}
        <div className="grid md:grid-cols-3 gap-4 mt-8 text-left">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-2xl mb-3">🛠️</div>
            <h3 className="font-semibold text-white mb-2">Your Feedback</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every recommendation and observation helped improve usability,
              reliability, and overall system experience.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-2xl mb-3">🚀</div>
            <h3 className="font-semibold text-white mb-2">Future Growth</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              The system continues to evolve with plans for future upgrades,
              optimization, and expanded capabilities.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-2xl mb-3">🙏</div>
            <h3 className="font-semibold text-white mb-2">Appreciation</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Thank you for believing in the project and taking part in its
              journey during the testing and evaluation stages.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-sm text-slate-400">
            Thank you once again for your support, patience, and valuable time.
          </p>

          <p className="mt-2 text-xs text-slate-500">
            System temporarily unavailable • Maintenance & infrastructure
            adjustments in progress
          </p>
        </div>
      </div>
    </div>
  );
}
