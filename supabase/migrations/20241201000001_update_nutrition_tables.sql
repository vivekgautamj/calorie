-- Update nutrition tables to use user_id - MVP (No RLS)

-- Drop existing tables if they exist
DROP TABLE IF EXISTS nutrition_entries CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS nutrition_goals CASCADE;

-- Create nutrition_entries table with user_id
CREATE TABLE IF NOT EXISTS nutrition_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
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

-- Create chat_messages table with user_id
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  nutrition_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nutrition_goals table with user_id
CREATE TABLE IF NOT EXISTS nutrition_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_nutrition_entries_user_date ON nutrition_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_nutrition_entries_type ON nutrition_entries(type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_nutrition_goals_user_id ON nutrition_goals(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_nutrition_entries_updated_at 
  BEFORE UPDATE ON nutrition_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_goals_updated_at 
  BEFORE UPDATE ON nutrition_goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 