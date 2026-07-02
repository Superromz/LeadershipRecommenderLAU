import { useState } from 'react'

const STEPS = [
  {
    title: 'Welcome to Leadership Coach',
    subtitle: 'Your personalised leadership development journey starts here.',
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <p>
          This tool uses an <strong>AI model trained on real leadership research</strong> to classify your
          leadership style and give you personalised development recommendations.
        </p>
        <p>
          It takes <strong>under 2 minutes</strong> to complete, and you'll receive:
        </p>
        <ul className="space-y-1.5 mt-2">
          {[
            'Your predicted leadership style with confidence score',
            'The key behaviours driving your classification (SHAP)',
            'The minimum changes that could shift your style',
            'Personalised development recommendations with resources',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <svg className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    ),
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: '6 Behavioural Dimensions',
    subtitle: 'Based on the Ohio State Leadership Behavioural Description Questionnaire.',
    content: (
      <div className="space-y-2">
        {[
          { label: 'Role Assumption', desc: 'How readily you take charge and accept leadership responsibility.' },
          { label: 'Production Emphasis', desc: 'How much you prioritise results, output quality, and hitting targets.' },
          { label: 'Initiation of Structure', desc: 'How clearly you define goals, roles, and workflows for your team.' },
          { label: 'Tolerance of Uncertainty', desc: 'How comfortable you are deciding with incomplete information.' },
          { label: 'Integration', desc: 'How actively you build cohesion, resolve conflict, and align your team.' },
          { label: 'Consideration', desc: "How much you focus on team members' wellbeing and development." },
        ].map(({ label, desc }) => (
          <div key={label} className="flex items-start gap-2.5 text-sm">
            <div className="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-1.5" />
            <div>
              <span className="font-semibold text-gray-800">{label}</span>
              <span className="text-gray-500"> — {desc}</span>
            </div>
          </div>
        ))}
      </div>
    ),
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'What You\'ll Receive',
    subtitle: 'Three layers of explainable AI output — not just a label.',
    content: (
      <div className="space-y-3">
        {[
          {
            name: 'Style Prediction',
            color: 'bg-indigo-50 border-indigo-100',
            badge: 'text-indigo-700 bg-indigo-100',
            label: 'XGBoost',
            desc: 'One of four leadership styles predicted by our AI model with probability scores.',
          },
          {
            name: 'SHAP Explanation',
            color: 'bg-violet-50 border-violet-100',
            badge: 'text-violet-700 bg-violet-100',
            label: 'Explainable AI',
            desc: 'The top 3 behaviours that most influenced your classification — and in what direction.',
          },
          {
            name: 'Counterfactual',
            color: 'bg-amber-50 border-amber-100',
            badge: 'text-amber-700 bg-amber-100',
            label: 'What-if',
            desc: 'The minimum behavioural changes that would shift you to a different style.',
          },
          {
            name: 'Recommendations',
            color: 'bg-emerald-50 border-emerald-100',
            badge: 'text-emerald-700 bg-emerald-100',
            label: 'Personalised',
            desc: 'Development advice and curated resources tailored to your profile.',
          },
        ].map(({ name, color, badge, label, desc }) => (
          <div key={name} className={`rounded-xl border p-3 ${color}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-gray-800">{name}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge}`}>{label}</span>
            </div>
            <p className="text-xs text-gray-600">{desc}</p>
          </div>
        ))}
      </div>
    ),
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    title: "You're Ready",
    subtitle: 'Answer honestly — there are no right or wrong answers.',
    content: (
      <div className="text-center space-y-4 py-2">
        <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Rate each statement on a scale of <strong>1 (Strongly Disagree)</strong> to <strong>5 (Strongly Agree)</strong>.</p>
          <p>Think about your <strong>natural tendencies</strong>, not how you think you should behave.</p>
          <p>Your results are <strong>private</strong> and stored securely in your account.</p>
          <p>You can retake the assessment anytime to track how your style evolves.</p>
        </div>
      </div>
    ),
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
]

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="gradient-brand px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                {current.icon}
              </div>
              <div>
                <h2 className="text-lg font-extrabold leading-tight">{current.title}</h2>
                <p className="text-white/70 text-xs mt-0.5">{current.subtitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 min-h-[280px]">
          {current.content}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          {/* Dot indicators */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  i === step ? 'w-6 bg-brand' : 'w-2 bg-gray-200 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
            )}
            {isLast ? (
              <button
                onClick={onClose}
                className="px-6 py-2 gradient-brand text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
              >
                Start Assessment
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 gradient-brand text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
              >
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
