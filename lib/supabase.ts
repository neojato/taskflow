import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * TaskFlow Supabase Configuration
 * 
 * This module attempts to resolve Supabase credentials through multiple layers:
 * 1. Vite's static replacement (import.meta.env)
 * 2. Node-style environment variables (process.env)
 * 3. Global window/context objects
 * 4. Explicit hardcoded fallbacks (provided by user)
 */

let supabaseUrl: string | undefined = undefined;
let supabaseAnonKey: string | undefined = undefined;

// 1. Primary: Static access via import.meta.env (Vite standard)
try {
  supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
} catch (e) {}

// 2. Secondary: Static access via process.env
if (!supabaseUrl || !supabaseAnonKey) {
  try {
    if (typeof process !== 'undefined' && process.env) {
      supabaseUrl = supabaseUrl || (process.env as any).VITE_SUPABASE_URL;
      supabaseAnonKey = supabaseAnonKey || (process.env as any).VITE_SUPABASE_ANON_KEY;
    }
  } catch (e) {}
}

// 3. Tertiary: Global scope access
if (!supabaseUrl || !supabaseAnonKey) {
  try {
    const globalObj = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {} as any);
    supabaseUrl = supabaseUrl || globalObj.VITE_SUPABASE_URL || globalObj.env?.VITE_SUPABASE_URL;
    supabaseAnonKey = supabaseAnonKey || globalObj.VITE_SUPABASE_ANON_KEY || globalObj.env?.VITE_SUPABASE_ANON_KEY;
  } catch (e) {}
}

// 4. Final Fallback: Explicit values provided for the environment
if (!supabaseUrl || !supabaseAnonKey) {
  supabaseUrl = supabaseUrl || "https://mgiwpcptfgjlaalnwqed.supabase.co";
  supabaseAnonKey = supabaseAnonKey || "sb_publishable_Nm0M0z4zICl_rjKJ_aqGXg_pQyJ-9P5";
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
    'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = supabaseInstance;
