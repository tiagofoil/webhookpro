'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CopyButton from './CopyButton';

interface CodeBlockProps {
  code: string | null;
  language?: string;
  title?: string;
  collapsible?: boolean;
  maxHeight?: string;
}

export default function CodeBlock({ 
  code, 
  language = 'json', 
  title,
  collapsible = false,
  maxHeight = '300px'
}: CodeBlockProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  if (!code || code === 'No body') {
    return (
      <div className="bg-[#0A0A0A] rounded-lg p-4 text-[#666666] text-sm font-mono">
        No body
      </div>
    );
  }

  const formatCode = (str: string): string => {
    try {
      // Try to parse and re-format JSON
      const parsed = JSON.parse(str);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return str;
    }
  };

  const highlightCode = (str: string) => {
    // Simple syntax highlighting
    let highlighted = str
      .replace(/["&;]([^"&;]*)["&;]/g, '<span class="json-string">&quot;$1&quot;</span>')
      .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
      .replace(/\b(null)\b/g, '<span class="json-null">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="json-number">$1</span>')
      .replace(/([{\[}\],])/g, '<span class="text-[#D4D4D4]">$1</span>');
    
    return highlighted;
  };

  const formattedCode = formatCode(code);
  const lines = formattedCode.split('\n');
  const shouldCollapse = collapsible && lines.length > 10;

  return (
    <div className="bg-[#0A0A0A] rounded-lg border border-[#333333] overflow-hidden">
      {(title || shouldCollapse) && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#1E1E1E] border-b border-[#333333]">
          {title && (
            <span className="text-[#808080] text-sm font-medium">{title}</span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <CopyButton text={formattedCode} variant="ghost" size="sm" />
            {shouldCollapse && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-[#808080] hover:text-[#EAEAEA] transition-colors cursor-pointer"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
          </div>
        </div>
      )}
      
      <pre 
        className="p-4 text-sm font-mono overflow-x-auto leading-relaxed"
        style={{ 
          maxHeight: isExpanded ? maxHeight : '150px',
          overflow: isExpanded ? 'auto' : 'hidden'
        }}
      >
        <code 
          dangerouslySetInnerHTML={{ __html: highlightCode(formattedCode) }}
          className="font-mono"
        />
      </pre>
    </div>
  );
}
