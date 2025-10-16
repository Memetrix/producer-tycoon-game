-- Add Lenny Kravitz - Fly Away to songs table

INSERT INTO songs (
  id,
  name,
  artist,
  genre,
  osz_url,
  file_size, -- Added file_size column
  is_active,
  uploaded_at
) VALUES (
  gen_random_uuid(),
  'Fly Away',
  'Lenny Kravitz',
  'Rock',
  'https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/music/Lenny%20Kravitz%20Fly%20Away.osz',
  8388608, -- Added estimated file size (8 MB) to satisfy NOT NULL constraint
  true,
  NOW()
)
ON CONFLICT DO NOTHING;

-- Verify the song was added
SELECT id, name, artist, genre, is_active 
FROM songs 
WHERE name = 'Fly Away' AND artist = 'Lenny Kravitz';
