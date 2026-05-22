import {
  ArrowRight,
  Brain,
  CalendarCheck,
  CheckCircle2,
  FileHeart,
  HeartPulse,
  MessageSquareQuote,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Zap,
} from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { LogoMark } from "../components/AppLayout.jsx"
import { MotionCard, MotionPage, Reveal } from "../components/MotionPrimitives.jsx"

const features = [
  { icon: FileHeart, title: "Medical report intelligence", text: "Structured report summaries with abnormal values, plain explanations, and doctor-ready exports." },
  { icon: Stethoscope, title: "Emergency risk guidance", text: "Risk signals, specialist suggestions, and urgent-care recommendations in a calm patient workflow." },
  { icon: CalendarCheck, title: "Care coordination", text: "Appointments, reminders, and recent activity aligned around what the patient should do next." },
  { icon: Brain, title: "Explainable AI insights", text: "Simple-language and accessibility modes that make complex terms easier to understand." },
]

const stats = [
  ["3 min", "average report read"],
  ["24/7", "AI guidance layer"],
  ["5+", "health signals tracked"],
  ["Doctor-first", "safety posture"],
]

const steps = [
  ["Upload or enter symptoms", "Patients add a report, symptoms, or appointment need."],
  ["AI structures the context", "EasyMed converts medical details into clean insights and urgency signals."],
  ["Act with clarity", "Patients get doctor-ready summaries, next steps, and safer care guidance."],
]

const testimonials = [
  ["The report summary finally made my blood test understandable before my doctor visit.", "Priya S.", "Patient beta user"],
  ["The emergency risk card is thoughtful. It tells people when not to wait.", "Dr. Arjun M.", "General physician"],
  ["The rural readable mode is the kind of healthcare UX India needs more of.", "Neha R.", "Public health researcher"],
]

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <MotionPage className="min-h-screen overflow-hidden bg-cloud text-ink">
      <header className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(216,246,239,0.95),transparent_30rem),radial-gradient(circle_at_86%_18%,rgba(242,109,91,0.13),transparent_28rem),radial-gradient(circle_at_70%_78%,rgba(15,159,154,0.12),transparent_32rem),linear-gradient(135deg,#ecfffb_0%,#f7fbff_48%,#fff7f4_100%)]" />
        <div className="premium-noise absolute inset-0 opacity-50" />

        <div className="sticky top-3 z-40 px-3 sm:px-5">
          <nav className={`nav-glass mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 sm:px-5 ${scrolled ? "shadow-soft" : ""}`}>
            <Link to="/" className="flex items-center gap-3 text-xl font-black">
              <LogoMark />
              EasyMed
            </Link>
            <div className="hidden items-center gap-7 text-sm font-bold text-slate-600 md:flex">
              <NavAnchor href="#features">Features</NavAnchor>
              <NavAnchor href="#preview">Preview</NavAnchor>
              <NavAnchor href="#how">How it works</NavAnchor>
              <NavAnchor href="#testimonials">Patients</NavAnchor>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden rounded-full px-3 py-2 font-bold text-slate-600 transition hover:bg-white hover:text-aqua sm:inline">Login</Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link to="/signup" className="btn-primary px-4 py-2">Get started</Link>
              </motion.div>
            </div>
          </nav>
        </div>

        <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:pb-20 lg:pt-16">
          <Reveal>
            <div className="relative">
              <div className="ai-badge mb-5">
                <Sparkles size={16} />
                Powered by AI for safer patient understanding
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-tight text-ink sm:text-6xl lg:text-7xl">
                EasyMed turns complex health data into clear next steps.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                A premium AI healthcare assistant for report intelligence, symptom guidance, emergency risk awareness, smart reminders, and doctor-ready summaries.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <motion.div whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/reports" className="btn-primary">
                    Try AI Analysis
                    <ArrowRight size={20} />
                  </Link>
                </motion.div>
                <Link to="/login" className="btn-secondary">Open workspace</Link>
              </div>
              <div className="mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map(([value, label]) => (
                  <MotionCard key={label} className="rounded-lg border border-white/70 bg-white/75 p-4 shadow-soft backdrop-blur">
                    <p className="text-2xl font-black text-aqua">{value}</p>
                    <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
                  </MotionCard>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative">
              <div className="absolute -inset-8 rounded-[2rem] bg-aqua/10 blur-3xl" />
              <motion.div
                className="glass-card relative overflow-hidden"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="border-b border-white/60 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-aqua">Live AI care cockpit</p>
                      <h2 className="mt-1 text-2xl font-black">Patient snapshot</h2>
                    </div>
                    <div className="rounded-lg bg-aqua p-3 text-white shadow-lg shadow-teal-100">
                      <Brain size={26} />
                    </div>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <div className="rounded-lg bg-ink p-5 text-white shadow-soft">
                    <p className="inline-flex items-center gap-2 text-sm font-bold text-teal-100">
                      <Zap size={16} />
                      Smart insight
                    </p>
                    <p className="mt-3 text-lg font-semibold leading-7">Glucose and Vitamin D need attention. Suggested next step: non-emergency doctor review.</p>
                  </div>
                  <LivePulseGraph />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-mint p-4">
                      <p className="text-sm font-black text-teal-800">Care score</p>
                      <p className="mt-2 text-4xl font-black text-teal-900">86</p>
                      <div className="mt-3 h-2 rounded-full bg-white">
                        <div className="h-full w-[86%] rounded-full bg-aqua" />
                      </div>
                    </div>
                    <div className="rounded-lg bg-rose-50 p-4">
                      <p className="text-sm font-black text-rose-700">Risk signal</p>
                      <p className="mt-2 text-2xl font-black text-rose-950">Medium</p>
                      <p className="mt-2 text-sm font-semibold text-rose-800">Book review soon</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white/80 p-4">
                    <div className="mb-3 flex items-center gap-2 font-black">
                      <ShieldCheck size={20} className="text-aqua" />
                      Doctor-first AI safety
                    </div>
                    <p className="text-sm leading-6 text-slate-600">Every insight stays informational and encourages licensed medical review.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </Reveal>
        </section>

        <section id="preview" className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <MiniDashboardPreview />
        </section>
      </header>

      <main>
        <Section id="features" eyebrow="Feature showcase" title="Built like a modern care companion">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 0.05}>
                <MotionCard className="premium-card h-full p-6">
                  <feature.icon className="text-aqua" size={30} />
                  <h3 className="mt-5 text-xl font-black">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{feature.text}</p>
                </MotionCard>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section id="how" eyebrow="How EasyMed works" title="From confusing report to confident doctor conversation">
          <div className="grid gap-5 lg:grid-cols-3">
            {steps.map(([title, text], index) => (
              <Reveal key={title} delay={index * 0.08}>
                <div className="premium-card p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-ink text-xl font-black text-white">{index + 1}</div>
                  <h3 className="mt-5 text-xl font-black">{title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section eyebrow="AI healthcare statistics" title="Designed around clarity, speed, and safer escalation">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(([value, label]) => (
              <MotionCard key={label} className="premium-card p-6 text-center">
                <p className="text-4xl font-black text-aqua">{value}</p>
                <p className="mt-2 font-bold text-slate-600">{label}</p>
              </MotionCard>
            ))}
          </div>
        </Section>

        <Reveal>
          <section className="relative overflow-hidden border-y border-slate-200/70 bg-ink px-4 py-16 text-white sm:px-6 lg:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(15,159,154,0.35),transparent_28rem),radial-gradient(circle_at_82%_70%,rgba(242,109,91,0.18),transparent_24rem)]" />
            <div className="premium-noise absolute inset-0 opacity-20" />
            <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-center">
              <div>
                <p className="ai-badge border-white/20 bg-white/10 text-teal-100">Live AI analysis ready</p>
                <h2 className="mt-5 max-w-3xl text-3xl font-black sm:text-5xl">Try the report intelligence flow recruiters remember.</h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">Upload a sample report, see risk cards, simple explanations, smart reminders, and doctor-ready summaries in one polished healthcare workspace.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/reports" className="btn-primary">
                    Try AI Analysis
                    <Sparkles size={19} />
                  </Link>
                </motion.div>
                <Link to="/signup" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-ink">Start demo</Link>
              </div>
            </div>
          </section>
        </Reveal>

        <Section id="testimonials" eyebrow="Testimonials" title="Trusted by patients, doctors, and health builders">
          <div className="grid gap-5 lg:grid-cols-3">
            {testimonials.map(([quote, name, role]) => (
              <Reveal key={name}>
                <div className="premium-card p-6">
                  <MessageSquareQuote className="text-aqua" size={28} />
                  <p className="mt-5 leading-7 text-slate-700">"{quote}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-mint font-black text-teal-900">{name[0]}</div>
                    <div>
                      <p className="font-black">{name}</p>
                      <p className="text-sm text-slate-500">{role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      </main>

      <footer className="border-t border-slate-200 bg-ink px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 text-xl font-black">
              <LogoMark />
              EasyMed
            </div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">AI insights are informational only and not a substitute for professional medical advice.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-bold text-slate-300">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <Link to="/login" className="hover:text-white">Login</Link>
          </div>
        </div>
      </footer>
    </MotionPage>
  )
}

function NavAnchor({ href, children }) {
  return (
    <a href={href} className="group relative rounded-full px-1 py-2 transition hover:text-aqua">
      {children}
      <span className="absolute inset-x-1 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-aqua transition-transform duration-300 group-hover:scale-x-100" />
    </a>
  )
}

function LivePulseGraph() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-black text-slate-600">
          <HeartPulse size={18} className="text-aqua" />
          Live AI analysis pulse
        </p>
        <span className="rounded-full bg-mint px-3 py-1 text-xs font-black text-teal-800">Analyzing</span>
      </div>
      <svg viewBox="0 0 420 90" className="h-20 w-full overflow-visible">
        <path
          d="M0 48 H52 L67 48 L82 18 L105 76 L127 48 H177 L196 34 L214 60 L236 48 H298 L316 22 L340 70 L362 48 H420"
          fill="none"
          stroke="#0f9f9a"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-heartbeat-line"
        />
        <path
          d="M0 48 H52 L67 48 L82 18 L105 76 L127 48 H177 L196 34 L214 60 L236 48 H298 L316 22 L340 70 L362 48 H420"
          fill="none"
          stroke="rgba(15,159,154,0.13)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function MiniDashboardPreview() {
  const previewCards = [
    { icon: FileHeart, title: "AI report summary", text: "Glucose is high, Vitamin D is low. Doctor review recommended.", tone: "bg-mint text-teal-900" },
    { icon: Pill, title: "Medicine reminder", text: "Metformin 500 mg due today at 8:00 PM.", tone: "bg-violet-50 text-violet-900" },
    { icon: CalendarCheck, title: "Upcoming checkup", text: "Cardiology follow-up on May 28 at 10:30 AM.", tone: "bg-sky-50 text-sky-900" },
    { icon: Stethoscope, title: "Risk analysis", text: "Medium Risk. Escalate if symptoms worsen.", tone: "bg-rose-50 text-rose-900" },
  ]

  return (
    <Reveal>
      <div className="relative">
        <div className="absolute -inset-6 rounded-[2rem] bg-white/45 blur-2xl" />
        <div className="glass-card relative overflow-hidden p-5 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-aqua">Product preview</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">A healthcare analytics workspace, not a static hospital portal.</h2>
            </div>
            <Link to="/dashboard" className="btn-secondary w-fit">View dashboard</Link>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {previewCards.map((card, index) => (
                <motion.article
                  key={card.title}
                  className="premium-card p-5"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  whileHover={{ y: -5 }}
                >
                  <div className={`mb-4 grid h-11 w-11 place-items-center rounded-lg ${card.tone}`}>
                    <card.icon size={22} />
                  </div>
                  <h3 className="font-black">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p>
                </motion.article>
              ))}
            </div>

            <div className="premium-card p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-slate-500">Health score graph</p>
                  <p className="text-3xl font-black">86</p>
                </div>
                <span className="ai-badge px-3 py-1 text-xs">Smart insights</span>
              </div>
              <div className="flex h-32 items-end gap-3">
                {[48, 58, 52, 68, 74, 82, 86].map((height, index) => (
                  <motion.div
                    key={`${height}-${index}`}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-aqua to-mint"
                    initial={{ height: 10 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: index * 0.05, ease: "easeOut" }}
                  />
                ))}
              </div>
              <div className="mt-5 space-y-3">
                {["Report uploaded", "AI risk scan completed", "Appointment scheduled"].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-mint text-xs font-black text-teal-900">{index + 1}</span>
                    <p className="text-sm font-bold text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="border-t border-slate-200/70 bg-white/55 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-aqua">{eyebrow}</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">{title}</h2>
          </div>
        </Reveal>
        {children}
      </div>
    </section>
  )
}
