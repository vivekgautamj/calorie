-- Add onboarding fields to users table

-- Add onboarding completion flag and health data fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female')),
ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age >= 10 AND age <= 100),
ADD COLUMN IF NOT EXISTS weight NUMERIC CHECK (weight >= 10 AND weight <= 300),
ADD COLUMN IF NOT EXISTS height NUMERIC CHECK (height >= 100 AND height <= 250);

-- Create index for onboarding status
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users(onboarding_completed);

-- Add comments for documentation
COMMENT ON COLUMN users.onboarding_completed IS 'Whether user has completed the onboarding process';
COMMENT ON COLUMN users.gender IS 'User gender for health calculations';
COMMENT ON COLUMN users.age IS 'User age in years for health calculations';
COMMENT ON COLUMN users.weight IS 'Current weight in kg';
COMMENT ON COLUMN users.height IS 'Height in cm'; 