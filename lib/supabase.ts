import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * In Vite-based projects, environment variables starting with VITE_ are 
 * statically replaced at build time. Dynamic access (e.g., env[key]) 
 * often fails in production/sandboxed builds.
 */

// 1. Try static access for Vite (Required for build-time injection)
let supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
let supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// 2. Fallback to process.env (Common for CI/CD and polyfilled environments)
if (!supabaseUrl || !supabaseAnonKey) {
  try {
    if (typeof process !== 'undefined' && process.env) {
      supabaseUrl = supabaseUrl || (process.env as any).VITE_SUPABASE_URL;
      supabaseAnonKey = supabaseAnonKey || (process.env as any).VITE_SUPABASE_ANON_KEY;
    }
  } catch (e) {
    // process.env might not be defined in all browser environments
  }
}

// 3. Last resort: check global window object
if (!supabaseUrl || !supabaseAnonKey) {
  try {
    if (typeof window !== 'undefined') {
      supabaseUrl = supabaseUrl || (window as any).VITE_SUPABASE_URL || (window as any).env?.VITE_SUPABASE_URL;
      supabaseAnonKey = supabaseAnonKey || (window as any).VITE_SUPABASE_ANON_KEY || (window as any).env?.VITE_SUPABASE_ANON_KEY;
    }
  } catch (e) {
    // window might not be defined in SSR
  }
}

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.debug('TaskFlow [Supabase]: Client successfully initialized.');
  } catch (error) {
    console.error('TaskFlow [Supabase]: Initialization failed. Check if URL and Key are valid.', error);
  }
} else {
  console.error(
    'TaskFlow [Supabase]: Configuration missing! ' +
    'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correctly set in your environment.'
  );
}

export const supabase = supabaseInstance;
