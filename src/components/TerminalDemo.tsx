'use client';

import { Terminal, Wifi, CheckCircle } from 'lucide-react';

export default function TerminalDemo() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute -inset-1 bg-gradient-to-r from-[#00D9FF]/20 to-[#10B981]/20 rounded-2xl blur-xl opacity-50" />
      
      <div className="relative bg-[#141414] rounded-2xl border border-[#333333] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-[#1E1E1E] border-b border-[#333333]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <div className="w-3 h-3 rounded-full bg-[#10B981]" />
          </div>
          <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-[#0A0A0A] rounded-md">
            <Terminal size={14} className="text-[#808080]" />
            <span className="text-[#808080] text-sm font-mono">webhookpro — bash</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Wifi size={14} className="text-[#10B981]" />
            <span className="text-[#10B981] text-xs">Live</span>
          </div>
        </div>

        <div className="p-6 font-mono text-sm min-h-[280px]">
          <div className="text-[#EAEAEA] mb-1">$ curl -X POST https://webhookpro.vercel.app/hook/demo123</div>
          <div className="text-[#EAEAEA] mb-1">    -H "Content-Type: application/json"</div>
          <div className="text-[#EAEAEA] mb-3">    -d '&#123;"event": "payment.success"&#125;'</div>
          
          <div className="text-[#808080] mb-3">&#123;"success": true, "webhookId": "wh_abc123"&#125;</div>
          
          <div className="text-[#00D9FF] mb-1">→ Webhook captured!</div>
          <div className="text-[#00D9FF] mb-1">  Method: POST</div>
          <div className="text-[#00D9FF] mb-1">  Headers: 12 captured</div>
          <div className="text-[#00D9FF] mb-3">  Body: 156 bytes</div>
          
          <div className="text-[#10B981] flex items-center gap-2">
            <CheckCircle size={14} />
            <span>View at: webhookpro.vercel.app/e/demo123</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2 bg-[#1E1E1E] border-t border-[#333333] text-xs">
          <div className="flex items-center gap-4">
            <span className="text-[#808080]">Ready</span>
            <span className="text-[#333333]">|</span>
            <span className="text-[#00D9FF]">Listening on /hook/demo123</span>
          </div>
          <div className="text-[#666666]">UTF-8</div>
        </div>
      </div>
    </div>
  );
}
