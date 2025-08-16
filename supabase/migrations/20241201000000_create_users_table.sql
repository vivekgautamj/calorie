-- Update users table structure - MVP (No RLS)

-- Drop existing table if it exists
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with proper structure
CREATE TABLE IF NOT EXISTS users (
  user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  country TEXT DEFAULT 'US',
  timezone TEXT DEFAULT 'UTC',
  subscription_status TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(user_email);

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 