import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const URL = Constants.expoConfig?.extra?.supabaseUrl || "";
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || "";

if (!URL || !SUPABASE_ANON_KEY) {
	console.error(
		"⚠️ Supabase environment variables are missing! Check your app.json extra fields."
	);
}

export const supabase = createClient(URL, SUPABASE_ANON_KEY, {
	auth: {
		autoRefreshToken: true,
		persistSession: false,
		detectSessionInUrl: false,
	},
});
