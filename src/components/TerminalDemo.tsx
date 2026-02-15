'use client';

import { useEffect, useState } from 'react';
import { Terminal, Wifi, CheckCircle } from 'lucide-react';

interface TerminalLine {
  type: 'command' | 'response' | 'webhook' | 'success';
  content: string;
  delay: number;
}

const terminalLines: TerminalLine[] = [
  { type: 'command', content: '$ curl -X POST https://webhookpro.vercel.app/hook/abc123', delay: 0 },
  { type: 'command', content: '    -H "Content-Type: application/json"', delay: 100 },
  { type: 'command', content: '    -d {"action": "user.signup", "email": "dev@example.com"}', delay: 200 },
  { type: 'response', content: '{"success": true, "webhookId": "wh_7f8d9a2"}', delay: 800 },
  { type: 'webhook', content: '-> Webhook received!', delay: 1200 },
  { type: 'webhook', content: 'Method: POST', delay: 1400 },
  { type: 'webhook', content: 'Headers: 12 captured', delay: 1600 },
  { type: 'webhook', content: 'Body: 78 bytes', delay: 1800 },
  { type: 'success', content: 'View at: webhookpro.vercel.app/e/abc123', delay: 2200 },
];

export default function TerminalDemo() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    
    terminalLines.forEach((line, index) => {
      const timeout = setTimeout(() => {
        setVisibleLines(index + 1);
      }, line.delay);
      timeouts.push(timeout);
    });

    const resetTimeout = setTimeout(() => {
      setVisibleLines(0);
    }, 6000);
    timeouts.push(resetTimeout);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [visibleLines]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-[#EAEAEA]';
      case 'response':
        return 'text-[#808080]';
      case 'webhook':
        return 'text-[#00D9FF]';
      case 'success':
        return 'text-[#10B981]';
      default:
        return 'text-[#EAEAEA]';
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute -inset-1 bg-gradient-to-r from-[#00D9FF]/20 to-[#10B981]/20 rounded-2xl blur-xl opacity-50 animate-pulse" />
      
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

        <div className="p-6 font-mono text-sm min-h-[320px]">
          {terminalLines.slice(0, visibleLines).map((line, index) => (
            <div 
              key={index}
              className={`${getLineColor(line.type)} mb-1 animate-slide-in flex items-center gap-2`}
            >
              {line.type === 'success' && <CheckCircle size={14} />}
              <span>{line.content}</span>
            </div>
          ))}
          
          {visibleLines < terminalLines.length && (
            <span 
              className={`inline-block w-2.5 h-5 bg-[#00D9FF] ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}
            />
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 bg-[#1E1E1E] border-t border-[#333333] text-xs">
          <div className="flex items-center gap-4">
            <span className="text-[#808080]">Ready</span>
            <span className="text-[#333333]">|</span>
            <span className="text-[#00D9FF]">Listening on /hook/abc123</span>
          </div>
          <div className="text-[#666666]">UTF-8</div>
        </div>
      </div>
    </div>
  );
}
