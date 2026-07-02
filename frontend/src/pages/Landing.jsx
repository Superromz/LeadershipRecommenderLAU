import { Link } from 'react-router-dom'

const STYLES = [
  {
    name: 'Transformational',
    color: '#4F46E5',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    tagline: 'Vision · Inspiration · Innovation',
    desc: 'Motivates through a compelling vision, intellectual challenge, and individualised support.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: 'Transactional',
    color: '#0EA5E9',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    tagline: 'Structure · Accountability · Results',
    desc: 'Leads through clear expectations, defined roles, and performance-based recognition.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    name: 'Supportive',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    tagline: 'Empathy · Trust · Well-being',
    desc: 'Prioritises team well-being and development, building genuine psychological safety.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    name: 'Laissez-Faire',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    tagline: 'Autonomy · Freedom · Trust',
    desc: 'Grants high autonomy and minimal interference — best for self-driven expert teams.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
      </svg>
    ),
  },
]

const STEPS = [
  {
    num: '1',
    title: 'Create an account',
    desc: 'Register with your professional profile — country, experience, education — in under 2 minutes.',
  },
  {
    num: '2',
    title: 'Answer 6 questions',
    desc: 'Rate behavioural statements on a 1–5 Likert scale. Grounded in Ohio State leadership research.',
  },
  {
    num: '3',
    title: 'Get AI analysis',
    desc: 'XGBoost classifies your style. SHAP explains which behaviours drove the prediction.',
  },
  {
    num: '4',
    title: 'Grow with insights',
    desc: 'Receive counterfactual guidance, a personalised development plan, and track progress over time.',
  },
]

// Mock result card shown on the hero
function MockResultCard() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-5 py-4 text-white">
        <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Your Leadership Style</p>
        <h3 className="text-xl font-extrabold">Transformational</h3>
        <p className="text-indigo-200 text-xs mt-0.5">Vision · Inspiration · Innovation</p>
        <div className="mt-3 text-right">
          <span className="text-3xl font-extrabold">87%</span>
          <span className="text-indigo-300 text-xs ml-1">confidence</span>
        </div>
      </div>
      {/* SHAP */}
      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Top Behavioural Drivers (SHAP)</p>
        {[
          { label: 'Integration', val: 0.42, pos: true, w: 84 },
          { label: 'Consideration', val: 0.35, pos: true, w: 70 },
          { label: 'Production Emphasis', val: -0.18, pos: false, w: 36 },
        ].map((item) => (
          <div key={item.label} className="mb-2.5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600 font-medium">{item.label}</span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${item.pos ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-500'}`}>
                {item.pos ? '+' : ''}{item.val}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full" style={{ width: `${item.w}%`, backgroundColor: item.pos ? '#4F46E5' : '#F87171' }} />
            </div>
          </div>
        ))}
      </div>
      {/* Counterfactual */}
      <div className="mx-4 mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <p className="text-xs font-bold text-amber-800 mb-1.5">1 step away from Transactional</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-amber-700">Production Emphasis</span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">+ increase by 1</span>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <span className="font-extrabold text-gray-900 text-sm">Leadership Coach</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link to="/register" className="gradient-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-sm">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-50 rounded-full opacity-60" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-violet-50 rounded-full opacity-40" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-brand text-xs font-bold px-3 py-1.5 rounded-full mb-6 border border-indigo-100">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                XGBoost + SHAP · LAU Capstone Project
              </div>

              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-5">
                Discover your{' '}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}>
                  leadership style
                </span>{' '}
                with AI
              </h1>

              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Answer 6 behavioural questions. Our XGBoost model classifies your leadership style and
                explains <em>exactly why</em> — using SHAP feature attribution grounded in cross-cultural research.
              </p>

              <div className="flex items-center gap-4 flex-wrap mb-10">
                <Link
                  to="/register"
                  className="gradient-brand text-white font-bold px-7 py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-200 text-sm"
                >
                  Start free assessment →
                </Link>
                <Link
                  to="/login"
                  className="text-gray-600 font-semibold text-sm px-6 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Sign in
                </Link>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { val: '91.2%', label: 'Macro F1 Score', sub: 'XGBoost test set' },
                  { val: '6', label: 'Behavioural Dims', sub: 'Ohio State framework' },
                  { val: 'SHAP', label: 'Explainability', sub: 'Per-prediction' },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-xl font-extrabold text-brand">{s.val}</div>
                    <div className="text-xs font-semibold text-gray-700 mt-0.5">{s.label}</div>
                    <div className="text-xs text-gray-400">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — mock result card */}
            <div className="flex justify-center lg:justify-end">
              <MockResultCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-slate-50 py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-400 text-sm">From sign-up to personalised insights in under 10 minutes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step) => (
              <div key={step.num} className="bg-white rounded-2xl border border-gray-200 shadow-card p-6">
                <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center text-white font-extrabold text-sm mb-4">
                  {step.num}
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-2">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4 Leadership styles ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">The four leadership styles</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Grounded in the Ohio State behavioural leadership framework, validated across 5 countries
              using Hofstede cultural dimensions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {STYLES.map((s) => (
              <div
                key={s.name}
                className="rounded-2xl border p-6 hover:shadow-card-hover transition-shadow"
                style={{ backgroundColor: s.bg, borderColor: s.border }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: s.color, color: '#fff' }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 mb-0.5">{s.name}</h3>
                    <p className="text-xs font-semibold mb-2" style={{ color: s.color }}>{s.tagline}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Explainability section ── */}
      <section className="bg-slate-50 py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-full mb-5 border border-violet-200">
                Explainable AI · XAI
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                Not just a label —<br />a full explanation
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Every prediction comes with <strong>SHAP TreeExplainer</strong> values showing exactly
                which behavioural scores pushed the model toward your style. You also get a
                <strong> counterfactual</strong> — the minimum change needed to shift your classification.
              </p>
              <ul className="space-y-3">
                {[
                  'SHAP values — per-prediction behavioural attribution',
                  'Counterfactual proximity — how many steps away from another style',
                  'Personalised development plan from your top SHAP drivers',
                  'Assessment history — track your style evolution over time',
                  'Cross-cultural analytics — compare across countries & seniority',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              {/* Feature attribution card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">SHAP Feature Attribution</p>
                  <span className="text-xs bg-indigo-50 text-brand font-semibold px-2.5 py-1 rounded-full">Transformational 87%</span>
                </div>
                {[
                  { label: 'Integration', val: '+0.42', pos: true, w: '84%' },
                  { label: 'Consideration', val: '+0.35', pos: true, w: '70%' },
                  { label: 'Production Emphasis', val: '−0.18', pos: false, w: '36%' },
                ].map((item) => (
                  <div key={item.label} className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.pos ? 'bg-indigo-50 text-brand' : 'bg-red-50 text-red-500'}`}>
                        {item.val}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: item.w, backgroundColor: item.pos ? '#4F46E5' : '#F87171' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Counterfactual card */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-amber-900">What Would Shift Your Style?</p>
                  <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">1 step away</span>
                </div>
                <div className="flex items-center justify-between bg-white/70 rounded-xl px-4 py-2.5 border border-amber-100">
                  <span className="text-sm text-amber-900 font-medium">Production Emphasis</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">+ increase by 1 step</span>
                </div>
                <p className="text-xs text-amber-600 mt-2.5">→ Would reclassify you as <strong>Transactional</strong></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Research backing ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Research-backed methodology</h2>
            <p className="text-gray-400 text-sm">H1: XGBoost significantly outperforms baseline classifiers</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Baseline', f1: '14.4%', color: '#E2E8F0', text: '#94A3B8' },
              { name: 'Decision Tree', f1: '72.3%', color: '#DBEAFE', text: '#3B82F6' },
              { name: 'Random Forest', f1: '83.3%', color: '#C7D2FE', text: '#6366F1' },
              { name: 'XGBoost', f1: '91.2%', color: '#4F46E5', text: '#fff', selected: true },
              { name: 'Log. Reg.*', f1: '99.9%', color: '#FEF3C7', text: '#D97706' },
            ].map((m) => (
              <div
                key={m.name}
                className={`rounded-2xl p-5 text-center ${m.selected ? 'shadow-lg shadow-indigo-200 ring-2 ring-indigo-400 ring-offset-2' : 'border border-gray-200'}`}
                style={{ backgroundColor: m.color }}
              >
                <div className="text-2xl font-extrabold mb-1" style={{ color: m.text }}>{m.f1}</div>
                <div className="text-xs font-semibold" style={{ color: m.selected ? '#C7D2FE' : '#6B7280' }}>Macro F1</div>
                <div className="text-xs mt-1.5 font-medium" style={{ color: m.selected ? '#E0E7FF' : '#94A3B8' }}>{m.name}</div>
                {m.selected && (
                  <div className="mt-2 text-xs bg-white/20 text-white font-bold px-2 py-0.5 rounded-full inline-block">Selected</div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">* Log. Reg. anomalously high — reflects synthetic dataset linearity, not real-world generalisation.</p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-slate-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="gradient-brand rounded-3xl p-12 text-white text-center">
            <h2 className="text-3xl font-extrabold mb-3">Ready to discover your leadership style?</h2>
            <p className="text-indigo-200 text-sm mb-8 max-w-md mx-auto">
              Free. No credit card required. Full AI analysis in under 5 minutes.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/register"
                className="bg-white text-brand font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors text-sm shadow-lg"
              >
                Start your assessment →
              </Link>
              <Link
                to="/login"
                className="text-indigo-200 font-semibold text-sm hover:text-white transition-colors"
              >
                Already have an account?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 gradient-brand rounded-md flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-700">Leadership Coach</span>
          </div>
          <p className="text-xs text-gray-400">LAU Capstone · AI Engineering · Supervised by Dr. Rachad</p>
          <p className="text-xs text-gray-400">Romero Habib · 2025</p>
        </div>
      </footer>

    </div>
  )
}
