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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) fetchServices()
  }, [isAuthenticated])

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

  const sendBroadcast = async () => {
    if (!broadcastMessage) return
    setLoading(true)

    const res = await fetch('/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: ADMIN_PASSWORD, message: broadcastMessage }),
    })

    if (res.ok) {
      alert('Broadcast sent!')
      setBroadcastMessage('')
    }
    setLoading(false)
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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Send Broadcast</h2>
          <textarea
            placeholder="Type your broadcast message..."
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            className="w-full border px-4 py-2 rounded-md mb-4"
            rows={4}
          />
          <button
            onClick={sendBroadcast}
            disabled={loading || !broadcastMessage}
            className="bg-[#D97706] text-white px-6 py-2 rounded-md hover:bg-[#B45309] disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send to All Subscribers'}
          </button>
        </div>
      </div>
    </div>
  )
}
