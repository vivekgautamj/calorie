-- Fix nutrition_goals table constraint for upsert functionality

-- Drop the existing table and recreate with proper constraint
DROP TABLE IF EXISTS nutrition_goals CASCADE;

-- Create nutrition_goals table with UNIQUE constraint on user_id
CREATE TABLE IF NOT EXISTS nutrition_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  daily_calories NUMERIC NOT NULL DEFAULT 2000,
  daily_protein NUMERIC NOT NULL DEFAULT 150,
  daily_carbs NUMERIC NOT NULL DEFAULT 250,
  daily_fat NUMERIC NOT NULL DEFAULT 65,
  daily_fiber NUMERIC NOT NULL DEFAULT 25,
  weight_goal TEXT CHECK (weight_goal IN ('lose', 'maintain', 'gain')),
  target_weight NUMERIC,
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  weight NUMERIC DEFAULT 70,
  height NUMERIC DEFAULT 170,
  age INTEGER DEFAULT 30,
  gender TEXT CHECK (gender IN ('male', 'female')) DEFAULT 'male',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_nutrition_goals_user_id ON nutrition_goals(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_nutrition_goals_updated_at 
  BEFORE UPDATE ON nutrition_goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 