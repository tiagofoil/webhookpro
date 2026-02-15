'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, 
  Plus, 
  Home, 
  Clock, 
  Globe, 
  Monitor,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
  Wifi
} from 'lucide-react';
import CopyButton from '@/components/ui/CopyButton';
import CodeBlock from '@/components/ui/CodeBlock';

interface Webhook {
  id: string;
  endpointId: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  query_params: Record<string, string>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

function MethodBadge({ method }: { method: string }) {
  const methodClass = {
    'POST': 'method-post',
    'GET': 'method-get',
    'PUT': 'method-put',
    'DELETE': 'method-delete',
    'PATCH': 'method-patch',
  }[method] || 'badge bg-[#666666]/10 text-[#666666] border border-[#666666]/20 px-2 py-1 rounded text-xs font-medium';

  return <span className={methodClass}>{method}</span>;
}

function WebhookCard({ webhook, isNew }: { webhook: Webhook; isNew?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Unknown time';
      return date.toLocaleString();
    } catch {
      return 'Unknown time';
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(webhook.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className={`card overflow-hidden transition-all duration-300 ${isNew ? 'animate-slide-in border-[#00D9FF]/30' : ''}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#1E1E1E]/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <MethodBadge method={webhook.method} />
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyId();
            }}
            className="text-[#666666] hover:text-[#00D9FF] transition-colors font-mono text-sm"
            title="Copy webhook ID"
          >
            {copiedId ? <CheckCircle size={14} className="text-[#10B981]" /> : webhook.id.slice(0, 8)}...
          </button>
          
          <span className="text-[#808080] text-sm hidden sm:inline">{formatDate(webhook.created_at)}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-sm text-[#666666]">
            <span className="flex items-center gap-1">
              <Globe size={14} />
              {webhook.ip_address}
            </span>
            {webhook.user_agent && (
              <span className="flex items-center gap-1 max-w-[200px] truncate">
                <Monitor size={14} />
                {webhook.user_agent.split('/')[0]}
              </span>
            )}
          </div>
          
          <button className="text-[#666666] hover:text-[#EAEAEA] transition-colors">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 border-t border-[#333333] space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <div>
              <h4 className="text-[#808080] text-sm font-medium mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                Headers ({Object.keys(webhook.headers || {}).length})
              </h4>              
              <CodeBlock 
                code={JSON.stringify(webhook.headers || {}, null, 2)} 
                collapsible 
                maxHeight="200px"
              />
            </div>

            <div>
              <h4 className="text-[#808080] text-sm font-medium mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                Body
              </h4>
              <CodeBlock 
                code={webhook.body} 
                maxHeight="200px"
              />
            </div>
          </div>

          {webhook.query_params && Object.keys(webhook.query_params).length > 0 && (
            <div>
              <h4 className="text-[#808080] text-sm font-medium mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                Query Parameters
              </h4>
              <CodeBlock 
                code={JSON.stringify(webhook.query_params, null, 2)}
                maxHeight="150px"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EndpointPage() {
  const params = useParams();
  const router = useRouter();
  const endpointId = params.id as string;
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [previousWebhookCount, setPreviousWebhookCount] = useState(0);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const webhookUrl = origin + '/hook/' + endpointId;
  const viewUrl = origin + '/e/' + endpointId;

  useEffect(() => {
    const fetchWebhooks = async () => {
      try {
        const res = await fetch(`/api/endpoints/${endpointId}`);
        const data = await res.json();
        if (data.webhooks) {
          setPreviousWebhookCount(webhooks.length);
          setWebhooks(data.webhooks);
        }
      } catch (error) {
        console.error('Error:', error);
      }
      setLoading(false);
    };

    fetchWebhooks();
    const interval = setInterval(fetchWebhooks, 2000);
    return () => clearInterval(interval);
  }, [endpointId]);

  const createNew = () => {
    window.open('/', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Floating Navbar */}
      <nav className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#141414]/80 backdrop-blur-xl rounded-2xl border border-[#333333] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D9FF] to-[#00B4D8] flex items-center justify-center">
                    <Zap size={18} className="text-[#0A0A0A]" />
                  </div>
                  <span className="text-xl font-semibold text-[#EAEAEA] hidden sm:block">Webhook</span>
                  <span className="text-xl font-semibold text-gradient hidden sm:block">Pro</span>
                </Link>
                
                <div className="h-6 w-px bg-[#333333] mx-2" />
                
                <div className="flex items-center gap-2">
                  <span className="text-[#666666] text-sm hidden sm:inline">Endpoint</span>
                  <span className="px-2 py-1 bg-[#1E1E1E] rounded-lg text-[#00D9FF] font-mono text-sm border border-[#333333]">
                    {endpointId}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={createNew}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">New Webhook</span>
                </button>
                
                <Link 
                  href="/" 
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <Home size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* URL Card */}
          <div className="card p-6 mb-6 glow-cyan">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#EAEAEA] flex items-center gap-2">
                <Wifi size={18} className="text-[#10B981]" />
                Your Webhook URL
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[#10B981]">Listening</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="flex-1 input-mono text-base"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <CopyButton text={webhookUrl} variant="primary" size="lg" />
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4 p-4 bg-[#0A0A0A] rounded-lg border border-[#333333]">
              <div>
                <p className="text-[#666666] text-sm mb-2">Mac/Linux:</p>
                <code className="text-sm font-mono text-[#808080] block">
                  curl -X POST {webhookUrl}<br/>
                  &nbsp;&nbsp;-H "Content-Type: application/json"<br/>
                  &nbsp;&nbsp;-d '&#123;"test": "hello"&#125;'
                </code>
              </div>
              <div>
                <p className="text-[#666666] text-sm mb-2">Windows PowerShell:</p>
                <code className="text-sm font-mono text-[#808080] block">
                  Invoke-WebRequest -Uri "{webhookUrl}"<br/>
                  &nbsp;&nbsp;-Method POST -ContentType<br/>
                  &nbsp;&nbsp;"application/json" -Body '&#123;"test": "hello"&#125;'
                </code>
              </div>
            </div>
          </div>

          {/* Webhooks List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#EAEAEA]">
                Captured Webhooks
                {webhooks.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-[#1E1E1E] rounded-lg text-[#808080] text-sm">
                    {webhooks.length}
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2 text-sm text-[#666666]">
                <Clock size={14} />
                <span>Auto-updating every 2s</span>
              </div>
            </div>

            {loading ? (
              <div className="card p-12 text-center">
                <div className="w-8 h-8 border-2 border-[#333333] border-t-[#00D9FF] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#808080]">Loading webhooks...</p>
              </div>
            ) : webhooks.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#1E1E1E] flex items-center justify-center mx-auto mb-4">
                  <Wifi size={24} className="text-[#666666]" />
                </div>
                <p className="text-xl font-semibold text-[#EAEAEA] mb-2">No webhooks captured yet</p>
                <p className="text-[#808080] mb-6">Send a POST request to your webhook URL to see it here.</p>
                
                <div className="flex items-center justify-center gap-2 text-sm text-[#666666]">
                  <Clock size={14} />
                  <span>This page updates automatically</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {webhooks.map((webhook, index) => (
                  <WebhookCard 
                    key={webhook.id} 
                    webhook={webhook}
                    isNew={index === 0 && webhooks.length > previousWebhookCount}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
