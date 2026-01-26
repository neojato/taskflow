import { createClient } from '@supabase/supabase-js';

let supabaseUrl = "https://mgiwpcptfgjlaalnwqed.supabase.co";
let supabaseAnonKey = "sb_publishable_Nm0M0z4zICl_rjKJ_aqGXg_pQyJ-9P5";

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('TaskFlow [Supabase]: Initialization failed.', error);
  }
}

export const supabase = supabaseInstance;