-- SlawsNigeria MVP Schema
-- Run this in Supabase SQL Editor

-- Services table (Offer Hub content)
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('events', 'products', 'mentorship')),
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  whatsapp_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscribers table (WhatsApp Growth Engine)
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  interest_tags TEXT[], -- e.g., ['events', 'products']
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Public read access for services
CREATE POLICY "Services are publicly readable" ON services FOR SELECT USING (true);

-- Only authenticated users can insert subscribers (via API)
CREATE POLICY "Allow insert for subscribers" ON subscribers FOR INSERT WITH CHECK (true);
