# AI Calorie Tracker Setup Guide

## Prerequisites

1. Node.js 18+ installed
2. Google account for Gemini API
3. Supabase account (for database)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
# Google Gemini API Key (Required)
GOOGLE_GEMINI_API_KEY=your_actual_gemini_api_key_here

# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# NextAuth Configuration (Required)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (for login)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 4. Set Up Supabase Database

Create the following tables in your Supabase database:

#### nutrition_entries table
```sql
CREATE TABLE nutrition_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  food_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  fiber NUMERIC NOT NULL,
  sugar NUMERIC NOT NULL,
  sodium NUMERIC NOT NULL,
  type TEXT CHECK (type IN ('food', 'exercise')) NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### chat_messages table
```sql
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  nutrition_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### nutrition_goals table
```sql
CREATE TABLE nutrition_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  daily_calories NUMERIC NOT NULL DEFAULT 2000,
  daily_protein NUMERIC NOT NULL DEFAULT 150,
  daily_carbs NUMERIC NOT NULL DEFAULT 250,
  daily_fat NUMERIC NOT NULL DEFAULT 65,
  daily_fiber NUMERIC NOT NULL DEFAULT 25,
  weight_goal TEXT CHECK (weight_goal IN ('lose', 'maintain', 'gain')),
  target_weight NUMERIC,
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Set Up Google OAuth (for login)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Copy Client ID and Client Secret to your `.env.local`

### 6. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see your AI Calorie Tracker!

## Features

- 🤖 AI Nutritionist chat interface
- 📊 Real-time nutrition tracking
- 📱 PWA ready (install as mobile app)
- 📈 Daily, weekly, and monthly summaries
- 🎯 Customizable nutrition goals
- 🔐 Secure authentication with Google

## Usage

1. Sign in with your Google account
2. Start chatting with the AI nutritionist
3. Tell it what you ate: "I had 2 roti and a bowl of dal"
4. Tell it about exercise: "I went for a 30 minute run"
5. View your progress and summaries
6. Set your nutrition goals in the profile section

## Troubleshooting

### API Key Issues
- Make sure your Google Gemini API key is correctly set in `.env.local`
- Check that the API key has proper permissions
- Verify the key is not expired

### Database Issues
- Ensure Supabase tables are created correctly
- Check that RLS (Row Level Security) policies are set up properly
- Verify your Supabase credentials are correct

### Authentication Issues
- Check Google OAuth credentials
- Verify redirect URIs are correct
- Ensure NextAuth secret is set 