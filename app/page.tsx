import { supabase } from '@/lib/supabase'

async function getServices() {
  const { data } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false })
  
  return data || []
}

export default async function Home() {
  const services = await getServices()

  // Group services by category
  const pillars = [
    {
      title: 'Events',
      category: 'events',
      description: 'Empowering women through curated events, workshops, and networking opportunities across Nigeria.',
    },
    {
      title: 'Women\'s Store',
      category: 'products',
      description: 'Quality products curated for the modern Nigerian woman. Fashion, accessories, and lifestyle essentials.',
    },
    {
      title: 'Mentorship',
      category: 'mentorship',
      description: 'Connect with experienced mentors to guide your personal and professional growth journey.',
    },
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#6B21A8] to-[#8B5CF6] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">SlawsNigeria</h1>
          <p className="text-xl md:text-2xl mb-8">Empowering Women. Automating Growth.</p>
          <a
            href="https://wa.me/23481058478551?text=Hi%20SlawsNigeria%2C%20I%27d%20like%20to%20subscribe%20for%20daily%20updates"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#D97706] hover:bg-[#B45309] text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
          >
            Subscribe on WhatsApp
          </a>
        </div>
      </section>

      {/* Offer Hub - Dynamic Services */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#111827]">Our Services</h2>
        
        {services.length === 0 ? (
          <p className="text-center text-gray-500">No services available yet. Check back soon!</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((pillar) => {
              const categoryServices = services.filter(s => s.category === pillar.category)
              
              return (
                <div key={pillar.title} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold mb-4 text-[#6B21A8]">{pillar.title}</h3>
                  <p className="text-[#374151] mb-4">{pillar.description}</p>
                  
                  {categoryServices.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {categoryServices.map((service) => (
                        <div key={service.id} className="text-sm bg-gray-50 p-3 rounded">
                          <p className="font-medium">{service.name}</p>
                          {service.price > 0 && (
                            <p className="text-[#D97706] font-semibold">₦{service.price.toLocaleString()}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <a
                    href={`https://wa.me/23481058478551?text=Hi%20SlawsNigeria%2C%20I%27m%20interested%20in%20${pillar.category}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#6B21A8] hover:bg-[#4C1D95] text-white px-6 py-3 rounded-md font-medium transition-colors"
                  >
                    Connect on WhatsApp
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-[#111827] text-white py-8 px-4 text-center">
        <p>© 2026 SlawsNigeria. All rights reserved.</p>
        <p className="mt-2 text-sm text-gray-400">Contact: +234 810 584 78551</p>
      </footer>
    </main>
  )
}
