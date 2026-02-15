'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function CopyButton({ 
  text, 
  className = '', 
  variant = 'secondary',
  size = 'md' 
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  };

  const variantClasses = {
    primary: 'bg-[#00D9FF] text-[#0A0A0A] hover:brightness-110',
    secondary: 'bg-[#1E1E1E] text-[#808080] hover:text-[#EAEAEA] hover:bg-[#2A2A2A] border border-[#333333]',
    ghost: 'text-[#808080] hover:text-[#EAEAEA]'
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
        rounded-lg transition-all duration-200 ease-out cursor-pointer
        flex items-center gap-2
      `}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check size={iconSizes[size]} className="text-[#10B981]" />
          {variant === 'primary' && <span className="font-medium">Copied!</span>}
        </>
      ) : (
        <Copy size={iconSizes[size]} />
      )}
    </button>
  );
}
