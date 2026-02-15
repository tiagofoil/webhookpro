'use client'

import React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const createEndpoint = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/endpoints', { method: 'POST' })
      const data = await res.json()
      if (data.endpointId) {
        // Redirect to the view page immediately
        router.push(`/e/${data.endpointId}`)
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
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
      </div>
    </main>
  )
}