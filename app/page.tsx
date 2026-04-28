'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import LeadCaptureModal from '@/components/LeadCaptureModal'

const categories = [
  {
    title: 'Events',
    description: 'Empowering women through curated events, workshops, and networking opportunities across Nigeria.',
    message: 'Hello%20I%20want%20to%20book%20an%20event%20service',
    interest: 'events',
  },
  {
    title: 'Products',
    description: 'Quality products curated for the modern Nigerian woman. Fashion, accessories, and lifestyle essentials.',
    message: 'Hello%20I%20want%20to%20see%20your%20products',
    interest: 'products',
  },
  {
    title: 'Mentorship',
    description: 'Connect with experienced mentors to guide your personal and professional growth journey.',
    message: 'Hello%20I%20want%20mentorship',
    interest: 'mentorship',
  },
]

async function getPosts() {
  const { data } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
  
  return data || []
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedMessage, setSelectedMessage] = useState('')
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    getPosts().then(setPosts)
  }, [])

  const openModal = (category: string, message: string) => {
    setSelectedCategory(category)
    setSelectedMessage(message)
    setIsModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#6B21A8] to-[#8B5CF6] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">All-in-one services for women, events & entrepreneurs</h1>
          <a
            href="https://wa.me/2348105847851?text=Hello%20I%20want%20to%20join%20SlawsNigeria"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#D97706] hover:bg-[#B45309] text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
          >
            Join WhatsApp
          </a>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#111827]">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div key={cat.title} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-4 text-[#6B21A8]">{cat.title}</h3>
              <p className="text-[#374151] mb-6">{cat.description}</p>
              <button
                onClick={() => openModal(cat.interest, cat.message)}
                className="inline-block bg-[#6B21A8] hover:bg-[#4C1D95] text-white px-6 py-3 rounded-md font-medium transition-colors cursor-pointer"
                >
                Connect on WhatsApp
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        whatsappMessage={selectedMessage}
      />

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section className="py-16 px-4 max-w-4xl mx-auto bg-gray-50">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#111827]">Latest Updates</h2>
          <div className="space-y-6">
            {posts.map((post: any) => (
              <div key={post.id} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2 text-[#6B21A8]">{post.title}</h3>
                <p className="text-[#374151] whitespace-pre-wrap">{post.content}</p>
                <p className="text-sm text-gray-500 mt-4">
                  {new Date(post.created_at).toLocaleDateString('en-NG')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[#111827] text-white py-8 px-4 text-center">
        <p>© 2026 SlawsNigeria. All rights reserved.</p>
        <p className="mt-2 text-sm text-gray-400">Contact: +234 810 584 7851</p>
      </footer>
    </main>
  )
}
