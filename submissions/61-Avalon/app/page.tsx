import Link from 'next/link'
import {
  Mail, ArrowRight, Brain, Zap, Calendar, ListChecks, Tags, Clock,
  FileSearch, MessageSquare, Shield, Sparkles, ChevronRight, Play
} from 'lucide-react'
import { Logo } from '@/components/logo'

const features = [
  {
    icon: Brain,
    title: 'Auto Categorization',
    desc: 'Instantly sorts emails into Work, Personal, Finance, Updates, or Spam.',
    color: 'from-violet-500/10 to-purple-500/10 border-violet-200/50',
    iconColor: 'text-violet-600',
  },
  {
    icon: Zap,
    title: 'Smart Priority Inbox',
    desc: 'Classifies every thread as Urgent, Important, Normal, or Low Priority.',
    color: 'from-amber-500/10 to-orange-500/10 border-amber-200/50',
    iconColor: 'text-amber-600',
  },
  {
    icon: MessageSquare,
    title: 'One-Click Smart Replies',
    desc: 'AI generates 5 context-aware reply options you can send with one click.',
    color: 'from-blue-500/10 to-cyan-500/10 border-blue-200/50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Sparkles,
    title: 'Context-Aware Drafts',
    desc: 'Full reply drafts that understand the entire conversation history.',
    color: 'from-indigo-500/10 to-blue-500/10 border-indigo-200/50',
    iconColor: 'text-indigo-600',
  },
  {
    icon: Calendar,
    title: 'Meeting Detection',
    desc: 'Finds meetings, calls, and events — suggests calendar entries automatically.',
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200/50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: ListChecks,
    title: 'Task Extraction',
    desc: 'Converts action items into tasks with deadlines and priority levels.',
    color: 'from-rose-500/10 to-pink-500/10 border-rose-200/50',
    iconColor: 'text-rose-600',
  },
  {
    icon: Clock,
    title: 'Follow-Up Reminders',
    desc: 'Detects when a reply is expected and suggests when to follow up.',
    color: 'from-sky-500/10 to-blue-500/10 border-sky-200/50',
    iconColor: 'text-sky-600',
  },
  {
    icon: FileSearch,
    title: 'Key Info Extraction',
    desc: 'Pulls out dates, links, contacts, and monetary amounts from threads.',
    color: 'from-teal-500/10 to-emerald-500/10 border-teal-200/50',
    iconColor: 'text-teal-600',
  },
  {
    icon: Tags,
    title: 'Auto Labeling',
    desc: 'Suggests smart labels for organizing and finding emails later.',
    color: 'from-fuchsia-500/10 to-purple-500/10 border-fuchsia-200/50',
    iconColor: 'text-fuchsia-600',
  },
  {
    icon: Shield,
    title: 'Human-in-the-Loop',
    desc: 'AI never acts alone. You review, edit, and approve every action.',
    color: 'from-slate-500/10 to-gray-500/10 border-slate-200/50',
    iconColor: 'text-slate-600',
  },
]

const steps = [
  { step: '01', label: 'Analyze', detail: 'AI reads the full thread and understands context', icon: Brain },
  { step: '02', label: 'Extract', detail: 'Tasks, deadlines, meetings, and key information', icon: FileSearch },
  { step: '03', label: 'Prepare', detail: 'Draft replies, smart actions, and calendar events', icon: Sparkles },
  { step: '04', label: 'You decide', detail: 'Review, edit, approve, or ignore — you stay in control', icon: Shield },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100/80 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/inbox"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Open Inbox <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/signin"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-5 py-2 rounded-xl text-sm transition-all shadow-sm shadow-blue-500/25">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-20 px-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50/80 border border-blue-200/60 rounded-full px-4 py-2 text-sm text-blue-700 font-medium mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            Powered by Groq AI
            <span className="w-1 h-1 rounded-full bg-blue-400" />
            <span className="text-blue-500">Lightning fast</span>
          </div>
          <h1 className="text-6xl sm:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
            Your inbox,<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              understood.
            </span>
          </h1>
          <p className="mt-8 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
            MailMate reads your emails, extracts what matters, drafts replies,
            finds deadlines, and prepares actions — all before you lift a finger.
          </p>
          <div className="mt-12 flex items-center justify-center gap-4 flex-wrap">
            <Link href="/auth/signin"
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5">
              Connect Gmail <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/inbox"
              className="inline-flex items-center gap-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-4 rounded-2xl text-base transition-all border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5">
              <Play className="w-4 h-4 fill-current" /> Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-50/80 to-white border-y border-gray-100/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">One click. Full intelligence.</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto text-lg">
              Select an email and MailMate instantly delivers everything you need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-6 h-px bg-gradient-to-r from-blue-300 to-transparent z-10" />
                )}
                <div className="bg-white border border-gray-200/80 rounded-2xl p-6 text-center hover:shadow-lg hover:border-blue-200/60 transition-all hover:-translate-y-1 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm shadow-blue-500/20 group-hover:shadow-md group-hover:shadow-blue-500/30 transition-shadow">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-blue-600/60 uppercase tracking-wider">Step {s.step}</span>
                  <p className="font-bold text-gray-900 text-lg mt-1">{s.label}</p>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Built for people who get too much email</h2>
            <p className="text-gray-500 mt-3 text-lg">Every feature exists to save you time and reduce inbox anxiety.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title}
                className={`group border rounded-2xl p-6 bg-gradient-to-br ${f.color} hover:shadow-lg transition-all hover:-translate-y-0.5`}>
                <div className="w-11 h-11 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:shadow transition-shadow">
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to take control of your inbox?</h2>
          <p className="text-gray-400 mt-4 text-lg">No sign-up required to try. Start analyzing emails instantly.</p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Link href="/auth/signin"
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all shadow-lg shadow-blue-500/25">
              Connect Gmail <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/inbox"
              className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all border border-white/20 backdrop-blur-sm">
              Launch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <p className="text-sm text-gray-400">Built with Next.js + Groq AI &middot; Team Avalon</p>
        </div>
      </footer>
    </main>
  )
}
