-- Add scheduled_broadcasts table for Week 4
CREATE TABLE IF NOT EXISTS scheduled_broadcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  tags TEXT[], -- target specific tags (NULL = all)
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE scheduled_broadcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON scheduled_broadcasts FOR ALL USING (true);

-- Add index for querying pending scheduled broadcasts
CREATE INDEX IF NOT EXISTS idx_scheduled_broadcasts_status_time 
ON scheduled_broadcasts (status, scheduled_for) 
WHERE status = 'pending';
