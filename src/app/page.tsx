"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Store, Zap, Globe, ShieldCheck, ArrowRight, Star } from "lucide-react";

export default function LandingPage() {
  const [storeName, setStoreName] = useState("");
  const router = useRouter();

  const handleCreateStore = () => {
    if (!storeName) return;
    router.push(`/signup?store=${encodeURIComponent(storeName)}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-white selection:bg-sky-500 selection:text-white overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px] animate-pulse-subtle"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse-subtle" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto w-full sticky top-0 bg-[#020617]/50 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-400 to-indigo-600 rounded flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Store className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">merh.store</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/login" className="text-xs sm:text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Login
          </Link>
          <Button variant="default" onClick={() => router.push('/signup')} className="bg-white text-black hover:bg-gray-200 rounded px-4 sm:px-8 py-1 sm:py-2 text-xs sm:text-sm font-bold shadow-xl transition-all hover:scale-105 active:scale-95">
            Get Started
          </Button>
        </div>
      </nav>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded bg-white/5 border border-white/10 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-sky-400 mb-8 sm:mb-10 animate-fade-in shadow-inner">
            <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-current" />
            <span>The easiest way to sell online</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 sm:mb-8 leading-[1.1] sm:leading-[0.95] bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50">
            Build your micro-store in <span className="text-sky-400 italic font-medium">seconds.</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed font-medium px-4 sm:px-0">
            Forget complex setups. Sell anything, anywhere, directly from your pocket. The power of Linktree meets the punch of Shopify.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-2xl mx-auto p-1.5 sm:p-2 rounded-md bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl">
            <div className="relative flex-1 w-full group">
              <span className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-base sm:text-lg whitespace-nowrap">merh.store/</span>
              <input
                type="text"
                placeholder="yourname"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateStore()}
                className="w-full pl-[95px] sm:pl-[125px] pr-4 sm:pr-6 py-4 sm:py-5 rounded bg-transparent border-none focus:ring-0 transition-all outline-none text-lg sm:text-xl font-bold text-white placeholder:text-gray-700"
              />
            </div>
            <Button
              size="lg"
              onClick={handleCreateStore}
              className="w-full sm:w-auto h-12 sm:h-16 px-8 sm:px-12 rounded bg-sky-500 text-white text-base sm:text-lg font-black hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 group"
            >
              Claim Username <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
              <ShieldCheck className="w-3 sm:w-4 h-3 sm:h-4 text-emerald-500" /> No credit card required
            </p>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-white/10"></div>
            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
              <Star className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-500 fill-yellow-500" /> Setup in 2 minutes
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-4 sm:px-6 py-20 sm:py-32 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: Globe,
                  title: "Global Payments",
                  desc: "Accept payments from anywhere. Tailored for creators anywhere, especially emerging markets.",
                  color: "text-sky-400"
                },
                {
                  icon: Zap,
                  title: "Mobile Native",
                  desc: "No laptop? No problem. Manage everything - products, sales, payouts - purely from your phone.",
                  color: "text-indigo-400"
                },
                {
                  icon: CheckCircle2,
                  title: "Unified Inventory",
                  desc: "Digital files, physical goods, or services. Sell it all in one beautifully optimized link.",
                  color: "text-emerald-400"
                }
              ].map((feature, i) => (
                <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden group hover:border-sky-500/30 transition-all hover:bg-white/[0.07] rounded-md">
                  <CardContent className="pt-8 sm:pt-10 p-6 sm:p-8">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-black/40 rounded flex items-center justify-center mb-6 sm:mb-8 border border-white/5 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-6 h-6 sm:w-7 h-7 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-medium">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-24 sm:py-40 text-center max-w-4xl mx-auto">
          <h3 className="text-3xl sm:text-5xl font-black mb-8 sm:mb-10 leading-tight">Ready to launch your <br className="hidden sm:block" />micro-empire?</h3>
          <Button
            onClick={() => router.push('/signup')}
            className="h-14 sm:h-20 px-10 sm:px-16 rounded bg-white text-black text-lg sm:text-2xl font-black hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-2xl"
          >
            Start Selling Now
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-16 border-t border-white/5 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
            <Store className="text-white w-3 h-3" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white/50">merh.store</span>
        </div>
        <p className="text-gray-500 text-sm font-medium">© 2025 merh.store • Powering creators globally.</p>
      </footer>
    </div>
  );
}
