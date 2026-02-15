'use client';

import { Copy } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  code: string | null;
  language?: string;
  title?: string;
  maxHeight?: string;
}

export default function CodeBlock({ 
  code, 
  language = 'json', 
  title,
  maxHeight = '300px'
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  if (!code || code === 'No body') {
    return (
      <div className="bg-[#0A0A0A] rounded-lg border border-[#333333] overflow-hidden h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-[#1E1E1E] border-b border-[#333333]">
          <span className="text-[#808080] text-sm font-medium">{title || 'JSON'}</span>
        </div>
        <div className="flex-1 p-4 text-[#666666] text-sm font-mono">
          No body
        </div>
      </div>
    );
  }

  const formatCode = (str: string): string => {
    try {
      const parsed = JSON.parse(str);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return str;
    }
  };

  const highlightCode = (str: string) => {
    let highlighted = str
      .replace(/["\u0026;]([^"\u0026;]*)["\u0026;]/g, '<span class="json-string">&quot;$1&quot;</span>')
      .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
      .replace(/\b(null)\b/g, '<span class="json-null">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="json-number">$1</span>')
      .replace(/([{\[}\],])/g, '<span class="text-[#D4D4D4]">$1</span>');
    
    return highlighted;
  };

  const formattedCode = formatCode(code);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-[#0A0A0A] rounded-lg border border-[#333333] overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1E1E1E] border-b border-[#333333]">
        <span className="text-[#808080] text-sm font-medium">{title || 'JSON'}</span>
        
        <button
          onClick={handleCopy}
          className="p-1.5 text-[#808080] hover:text-[#EAEAEA] transition-colors cursor-pointer"
          title="Copy to clipboard"
        >
          {copied ? (
            <span className="text-[#10B981] text-xs">Copied!</span>
          ) : (
            <Copy size={16} />
          )}
        </button>
      </div>
      
      <div className="flex-1 overflow-auto">
        <pre 
          className="p-4 text-sm font-mono leading-relaxed"
          style={{ maxHeight }}
        >
          <code 
            dangerouslySetInnerHTML={{ __html: highlightCode(formattedCode) }}
            className="font-mono"
          />
        </pre>
      </div>
    </div>
  );
}
