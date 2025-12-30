"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Globe,
  ArrowRight,
  Edit2,
  Check,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleJoinWaitlist = async () => {
    if (!email || !email.includes('@')) {
      setMessage("Please enter a valid email address.");
      setStatus('error');
      return;
    }
    setStatus('loading');
    setMessage("");

    try {
      const { error } = await supabase.from('waitlist').insert({ email });
      if (error) {
        if (error.code === '23505') { // Unique violation
          setMessage("You're already on the waitlist!");
          setStatus('success');
        } else {
          console.error(error);
          setMessage("Something went wrong. Please try again.");
          setStatus('error');
        }
      } else {
        setMessage("You're on the list! We'll be in touch.");
        setStatus('success');
        setEmail("");
      }
    } catch (e) {
      console.error(e);
      setMessage("Something went wrong. Please try again.");
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-manrope selection:bg-[#ccfd14] selection:text-black overflow-x-hidden flex flex-col">

      {/* Background Gradient Mesh - Darker and more subtle */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-blue-900/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[20%] w-[50%] h-[50%] bg-[#ccfd14]/5 rounded-full blur-[150px]" />
      </div>

      {/* Modern Minimal Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#050505]/80 backdrop-blur-md border-b border-white/5' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <img src="/ventra-logo.svg" alt="Ventra" className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight text-white font-space">Ventra</span>
          </div>

          <Button
            onClick={() => router.push('/onboarding')}
            className="bg-[#ccfd14] hover:bg-[#b0da0f] text-black rounded-full px-6 py-2 font-bold text-sm transition-all"
          >
            Download App
          </Button>
        </div>
      </nav>

      <main className="relative z-10 w-full flex-grow flex flex-col justify-center items-center">




        {/* Center Content */}
        <section className="relative flex flex-col items-center text-center px-6 max-w-4xl mx-auto z-20">

          {/* Main Headline */}
          <h1
            className="text-4xl md:text-6xl font-semibold tracking-tight text-white leading-[1.2] mb-6"
          >
            <span className="text-[#ccfd14]">Sell Anything. From Anywhere.</span><br />
            <span className="text-white">With Just Your Phone.</span>
          </h1>

          {/* Subtext */}
          <p
            className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed mb-10 font-normal"
          >
            Build a global storefront in 60 seconds. Accept worldwide payments and withdraw to any option based on your location.
          </p>

          {/* Email Input / CTA */}
          <div
            className="w-full max-w-md mx-auto relative mb-12"
          >
            <div className="relative flex items-center">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading' || status === 'success'}
                className="w-full h-14 pl-6 pr-40 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-all text-base disabled:opacity-50"
              />
              <Button
                onClick={handleJoinWaitlist}
                disabled={status === 'loading' || status === 'success'}
                className="absolute right-1 top-1 bottom-1 bg-[#ccfd14] hover:bg-[#b0da0f] text-black rounded-full px-6 font-bold text-sm h-auto transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Joining...' : status === 'success' ? 'Joined!' : 'Join waitlist'}
              </Button>
            </div>
            {message && (
              <p
                className={`text-sm mt-4 ${status === 'error' ? 'text-red-400' : 'text-[#ccfd14]'}`}
              >
                {message}
              </p>
            )}
          </div>



        </section>

        <footer
          className="fixed bottom-6 text-gray-600 text-sm font-medium hover:text-gray-400 transition-colors z-20"
        >
          <a href="mailto:keith@tryventra.com">keith@tryventra.com</a>
        </footer>

      </main>
    </div>
  );
}
