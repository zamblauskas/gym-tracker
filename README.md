# Gym Tracker

A mobile-first web app for tracking gym workouts with smart program cycling and progress tracking.

## Features

### Workout Organization
- **Programs** - Create workout programs with multiple routines
- **Routines** - Organize exercise types into workout sessions
- **Exercise Types** - Group similar exercises (e.g., "Upper chest")
- **Exercises** - Specific movements with optional machine/brand info

### Progress Tracking
- **Smart Cycling** - Automatically suggests next workout based on your program
- **Set Logging** - Track weight, reps, and RIR (Reps In Reserve)
- **Exercise History** - View your last performance for each exercise

## Quick Start

### Setup Your Program
1. **Create Exercise Types** - Add categories like "Upper chest", "Biceps", etc.
2. **Add Exercises** - Add specific exercises to each type (e.g., "Dumbbell Curl")
3. **Create Routines** - Combine exercise types into workout sessions (e.g., "Chest + Triceps")
4. **Build Program** - Add routines to a program in your preferred order

### Track Workouts
1. Open app → See "Next workout" card
2. Tap **Start Workout** → Select exercises for each type
3. Log sets with weight, reps, and RIR
4. Add notes for next time
5. Tap **Finish Workout** when done

### Skip a Workout
If you need to skip a day, tap **Skip Workout** → Confirm → App advances to next routine in cycle

## Development

```bash
cd apps/web
npm install
npm run dev
```

See [CLAUDE.md](CLAUDE.md) for detailed architecture and implementation docs.
