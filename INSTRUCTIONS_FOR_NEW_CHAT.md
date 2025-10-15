# Instructions for New Chat - Producer Tycoon Development

## 🎯 Project Overview

**Project Name**: Producer Tycoon (Mobile Idle Game)  
**Type**: Mobile-first idle/incremental game with rhythm game mechanics  
**Tech Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Supabase (PostgreSQL + Auth), Vercel Blob, fal.ai  
**Repository**: `producer-tycoon-game` (GitHub)  
**Current Version**: v98 (rolled back from v97 due to too many changes at once)

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
- **Energy System**: 100 max energy, regenerates 1/minute, costs 20 per beat
- **Rhythm Game**: 4 lanes (kick, snare, hi-hat, tom), 16 notes per session, accuracy-based rewards
- **Quality System**: Equipment level affects beat quality (0-100%), quality affects price
- **Passive Income**: Artists generate money while offline (capped at 240 minutes)
- **Daily Tasks**: 2 tasks per day, streak rewards at 7/14/30 days
- **Progression**: 5 stages (S1-S5) with increasing difficulty and rewards

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
│   └── generate-cover/        # fal.ai album cover generation
└── globals.css                # Tailwind v4 config, design tokens

components/
├── home-screen.tsx            # Main hub, shows resources, navigation
├── stage-screen.tsx           # Rhythm game (beat creation)
├── studio-screen.tsx          # Equipment upgrades
├── artists-screen.tsx         # Artist hiring and management
├── upgrades-screen.tsx        # Daily tasks and free training
├── character-creation.tsx     # Onboarding character creator
├── bottom-nav.tsx             # Navigation bar
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
└── add-four-hour-quests-columns.sql      # Quest system (not yet run)

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
  energy INTEGER DEFAULT 100,
  
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
   - Using `@supabase/supabase-js` (NOT `@supabase/ssr` - we switched to localStorage-based auth)
   
2. **fal.ai** - AI image generation
   - Env var: `FAL_KEY`
   - Used for avatar and album cover generation
   - Model: `fal-ai/flux/schnell`

3. **Vercel Blob** - Image storage
   - Env var: `BLOB_READ_WRITE_TOKEN`
   - Stores generated avatars and covers

## 🎨 Design System

### Colors
- Using Tailwind v4 design tokens in `globals.css`
- Dark theme with purple/blue accents
- Key colors: `--color-primary`, `--color-background`, `--color-foreground`

### Typography
- Font: Geist Sans (headings and body)
- Font Mono: Geist Mono (code/numbers)
- Configured in `app/layout.tsx` and `globals.css`

### Layout
- Mobile-first design (max-width: 480px)
- Flexbox for most layouts
- Bottom navigation bar (5 tabs)
- Consistent padding and spacing

## 💰 Economy Balance (Current State)

### Starting Resources
- **Base Money**: $800 (was $500)
- **Base Energy**: 100
- **Base Reputation**: 0

### Character Bonuses (Applied at creation)
**Music Styles**:
- Hip-Hop: +$200, +50 reputation
- Trap: +$100, +100 reputation
- R&B: +$100, Free Headphones Lv1
- Pop: +$150, +50 reputation
- Electronic: +$100, +20 max energy

**Starting Bonuses**:
- Producer: +$100, Free Headphones Lv1
- Hustler: +$300, +$200
- Connector: +$100, +100 reputation
- Energizer: +$100, +50 max energy

### Equipment Costs (Current - Rebalanced)
**Base Prices** (multiply by 1.4^level):
- Phone: $80 (was $100)
- Headphones: $120 (was $150)
- Microphone: $200 (was $250)
- Computer: $400 (was $500)

**Multiplier**: 1.4x per level (was 1.5x)

### Artist Costs & Income (Current - Rebalanced)
**Street Poet**:
- Base cost: $70 (was $90)
- Multiplier: 1.6x
- Income: $1/min at Lv1 → $25/min at Lv10

**MC Flow**:
- Base cost: $80 (was $100)
- Multiplier: 1.6x
- Income: $2/min at Lv1 → $35/min at Lv10

**Lil Dreamer**:
- Base cost: $100 (was $120)
- Multiplier: 1.6x
- Reputation required: 100
- Income: $3/min at Lv1 → $45/min at Lv10

**Young Legend**:
- Base cost: $200 (was $250)
- Multiplier: 1.6x
- Reputation required: 400 (was 500)
- Income: $5/min at Lv1 → $125/min at Lv10

### Beat Pricing Formula
\`\`\`typescript
const basePrice = 60
const qualityBonus = quality * 0.8 // quality is 0-100
const beatPrice = basePrice + qualityBonus
// Range: $60 (0% quality) to $140 (100% quality)
\`\`\`

### Reputation Gains
- **Per Beat Sold**: quality / 5 (was quality / 10)
  - Example: 80% quality beat = 16 reputation (was 8)
- **Daily Task 1**: +20 reputation (was +10)
- **Daily Task 2**: +30 reputation (was +15)

### Daily Tasks & Rewards
**Task 1** (Day 1): Get 10 subscribers
- Reward: $100, +20 reputation (was $50, +10 rep)

**Task 2** (Day 2): Get 50 likes
- Reward: $150, +30 reputation, +20 energy (was $75, +15 rep, +10 energy)

**Streak Rewards**:
- 7 days: $500, +100 reputation, +50 energy
- 14 days: $1000, +200 reputation, +100 energy
- 30 days: $2500, +500 reputation, +200 energy

### Free Training Rewards
- **Seminar**: $300, +100 reputation (was $100, +30 rep)
- **Book Chapter**: $400, +150 reputation (was $150, +50 rep)

## 🎵 Rhythm Game Mechanics

### Current Implementation
- **Web Audio API** for drum sounds (kick, snare, hi-hat, tom)
- **5 Musical Patterns** randomly selected each session
- **16 Notes** per session
- **4 Lanes** (one per drum type)
- **Timing Windows**:
  - Perfect: ±50ms (100% quality)
  - Good: ±100ms (70% quality)
  - Miss: >100ms (0% quality)

### Upcoming Change: Real Music Integration
**Composer**: Григорий (Gregory) - professional composer
**Format**: MIDI + WAV/MP3
- MIDI file contains note timings (4 tracks for 4 drum types)
- Audio file contains the actual music
- We'll parse MIDI to extract note positions
- See `COMPOSER_BRIEF.md` for full specifications

**Target Duration**: 60-90 seconds (32-48 notes)

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
✅ Rebalanced economy for 30-day season  
✅ Created composer brief for real music integration  

### Pending
- [ ] Run `scripts/add-four-hour-quests-columns.sql` (quest system ready but not in DB)
- [ ] Implement MIDI parser for real music integration
- [ ] Add visual feedback for streak rewards
- [ ] Add album cover display in beat creation flow
- [ ] Add sound effects for UI interactions
- [ ] Add animations for upgrades and level-ups
- [ ] Implement stage progression system (currently just tracks progress)

### Future Enhancements
- Multiplayer features (leaderboards, challenges)
- More artist types
- Equipment presets/combos
- Beat marketplace (sell to other players)
- Social features (share beats, follow producers)

## 🔄 Development Workflow

### Making Changes
1. **Always read files first** before editing (use `ReadFile` or `SearchRepo`)
2. **Use parallel tool calls** when reading multiple independent files
3. **Search systematically**: broad → specific → verify relationships
5. **Add change comments**: `// description of what changed`
6. **Keep postambles short**: 2-4 sentences max

### Testing Approach
1. User tests frequently in the v0 preview
2. Check debug logs when issues arise
3. Use `console.log("[v0] ...")` for debugging
4. Remove debug logs after fixing issues

### Git Workflow
- **Repository**: `producer-tycoon-game`
- **Branch**: `main` (previously had `app` branch, now merged)
- User pushes from v0 UI directly to GitHub
- User can deploy to Vercel from v0 UI

## 📊 Economy Design Documents

### Available Documents
1. **`GAME_DESIGN_DOCUMENT.md`** - Original game design (outdated)
2. **`ECONOMY_REBALANCE_SPEC.md`** - 30-day season rebalance spec (current)
3. **`COMPOSER_BRIEF.md`** - Music integration specifications
4. **`user_read_only_context/text_attachments/pasted-text-GFW3y.txt`** - Detailed 4-hour loop economy spec (not implemented, too complex)
5. **`user_read_only_context/text_attachments/pasted-text-DNZeC.txt`** - Same as ECONOMY_REBALANCE_SPEC.md

### Current Balance Philosophy
- **Season Length**: 30 days
- **Target Players**: Casual (3 sessions/day), Core (4 sessions/day), Hardcore (5 sessions/day)
- **Session Length**: 7 minutes average
- **Progression**: Smooth curve, no hard walls
- **Monetization**: Not yet implemented (future: gems, premium artists, cosmetics)

## 🎯 Current State Summary

**What Works**:
- ✅ Full authentication system (login/signup)
- ✅ Character creation with avatar generation
- ✅ Rhythm game with 5 musical patterns
- ✅ Equipment upgrade system
- ✅ Artist hiring and passive income
- ✅ Daily tasks with streak rewards
- ✅ Offline earnings calculation
- ✅ Auto-save to database
- ✅ Energy regeneration
- ✅ Reputation system
- ✅ Stage progression tracking

**What's Next**:
1. Integrate real music (MIDI + audio) from Gregory
2. Implement MIDI parser
3. Add more visual polish and animations
4. Run quest system SQL migration
5. Add sound effects and haptic feedback

## 💡 Important Notes for Next Chat

1. **User prefers incremental changes** - Don't rewrite everything at once
2. **Always check current implementation** before suggesting changes
3. **Economy is balanced for 30-day season** - Don't change numbers without discussing
4. **Auth uses localStorage** - Don't suggest switching back to SSR/middleware
5. **Game state is in app/page.tsx** - This is intentional, don't suggest moving to context
6. **User speaks Russian** - Respond in Russian for non-technical discussion
7. **Composer is named Gregory** - He's providing real music, see COMPOSER_BRIEF.md
8. **Version v98 is current** - Rolled back from v97 due to too many changes

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

## 🎮 Game Balance Targets (30-Day Season)

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

**Last Updated**: Version 98  
**Chat Context**: This document was created at the end of a long chat session to preserve context for the next AI instance.  
**Next Steps**: Integrate real music from Gregory (see COMPOSER_BRIEF.md)
