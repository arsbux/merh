"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Download,
  Smartphone,
  Globe,
  Layers,
  Plus,
  CheckCircle2,
  Phone,
  CreditCard,
  MessageSquare,
  ChevronDown
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-[#FDDF14] text-black selection:bg-black selection:text-[#FDDF14] overflow-x-hidden font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 w-full sticky top-0 z-50 transition-all bg-[#FDDF14]/80 backdrop-blur-md border-b-2 border-black/5">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-6 h-6 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
            <img src="/LOGO-MERH.svg" alt="Merh Logo" className="w-full h-full" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase italic">MERH.store</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="#features" className="hidden md:block text-[11px] font-black hover:opacity-60 transition-opacity uppercase tracking-widest">Become a Seller</Link>
          <Link href="/login" className="flex items-center justify-center bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold hover:opacity-90 transition-all">
            Log in
          </Link>
          <Button
            onClick={() => router.push('/signup')}
            className="hidden sm:flex items-center justify-center bg-transparent text-black border-2 border-black/10 hover:border-black/20 rounded-full px-4 py-1.5 h-auto text-xs font-bold transition-all shadow-none"
          >
            Sign up
          </Button>
        </div>
      </nav>

      <main className="flex-1 relative">
        {/* Hero Section */}
        <section className="px-6 relative min-h-[70vh] flex items-center max-w-7xl mx-auto py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center w-full">

            {/* Visual Side (Mockups) */}
            <div className="lg:col-span-6 relative flex items-center justify-center order-2 lg:order-1 mt-4 lg:mt-0">
              <div className="relative w-full max-w-[240px] h-[300px] flex items-center justify-center">
                {/* Background Left */}
                <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 w-[90px] md:w-[110px] aspect-[9/18.5] rounded-[14px] shadow-lg overflow-hidden -rotate-[10deg] opacity-60 z-10 transition-transform">
                  <img src="/demo-accounts/image copy 2.png" className="w-full h-full object-cover" />
                </div>

                {/* Background Right */}
                <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[90px] md:w-[110px] aspect-[9/18.5] rounded-[14px] shadow-lg overflow-hidden rotate-[10deg] opacity-60 z-10 transition-transform">
                  <img src="/demo-accounts/image copy.png" className="w-full h-full object-cover" />
                </div>

                {/* Front Center */}
                <div className="relative w-[130px] md:w-[160px] aspect-[9/18.5] rounded-[18px] shadow-[0_15px_30px_-8px_rgba(0,0,0,0.3)] overflow-hidden z-20 border-2 border-black/5">
                  <img src="/demo-accounts/image.png" alt="Demo Account" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
              <div className="space-y-3">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-[1000] tracking-tighter leading-[1] uppercase">
                  Sell anything.<br />
                  From anywhere.<br />
                  With just your phone.
                </h1>
                <p className="text-sm md:text-base font-bold max-w-sm opacity-80 leading-snug">
                  Build a store in 30 seconds, get paid globally, and withdraw locally — no desktop, no Stripe headaches, no tech skills required.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button
                  onClick={() => router.push('/signup')}
                  className="w-full sm:w-auto bg-black text-white hover:opacity-90 rounded-full px-6 h-12 text-sm font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-md shadow-black/5"
                >
                  Get started — it’s free
                </Button>
                <Link
                  href="#features"
                  className="text-[11px] font-black uppercase tracking-widest border-b-2 border-black/10 hover:border-black transition-all pb-0.5"
                >
                  See product demo
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block">
            <Link href="#pitch" className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-black/5 hover:border-black/10 hover:bg-black/5 transition-all text-[8px] font-black uppercase tracking-[0.2em]">
              <ChevronDown className="w-3 h-3" />
              Learn More
            </Link>
          </div>
        </section>

        {/* One-line Pitch Section */}
        <section id="pitch" className="bg-black text-[#FDDF14] py-16 md:py-20 px-6 border-y-4 border-black">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg md:text-2xl font-black leading-tight italic tracking-tighter">
              A micro-commerce platform for phone-first sellers — physical goods, digital products, services and paid communities — all handled from one simple app.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white py-16 md:py-24 px-6 space-y-24 md:space-y-32">
          {/* Feature 1 */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="space-y-4">
              <div className="inline-block bg-[#FDDF14] px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 border-black">Feature 01</div>
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-[1000] uppercase italic tracking-tighter leading-none">Setup in seconds</h2>
                <p className="text-base md:text-lg opacity-70 font-medium leading-relaxed max-w-sm">Pick a name, add one photo, paste a payment method — and your store is live. No laptop. No plugins.</p>
              </div>
              <div className="bg-black/5 p-3 rounded-xl border-l-4 border-[#FDDF14] max-w-xs">
                <p className="text-xs font-bold italic">“Create your store in 30s”</p>
              </div>
            </div>
            <div className="bg-[#FDDF14] p-6 md:p-10 rounded-[24px] border-4 border-black shadow-[10px_10px_0px_rgba(0,0,0,1)] flex items-center justify-center">
              <div className="bg-white p-5 rounded-[20px] border-2 border-black w-full max-w-[200px] space-y-3 shadow-lg">
                <div className="h-3 w-16 bg-black/10 rounded" />
                <div className="h-8 w-full bg-black/5 rounded-lg border-2 border-black border-dashed flex items-center justify-center">
                  <Plus className="w-4 h-4 opacity-40" />
                </div>
                <div className="h-8 w-full bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white text-[9px] font-black uppercase tracking-widest">Publish</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="order-1 md:order-2 space-y-4">
              <div className="inline-block bg-[#FDDF14] px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 border-black">Feature 02</div>
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-[1000] uppercase italic tracking-tighter leading-none">Products & Services</h2>
                <p className="text-base md:text-lg opacity-70 font-medium leading-relaxed max-w-sm">Physical goods, digital downloads, appointment bookings, paid communities — one link. Share with WhatsApp, Instagram, SMS.</p>
              </div>
              <div className="flex gap-3 pt-1">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shadow-lg"><Phone className="w-4 h-4 text-white" /></div>
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shadow-lg"><Download className="w-4 h-4 text-white" /></div>
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shadow-lg"><Layers className="w-4 h-4 text-white" /></div>
              </div>
            </div>
            <div className="order-2 md:order-1 bg-black p-6 md:p-10 rounded-[24px] border-4 border-[#FDDF14] shadow-[10px_10px_0px_rgba(253,223,20,1)] flex items-center justify-center">
              <div className="bg-white p-5 rounded-[20px] border-2 border-black w-full max-w-[200px] space-y-3 shadow-lg">
                <div className="aspect-square w-full bg-black/5 rounded-xl flex items-center justify-center">
                  <Layers className="w-10 h-10 opacity-20" strokeWidth={1} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-7 bg-black rounded-md flex items-center justify-center"><span className="text-[8px] text-white font-black uppercase italic">Buy Now</span></div>
                  <div className="h-7 bg-white border-2 border-black rounded-md flex items-center justify-center"><span className="text-[8px] font-black uppercase italic">Book</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4 & 5 Grid */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-black text-[#FDDF14] p-8 md:p-10 rounded-[32px] border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] space-y-4">
              <h3 className="text-2xl md:text-3xl font-[1000] uppercase italic tracking-tighter leading-none">Manage from pocket</h3>
              <p className="text-xs md:text-sm opacity-80 font-medium leading-relaxed max-w-xs">Simple order list, buyer chat, shipping labels, and instant refunds — built for mobile.</p>
              <div className="bg-white/10 p-4 rounded-[16px] flex items-center justify-between group cursor-pointer hover:bg-white/15 transition-all max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-[#FDDF14] rounded-full flex items-center justify-center shadow-lg"><MessageSquare className="w-3.5 h-3.5 text-black" /></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">New order list</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-2" />
              </div>
            </div>
            <div className="bg-white text-black p-8 md:p-10 rounded-[32px] border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] space-y-4">
              <h3 className="text-2xl md:text-3xl font-[1000] uppercase italic tracking-tighter leading-none">Transparent pricing</h3>
              <p className="text-xs md:text-sm opacity-70 font-medium leading-relaxed max-w-xs">Free plan to start. Pay-as-you-grow transaction fees and optional premium features.</p>
              <div className="bg-black text-white p-4 rounded-[16px] flex items-center justify-between max-w-xs">
                <span className="text-[9px] font-black uppercase tracking-widest">Pricing Model</span>
                <span className="text-[9px] font-bold italic opacity-60">0 Monthly to start</span>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="bg-[#FDDF14] py-16 md:py-24 px-6 border-y-4 border-black">
          <div className="max-w-5xl mx-auto space-y-12 md:space-y-16">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-[1000] uppercase italic tracking-tighter leading-none">How it works</h2>
              <p className="text-base md:text-lg font-bold opacity-60">Three steps to your first sale.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 relative">
              <div className="hidden md:block absolute top-[35px] left-0 w-full h-[3px] bg-black/10 z-0"></div>

              <Step number="1" title="Create" desc="Open the app, name your store, add one product." />
              <Step number="2" title="Share" desc="Send your link on WhatsApp, social, or a QR code." />
              <Step number="3" title="Get paid" desc="Customers pay in their currency; you withdraw in yours." />
            </div>
          </div>
        </section>

        {/* Why MERH.STORE */}
        <section className="bg-black text-white py-16 md:py-24 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-[1000] uppercase italic tracking-tighter text-[#FDDF14] leading-[0.85]">Why <br />MERH.STORE?</h2>
            <div className="space-y-8">
              <WhyCard title="Phone-first UX" desc="Built for one-thumb onboarding and management." />
              <WhyCard title="Local Payments" desc="Mobile money + cards that work where you live." />
              <WhyCard title="Zero Friction" desc="No laptop, no Stripe account, no tech skill required." />
              <WhyCard title="Built for Scale" desc="Designed for low-bandwidth and resilient connectivity." />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white py-16 md:py-24 px-6">
          <div className="max-w-3xl mx-auto space-y-12 md:space-y-16">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-[1000] uppercase italic tracking-tighter text-center leading-none">FAQ</h2>
            <div className="space-y-1">
              <FaqItem
                q="Do I need a bank account?"
                a="No. You can withdraw to supported mobile money and local payout methods directly from the app."
              />
              <FaqItem
                q="What countries do you support?"
                a="We support sellers worldwide. Payout options vary by country — we’ll show what’s available at signup."
              />
              <FaqItem
                q="Is it safe to accept cards?"
                a="Yes. Payments are processed securely via our partners, and we handle all fraud checks and 3DS."
              />
              <FaqItem
                q="How long until I receive payouts?"
                a="Standard: 1–7 business days; instant payout options are available on our Pro plan."
              />
            </div>
          </div>
        </section>

        {/* Final CTA Strip */}
        <section className="bg-black text-[#FDDF14] py-24 md:py-32 px-6 overflow-hidden relative border-t-[8px] border-[#FDDF14]">
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-10 md:space-y-12">
            <h3 className="text-3xl md:text-5xl lg:text-6xl font-[1000] tracking-tighter uppercase italic leading-[0.8]">
              Ready to sell <br />from your phone?
            </h3>
            <div className="flex flex-col items-center justify-center gap-6">
              <Button
                onClick={() => router.push('/signup')}
                className="bg-[#FDDF14] text-black h-14 md:h-16 px-10 md:px-12 rounded-full text-lg md:text-2xl font-black uppercase italic hover:scale-105 transition-all shadow-xl active:scale-95"
              >
                Go Live Now
              </Button>
              <p className="text-white/40 font-bold uppercase tracking-[0.3em] italic text-[10px] md:text-xs">Join the waitlist for early payout partners and pilot discounts.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 md:py-12 bg-white border-t-[8px] border-black">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 text-[9px] font-black uppercase tracking-[0.3em] italic">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7">
              <img src="/LOGO-MERH.svg" alt="Merh Logo" className="w-full h-full" />
            </div>
            <span className="text-lg">© 2025 merh.store</span>
          </div>
          <div className="flex gap-10 opacity-60">
            <Link href="#" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-black transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Step({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="relative z-10 space-y-4 md:space-y-6 text-center px-4">
      <div className="w-12 h-12 md:w-16 md:h-16 bg-black text-[#FDDF14] rounded-full mx-auto flex items-center justify-center text-xl md:text-2xl font-black border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,0.1)] transition-transform hover:scale-110">
        {number}
      </div>
      <div className="space-y-2">
        <h4 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">{title}</h4>
        <p className="text-xs md:text-sm font-bold opacity-60 leading-tight md:max-w-[180px] mx-auto">{desc}</p>
      </div>
    </div>
  );
}



function WhyCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-5 md:gap-6 group">
      <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full border-[2px] border-[#FDDF14] flex items-center justify-center group-hover:bg-[#FDDF14] transition-all duration-300">
        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#FDDF14] group-hover:text-black" />
      </div>
      <div className="space-y-1.5 md:space-y-2">
        <h4 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-none">{title}</h4>
        <p className="text-sm md:text-base opacity-60 font-medium leading-relaxed max-w-sm">{desc}</p>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string, a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b-[3px] border-black py-6 md:py-8 space-y-4 cursor-pointer group" onClick={() => setOpen(!open)}>
      <div className="flex justify-between items-center gap-6 md:gap-8">
        <h4 className="text-lg md:text-xl lg:text-2xl font-black uppercase italic tracking-tighter group-hover:opacity-70 transition-opacity leading-tight">{q}</h4>
        <div className={`transition-transform duration-500 shrink-0 ${open ? 'rotate-[45deg]' : ''}`}>
          <Plus className="w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />
        </div>
      </div>
      {open && (
        <p className="text-sm md:text-lg font-bold opacity-70 animate-in fade-in slide-in-from-top-3 leading-relaxed max-w-2xl">
          {a}
        </p>
      )}
    </div>
  );
}
