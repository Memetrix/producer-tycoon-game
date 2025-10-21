-- Fix RLS Policies for Security
-- This migration replaces permissive policies with proper auth-based policies
-- Date: 2025-10-21

-- ============================================================================
-- DROP OLD PERMISSIVE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Allow all operations on players" ON public.players;
DROP POLICY IF EXISTS "Allow all operations on game_state" ON public.game_state;
DROP POLICY IF EXISTS "Allow all operations on beats" ON public.beats;
DROP POLICY IF EXISTS "Allow all operations on equipment" ON public.equipment;
DROP POLICY IF EXISTS "Allow all operations on player_artists" ON public.player_artists;
DROP POLICY IF EXISTS "Allow all operations on player_courses" ON public.player_courses;

-- ============================================================================
-- CREATE SECURE RLS POLICIES
-- ============================================================================

-- PLAYERS TABLE
-- Users can only read/write their own player profile
CREATE POLICY "Users can view their own player"
  ON public.players FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own player"
  ON public.players FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own player"
  ON public.players FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own player"
  ON public.players FOR DELETE
  USING (auth.uid()::text = user_id);

-- GAME_STATE TABLE
-- Users can only access game state for their own player
CREATE POLICY "Users can view their own game state"
  ON public.game_state FOR SELECT
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create their own game state"
  ON public.game_state FOR INSERT
  WITH CHECK (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their own game state"
  ON public.game_state FOR UPDATE
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own game state"
  ON public.game_state FOR DELETE
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

-- BEATS TABLE
-- Users can only access their own beats
-- BUT can view all beats for leaderboards (read-only)
CREATE POLICY "Users can view all beats for leaderboards"
  ON public.beats FOR SELECT
  USING (true); -- Allow reading all beats for leaderboards

CREATE POLICY "Users can create their own beats"
  ON public.beats FOR INSERT
  WITH CHECK (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their own beats"
  ON public.beats FOR UPDATE
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own beats"
  ON public.beats FOR DELETE
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

-- EQUIPMENT TABLE
-- Users can only access their own equipment
CREATE POLICY "Users can view their own equipment"
  ON public.equipment FOR SELECT
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create their own equipment"
  ON public.equipment FOR INSERT
  WITH CHECK (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their own equipment"
  ON public.equipment FOR UPDATE
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own equipment"
  ON public.equipment FOR DELETE
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

-- PLAYER_ARTISTS TABLE
-- Users can only access their own hired artists
CREATE POLICY "Users can view their own artists"
  ON public.player_artists FOR SELECT
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can hire artists"
  ON public.player_artists FOR INSERT
  WITH CHECK (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their own artists"
  ON public.player_artists FOR UPDATE
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own artists"
  ON public.player_artists FOR DELETE
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

-- PLAYER_COURSES TABLE
-- Users can only access their own purchased courses
CREATE POLICY "Users can view their own courses"
  ON public.player_courses FOR SELECT
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can purchase courses"
  ON public.player_courses FOR INSERT
  WITH CHECK (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their own courses"
  ON public.player_courses FOR UPDATE
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own courses"
  ON public.player_courses FOR DELETE
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()::text
    )
  );

-- ============================================================================
-- CREATE LEADERBOARDS VIEW (PUBLIC READ-ONLY)
-- ============================================================================

-- Create a view for public leaderboards that shows top players
-- This allows public access to leaderboard data without exposing sensitive info
CREATE OR REPLACE VIEW public.leaderboards AS
SELECT
  p.id as player_id,
  p.character_name,
  p.character_avatar,
  gs.reputation,
  gs.total_beats_created,
  gs.total_money_earned,
  gs.total_beats_earnings,
  gs.stage,
  gs.updated_at
FROM public.players p
JOIN public.game_state gs ON p.id = gs.player_id
ORDER BY gs.reputation DESC
LIMIT 100;

-- Grant public read access to leaderboards view
GRANT SELECT ON public.leaderboards TO anon, authenticated;

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================

-- ✅ Security Improvements:
-- 1. Users can only read/write their OWN data (based on auth.uid())
-- 2. Beats table allows public SELECT for leaderboards (read-only)
-- 3. Created leaderboards view for public access
-- 4. Removed permissive policies (using (true))
--
-- ⚠️ Important:
-- - auth.uid() returns the authenticated user's UUID from Supabase Auth
-- - This requires Supabase Auth to be properly configured
-- - Anonymous users (not logged in) will have auth.uid() = NULL and won't match any rows
--
-- 📝 To apply this migration:
-- Run this SQL in Supabase SQL Editor or via migration tool
