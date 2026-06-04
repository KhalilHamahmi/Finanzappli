import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ujtvymkpborzsgrmwfza.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqdHZ5bWtwYm9yenNncm13ZnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MzU2NDIsImV4cCI6MjA5NTAxMTY0Mn0.lmT2P7X-BHwsb7PnDMUyJj7rBXqnwbO0gdUXsnSSrIk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)