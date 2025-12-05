import { createClient } from "@supabase/supabase-js";

const VITE_SUPABASE_URL="https://yzvqhtunwkgibmpdrisi.supabase.co";
const VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6dnFodHVud2tnaWJtcGRyaXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDA3NzcsImV4cCI6MjA3MzUxNjc3N30.izc-b-acDPpvoxxR31q4t2kt0COy7LAAOJ6UrjuFaWE";


// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);
