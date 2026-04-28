'use client'

import { useState, useEffect } from 'react'

interface Post {
  id: string
  title: string
  content: string
  created_at: string
}

interface User {
  id: string
  name: string
  phone: string
  interest: string
  created_at: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [newPost, setNewPost] = useState({ title: '', content: '' })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts')

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts()
      fetchUsers()
    }
  }, [isAuthenticated])

  const fetchPosts = async () => {
    const res = await fetch('/api/posts')
    const data = await res.json()
    setPosts(data.posts || [])
  }

  const fetchUsers = async () => {
    const auth = sessionStorage.getItem('admin_password') || ''
    const res = await fetch(`/api/users?password=${auth}`)
    const data = await res.json()
    setUsers(data.users || [])
  }

  const handleLogin = () => {
    if (password === 'slaws2026') {
      sessionStorage.setItem('admin_auth', 'true')
      sessionStorage.setItem('admin_password', password)
      setIsAuthenticated(true)
    } else {
      alert('Wrong password')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth')
    sessionStorage.removeItem('admin_password')
    setIsAuthenticated(false)
    setPassword('')
  }

  const addPost = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const auth = sessionStorage.getItem('admin_password') || ''

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: auth, ...newPost }),
    })

    if (res.ok) {
      setNewPost({ title: '', content: '' })
      fetchPosts()
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#6B21A8]">SlawsNigeria Admin</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded-md ${activeTab === 'posts' ? 'bg-[#6B21A8] text-white' : 'bg-gray-200'}`}
            >
              Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md ${activeTab === 'users' ? 'bg-[#6B21A8] text-white' : 'bg-gray-200'}`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>

        {activeTab === 'posts' ? (
          <>
            {/* Add Post Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4">Add New Post</h2>
              <form onSubmit={addPost} className="space-y-4">
                <input
                  type="text"
                  placeholder="Post Title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full border px-4 py-2 rounded-md"
                  required
                />
                <textarea
                  placeholder="Post Content (use \n for new lines)"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full border px-4 py-2 rounded-md"
                  rows={4}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#6B21A8] text-white px-6 py-2 rounded-md hover:bg-[#4C1D95] disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Post'}
                </button>
              </form>
            </div>

            {/* Posts List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">All Posts</h2>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="border p-4 rounded-md">
                    <h3 className="font-semibold text-[#6B21A8]">{post.title}</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap mt-2">{post.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(post.created_at).toLocaleDateString('en-NG')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Users List */
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Leads Captured ({users.length})</h2>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="border p-4 rounded-md flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.phone} • {user.interest}</p>
                  </div>
                  <a
                    href={`https://wa.me/${user.phone}?text=Hello%20${user.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6B21A8] hover:underline text-sm"
                  >
                    WhatsApp
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
