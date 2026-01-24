import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Robust utility to retrieve environment variables.
 * In sandboxed and preview environments, variables can be located in:
 * 1. process.env (Standard for Node/CI)
 * 2. import.meta.env (Standard for Vite)
 * 3. window (Global scope/browser injection)
 */
const getEnvVar = (name: string): string => {
  // 1. Check process.env (Most likely source for polyfilled environments)
  try {
    if (typeof process !== 'undefined' && process.env && (process.env as any)[name]) {
      return (process.env as any)[name];
    }
  } catch (e) {}

  // 2. Check import.meta.env (Vite standard)
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[name]) {
      return metaEnv[name];
    }
  } catch (e) {}

  // 3. Check global scope (window or globalThis)
  try {
    const globalObj = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
    if ((globalObj as any)[name]) {
      return (globalObj as any)[name];
    }
    if ((globalObj as any).env && (globalObj as any).env[name]) {
      return (globalObj as any).env[name];
    }
  } catch (e) {}

  return '';
};

// Use confirmed exact standard names
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.debug('TaskFlow [Supabase]: Client successfully initialized.');
  } catch (error) {
    console.error('TaskFlow [Supabase]: Initialization failed. Check if URL and Key are valid.', error);
  }
} else {
  // This message will only appear if the variables are empty across all checked scopes.
  console.error(
    `TaskFlow [Supabase]: Configuration missing! 
    Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correctly set in your environment.
    (Scope Status: process.env=${typeof process !== 'undefined' ? 'available' : 'missing'}, window.env=${typeof window !== 'undefined' && (window as any).env ? 'available' : 'missing'})`
  );
}

export const supabase = supabaseInstance;
