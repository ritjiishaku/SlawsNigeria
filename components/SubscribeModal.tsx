'use client'

import { useState } from 'react'

interface SubscribeModalProps {
  isOpen: boolean
  onClose: () => void
  initialInterests?: string[]
}

export default function SubscribeModal({ isOpen, onClose, initialInterests = [] }: SubscribeModalProps) {
  const [phone, setPhone] = useState('')
  const [interests, setInterests] = useState<string[]>(initialInterests)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, interest_tags: interests }),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
          setSuccess(false)
          setPhone('')
          setInterests([])
        }, 2000)
      }
    } catch (error) {
      console.error('Subscription error:', error)
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
            <h3 className="text-2xl font-bold text-[#6B21A8] mb-2">Subscribed!</h3>
            <p className="text-[#374151]">Welcome to SlawsNigeria daily updates.</p>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-4 text-[#111827]">Subscribe on WhatsApp</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="tel"
                placeholder="+234 810 584 78551"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#6B21A8]"
                required
              />
              <p className="text-sm text-[#374151] mb-3">Select your interests:</p>
              <div className="flex gap-2 mb-6 flex-wrap">
                {['events', 'products', 'mentorship'].map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      interests.includes(interest)
                        ? 'bg-[#6B21A8] text-white'
                        : 'bg-gray-200 text-[#374151]'
                    }`}
                  >
                    {interest.charAt(0).toUpperCase() + interest.slice(1)}
                  </button>
                ))}
              </div>
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
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
