# Producer Tycoon - Mobile Music Production Game

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/gakhaleksey-4260s-projects/v0-producer-tycoon-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/DR7RjPI607V)

## 🎮 About

Producer Tycoon is a mobile-first idle/incremental game where you build your career as a music producer. Create beats through rhythm game mechanics, upgrade your equipment, hire artists, and climb the leaderboards!

## ✨ Features

### Core Gameplay
- **Rhythm Game**: 4-lane drum system with OSU beatmap support
- **AI Generation**: Beat names via Groq API, cover art via fal.ai
- **Equipment Upgrades**: 6 categories, 10 levels each
- **Artist Management**: Hire artists for passive income
- **Skills Tree**: 9 skills across 3 branches
- **Daily Tasks**: Streak system with rewards
- **Leaderboards**: Real-time rankings with top 3 vinyl disc badges

### Technical Features
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Supabase** for database and auth
- **Vercel Blob** for image storage
- **fal.ai** for AI image generation
- **Groq API** for AI text generation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- fal.ai API key
- Groq API key
- Vercel Blob token

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/your-username/producer-tycoon-game.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run database migrations
# Execute SQL scripts in /scripts folder

# Start development server
npm run dev
\`\`\`

### Environment Variables

\`\`\`env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# fal.ai
FAL_KEY=your_fal_api_key

# Groq
GROQ_API_KEY=your_groq_api_key

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your_blob_token
\`\`\`

## 📁 Project Structure

\`\`\`
producer-tycoon-game/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Main game container
│   ├── api/                 # API routes
│   │   ├── generate-beat-name/
│   │   ├── generate-beat-cover/
│   │   └── leaderboards/
│   └── test-ai/             # AI generation test page
├── components/              # React components
│   ├── home-screen.tsx
│   ├── stage-screen.tsx
│   ├── studio-screen.tsx
│   ├── artists-screen.tsx
│   ├── leaderboards-screen.tsx
│   └── ui/                  # shadcn/ui components
├── lib/                     # Utilities and helpers
│   ├── game-state.ts        # Game state management
│   ├── game-storage.ts      # Supabase integration
│   └── rhythm-plus/         # Rhythm game engine
├── scripts/                 # SQL scripts
│   ├── create-game-state-table.sql
│   ├── restore-energy.sql
│   └── ...
└── public/                  # Static assets
\`\`\`

## 🎯 Game Mechanics

### Energy System
- Max energy: 150 (with bonuses)
- Regeneration: 2 energy/minute
- Cost per beat: 15 energy

### Beat Creation
1. Select track from library (29+ OSU beatmaps)
2. Choose difficulty (1-5 levels)
3. Play rhythm game (4 lanes: kick, snare, hi-hat, tom)
4. AI generates beat name and cover art
5. Earn money and reputation based on quality

### Progression
- **6 Reputation Tiers**: Street → Underground → Rising → Established → Famous → Legend
- **Equipment**: Phone, Headphones, Mic, Computer, MIDI, Audio Interface
- **Artists**: 8 artists across 3 tiers, generate passive income
- **Skills**: 9 skills for energy, quality, and money bonuses
- **Leaderboards**: Compete globally and weekly

## 🤖 AI Integration

### Beat Name Generation
- **API**: Groq (llama-3.3-70b-versatile)
- **Temperature**: 0.9 for variety
- **Output**: Creative parody/homage names (2-4 words)

### Cover Art Generation
- **API**: fal.ai (FLUX.1 dev)
- **Resolution**: 512x512
- **Style**: Modern hip-hop/trap aesthetic

## 🏆 Leaderboards

### Scoring System
\`\`\`typescript
score = total_money_earned + (reputation * 10)
\`\`\`

### Top 3 Badges
- 🥇 Platinum (1st place)
- 🥈 Gold (2nd place)
- 🥉 Silver (3rd place)

## 🛠️ Developer Tools

### Test Pages
- `/test-ai` - Test AI generation without playing

### SQL Scripts
- `restore-energy.sql` - Restore energy to max
- `set-energy-custom.sql` - Set custom energy value
- `max-out-resources.sql` - Max out all resources

## 📊 Economy Balance

Balanced for 60-day season with 3 player types:
- **Casual**: 3 sessions/day (7 min each)
- **Core**: 4 sessions/day
- **Hardcore**: 5 sessions/day

See `ECONOMY_REBALANCE_SPEC.md` for detailed balance.

## 📝 Documentation

- `FEATURE_AUDIT.md` - Complete feature audit and roadmap
- `INSTRUCTIONS_FOR_NEW_CHAT.md` - Onboarding for new developers
- `COMPOSER_BRIEF.md` - Music integration specifications
- `GAME_DESIGN_DOCUMENT.md` - Original game design

## 🤝 Contributing

This is a private project, but feedback and suggestions are welcome!

## 📄 License

All rights reserved.

## 🔗 Links

- **Live App**: [https://vercel.com/gakhaleksey-4260s-projects/v0-producer-tycoon-app](https://vercel.com/gakhaleksey-4260s-projects/v0-producer-tycoon-app)
- **v0 Project**: [https://v0.app/chat/projects/DR7RjPI607V](https://v0.app/chat/projects/DR7RjPI607V)

---

**Version**: 100+ (October 17, 2025)  
**Status**: 90% MVP Complete  
**Next**: Real music integration, more polish and animations
