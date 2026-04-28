'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import LeadCaptureModal from '@/components/LeadCaptureModal'

const categories = [
  {
    title: 'Events & Workshops',
    description: 'From business seminars to empowerment retreats — join events that accelerate your growth.',
    message: 'Hello%20I%20want%20to%20book%20an%20event%20service',
    interest: 'events',
    icon: '📅',
    cta: 'Book an Event',
  },
  {
    title: 'Women\'s Store',
    description: 'Curated fashion, accessories, and lifestyle products designed for the modern Nigerian woman.',
    message: 'Hello%20I%20want%20to%20see%20your%20products',
    interest: 'products',
    icon: '🛍️',
    cta: 'Shop Now',
  },
  {
    title: 'Mentorship',
    description: 'Get guidance from experienced women leaders. Scale your business, career, or personal growth.',
    message: 'Hello%20I%20want%20mentorship',
    interest: 'mentorship',
    icon: '💎',
    cta: 'Get a Mentor',
  },
]

async function getPosts() {
  const { data } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)

  return data || []
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedMessage, setSelectedMessage] = useState('')
  const [selectedInterest, setSelectedInterest] = useState('')
  const [posts, setPosts] = useState<any[]>([])
  const [stats, setStats] = useState({ users: 0, posts: 0 })

  useEffect(() => {
    getPosts().then(setPosts)
    // Simple stats
    supabase.from('users').select('*', { count: 'exact', head: true }).then(({ count }) => {
      setStats(prev => ({ ...prev, users: count || 0 }))
    })
    supabase.from('posts').select('*', { count: 'exact', head: true }).then(({ count }) => {
      setStats(prev => ({ ...prev, posts: count || 0 }))
    })
  }, [])

  const openModal = (category: string, message: string, interest: string) => {
    setSelectedCategory(category)
    setSelectedMessage(message)
    setSelectedInterest(interest)
    setIsModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#6B21A8] via-[#7C3AED] to-[#8B5CF6] text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 text-sm mb-6">
            🇳🇬 Nigeria's Premier Women's Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Empowering Women.<br />
            <span className="text-[#FCD34D]">Growing Together.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-purple-100">
            Events • Products • Mentorship — All in One Place
          </p>
          <p className="text-lg mb-8 text-purple-200 max-w-2xl mx-auto">
            Join 500+ Nigerian women already transforming their lives through SlawsNigeria
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => openModal('whatsapp', 'Hello%20I%20want%20to%20join%20SlawsNigeria', 'general')}
              className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold px-8 py-4 rounded-full text-lg transition-all hover:scale-105 shadow-lg"
            >
              🚀 Join WhatsApp Community
            </button>
            <a
              href="#services"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all"
            >
              Explore Services ↓
            </a>
          </div>
          {/* Quick Stats */}
          <div className="flex justify-center gap-8 mt-12 text-sm">
            <div>
              <p className="text-2xl font-bold">{stats.users}+</p>
              <p className="text-purple-200">Members</p>
            </div>
            <div className="border-l border-white/30"></div>
            <div>
              <p className="text-2xl font-bold">{stats.posts}+</p>
              <p className="text-purple-200">Updates</p>
            </div>
            <div className="border-l border-white/30"></div>
            <div>
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-purple-200">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="services" className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#111827]">
            What We Offer
          </h2>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            Choose your path to growth. Each service is designed to empower Nigerian women.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="group bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-[#6B21A8] hover:shadow-2xl transition-all duration-300"
            >
              <div className="text-4xl mb-4">{cat.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-[#111827]">{cat.title}</h3>
              <p className="text-[#6B7280] mb-6 leading-relaxed">{cat.description}</p>
              <button
                onClick={() => openModal(cat.interest, cat.message, cat.interest)}
                className="w-full bg-[#6B21A8] hover:bg-[#4C1D95] text-white font-semibold px-6 py-3 rounded-xl transition-all group-hover:scale-105"
              >
                {cat.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-[#F9FAFB] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8 text-[#111827]">Trusted by Women Across Nigeria</h2>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-[#6B21A8]">500+</p>
              <p className="text-[#6B7280]">Active Members</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[#6B21A8]">50+</p>
              <p className="text-[#6B7280]">Events Hosted</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[#6B21A8]">98%</p>
              <p className="text-[#6B7280]">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section className="py-20 px-4 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#111827]">
              Latest Updates
            </h2>
            <p className="text-lg text-[#6B7280]">Fresh content from our community</p>
          </div>
          <div className="space-y-6">
            {posts.map((post: any) => (
              <div key={post.id} className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-3">
                  <span>📅</span>
                  <span>{new Date(post.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-[#111827]">{post.title}</h3>
                <p className="text-[#374151] leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-[#6B21A8] to-[#8B5CF6] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Join our WhatsApp community and get daily tips, updates, and opportunities.
          </p>
          <button
            onClick={() => openModal('whatsapp', 'Hello%20I%20want%20to%20join%20SlawsNigeria', 'general')}
            className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold px-10 py-4 rounded-full text-lg transition-all hover:scale-105 shadow-lg inline-block"
          >
            💬 Join WhatsApp Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111827] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">SlawsNigeria</h3>
          <p className="text-gray-400 mb-6">Empowering women. Growing together.</p>
          <div className="flex justify-center gap-6 mb-6">
            <a href="https://wa.me/2348105847851" className="text-gray-400 hover:text-white transition-colors">
              WhatsApp
            </a>
            <a href="mailto:igbokweprincess57@gmail.com" className="text-gray-400 hover:text-white transition-colors">
              Email
            </a>
          </div>
          <p className="text-sm text-gray-500">© 2026 SlawsNigeria. All rights reserved.</p>
          <p className="text-sm text-gray-500 mt-2">Contact: +234 810 584 7851</p>
        </div>
      </footer>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedInterest}
        whatsappMessage={selectedMessage}
      />
    </main>
  )
}
