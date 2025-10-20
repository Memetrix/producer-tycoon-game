-- Add Infernal Pulse track from Suno AI to songs table
INSERT INTO public.songs (
  name,
  artist,
  genre,
  osz_url,
  file_size,
  is_active,
  uploaded_at
) VALUES (
  'Infernal Pulse',
  'Suno AI',
  'Electronic',
  '/infernal-pulse.osz',
  3228123, -- File size in bytes (3.1 MB)
  true,
  NOW()
) ON CONFLICT DO NOTHING;
