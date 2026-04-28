-- Lean MVP Schema - Free tools only
-- Run in Supabase SQL Editor

-- Users table (lead capture)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  interest TEXT NOT NULL CHECK (interest IN ('events', 'products', 'mentorship')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table (daily content)
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public can read posts
CREATE POLICY "Posts are publicly readable" ON posts FOR SELECT USING (true);

-- Public can insert users (lead capture)
CREATE POLICY "Anyone can add users" ON users FOR INSERT WITH CHECK (true);

-- Only authenticated can manage posts (admin)
CREATE POLICY "Authenticated can manage posts" ON posts FOR ALL USING (auth.role() = 'authenticated');
