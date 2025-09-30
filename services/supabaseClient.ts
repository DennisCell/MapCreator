import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- IMPORTANT ---
// 1. Create a project on supabase.com.
// 2. Go to Project Settings > API.
// 3. Find your Project URL and anon public key.
// 4. Replace the placeholder values below.
// For production, use environment variables to store these values securely.

const supabaseUrl = 'https://hbymaxwxzfvycofqqiwd.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhieW1heHd4emZ2eWNvZnFxaXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE5MzIsImV4cCI6MjA3NDc5NzkzMn0._KYam6Osri7F_nOa5s6lZxam-tZ0LsBEOnyuaybGPPQ'; // Replace with your Supabase anon key

// Initialize supabase as null. It will only be assigned a client instance
// if the credentials have been replaced with actual values.
let supabase: SupabaseClient | null = null;

if (supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY') {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
        // This will catch any unexpected errors during initialization.
        console.error("Error creating Supabase client:", e);
    }
} else {
    // Display a clear warning in the console for the developer.
    const warningStyle = [
        'background: #fef2f2; color: #991b1b; font-size: 16px;',
        'padding: 16px; border: 2px solid #ef4444; border-radius: 8px;',
        'font-family: monospace; font-weight: bold;'
    ].join(' ');
    console.log('%c⚠️ SUPABASE IS NOT CONFIGURED! ⚠️\n\nPlease update services/supabaseClient.ts with your project URL and anon key.', warningStyle);
}

// Export the supabase client. It will be null if not configured, which the app will handle.
export { supabase };
