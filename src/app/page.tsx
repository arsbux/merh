"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Store, Zap, Globe, ShieldCheck, ArrowRight, Star, Layers, Cpu, Smartphone } from "lucide-react";

export default function LandingPage() {
  const [storeName, setStoreName] = useState("");
  const router = useRouter();

  const handleCreateStore = () => {
    if (!storeName) return;
    router.push(`/signup?store=${encodeURIComponent(storeName)}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-[#f8fafc] selection:bg-sky-500/30 selection:text-white overflow-x-hidden font-sans">
      {/* Premium Architectural Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] opacity-20"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[120px] animate-pulse-subtle"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-subtle" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full sticky top-0 bg-[#020617]/40 backdrop-blur-2xl z-50 border-b border-white/[0.03]">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-9 h-9 bg-white text-black rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300">
            <Store className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tighter">merh.store</span>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-white transition-colors">
            Login
          </Link>
          <Button
            variant="default"
            onClick={() => router.push('/signup')}
            className="bg-white text-black hover:bg-gray-100 rounded-full px-6 py-2 text-sm font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95 border border-white/20"
          >
            Get Started
          </Button>
        </div>
      </nav>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="px-6 pt-20 sm:pt-32 pb-24 text-center max-w-6xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>The Creator Economy's New Workbench</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-[90px] font-black tracking-tighter mb-8 leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Build your store <br className="hidden sm:block" /> in <span className="text-sky-400 italic">real-time.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 mb-14 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            A minimalist, high-performance storefront for anything you sell. <br className="hidden sm:block" />
            Digital items, services, or physical goods — all in one link.
          </p>

          <div className="w-full max-w-xl mx-auto p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full flex items-center px-6 py-4">
              <span className="text-gray-600 font-black text-lg">merh.store/</span>
              <input
                type="text"
                placeholder="yourname"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateStore()}
                className="flex-1 bg-transparent border-none focus:ring-0 transition-all outline-none text-lg font-black text-white placeholder:text-gray-800 ml-1"
              />
            </div>
            <Button
              size="lg"
              onClick={handleCreateStore}
              className="w-full sm:w-auto h-14 px-8 rounded-xl bg-sky-500 text-white text-base font-black hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2.5 group"
            >
              Claim URL <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-8 text-gray-600 animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Payments
            </div>
            <div className="w-1 h-1 rounded-full bg-white/10"></div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> 0% Platform Fee
            </div>
          </div>

          {/* App Mockup Visual */}
          <div className="mt-24 relative w-full max-w-5xl mx-auto animate-in fade-in zoom-in duration-1000 delay-700">
            <div className="absolute inset-0 bg-sky-500/20 blur-[120px] rounded-full scale-75 -z-10 animate-pulse-subtle"></div>
            <div className="relative rounded-3xl border border-white/10 p-4 bg-white/[0.02] backdrop-blur-3xl shadow-inner group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-400/50 to-transparent"></div>
              <img
                src="/mockup.png"
                alt="Merh App Interface"
                className="w-full h-auto rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]"
              />
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="px-6 py-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Big Bento Item */}
            <div className="md:col-span-8 bg-white/[0.02] border border-white/[0.05] rounded-[32px] p-10 flex flex-col justify-between group hover:bg-white/[0.04] transition-all hover:border-white/[0.1] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-sky-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-sky-500/10 transition-colors"></div>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-8 border border-sky-500/20 group-hover:scale-110 transition-transform">
                  <Globe className="w-7 h-7 text-sky-400" />
                </div>
                <h3 className="text-3xl font-black tracking-tight text-white mb-4 leading-tight">Sell to the World,<br />Get Paid Locally.</h3>
                <p className="text-gray-500 text-lg font-medium max-w-md leading-relaxed">
                  Accept global payments and withdraw directly to your Mobile Money or Local Bank. Tailored specifically for emerging markets.
                </p>
              </div>
              <div className="mt-12 flex gap-4">
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest">Global Reach</div>
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest">Local Payouts</div>
              </div>
            </div>

            {/* Small Bento Item */}
            <div className="md:col-span-4 bg-[#0f172a]/50 border border-white/[0.05] rounded-[32px] p-10 flex flex-col justify-between group hover:bg-[#0f172a] transition-all hover:border-white/[0.1]">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-8 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white mb-3 leading-tight">Phone Only Layout.</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  No laptop required. Manage your entire storefront, inventory, and sales analytics directly from your pocket.
                </p>
              </div>
            </div>

            {/* Another Small Bento Item */}
            <div className="md:col-span-4 bg-white/[0.02] border border-white/[0.05] rounded-[32px] p-10 flex flex-col justify-between group hover:bg-white/[0.04] transition-all hover:border-white/[0.1]">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Layers className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white mb-3 leading-tight">Unified Goods.</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  Sell PDFs, physical merchandise, or 1-on-1 consultations in a single, high-conversion interface.
                </p>
              </div>
            </div>

            {/* medium Bento Item */}
            <div className="md:col-span-8 bg-[#0f172a]/30 border border-white/[0.05] rounded-[32px] p-10 flex flex-col md:flex-row items-center justify-between group hover:bg-[#0f172a]/50 transition-all hover:border-white/[0.1]">
              <div className="max-w-xs">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                  <Cpu className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white mb-3">Instant Intelligence.</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  Get real-time insights on which products are trending and optimize your pricing with automated suggestions.
                </p>
              </div>
              <div className="mt-8 md:mt-0 flex flex-col items-center gap-4 bg-black/40 p-8 rounded-2xl border border-white/5 shadow-2xl skew-x-1 group-hover:skew-x-0 transition-transform">
                <div className="h-2 w-32 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 w-[70%]" />
                </div>
                <div className="h-2 w-24 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[40%]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Prop Banner */}
        <section className="px-6 py-20 bg-white/5 border-y border-white/[0.05]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-4">
              <h3 className="text-3xl font-black">Join 10,000+ creators.</h3>
              <p className="text-gray-500 font-medium max-w-md">From designers and developers to writers and coaches, the future of commerce is micro.</p>
            </div>
            <div className="flex gap-8 items-center text-white/20 font-black text-2xl tracking-[0.2em]">
              <span>DESIGNERS</span>
              <span className="w-1 h-1 bg-white/10 rounded-full"></span>
              <span>CREATORS</span>
              <span className="w-1 h-1 bg-white/10 rounded-full"></span>
              <span>COACHES</span>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-40 text-center max-w-5xl mx-auto">
          <h3 className="text-[40px] sm:text-[64px] font-black mb-10 leading-[1] tracking-tighter">Your micro-empire <br />starts <span className="text-sky-400">here.</span></h3>
          <p className="text-gray-500 text-xl font-medium mb-12 max-w-xl mx-auto">Build your store twice as fast, sell three times as much. No complexity, just commerce.</p>
          <Button
            onClick={() => router.push('/signup')}
            className="h-20 px-16 rounded-full bg-white text-black text-xl font-black hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)] border border-white/20"
          >
            Go Live Now
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-24 border-t border-white/[0.03] text-center relative z-10">
        <div className="flex flex-col items-center gap-10">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
              <Store className="text-white w-4 h-4" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-black tracking-tight text-white/50">merh.store</span>
          </div>

          <div className="flex gap-10 text-xs font-bold uppercase tracking-widest text-gray-600">
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
            <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>

          <p className="text-gray-700 text-[10px] font-bold uppercase tracking-[0.3em]">© 2025 merh.store • Precision commerce for everyone.</p>
        </div>
      </footer>
    </div>
  );
}
