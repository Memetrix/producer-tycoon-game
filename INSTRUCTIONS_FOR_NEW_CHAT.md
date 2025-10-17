# Instructions for New Chat - Producer Tycoon Development

## 🎯 Project Overview

**Project Name**: Producer Tycoon (Mobile Idle Game)  
**Type**: Mobile-first idle/incremental game with rhythm game mechanics + AI generation  
**Tech Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Supabase (PostgreSQL + Auth), Vercel Blob, fal.ai, Groq API  
**Repository**: `producer-tycoon-game` (GitHub)  
**Current Version**: v100+ (Latest: AI generation + real leaderboards integrated)

## 👤 About the User

**Name**: Working with user who speaks Russian (respond in Russian when appropriate)  
**Development Style**: 
- Prefers incremental changes over massive rewrites
- Likes to test frequently
- Values clear explanations
- Appreciates when you address issues systematically
- Has a friend named Григорий (Gregory) who is a professional composer helping with music

**Communication Preferences**:
- Respond in Russian for general conversation
- Use English for technical terms and code
- Be direct and practical
- No excessive emojis
- Keep postambles to 2-4 sentences

## 🎮 Game Concept

A mobile idle game where you play as a music producer building your career:

### Core Gameplay Loop
1. **Create Beats** - Rhythm game mechanic (tap notes in time with music)
2. **Earn Money** - Sell beats for cash
3. **Upgrade Equipment** - Phone → Headphones → Microphone → Computer
4. **Hire Artists** - Generate passive income ($/minute)
5. **Build Reputation** - Unlock better artists and opportunities
6. **Complete Daily Tasks** - Bonus rewards and streak system

### Key Mechanics
- **Energy System**: 150 max energy (with bonuses), regenerates 2/minute, costs 15 per beat
- **Rhythm Game**: 4 lanes (kick, snare, hi-hat, tom), OSU beatmap parsing, accuracy-based rewards
- **AI Generation**: Beat names via Groq API, cover art via fal.ai
- **Quality System**: Equipment level affects beat quality (0-100%), quality affects price
- **Passive Income**: Artists generate money while offline (capped at 4 hours)
- **Leaderboards**: Real-time rankings with vinyl disc badges for top 3
- **Daily Tasks**: 3 tasks per day, streak rewards at 7/14/21/30/40/50/60 days
- **Progression**: 6 reputation tiers with increasing difficulty and rewards

## 🏗️ Technical Architecture

### File Structure (Key Files)
\`\`\`
app/
├── page.tsx                    # Main app container, auth logic, game state management
├── auth/
│   ├── login/page.tsx         # Login screen
│   └── signup/page.tsx        # Signup screen
├── api/
│   ├── generate-avatar/       # fal.ai avatar generation
│   ├── generate-cover/        # fal.ai album cover generation
│   ├── generate-beat-name/    # Groq API beat name generation
│   └── leaderboards/          # Leaderboards data fetching
└── globals.css                # Tailwind v4 config, design tokens

components/
├── home-screen.tsx            # Main hub, shows resources, navigation
├── stage-screen.tsx           # Rhythm game (beat creation)
├── studio-screen.tsx          # Equipment upgrades
├── artists-screen.tsx         # Artist hiring and management
├── upgrades-screen.tsx        # Daily tasks and free training
├── character-creation.tsx     # Onboarding character creator
├── bottom-nav.tsx             # Navigation bar
├── leaderboards-screen.tsx      # Leaderboards display
└── ui/                        # shadcn/ui components

lib/
├── game-state.ts              # GameState interface, constants, helper functions
├── game-storage.ts            # Supabase integration, save/load game state
└── supabase/
    ├── client.ts              # Browser Supabase client
    └── server.ts              # Server Supabase client (not actively used)

scripts/
├── create-game-state-table.sql           # Initial DB schema
├── add-daily-tasks-columns.sql           # Daily tasks migration
├── restore-energy.sql                    # Utility: restore player energy
├── add-four-hour-quests-columns.sql      # Quest system (not yet run)
├── set-energy-custom.sql                 # Set custom energy value
├── max-out-resources.sql                 # Max out all resources
└── leaderboards-reset.sql                # Reset leaderboards weekly

public/
└── [generated images]         # AI-generated avatars and album covers
\`\`\`

### Database Schema (Supabase)

**Table**: `game_state`

\`\`\`sql
CREATE TABLE game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  
  -- Resources
  money DECIMAL DEFAULT 500,
  reputation INTEGER DEFAULT 0,
  energy INTEGER DEFAULT 150,
  
  -- Equipment (levels 0-10)
  equipment_phone INTEGER DEFAULT 0,
  equipment_headphones INTEGER DEFAULT 0,
  equipment_mic INTEGER DEFAULT 0,
  equipment_computer INTEGER DEFAULT 0,
  
  -- Artists (levels 0-10)
  artist_street_poet INTEGER DEFAULT 0,
  artist_mc_flow INTEGER DEFAULT 0,
  artist_lil_dreamer INTEGER DEFAULT 0,
  artist_young_legend INTEGER DEFAULT 0,
  
  -- Character
  avatar_url TEXT,
  character_name TEXT,
  gender TEXT,
  music_style TEXT,
  starting_bonus TEXT,
  
  -- Progression
  total_beats_created INTEGER DEFAULT 0,
  total_money_earned DECIMAL DEFAULT 0,
  current_stage INTEGER DEFAULT 1,
  stage_progress INTEGER DEFAULT 0,
  
  -- Daily Tasks
  daily_tasks_completed_ids TEXT[], -- Array of task IDs
  daily_tasks_last_reset TIMESTAMP,
  daily_tasks_current_streak INTEGER DEFAULT 0,
  daily_tasks_claimed_streak_rewards INTEGER[], -- Array of claimed milestones
  
  -- Leaderboards
  leaderboard_rank INTEGER DEFAULT NULL,
  
  -- Timestamps
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own game state"
  ON game_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game state"
  ON game_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game state"
  ON game_state FOR UPDATE
  USING (auth.uid() = user_id);
\`\`\`

### Integrations

**Active Integrations**:
1. **Supabase** - PostgreSQL database + Authentication
   - Env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Using `@supabase/ssr` with server/client separation
   
2. **fal.ai** - AI image generation
   - Env var: `FAL_KEY`
   - Used for avatar and beat cover art generation
   - Model: `fal-ai/flux-dev` (512x512 resolution)

3. **Groq API** - AI text generation
   - Env var: `GROQ_API_KEY`
   - Used for beat name generation
   - Model: `llama-3.3-70b-versatile`

4. **Vercel Blob** - Image storage
   - Env var: `BLOB_READ_WRITE_TOKEN`
   - Stores generated avatars and covers

## 🤖 AI Generation System

### Beat Name Generation
**API Route**: `/app/api/generate-beat-name/route.ts`

**How it works**:
1. Receives original track name and artist
2. Sends prompt to Groq API (llama-3.3-70b-versatile)
3. Temperature 0.9 for variety (prevents repetitive results)
4. Returns creative parody/homage name (2-4 words)
5. Fallback to random names if API fails

**Example Prompt**:
\`\`\`
You are a creative music producer. Create a parody/homage beat name based on the original track.

Original: Feel Good Inc. by Gorillaz

Create a short, catchy beat name (2-4 words) that's a playful reference to the original.
Be creative and varied - here are some example styles:
- "Vibe Syndicate" (corporate twist)
- "Good Energy Co." (business parody)
- "Mood Factory" (industrial theme)
- "Chill Corporation" (office humor)

Only respond with the beat name, nothing else.
\`\`\`

### Cover Art Generation
**API Route**: `/app/api/generate-beat-cover/route.ts`

**How it works**:
1. Receives beat name from previous step
2. Generates creative prompt using Groq API
3. Sends prompt to fal.ai (FLUX.1 dev model)
4. Image size: 512x512 (square_hd)
5. Uploads to Vercel Blob
6. Returns blob URL

**Example Prompt Generation**:
\`\`\`
You are a creative art director. Create a detailed image generation prompt for album cover art.

Beat name: "Vibe Syndicate"

Create a vivid, detailed prompt for an AI image generator. The style should be:
- Modern hip-hop/trap aesthetic
- Bold colors and striking composition
- Professional album cover quality
- Unique and memorable

Only respond with the image prompt, nothing else.
\`\`\`

### Testing AI Generation
**Test Page**: `/test-ai`

Features:
- Test beat name generation with custom track names
- Test cover art generation with custom prompts
- See results immediately
- View detailed error logs
- No need to play rhythm game

## 🏆 Leaderboards System

### Implementation
**API Route**: `/app/api/leaderboards/route.ts`  
**Component**: `components/leaderboards-screen.tsx`

**How it works**:
1. Fetches real player data from Supabase `game_state` table
2. Calculates score: `total_money_earned + (reputation * 10)`
3. Sorts players by score (descending)
4. Filters weekly leaderboard by `updated_at` (last 7 days)
5. Identifies current player by `playerId` query parameter
6. Returns top 10 players + current player's rank

**Top 3 Badges**:
- 1st place: Platinum vinyl disc (silver metallic)
- 2nd place: Gold vinyl disc (gold metallic)
- 3rd place: Silver vinyl disc (gray metallic)
- Design: Realistic vinyl with concentric grooves, radial gradients, center label

**Score Calculation**:
\`\`\`typescript
const score = player.total_money_earned + (player.reputation * 10)
\`\`\`

## 🔧 Developer Tools

### SQL Scripts
Located in `/scripts/` folder:

1. **`restore-energy.sql`** - Restore energy to max
2. **`set-energy-custom.sql`** - Set custom energy value
3. **`max-out-resources.sql`** - Max out all resources (energy, money, reputation)
4. **`leaderboards-reset.sql`** - Reset leaderboards weekly

**Usage**: Run from v0 UI by clicking "Run Script" button

**Important**: All scripts use `auth.uid()::text` to match `players.user_id` (text type)

### Test Pages
1. **`/test-ai`** - Test AI generation without playing rhythm game
   - Test beat name generation
   - Test cover art generation
   - View results and errors

## 🐛 Recent Bug Fixes

### Rhythm Game Issues (Fixed)
1. **Notes Disappearing**: Fixed timing calculation in `GameInstance.ts`
   - Added debug logging for note spawning
   - Fixed `isWithinTime()` calculation
   
2. **No Sound on Key Press**: Added `playEffect()` call in `Track.onKeyDown`
   - Drum sounds now play when keys are pressed
   - Audio context resumes on mobile browsers

3. **Leaderboard Not Showing Current Player**: Added `playerId` to GameState
   - Player ID now tracked and passed to API
   - Current player rank displayed correctly

### AI Generation Issues (Fixed)
1. **AI Gateway Failures**: Switched to direct Groq API calls
   - Bypassed Vercel AI Gateway (was returning "fetch failed")
   - Using direct fetch to `https://api.groq.com/openai/v1/chat/completions`

2. **Repetitive Beat Names**: Increased temperature to 0.9
   - Added example variations in prompt
   - Now generates diverse names for same track

3. **Large Image Files**: Reduced resolution to 512x512
   - Changed from 1024x1024 to 512x512
   - 4x smaller file size, faster generation

## 🔧 Key Technical Decisions

### Authentication
- **Initially tried**: `@supabase/ssr` with middleware
- **Problem**: Session not persisting across page loads
- **Solution**: Switched to `@supabase/supabase-js` with localStorage
- **Current**: Client-side auth only, using `createClient()` from `@supabase/supabase-js`
- **Auth check**: Single check on mount + `onAuthStateChange` listener for SIGNED_IN/SIGNED_OUT events only

### Game State Management
- **Pattern**: Lift state to `app/page.tsx`, pass down as props
- **Persistence**: Auto-save to Supabase every 30 seconds + on unmount
- **Offline Earnings**: Calculated on load based on `last_active` timestamp
  - Capped at 240 minutes (4 hours)
  - Uses artist passive income rates

### Energy Regeneration
- **Rate**: 1 energy per minute
- **Implementation**: 
  - Client-side: `setInterval` every 5 seconds, adds 0.083 energy
  - Server-side: Calculated on load based on time difference
- **Bug Fixed**: Energy now properly regenerates during offline time

### Image Generation
- **Avatar**: Generated on character creation using fal.ai
- **Album Covers**: Generated when creating beats (currently unused in UI)
- **Storage**: Uploaded to Vercel Blob, URL saved in database

## 🐛 Known Issues & TODOs

### Completed
✅ Fixed auth redirect loop  
✅ Fixed character bonus mismatch (networker → connector, energetic → energizer)  
✅ Fixed energy regeneration during offline time  
✅ Rebalanced economy for 60-day season  
✅ Created composer brief for real music integration  
✅ Integrated real leaderboards with database  
✅ Added AI beat name generation  
✅ Added AI cover art generation  
✅ Fixed rhythm game notes disappearing  
✅ Fixed no sound on key press  
✅ Created developer tools (SQL scripts, test pages)  

### Pending
- [ ] Implement MIDI parser for real music integration
- [ ] Add visual feedback for streak rewards
- [ ] Add album cover display in beat creation flow
- [ ] Add sound effects for UI interactions
- [ ] Add animations for upgrades and level-ups
- [ ] Implement stage progression system
- [ ] Add leaderboard pagination (beyond top 10)
- [ ] Add weekly leaderboard reset automation

## 💡 Important Notes for Next Chat

1. **User prefers incremental changes** - Don't rewrite everything at once
2. **Always check current implementation** before suggesting changes
3. **Economy is balanced for 60-day season** - Don't change numbers without discussing
4. **Game state is in app/page.tsx** - This is intentional, don't suggest moving to context
5. **User speaks Russian** - Respond in Russian for non-technical discussion
6. **AI generation uses Groq + fal.ai** - Don't suggest switching to other providers
7. **Leaderboards use real database data** - Not mock data anymore
8. **Test page at /test-ai** - Use this to debug AI generation
9. **SQL scripts for energy** - Use these instead of manual database edits
10. **Version v100+** - Latest with AI generation and real leaderboards

## 📊 Economy Design Documents

### Available Documents
1. **`GAME_DESIGN_DOCUMENT.md`** - Original game design (outdated)
2. **`ECONOMY_REBALANCE_SPEC.md`** - 60-day season rebalance spec (current)
3. **`COMPOSER_BRIEF.md`** - Music integration specifications
4. **`user_read_only_context/text_attachments/pasted-text-GFW3y.txt`** - Detailed 4-hour loop economy spec (not implemented, too complex)
5. **`user_read_only_context/text_attachments/pasted-text-DNZeC.txt`** - Same as ECONOMY_REBALANCE_SPEC.md

### Current Balance Philosophy
- **Season Length**: 60 days
- **Target Players**: Casual (3 sessions/day), Core (4 sessions/day), Hardcore (5 sessions/day)
- **Session Length**: 7 minutes average
- **Progression**: Smooth curve, no hard walls
- **Monetization**: Not yet implemented (future: gems, premium artists, cosmetics)

## 🎯 Current State Summary

**What Works**:
- ✅ Full authentication system (login/signup)
- ✅ Character creation with avatar generation
- ✅ Rhythm game with OSU beatmap parsing
- ✅ Equipment upgrade system
- ✅ Artist hiring and passive income
- ✅ Daily tasks with streak rewards
- ✅ Offline earnings calculation
- ✅ Auto-save to database
- ✅ Energy regeneration
- ✅ Reputation system
- ✅ Stage progression tracking
- ✅ AI-generated beat names
- ✅ AI-generated album covers
- ✅ Real-time leaderboards

**What's Next**:
1. Integrate real music (MIDI + audio) from Gregory
2. Implement MIDI parser
3. Add more visual polish and animations
4. Run quest system SQL migration
5. Add sound effects and haptic feedback

## 🚀 Quick Start Commands

\`\`\`bash
# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run SQL scripts (from v0 UI)
# Click "Run Script" button in the scripts folder
\`\`\`

## 📝 Code Style Preferences

- TypeScript strict mode
- Functional components with hooks
- Tailwind for all styling (no CSS modules)
- Descriptive variable names
- Comments for complex logic
- Console logs prefixed with `[v0]` for debugging

## 🎮 Game Balance Targets (60-Day Season)

**Day 7 Target** (Casual Player):
- Money: ~$15,000
- Reputation: ~300
- Equipment: Phone Lv5, Headphones Lv3
- Artists: Street Poet Lv3, MC Flow Lv2

**Day 15 Target** (Core Player):
- Money: ~$75,000
- Reputation: ~800
- Equipment: All Lv5+
- Artists: All hired, Lv3-5

**Day 30 Target** (Hardcore Player):
- Money: ~$500,000
- Reputation: ~2,500
- Equipment: All Lv8-10
- Artists: All Lv8-10

---

**Last Updated**: Version 100+ (October 17, 2025)  
**Chat Context**: This document was updated with AI generation and leaderboards features  
**Next Steps**: Integrate real music from Gregory (see COMPOSER_BRIEF.md), add more polish and animations
