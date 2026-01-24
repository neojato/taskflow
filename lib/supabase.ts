import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnvVar = (name: string): string => {
  try {
    // Check both standard Vite and process fallback
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[name]) return metaEnv[name];
    
    if (typeof process !== 'undefined' && process.env && (process.env as any)[name]) {
      return (process.env as any)[name];
    }
  } catch (e) {
    // Fail silently
  }
  return '';
};

// These defaults ensure the app works even if environment injection fails
const DEFAULT_URL = "https://mgiwpcptfgjlaalnwqed.supabase.co";
const DEFAULT_KEY = "sb_publishable_Nm0M0z4zICl_rjKJ_aqGXg_pQyJ-9P5";

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || DEFAULT_URL;
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || DEFAULT_KEY;

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.debug('TaskFlow [Supabase]: Client initialized with URL:', supabaseUrl);
  } catch (error) {
    console.error('TaskFlow [Supabase]: Initialization failed:', error);
  }
} else {
  console.error('TaskFlow [Supabase]: Credentials missing. App will not function correctly.');
}

export const supabase = supabaseInstance;