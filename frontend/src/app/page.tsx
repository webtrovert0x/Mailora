'use client'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useMailbox } from '@/hooks/useMailbox'
import { 
  ShieldCheck, 
  Zap, 
  Globe, 
  ArrowRight, 
  Settings, 
  Sparkles, 
  Wand2, 
  Lock, 
  Cpu, 
  Mail, 
  CheckCircle2, 
  Fingerprint,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

export default function Home() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { getMyAlias } = useMailbox()
  const [mounted, setMounted] = useState(false)
  const [userAlias, setUserAlias] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isConnected && address) {
      getMyAlias()
        .then(alias => setUserAlias(alias))
        .catch(() => setUserAlias(null))
    } else {
      setUserAlias(null)
    }
  }, [isConnected, address])

  if (!mounted) return null

  return (
    <div className="relative flex flex-col items-center min-h-screen overflow-x-hidden bg-[#06090e] selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Background Decorative Gradients & Mesh */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[60%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Header Navigation Bar */}
      <header className="relative z-20 w-full max-w-7xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden shadow-lg shadow-emerald-500/20 border border-emerald-500/30 ring-2 ring-emerald-500/20">
            <img src="/logo.png" alt="Mailora Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              Mailora
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                AI + Web3
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://scan.botchain.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            BOT Chain Mainnet (677)
            <ExternalLink className="w-3 h-3 ml-0.5 text-slate-500" />
          </a>

          {isConnected ? (
            <Link href="/dashboard">
              <button className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                Open Dashboard
                <ArrowRight size={16} />
              </button>
            </Link>
          ) : (
            <button
              onClick={() => open()}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl transition-all border border-white/10 flex items-center gap-2"
            >
              <Fingerprint size={16} className="text-emerald-400" />
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 pb-20 text-center max-w-5xl w-full">
        
        {/* Network & AI Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-8 backdrop-blur-xl shadow-inner"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Powered by BOT Chain & Integrated Neural AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-white mb-6 leading-[1.08]"
        >
          The Intelligent <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Web3 Mailbox
          </span>
          <span className="text-emerald-400">.</span>
        </motion.h1>

        {/* Hero Description */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl font-normal leading-relaxed"
        >
          Decentralized, zero-knowledge encrypted messaging on <strong className="text-white font-semibold">BotChain</strong>. Supercharged with built-in <strong className="text-emerald-400 font-semibold">AI Smart Compose</strong>, threat scanners, and 1-click summarization.
        </motion.p>

        {/* Call to Action Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-md mb-16"
        >
          {isConnected ? (
            <div className="flex flex-col items-center gap-5 p-6 bg-slate-900/70 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl relative">
              <div className="flex flex-col items-center">
                <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> BotChain Connected
                </span>
                <span className="text-base text-emerald-300 font-mono font-bold bg-white/[0.04] px-4 py-1.5 rounded-xl border border-emerald-500/20 mt-2">
                  {userAlias ? `${userAlias}@mailora` : `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                </span>
              </div>

              <div className="w-full flex gap-3">
                <button 
                  onClick={() => open()}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 font-medium text-xs transition-colors flex items-center justify-center gap-2 border border-white/5"
                >
                  <Settings size={15} />
                  Wallet
                </button>
                <Link href="/dashboard" className="flex-1">
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                    Launch Inbox
                    <ArrowRight size={16} />
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <button
              onClick={() => open()}
              className="w-full px-8 py-5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:opacity-95 text-slate-950 text-lg font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transform"
            >
              <Fingerprint size={24} />
              Connect Wallet to Launch
            </button>
          )}
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left"
        >
          {[
            {
              icon: <Wand2 className="w-6 h-6 text-emerald-400" />,
              title: "AI Smart Compose & Tone",
              desc: "Draft complete messages from bullet points and switch between Professional, Web3 Native, or Concise tones with one click.",
              badge: "AI Powered"
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-teal-400" />,
              title: "AI Scam & Phishing Shield",
              desc: "Real-time inspection flags malicious contracts, seed phrase harvesting, and dangerous links before you interact.",
              badge: "Active Defense"
            },
            {
              icon: <Lock className="w-6 h-6 text-cyan-400" />,
              title: "E2E Encrypted on BotChain",
              desc: "Messages are encrypted locally in-browser using recipient public keys and routed securely across IPFS & BotChain.",
              badge: "Zero Knowledge"
            },
            {
              icon: <Globe className="w-6 h-6 text-emerald-400" />,
              title: "Decentralized Handle (@mailora)",
              desc: "Claim your on-chain alias on BOT Chain (Chain ID 677) and map human-readable handles to wallet addresses.",
              badge: "BOT Chain ID"
            },
            {
              icon: <Sparkles className="w-6 h-6 text-teal-400" />,
              title: "1-Click Summaries & Replies",
              desc: "Instantly extract executive takeaways, deadlines, action items, and populate intelligent contextual quick replies.",
              badge: "Productivity"
            },
            {
              icon: <Zap className="w-6 h-6 text-cyan-400" />,
              title: "Sub-Second Gas Efficiency",
              desc: "Super-fast message propagation on BOT Chain with minimal gas footprint and automated draft persistence.",
              badge: "High Performance"
            }
          ].map((feat, i) => (
            <div 
              key={i} 
              className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-emerald-500/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/[0.04] text-slate-400 border border-white/5">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-[11px] text-emerald-400 font-medium">
                <span>Learn more</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Mailora</span>
            <span>—</span>
            <span>Decentralized AI Mailbox on BOT Chain (677)</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <a href="https://scan.botchain.ai" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
              BOT Chain Explorer
            </a>
            <a href="https://rpc.botchain.ai" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
              BOT Chain RPC
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
