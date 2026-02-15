'use client'

import React from 'react'
import { useState } from 'react'

export default function Home() {
  const [endpointId, setEndpointId] = useState('')
  const [loading, setLoading] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')

  const createEndpoint = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/endpoints', { method: 'POST' })
      const data = await res.json()
      if (data.endpointId) {
        setEndpointId(data.endpointId)
        setWebhookUrl(data.url)
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Webhook
            <span className="text-cyan-400">Pro</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Capture, inspect, and debug webhooks in real-time. 
            The modern webhook tester for developers.
          </p>
        </div>

        {!endpointId ? (
          <div className="max-w-md mx-auto text-center">
            <button
              onClick={createEndpoint}
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Creating...' : '🚀 Create Webhook Endpoint'}
            </button>
            <p className="text-gray-400 mt-4 text-sm">
              Free • No signup required • Instant setup
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Your Webhook URL</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="flex-1 bg-black/30 text-white px-4 py-3 rounded-lg font-mono text-sm"
                />
                <button
                  onClick={copyUrl}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg"
                >
                  Copy
                </button>
              </div>
              <p className="text-gray-400 mt-4">
                Send webhooks to this URL. They will appear below instantly.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Captured Webhooks</h2>
              <WebhookList endpointId={endpointId} />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function WebhookList({ endpointId }: { endpointId: string }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const webhookUrl = origin + '/hook/' + endpointId
  
  return (
    <div className="text-gray-400 text-center py-8">
      <p className="mb-4">Waiting for webhooks...</p>
      <p className="mb-4">Send a test webhook to your URL to see it here.</p>
      <p className="mb-2">Example:</p>
      <code className="block bg-black/30 rounded p-3 text-sm text-left max-w-lg mx-auto">
        {'curl -X POST ' + webhookUrl + ' -H "Content-Type: application/json" -d \'{"test": "hello"}\''}
      </code>
    </div>
  )
}