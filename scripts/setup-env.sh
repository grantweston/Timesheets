#!/bin/bash

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create .env.local if it doesn't exist
touch "$DIR/../.env.local"

# Add Supabase environment variables if they don't exist
if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" "$DIR/../.env.local"; then
  echo "NEXT_PUBLIC_SUPABASE_URL=https://zdaugjexoekzsjxrelee.supabase.co" >> "$DIR/../.env.local"
fi

if ! grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$DIR/../.env.local"; then
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYXVnamV4b2VrenNqeHJlbGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgzODc5NzAsImV4cCI6MjAyMzk2Mzk3MH0.KkFJ2xWqS8L6_1Hg0vvL_BzDGwK3lthuhbZ9Y_Wd0Ks" >> "$DIR/../.env.local"
fi

# Install dependencies if needed
if [ ! -d "$DIR/../node_modules" ]; then
  echo "Installing dependencies..."
  cd "$DIR/.." && npm install
fi

# Run the seeding script
echo "Running seeding script..."
cd "$DIR/.." && npx ts-node scripts/seed-test-data.ts 