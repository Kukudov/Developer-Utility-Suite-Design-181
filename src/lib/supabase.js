import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wszpceknercpuyztozjr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzenBjZWtuZXJjcHV5enRvempyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4Njc3OTUsImV4cCI6MjA2NjQ0Mzc5NX0.kqhlP6G8EIwe7Slty0trsCnK80pSw5OUY9WVBP9h6pY'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

export default supabase