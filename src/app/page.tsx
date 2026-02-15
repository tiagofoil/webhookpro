'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Shield, 
  Globe, 
  Clock, 
  Terminal, 
  ArrowRight,
  Check,
  Github,
  Twitter
} from 'lucide-react';
import TerminalDemo from '@/components/TerminalDemo';

const features = [
  {
    icon: Zap,
    title: 'Instant Setup',
    description: 'No signup required. Get a unique webhook URL in seconds and start testing immediately.',
  },
  {
    icon: Terminal,
    title: 'Real-time Inspection',
    description: 'View headers, body, and metadata instantly. Auto-updates as webhooks arrive.',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description: 'HTTPS-only endpoints. Your webhook data is private and never shared.',
  },
  {
    icon: Globe,
    title: 'Global Edge Network',
    description: 'Deployed on Vercel Edge for sub-100ms latency worldwide.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Create Endpoint',
    description: 'Click one button to generate your unique webhook URL.',
  },
  {
    number: '02',
    title: 'Send Webhook',
    description: 'Point your service or use curl to POST to your URL.',
  },
  {
    number: '03',
    title: 'Inspect',
    description: 'Watch the webhook appear instantly with full details.',
  },
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createEndpoint = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/endpoints', { method: 'POST' });
      const data = await res.json();
      if (data.endpointId) {
        router.push(`/e/${data.endpointId}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Floating Navbar */}
      <nav className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#141414]/80 backdrop-blur-xl rounded-2xl border border-[#333333] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D9FF] to-[#00B4D8] flex items-center justify-center">
                  <Zap size={18} className="text-[#0A0A0A]" />
                </div>
                <span className="text-xl font-semibold text-[#EAEAEA]">Webhook</span>
                <span className="text-xl font-semibold text-gradient">Pro</span>
              </div>
              
              <div className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-[#808080] hover:text-[#EAEAEA] transition-colors text-sm">Features</a>
                <a href="#how-it-works" className="text-[#808080] hover:text-[#EAEAEA] transition-colors text-sm">How it works</a>
                <a 
                  href="https://github.com/tiagofoil/webhookpro" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#808080] hover:text-[#EAEAEA] transition-colors text-sm"
                >
                  <Github size={18} />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00D9FF]/10 rounded-full border border-[#00D9FF]/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-pulse" />
                <span className="text-[#00D9FF] text-sm font-medium">Free • No signup required</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#EAEAEA] mb-6 leading-tight">
                Debug webhooks
                <br />
                <span className="text-gradient">in seconds</span>
              </h1>
              
              <p className="text-lg text-[#808080] mb-8 max-w-xl mx-auto lg:mx-0">
                Capture, inspect, and debug HTTP requests in real-time. 
                The modern webhook tester built for developers who value speed.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <button
                  onClick={createEndpoint}
                  disabled={loading}
                  className="btn-glow text-lg px-8 py-4 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>Creating...</>
                  ) : (
                    <>
                      Create Webhook Endpoint
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-[#666666]">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#10B981]" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#10B981]" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#10B981]" />
                  <span>Open source</span>
                </div>
              </div>
            </div>

            {/* Right: Terminal Demo */}
            <div className="relative">
              <TerminalDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#EAEAEA] mb-4">
              Built for developers
            </h2>
            <p className="text-[#808080] max-w-2xl mx-auto">
              Everything you need to debug webhooks without the complexity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card p-6 group hover:border-[#00D9FF]/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1E1E1E] border border-[#333333] flex items-center justify-center mb-4 group-hover:border-[#00D9FF]/30 transition-colors"
                >
                  <feature.icon size={24} className="text-[#00D9FF]" />
                </div>
                <h3 className="text-xl font-semibold text-[#EAEAEA] mb-2">{feature.title}</h3>
                <p className="text-[#808080]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-[#141414]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#EAEAEA] mb-4">
              How it works
            </h2>
            <p className="text-[#808080]">
              From zero to inspecting webhooks in under 30 seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-5xl font-bold text-[#1E1E1E] mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold text-[#EAEAEA] mb-2">{step.title}</h3>
                <p className="text-[#808080]">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#333333] to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card p-12 glow-cyan">
            <h2 className="text-3xl md:text-4xl font-bold text-[#EAEAEA] mb-4">
              Ready to debug your webhooks?
            </h2>
            <p className="text-[#808080] mb-8 max-w-xl mx-auto">
              Join thousands of developers who trust WebhookPro for their webhook testing needs.
            </p>
            
            <button
              onClick={createEndpoint}
              disabled={loading}
              className="btn-glow text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              {loading ? 'Creating...' : <>Get Started Free <ArrowRight size={20} /></>}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[#1E1E1E]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D9FF] to-[#00B4D8] flex items-center justify-center">
                <Zap size={18} className="text-[#0A0A0A]" />
              </div>
              <span className="text-[#EAEAEA] font-semibold">WebhookPro</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a 
                href="https://github.com/tiagofoil/webhookpro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#666666] hover:text-[#EAEAEA] transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="https://www.buymeacoffee.com/tiagofoil"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#FFDD00] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
              >
                <span>☕</span>
                <span>Buy me a coffee</span>
              </a>
            </div>
            
            <p className="text-[#666666] text-sm">© 2025 WebhookPro. MIT License</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
