import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function checkDb() {
  console.log("Checking DB connection with Supabase...");
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error("Database query failed:", error);
  } else {
    console.log("Database query succeeded, found rows:", data ? data.length : 0);
  }
}

checkDb();
