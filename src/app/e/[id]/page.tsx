'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Webhook {
  id: string
  endpointId: string
  method: string
  headers: Record<string, string>
  body: string | null
  query_params: Record<string, string>
  ip_address: string
  user_agent: string
  created_at: string
}

export default function EndpointPage() {
  const params = useParams()
  const endpointId = params.id as string
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const webhookUrl = origin + '/hook/' + endpointId

  useEffect(() => {
    const fetchWebhooks = async () => {
      try {
        const res = await fetch(`/api/endpoints/${endpointId}`)
        const data = await res.json()
        if (data.webhooks) {
          setWebhooks(data.webhooks)
        }
      } catch (error) {
        console.error('Error:', error)
      }
      setLoading(false)
    }

    fetchWebhooks()
    const interval = setInterval(fetchWebhooks, 2000) // Poll every 2 seconds
    return () => clearInterval(interval)
  }, [endpointId])

  const copyUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatJson = (str: string | null) => {
    if (!str) return 'No body'
    try {
      return JSON.stringify(JSON.parse(str), null, 2)
    } catch {
      return str
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Webhook Inspector</h1>
          <div className="text-cyan-400 font-mono text-sm">{endpointId}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={webhookUrl}
              readOnly
              className="flex-1 bg-black/30 text-white px-4 py-3 rounded-lg font-mono text-sm"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={copyUrl}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg min-w-[100px]"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-gray-400 mt-2 text-sm">
            Send POST requests to this URL. Webhooks appear below automatically.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading webhooks...</div>
        ) : webhooks.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-12 text-center">
            <div className="text-gray-400 mb-4 text-lg">No webhooks captured yet</div>
            <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-300 max-w-lg mx-auto text-left">
              <p className="mb-2 text-cyan-400">Send a test webhook:</p>
              <code className="block">
                curl -X POST {webhookUrl} <br/>
                &nbsp;&nbsp;-H "Content-Type: application/json" <br/>
                &nbsp;&nbsp;-d {`'{"test": "hello"}'`}
              </code>
            </div>
            <p className="text-gray-500 mt-4 text-sm">This page updates automatically every 2 seconds</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Captured Webhooks ({webhooks.length})</h2>
              <span className="text-gray-400 text-sm">Auto-updating every 2s</span>
            </div>
            
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    webhook.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                    webhook.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                    webhook.method === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {webhook.method}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {new Date(webhook.created_at).toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-sm font-mono">{webhook.ip_address}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-white font-semibold mb-2 text-sm">Headers</h3>
                    <pre className="bg-black/30 rounded-lg p-3 text-xs text-gray-300 overflow-auto max-h-48">
                      {JSON.stringify(webhook.headers || {}, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-2 text-sm">Body</h3>
                    <pre className="bg-black/30 rounded-lg p-3 text-xs text-gray-300 overflow-auto max-h-48">
                      {formatJson(webhook.body)}
                    </pre>
                  </div>
                </div>

                {webhook.query_params && Object.keys(webhook.query_params).length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-white font-semibold mb-2 text-sm">Query Params</h3>
                    <pre className="bg-black/30 rounded-lg p-3 text-xs text-gray-300">
                      {JSON.stringify(webhook.query_params, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}