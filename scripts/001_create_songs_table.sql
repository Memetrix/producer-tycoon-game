-- Create songs table to store uploaded music files
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT NOT NULL DEFAULT 'Electronic',
  osz_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES public.players(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_songs_active ON public.songs(is_active);
CREATE INDEX IF NOT EXISTS idx_songs_uploaded_at ON public.songs(uploaded_at DESC);

-- Enable Row Level Security
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active songs
CREATE POLICY "Anyone can view active songs"
  ON public.songs
  FOR SELECT
  USING (is_active = true);

-- Policy: Authenticated users can insert songs
CREATE POLICY "Authenticated users can upload songs"
  ON public.songs
  FOR INSERT
  WITH CHECK (true);
