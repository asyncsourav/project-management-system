import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  BookOpen,
  ShieldCheck,
  GitPullRequest,
  MessageSquare,
  ArrowRight,
  LayoutDashboard,
  FileText,
  Users,
  CheckCircle2,
  Video,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Play,
  Copy,
  Check,
  Menu,
  X,
  Shield,
  BarChart3,
  GraduationCap,
  UserCheck,
  LogIn,
  UserPlus,
  Send,
  Mic,
  PhoneOff
} from 'lucide-react';

export const LandingPage = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState('student');
  const [activePreviewTab, setActivePreviewTab] = useState('dashboard');
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [copiedRole, setCopiedRole] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'Student') return '/student/dashboard';
    if (user.role === 'Teacher') return '/teacher/dashboard';
    return '/admin/dashboard';
  };

  const handleCopyDemo = (role, email) => {
    navigator.clipboard.writeText(email);
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  const faqs = [
    {
      q: 'How does the Proposal State Machine work?',
      a: 'Proposals undergo a 4-stage workflow: Draft submission, Faculty review & revision requests, Approval, and Completion. Every status change generates audit logs and instant notifications for all stakeholders.'
    },
    {
      q: 'How does Atomic Quota Enforcement prevent supervisor overbooking?',
      a: 'The backend uses MongoDB atomic database transactions and strict query checks when a student requests a supervisor. If a supervisor reaches their max capacity (e.g. 5 projects), no further proposals can be allocated to them under any concurrency condition.'
    },
    {
      q: 'Are the real-time chat and WebRTC calls secure?',
      a: 'Yes! Instant chat messages are transmitted over secure Socket.io WebSocket channels with JWT authentication. WebRTC audio/video call signaling is end-to-end encrypted peer-to-peer.'
    },
    {
      q: 'Can administrators adjust supervisor capacity limits?',
      a: 'Yes. Department chairs and system admins can view supervisor workload metrics, modify maximum student quotas per teacher, and manage user roles in real-time from the Admin Governance tab.'
    },
    {
      q: 'How do students submit project deliverables and documents?',
      a: 'Students can upload versioned PDF, DOCX, or archive files directly through their Student Workspace. Supervisors receive instant alerts, can review document histories, and attach feedback comments.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      <div>
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-400 bg-clip-text text-transparent">
                  EduNexus
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Governance Platform
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Features
              </a>
              <a href="#roles" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Roles & Workspaces
              </a>
              <a href="#workflow" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Governance Workflow
              </a>
              <a href="#webrtc" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                WebRTC & Security
              </a>
              <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                FAQ
              </a>
            </nav>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Demo Logins
              </button>

              {user ? (
                <Link
                  to={getDashboardPath()}
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-xs font-semibold px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Features
              </a>
              <a
                href="#roles"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Roles & Workspaces
              </a>
              <a
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Governance Workflow
              </a>
              <a
                href="#webrtc"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                WebRTC & Security
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                FAQ
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setDemoModalOpen(true);
                }}
                className="w-full text-left py-2 px-3 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> View Demo Accounts
              </button>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          {/* Glowing Background Accent Spheres */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
              <span>Next-Gen Academic Project Governance Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 text-4xl sm:text-6xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-[1.15] max-w-4xl mx-auto">
              University Capstone Projects & Governance,{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
                Streamlined.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              A unified operating system for students, faculty supervisors, and department administrators. Manage multi-stage proposal workflows, enforce atomic faculty quotas, chat in real-time, and host WebRTC video defense sessions.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
              {user ? (
                <Link
                  to={getDashboardPath()}
                  className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 group"
                >
                  Open Your Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 group"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDemoModalOpen(true)}
                    className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm transition-all shadow-sm flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                    Quick Demo Logins
                  </button>
                </>
              )}
            </div>

            {/* Interactive Dashboard Preview Showcase */}
            <div className="mt-14 max-w-5xl mx-auto">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-left">
                {/* Browser Top Window Bar */}
                <div className="px-4 py-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-[11px] font-mono text-slate-400">
                      https://edunexus.university.edu/{activePreviewTab}
                    </span>
                  </div>

                  {/* Tabs Selector inside browser header */}
                  <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setActivePreviewTab('dashboard')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        activePreviewTab === 'dashboard'
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Student Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePreviewTab('proposals')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        activePreviewTab === 'proposals'
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Proposal Workflow
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePreviewTab('chat')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        activePreviewTab === 'chat'
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Live Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePreviewTab('webrtc')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        activePreviewTab === 'webrtc'
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      WebRTC Defense
                    </button>
                  </div>
                </div>

                {/* Preview Content Area */}
                <div className="p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-900/50 min-h-[360px]">
                  {activePreviewTab === 'dashboard' && (
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                            JD
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                              John Doe (CS-2026-08)
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Supervisor: Dr. Alan Turing &bull; Department of AI & Software Systems
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Proposal Approved
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Deliverables Progress
                          </div>
                          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                            3 / 4 Milestones
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                            <div className="bg-indigo-600 h-full w-3/4 rounded-full" />
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Supervisor Quota Status
                          </div>
                          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                            4 / 5 Seats Allocated
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">Atomic Lock Active</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Next Defense Sync
                          </div>
                          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
                            Today 15:00
                          </div>
                          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                            WebRTC Call Ready &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePreviewTab === 'proposals' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          Proposal Workflow Engine (State Machine)
                        </h4>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          Strict Audit Log Enabled
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl">
                          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            1. Draft
                          </div>
                          <div className="text-[11px] text-emerald-600/80 mt-0.5">Submitted</div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl">
                          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            2. Review
                          </div>
                          <div className="text-[11px] text-emerald-600/80 mt-0.5">Evaluated</div>
                        </div>
                        <div className="bg-indigo-100 dark:bg-indigo-950 border border-indigo-300 dark:border-indigo-700 p-3 rounded-xl shadow-sm">
                          <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1">
                            <Sparkles className="w-3 h-3" /> 3. Approved
                          </div>
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                            Active State
                          </div>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl opacity-60">
                          <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            4. Complete
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Pending Defense</div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          Thesis: "Distributed Consensus Protocols in Autonomous Systems"
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">
                          Evaluated by Dr. Alan Turing. Feedback: "Methodology is solid. Hardware lab requirements approved."
                        </p>
                      </div>
                    </div>
                  )}

                  {activePreviewTab === 'chat' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            Dr. Alan Turing
                          </span>
                          <span className="text-[10px] text-slate-400">(Supervisor)</span>
                        </div>
                        <span className="text-[11px] text-indigo-600 font-semibold">
                          Socket.io Real-Time Channel
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-start">
                          <div className="bg-slate-100 dark:bg-slate-700 p-2.5 rounded-2xl rounded-tl-none text-slate-800 dark:text-slate-200 max-w-[80%]">
                            Hi John, please send over the latest draft of Chapter 3 PDF before our sync.
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-indigo-600 text-white p-2.5 rounded-2xl rounded-tr-none max-w-[80%]">
                            Just uploaded `Thesis_Draft_v3.pdf` to the repository, Dr. Turing!
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          readOnly
                          value="Type a message or attach deliverable..."
                          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400"
                        />
                        <button type="button" className="p-2 rounded-xl bg-indigo-600 text-white">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {activePreviewTab === 'webrtc' && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 text-white relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-xs text-slate-200">
                            P2P WebRTC Video Defense Session
                          </span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                          00:14:32 &bull; HD Call
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 h-36">
                        <div className="bg-slate-800 rounded-xl flex flex-col items-center justify-center relative overflow-hidden border border-slate-700">
                          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                            AT
                          </div>
                          <span className="text-[11px] font-semibold mt-2 text-slate-300">
                            Dr. Alan Turing
                          </span>
                          <span className="absolute bottom-2 left-2 text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-slate-300">
                            Supervisor
                          </span>
                        </div>
                        <div className="bg-slate-800 rounded-xl flex flex-col items-center justify-center relative overflow-hidden border border-slate-700">
                          <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                            JD
                          </div>
                          <span className="text-[11px] font-semibold mt-2 text-slate-300">
                            John Doe
                          </span>
                          <span className="absolute bottom-2 left-2 text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-slate-300">
                            Student (Presenter)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-3 mt-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                          <Video className="w-4 h-4" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
                          <PhoneOff className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats & Trust Metrics Banner */}
        <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-10 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">
                  100%
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Atomic Quota Safety
                </div>
                <p className="text-[11px] text-slate-500">Concurrency-safe MongoDB locks</p>
              </div>

              <div className="p-4 space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400">
                  4-Stage
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  State Machine
                </div>
                <p className="text-[11px] text-slate-500">Draft &rarr; Review &rarr; Approval</p>
              </div>

              <div className="p-4 space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                  P2P HD
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  WebRTC Calls
                </div>
                <p className="text-[11px] text-slate-500">Encrypted thesis video defenses</p>
              </div>

              <div className="p-4 space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-amber-500 dark:text-amber-400">
                  Instant
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Socket.io Sync
                </div>
                <p className="text-[11px] text-slate-500">Live chat & unread badges</p>
              </div>
            </div>
          </div>
        </section>

        {/* Roles & Tailored Workspaces Section (#roles) */}
        <section id="roles" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-full">
              Tailored User Personas
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 mt-4 tracking-tight">
              Designed for Everyone in the Academic Chain
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              Switch between roles to explore the unique tools created for students, faculty supervisors, and department chairs.
            </p>
          </div>

          {/* Role Tabs Buttons */}
          <div className="mt-10 flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveRoleTab('student')}
                className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                  activeRoleTab === 'student'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Students
              </button>
              <button
                type="button"
                onClick={() => setActiveRoleTab('teacher')}
                className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                  activeRoleTab === 'teacher'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <UserCheck className="w-4 h-4" /> Faculty Supervisors
              </button>
              <button
                type="button"
                onClick={() => setActiveRoleTab('admin')}
                className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                  activeRoleTab === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" /> Department Admins
              </button>
            </div>
          </div>

          {/* Role Content Card */}
          <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
            {activeRoleTab === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Student Workspace
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Submit capstone proposals with rich metadata, choose preferred faculty advisors based on real-time availability, upload project milestones, and conduct virtual defenses.
                  </p>

                  <ul className="space-y-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Browse faculty supervisor quotas & expertise domains
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Track proposal evaluation status with real-time feedback
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Instant P2P WebRTC calls for thesis defenses and syncs
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span>Active Student Proposal</span>
                    <span className="text-emerald-600 font-mono">STATUS: APPROVED</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400">Title:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      AI-Driven Automated Code Refactoring & Testing
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400">Assigned Advisor</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">Dr. Sarah Connor</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400">Document Uploads</div>
                      <div className="font-bold text-indigo-600">4 Versioned Files</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeRoleTab === 'teacher' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Faculty Advisor Portal
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Review student proposals, manage supervision capacity, provide inline revision feedback, grade milestone deliverables, and host WebRTC viva sessions.
                  </p>

                  <ul className="space-y-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Approve or request revisions on pending proposals
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Enforce quota capacity (e.g., 5 students max) automatically
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Direct chat messaging and unread notification badges
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span>Supervisor Capacity Quota</span>
                    <span className="text-indigo-600 font-mono">4 / 5 Seats Occupied</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          Proposal #104 - Neural Network Compression
                        </div>
                        <div className="text-[10px] text-slate-400">Student: Alex Mercer</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        Needs Review
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeRoleTab === 'admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Department Chair & Admin Hub
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Gain system-wide governance overview, manage user roles (Student, Teacher, Admin), set supervisor capacity limits, monitor approval analytics, and oversee department projects.
                  </p>

                  <ul className="space-y-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Role promotion and user account status controls
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Global project status analytics and department reporting
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Supervisor capacity override & audit logs
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span>Department Analytics Overview</span>
                    <span className="text-purple-600 font-mono">CS & SE DEPT</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <div className="text-lg font-black text-slate-900 dark:text-slate-100">128</div>
                      <div className="text-[10px] text-slate-400">Total Students</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <div className="text-lg font-black text-indigo-600">24</div>
                      <div className="text-[10px] text-slate-400">Faculty Members</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <div className="text-lg font-black text-emerald-600">94%</div>
                      <div className="text-[10px] text-slate-400">Approved Ratio</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Capabilities Grid (#features) */}
        <section id="features" className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-full">
                Core Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 mt-4 tracking-tight">
                Engineered for Academic Rigor & Reliability
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
                Everything required to run smooth, transparent, and compliant final year project cycles.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg hover:border-indigo-500/50 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GitPullRequest className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-5">
                  Proposal State Machine
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Enforces structured transitions across Draft, Submitted, Revision Needed, Approved, and Completed phases with full audit timestamps.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg hover:border-indigo-500/50 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-5">
                  Atomic Faculty Quota Locks
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Database transaction locks prevent supervisor capacity overbooking during high-concurrency selection periods.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg hover:border-indigo-500/50 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-5">
                  Real-Time Collaboration
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Socket.io powered instant chat, online status indicators, document attachments, and unread message counters.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg hover:border-indigo-500/50 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-rose-600/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-5">
                  WebRTC Video Defenses
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Conduct remote viva thesis defenses directly within the app using high-definition peer-to-peer audio and video calls.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg hover:border-indigo-500/50 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-5">
                  Versioned Deliverables
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Organized artifact repository with submission tracking, supervisor notes, and revision comparisons.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg hover:border-indigo-500/50 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-5">
                  Admin Governance Analytics
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Department-wide overview dashboard for capacity planning, role permissions, and thesis completion metrics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Governance Workflow Steps (#workflow) */}
        <section id="workflow" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-full">
              4-Step Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 mt-4 tracking-tight">
              How EduNexus Governs Projects
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              From proposal drafting to thesis defense approval in four clear stages.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 relative">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Submit Proposal
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Student completes problem statement, tech stack, goals, and selects preferred faculty advisor.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 relative">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Faculty & Quota Check
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Supervisor evaluates proposal; backend validates atomic capacity quota before assigning seat.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 relative">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Milestones & Chat
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Student uploads progress reports; supervisor reviews draft chapters and syncs via real-time chat.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 relative">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center justify-center mb-4">
                04
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                WebRTC Defense & Approval
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Final viva video defense session conducted in-app; project marked completed in department records.
              </p>
            </div>
          </div>
        </section>

        {/* WebRTC & Security Spotlight (#webrtc) */}
        <section id="webrtc" className="py-20 bg-slate-900 text-white transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full">
                  Real-Time Engine & WebRTC
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  High-Definition Video Defense & Instant Messaging Built In
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  No need for external video meeting tools. EduNexus includes built-in P2P WebRTC audio and video calling with global incoming call popups, active status badges, and Socket.io signaling.
                </p>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>JWT Authorized WebSockets with automatic refresh token handling</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                    <Video className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span>Low latency P2P WebRTC audio & video streams</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                    <Lock className="w-5 h-5 text-purple-400 shrink-0" />
                    <span>Concurrency safe atomic DB operations for supervisor quotas</span>
                  </div>
                </div>
              </div>

              {/* WebRTC Interactive Box Mock */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-xs text-slate-200">
                      Active Defense Session #402
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-400">
                    WebRTC Audio/Video Peer Connected
                  </span>
                </div>

                <div className="aspect-video bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-lg">
                      SC
                    </div>
                    <div className="font-bold text-sm text-slate-100">
                      Dr. Sarah Connor &bull; Supervisor
                    </div>
                    <p className="text-xs text-emerald-400 font-mono">"Presentation slide 14 looks good!"</p>
                  </div>
                  <div className="absolute bottom-3 right-3 w-28 h-20 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    You (Student)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section (#faq) */}
        <section id="faq" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-full">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-4 tracking-tight">
              Everything You Need to Know
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.q}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Ready to Upgrade Your Academic Project Governance?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-indigo-100 max-w-2xl mx-auto">
              Join students, faculty advisors, and department heads using EduNexus today.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {user ? (
                <Link
                  to={getDashboardPath()}
                  className="px-8 py-3.5 rounded-2xl bg-white text-indigo-600 font-extrabold text-sm hover:bg-slate-100 transition-all shadow-lg flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3.5 rounded-2xl bg-white text-indigo-600 font-extrabold text-sm hover:bg-slate-100 transition-all shadow-lg flex items-center gap-2"
                  >
                    Create Account Now <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-3.5 rounded-2xl bg-indigo-900/60 hover:bg-indigo-900/80 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Demo Accounts Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
            <button
              type="button"
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full">
                Quick Exploration Mode
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
                Demo Credentials
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Copy demo emails to test the platform as different roles:
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Student Demo */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Student Account
                  </div>
                  <div className="font-mono text-slate-500 mt-0.5">student@edunexus.edu</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyDemo('student', 'student@edunexus.edu')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold flex items-center gap-1.5"
                >
                  {copiedRole === 'student' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>

              {/* Teacher Demo */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-purple-500" /> Faculty Supervisor
                  </div>
                  <div className="font-mono text-slate-500 mt-0.5">teacher@edunexus.edu</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyDemo('teacher', 'teacher@edunexus.edu')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold flex items-center gap-1.5"
                >
                  {copiedRole === 'teacher' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>

              {/* Admin Demo */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" /> Department Chair
                  </div>
                  <div className="font-mono text-slate-500 mt-0.5">admin@edunexus.edu</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyDemo('admin', 'admin@edunexus.edu')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold flex items-center gap-1.5"
                >
                  {copiedRole === 'admin' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/50 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-700 dark:text-indigo-300">
              <strong>Password for all demo accounts:</strong> <code className="bg-indigo-100 dark:bg-indigo-900/80 px-1.5 py-0.5 rounded font-mono">password123</code>
            </div>

            <Link
              to="/login"
              onClick={() => setDemoModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              Proceed to Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">EduNexus</span>
              <p className="text-[11px]">Academic Project & Governance Hub</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 font-semibold">
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#roles" className="hover:text-indigo-600 transition-colors">
              Role Workspaces
            </a>
            <a href="#workflow" className="hover:text-indigo-600 transition-colors">
              Governance Workflow
            </a>
            <a href="#webrtc" className="hover:text-indigo-600 transition-colors">
              WebRTC Defenses
            </a>
            <Link to="/login" className="hover:text-indigo-600 transition-colors">
              Portal Sign In
            </Link>
          </div>

          <div className="text-center md:text-right">
            <div>&copy; {new Date().getFullYear()} EduNexus Governance Inc.</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Powered by React 19 & Socket.io</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
