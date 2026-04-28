'use client'

import { useState } from 'react'

interface LeadCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  category: string
  whatsappMessage: string
}

export default function LeadCaptureModal({ isOpen, onClose, category, whatsappMessage }: LeadCaptureModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone) return

    setLoading(true)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, interest: category }),
      })

      if (res.ok) {
        setSuccess(true)
        // Redirect to WhatsApp after 1 second
        setTimeout(() => {
          window.open(`https://wa.me/2348105847851?text=${whatsappMessage}`, '_blank')
          onClose()
          // Reset form
          setName('')
          setPhone('')
          setSuccess(false)
        }, 1000)
      }
    } catch (error) {
      console.error('Lead capture error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {success ? (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold text-[#6B21A8] mb-2">Thank You!</h3>
            <p className="text-[#374151]">Redirecting to WhatsApp...</p>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-4 text-[#111827]">
              Join {category.charAt(0).toUpperCase() + category.slice(1)}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B21A8]"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number (e.g. 08123456789)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B21A8]"
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#6B21A8] text-white py-2 rounded-md hover:bg-[#4C1D95] disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Continue to WhatsApp'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
