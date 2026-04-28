'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = 'slaws2026'

interface Service {
  id: string
  name: string
  category: string
  description: string
  price: number
  whatsapp_link: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [services, setServices] = useState<Service[]>([])
  const [newService, setNewService] = useState({
    name: '',
    category: 'events',
    description: '',
    price: 0,
    whatsapp_link: '',
  })
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) fetchAnalytics()
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      fetchServices()
      fetchAnalytics()
    }
  }, [isAuthenticated])

  const fetchAnalytics = async () => {
    const res = await fetch(`/api/analytics?password=${ADMIN_PASSWORD}`)
    const data = await res.json()
    setAnalytics(data)
  }

  const fetchServices = async () => {
    const res = await fetch('/api/services')
    const data = await res.json()
    setServices(data.services || [])
  }

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
    } else {
      alert('Wrong password')
    }
  }

  const addService = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: ADMIN_PASSWORD, ...newService }),
    })

    if (res.ok) {
      setNewService({ name: '', category: 'events', description: '', price: 0, whatsapp_link: '' })
      fetchServices()
    }
    setLoading(false)
  }

  const deleteService = async (id: string) => {
    const res = await fetch(`/api/services?id=${id}&password=${ADMIN_PASSWORD}`, {
      method: 'DELETE',
    })
    if (res.ok) fetchServices()
  }

  const sendBroadcast = async (scheduleDate?: string) => {
    if (!broadcastMessage) return
    setLoading(true)

    const endpoint = scheduleDate ? '/api/scheduled-broadcasts' : '/api/broadcast'
    const body: any = { 
      password: ADMIN_PASSWORD, 
      message: broadcastMessage,
    }

    if (scheduleDate) {
      body.scheduled_for = scheduleDate
      body.tags = selectedTags.length > 0 ? selectedTags : null
    } else {
      body.tags = selectedTags.length > 0 ? selectedTags : null
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      alert(scheduleDate ? 'Broadcast scheduled!' : 'Broadcast sent!')
      setBroadcastMessage('')
      setScheduledDate('')
      setSelectedTags([])
      fetchAnalytics()
    }
    setLoading(false)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-[#6B21A8]">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-[#6B21A8] text-white py-2 rounded-md hover:bg-[#4C1D95]"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#6B21A8]">SlawsNigeria Admin</h1>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-sm text-gray-600">Total Subscribers</p>
              <p className="text-2xl font-bold text-[#6B21A8]">{analytics.totalSubscribers}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-sm text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-[#6B21A8]">{analytics.totalServices}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-sm text-gray-600">Pending Broadcasts</p>
              <p className="text-2xl font-bold text-[#D97706]">{analytics.pendingBroadcasts}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-sm text-gray-600">Top Interest</p>
              <p className="text-2xl font-bold text-[#6B21A8]">
                {analytics.tagCounts ? Object.entries(analytics.tagCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A' : 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Add Service Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Service</h2>
          <form onSubmit={addService} className="space-y-4">
            <input
              type="text"
              placeholder="Service Name"
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              className="w-full border px-4 py-2 rounded-md"
              required
            />
            <select
              value={newService.category}
              onChange={(e) => setNewService({ ...newService, category: e.target.value })}
              className="w-full border px-4 py-2 rounded-md"
            >
              <option value="events">Events</option>
              <option value="products">Products</option>
              <option value="mentorship">Mentorship</option>
            </select>
            <textarea
              placeholder="Description"
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              className="w-full border px-4 py-2 rounded-md"
              rows={3}
            />
            <input
              type="number"
              placeholder="Price (₦)"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
              className="w-full border px-4 py-2 rounded-md"
            />
            <input
              type="text"
              placeholder="WhatsApp Link"
              value={newService.whatsapp_link}
              onChange={(e) => setNewService({ ...newService, whatsapp_link: e.target.value })}
              className="w-full border px-4 py-2 rounded-md"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#6B21A8] text-white px-6 py-2 rounded-md hover:bg-[#4C1D95] disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Service'}
            </button>
          </form>
        </div>

        {/* Services List */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Services</h2>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="border p-4 rounded-md flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.category} • ₦{service.price}</p>
                </div>
                <button
                  onClick={() => deleteService(service.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Broadcast Composer */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Send Broadcast</h2>
          
          {/* Tag Filter */}
          <p className="text-sm text-gray-600 mb-2">Target audience (leave empty for all):</p>
          <div className="flex gap-2 mb-4 flex-wrap">
            {['events', 'products', 'mentorship', 'general'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedTags.includes(tag)
                    ? 'bg-[#6B21A8] text-white'
                    : 'bg-gray-200 text-[#374151]'
                }`}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>

          <textarea
            placeholder="Type your broadcast message..."
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            className="w-full border px-4 py-2 rounded-md mb-4"
            rows={4}
          />
          
          <div className="flex gap-4">
            <button
              onClick={() => sendBroadcast()}
              disabled={loading || !broadcastMessage}
              className="bg-[#D97706] text-white px-6 py-2 rounded-md hover:bg-[#B45309] disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Now'}
            </button>
            
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="border px-4 py-2 rounded-md"
            />
            <button
              onClick={() => sendBroadcast(scheduledDate)}
              disabled={loading || !broadcastMessage || !scheduledDate}
              className="bg-[#6B21A8] text-white px-6 py-2 rounded-md hover:bg-[#4C1D95] disabled:opacity-50"
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
