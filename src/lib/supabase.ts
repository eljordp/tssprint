import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ovdmvyodzbhikuqtdzmo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZG12eW9kemJoaWt1cXRkem1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjM4MzEsImV4cCI6MjA4ODczOTgzMX0.8gA6vFfOhXBl65VvDqTAbPam5w3u74A4fu6vo-y8I8s'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
